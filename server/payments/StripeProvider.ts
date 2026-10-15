import {
  PaymentProvider,
  SupportedPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  WebhookProcessResult
} from './types';

/**
 * StripeProvider (Extensible Future Payment Provider)
 *
 * Designed to cleanly plug into the PaymentProvider abstraction layer
 * when international expansion is enabled, without rewriting checkout,
 * orders, or purchase-access logic.
 */
export class StripeProvider implements PaymentProvider {
  public readonly name: SupportedPaymentProvider = 'stripe';
  public readonly isConfigured: boolean = false;
  public readonly isTestMode: boolean = true;

  constructor() {
    const key = process.env.STRIPE_PUBLISHABLE_KEY;
    this.isConfigured = Boolean(key && !key.includes('YOUR_'));
  }

  public getPublicKey(): string {
    return process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
  }

  public async createOrder(
    params: CreateOrderParams,
    calculatedAmount: number,
    currency: string = 'USD'
  ): Promise<PaymentOrderResult> {
    // Clean stub ready for Stripe PaymentIntent or Checkout Session integration
    return {
      success: false,
      provider: 'stripe',
      orderNumber: params.orderNumber,
      providerOrderId: '',
      amountInSubunits: Math.round(calculatedAmount * 100),
      amount: calculatedAmount,
      currency,
      keyId: this.getPublicKey(),
      isTestMode: true,
      error: 'Stripe provider is registered for future expansion. Razorpay is the primary active payment gateway.'
    };
  }

  public async verifyPayment(
    params: VerifyPaymentParams,
    expectedAmount: number,
    currency: string = 'USD'
  ): Promise<VerifyPaymentResult> {
    return {
      success: false,
      status: 'failed',
      orderNumber: params.orderNumber,
      paymentId: params.providerPaymentId,
      purchases: [],
      message: 'Stripe provider verification not active.'
    };
  }

  public verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    return false;
  }

  public async handleWebhookEvent(event: any): Promise<WebhookProcessResult> {
    return {
      success: true,
      handled: false,
      eventType: event?.type || 'stripe.unknown'
    };
  }
}
