import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight,
  User,
  Building2,
  Globe,
  Upload,
  Lock,
  Layers,
  HelpCircle,
  Check,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCreator } from '../context/CreatorContext';
import { useStore } from '../context/StoreContext';
import { CreatorType } from '../types';

const CREATOR_TYPES: CreatorType[] = [
  'Individual Creator',
  'Prompt Engineer / AI Specialist',
  'Independent Author',
  'Studio / Agency',
  'Brand / Business'
];

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'Singapore',
  'United Arab Emirates',
  'France',
  'Netherlands',
  'Brazil',
  'Japan',
  'Other'
];

export const BecomeCreatorPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { creatorProfile, isCreator, registerAsCreator, simulateStatusChange } = useCreator();
  const { navigateToCreatorDashboard, navigateToDashboard, showToast } = useStore();

  // Form State
  const [accountType, setAccountType] = useState<'customer' | 'creator'>('creator');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [creatorType, setCreatorType] = useState<CreatorType>('Individual Creator');
  const [country, setCountry] = useState('India');
  const [profileImage, setProfileImage] = useState(
    user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [idType, setIdType] = useState<'passport' | 'national_id' | 'driver_license'>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already registered creator
  if (isCreator && creatorProfile) {
    const statusColors = {
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      under_review: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      suspended: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      rejected: 'bg-neutral-800 text-neutral-400 border-neutral-700'
    };

    const statusLabels = {
      pending: 'Application Pending',
      under_review: 'Under Compliance Review',
      verified: 'Verified Creator & Seller',
      suspended: 'Account Suspended',
      rejected: 'Application Not Approved'
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border mb-4 capitalize font-mono ${statusColors[creatorProfile.accountStatus]}">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{statusLabels[creatorProfile.accountStatus]}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome Back, {creatorProfile.displayName}
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl mx-auto mb-6">
            Your Lumina creator identity is active under UID{' '}
            <code className="text-xs font-mono bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">
              {creatorProfile.creatorUid.slice(0, 14)}...
            </code>
            . You can access your full product catalog, sales analytics, and payouts below.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigateToCreatorDashboard('overview')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <span>Open Creator Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigateToDashboard('profile')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold transition-all cursor-pointer"
            >
              Customer Account
            </button>
          </div>

          {/* Sandbox Status Switcher for Reviewer Testing */}
          <div className="mt-10 pt-6 border-t border-neutral-800/80 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sandbox Verification State Testing (Reviewer Tool)</span>
              </span>
              <span className="text-[11px] text-neutral-500">Test how UI adapts to each status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['pending', 'under_review', 'verified', 'suspended', 'rejected'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={async () => {
                    await simulateStatusChange(st);
                    showToast(`Creator status switched to: ${st}`, 'info');
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer capitalize text-center ${
                    creatorProfile.accountStatus === st
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-neutral-800/60 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      openAuthModal('signup');
      return;
    }

    if (!displayName.trim()) {
      setFormError('Please enter your Creator Display Name.');
      return;
    }

    if (!bio.trim() || bio.trim().length < 20) {
      setFormError('Please provide a brief bio about yourself and your digital assets (min 20 characters).');
      return;
    }

    if (!idNumber.trim()) {
      setFormError('Please provide a valid Government ID or registration number for KYC compliance.');
      return;
    }

    if (!agreeTerms) {
      setFormError('You must agree to the Lumina Marketplace Creator Guidelines and Revenue Terms.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerAsCreator({
      displayName,
      businessName,
      bio,
      creatorType,
      country,
      profileImage,
      idType,
      idNumber,
      taxId
    });
    setIsSubmitting(false);

    if (res.success) {
      showToast('Creator onboarding submitted! Welcome to Lumina Creators.', 'success');
      navigateToCreatorDashboard('overview');
    } else {
      setFormError(res.error || 'Failed to submit creator profile.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Lumina Creator & Seller Program</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Sell Digital Products to <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
            Ambitious Gen Z & Professionals
          </span>
        </h1>
        <p className="text-neutral-400 text-base sm:text-lg leading-relaxed">
          Publish e-books, AI prompt vaults, templates, and guides. You keep 90% of your earnings with automatic digital delivery and verified customer reviews.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">90% Creator Revenue</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Transparent pricing with 10% platform fee covering card processing, bandwidth, and customer support.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
            <Layers className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Permanent Firebase UID</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Your products, license keys, and payouts are securely linked to your authenticated Firebase UID.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Strict Marketplace Quality</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            KYC compliance ensures a trusted marketplace free of low-quality spam or stolen intellectual property.
          </p>
        </div>
      </div>

      {/* Account Type Selector Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Select Account Type</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setAccountType('customer');
              if (user) {
                navigateToDashboard('profile');
              } else {
                openAuthModal('login');
              }
            }}
            className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
              accountType === 'customer'
                ? 'bg-neutral-800/80 border-neutral-600 text-white'
                : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Customer Account</span>
              </span>
              {accountType === 'customer' && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
            <p className="text-xs text-neutral-400">
              Browse products, purchase digital books, prompts & Notion templates, and access your personal downloads.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('creator')}
            className={`p-5 rounded-xl border text-left transition-all cursor-pointer ${
              accountType === 'creator'
                ? 'bg-indigo-950/30 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Creator / Seller Account</span>
              </span>
              {accountType === 'creator' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-xs text-neutral-400">
              Publish products, manage store inventory, analyze customer sales, and receive payouts directly to your bank.
            </p>
          </button>
        </div>
      </div>

      {/* Onboarding Form */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Creator Verification & KYC Onboarding</h2>
            <p className="text-xs text-neutral-400">
              Collects only information genuinely required for marketplace operation, copyright compliance, and payouts.
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>You need a Lumina account to attach your permanent creator identity.</span>
            </div>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer shrink-0"
            >
              Sign In / Up First
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Permanent Identity */}
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Permanent Identity (Firebase Auth UID)
            </label>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
              <span>{user ? user.uid : 'Requires authentication'}</span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-sans">
                <Lock className="w-3 h-3" /> Immutable Owner Key
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Display Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Rivera or DesignPro"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Creator / Business Name (Optional)
              </label>
              <input
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="e.g. Lumina Studios LLC"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Creator Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={creatorType}
                onChange={e => setCreatorType(e.target.value as CreatorType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              >
                {CREATOR_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Country of Residence / Tax Jurisdiction <span className="text-rose-400">*</span>
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors"
              >
                {COUNTRIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Creator Bio / Digital Specialty <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell customers what products you design (e.g. 'I produce field-tested ChatGPT prompt frameworks and Notion productivity dashboards for freelance engineers...')"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus:border-indigo-500 text-white text-xs outline-none transition-colors resize-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">Minimum 20 characters.</p>
          </div>

          {/* Profile Image */}
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Profile Avatar Image URL
            </label>
            <div className="flex items-center gap-3">
              <img
                src={profileImage}
                alt="Preview"
                className="w-10 h-10 rounded-full border border-neutral-700 object-cover shrink-0"
              />
              <input
                type="url"
                value={profileImage}
                onChange={e => setProfileImage(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* KYC / Compliance Fields */}
          <div className="pt-4 border-t border-neutral-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>KYC & Identity Verification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  ID Document Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={idType}
                  onChange={e => setIdType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
                >
                  <option value="national_id">National ID / Aadhaar / SSN</option>
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Government ID Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  placeholder="e.g. DL-9482-1082"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
                />
                <p className="text-[10px] text-neutral-500 mt-1">Stored masked; encrypted in compliance storage.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Tax Identification / PAN / VAT (Optional)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={e => setTaxId(e.target.value)}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>

          {/* Guidelines Agreement */}
          <div className="pt-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-neutral-700 bg-neutral-950 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-neutral-400">
                I agree to the <strong className="text-neutral-200">Lumina Marketplace Creator Agreement</strong>. I certify that all products I upload are 100% original, do not infringe third-party trademarks, and comply with the 10% platform marketplace fee structure.
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="text-xs text-neutral-500">
              Initial status: <span className="text-amber-400 font-semibold font-mono">Under Review</span>. Verification takes &lt; 24h.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <span>Submit Creator Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
