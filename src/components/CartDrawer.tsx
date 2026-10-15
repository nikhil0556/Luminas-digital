import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Zap, Gift, Tag, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalTotal,
    formatPrice,
    setActivePage,
    navigateToProduct,
    setIsCheckoutModalOpen
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartOpen) return null;

  const freeGiftThreshold = 35;
  const progressPercent = Math.min(100, (cartSubtotal / freeGiftThreshold) * 100);
  const remainingForGift = Math.max(0, freeGiftThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponError('');
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutModalOpen(true);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-screen max-w-md glass-strong flex flex-col justify-between text-neutral-200 shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white font-display">Your Cart</h3>
              <span className="clay-badge-sapphire px-2 py-0.5 text-xs font-mono font-bold text-white">
                {cart.length}
              </span>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Freebie Progress Bar */}
          <div className="px-5 py-3 bg-black/40 border-b border-white/[0.06]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-neutral-300">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                {remainingForGift === 0 ? (
                  <span className="text-emerald-400 font-semibold">Bonus Creator Starter Kit Unlocked!</span>
                ) : (
                  <span>
                    Add <strong className="text-white">{formatPrice(remainingForGift)}</strong> more for Free Bonus Pack
                  </span>
                )}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-neutral-400">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 flex items-center justify-center text-neutral-500">
                  <Zap className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-white">Your cart is empty</h4>
                <p className="text-xs text-neutral-400 max-w-xs">
                  Browse our curated e-books, AI prompt packs, and productivity templates to start growing.
                </p>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('shop');
                  }}
                  className="clay-btn btn-shine-sweep mt-2 px-5 py-2.5 text-xs font-bold text-white"
                >
                  Explore Products
                </motion.button>
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.product.id}
                  className="p-3.5 rounded-2xl glass border border-white/[0.08] hover:border-white/[0.18] transition-all flex gap-3.5 items-center justify-between shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                      {item.product.format}
                    </span>
                    <h4
                      onClick={() => {
                        setIsCartOpen(false);
                        navigateToProduct(item.product.slug);
                      }}
                      className="text-sm font-semibold text-white truncate hover:text-indigo-300 cursor-pointer transition-colors"
                    >
                      {item.product.title}
                    </h4>
                    <div className="text-xs font-mono font-bold text-neutral-200 mt-1">
                      {formatPrice(item.product.price)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center rounded-xl neu-raised p-1">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/[0.06] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/[0.06] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with totals and checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-white/[0.08] bg-[#070b16]/95 space-y-4">
              {/* Discount coupon box */}
              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs">
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
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value);
                      if (couponError) setCouponError('');
                    }}
                    placeholder="Coupon code (e.g. LUMINA20)"
                    className="flex-1 px-3.5 py-2 rounded-xl neu-inset text-xs text-white placeholder-neutral-500 uppercase font-mono"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-white/[0.08] cursor-pointer"
                  >
                    Apply
                  </motion.button>
                </form>
              )}
              {couponError && <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>}

              {/* Price summary */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-200">{formatPrice(cartSubtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-mono">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/[0.08] font-display">
                  <span>Total Due</span>
                  <span className="font-mono text-indigo-300 font-bold">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleCheckout}
                className="w-full clay-btn btn-shine-sweep py-3.5 text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Instant Download
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  256-bit Encrypted
                </span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
