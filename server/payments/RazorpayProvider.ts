import dotenv from 'dotenv';
dotenv.config();
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import {
  PaymentProvider,
  SupportedPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  WebhookProcessResult
} from './types';
import {
  getStandardCredentials,
  verifyStandardSignature,
  verifyPaymentStatusWithRazorpay
} from './razorpayStandard';

export class RazorpayProvider implements PaymentProvider {
  public readonly name: SupportedPaymentProvider = 'razorpay';
  private client: Razorpay | null = null;

  private get webhookSecret(): string {
    return process.env.RAZORPAY_WEBHOOK_SECRET?.trim() || '';
  }

  constructor() {
    this.refreshClient();
  }

  public getCredentials(): { keyId: string; keySecret: string } {
    return getStandardCredentials();
  }

  private refreshClient(): Razorpay | null {
    try {
      const { keyId, keySecret } = this.getCredentials();
      if (keyId && keySecret) {
        this.client = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });
        return this.client;
      }
    } catch {
      this.client = null;
    }
    return null;
  }

  private getClient(): Razorpay | null {
    if (!this.client) {
      return this.refreshClient();
    }
    return this.client;
  }

  public get isConfigured(): boolean {
    try {
      const { keyId, keySecret } = this.getCredentials();
      return Boolean(keyId && keySecret);
    } catch {
      return false;
    }
  }

  public get isTestMode(): boolean {
    try {
      const { keyId } = this.getCredentials();
      return keyId.startsWith('rzp_test_');
    } catch {
      return false;
    }
  }

  public getPublicKey(): string {
    try {
      const { keyId } = this.getCredentials();
      return keyId;
    } catch {
      return (process.env.RAZORPAY_KEY_ID || '').trim();
    }
  }

  /**
   * Create Order on Razorpay
   * Calls official Razorpay Orders API: POST https://api.razorpay.com/v1/orders
   * Strictly creates a real Razorpay order. Never fabricates mock orders.
   */
  public async createOrder(
    params: CreateOrderParams,
    calculatedAmount: number,
    currency: string = 'INR'
  ): Promise<PaymentOrderResult> {
    const targetCurrency = (currency || 'INR').toUpperCase();
    const finalAmount = calculatedAmount;

    // Zero-total orders (100% coupons): if finalAmount === 0, bypass Razorpay minimum check
    if (finalAmount === 0) {
      return {
        success: true,
        provider: 'razorpay',
        orderNumber: params.orderNumber,
        providerOrderId: `free_${params.orderNumber}`,
        amountInSubunits: 0,
        amount: 0,
        currency: targetCurrency,
        keyId: '',
        isTestMode: false,
        notes: {
          orderNumber: params.orderNumber,
          userId: params.userId,
          isZeroTotal: 'true'
        }
      };
    }

    // Amount in subunits (paise for INR: ₹1 = 100 paise)
    const amountInSubunits = Math.round(finalAmount * 100);

    // Minimum amount validation (100 paise = ₹1)
    if (amountInSubunits < 100) {
      const err: any = new Error('Order amount must be at least ₹1 (100 paise).');
      err.statusCode = 400;
      throw err;
    }

    const receipt = params.orderNumber.substring(0, 40);
    const { keyId, keySecret } = this.getCredentials();
    const client = new Razorpay({ key_id: keyId, key_secret: keySecret });

    try {
      const orderOptions = {
        amount: amountInSubunits,
        currency: targetCurrency,
        receipt,
        notes: {
          orderNumber: params.orderNumber,
          userId: params.userId,
          customerEmail: params.customerEmail,
          productCount: String(params.items.length)
        }
      };

      const razorpayOrder = await client.orders.create(orderOptions);

      if (!razorpayOrder || !razorpayOrder.id) {
        const error: any = new Error('Razorpay gateway returned an empty order response.');
        error.statusCode = 502;
        throw error;
      }

      return {
        success: true,
        provider: 'razorpay',
        orderNumber: params.orderNumber,
        providerOrderId: razorpayOrder.id,
        amountInSubunits,
        amount: finalAmount,
        currency: targetCurrency,
        keyId: keyId,
        isTestMode: this.isTestMode,
        notes: {
          orderNumber: params.orderNumber,
          userId: params.userId
        }
      };
    } catch (error: any) {
      if (error?.statusCode === 503 || error?.statusCode === 400) {
        throw error;
      }
      console.error('[RazorpayProvider] Gateway order creation failure:', error?.message || error);
      const err: any = new Error(error?.error?.description || error?.message || 'Payment gateway failed to initialize order.');
      err.statusCode = 502;
      throw err;
    }
  }

  /**
   * Verify Payment Cryptographically (Server-side HMAC-SHA256)
   * And verify status against Razorpay API.
   * Never accepts fake signatures, tokens, or mock IDs.
   */
  public async verifyPayment(
    params: VerifyPaymentParams,
    expectedAmount: number,
    currency: string = 'INR'
  ): Promise<VerifyPaymentResult> {
    const { providerOrderId, providerPaymentId, providerSignature, orderNumber } = params;

    if (!providerOrderId || !providerPaymentId) {
      return {
        success: false,
        status: 'failed',
        orderNumber,
        paymentId: providerPaymentId || '',
        purchases: [],
        message: 'Missing required payment verification parameters (order_id and payment_id are required).',
        error: 'INVALID_PAYMENT_DATA'
      };
    }

    if (!providerSignature) {
      return {
        success: false,
        status: 'failed',
        orderNumber,
        paymentId: providerPaymentId,
        purchases: [],
        message: 'Missing cryptographic signature.',
        error: 'MISSING_SIGNATURE'
      };
    }

    // 1. Cryptographic HMAC-SHA256 Signature Check
    const sigCheck = verifyStandardSignature({
      orderId: providerOrderId,
      paymentId: providerPaymentId,
      signature: providerSignature
    });

    if (!sigCheck.isValid) {
      console.warn(`[RazorpayProvider] Signature verification failed for order ${providerOrderId}`);
      return {
        success: false,
        status: 'failed',
        orderNumber,
        paymentId: providerPaymentId,
        purchases: [],
        message: 'Payment verification failed: signature mismatch.',
        error: 'SIGNATURE_VERIFICATION_FAILED'
      };
    }

    // 2. Fetch payment from Razorpay API to confirm capture, amount, currency, and order_id
    const expectedPaise = Math.round(expectedAmount * 100);
    const statusCheck = await verifyPaymentStatusWithRazorpay(
      providerPaymentId,
      providerOrderId,
      expectedPaise,
      currency
    );

    if (statusCheck.status === 'pending') {
      return {
        success: false,
        status: 'pending',
        orderNumber,
        paymentId: providerPaymentId,
        purchases: [],
        message: statusCheck.error || 'Payment received but awaiting gateway confirmation from Razorpay.',
        error: 'PAYMENT_PENDING'
      };
    }

    if (!statusCheck.isValid || statusCheck.status !== 'completed') {
      return {
        success: false,
        status: 'failed',
        orderNumber,
        paymentId: providerPaymentId,
        purchases: [],
        message: statusCheck.error || 'Payment was not captured by Razorpay.',
        error: 'PAYMENT_NOT_CAPTURED'
      };
    }

    return {
      success: true,
      status: 'completed',
      orderNumber,
      paymentId: providerPaymentId,
      purchases: [],
      message: 'Payment verified and confirmed with Razorpay.'
    };
  }

  /**
   * Verify Webhook Signature (HMAC-SHA256 with Webhook Secret)
   * Strictly requires non-empty webhook secret and timing-safe evaluation.
   */
  public verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn('[RazorpayProvider] RAZORPAY_WEBHOOK_SECRET is not configured on server.');
      return false;
    }

    if (!signature) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      return (
        expectedSignature.length === signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf8'),
          Buffer.from(signature, 'utf8')
        )
      );
    } catch (err) {
      console.error('[RazorpayProvider] Webhook signature verification error:', err);
      return false;
    }
  }

  /**
   * Handle Razorpay Webhook Event
   */
  public async handleWebhookEvent(event: any): Promise<WebhookProcessResult> {
    const eventType = event?.event || 'unknown';
    const payload = event?.payload;
    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;

    const orderNumber = orderEntity?.notes?.orderNumber || paymentEntity?.notes?.orderNumber;
    const paymentId = paymentEntity?.id;

    console.log(`[RazorpayProvider] Webhook processing event: "${eventType}" for order: "${orderNumber || 'N/A'}"`);

    switch (eventType) {
      case 'payment.captured':
      case 'order.paid':
        return {
          success: true,
          handled: true,
          eventType,
          orderNumber,
          paymentId,
          message: 'Payment captured and verified via webhook.'
        };

      case 'payment.failed':
        return {
          success: true,
          handled: true,
          eventType,
          orderNumber,
          paymentId,
          message: 'Payment failed reported via webhook.'
        };

      case 'refund.processed':
      case 'refund.created':
        return {
          success: true,
          handled: true,
          eventType,
          orderNumber,
          paymentId,
          message: 'Refund recorded via webhook. Access will be updated.'
        };

      default:
        return {
          success: true,
          handled: false,
          eventType,
          orderNumber,
          paymentId,
          message: `Unhandled event type: ${eventType}`
        };
    }
  }
}
