import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Lock, ExternalLink, Zap, AlertCircle } from 'lucide-react';

interface RazorpayPaymentButtonProps {
  buttonId?: string;
  className?: string;
  showBadges?: boolean;
  theme?: 'dark' | 'light';
  caption?: string;
}

export const RazorpayPaymentButton: React.FC<RazorpayPaymentButtonProps> = ({
  buttonId = '',
  className = '',
  showBadges = true,
  caption
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !buttonId) {
      setIsLoading(false);
      return;
    }

    // Reset container contents
    container.innerHTML = '';
    setIsLoading(true);
    setLoadError(false);

    // Build the form and script tags exactly as required by Razorpay
    const form = document.createElement('form');
    form.className = 'razorpay-payment-form w-full flex justify-center my-1';

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
    script.setAttribute('data-payment_button_id', buttonId);
    script.async = true;

    script.onload = () => {
      setIsLoading(false);
      setLoadError(false);
    };

    script.onerror = () => {
      console.warn('[RazorpayPaymentButton] Failed to load payment-button.js from Razorpay CDN');
      setIsLoading(false);
      setLoadError(true);
    };

    form.appendChild(script);

    const stopBubble = (e: Event) => {
      e.stopPropagation();
    };
    form.addEventListener('submit', stopBubble);

    container.appendChild(form);

    // Safety timeout: if script doesn't report within 3 seconds, clear spinner
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => {
      clearTimeout(timer);
      form.removeEventListener('submit', stopBubble);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [buttonId]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`razorpay-button-wrapper flex flex-col items-center justify-center ${className}`}
    >
      {/* Script Form Mount Target */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full flex justify-center min-h-[44px] relative"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs text-neutral-400 bg-neutral-900/60 rounded-xl py-2 px-4 border border-neutral-800 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
            <span>Loading Razorpay Payment Gateway...</span>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full flex justify-center items-center overflow-visible"
        />
      </div>

      {loadError && (
        <div className="mt-2 text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 max-w-md w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Razorpay Payment Button ID: <strong className="font-mono">{buttonId}</strong></span>
          </div>
          <a
            href={`https://pages.razorpay.com/${buttonId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/40 rounded-lg font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <span>Open Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Trust & payment badges */}
      {showBadges && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1 font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official Razorpay Button
          </span>
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-neutral-500" />
            256-Bit SSL Secured
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-neutral-400">UPI / Cards / NetBanking</span>
        </div>
      )}

      {caption && (
        <p className="mt-1.5 text-[11px] text-neutral-400 text-center max-w-sm">
          {caption}
        </p>
      )}
    </div>
  );
};
