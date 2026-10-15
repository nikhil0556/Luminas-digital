import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  ShoppingBag,
  Download,
  Receipt,
  Settings,
  HelpCircle,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Mail,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Loader2,
  RefreshCw,
  Edit3,
  Save,
  AlertCircle,
  LogIn,
  Send,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { downloadDigitalProduct } from '../utils/fileDownloader';

type DashboardTab = 'profile' | 'purchases' | 'orders' | 'downloads' | 'settings' | 'support' | 'signout';

export const CustomerDashboardPage: React.FC = () => {
  const {
    user,
    userProfile,
    loading,
    userPurchases,
    userDownloads,
    userOrders,
    recordDownload,
    openAuthModal,
    logout,
    sendPasswordReset,
    sendVerification,
    updateUserProfileData,
    linkGoogleAccount,
    linkEmailPassword,
    unlinkProviderAccount,
    reloadUser,
    linkedProviders,
    canUnlink,
    deleteAccount,
    saveCustomerEnquiry,
    fetchCustomerEnquiries
  } = useAuth();

  const {
    products,
    formatPrice,
    currency,
    setCurrency,
    navigateToProduct,
    setActivePage,
    showToast,
    openPromptModal,
    clearUserSessionState,
    dashboardTab,
    setDashboardTab,
    settings
  } = useStore();

  const activeTab = dashboardTab || 'profile';
  const setActiveTab = (tab: DashboardTab) => setDashboardTab(tab);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(userProfile?.displayName || userProfile?.name || user?.displayName || '');
  const [profilePhoto, setProfilePhoto] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preferences State
  const [prefCurrency, setPrefCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>(
    userProfile?.preferences?.currency || currency || 'INR'
  );
  const [prefNewsletter, setPrefNewsletter] = useState<boolean>(
    userProfile?.preferences?.newsletterSubscribed ?? true
  );
  const [prefReceipts, setPrefReceipts] = useState<boolean>(
    userProfile?.preferences?.emailReceipts ?? true
  );
  const [prefUpdates, setPrefUpdates] = useState<boolean>(
    userProfile?.preferences?.productUpdates ?? true
  );
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  // Support Enquiry State
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [pastEnquiries, setPastEnquiries] = useState<any[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  // Sign Out Modal State
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Multi-Provider & Verification State
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [showLinkEmailModal, setShowLinkEmailModal] = useState(false);
  const [linkPassword, setLinkPassword] = useState('');
  const [isLinkingEmail, setIsLinkingEmail] = useState(false);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const [isSendingVerify, setIsSendingVerify] = useState(false);
  const [isReloadingVerify, setIsReloadingVerify] = useState(false);

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    const res = await linkGoogleAccount();
    setIsLinkingGoogle(false);
    if (res.success) {
      showToast('Google account linked successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to link Google account.', 'error');
    }
  };

  const handleLinkEmailPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkPassword || linkPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    setIsLinkingEmail(true);
    const res = await linkEmailPassword(linkPassword);
    setIsLinkingEmail(false);
    if (res.success) {
      setShowLinkEmailModal(false);
      setLinkPassword('');
      showToast('Email & password credentials linked successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to link email credentials.', 'error');
    }
  };

  const handleUnlinkProvider = async (providerId: string) => {
    if (!canUnlink) {
      showToast('Cannot unlink your only remaining sign-in method.', 'error');
      return;
    }
    setUnlinkingProvider(providerId);
    const res = await unlinkProviderAccount(providerId);
    setUnlinkingProvider(null);
    if (res.success) {
      showToast('Provider unlinked successfully.', 'info');
    } else {
      showToast(res.error || 'Failed to unlink provider.', 'error');
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
    setIsReloadingVerify(true);
    await reloadUser();
    setIsReloadingVerify(false);
    if (user?.emailVerified) {
      showToast('Email successfully verified!', 'success');
    } else {
      showToast('Email pending verification. Please click the link sent to your inbox.', 'info');
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await logout();
      clearUserSessionState();
      showToast('You have been safely signed out.', 'info');
      setActivePage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err?.message || 'Failed to sign out.', 'error');
    }
  };

  // Loading state while initializing Firebase Auth session
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-12 relative overflow-hidden backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold font-display text-white mb-2">Restoring Your Session</h2>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto font-mono">
            Synchronizing customer profile and digital vault from Firestore...
          </p>
        </div>
      </div>
    );
  }

  // If visitor is not authenticated, show welcoming prompt to sign in or create account
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-14 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/10">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
            Customer Dashboard
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Sign in to access your digital downloads, view verified purchase licenses, browse order receipts, and manage your account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Email or Google</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Purchased products list
  const purchasedProductIds = Array.from(
    new Set([
      ...(userProfile?.purchasedProductIds || []),
      ...userPurchases.map((p) => p.productId)
    ])
  );

  const purchasedProducts = products.filter((p) => purchasedProductIds.includes(p.id));

  const handleDownload = async (prod: any) => {
    setDownloadingId(prod.id);
    showToast(`Initiating verified download for "${prod.title}"...`, 'info');
    try {
      await recordDownload(prod.id, prod.title, prod.downloadFilename);
      await downloadDigitalProduct(prod, {
        userId: user.uid,
        email: user.email || undefined
      });
      showToast(`Successfully downloaded "${prod.title}"!`, 'success');
    } catch (err: any) {
      console.warn('Download error:', err);
      showToast(err?.message || 'Download error. Please verify purchase status.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenChatSupport = () => {
    const trigger = document.querySelector('#customer-chatbot-trigger button') as HTMLButtonElement | null;
    if (trigger) {
      trigger.click();
    } else {
      showToast('AI Concierge is ready in the bottom right corner!', 'info');
    }
  };

  // Save Profile Details
  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    setIsSavingProfile(true);
    const res = await updateUserProfileData({
      displayName: profileName.trim(),
      name: profileName.trim(),
      photoURL: profilePhoto.trim() || undefined
    });
    setIsSavingProfile(false);
    if (res.success) {
      setIsEditingProfile(false);
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update profile.', 'error');
    }
  };

  // Save Account Preferences
  const handleSavePreferences = async () => {
    setIsSavingPreferences(true);
    setCurrency(prefCurrency);
    const res = await updateUserProfileData({
      preferences: {
        currency: prefCurrency,
        newsletterSubscribed: prefNewsletter,
        emailReceipts: prefReceipts,
        productUpdates: prefUpdates
      }
    });
    setIsSavingPreferences(false);
    if (res.success) {
      showToast('Account settings and preferences saved!', 'success');
    } else {
      showToast(res.error || 'Failed to update preferences.', 'error');
    }
  };

  // Send Email Verification
  const handleSendVerification = async () => {
    showToast('Sending verification link...', 'info');
    const res = await sendVerification();
    if (res.success) {
      showToast(res.message || 'Verification link sent! Check your inbox.', 'success');
    } else {
      showToast(res.error || 'Failed to send verification email.', 'error');
    }
  };

  // Send Password Reset
  const handleSendPasswordReset = async () => {
    if (!user.email) return;
    showToast(`Sending reset instructions to ${user.email}...`, 'info');
    const res = await sendPasswordReset(user.email);
    if (res.success) {
      showToast(res.message || 'Password reset email sent!', 'success');
    } else {
      showToast(res.error || 'Failed to send reset link.', 'error');
    }
  };

  // Fetch support enquiries when support tab is viewed
  useEffect(() => {
    if (activeTab === 'support' && user) {
      setIsLoadingEnquiries(true);
      fetchCustomerEnquiries()
        .then((enqs) => setPastEnquiries(enqs))
        .catch((err) => console.warn('Could not load enquiries:', err))
        .finally(() => setIsLoadingEnquiries(false));
    }
  }, [activeTab, user]);

  // Submit Support Enquiry
  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryMessage.trim()) return;
    setIsSendingEnquiry(true);
    try {
      await saveCustomerEnquiry({
        id: `enq_${Date.now()}`,
        message: enquiryMessage.trim(),
        sender: 'user',
        timestamp: new Date().toISOString()
      });
      setEnquirySuccess(true);
      setEnquiryMessage('');
      showToast('Support ticket logged. Our team will assist shortly.', 'success');
      setTimeout(() => setEnquirySuccess(false), 4000);
      fetchCustomerEnquiries().then((enqs) => setPastEnquiries(enqs)).catch(() => {});
    } catch (err: any) {
      showToast('Failed to submit enquiry. Please try again.', 'error');
    } finally {
      setIsSendingEnquiry(false);
    }
  };

  // Execute Account Deletion
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE in all caps to confirm account deletion.');
      return;
    }

    const providerId = user.providerData[0]?.providerId || 'password';
    if (providerId === 'password' && !deletePassword) {
      setDeleteError('Please enter your current account password to authorize deletion.');
      return;
    }

    setIsDeleting(true);
    const res = await deleteAccount(deletePassword || undefined);
    setIsDeleting(false);

    if (res.success) {
      setIsDeleteModalOpen(false);
      clearUserSessionState();
      showToast('Your account and personal data have been permanently deleted.', 'info');
      setActivePage('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setDeleteError(res.error || 'Failed to delete account.');
    }
  };

  const primaryProvider = user.providerData[0]?.providerId || userProfile?.authProvider || 'password';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="bg-gradient-to-b from-[#131c31]/95 via-[#0e1526]/95 to-[#080d1a] border border-white/[0.09] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)]">
        {/* Subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-16 h-16 rounded-2xl border border-white/[0.15] object-cover shadow-xl ring-2 ring-indigo-500/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 text-white flex items-center justify-center text-xl font-bold font-display shadow-lg shadow-indigo-500/30 ring-2 ring-white/[0.1]">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                {user.displayName || userProfile?.name || 'Customer Account'}
              </h1>
              {userProfile?.role === 'admin' ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Admin
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Customer
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
            <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Firestore Verified
              </span>
              <span>•</span>
              <span className="text-indigo-400 font-semibold">
                {purchasedProducts.length} Purchases Active
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-200 text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
          >
            Browse Store
          </button>
          <button
            type="button"
            onClick={handleOpenChatSupport}
            className="px-4 py-2.5 rounded-xl btn-premium-primary text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Support</span>
          </button>
          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-white/[0.08] hover:border-rose-800/50 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Sign out of Lumina Digital"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs - Exactly 7 sections matching user specifications */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.08] scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'purchases'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Purchases</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
            {purchasedProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>My Orders</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
            {userOrders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('downloads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'downloads'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>My Downloads</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
            {userDownloads.length || purchasedProducts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'support'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 border border-indigo-400/30'
              : 'text-neutral-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('signout');
            setIsSignOutModalOpen(true);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ml-auto ${
            activeTab === 'signout'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span>7. Sign Out</span>
        </button>
      </div>

      {/* SECTION 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Customer Profile</h2>
                <p className="text-xs text-neutral-400">
                  Manage your personal identity, verification badges, and account metadata.
                </p>
              </div>

              {!isEditingProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setProfileName(userProfile?.displayName || userProfile?.name || user?.displayName || '');
                    setProfilePhoto(userProfile?.photoURL || user?.photoURL || '');
                    setIsEditingProfile(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-200 text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    disabled={isSavingProfile}
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl btn-premium-primary text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60 shadow-md"
                  >
                    {isSavingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSavingProfile}
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 text-xs font-medium border border-white/[0.08] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Profile Edit Form or Display Cards */}
            {isEditingProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-[#090d1c]/80 rounded-2xl border border-white/[0.08]">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f1528] border border-white/[0.12] text-xs text-white focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0f1528] border border-white/[0.12] text-xs text-white focus:outline-none focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1 backdrop-blur-md">
                <span className="text-neutral-500 font-mono">Full Display Name</span>
                <p className="text-sm font-semibold text-white truncate">
                  {user.displayName || userProfile?.displayName || userProfile?.name || 'Customer'}
                </p>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-mono">Email Address</span>
                  {user.emailVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Verify Email
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-white truncate">{user.email}</p>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-mono">Auth Provider</span>
                  {primaryProvider !== 'google.com' && (
                    <button
                      type="button"
                      onClick={handleLinkGoogle}
                      className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Link Google
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-white capitalize">
                  {primaryProvider === 'google.com' ? 'Google Account' : 'Email & Password'}
                </p>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1 backdrop-blur-md">
                <span className="text-neutral-500 font-mono">Firebase UID</span>
                <p className="text-xs font-mono text-neutral-300 truncate" title={user.uid}>
                  {user.uid}
                </p>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1 backdrop-blur-md">
                <span className="text-neutral-500 font-mono">Account Created</span>
                <p className="text-xs font-mono text-neutral-300">
                  {userProfile?.createdAt
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : 'Current Session'}
                </p>
              </div>

              <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.08] space-y-1 backdrop-blur-md">
                <span className="text-neutral-500 font-mono">Last Active</span>
                <p className="text-xs font-mono text-neutral-300">
                  {userProfile?.lastLoginAt
                    ? new Date(userProfile.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Online now'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-300">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Private user data is secured by Firebase Authentication UID Ownership rules.</span>
              </span>
              <span className="font-mono text-emerald-300 font-bold">Encrypted & Enforced</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MY PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Your Purchased Products</h2>
              <p className="text-xs text-neutral-400">
                Verified digital entitlements synced across your devices via Firestore.
              </p>
            </div>
            {purchasedProducts.length > 0 && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Lifetime Commercial License Active
              </span>
            )}
          </div>

          {purchasedProducts.length === 0 ? (
            <div className="bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] rounded-3xl p-10 text-center space-y-4 shadow-xl backdrop-blur-xl">
              <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">No purchases found yet</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  When you purchase e-books, AI prompt packs, or templates, they will securely appear here for immediate access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="px-5 py-2.5 rounded-xl btn-premium-primary text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                Explore Digital Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-gradient-to-b from-[#141c32]/85 via-[#0d1324]/90 to-[#070b16] border border-white/[0.09] hover:border-indigo-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_25px_-10px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_40px_-10px_rgba(99,102,241,0.2)] space-y-4 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-neutral-800"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20 uppercase">
                        {prod.category}
                      </span>
                      <h3
                        onClick={() => navigateToProduct(prod.id)}
                        className="font-bold text-sm text-white hover:text-indigo-400 transition-colors cursor-pointer truncate"
                      >
                        {prod.title}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-neutral-400 font-mono">
                      <span>Format: </span>
                      <span className="text-white font-semibold">{prod.format || 'ZIP Vault'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {prod.category === 'AI Prompts' && (
                        <button
                          type="button"
                          onClick={() => openPromptModal(prod)}
                          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Prompts</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={downloadingId === prod.id}
                        onClick={() => handleDownload(prod)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {downloadingId === prod.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Order History & Receipts</h2>
              <p className="text-xs text-neutral-400">
                Official transaction ledger and purchase invoices backed by Firestore records.
              </p>
            </div>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center space-y-4">
              <Receipt className="w-12 h-12 text-neutral-600 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">No orders on record yet</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  When you complete an order checkout, invoice details and line items will be archived here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((order, idx) => (
                <div
                  key={order.orderId || idx}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          Order #{order.orderId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                          {order.paymentStatus || 'Completed'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent Order'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-neutral-400">Payment: </span>
                      <span className="text-xs font-semibold text-neutral-200">
                        {order.paymentMethod || 'Razorpay / Verified Gateway'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.products.map((item, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between text-xs text-neutral-300">
                        <span>{item.title}</span>
                        <span className="font-mono text-neutral-400">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Total Paid</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {formatPrice(order.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: MY DOWNLOADS */}
      {activeTab === 'downloads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Download Center & History</h2>
              <p className="text-xs text-neutral-400">
                Instant access to re-download your digital assets, e-books, and prompts at any time.
              </p>
            </div>
          </div>

          {purchasedProducts.length === 0 && userDownloads.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-10 text-center space-y-4">
              <Download className="w-12 h-12 text-neutral-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No active downloads available</p>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Any files you purchase or unlock will be ready here with unmetered access.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchasedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{prod.title}</h4>
                      <p className="text-xs text-neutral-400 font-mono">
                        {prod.downloadFilename || `${prod.id}.zip`} • {prod.fileSize || 'Instant Delivery'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={downloadingId === prod.id}
                      onClick={() => handleDownload(prod)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {downloadingId === prod.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Package</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Account Settings & Preferences</h2>
              <p className="text-xs text-neutral-400">
                Configure notification preferences, currency defaults, and security management.
              </p>
            </div>

            {/* Currency & Notifications */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-2">
                  <label className="block text-xs font-semibold text-white">
                    Preferred Currency
                  </label>
                  <p className="text-[11px] text-neutral-400">
                    Product prices throughout the store will be displayed in this currency.
                  </p>
                  <select
                    value={prefCurrency}
                    onChange={(e) => setPrefCurrency(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>

                <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-3">
                  <span className="block text-xs font-semibold text-white">
                    Email Notifications
                  </span>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefNewsletter}
                        onChange={(e) => setPrefNewsletter(e.target.checked)}
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Lumina Digital Newsletter & Product Drops</span>
                    </label>

                    <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefReceipts}
                        onChange={(e) => setPrefReceipts(e.target.checked)}
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Transaction receipts and download links</span>
                    </label>

                    <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefUpdates}
                        onChange={(e) => setPrefUpdates(e.target.checked)}
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Prompt updates and new e-book editions</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingPreferences}
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {isSavingPreferences ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Preferences</span>
                </button>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="pt-6 border-t border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Email Verification Status</span>
              </h3>

              <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{user.email}</span>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                        <AlertCircle className="w-3 h-3" />
                        Pending Verification
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {user.emailVerified
                      ? 'Your email address is verified and active. You receive verified digital receipts and security alerts.'
                      : 'Please verify your email address to ensure seamless account recovery and receipt delivery.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {!user.emailVerified && (
                    <button
                      type="button"
                      disabled={isSendingVerify}
                      onClick={handleResendVerification}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isSendingVerify ? 'Sending Link...' : 'Resend Link'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isReloadingVerify}
                    onClick={handleCheckVerification}
                    className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
                    title="Refresh verification status"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReloadingVerify ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Linked Authentication Providers */}
            <div className="pt-6 border-t border-neutral-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Linked Authentication Providers</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  You can link multiple sign-in methods to your Lumina Digital account to sign in flexibly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Provider Card */}
                <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0">
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
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Google Sign-In</span>
                        {linkedProviders.includes('google.com') ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Linked
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400">
                            Not Linked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        1-click Google authentication
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    {linkedProviders.includes('google.com') ? (
                      <button
                        type="button"
                        disabled={!canUnlink || unlinkingProvider === 'google.com'}
                        onClick={() => handleUnlinkProvider('google.com')}
                        className={`text-xs font-semibold ${
                          canUnlink
                            ? 'text-rose-400 hover:text-rose-300 cursor-pointer'
                            : 'text-neutral-600 cursor-not-allowed'
                        }`}
                        title={canUnlink ? 'Unlink Google Account' : 'Cannot unlink only sign-in method'}
                      >
                        {unlinkingProvider === 'google.com' ? 'Unlinking...' : 'Unlink Provider'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isLinkingGoogle}
                        onClick={handleLinkGoogle}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isLinkingGoogle ? 'Connecting...' : 'Link Google'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Email & Password Provider Card */}
                <div className="p-4 bg-neutral-950/60 rounded-xl border border-neutral-800 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 text-indigo-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Email & Password</span>
                        {linkedProviders.includes('password') ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Linked
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-400">
                            Not Set
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Direct sign-in using email and secure password
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                    {linkedProviders.includes('password') ? (
                      <div className="flex items-center justify-between w-full">
                        <button
                          type="button"
                          onClick={handleSendPasswordReset}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
                        >
                          Change / Reset Password
                        </button>
                        {canUnlink && (
                          <button
                            type="button"
                            disabled={unlinkingProvider === 'password'}
                            onClick={() => handleUnlinkProvider('password')}
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer"
                          >
                            Unlink Password
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowLinkEmailModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Set Password & Link
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Set Password Modal for Linking */}
            {showLinkEmailModal && (
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/50 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Set a Password to Enable Email Sign-In</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowLinkEmailModal(false)}
                    className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300">
                  This will link password credentials to <strong>{user.email}</strong>, allowing you to sign in with either Google or your email and password.
                </p>
                <form onSubmit={handleLinkEmailPassword} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    required
                    placeholder="Enter password (min 6 characters)"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isLinkingEmail}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isLinkingEmail ? 'Linking...' : 'Save & Link'}
                  </button>
                </form>
              </div>
            )}

            {/* Permanent Account Deletion Zone */}
            <div className="pt-6 border-t border-rose-950/50 space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="text-sm font-bold">Danger Zone: Account Deletion</h3>
              </div>

              <div className="p-5 bg-rose-950/20 border border-rose-900/40 rounded-2xl space-y-3 text-xs">
                <p className="text-rose-200 leading-relaxed">
                  Deleting your account will permanently remove your login credentials, personal profile, and direct download access.
                </p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  <strong>Legal Compliance Notice:</strong> In compliance with applicable accounting and financial audit standards, anonymized transaction ledgers are retained for financial reconciliation while all personal identifying details (name, email, profile records, and auth credentials) are permanently deleted.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmText('');
                      setDeletePassword('');
                      setDeleteError(null);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 6: SUPPORT */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Customer Support & Help Desk</h2>
              <p className="text-xs text-neutral-400">
                Get autonomous instant help from our AI Concierge or contact our human support desk.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-white">AI Concierge Assistant</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Ask product questions, clarify prompt usage, verify formats, or get instant assistance 24/7.
                </p>
                <button
                  type="button"
                  onClick={handleOpenChatSupport}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Start Chat</span>
                </button>
              </div>

              <div className="p-5 bg-neutral-950/60 rounded-xl border border-neutral-800 space-y-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-white">Email Support Team</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Need custom assistance, license extensions, or order reconciliation? Email our support desk anytime.
                </p>
                <a
                  href={`mailto:${settings?.supportEmail || 'raj.nikhil0556@gmail.com'}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                >
                  <span>{settings?.supportEmail || 'raj.nikhil0556@gmail.com'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Direct Ticket Submission Form */}
            <div className="pt-4 border-t border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-white">Log a Customer Enquiry</h3>
              <form onSubmit={handleSubmitEnquiry} className="space-y-3">
                <textarea
                  rows={3}
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="Describe your issue or request..."
                  className="w-full p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500">
                    Logged to your user account and monitored by our staff.
                  </span>
                  <button
                    type="submit"
                    disabled={isSendingEnquiry || !enquiryMessage.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSendingEnquiry ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Submit Enquiry</span>
                  </button>
                </div>
              </form>
              {enquirySuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Your enquiry has been logged successfully. We will follow up via {user.email}!</span>
                </div>
              )}

              {/* Past Logged Enquiries */}
              {pastEnquiries.length > 0 && (
                <div className="pt-4 border-t border-neutral-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Your Past Support Tickets ({pastEnquiries.length})
                    </h4>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Monitored
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {pastEnquiries.map((enq, idx) => (
                      <div
                        key={enq.id || idx}
                        className="p-3 bg-neutral-950/50 border border-neutral-800 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px] text-neutral-400">
                          <span className="font-mono text-indigo-400">
                            Ticket #{enq.id?.slice(0, 10) || `ENQ-${idx + 1}`}
                          </span>
                          <span>
                            {enq.timestamp
                              ? new Date(enq.timestamp).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Recently'}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-200 line-clamp-2">{enq.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 7: SIGN OUT */}
      {activeTab === 'signout' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="max-w-xl mx-auto text-center space-y-5 py-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
              <LogOut className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white font-display">Sign Out of Lumina Digital</h2>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                Ready to end your current customer session? Your orders, prompt keys, and verified entitlements remain securely stored in Firestore and will load instantly when you log in again.
              </p>
            </div>

            <div className="p-4 bg-neutral-950/60 border border-neutral-800 rounded-xl text-xs text-neutral-300 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Current Session Account:</span>
                <span className="text-white font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Firebase User ID:</span>
                <span className="font-mono text-indigo-300 text-[11px]">{user.uid}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-400">Authentication Method:</span>
                <span className="text-emerald-400 font-medium capitalize">{primaryProvider.replace('.com', '')}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-all cursor-pointer"
              >
                Return to Profile
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 text-neutral-100 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-600/30">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Permanently Delete Lumina Account</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>

              {/* Data Model & Retention Notice */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-rose-950/40 border border-rose-900/50 rounded-xl space-y-2 text-rose-200">
                  <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Data that will be permanently destroyed:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-300 pl-1">
                    <li>Your customer profile (<code className="text-rose-300 text-[11px]">users/{user.uid}</code>)</li>
                    <li>Direct access to digital product downloads and prompt vault keys</li>
                    <li>Customer support enquiries and private chat history</li>
                    <li>Authentication credentials and account sign-in access</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-1.5 text-neutral-400">
                  <p className="font-semibold text-neutral-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Statutory Financial Retention Compliance:</span>
                  </p>
                  <p className="leading-relaxed text-[11px]">
                    In accordance with applicable accounting and financial audit regulations, financial order receipts are retained in the financial ledger, but all Personally Identifiable Information (name, email, and personal contact details) is irreversibly anonymized.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{deleteError}</span>
                </div>
              )}

              {primaryProvider === 'password' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-neutral-300">
                    Confirm Account Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your current account password"
                    className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {primaryProvider === 'google.com' && (
                <div className="p-3 bg-neutral-800/60 border border-neutral-700 rounded-xl text-xs text-neutral-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  <span>Google Account: You will be prompted to re-authenticate with Google upon confirmation.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sign Out Confirmation Modal */}
      <AnimatePresence>
        {isSignOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 text-neutral-100 shadow-2xl relative"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-600/30">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sign Out of Lumina Digital</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Are you sure you want to end your current session?
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl text-xs text-neutral-300 leading-relaxed">
                Your purchased e-books, AI prompt vaults, and order receipts are securely bound to your Firebase Authentication UID (<code className="text-indigo-300">{user.uid.slice(0, 10)}...</code>) and will be instantly available whenever you sign in again from any device.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignOutModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsSignOutModalOpen(false);
                    await handleSignOut();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Yes, Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
