import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
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
import { Product } from '../types';

export interface CheckoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (order: any) => void;
  onFailure?: (error: any) => void;
  product?: Product;
}

type PaymentState = 'idle' | 'creating_order' | 'awaiting_payment' | 'verifying' | 'success' | 'failed';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSuccess,
  onFailure,
  product: propProduct
}) => {
  const {
    isCheckoutModalOpen,
    closeCheckoutModal,
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
    currency,
    addToCart
  } = useStore();

  const { user, userProfile } = useAuth();

  // Controlled vs store-driven visibility
  const isVisible = propIsOpen !== undefined ? propIsOpen : isCheckoutModalOpen;

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      closeCheckoutModal();
    }
  };

  // If a single product is passed as prop and cart is empty, add it
  useEffect(() => {
    if (isVisible && propProduct && cart.length === 0) {
      addToCart(propProduct, 1);
    }
  }, [isVisible, propProduct, cart.length, addToCart]);

  // Form State
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'card' | 'upi' | 'apple_pay'>('razorpay');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  // Payment Lifecycle State
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentConfig, setPaymentConfig] = useState<RazorpayPublicConfig | null>(null);

  // Active Pending Order Data
  const [activeBackendOrder, setActiveBackendOrder] = useState<BackendOrderResponse | null>(null);

  // Initialize customer contact info
  useEffect(() => {
    if (user?.email && !customerEmail) {
      setCustomerEmail(user.email);
    }
    if ((user?.displayName || userProfile?.name) && !customerName) {
      setCustomerName(user.displayName || userProfile?.name || '');
    }
  }, [user, userProfile, customerEmail, customerName]);

  // Load Razorpay config & SDK
  useEffect(() => {
    if (isVisible) {
      getPaymentConfig().then(cfg => {
        setPaymentConfig(cfg);
      });
      loadRazorpayScript().catch(e => console.warn('[CheckoutModal] Razorpay script loading warning:', e));
    }
  }, [isVisible]);

  // Reset states on modal close
  useEffect(() => {
    if (!isVisible) {
      setPaymentState('idle');
      setStatusMessage('');
      setErrorMessage('');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const effectiveCartItems = cart.length > 0
    ? cart
    : propProduct
    ? [{ product: propProduct, quantity: 1 }]
    : [];

  const effectiveSubtotal = cart.length > 0 ? cartSubtotal : (propProduct?.price || 0);
  const effectiveTotal = cart.length > 0 ? finalTotal : Math.max(0, effectiveSubtotal - discountAmount);

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
   * 1. Validate customer details
   * 2. Call backend to calculate price & create Razorpay order
   * 3. Launch Razorpay Checkout Modal
   * 4. Call backend to cryptographically verify signature
   * 5. Fulfill verified order and unlock downloads on server verification
   */
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Email Validation
    const emailToUse = customerEmail.trim() || user?.email || '';
    if (!emailToUse || !emailToUse.includes('@')) {
      const err = 'Please provide a valid delivery email address.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    if (effectiveCartItems.length === 0) {
      const err = 'Cart is empty. Please select a product to checkout.';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    const effectiveUserId = user?.uid || `guest_${emailToUse.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}`;
    const effectiveName = (customerName || user?.displayName || 'Customer').trim();

    try {
      setPaymentState('creating_order');
      setErrorMessage('');
      setStatusMessage('Creating secure payment order with Razorpay...');

      // 2. Create Order on Backend (Server-Authoritative Price Calculation)
      const targetCurrency = currency === 'INR' ? 'INR' : (paymentConfig?.currency || 'INR');
      const orderPayload = {
        items: effectiveCartItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        customerEmail: emailToUse,
        customerName: effectiveName,
        userId: effectiveUserId,
        couponCode: appliedCoupon?.code,
        currency: targetCurrency
      };

      const backendOrder = await createBackendPaymentOrder(orderPayload);
      setActiveBackendOrder(backendOrder);

      // Zero-total orders (100% coupons): unlock directly ONLY if server-calculated total is exactly 0
      if (backendOrder.amount === 0 || backendOrder.amountInSubunits === 0) {
        setStatusMessage('Zero-total order confirmed! Unlocking digital downloads...');
        const fulfillmentResult = await fulfillVerifiedOrder({
          orderNumber: backendOrder.orderNumber,
          customerEmail: emailToUse,
          customerName: effectiveName,
          paymentId: backendOrder.providerOrderId,
          paymentMethod: 'razorpay',
          purchases: effectiveCartItems.map(item => ({
            productId: item.product.id,
            productTitle: item.product.title,
            amount: 0,
            currency: targetCurrency
          }))
        });

        setPaymentState('success');
        setStatusMessage('Downloads unlocked successfully!');
        onSuccess?.(fulfillmentResult);
        return;
      }

      // 3. Ensure official Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your connection and click Retry.');
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
          name: effectiveName,
          email: emailToUse
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
            orderNumber: backendOrder.orderNumber,
            customerEmail: emailToUse,
            customerName: effectiveName,
            userId: effectiveUserId
          });
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        console.warn('[Razorpay] Gateway event payment.failed:', resp?.error);
        const errMsg = resp?.error?.description || 'Payment was declined or failed by the gateway.';
        setPaymentState('failed');
        setErrorMessage(errMsg);
        setStatusMessage(errMsg);
        showToast(errMsg, 'error');
        onFailure?.(resp?.error);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[CheckoutModal] Order initiation error:', err);
      const errMsg = err?.message || 'Payment initiation failed. Please click Retry.';
      setPaymentState('failed');
      setErrorMessage(errMsg);
      setStatusMessage(errMsg);
      showToast(errMsg, 'error');
      onFailure?.(err);
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
    customerEmail?: string;
    customerName?: string;
    userId?: string;
  }) => {
    const emailToUse = paymentData.customerEmail || customerEmail.trim() || user?.email || 'customer@luminadigital.com';
    const nameToUse = paymentData.customerName || customerName || user?.displayName || 'Customer';
    const effectiveUserId = paymentData.userId || user?.uid || `guest_${emailToUse.replace(/[^a-zA-Z0-9]/g, '_') || Date.now()}`;

    setPaymentState('verifying');
    setStatusMessage('Your payment is being verified with Razorpay. Deliverables will unlock on confirmation...');

    try {
      const verifyResult = await verifyBackendPayment({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature || '',
        orderNumber: paymentData.orderNumber,
        userId: effectiveUserId,
        customerEmail: emailToUse
      });

      if (verifyResult.success && verifyResult.status === 'completed') {
        setStatusMessage('Payment verified! Confirming purchase in database...');

        // Unlock purchased digital products, confirm in Firestore database, and trigger global success toast
        const fulfillmentResult = await fulfillVerifiedOrder({
          orderNumber: paymentData.orderNumber,
          customerEmail: emailToUse,
          customerName: nameToUse,
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
        onSuccess?.(fulfillmentResult);
      } else if (verifyResult.status === 'pending') {
        setPaymentState('verifying');
        setStatusMessage('Your payment is being processed by the gateway. Please wait a moment...');
      } else {
        const errMsg = verifyResult.message || 'Payment verification could not be confirmed.';
        setPaymentState('failed');
        setErrorMessage(errMsg);
        setStatusMessage(errMsg);
        showToast(errMsg, 'error');
        onFailure?.(new Error(errMsg));
      }
    } catch (err: any) {
      console.error('[CheckoutModal] Verification failed:', err);
      const errMsg = err?.message || 'Payment verification failed. Please try again.';
      setPaymentState('failed');
      setErrorMessage(errMsg);
      setStatusMessage(errMsg);
      showToast(errMsg, 'error');
      onFailure?.(err);
    }
  };

  return (
    <div
      id="checkout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity cursor-pointer"
        onClick={handleClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        className="relative w-full max-w-2xl glass-strong rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden text-neutral-200 z-10 my-8"
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/25 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 id="checkout-modal-title" className="text-base font-bold text-white font-display">
                Secure Checkout
              </h3>
              <p className="text-xs text-neutral-400">Razorpay 256-Bit Encrypted Instant Fulfillment</p>
            </div>
          </div>
          <button
            type="button"
            id="close-checkout-modal"
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Checkout"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {paymentState === 'success' ? (
            /* Success State */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-white font-display">Payment Successful!</h4>
              <p className="text-sm text-neutral-300 max-w-md mx-auto">
                Your payment has been cryptographically verified. Your digital products and download deliverables are ready!
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  id="view-downloads-btn"
                  onClick={() => {
                    handleClose();
                    setActivePage('access');
                  }}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold btn-premium-primary text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  View My Downloads & Deliverables
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium btn-premium-secondary text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form & Order Summary */
            <div id="checkout-form" className="space-y-6">
              {/* Order Items List */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Order Summary ({effectiveCartItems.length} {effectiveCartItems.length === 1 ? 'item' : 'items'})
                </label>
                <div className="rounded-2xl border border-white/[0.08] bg-black/40 divide-y divide-white/[0.06] max-h-48 overflow-y-auto">
                  {effectiveCartItems.map((item, idx) => (
                    <div key={item.product.id || idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{item.product.title}</p>
                        <p className="text-neutral-500 font-mono text-[11px]">
                          Qty: {item.quantity} • {item.product.format?.toUpperCase() || 'DIGITAL'}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-neutral-200">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Code Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  Discount Coupon
                </label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-xs">
                    <span className="clay-badge px-2.5 py-0.5 text-xs font-mono font-bold">
                      Code: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-neutral-400 hover:text-rose-400 transition-colors font-medium text-[11px] cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="coupon-code-input"
                      placeholder="e.g. LUMINA20 (20% off)"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 neu-inset rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 uppercase font-mono"
                    />
                    <button
                      type="button"
                      id="apply-coupon-btn"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-gradient-to-r from-neutral-800 to-neutral-750 hover:from-neutral-700 hover:to-neutral-650 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border border-white/[0.08]"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
              </div>

              {/* Customer Delivery Details */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Delivery Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="customer-email" className="block text-[11px] text-neutral-400 mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="customer-email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full neu-inset rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500"
                    />
                    <p className="text-[10px] text-neutral-500 mt-0.5">Download deliverable links sent here</p>
                  </div>
                  <div>
                    <label htmlFor="customer-name" className="block text-[11px] text-neutral-400 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="customer-name"
                      name="name"
                      placeholder="Alex Taylor"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full neu-inset rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'razorpay'
                        ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/60 to-purple-950/40 text-white shadow-[0_0_20px_-3px_rgba(99,102,241,0.35)]'
                        : 'border-white/[0.08] bg-[#070c18]/80 text-neutral-400 hover:border-white/[0.16] hover:text-neutral-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-[11px]">Razorpay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/60 to-purple-950/40 text-white shadow-[0_0_20px_-3px_rgba(99,102,241,0.35)]'
                        : 'border-white/[0.08] bg-[#070c18]/80 text-neutral-400 hover:border-white/[0.16] hover:text-neutral-200'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-[11px]">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/60 to-purple-950/40 text-white shadow-[0_0_20px_-3px_rgba(99,102,241,0.35)]'
                        : 'border-white/[0.08] bg-[#070c18]/80 text-neutral-400 hover:border-white/[0.16] hover:text-neutral-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-[11px]">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'apple_pay'
                        ? 'border-indigo-500/80 bg-gradient-to-b from-indigo-950/60 to-purple-950/40 text-white shadow-[0_0_20px_-3px_rgba(99,102,241,0.35)]'
                        : 'border-white/[0.08] bg-[#070c18]/80 text-neutral-400 hover:border-white/[0.16] hover:text-neutral-200'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-[11px]">NetBanking</span>
                  </button>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0f172a]/90 via-[#0a1020]/95 to-[#060a14] border border-white/[0.09] space-y-2 text-xs shadow-inner">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatPrice(effectiveSubtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-2.5 border-t border-white/[0.08] flex justify-between text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <span className="font-mono text-indigo-300 font-bold text-base">{formatPrice(effectiveTotal)}</span>
                </div>
              </div>

              {/* Status or Error Notifications */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] self-start sm:self-auto cursor-pointer transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              {statusMessage && paymentState !== 'failed' && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Submit Payment Button */}
              <div className="pt-2">
                <motion.button
                  type="button"
                  whileTap={effectiveCartItems.length === 0 || paymentState === 'creating_order' || paymentState === 'awaiting_payment' || paymentState === 'verifying' ? undefined : { scale: 0.97 }}
                  onClick={handleInitiatePayment}
                  id="submit-payment-btn"
                  data-testid="submit-payment"
                  disabled={effectiveCartItems.length === 0 || paymentState === 'creating_order' || paymentState === 'awaiting_payment' || paymentState === 'verifying'}
                  className="w-full clay-btn btn-shine-sweep py-3.5 px-6 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentState === 'creating_order' || paymentState === 'awaiting_payment' || paymentState === 'verifying' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-indigo-200" />
                      <span>Pay {formatPrice(effectiveTotal)} & Unlock Downloads</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </motion.button>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-500 pt-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Razorpay Verified
                </span>
                <span>•</span>
                <span>Instant Deliverable Delivery</span>
                <span>•</span>
                <span>100% Money-Back Guarantee</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
