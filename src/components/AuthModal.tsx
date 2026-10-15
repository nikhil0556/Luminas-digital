import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'customer' | 'creator'>('customer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const { setActivePage, showToast } = useStore();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (!res.success && res.error && !res.error.includes('closed')) {
      setErrorMessage(res.error);
    }
  };

  const handleQuickFill = () => {
    setErrorMessage(null);
    if (authModalTab === 'signup') {
      setFullName('Alex Taylor');
      const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
      setEmail(`alex.${randomSuffix}@luminadigital.com`);
      setPassword('securePass123');
    } else if (authModalTab === 'login') {
      setEmail('demo.customer@luminadigital.com');
      setPassword('password123');
    } else {
      setEmail('demo.customer@luminadigital.com');
    }
  };

  const handleResendResetEmail = async () => {
    if (!resetSentEmail || resendCooldown > 0 || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await sendPasswordReset(resetSentEmail);
    setIsSubmitting(false);
    if (res.success) {
      setResendCooldown(60);
      showToast('Reset email resent! Please check your inbox.', 'success');
      setSuccessMessage(`A fresh reset email was sent to ${resetSentEmail}.`);
    } else {
      setErrorMessage(res.error || 'Failed to resend reset email.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (authModalTab === 'forgot') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setErrorMessage('Please enter your email address to receive the password reset link.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }

      setIsSubmitting(true);
      const res = await sendPasswordReset(trimmedEmail);
      setIsSubmitting(false);
      if (res.success) {
        setResetSentEmail(trimmedEmail);
        setResendCooldown(60);
        showToast('Password reset link sent! Check your inbox.', 'success');
        setSuccessMessage(`We have dispatched password reset instructions to ${trimmedEmail}.`);
      } else {
        setErrorMessage(res.error || 'Failed to send reset link.');
      }
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    if (authModalTab === 'login') {
      const res = await signInWithEmail(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to sign in.');
      }
    } else {
      if (!fullName.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please enter your full name.');
        return;
      }
      const res = await signUpWithEmail(fullName, email, password, accountType);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register account.');
      } else {
        closeAuthModal();
        if (accountType === 'creator') {
          setActivePage('creator-dashboard');
        } else {
          setActivePage('dashboard');
        }
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          className="relative w-full max-w-md glass-strong rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-neutral-100 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 mx-auto mb-3">
              <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                <span className="font-display font-black text-white text-lg">L✦</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {authModalTab === 'login' && 'Welcome Back'}
              {authModalTab === 'signup' && 'Create Your Account'}
              {authModalTab === 'forgot' && 'Reset Password'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              {authModalTab === 'login' && 'Sign in to access your digital downloads, prompt vaults, and order history.'}
              {authModalTab === 'signup' && 'Join Lumina Digital to save purchases, track downloads, and unlock prompt packs.'}
              {authModalTab === 'forgot' && 'Enter your account email to receive a secure password recovery link.'}
            </p>
          </div>

          {/* Mode Tabs (Only for login & signup) */}
          {authModalTab !== 'forgot' ? (
            <div className="flex bg-[#070b16]/80 p-1 rounded-xl mb-6 border border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setResetSentEmail(null);
                  openAuthModal('login');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'login'
                    ? 'bg-white/[0.09] text-white border border-white/[0.12] shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  setResetSentEmail(null);
                  openAuthModal('signup');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authModalTab === 'signup'
                    ? 'bg-white/[0.09] text-white border border-white/[0.12] shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setSuccessMessage(null);
                  if (resetSentEmail) setEmail(resetSentEmail);
                  setResetSentEmail(null);
                  openAuthModal('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && !resetSentEmail && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORGOT PASSWORD: SENT CONFIRMATION STATE */}
          {authModalTab === 'forgot' && resetSentEmail ? (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-neutral-300">
                  Password reset link sent to:
                </p>
                <div className="p-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl font-mono text-xs text-indigo-300 font-semibold break-all">
                  {resetSentEmail}
                </div>
              </div>

              <p className="text-xs text-neutral-400 text-center leading-relaxed">
                Check your email inbox or spam folder for instructions to choose a new password. The link is valid for 1 hour.
              </p>

              <button
                type="button"
                onClick={() => {
                  setEmail(resetSentEmail);
                  setResetSentEmail(null);
                  openAuthModal('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
              >
                <span>Back to Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isSubmitting}
                  onClick={handleResendResetEmail}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend email'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetSentEmail(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  Try different email
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google Sign-in Button (Login / Signup mode) */}
              {authModalTab !== 'forgot' && (
                <>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.28 21.36 7.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.41l4.03-3.13z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.28 2.64 1.25 6.59l4.03 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="border-t border-neutral-800 w-full" />
                    <span className="bg-neutral-900 px-3 text-[11px] text-neutral-500 uppercase tracking-wider font-mono">
                      or with email
                    </span>
                  </div>

                  {/* Quick Fill Demo Helper */}
                  <div className="flex items-center justify-between text-[11px] bg-neutral-950/60 border border-neutral-800/80 rounded-xl px-3 py-2 mb-3.5">
                    <span className="text-neutral-400">Quick Test?</span>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>Auto-fill {authModalTab === 'signup' ? 'new user' : 'test credentials'}</span>
                    </button>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authModalTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Choose Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setAccountType('customer')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          accountType === 'customer'
                            ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                            : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:border-neutral-600'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <User className="w-3 h-3 text-indigo-400" />
                          <span>Customer</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">Buy & download</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAccountType('creator')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          accountType === 'creator'
                            ? 'bg-indigo-950/40 border-indigo-500 text-white ring-1 ring-indigo-500/30'
                            : 'bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:border-neutral-600'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-emerald-400" />
                          <span>Creator</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">Sell & 90% payout</div>
                      </button>
                    </div>

                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        disabled={isSubmitting}
                        className="w-full neu-inset rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={isSubmitting}
                      className="w-full neu-inset rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 transition-all"
                    />
                  </div>
                </div>

                {authModalTab !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-neutral-300">
                        Password
                      </label>
                      {authModalTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage(null);
                            setSuccessMessage(null);
                            openAuthModal('forgot');
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={authModalTab === 'signup' ? 'At least 6 characters' : '••••••••'}
                        disabled={isSubmitting}
                        className="w-full neu-inset rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileTap={isSubmitting ? undefined : { scale: 0.97 }}
                  disabled={isSubmitting}
                  className="w-full clay-btn btn-shine-sweep py-2.5 px-4 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {authModalTab === 'login' && (
                        <>
                          <span>Sign In to Account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                      {authModalTab === 'signup' && (
                        <>
                          <span>Create Account</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                      {authModalTab === 'forgot' && (
                        <>
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Send Password Reset Email</span>
                        </>
                      )}
                    </>
                  )}
                </motion.button>
              </form>
            </>
          )}

          {/* Full Page Navigation Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                closeAuthModal();
                setActivePage(authModalTab === 'signup' ? 'signup' : 'login');
              }}
              className="inline-flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <span>Prefer full page {authModalTab === 'signup' ? 'sign up' : 'sign in'}?</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Footer Security Badges */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Firebase Authentication & Firestore Persistence</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
