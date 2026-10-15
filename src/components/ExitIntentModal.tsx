import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ExitIntentModal: React.FC = () => {
  const { subscribeNewsletter, applyCoupon, setIsCartOpen, settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!settings.enableExitIntentModal) return;
    // Check if previously dismissed or seen
    const hasSeen = sessionStorage.getItem('lumina_offer_seen');
    if (hasSeen) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !sessionStorage.getItem('lumina_offer_seen')) {
        setIsOpen(true);
        sessionStorage.setItem('lumina_offer_seen', 'true');
      }
    };

    // Also trigger after 40 seconds if user hasn't seen it
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem('lumina_offer_seen')) {
        setIsOpen(true);
        sessionStorage.setItem('lumina_offer_seen', 'true');
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  if (!isOpen || !settings.enableExitIntentModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribeNewsletter(email, 'Exit Intent 15% Modal');
    applyCoupon('CREATOR15');
    setClaimed(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        className="relative w-full max-w-lg glass-strong rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {!claimed ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Gift className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
                Wait! Before you leave...
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">
                Claim 15% Off + The 50+ Creator Prompt Starter Kit
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                Join our private community of digital makers. We will immediately email you our free starter pack and activate coupon <span className="font-mono text-indigo-300 font-bold">CREATOR15</span> for your cart.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your best email address..."
                className="w-full px-4 py-3 rounded-xl neu-inset text-white placeholder-neutral-500 text-sm focus:outline-none"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 text-sm font-bold clay-btn-gold btn-shine-sweep text-neutral-950 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Unlock 15% Off & Free Kit</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>

            <p className="text-[11px] text-center text-neutral-400">
              Zero spam. Unsubscribe anytime with 1 click.
            </p>
          </div>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white font-display">
              You are all set!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300">
              We applied coupon <strong className="text-emerald-400 font-mono">CREATOR15</strong> to your cart and dispatched your Free Creator Prompt Kit to your email.
            </p>
            <div className="pt-2 flex gap-3">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  handleClose();
                  setIsCartOpen(true);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold clay-btn btn-shine-sweep text-white transition-all shadow-md"
              >
                View Cart & Save
              </motion.button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-300 hover:text-white"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
