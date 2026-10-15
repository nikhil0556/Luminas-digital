/**
/**
 * Client-Side Razorpay Payment Gateway Integration for Lumina Digital
 * Strictly connects to server endpoints and verifies real payments.
 */

export interface RazorpayPublicConfig {
  provider: 'razorpay';
  keyId: string;
  isTestMode: boolean;
  mode?: 'live' | 'test';
  currency: string;
  credentialsConfigured?: boolean;
  supportedCurrencies: string[];
}

export interface BackendOrderResponse {
  success: boolean;
  provider: 'razorpay';
  orderNumber: string;
  providerOrderId: string;
  amountInSubunits: number;
  amount: number;
  currency: string;
  keyId: string;
  isTestMode: boolean;
  error?: string;
}

export interface BackendVerifyResponse {
  success: boolean;
  status: 'completed' | 'failed' | 'pending';
  orderNumber: string;
  paymentId: string;
  purchases: Array<{
    productId: string;
    productTitle: string;
    amount: number;
    currency: string;
    accessStatus: 'active' | 'revoked';
  }>;
  message: string;
  error?: string;
}

/**
 * Returns active CSS accent theme color from DOM or fallback
 */
export function getThemeAccentColor(): string {
  if (typeof window !== 'undefined') {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--theme-accent').trim();
    if (color && (color.startsWith('#') || color.startsWith('rgb'))) {
      return color;
    }
  }
  return '#2F6BFF';
}

/**
 * Dynamically loads the official Razorpay Checkout script with safety timeout
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(Boolean((window as any).Razorpay)));
      existingScript.addEventListener('error', () => resolve(false));
      setTimeout(() => resolve(Boolean((window as any).Razorpay)), 3000);
      return;
    }

    let isSettled = false;
    const finish = (result: boolean) => {
      if (!isSettled) {
        isSettled = true;
        resolve(result);
      }
    };

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => finish(Boolean((window as any).Razorpay));
    script.onerror = () => {
      console.error('[RazorpayClient] Failed to load official checkout.js script from Razorpay CDN.');
      finish(false);
    };

    // Timeout protection: 5000ms
    setTimeout(() => {
      finish(Boolean((window as any).Razorpay));
    }, 5000);

    document.body.appendChild(script);
  });
}

/**
 * Fetches public payment gateway configuration
 */
export async function getPaymentConfig(): Promise<RazorpayPublicConfig> {
  try {
    const res = await fetch('/api/payment/config');
    if (res.ok) {
      const config = await res.json();
      return {
        provider: 'razorpay',
        keyId: config.keyId || '',
        isTestMode: config.isTestMode ?? true,
        mode: config.mode || 'test',
        currency: config.currency || 'INR',
        credentialsConfigured: Boolean(config.credentialsConfigured),
        supportedCurrencies: config.supportedCurrencies || ['INR', 'USD', 'EUR', 'GBP']
      };
    }
  } catch (err) {
    console.error('[RazorpayClient] Error fetching payment config:', err);
  }

  return {
    provider: 'razorpay',
    keyId: '',
    isTestMode: true,
    mode: 'test',
    currency: 'INR',
    credentialsConfigured: false,
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP']
  };
}

/**
 * Creates payment order on backend via POST /api/create-order
 */
export async function createBackendPaymentOrder(params: {
  items: { productId: string; quantity: number }[];
  customerEmail: string;
  customerName?: string;
  userId: string;
  couponCode?: string;
  currency?: string;
  idToken?: string;
}): Promise<BackendOrderResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.idToken) {
    headers['Authorization'] = `Bearer ${params.idToken}`;
  }

  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to create payment order (${res.status})`);
  }

  return {
    ...data,
    providerOrderId: data.order_id || data.providerOrderId || data.id
  };
}

/**
 * Verifies payment on backend via POST /api/verify-payment
 */
export async function verifyBackendPayment(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  orderNumber: string;
  userId: string;
  customerEmail: string;
  idToken?: string;
}): Promise<BackendVerifyResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.idToken) {
    headers['Authorization'] = `Bearer ${params.idToken}`;
  }

  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...params,
      provider: 'razorpay'
    })
  });

  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.error || data.message || `Payment verification failed (${res.status})`);
    error.status = data.status || 'failed';
    error.httpStatus = res.status;
    throw error;
  }

  return data;
}
