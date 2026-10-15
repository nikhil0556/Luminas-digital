import React, { useState, useEffect } from 'react';
import {
  Mail,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  ShieldCheck,
  Gift,
  Copy,
  Check,
  Loader2,
  Flame
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { captureWaitlistLead, getTotalWaitlistCount, WaitlistLead } from '../services/mockNewsletterService';
import { BlowReveal } from './BlowReveal';

export const JoinWaitlistSection: React.FC = () => {
  const { subscribeNewsletter, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [leadSuccess, setLeadSuccess] = useState<WaitlistLead | null>(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(1420);

  useEffect(() => {
    setWaitlistCount(getTotalWaitlistCount());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.trim()) {
      setErrorMsg('Please enter your email address to claim your spot.');
      return;
    }

    setLoading(true);

    try {
      // 1. Call mock newsletter & waitlist service
      const res = await captureWaitlistLead(email, {
        source: 'Home Page Join the Waitlist Glass Card'
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setLoading(false);
        return;
      }

      // 2. Also record in StoreContext subscriber system for cross-app consistency
      subscribeNewsletter(email, 'Waitlist VIP');

      if (res.lead) {
        setLeadSuccess(res.lead);
        setWaitlistCount(getTotalWaitlistCount());
      }
      setAlreadyRegistered(!!res.alreadyRegistered);

      showToast(
        res.alreadyRegistered
          ? `Welcome back! You're already reserved at #${res.lead?.waitlistPosition}.`
          : `🎉 Spot #${res.lead?.waitlistPosition || 'VIP'} secured! Check your inbox for the welcome kit.`,
        'success',
        { title: 'VIP Waitlist Confirmed' }
      );
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setErrorMsg('Unable to join waitlist. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!leadSuccess?.referralCode) return;
    navigator.clipboard.writeText(leadSuccess.referralCode);
    setCopiedCode(true);
    showToast('Referral code copied to clipboard!', 'info');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <BlowReveal direction="breeze" gustSweep as="section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div
        id="join-the-waitlist-section"
        className="glass-card-premium relative rounded-3xl p-6 sm:p-10 lg:p-14 overflow-hidden border border-white/[0.12] bg-gradient-to-b from-[#141b33]/90 via-[#0e1428]/95 to-[#070b18] shadow-[0_20px_60px_-15px_rgba(79,70,229,0.22)] blow-on-reach"
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-cyan-500/[0.04] to-transparent pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading, Value Proposition & Perks */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-300 border border-indigo-400/30 backdrop-blur-md shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Next Gen Digital Vault • 2026 Release</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-300 font-mono text-[11px]">{waitlistCount.toLocaleString()} Waiting</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-tight">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300">VIP Waitlist</span>
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl">
                Be the first to access our upcoming drop of AI prompt systems, creator automation blueprints, and exclusive video masterclasses before public release.
              </p>
            </div>

            {/* Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-indigo-400 mb-1">
                  <Gift className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Instant Gift</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Free 100+ AI Prompt Mega-Kit delivered right to your inbox.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white">35% Off Code</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Guaranteed discount tier on all upcoming digital products.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">48h Early Access</span>
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Skip the launch line and grab limited edition bundles early.
                </p>
              </div>
            </div>

            {/* Micro Trust Indicators */}
            <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-400 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero spam • 1-click unsubscribe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Instant automated email verification</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Capture Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#0b1021]/80 border border-white/[0.12] p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

              {!leadSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="waitlist-email-input" className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                        Reserve Your Early Spot
                      </label>
                      <span className="text-[11px] text-indigo-400 font-medium">Free Access</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Enter your best work or personal email below:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="waitlist-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="you@creator.com"
                        className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-[#12192e]/90 border border-white/[0.12] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                        disabled={loading}
                      />
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-400 font-medium flex items-center gap-1 pt-1">
                        <span>⚠</span>
                        <span>{errorMsg}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    id="waitlist-submit-button"
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-violet-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Securing Your Spot...</span>
                      </>
                    ) : (
                      <>
                        <span>Join the VIP Waitlist</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-neutral-400">
                      By submitting, you agree to receive digital product announcements. Unsubscribe anytime.
                    </p>
                  </div>
                </form>
              ) : (
                /* Success State */
                <div className="space-y-5 text-center animate-fadeIn">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      SPOT #{leadSuccess.waitlistPosition.toLocaleString()} CONFIRMED
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {alreadyRegistered ? "You're on the list!" : 'Welcome to the Lumina Inner Circle!'}
                    </h3>
                    <p className="text-xs text-neutral-300 max-w-xs mx-auto">
                      We sent your starter bundle to <span className="font-semibold text-white">{leadSuccess.email}</span>.
                    </p>
                  </div>

                  {/* Referral Card */}
                  <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Your VIP Priority Pass:</span>
                      <span className="text-indigo-400 font-mono font-semibold">{leadSuccess.referralCode}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Code!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Referral Pass</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLeadSuccess(null);
                      setEmail('');
                      setAlreadyRegistered(false);
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
                  >
                    Register another email
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BlowReveal>
  );
};
