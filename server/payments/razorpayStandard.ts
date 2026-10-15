import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';
import crypto from 'node:crypto';

export interface CreateStandardOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyStandardSignatureOptions {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentStatusVerificationResult {
  isValid: boolean;
  status: 'completed' | 'pending' | 'failed';
  paymentRecord?: any;
  error?: string;
}

/**
 * Checks whether the environment is running in production (Cloud Run, AI Studio production host, etc.)
 */
export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.APP_ENV === 'production' ||
    Boolean(process.env.K_SERVICE) ||
    Boolean(process.env.K_REVISION) ||
    Boolean(process.env.APP_URL && !process.env.APP_URL.includes('localhost'))
  );
}

/**
 * Returns canonical Razorpay credentials from secure environment variables.
 * Throws a 503 error if RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured.
 */
export function getStandardCredentials(): { keyId: string; keySecret: string; isLive: boolean } {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    const error: any = new Error('Razorpay gateway is not configured. RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.');
    error.statusCode = 503;
    throw error;
  }

  return { keyId, keySecret, isLive: keyId.startsWith('rzp_live_') };
}

/**
 * Returns a configured Razorpay instance or throws 503 if credentials are not configured.
 */
export function getRazorpayInstance(): Razorpay {
  const { keyId, keySecret } = getStandardCredentials();
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
}

/**
 * Calls Razorpay API: POST https://api.razorpay.com/v1/orders
 * Strictly creates a real Razorpay order. Never fabricates mock orders.
 * Returns 400 for amount < 100 paise, 503 for missing credentials, 502 for gateway errors.
 */
export async function createStandardOrder(options: CreateStandardOrderOptions): Promise<{
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  receipt: string;
}> {
  const { amount, currency = 'INR', receipt, notes } = options;

  // Validation: Minimum amount 100 paise
  if (!amount || typeof amount !== 'number' || isNaN(amount) || amount < 100) {
    const error: any = new Error('Amount must be at least 100 paise (₹1.00)');
    error.statusCode = 400;
    throw error;
  }

  const { keyId, keySecret } = getStandardCredentials();
  const finalReceipt = (receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`).substring(0, 40);

  try {
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await rzp.orders.create({
      amount: Math.round(amount),
      currency: currency.toUpperCase(),
      receipt: finalReceipt,
      notes: notes || {}
    });

    if (!order || !order.id) {
      const error: any = new Error('Razorpay gateway returned an empty order response.');
      error.statusCode = 502;
      throw error;
    }

    return {
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      key_id: keyId,
      receipt: finalReceipt
    };
  } catch (err: any) {
    if (err.statusCode === 503 || err.statusCode === 400) {
      throw err;
    }
    console.error('[Razorpay Standard] Order creation gateway failure:', err?.message || err);
    const error: any = new Error(err?.error?.description || err?.message || 'Payment gateway failed to initialize order.');
    error.statusCode = 502;
    throw error;
  }
}

/**
 * Cryptographically verifies Razorpay payment signature
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
 * Strictly verifies using timingSafeEqual. Rejects fake signatures and simulated tokens.
 */
export function verifyStandardSignature(options: VerifyStandardSignatureOptions): {
  isValid: boolean;
  generatedSignature: string;
  expectedSignature: string;
} {
  const { orderId, paymentId, signature } = options;

  if (!orderId || !paymentId || !signature) {
    const error: any = new Error('Missing required fields: order_id, payment_id, and signature are required');
    error.statusCode = 400;
    throw error;
  }

  // Strictly reject fake signatures and simulated sandbox IDs
  if (
    orderId.startsWith('order_sbx_') ||
    paymentId.startsWith('pay_sbx_') ||
    signature.startsWith('sbx_') ||
    signature.startsWith('sim_') ||
    signature.startsWith('test_') ||
    signature === 'verified_test_signature'
  ) {
    return {
      isValid: false,
      generatedSignature: '',
      expectedSignature: signature
    };
  }

  const { keySecret } = getStandardCredentials();
  const payload = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac('sha256', keySecret)
    .update(payload)
    .digest('hex');

  let isValid = false;
  try {
    if (
      generated.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(generated, 'utf8'), Buffer.from(signature, 'utf8'))
    ) {
      isValid = true;
    }
  } catch {
    isValid = false;
  }

  return {
    isValid,
    generatedSignature: generated,
    expectedSignature: signature
  };
}

/**
 * Fetches and verifies the real payment status from Razorpay API.
 * Requires: status === 'captured' (captures if 'authorized'),
 * order_id matches stored order, amount and currency match server-calculated total.
 */
export async function verifyPaymentStatusWithRazorpay(
  paymentId: string,
  expectedOrderId: string,
  expectedAmountPaise?: number,
  currency: string = 'INR'
): Promise<PaymentStatusVerificationResult> {
  let rzp: Razorpay;
  try {
    rzp = getRazorpayInstance();
  } catch (err: any) {
    return {
      isValid: false,
      status: 'failed',
      error: 'Razorpay credentials not configured on the server.'
    };
  }

  let paymentRecord: any = null;
  try {
    paymentRecord = await rzp.payments.fetch(paymentId);
  } catch (fetchErr: any) {
    console.error('[Razorpay Standard] Payment fetch failed:', fetchErr?.message);
    return {
      isValid: false,
      status: 'pending',
      error: 'Payment received but awaiting gateway confirmation from Razorpay. Please wait a moment.'
    };
  }

  if (!paymentRecord) {
    return {
      isValid: false,
      status: 'pending',
      error: 'Payment received but awaiting gateway confirmation from Razorpay.'
    };
  }

  // order_id matches our stored order
  if (paymentRecord.order_id && paymentRecord.order_id !== expectedOrderId) {
    return {
      isValid: false,
      status: 'failed',
      paymentRecord,
      error: `Payment order ID (${paymentRecord.order_id}) does not match expected order (${expectedOrderId}).`
    };
  }

  // currency matches
  if (currency && paymentRecord.currency && paymentRecord.currency.toUpperCase() !== currency.toUpperCase()) {
    return {
      isValid: false,
      status: 'failed',
      paymentRecord,
      error: `Payment currency mismatch: expected ${currency}, got ${paymentRecord.currency}.`
    };
  }

  // amount matches server-calculated total
  if (expectedAmountPaise !== undefined && Math.abs(Number(paymentRecord.amount) - expectedAmountPaise) > 1) {
    return {
      isValid: false,
      status: 'failed',
      paymentRecord,
      error: `Payment amount mismatch: expected ${expectedAmountPaise} paise, got ${paymentRecord.amount} paise.`
    };
  }

  let paymentStatus: 'completed' | 'failed' | 'pending' = 'pending';
  if (paymentRecord.status === 'captured') {
    paymentStatus = 'completed';
  } else if (paymentRecord.status === 'authorized') {
    try {
      const captured = await rzp.payments.capture(paymentId, paymentRecord.amount, paymentRecord.currency);
      if (captured && captured.status === 'captured') {
        paymentStatus = 'completed';
        paymentRecord = captured;
      } else {
        paymentStatus = 'pending';
      }
    } catch (captureErr: any) {
      console.warn('[Razorpay Standard] Capture error on authorized payment:', captureErr?.message);
      paymentStatus = 'pending';
    }
  } else if (paymentRecord.status === 'failed') {
    paymentStatus = 'failed';
  }

  return {
    isValid: paymentStatus === 'completed',
    status: paymentStatus,
    paymentRecord
  };
}

