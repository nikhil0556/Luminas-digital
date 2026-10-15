import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
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
  BookOpen,
  Zap,
  RefreshCw,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AUTH_PROVIDERS } from '../lib/authProviders';

interface AuthPageProps {
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    sendVerification,
    reloadUser,
    logout,
    linkedProviders
  } = useAuth();

  const { setActivePage, showToast } = useStore();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'customer' | 'creator'>('customer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSendingVerify, setIsSendingVerify] = useState(false);
  const [resetSentEmail, setResetSentEmail] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    setMode(initialMode);
    if (initialMode !== 'forgot') {
      setResetSentEmail(null);
    }
  }, [initialMode]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);
    if (res.success) {
      showToast('Welcome to Lumina Digital! Signed in with Google.', 'success');
      setActivePage('dashboard');
    } else if (res.error && !res.error.includes('closed')) {
      setErrorMessage(res.error);
    }
  };

  const handleQuickFill = () => {
    setErrorMessage(null);
    if (mode === 'signup') {
      setFullName('Alex Taylor');
      const randomSuffix = Math.floor(Math.random() * 9000 + 1000);
      setEmail(`alex.${randomSuffix}@luminadigital.com`);
      setPassword('securePass123');
    } else if (mode === 'login') {
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
    setSuccessMessage(null);
    const res = await sendPasswordReset(resetSentEmail);
    setIsSubmitting(false);
    if (res.success) {
      setResendCooldown(60);
      showToast('Password reset link resent! Please check your inbox.', 'success');
      setSuccessMessage(`A fresh reset link was sent to ${resetSentEmail}.`);
    } else {
      setErrorMessage(res.error || 'Failed to resend reset email. Please try again.');
    }
  };

  const handleBackToLogin = (fillWithSentEmail = false) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fillWithSentEmail && resetSentEmail) {
      setEmail(resetSentEmail);
    }
    setResetSentEmail(null);
    setMode('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Forgot Password Form Flow
    if (mode === 'forgot') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setErrorMessage('Please enter your email address to receive password reset instructions.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
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

    // Required fields check
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await signInWithEmail(email, password);
      setIsSubmitting(false);
      if (res.success) {
        showToast('Successfully signed in!', 'success');
        setActivePage('dashboard');
      } else {
        setErrorMessage(res.error || 'Failed to sign in. Please verify your credentials.');
      }
    } else {
      // Sign Up
      if (!fullName.trim()) {
        setIsSubmitting(false);
        setErrorMessage('Please provide your full display name.');
        return;
      }
      if (password.length < 6) {
        setIsSubmitting(false);
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      const res = await signUpWithEmail(fullName, email, password, accountType);
      setIsSubmitting(false);
      if (res.success) {
        showToast('Account created successfully! Welcome to Lumina Digital.', 'success');
        setSuccessMessage('Your account was created! We sent a verification link to your email address.');
        if (accountType === 'creator') {
          setActivePage('creator-dashboard');
        } else {
          setActivePage('dashboard');
        }
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    }
  };

  const handleResendVerification = async () => {
    setIsSendingVerify(true);
    const res = await sendVerification();
    setIsSendingVerify(false);
    if (res.success) {
      showToast(res.message || 'Verification link sent to your email!', 'success');
    } else {
      showToast(res.error || 'Failed to send verification email.', 'error');
    }
  };

  const handleCheckVerification = async () => {
    setIsReloading(true);
    await reloadUser();
    setIsReloading(false);
    if (user?.emailVerified) {
      showToast('Email successfully verified! Thank you.', 'success');
    } else {
      showToast('Email not verified yet. Please check your inbox or click Resend Link.', 'info');
    }
  };

  // Loading state while initializing Firebase Auth session
  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs text-neutral-400 font-mono">Verifying authentication session...</p>
      </div>
    );
  }

  // If user is already authenticated and visits this page
  if (user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-6"
        >
          {/* Subtle Ambient Background */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-xl">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-full h-full rounded-2xl object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
              Active Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              You are signed in as {user.displayName || userProfile?.name || 'Customer'}
            </h1>
            <p className="text-sm text-neutral-400">{user.email}</p>
          </div>

          {/* Verification Status Banner */}
          {!user.emailVerified ? (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Your email is pending verification. Check your inbox.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={isSendingVerify}
                  onClick={handleResendVerification}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {isSendingVerify ? 'Sending...' : 'Resend'}
                </button>
                <button
                  type="button"
                  disabled={isReloading}
                  onClick={handleCheckVerification}
                  className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer"
                  title="Refresh verification status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Email Verified & Protected</span>
            </div>
          )}

          {/* Linked Providers Summary */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs text-neutral-300 space-y-2">
            <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block text-left">
              Linked Sign-In Methods
            </span>
            <div className="flex flex-wrap items-center gap-2 justify-start">
              {linkedProviders.map((p) => {
                const provConfig = AUTH_PROVIDERS.find((ap) => ap.id === p);
                return (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{provConfig?.badgeName || p}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActivePage('dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Customer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {user.email && (
              <button
                type="button"
                disabled={isSubmitting || resendCooldown > 0}
                onClick={async () => {
                  setIsSubmitting(true);
                  const res = await sendPasswordReset(user.email!);
                  setIsSubmitting(false);
                  if (res.success) {
                    setResendCooldown(60);
                    showToast(`Password reset link sent to ${user.email}!`, 'success');
                  } else {
                    showToast(res.error || 'Failed to send reset email.', 'error');
                  }
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-all border border-neutral-700/80 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4 text-indigo-400" />
                <span>{resendCooldown > 0 ? `Reset Sent (${resendCooldown}s)` : 'Send Password Reset Email'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                await logout();
                showToast('Signed out successfully.', 'info');
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-all border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Value Proposition & Brand Trust */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Lumina Digital Account</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight leading-tight">
              One account for all your digital knowledge and AI assets.
            </h1>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
              Sign in to manage your e-books, unlock prompt vaults, access lifetime product updates, and retrieve verified receipts.
            </p>
          </div>

          {/* Key Feature Bullets */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant E-book & PDF Vault Access</h4>
                <p className="text-xs text-neutral-400">
                  Read dual e-books online or download verified PDF copies to any device.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">3,500+ Curated AI Prompts</h4>
                <p className="text-xs text-neutral-400">
                  Copy battle-tested ChatGPT, Midjourney, Claude, and Gemini prompts in one click.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Persistent Cloud Firestore Vault</h4>
                <p className="text-xs text-neutral-400">
                  Your purchases, order history, and downloads stay synced across every session.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Box */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
          >
            {/* Ambient Lighting */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 mx-auto mb-3">
                <div className="w-full h-full bg-neutral-950 rounded-[11px] flex items-center justify-center">
                  {mode === 'forgot' ? (
                    <KeyRound className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <span className="font-display font-black text-white text-lg">L✦</span>
                  )}
                </div>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {mode === 'login' && 'Sign in to Lumina Digital'}
                {mode === 'signup' && 'Create your free account'}
                {mode === 'forgot' && (resetSentEmail ? 'Check your email inbox' : 'Recover your account')}
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                {mode === 'login' && 'Enter your credentials or use Google to access your dashboard.'}
                {mode === 'signup' && 'Get started with digital downloads and synced access.'}
                {mode === 'forgot' &&
                  (resetSentEmail
                    ? 'Follow the instructions sent to your email to safely reset your password.'
                    : 'We will send a secure Firebase Authentication password reset link to your email.')}
              </p>
            </div>

            {/* Mode Switcher Tabs (Login / Signup) */}
            {mode !== 'forgot' ? (
              <div className="flex bg-neutral-800/80 p-1 rounded-xl mb-6 border border-neutral-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode('login');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-neutral-900 text-white shadow-sm'
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
                    setMode('signup');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-neutral-900 text-white shadow-sm'
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
                  onClick={() => handleBackToLogin(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setResetSentEmail(null);
                    setMode('signup');
                  }}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Create account instead
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Message (when not in sent confirmation view) */}
            {successMessage && !resetSentEmail && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* FORGOT PASSWORD: SENT CONFIRMATION STATE */}
            {mode === 'forgot' && resetSentEmail ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-neutral-300">
                    A password reset email has been dispatched via Firebase to:
                  </p>
                  <div className="p-2.5 bg-neutral-950/80 border border-neutral-800 rounded-xl font-mono text-xs text-indigo-300 font-semibold break-all">
                    {resetSentEmail}
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-2.5 p-3.5 bg-neutral-950/50 border border-neutral-800/70 rounded-2xl text-xs text-neutral-300">
                  <div className="font-semibold text-white text-[11px] uppercase tracking-wider font-mono">
                    Next steps:
                  </div>
                  <div className="flex items-start gap-2 text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Open your email client and look for an email from Lumina Digital.</span>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Click the reset link to enter and confirm your new password securely.</span>
                  </div>
                  <div className="flex items-start gap-2 text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Return here and sign in with your updated credentials.</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 text-center">
                  Didn't receive the email? Check your spam/junk folder. The reset link expires in 1 hour.
                </div>

                {/* Primary Button: Proceed to Sign In */}
                <button
                  type="button"
                  onClick={() => handleBackToLogin(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/25"
                >
                  <span>Ready to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Secondary Resend Button */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSubmitting}
                    onClick={handleResendResetEmail}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `Resend email (${resendCooldown}s)` : 'Resend reset email'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetSentEmail(null);
                      setSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                  >
                    Try different email
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Google Sign-in Button */}
                {mode !== 'forgot' && (
                  <>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700/90 border border-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
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
                        or continue with email
                      </span>
                    </div>

                    {/* Quick Test Demo Helper */}
                    <div className="flex items-center justify-between text-[11px] bg-neutral-950/60 border border-neutral-800/80 rounded-xl px-3 py-2 mb-3.5">
                      <span className="text-neutral-400">Quick Test?</span>
                      <button
                        type="button"
                        onClick={handleQuickFill}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        <span>Auto-fill {mode === 'signup' ? 'new user' : 'test credentials'}</span>
                      </button>
                    </div>
                  </>
                )}

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Account Type
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
                          <div className="text-[10px] text-neutral-400 mt-0.5">Buy & download assets</div>
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
                            <span>Creator / Seller</span>
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">Sell & receive payouts</div>
                        </button>
                      </div>

                      <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Alex Johnson"
                          disabled={isSubmitting}
                          className="w-full bg-neutral-800/80 border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      {mode === 'forgot' ? 'Account Email Address' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        disabled={isSubmitting}
                        autoFocus={mode === 'forgot'}
                        className="w-full bg-neutral-800/80 border border-neutral-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                    {mode === 'forgot' && (
                      <p className="text-[11px] text-neutral-400 mt-1.5">
                        Enter the email associated with your account. We'll send you an encrypted link to reset your password.
                      </p>
                    )}
                  </div>

                  {mode !== 'forgot' && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-neutral-300">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setErrorMessage(null);
                              setSuccessMessage(null);
                              setResetSentEmail(null);
                              setMode('forgot');
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
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === 'signup' ? 'Minimum 6 characters' : '••••••••'}
                          disabled={isSubmitting}
                          className="w-full bg-neutral-800/80 border border-neutral-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all"
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

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg shadow-indigo-600/25 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {mode === 'login' && (
                          <>
                            <span>Sign In</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                        {mode === 'signup' && (
                          <>
                            <span>Create Account</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                        {mode === 'forgot' && (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Send Password Reset Link</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Bottom Disclaimer */}
            <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Firebase Authentication & Firestore Cloud Sync</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
