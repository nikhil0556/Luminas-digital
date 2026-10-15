import crypto from 'node:crypto';
import {
  PaymentProvider,
  SupportedPaymentProvider,
  CreateOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  VerifiedPurchaseItem,
  WebhookProcessResult
} from './types';
import { RazorpayProvider } from './RazorpayProvider';
import { StripeProvider } from './StripeProvider';
import { calculateServerOrderMath, SERVER_PRODUCT_CATALOG } from '../catalog';
import { getAdminFirestore } from '../firebaseAdmin';

export interface StoredServerOrder {
  orderNumber: string;
  provider: SupportedPaymentProvider;
  providerOrderId: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
  items: {
    productId: string;
    quantity: number;
    title: string;
    price: number;
    downloadFilename?: string;
  }[];
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  verifiedPurchases?: VerifiedPurchaseItem[];
}

export class PaymentService {
  private static instance: PaymentService | null = null;
  private providers: Map<SupportedPaymentProvider, PaymentProvider> = new Map();
  private primaryProvider: SupportedPaymentProvider = 'razorpay';

  // In-memory quick cache for fast lookups alongside Firestore authority
  private orderCache: Map<string, StoredServerOrder> = new Map();
  private processedPaymentsCache: Set<string> = new Set();
  private processedEventsCache: Set<string> = new Set();

  private constructor() {
    // Register Payment Providers
    const razorpay = new RazorpayProvider();
    const stripe = new StripeProvider();

    this.providers.set('razorpay', razorpay);
    this.providers.set('stripe', stripe);

    // Startup log indicating Razorpay Live or Test mode
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const isLive = Boolean(keyId && keyId.startsWith('rzp_live_'));
    const isConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET?.trim());

