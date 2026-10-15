import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, AlertCircle, CheckCircle2, CreditCard, RotateCcw } from 'lucide-react';
import { loadRazorpayScript, getThemeAccentColor } from '../lib/payment/razorpayClient';

export interface RazorpayStandardCheckoutButtonProps {
  amount: number; // in paise (e.g. 100 for ₹1, or 169900 for ₹1,699)
  currency?: string;
  receipt?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  productTitle?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (verifyData: any) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
  showStatusMessages?: boolean;
}

export const RazorpayStandardCheckoutButton: React.FC<RazorpayStandardCheckoutButtonProps> = ({
  amount,
  currency = 'INR',
  receipt,
  customerName,
  customerEmail,
  customerPhone,
  productTitle = 'Lumina Digital Order',
  buttonText,
  className = '',
  disabled = false,
  onSuccess,
  onFailure,
  onDismiss,
  showStatusMessages = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isProcessing = isLoading || isVerifying;

  const handleCheckout = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (disabled || isProcessing) return;

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Ensure official Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !(window as any).Razorpay) {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection and click Retry.');
      }

      // 2. Call backend endpoint to create order: POST /api/create-order
      const orderPayload: any = {
        amount: Math.round(amount),
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`
      };

      if (customerEmail) orderPayload.customerEmail = customerEmail;
      if (customerName) orderPayload.customerName = customerName;

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || `Unable to initialize payment order with gateway (${orderRes.status}).`);
      }

      const orderId = orderData.order_id;
      const razorpayKey = orderData.key_id;

      if (!razorpayKey) {
        throw new Error('Server did not return a valid payment gateway key.');
      }

      // Dynamic theme color from CSS variables (Anti-hardcoding)
      const activeThemeColor = getThemeAccentColor();

      // 3. Configure Razorpay Standard Checkout Modal Options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Lumina Digital',
        description: productTitle,
        order_id: orderId,
        prefill: {
          name: customerName || 'Valued Customer',
          email: customerEmail || '',
          contact: customerPhone || ''
        },
        theme: {
          color: activeThemeColor
        },
        modal: {
          ondismiss: () => {
            console.log('[Razorpay Standard] Modal dismissed by user');
            setIsLoading(false);
            if (onDismiss) onDismiss();
          }
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          setIsVerifying(true);
          try {
            // 4. Send razorpay_payment_id, razorpay_order_id, razorpay_signature to backend verify endpoint
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customerEmail,
                customerName
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success || verifyData.status !== 'completed') {
              throw new Error(verifyData.error || verifyData.message || 'Payment signature verification failed.');
            }

            // Only mark success when server returns success: true and status: 'completed'
            setIsSuccess(true);
            setErrorMsg(null);
            if (onSuccess) onSuccess(verifyData);
          } catch (vErr: any) {
            console.error('[Razorpay Standard] Verification error:', vErr);
            const msg = vErr?.message || 'Payment verification failed on the server.';
            setErrorMsg(msg);
            if (onFailure) onFailure(vErr);
          } finally {
            setIsVerifying(false);
            setIsLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);

      // Handle payment.failed event strictly without fabricating success
      rzp.on('payment.failed', (failedResponse: any) => {
        console.warn('[Razorpay Standard] Payment failed:', failedResponse?.error);
        const description = failedResponse?.error?.description || 'Payment was declined or failed. Please retry.';
        setErrorMsg(description);
        setIsLoading(false);
        if (onFailure) onFailure(failedResponse?.error);
      });

      rzp.open();
    } catch (err: any) {
      console.error('[Razorpay Standard] Checkout error:', err);
      const msg = err?.message || 'Could not initiate Razorpay checkout. Please click Retry.';
      setErrorMsg(msg);
      setIsLoading(false);
      setIsVerifying(false);
      if (onFailure) onFailure(err);
    }
  };

  const formattedPrice = (amount / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: currency.toUpperCase()
  });

  return (
    <div className="w-full flex flex-col items-center gap-2">
      <motion.button
        type="button"
        whileTap={disabled || isProcessing ? undefined : { scale: 0.97 }}
        onClick={handleCheckout}
        disabled={disabled || isProcessing}
        className={`w-full py-3.5 px-6 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          disabled || isProcessing
            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700 opacity-60 rounded-2xl min-h-[44px]'
            : isSuccess
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-default rounded-2xl min-h-[44px]'
            : 'clay-btn btn-shine-sweep text-white cursor-pointer'
        } ${className}`}
      >
        {isVerifying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
            <span>Verifying Payment with Gateway...</span>
          </>
        ) : isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
            <span>Connecting to Razorpay...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Payment Verified!</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 text-indigo-200" />
            <span>{buttonText || `Pay with Razorpay (${formattedPrice})`}</span>
          </>
        )}
      </motion.button>

      {showStatusMessages && errorMsg && (
        <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isProcessing}
              className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-[11px] underline text-rose-400 hover:text-rose-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {showStatusMessages && isSuccess && (
        <div className="w-full p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Payment verified and confirmed with Razorpay!</span>
        </div>
      )}
    </div>
  );
};
