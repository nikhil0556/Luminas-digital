import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  Tag,
  ArrowRight,
  Zap,
  AlertCircle,
  RefreshCw,
  Smartphone,
  Globe,
  LogIn,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  loadRazorpayScript,
  getPaymentConfig,
  createBackendPaymentOrder,
  verifyBackendPayment,
  getThemeAccentColor,
  RazorpayPublicConfig,
  BackendOrderResponse
} from '../lib/payment/razorpayClient';

type PaymentState = 'idle' | 'creating_order' | 'awaiting_payment' | 'verifying' | 'success' | 'failed';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal,
    formatPrice,
    fulfillVerifiedOrder,
    setActivePage,
    showToast,
    currency
  } = useStore();

  const { user, userProfile, openAuthModal } = useAuth();

  // Form State
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'card' | 'upi' | 'apple_pay'>('razorpay');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Payment Lifecycle State
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [paymentConfig, setPaymentConfig] = useState<RazorpayPublicConfig | null>(null);

  // Active Pending Order Data
  const [activeBackendOrder, setActiveBackendOrder] = useState<BackendOrderResponse | null>(null);

  // Initialize customer contact info from logged in user
  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if ((user?.displayName || userProfile?.name) && !customerName) {
      setCustomerName(user.displayName || userProfile?.name || '');
    }
  }, [user, userProfile]);

  // Load Razorpay config & SDK
  useEffect(() => {
    getPaymentConfig().then(cfg => {
      setPaymentConfig(cfg);
    });
    loadRazorpayScript().catch(e => console.warn('Razorpay script loading warning:', e));
  }, []);

  if (cart.length === 0 && paymentState !== 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4 text-neutral-300">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 shadow-xl">
          <Zap className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white">Your Cart is Empty</h2>
        <p className="text-sm text-neutral-400">
          Select digital products to proceed with our secure Razorpay instant delivery checkout.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('shop')}
          className="px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
        >
          Browse All Products
        </button>
      </div>
    );
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = applyCoupon(couponCodeInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponCodeInput('');
      showToast(`Coupon applied! ${res.message}`, 'success');
    }
  };

  /**
   * Primary Checkout Execution Flow
   * 1. Validate customer & authentication
   * 2. Call backend to calculate price & create Razorpay order
   * 3. Launch Razorpay Checkout Modal
   * 4. Call backend to cryptographically verify signature
   * 5. Fulfill verified order and unlock downloads only on server verification
   */
  const handleInitiatePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 0. Cart validation
    if (!cart || cart.length === 0) {
      showToast('Your cart is empty. Please add a product to checkout.', 'error');
      return;
    }

    // 1. Email Validation
    if (!customerEmail || !customerEmail.includes('@')) {
      showToast('Please provide a valid delivery email address.', 'error');
      return;
    }

    const effectiveUserId = user?.uid || `guest_${customerEmail.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}`;

    try {
      setPaymentState('creating_order');
      setStatusMessage('Creating secure payment order with Razorpay...');

      // 2. Create Order on Backend (Server-Authoritative Price Calculation)
      const targetCurrency = currency === 'INR' ? 'INR' : (paymentConfig?.currency || 'INR');
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        customerEmail: customerEmail.trim(),
        customerName: (customerName || user?.displayName || 'Customer').trim(),
        userId: effectiveUserId,
        couponCode: appliedCoupon?.code,
        currency: targetCurrency
      };

      const backendOrder = await createBackendPaymentOrder(orderPayload);
      setActiveBackendOrder(backendOrder);

      // Zero-total orders (100% coupons): unlock directly ONLY if server-calculated total is exactly 0
      if (backendOrder.amount === 0 || backendOrder.amountInSubunits === 0) {
        setStatusMessage('Zero-total order confirmed! Unlocking digital downloads...');
        await fulfillVerifiedOrder({
          orderNumber: backendOrder.orderNumber,
          customerEmail: customerEmail.trim(),
          customerName: customerName || user?.displayName || 'Customer',
          paymentId: backendOrder.providerOrderId,
          paymentMethod: 'razorpay',
          purchases: cart.map(item => ({
            productId: item.product.id,
            productTitle: item.product.title,
            amount: 0,
            currency: targetCurrency
          }))
        });

        setPaymentState('success');
        setStatusMessage('Payment successful! Your free digital product is now available in My Downloads.');
        showToast('Order unlocked successfully!', 'success');
        return;
      }

      // 3. Ensure official Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection and click Retry.');
      }

      if (!backendOrder.keyId || !backendOrder.providerOrderId) {
        throw new Error('Server did not return valid payment credentials.');
      }

      setPaymentState('awaiting_payment');
      setStatusMessage('Opening Razorpay Checkout...');

      const activeThemeColor = getThemeAccentColor();

      const options = {
        key: backendOrder.keyId,
        amount: backendOrder.amountInSubunits,
        currency: backendOrder.currency,
        name: 'Lumina Digital',
        description: `Order ${backendOrder.orderNumber} • Digital Download Deliverable`,
        order_id: backendOrder.providerOrderId,
        prefill: {
          name: customerName || user?.displayName || 'Valued Customer',
          email: customerEmail || user?.email || ''
        },
        theme: {
          color: activeThemeColor
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay] Modal dismissed by user');
            setPaymentState('idle');
            setStatusMessage('');
            showToast('Payment cancelled. Your cart remains ready.', 'info');
          }
        },
        handler: async (response: any) => {
          await handleProcessVerification({
            razorpay_order_id: response.razorpay_order_id || backendOrder.providerOrderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderNumber: backendOrder.orderNumber
          });
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        console.warn('[Razorpay] Gateway payment.failed event:', resp?.error);
        const errMsg = resp?.error?.description || 'Payment was declined or failed by gateway.';
        setPaymentState('failed');
        setStatusMessage(errMsg);
        showToast(errMsg, 'error');
      });
      rzp.open();
    } catch (err: any) {
      console.error('[Checkout] Order initiation error:', err);
      const errMsg = err?.message || 'Payment processing failed. Please click Retry.';
      setPaymentState('failed');
      setStatusMessage(errMsg);
      showToast(errMsg, 'error');
    }
  };

  /**
   * Cryptographic Payment Verification on Backend
   */
  const handleProcessVerification = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    orderNumber: string;
  }) => {
    const effectiveUserId = user?.uid || `guest_${customerEmail.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}`;

    setPaymentState('verifying');
    setStatusMessage('Your payment is being verified with Razorpay. Deliverables will unlock on confirmation...');

    try {
      const verifyResult = await verifyBackendPayment({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature || '',
        orderNumber: paymentData.orderNumber,
        userId: effectiveUserId,
        customerEmail: customerEmail.trim()
      });

      if (verifyResult.success && verifyResult.status === 'completed') {
        setStatusMessage('Payment verified! Confirming purchase in database...');

        // Unlock purchased digital products, confirm in Firestore database, and trigger global success toast
        await fulfillVerifiedOrder({
          orderNumber: paymentData.orderNumber,
          customerEmail: customerEmail.trim(),
          customerName: customerName || user?.displayName || 'Customer',
          paymentId: paymentData.razorpay_payment_id,
          paymentMethod: 'razorpay',
          purchases: verifyResult.purchases.map(p => ({
            productId: p.productId,
            productTitle: p.productTitle,
            amount: p.amount,
            currency: p.currency
          }))
        });

        setPaymentState('success');
        setStatusMessage('Payment successful! Your digital product is now available in My Downloads.');
      } else if (verifyResult.status === 'pending') {
        setPaymentState('verifying');
        setStatusMessage('Your payment is being processed by the gateway. Please wait a moment...');
      } else {
        const errMsg = verifyResult.message || 'Payment verification could not be confirmed.';
        setPaymentState('failed');
        setStatusMessage(errMsg);
        showToast(errMsg, 'error');
      }
    } catch (err: any) {
      console.error('[Checkout] Verification failed:', err);
      const errMsg = err?.message || 'Payment verification failed. Please try again.';
      setPaymentState('failed');
      setStatusMessage(errMsg);
      showToast(errMsg, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Secure Checkout • Razorpay Gateway
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-0.5">
            Instant Digital Delivery Checkout
          </h1>
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit SSL Encrypted
          </span>
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-1 text-indigo-400">
            <Zap className="w-3.5 h-3.5" />
            Instant Unlocking
          </span>
        </div>
      </div>

      {/* Mandatory Account Authentication Banner if Guest */}
      {!user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Sign In Before Completing Purchase</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Required
                </span>
              </h4>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                Connect your account so your purchased PDF e-books and AI prompt datasets are permanently tied to your Firebase UID for lifetime access and redownloads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (1-Click)</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Status Notifications for Verification / Pending / Failed */}
      {paymentState === 'verifying' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}

      {paymentState === 'failed' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <p className="font-semibold">{statusMessage || 'Payment could not be completed. Please try again.'}</p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentState('idle')}
            className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 text-[11px] font-bold border border-rose-500/40 cursor-pointer"
          >
            Retry Checkout
          </button>
        </div>
      )}

      {paymentState === 'success' && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Payment successful!</h3>
          <p className="text-xs text-neutral-300 max-w-md mx-auto">
            Your digital product is now available in <strong>My Downloads</strong> and has been permanently attached to your account.
          </p>
          <button
            type="button"
            onClick={() => setActivePage('access')}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            Go to Downloads
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customer & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Customer Contact Info */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono font-bold">
                  1
                </span>
                <span>Delivery Email & Licensing Name</span>
              </h3>
              <span className="text-[11px] text-neutral-400">Direct instant delivery</span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Your digital deliverable and cryptographically signed order receipt will be sent directly to this address immediately upon server verification.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Customer Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="alex.creator@example.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Full Name (Optional for invoice & license certification)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {user && (
                <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Authenticated as <strong className="text-white">{user.email}</strong> (UID: {user.uid.substring(0, 10)}...)</span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Payment Provider Selection */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-mono font-bold">
                  2
                </span>
                <span>Payment Gateway</span>
              </h3>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'razorpay', label: 'Razorpay / UPI', icon: ShieldCheck, badge: 'Recommended' },
                { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                { id: 'upi', label: 'NetBanking / UPI', icon: Smartphone },
                { id: 'apple_pay', label: 'Global / Wallets', icon: Globe }
              ].map(m => {
                const isSelected = paymentMethod === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {m.badge && (
                      <span className="absolute -top-2 right-2 text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full">
                        {m.badge}
                      </span>
                    )}
                    <Icon className="w-4 h-4 text-indigo-400" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Gateway Information Banner */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <span>Razorpay Secure Checkout</span>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">256-bit TLS</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Supports all major Credit Cards, Debit Cards, UPI (Google Pay, PhonePe, Paytm), NetBanking, and International Cards with instant server-side HMAC-SHA256 signature verification.
              </p>
            </div>
          </div>

          {/* Submit / Pay Now Button */}
          <button
            type="button"
            onClick={() => handleInitiatePayment()}
            disabled={!cart || cart.length === 0 || paymentState === 'creating_order' || paymentState === 'awaiting_payment' || paymentState === 'verifying'}
            className="w-full py-4 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/25 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {paymentState === 'creating_order' ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creating Razorpay Order...</span>
              </span>
            ) : paymentState === 'awaiting_payment' ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Connecting to Gateway...</span>
              </span>
            ) : paymentState === 'verifying' ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying Payment on Backend...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Pay Now with Razorpay ({formatPrice(finalTotal)})</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

          <p className="text-[11px] text-center text-neutral-400">
            By completing your purchase, you agree to our Terms of Service & 14-Day Refund Policy. Digital products unlock immediately upon server payment verification.
          </p>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white font-display">Order Summary</h3>
              <span className="text-xs font-mono text-neutral-400">
                {cart.length} {cart.length === 1 ? 'Product' : 'Products'}
              </span>
            </div>

            {/* Product details: Name, Thumbnail, Quantity, Price */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map(item => (
                <div
                  key={item.product.id}
                  className="flex items-start justify-between gap-3 text-xs pb-3 border-b border-neutral-800/60"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden shrink-0">
                      {item.product.coverImage ? (
                        <img
                          src={item.product.coverImage}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-500 font-mono text-xs">
                          DOC
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">
                        {item.product.format}
                      </span>
                      <h4 className="font-semibold text-white line-clamp-1">{item.product.title}</h4>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        Qty: {item.quantity} • {item.product.pagesOrCount}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-white font-mono shrink-0">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <div>
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-mono font-bold text-emerald-300">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-neutral-400">({appliedCoupon.description})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => {
                      setCouponCodeInput(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    placeholder="Coupon (e.g. LUMINA20)"
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white uppercase font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>}
            </div>

            {/* Financial Math */}
            <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>Catalog Subtotal</span>
                <span className="text-white font-mono">{formatPrice(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Digital Delivery Fee</span>
                <span className="text-emerald-400 font-medium font-mono">$0.00 (Instant)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800 font-display">
                <span>Final Payable Amount</span>
                <span className="text-indigo-400 font-mono">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Secure Payment Assurance */}
          <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-start gap-3 text-xs text-neutral-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Server-Verified Security</strong>
              <p className="mt-0.5 leading-relaxed">
                All transactions are verified server-side with Razorpay cryptographic signatures. No client-side unlocking. 14-day refund policy applies.
              </p>
              {paymentState === 'failed' && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{statusMessage || 'Payment could not be completed. Please check your connection and try again.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInitiatePayment()}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
                  >
                    Retry Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