    if (!isConfigured) {
      console.warn('[PaymentService] Razorpay is NOT configured (missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET). Orders will return 503.');
    } else {
      console.log(`[PaymentService] Razorpay initialized in [${isLive ? 'LIVE' : 'TEST'}] mode. Key ID prefix: ${keyId.substring(0, 8)}...`);
    }
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  public getProvider(name: SupportedPaymentProvider = this.primaryProvider): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider "${name}" is not registered.`);
    }
    return provider;
  }

  public getPublicConfig() {
    const defaultCurrency = process.env.RAZORPAY_CURRENCY?.trim() || 'INR';
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const isLive = Boolean(keyId && keyId.startsWith('rzp_live_'));
    const isTestMode = !isLive;
    const credentialsConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET?.trim());

    return {
      provider: 'razorpay',
      keyId,
      isTestMode,
      mode: isLive ? 'live' : 'test',
      currency: defaultCurrency,
      credentialsConfigured,
      supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP']
    };
  }

  /**
   * Helper to get Firestore instance safely
   */
  private getDb() {
    return getAdminFirestore();
  }

  /**
   * Create a Payment Order
   * 1. Validates and calculates order price securely from server catalog
   * 2. Zero-total orders (100% coupons): skips Razorpay and unlocks directly
   * 3. Non-zero orders: requires 100 paise minimum, calls Razorpay API, stores pending order in Firestore
   */
  public async createOrder(
    params: {
      items: { productId: string; quantity: number }[];
      customerEmail: string;
      customerName?: string;
      userId: string;
      couponCode?: string;
      currency?: string;
      provider?: SupportedPaymentProvider;
    }
  ): Promise<PaymentOrderResult> {
    const providerName = params.provider || this.primaryProvider;
    const provider = this.getProvider(providerName);

    if (!params.items || params.items.length === 0) {
      const err: any = new Error('Cart is empty. At least one digital product is required to checkout.');
      err.statusCode = 400;
      throw err;
    }

    if (!params.customerEmail || !params.customerEmail.includes('@')) {
      const err: any = new Error('A valid customer delivery email is required.');
      err.statusCode = 400;
      throw err;
    }

    if (!params.userId) {
      const err: any = new Error('Customer authentication is required before initiating payment.');
      err.statusCode = 401;
      throw err;
    }

    // Server-Authoritative Price Calculation (Rejects unknown product IDs with 400)
    const orderMath = calculateServerOrderMath(params.items, params.couponCode);

    const currency = 'INR';
    const payableAmount = orderMath.finalTotal;
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `LUM-${randomSuffix}`;
    const nowIso = new Date().toISOString();

    // 10. Zero-total orders (100% coupons): skip Razorpay and unlock directly ONLY if exactly 0
    if (payableAmount === 0) {
      const freeOrderId = `free_${orderNumber}`;
      const verifiedPurchases: VerifiedPurchaseItem[] = [];

      for (const vi of orderMath.validItems) {
        const item: VerifiedPurchaseItem = {
          userId: params.userId,
          orderId: orderNumber,
          paymentId: freeOrderId,
          productId: vi.product.id,
          amount: 0,
          currency,
          status: 'completed',
          purchasedAt: nowIso,
          accessStatus: 'active',
          productTitle: vi.product.title,
          downloadFilename: vi.product.downloadFilename
        };
        verifiedPurchases.push(item);

        if (vi.product.id === 'prod-prompts-duo-bundle-20') {
          verifiedPurchases.push(
            {
              ...item,
              productId: 'prod-editing-designing-50-slash',
              productTitle: '50 Trending One-Word “/” Prompts for Edits & Designs'
            },
            {
              ...item,
              productId: 'prod-chatgpt-100-slash',
              productTitle: '100 Trending ChatGPT "/" Prompts for Personal Help & Productivity'
            }
          );
        }
      }

      const serverOrder: StoredServerOrder = {
        orderNumber,
        provider: providerName,
        providerOrderId: freeOrderId,
        userId: params.userId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        items: orderMath.validItems.map(vi => ({
          productId: vi.product.id,
          quantity: vi.quantity,
          title: vi.product.title,
          price: vi.product.price,
          downloadFilename: vi.product.downloadFilename
        })),
        subtotal: orderMath.subtotal,
        discountAmount: orderMath.discountAmount,
        finalTotal: 0,
        currency,
        paymentStatus: 'completed',
        paymentId: freeOrderId,
        createdAt: nowIso,
        updatedAt: nowIso,
        verifiedPurchases
      };

      // Persist order and purchases to Firestore
      try {
        const db = this.getDb();
        const batch = db.batch();
        batch.set(db.collection('orders').doc(orderNumber), serverOrder);
        batch.set(db.collection('orders').doc(freeOrderId), serverOrder);

        for (const vp of verifiedPurchases) {
          const pRef = db.collection('purchases').doc(`${params.userId}_${vp.productId}`);
          batch.set(pRef, vp, { merge: true });
        }
        await batch.commit();
      } catch (fErr) {
        console.error('[PaymentService] Error persisting free order to Firestore:', fErr);
      }

      this.orderCache.set(orderNumber, serverOrder);
      this.orderCache.set(freeOrderId, serverOrder);

      return {
        success: true,
        provider: providerName,
        orderNumber,
        providerOrderId: freeOrderId,
        amountInSubunits: 0,
        amount: 0,
        currency,
        keyId: '',
        isTestMode: false,
        notes: {
          orderNumber,
          userId: params.userId,
          isZeroTotal: 'true'
        }
      };
    }

    // Non-zero orders: enforce 100 paise minimum
    const amountInPaise = Math.round(payableAmount * 100);
    if (amountInPaise < 100) {
      const err: any = new Error('Order amount must be at least ₹1 (100 paise).');
      err.statusCode = 400;
      throw err;
    }

    const createParams: CreateOrderParams = {
      orderNumber,
      items: params.items,
      customerEmail: params.customerEmail,
      customerName: params.customerName || 'Customer',
      userId: params.userId,
      couponCode: params.couponCode,
      currency
    };

    const orderResult = await provider.createOrder(createParams, payableAmount, currency);

    if (orderResult.success) {
      const serverOrder: StoredServerOrder = {
        orderNumber,
        provider: providerName,
        providerOrderId: orderResult.providerOrderId,
        userId: params.userId,
        customerEmail: params.customerEmail,
        customerName: params.customerName,
        items: orderMath.validItems.map(vi => ({
          productId: vi.product.id,
          quantity: vi.quantity,
          title: vi.product.title,
          price: vi.product.price,
          downloadFilename: vi.product.downloadFilename
        })),
        subtotal: orderMath.subtotal,
        discountAmount: orderMath.discountAmount,
        finalTotal: orderMath.finalTotal,
        currency,
        paymentStatus: 'pending',
        createdAt: nowIso,
        updatedAt: nowIso
      };

      // Persist pending order to Firestore
      try {
        const db = this.getDb();
        const batch = db.batch();
        batch.set(db.collection('orders').doc(orderNumber), serverOrder);
        if (orderResult.providerOrderId) {
          batch.set(db.collection('orders').doc(orderResult.providerOrderId), serverOrder);
        }
        await batch.commit();
      } catch (fErr) {
        console.error('[PaymentService] Error persisting pending order to Firestore:', fErr);
      }

      this.orderCache.set(orderNumber, serverOrder);
      if (orderResult.providerOrderId) {
        this.orderCache.set(orderResult.providerOrderId, serverOrder);
      }
    }

    return orderResult;
  }

  /**
   * Look up order from Firestore (or in-memory cache)
   */
  public async getOrderAsync(orderIdOrNumber: string): Promise<StoredServerOrder | null> {
    if (!orderIdOrNumber) return null;

    if (this.orderCache.has(orderIdOrNumber)) {
      return this.orderCache.get(orderIdOrNumber)!;
    }

    try {
      const db = this.getDb();
      const doc = await db.collection('orders').doc(orderIdOrNumber).get();
      if (doc.exists) {
        const data = doc.data() as StoredServerOrder;
        this.orderCache.set(orderIdOrNumber, data);
        if (data.orderNumber) this.orderCache.set(data.orderNumber, data);
        if (data.providerOrderId) this.orderCache.set(data.providerOrderId, data);
        return data;
      }
    } catch (err) {
      console.error(`[PaymentService] Error fetching order ${orderIdOrNumber} from Firestore:`, err);
    }

    return null;
  }

  public getOrder(orderIdOrNumber: string): StoredServerOrder | undefined {
    return this.orderCache.get(orderIdOrNumber);
  }

  /**
   * Verify Payment
   * 1. Retrieves stored order from Firestore. If not found, returns 404 (NEVER reconstructs fake order).
   * 2. Idempotency check: if paymentId was already completed, returns existing verified purchases.
   * 3. Verifies signature via HMAC-SHA256(order_id|payment_id, SECRET) using timingSafeEqual.
   * 4. Fetches payment from Razorpay API, requiring status === 'captured' (captures if 'authorized'),
   *    and matching order_id, amount, and currency.
   * 5. Unlocks products in Firestore `purchases` collection atomically.
   */
  public async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const provider = this.getProvider(params.provider || this.primaryProvider);
    const lookupKey = params.orderNumber || params.providerOrderId;

    // 5. Look up stored server order in Firestore or cache. Return 404 if not found.
    const serverOrder = await this.getOrderAsync(lookupKey) || await this.getOrderAsync(params.providerOrderId);

    if (!serverOrder) {
      const err: any = new Error(`Order "${lookupKey}" not found. Cannot verify unregistered payment.`);
      err.statusCode = 404;
      throw err;
    }

    // 7. Make verification idempotent: the same payment id can never create purchases twice
    if (
      serverOrder.paymentStatus === 'completed' &&
      serverOrder.paymentId === params.providerPaymentId &&
      serverOrder.verifiedPurchases &&
      serverOrder.verifiedPurchases.length > 0
    ) {
      console.log(`[PaymentService] Payment "${params.providerPaymentId}" already verified for order "${serverOrder.orderNumber}" (Idempotent return).`);
      return {
        success: true,
        status: 'completed',
        orderNumber: serverOrder.orderNumber,
        paymentId: params.providerPaymentId,
        purchases: serverOrder.verifiedPurchases,
        message: 'Payment verified and digital products unlocked successfully.'
      };
    }

    // Check processed_payments collection in Firestore for replay prevention
    if (params.providerPaymentId) {
      try {
        const db = this.getDb();
        const paymentDoc = await db.collection('processed_payments').doc(params.providerPaymentId).get();
        if (paymentDoc.exists) {
          const paymentData = paymentDoc.data();
          if (paymentData?.orderNumber !== serverOrder.orderNumber) {
            const err: any = new Error(`Payment ID "${params.providerPaymentId}" has already been processed for a different order.`);
            err.statusCode = 409;
            throw err;
          }
        }
      } catch (err: any) {
        if (err.statusCode === 409) throw err;
      }
    }

    // Zero-total orders bypass gateway check
    if (serverOrder.finalTotal === 0) {
      return {
        success: true,
        status: 'completed',
        orderNumber: serverOrder.orderNumber,
        paymentId: serverOrder.paymentId || 'free_order',
        purchases: serverOrder.verifiedPurchases || [],
        message: 'Free digital order unlocked successfully.'
      };
    }

    // 4. Verify payment with provider (HMAC signature check + Razorpay payments.fetch + status 'captured')
    const verification = await provider.verifyPayment(params, serverOrder.finalTotal, serverOrder.currency);

    if (!verification.success || verification.status !== 'completed') {
      serverOrder.paymentStatus = verification.status;
      serverOrder.updatedAt = new Date().toISOString();
      try {
        const db = this.getDb();
        await db.collection('orders').doc(serverOrder.orderNumber).set(serverOrder, { merge: true });
      } catch {}
      return verification;
    }

    // Mark as completed
    const nowIso = new Date().toISOString();
    serverOrder.paymentStatus = 'completed';
    serverOrder.paymentId = params.providerPaymentId;
    serverOrder.updatedAt = nowIso;

    // Create Verified Purchases
    const verifiedPurchases: VerifiedPurchaseItem[] = [];
    for (const item of serverOrder.items) {
      const catalogProduct = SERVER_PRODUCT_CATALOG[item.productId];
      const purchaseItem: VerifiedPurchaseItem = {
        userId: params.userId,
        orderId: serverOrder.orderNumber,
        paymentId: params.providerPaymentId,
        productId: item.productId,
        amount: item.price,
        currency: serverOrder.currency,
        status: 'completed',
        purchasedAt: nowIso,
        accessStatus: 'active',
        productTitle: catalogProduct?.title || item.title,
        downloadFilename: catalogProduct?.downloadFilename || item.downloadFilename
      };

      verifiedPurchases.push(purchaseItem);

      // Handle Duo Bundle unlocking both included prompt books
      if (item.productId === 'prod-prompts-duo-bundle-20') {
        verifiedPurchases.push(
          {
            ...purchaseItem,
            productId: 'prod-editing-designing-50-slash',
            productTitle: '50 Trending One-Word “/” Prompts for Edits & Designs'
          },
          {
            ...purchaseItem,
            productId: 'prod-chatgpt-100-slash',
            productTitle: '100 Trending ChatGPT "/" Prompts for Personal Help & Productivity'
          }
        );
      }
    }

    serverOrder.verifiedPurchases = verifiedPurchases;

    // 8. Store orders and purchases in Firestore via firebase-admin atomically
    try {
      const db = this.getDb();
      const batch = db.batch();

      // Record processed payment ID for strict idempotency
      batch.set(db.collection('processed_payments').doc(params.providerPaymentId), {
        orderNumber: serverOrder.orderNumber,
        userId: params.userId,
        amount: serverOrder.finalTotal,
        currency: serverOrder.currency,
        processedAt: nowIso
      });

      // Update orders collection
      batch.set(db.collection('orders').doc(serverOrder.orderNumber), serverOrder, { merge: true });
      if (serverOrder.providerOrderId) {
        batch.set(db.collection('orders').doc(serverOrder.providerOrderId), serverOrder, { merge: true });
      }

      // Record in purchases collection
      for (const p of verifiedPurchases) {
        const purchaseDocRef = db.collection('purchases').doc(`${params.userId}_${p.productId}`);
        batch.set(purchaseDocRef, p, { merge: true });
      }

      await batch.commit();
      console.log(`[PaymentService] Successfully recorded verified order ${serverOrder.orderNumber} in Firestore.`);
    } catch (fErr) {
      console.error('[PaymentService] Error persisting verified purchase to Firestore:', fErr);
    }

    this.orderCache.set(serverOrder.orderNumber, serverOrder);
    if (serverOrder.providerOrderId) {
      this.orderCache.set(serverOrder.providerOrderId, serverOrder);
    }
    this.processedPaymentsCache.add(params.providerPaymentId);

    return {
      success: true,
      status: 'completed',
      orderNumber: serverOrder.orderNumber,
      paymentId: params.providerPaymentId,
      purchases: verifiedPurchases,
      message: 'Payment verified and digital products unlocked successfully.'
    };
  }

  /**
   * Process Razorpay Webhook Event (Strictly requires RAZORPAY_WEBHOOK_SECRET, Idempotent)
   */
  public async handleWebhook(
    rawBody: string | Buffer,
    signature: string,
    eventData: any
  ): Promise<WebhookProcessResult> {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
    if (!webhookSecret) {
      console.error('[PaymentService] RAZORPAY_WEBHOOK_SECRET is not configured on server.');
      return {
        success: false,
        handled: false,
        eventType: eventData?.event || 'unknown',
        message: 'RAZORPAY_WEBHOOK_SECRET is not configured on server.'
      };
    }

    const provider = this.getProvider('razorpay');

    // 1. Verify Webhook Signature with raw body
    const isSignatureValid = provider.verifyWebhookSignature(rawBody, signature);
    if (!isSignatureValid) {
      console.warn('[PaymentService] Webhook rejected: Invalid signature.');
      return {
        success: false,
        handled: false,
        eventType: eventData?.event || 'unknown',
        message: 'Invalid webhook signature.'
      };
    }

    // 2. Idempotency Check
    const eventId = eventData?.id || `${eventData?.event}_${eventData?.payload?.payment?.entity?.id || Date.now()}`;
    if (this.processedEventsCache.has(eventId)) {
      console.log(`[PaymentService] Webhook event ${eventId} already processed (Idempotent ignore).`);
      return {
        success: true,
        handled: true,
        eventType: eventData?.event,
        message: 'Event already processed.'
      };
    }

    try {
      const db = this.getDb();
      const evDoc = await db.collection('webhook_events').doc(eventId).get();
      if (evDoc.exists) {
        this.processedEventsCache.add(eventId);
        return {
          success: true,
          handled: true,
          eventType: eventData?.event,
          message: 'Event already processed.'
        };
      }
    } catch {}

    // 3. Process the event
    const result = await provider.handleWebhookEvent(eventData);

    if (result.success && result.orderNumber) {
      const serverOrder = await this.getOrderAsync(result.orderNumber);
      if (serverOrder) {
        const nowIso = new Date().toISOString();
        if (result.eventType === 'payment.captured' || result.eventType === 'order.paid') {
          serverOrder.paymentStatus = 'completed';
          serverOrder.updatedAt = nowIso;
          if (result.paymentId) {
            serverOrder.paymentId = result.paymentId;
          }

          // Unlock purchases in Firestore
          try {
            const db = this.getDb();
            const batch = db.batch();
            batch.set(db.collection('orders').doc(serverOrder.orderNumber), serverOrder, { merge: true });

            for (const item of serverOrder.items) {
              const catalogProduct = SERVER_PRODUCT_CATALOG[item.productId];
              const pRef = db.collection('purchases').doc(`${serverOrder.userId}_${item.productId}`);
              batch.set(pRef, {
                userId: serverOrder.userId,
                orderId: serverOrder.orderNumber,
                paymentId: result.paymentId || serverOrder.paymentId || 'webhook_captured',
                productId: item.productId,
                amount: item.price,
                currency: serverOrder.currency,
                status: 'completed',
                purchasedAt: nowIso,
                accessStatus: 'active',
                productTitle: catalogProduct?.title || item.title,
                downloadFilename: catalogProduct?.downloadFilename || item.downloadFilename
              }, { merge: true });
            }
            await batch.commit();
          } catch (fErr) {
            console.error('[PaymentService] Error in webhook persistence:', fErr);
          }
        } else if (result.eventType === 'payment.failed') {
          serverOrder.paymentStatus = 'failed';
          serverOrder.updatedAt = nowIso;
          try {
            const db = this.getDb();
            await db.collection('orders').doc(serverOrder.orderNumber).set(serverOrder, { merge: true });
          } catch {}
        } else if (result.eventType === 'refund.processed' || result.eventType === 'refund.created') {
          serverOrder.paymentStatus = 'refunded';
          serverOrder.updatedAt = nowIso;
          try {
            const db = this.getDb();
            const batch = db.batch();
            batch.set(db.collection('orders').doc(serverOrder.orderNumber), serverOrder, { merge: true });
            for (const item of serverOrder.items) {
              const pRef = db.collection('purchases').doc(`${serverOrder.userId}_${item.productId}`);
              batch.update(pRef, { accessStatus: 'revoked', status: 'refunded' });
            }
            await batch.commit();
          } catch {}
        }
      }
    }

    // Mark event processed in Firestore
    try {
      const db = this.getDb();
      await db.collection('webhook_events').doc(eventId).set({
        eventId,
        eventType: eventData?.event,
        processedAt: new Date().toISOString()
      });
    } catch {}

    this.processedEventsCache.add(eventId);

    return result;
  }

  /**
   * Verify whether a user has active verified access to a product
   */
  public async hasProductAccess(userId: string, productId: string, email?: string): Promise<boolean> {
    if (!productId) return false;

    // Store Owner & Admin always has access to verify and preview products
    if (email && email.toLowerCase() === 'raj.nikhil0556@gmail.com') {
      return true;
    }

    if (!userId) return false;

    try {
      const db = this.getDb();
      // Check direct purchase
      const pDoc = await db.collection('purchases').doc(`${userId}_${productId}`).get();
      if (pDoc.exists && pDoc.data()?.accessStatus === 'active') {
        return true;
      }

      // Check Duo Bundle purchase
      const duoDoc = await db.collection('purchases').doc(`${userId}_prod-prompts-duo-bundle-20`).get();
      if (
        duoDoc.exists &&
        duoDoc.data()?.accessStatus === 'active' &&
        (productId === 'prod-chatgpt-100-slash' || productId === 'prod-editing-designing-50-slash')
      ) {
        return true;
      }
    } catch (err) {
      console.warn('[PaymentService] Error checking product access in Firestore:', err);
    }

    return false;
  }
}
