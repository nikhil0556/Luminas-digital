/**
 * Payment Provider Abstraction Layer for Lumina Digital
 * 
 * Supports extensible multi-gateway architecture:
 * PaymentProvider (Base Interface)
 *  ├── RazorpayProvider (Primary gateway for Indian & International checkout)
 *  └── StripeProvider (Extensible secondary/future provider)
 */

export type SupportedPaymentProvider = 'razorpay' | 'stripe';

export interface CatalogItem {
  id: string;
  title: string;
  price: number; // in base currency (e.g. INR)
  downloadFilename?: string;
  format?: string;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderParams {
  orderNumber: string;
  items: OrderItemRequest[];
  customerEmail: string;
  customerName?: string;
  userId: string;
  couponCode?: string;
  currency?: string;
}

export interface PaymentOrderResult {
  success: boolean;
  provider: SupportedPaymentProvider;
  orderNumber: string;
  providerOrderId: string;
  amountInSubunits: number; // paise for INR, cents for USD
  amount: number; // base currency amount
  currency: string;
  keyId: string;
  isTestMode: boolean;
  notes?: Record<string, string>;
  error?: string;
}

export interface VerifyPaymentParams {
  provider: SupportedPaymentProvider;
  orderNumber: string;
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature?: string;
  userId: string;
  customerEmail: string;
}

export interface VerifiedPurchaseItem {
  userId: string;
  orderId: string;
  paymentId: string;
  productId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  purchasedAt: string;
  accessStatus: 'active' | 'revoked';
  productTitle: string;
  downloadFilename?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'completed' | 'failed' | 'pending';
  orderNumber: string;
  paymentId: string;
  purchases: VerifiedPurchaseItem[];
  message: string;
  error?: string;
}

export interface WebhookProcessResult {
  success: boolean;
  handled: boolean;
  eventType: string;
  orderNumber?: string;
  paymentId?: string;
  message?: string;
}

export interface PaymentProvider {
  readonly name: SupportedPaymentProvider;
  readonly isConfigured: boolean;
  readonly isTestMode: boolean;
  getPublicKey(): string;
  createOrder(params: CreateOrderParams, calculatedAmount: number, currency: string): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams, expectedAmount: number, currency: string): Promise<VerifyPaymentResult>;
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean;
  handleWebhookEvent(event: any): Promise<WebhookProcessResult>;
}
