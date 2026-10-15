import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  TrendingUp,
  DollarSign,
  CreditCard,
  Users,
  BarChart3,
  User,
  Settings,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  Download,
  Lock,
  Eye,
  RefreshCw,
  Copy,
  Check,
  Send,
  Building2,
  Globe,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCreator } from '../context/CreatorContext';
import { useStore } from '../context/StoreContext';
import {
  CreatorDashboardTab,
  CreatorStatus,
  Product,
  ProductCategory,
  ProductFormat,
  CreatorPayoutSettings
} from '../types';
import { ProductsSection } from '../components/creator/ProductsSection';
import { ProductUploadForm } from '../components/creator/ProductUploadForm';
import { ProductPreviewModal } from '../components/creator/ProductPreviewModal';
import { ProductVersionModal } from '../components/creator/ProductVersionModal';
import { SafeDeleteModal } from '../components/creator/SafeDeleteModal';

export const CreatorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    creatorProfile,
    isCreator,
    isVerified,
    canSell,
    loadingCreator,
    activeCreatorTab,
    setActiveCreatorTab,
    creatorProducts,
    creatorSales,
    creatorPayouts,
    editingProductId,
    setEditingProductId,
    updateCreatorProfile,
    updatePayoutSettings,
    requestPayout,
    createCreatorProduct,
    updateCreatorProduct,
    duplicateProduct,
    submitProductForReview,
    unpublishProduct,
    publishProduct,
    updateProductVersion,
    simulateModerationDecision,
    deleteCreatorProduct,
    simulateStatusChange,
    submitVerification
  } = useCreator();

  const {
    navigateToProduct,
    navigateToBecomeCreator,
    navigateToDashboard,
    showToast
  } = useStore();

  // Modals state for product lifecycle management
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [versionProduct, setVersionProduct] = useState<Product | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async (productId: string) => {
    setIsDeleting(true);
    const res = await deleteCreatorProduct(productId);
    setIsDeleting(false);
    setDeleteProductTarget(null);

    if (res.success) {
      if (res.archived) {
        showToast(
          res.message || 'Product safely unpublished & archived to protect past buyers.',
          'info'
        );
      } else {
        showToast(res.message || 'Product deleted successfully.', 'success');
      }
    } else {
      showToast(res.error || 'Failed to delete product.', 'error');
    }
  };

  // If not a registered creator, route to onboarding
  if (!loadingCreator && !isCreator) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Creator Account Required</h1>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
          You are currently signed in with a standard customer account. Complete creator verification to sell digital assets.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={navigateToBecomeCreator}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <span>Complete Creator Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => navigateToDashboard('profile')}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
          >
            Customer Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active status color helper
  const getStatusBadge = (status: CreatorStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Verified Seller</span>
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Under Review</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending Verification</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 font-mono">
            <Ban className="w-3.5 h-3.5" />
            <span>Suspended</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Application Rejected</span>
          </span>
        );
    }
  };

  const navItems: { id: CreatorDashboardTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package, count: creatorProducts.length },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'sales', label: 'Sales', icon: TrendingUp, count: creatorSales.length },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'payouts', label: 'Payouts', icon: CreditCard, count: creatorPayouts.length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payment-setup', label: 'Payment Setup', icon: Settings },
    { id: 'security', label: 'Security & KYC', icon: ShieldCheck },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Creator Header Bar */}
      <div className="rounded-3xl border border-white/[0.09] bg-gradient-to-b from-[#131c31]/95 via-[#0e1526]/95 to-[#080d1a] backdrop-blur-2xl p-6 sm:p-7 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={
              creatorProfile?.profileImage ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
            }
            alt="Creator Avatar"
            className="w-14 h-14 rounded-2xl border border-white/[0.15] object-cover shrink-0 shadow-lg ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                {creatorProfile?.businessName || creatorProfile?.displayName || 'Creator Studio'}
              </h1>
              {creatorProfile && getStatusBadge(creatorProfile.accountStatus)}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
              <span className="font-mono text-neutral-300">
                UID: {creatorProfile?.creatorUid.slice(0, 10)}...
              </span>
              <span>•</span>
              <span>{creatorProfile?.creatorType}</span>
              <span>•</span>
              <span>{creatorProfile?.country}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto relative z-10">
          <button
            type="button"
            onClick={() => setActiveCreatorTab('add-product')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl btn-premium-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          <button
            type="button"
            onClick={() => navigateToDashboard('profile')}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 text-xs font-semibold border border-white/[0.08] transition-colors cursor-pointer"
            title="Switch to customer purchases & downloads"
          >
            Customer View
          </button>
        </div>
      </div>

      {/* Selling Guard Warning Banner if verification is incomplete */}
      {!canSell && creatorProfile && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Marketplace Selling Permissions Inactive</p>
              <p className="text-amber-300/80 mt-0.5">
                {creatorProfile.accountStatus !== 'verified'
                  ? `Your account status is currently "${creatorProfile.accountStatus.replace('_', ' ')}". Marketplace compliance requires KYC verification before products are shown live to buyers.`
                  : 'Please configure your bank or payout remittance method in Payment Setup to enable live marketplace selling.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {creatorProfile.accountStatus !== 'verified' ? (
              <button
                type="button"
                onClick={() => setActiveCreatorTab('security')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-colors cursor-pointer"
              >
                Review KYC Status
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveCreatorTab('payment-setup')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-colors cursor-pointer"
              >
                Configure Payout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Dashboard Layout: Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c1224]/80 backdrop-blur-2xl p-3 sticky top-20 space-y-1 shadow-lg">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Creator Navigation
            </p>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeCreatorTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveCreatorTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Balance Preview Card in Sidebar */}
            <div className="mt-4 pt-4 border-t border-white/[0.08] px-2 pb-2">
              <div className="p-3 rounded-xl bg-[#070b16]/80 border border-white/[0.08] backdrop-blur-md">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 block mb-0.5">
                  Available Payout
                </span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {creatorProfile?.payoutSettings.currency || 'INR'} {creatorProfile?.balanceAvailable.toLocaleString() || '0'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveCreatorTab('payouts')}
                  className="mt-2 w-full text-center text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Withdraw Funds →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCreatorTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {activeCreatorTab === 'overview' && (
                <OverviewSection
                  creatorProfile={creatorProfile}
                  creatorProducts={creatorProducts}
                  creatorSales={creatorSales}
                  setActiveCreatorTab={setActiveCreatorTab}
                  canSell={canSell}
                />
              )}

              {activeCreatorTab === 'products' && (
                <ProductsSection
                  creatorProducts={creatorProducts}
                  canSell={canSell}
                  setActiveCreatorTab={setActiveCreatorTab}
                  updateCreatorProduct={updateCreatorProduct}
                  deleteCreatorProduct={deleteCreatorProduct}
                  duplicateProduct={duplicateProduct}
                  submitProductForReview={submitProductForReview}
                  unpublishProduct={unpublishProduct}
                  publishProduct={publishProduct}
                  simulateModerationDecision={simulateModerationDecision}
                  navigateToProduct={navigateToProduct}
                  onOpenPreview={(prod) => setPreviewProduct(prod)}
                  onOpenEdit={(prod) => {
                    setEditingProductId(prod.id);
                    setActiveCreatorTab('add-product');
                  }}
                  onOpenVersionModal={(prod) => setVersionProduct(prod)}
                  onOpenDeleteModal={(prod) => setDeleteProductTarget(prod)}
                  showToast={showToast}
                />
              )}

              {activeCreatorTab === 'add-product' && (
                <ProductUploadForm
                  initialProduct={editingProductId ? creatorProducts.find(p => p.id === editingProductId) : null}
                  onSuccess={() => {
                    setEditingProductId(null);
                    setActiveCreatorTab('products');
                  }}
                  onCancel={() => {
                    setEditingProductId(null);
                    setActiveCreatorTab('products');
                  }}
                  showToast={showToast}
                />
              )}

              {activeCreatorTab === 'sales' && (
                <SalesSection creatorSales={creatorSales} currency={creatorProfile?.payoutSettings.currency || 'INR'} />
              )}

              {activeCreatorTab === 'earnings' && (
                <EarningsSection creatorProfile={creatorProfile} creatorSales={creatorSales} />
              )}

              {activeCreatorTab === 'payouts' && (
                <PayoutsSection
                  creatorProfile={creatorProfile}
                  creatorPayouts={creatorPayouts}
                  requestPayout={requestPayout}
                  setActiveCreatorTab={setActiveCreatorTab}
                  showToast={showToast}
                />
              )}

              {activeCreatorTab === 'customers' && (
                <CustomersSection creatorSales={creatorSales} />
              )}

              {activeCreatorTab === 'analytics' && (
                <AnalyticsSection creatorProfile={creatorProfile} creatorProducts={creatorProducts} />
              )}

              {activeCreatorTab === 'profile' && (
                <ProfileSection
                  creatorProfile={creatorProfile}
                  updateCreatorProfile={updateCreatorProfile}
                  showToast={showToast}
                />
              )}

              {activeCreatorTab === 'payment-setup' && (
                <PaymentSetupSection
                  creatorProfile={creatorProfile}
                  updatePayoutSettings={updatePayoutSettings}
                  showToast={showToast}
                />
              )}

              {activeCreatorTab === 'security' && (
                <SecuritySection
                  creatorProfile={creatorProfile}
                  simulateStatusChange={simulateStatusChange}
                  submitVerification={submitVerification}
                  showToast={showToast}
                />
              )}

              {activeCreatorTab === 'support' && (
                <SupportSection showToast={showToast} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Product Lifecycle Modals */}
      <ProductPreviewModal
        isOpen={Boolean(previewProduct)}
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
        onEdit={(prod) => {
          setEditingProductId(prod.id);
          setActiveCreatorTab('add-product');
        }}
        onSubmitForReview={async (prodId) => {
          const res = await submitProductForReview(prodId);
          if (res.success) {
            showToast('Product submitted for review!', 'success');
          } else {
            showToast(res.error || 'Failed to submit.', 'error');
          }
        }}
      />

      <ProductVersionModal
        isOpen={Boolean(versionProduct)}
        product={versionProduct}
        onClose={() => setVersionProduct(null)}
        onUpdateVersion={updateProductVersion}
        showToast={showToast}
      />

      <SafeDeleteModal
        isOpen={Boolean(deleteProductTarget)}
        product={deleteProductTarget}
        onClose={() => setDeleteProductTarget(null)}
        onConfirmDelete={handleConfirmDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
};

/* =========================================================================
   1. OVERVIEW SECTION
========================================================================= */
interface OverviewSectionProps {
  creatorProfile: any;
  creatorProducts: Product[];
  creatorSales: any[];
  setActiveCreatorTab: (tab: CreatorDashboardTab) => void;
  canSell: boolean;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  creatorProfile,
  creatorProducts,
  creatorSales,
  setActiveCreatorTab,
  canSell
}) => {
  const currency = creatorProfile?.payoutSettings.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141c32]/85 via-[#0d1324]/90 to-[#070b16] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_25px_-10px_rgba(0,0,0,0.7)] hover:border-indigo-500/35 transition-all duration-300 hover:-translate-y-1">
          <span className="text-xs text-neutral-400 font-medium">Total Gross Sales</span>
          <p className="text-2xl font-bold text-white mt-1 font-mono">
            {currency} {creatorProfile?.totalSales.toLocaleString() || 0}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">From marketplace purchases</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141c32]/85 via-[#0d1324]/90 to-[#070b16] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_25px_-10px_rgba(0,0,0,0.7)] hover:border-emerald-500/35 transition-all duration-300 hover:-translate-y-1">
          <span className="text-xs text-neutral-400 font-medium">Net Creator Earnings (90%)</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
            {currency} {creatorProfile?.totalEarnings.toLocaleString() || 0}
          </p>
          <span className="text-[11px] text-emerald-500/80 mt-1 block">Platform fee: 10%</span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141c32]/85 via-[#0d1324]/90 to-[#070b16] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_25px_-10px_rgba(0,0,0,0.7)] hover:border-indigo-500/35 transition-all duration-300 hover:-translate-y-1">
          <span className="text-xs text-neutral-400 font-medium">Available for Payout</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">
            {currency} {creatorProfile?.balanceAvailable.toLocaleString() || 0}
          </p>
          <button
            type="button"
            onClick={() => setActiveCreatorTab('payouts')}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-1 font-semibold block cursor-pointer"
          >
            Request Payout →
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-b from-[#141c32]/85 via-[#0d1324]/90 to-[#070b16] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_25px_-10px_rgba(0,0,0,0.7)] hover:border-purple-500/35 transition-all duration-300 hover:-translate-y-1">
          <span className="text-xs text-neutral-400 font-medium">Published Products</span>
          <p className="text-2xl font-bold text-purple-400 mt-1 font-mono">
            {creatorProducts.filter(p => p.status === 'published').length}
          </p>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {creatorProducts.filter(p => p.status === 'draft').length} drafts
          </span>
        </div>
      </div>

      {/* Quick Launch / Onboarding Action Banner */}
      <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-r from-indigo-950/60 via-[#0e1428]/80 to-purple-950/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Marketplace Creator Actions</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            {canSell
              ? 'Your creator account is fully verified. You can publish new digital books, prompts, and Notion systems directly.'
              : 'Complete your KYC verification and payout setup to publish live digital assets.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveCreatorTab('add-product')}
            className="px-4 py-2 rounded-xl btn-premium-primary text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Asset</span>
          </button>
        </div>
      </div>

      {/* Recent Sales Activity */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Recent Customer Orders</span>
          </h2>
          <button
            type="button"
            onClick={() => setActiveCreatorTab('sales')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View All ({creatorSales.length})
          </button>
        </div>

        {creatorSales.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No sales recorded yet. Once customers purchase your items, transactions appear here instantly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3 text-right">Net Earned</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {creatorSales.slice(0, 5).map(sale => (
                  <tr key={sale.orderId} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 font-mono text-neutral-300">{sale.orderId}</td>
                    <td className="py-3 font-medium text-white max-w-[200px] truncate">{sale.productTitle}</td>
                    <td className="py-3 text-neutral-400">{sale.customerName}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      +{currency} {sale.netEarnings}
                    </td>
                    <td className="py-3 text-right text-neutral-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   4. SALES SECTION
========================================================================= */
const SalesSection: React.FC<{ creatorSales: any[]; currency: string }> = ({ creatorSales, currency }) => {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="mb-6 pb-4 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Sales & Customer Transactions</h2>
          <p className="text-xs text-neutral-400">Complete itemized ledger of sales and net creator earnings.</p>
        </div>
        <span className="text-xs font-mono font-bold text-indigo-400">
          {creatorSales.length} Total Transactions
        </span>
      </div>

      {creatorSales.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 text-xs">
          No transactions yet. Sales will populate automatically as buyers check out.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Product Title</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3 text-right">Gross</th>
                <th className="pb-3 text-right">Lumina Fee (10%)</th>
                <th className="pb-3 text-right">Net Creator</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {creatorSales.map(sale => (
                <tr key={sale.orderId} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="py-3 text-neutral-300">{sale.orderId}</td>
                  <td className="py-3 font-sans font-medium text-white max-w-[200px] truncate">
                    {sale.productTitle}
                  </td>
                  <td className="py-3 font-sans text-neutral-400">
                    <div>{sale.customerName}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{sale.customerEmailMasked}</div>
                  </td>
                  <td className="py-3 text-right text-neutral-300">
                    {currency} {sale.grossAmount}
                  </td>
                  <td className="py-3 text-right text-neutral-500">
                    -{currency} {sale.platformFee}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">
                    +{currency} {sale.netEarnings}
                  </td>
                  <td className="py-3 text-right text-neutral-500 font-sans text-[11px]">
                    {new Date(sale.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   5. EARNINGS SECTION
========================================================================= */
const EarningsSection: React.FC<{ creatorProfile: any; creatorSales: any[] }> = ({ creatorProfile, creatorSales }) => {
  const currency = creatorProfile?.payoutSettings.currency || 'INR';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Earnings & Revenue Share</h2>
          <p className="text-xs text-neutral-400">
            Lumina operates on a transparent 90/10 model: 90% goes directly to you, 10% covers platform hosting and processing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] text-neutral-400">Lifetime Gross Sales</span>
            <p className="text-xl font-bold text-white font-mono mt-1">
              {currency} {creatorProfile?.totalSales.toLocaleString() || 0}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] text-neutral-400">Platform Fees (10%)</span>
            <p className="text-xl font-bold text-neutral-400 font-mono mt-1">
              {currency} {((creatorProfile?.totalSales || 0) * 0.1).toFixed(1)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] text-neutral-400">Net Creator Earnings</span>
            <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {currency} {creatorProfile?.totalEarnings.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* Revenue Balance Bar */}
        <div className="p-4 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-neutral-300 font-medium">Funds Settlement Status</span>
            <span className="font-mono text-neutral-400">
              {creatorProfile?.balanceAvailable.toLocaleString()} Available / {creatorProfile?.balancePending.toLocaleString()} Pending
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden flex">
            <div className="h-full bg-emerald-500" style={{ width: '80%' }} />
            <div className="h-full bg-amber-500" style={{ width: '20%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Settled & Ready
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> In Clearing (48h)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   6. PAYOUTS SECTION
========================================================================= */
interface PayoutsSectionProps {
  creatorProfile: any;
  creatorPayouts: any[];
  requestPayout: (amount: number) => Promise<any>;
  setActiveCreatorTab: (tab: CreatorDashboardTab) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PayoutsSection: React.FC<PayoutsSectionProps> = ({
  creatorProfile,
  creatorPayouts,
  requestPayout,
  setActiveCreatorTab,
  showToast
}) => {
  const currency = creatorProfile?.payoutSettings.currency || 'INR';
  const available = creatorProfile?.balanceAvailable || 0;
  const threshold = creatorProfile?.payoutSettings.minimumPayoutThreshold || 1000;
  const isConfigured = creatorProfile?.payoutSettings.isConfigured;

  const [withdrawAmount, setWithdrawAmount] = useState<number>(available);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);
    const res = await requestPayout(withdrawAmount);
    setIsRequesting(false);

    if (res.success) {
      showToast('Payout request submitted successfully! Processing initiated.', 'success');
    } else {
      showToast(res.error || 'Failed to request payout.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Available Balance</span>
            <p className="text-3xl font-extrabold text-white font-mono mt-1">
              {currency} {available.toLocaleString()}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Minimum withdrawal: {currency} {threshold.toLocaleString()}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400">Payout Destination:</span>
            <span className="font-mono text-indigo-300">
              {isConfigured ? creatorProfile?.payoutSettings.accountNumberOrEmail : 'Not configured'}
            </span>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60">
          <h3 className="text-sm font-bold text-white mb-2">Request Withdrawal</h3>
          {!isConfigured ? (
            <div className="text-xs text-neutral-400 py-4">
              <p className="mb-3">You must configure your payment destination before requesting a payout.</p>
              <button
                type="button"
                onClick={() => setActiveCreatorTab('payment-setup')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
              >
                Go to Payment Setup
              </button>
            </div>
          ) : (
            <form onSubmit={handleRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Amount to Withdraw ({currency})</label>
                <input
                  type="number"
                  min={threshold}
                  max={available}
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isRequesting || available < threshold}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {available < threshold ? `Below Minimum (${currency} ${threshold})` : 'Request Payout Now'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Payout History */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h3 className="text-sm font-bold text-white mb-4">Payout History</h3>
        {creatorPayouts.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            No past withdrawals recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase tracking-wider text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="pb-3">Payout ID</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {creatorPayouts.map(p => (
                  <tr key={p.payoutId} className="hover:bg-neutral-800/30">
                    <td className="py-3 text-neutral-300">{p.payoutId}</td>
                    <td className="py-3 text-white font-bold">
                      {p.currency} {p.amount.toLocaleString()}
                    </td>
                    <td className="py-3 capitalize text-neutral-400 font-sans">{p.payoutMethod.replace('_', ' ')}</td>
                    <td className="py-3 text-neutral-400">{p.destination}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] capitalize bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-neutral-500 font-sans text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   7. CUSTOMERS SECTION
========================================================================= */
const CustomersSection: React.FC<{ creatorSales: any[] }> = ({ creatorSales }) => {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-lg font-bold text-white">Your Marketplace Customers</h2>
        <p className="text-xs text-neutral-400">Buyers who have purchased and unlocked your digital assets.</p>
      </div>

      {creatorSales.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 text-xs">
          No customer records yet. As buyers purchase your products, their anonymized order profiles will show here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {creatorSales.map((sale, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-white">{sale.customerName}</span>
                <span className="text-[10px] font-mono text-indigo-400">Verified Buyer</span>
              </div>
              <p className="text-xs text-neutral-400 mb-2">Purchased: {sale.productTitle}</p>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80">
                <span>{sale.customerEmailMasked}</span>
                <span>{new Date(sale.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   8. ANALYTICS SECTION
========================================================================= */
const AnalyticsSection: React.FC<{ creatorProfile: any; creatorProducts: Product[] }> = ({
  creatorProfile,
  creatorProducts
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Marketplace Performance & Analytics</h2>
          <p className="text-xs text-neutral-400">Key metrics on traffic conversion, discovery, and product sales.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400">Overall Store Conversion</span>
            <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">4.8%</p>
            <span className="text-[11px] text-neutral-500">Above marketplace avg (3.2%)</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400">Average Order Value (AOV)</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">₹780</p>
            <span className="text-[11px] text-neutral-500">Across e-books & prompt vaults</span>
          </div>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-xs text-neutral-400">Customer Satisfaction</span>
            <p className="text-2xl font-bold text-amber-400 mt-1 font-mono">4.9 / 5.0</p>
            <span className="text-[11px] text-neutral-500">Based on verified reviews</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Product Portfolio Distribution
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-neutral-300">
              <span>Active Catalog Products</span>
              <span className="font-mono font-bold text-white">{creatorProducts.length} items</span>
            </div>
            <div className="flex justify-between text-neutral-300">
              <span>Primary Category</span>
              <span className="font-mono text-indigo-400">{creatorProfile?.creatorType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   9. PROFILE SECTION
========================================================================= */
interface ProfileSectionProps {
  creatorProfile: any;
  updateCreatorProfile: (data: any) => Promise<any>;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ creatorProfile, updateCreatorProfile, showToast }) => {
  const [displayName, setDisplayName] = useState(creatorProfile?.displayName || '');
  const [businessName, setBusinessName] = useState(creatorProfile?.businessName || '');
  const [bio, setBio] = useState(creatorProfile?.bio || '');
  const [profileImage, setProfileImage] = useState(creatorProfile?.profileImage || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateCreatorProfile({
      displayName,
      businessName,
      bio,
      profileImage
    });
    setIsSaving(false);
    if (res.success) {
      showToast('Creator profile updated successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update profile.', 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
      <div className="mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-lg font-bold text-white">Public Creator Profile</h2>
        <p className="text-xs text-neutral-400">
          Information visible to marketplace buyers on your digital storefront.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Studio / Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">Profile Avatar URL</label>
          <div className="flex items-center gap-3">
            <img
              src={profileImage}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-neutral-700 object-cover shrink-0"
            />
            <input
              type="url"
              value={profileImage}
              onChange={e => setProfileImage(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">Bio / Description</label>
          <textarea
            rows={3}
            value={bio}
            onChange={e => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none resize-none"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

/* =========================================================================
   10. PAYMENT SETUP SECTION
========================================================================= */
interface PaymentSetupProps {
  creatorProfile: any;
  updatePayoutSettings: (data: CreatorPayoutSettings) => Promise<any>;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const PaymentSetupSection: React.FC<PaymentSetupProps> = ({
  creatorProfile,
  updatePayoutSettings,
  showToast
}) => {
  const current = creatorProfile?.payoutSettings || {};
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'paypal' | 'stripe_connect' | 'upi'>(
    current.payoutMethod || 'bank_transfer'
  );
  const [accountHolderName, setAccountHolderName] = useState(current.accountHolderName || '');
  const [accountNumberOrEmail, setAccountNumberOrEmail] = useState(current.accountNumberOrEmail || '');
  const [bankNameOrIfsc, setBankNameOrIfsc] = useState(current.bankNameOrIfsc || '');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>(current.currency || 'INR');
  const [minimumPayoutThreshold, setMinimumPayoutThreshold] = useState<number>(
    current.minimumPayoutThreshold || 1000
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updatePayoutSettings({
      payoutMethod,
      accountHolderName,
      accountNumberOrEmail,
      bankNameOrIfsc,
      currency,
      minimumPayoutThreshold,
      isConfigured: true
    });
    setIsSaving(false);

    if (res.success) {
      showToast('Payout method configured successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update payout settings.', 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
      <div className="mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-lg font-bold text-white">Payment & Payout Setup</h2>
        <p className="text-xs text-neutral-400">
          Configure how and where Lumina remits your 90% product sales earnings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Payout Gateway Method</label>
            <select
              value={payoutMethod}
              onChange={e => setPayoutMethod(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            >
              <option value="bank_transfer">Direct Bank Transfer (NEFT/RTGS/Wire)</option>
              <option value="upi">UPI ID (Instant Remittance for India)</option>
              <option value="stripe_connect">Stripe Connect</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">Settlement Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Account Beneficiary Full Legal Name
            </label>
            <input
              type="text"
              required
              value={accountHolderName}
              onChange={e => setAccountHolderName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              {payoutMethod === 'upi'
                ? 'UPI Virtual Payment Address (VPA)'
                : payoutMethod === 'paypal'
                ? 'PayPal Account Email'
                : 'Account Number / IBAN'}
            </label>
            <input
              type="text"
              required
              value={accountNumberOrEmail}
              onChange={e => setAccountNumberOrEmail(e.target.value)}
              placeholder={
                payoutMethod === 'upi' ? 'alex@okaxis' : payoutMethod === 'paypal' ? 'alex@gmail.com' : 'Account number'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            />
          </div>
        </div>

        {payoutMethod === 'bank_transfer' && (
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Bank Name & Routing / IFSC / SWIFT Code
            </label>
            <input
              type="text"
              value={bankNameOrIfsc}
              onChange={e => setBankNameOrIfsc(e.target.value)}
              placeholder="e.g. HDFC Bank, IFSC: HDFC0001234"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1.5">
            Minimum Automatic Payout Threshold ({currency})
          </label>
          <input
            type="number"
            min="100"
            value={minimumPayoutThreshold}
            onChange={e => setMinimumPayoutThreshold(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
          />
        </div>

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-semibold cursor-pointer transition-colors shadow-sm"
          >
            Save Payout Settings
          </button>
        </div>
      </form>
    </div>
  );
};

/* =========================================================================
   11. SECURITY & KYC SECTION
========================================================================= */
interface SecuritySectionProps {
  creatorProfile: any;
  simulateStatusChange: (status: CreatorStatus) => Promise<void>;
  submitVerification: (data: any) => Promise<any>;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  creatorProfile,
  simulateStatusChange,
  showToast
}) => {
  const verification = creatorProfile?.verificationStatus;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-lg font-bold text-white">Identity & Compliance Security</h2>
          <p className="text-xs text-neutral-400">
            Immutable Firebase Authentication credentials, KYC compliance, and account verification status.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
              Permanent Creator Identity
            </span>
            <div className="flex items-center justify-between mt-1 text-xs font-mono text-neutral-300">
              <span>{creatorProfile?.creatorUid}</span>
              <span className="text-emerald-400 font-sans text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Firebase UID
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-neutral-400">Government ID</span>
              <p className="text-xs font-semibold text-white mt-1">
                {verification?.idNumberMasked || 'Submitted for Review'}
              </p>
              <span className="text-[10px] text-neutral-500 capitalize">{verification?.idType || 'National ID'}</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-neutral-400">Tax ID / PAN</span>
              <p className="text-xs font-semibold text-white mt-1">
                {verification?.taxIdMasked || 'Provided in KYC'}
              </p>
              <span className="text-[10px] text-neutral-500">Encrypted compliance record</span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-[11px] text-neutral-400">Current Status</span>
              <p className="text-xs font-semibold text-white mt-1 capitalize">
                {creatorProfile?.accountStatus.replace('_', ' ')}
              </p>
              <span className="text-[10px] text-neutral-500">Marketplace Guard Active</span>
            </div>
          </div>
        </div>

        {/* Sandbox Simulation Tool */}
        <div className="mt-8 pt-6 border-t border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sandbox Reviewer Controller (Simulate All 5 Creator Statuses)</span>
            </span>
            <span className="text-[11px] text-neutral-500">Verify UI security enforcement</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['pending', 'under_review', 'verified', 'suspended', 'rejected'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={async () => {
                  await simulateStatusChange(st);
                  showToast(`Creator status updated to: ${st}`, 'info');
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer capitalize text-center ${
                  creatorProfile?.accountStatus === st
                    ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                    : 'bg-neutral-800/60 text-neutral-400 border-neutral-700 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   12. SUPPORT SECTION
========================================================================= */
const SupportSection: React.FC<{ showToast: (msg: string, type: 'success' | 'info' | 'error') => void }> = ({
  showToast
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Creator priority support ticket submitted! Our team will reply within 4 hours.', 'success');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8">
      <div className="mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-lg font-bold text-white">Creator Priority Concierge & Support</h2>
        <p className="text-xs text-neutral-400">
          Direct assistance with KYC verification, payout remittances, and marketplace curation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Creator FAQs & Guidelines
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <p className="font-semibold text-white mb-1">What is the Lumina revenue split?</p>
              <p className="text-neutral-400">
                Creators receive 90% of every sale. Lumina deducts a 10% platform fee covering merchant processing, fast digital delivery, and 24/7 customer support.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <p className="font-semibold text-white mb-1">How fast are payouts processed?</p>
              <p className="text-neutral-400">
                Approved withdrawal requests are initiated within 24 to 48 business hours via your selected payout gateway.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <p className="font-semibold text-white mb-1">Why is my product in draft mode?</p>
              <p className="text-neutral-400">
                Marketplace security requires verified creator KYC status and payment configuration before items appear live to public buyers.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            Submit Creator Ticket
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Question regarding KYC or payout remittance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your enquiry..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
