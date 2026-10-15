import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  Edit,
  Tag,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  ArrowRight,
  Settings,
  Shield,
  ShieldAlert,
  RefreshCw,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { ModerationQueuePanel } from '../components/admin/ModerationQueuePanel';
import { AuditLogsPanel } from '../components/admin/AuditLogsPanel';
import { ReconciliationPanel } from '../components/admin/ReconciliationPanel';

export const AdminPage: React.FC = () => {
  const { user, userProfile } = useAuth();
  const {
    products,
    orders,
    coupons,
    newsletterSubscribers,
    formatPrice,
    addProduct,
    updateProduct,
    deleteProduct,
    showToast,
    setActivePage
  } = useStore();

  // Server-Side Owner Verification State via Firebase Admin SDK
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isAuthorizedOwner, setIsAuthorizedOwner] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [ownerSession, setOwnerSession] = useState<{
    uid: string;
    email: string;
    supportEmail: string;
    ownerEmail: string;
    verifiedAt: string;
  } | null>(null);
  const [adminDataReady, setAdminDataReady] = useState<boolean>(false);

  // Authenticate owner with /api/admin/me before accessing or rendering data
  useEffect(() => {
    let isMounted = true;

    async function verifyOwnerWithBackend() {
      if (!user) {
        if (isMounted) {
          setIsVerifying(false);
          setIsAuthorizedOwner(false);
          setAdminDataReady(false);
          setAuthError('Authentication required. Please sign in with your verified store owner account.');
        }
        return;
      }

      setIsVerifying(true);
      setAuthError(null);

      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/admin/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.ok && data.authorized && data.role === 'owner') {
          setIsAuthorizedOwner(true);
          setOwnerSession(data);
          // Unlock and load data ONLY after server authorization check succeeds
          setAdminDataReady(true);
          setIsVerifying(false);
        } else {
          setIsAuthorizedOwner(false);
          setAdminDataReady(false);
          setAuthError(
            data.message ||
            (res.status === 403
              ? 'Access Forbidden. Your account is not authorized as the store owner.'
              : 'Failed to verify store owner credentials.')
          );
          setIsVerifying(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setIsAuthorizedOwner(false);
        setAdminDataReady(false);
        setAuthError(err.message || 'Network error verifying owner credentials.');
        setIsVerifying(false);
      }
    }

    verifyOwnerWithBackend();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'coupons' | 'subscribers' | 'moderation' | 'audit_logs' | 'reconciliation'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  // New product state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'E-books' | 'AI Prompts' | 'Prompt Packs' | 'Templates' | 'Productivity' | 'Business'>('E-books');
  const [newPrice, setNewPrice] = useState<number>(19);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number>(38);
  const [newShortDesc, setNewShortDesc] = useState('');
  const [newFormat, setNewFormat] = useState('PDF / ePub');
  const [newDeliverable, setNewDeliverable] = useState('120 Pages');

  // Metrics (computed only when authorized and data is unlocked)
  const totalRevenue = adminDataReady ? orders.reduce((sum, o) => sum + o.totalAmount, 0) : 0;
  const totalOrdersCount = adminDataReady ? orders.length : 0;
  const totalProductsCount = adminDataReady ? products.length : 0;
  const totalSubscribersCount = adminDataReady ? newsletterSubscribers.length : 0;

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newShortDesc) return;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      slug,
      title: newTitle,
      shortDescription: newShortDesc,
      fullDescription: `${newShortDesc}\n\nComprehensive digital resource engineered for immediate practical application.`,
      category: newCategory,
      price: Number(newPrice),
      originalPrice: Number(newOriginalPrice),
      format: newFormat,
      pagesOrCount: newDeliverable,
      rating: 5.0,
      reviewCount: 1,
      isFeatured: false,
      isBestSeller: false,
      isNewRelease: true,
      tags: [newCategory, 'New Release'],
      coverGradient: {
        from: '#4f46e5',
        to: '#064e3b',
        accent: '#10b981'
      },
      whatsIncluded: ['Full digital master file', 'Interactive cheat sheet', 'Lifetime update guarantee'],
      whoItsFor: ['Creators', 'Entrepreneurs', 'Students'],
      keyBenefits: ['Saves 20+ hours of setup', 'Instant execution', 'Zero fluff'],
      features: ['Immediate download', 'Lifetime updates', 'Direct guidance'],
      downloadFilename: `${slug}-v1.0.zip`,
      downloadContent: `Lumina Digital Deliverable: ${newTitle}\n\nThank you for purchasing! Access your files securely.`
    };

    addProduct(newProd);
    setIsCreatingProduct(false);
    setNewTitle('');
    setNewShortDesc('');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Email,Source,Date"].concat(newsletterSubscribers.map(s => `"${s.email}","${s.source}","${s.date}"`)).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lumina_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported subscribers CSV', 'success');
  };

  // 1. Pending Verification Screen: Data is withheld while validating ID token with Firebase Admin SDK
  if (isVerifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center max-w-md w-full space-y-4 shadow-2xl animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Shield className="w-7 h-7 animate-pulse text-indigo-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-display">
              Verifying Owner Authorization
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Validating session token against Firebase Admin SDK (/api/admin/me)...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Cryptographic owner check in progress</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthorized Screen: Check failed or caller is not owner; data remains completely withheld
  if (!isAuthorizedOwner || !adminDataReady) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-900 border border-rose-500/30 text-center max-w-lg w-full space-y-6 shadow-2xl animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/20">
              HTTP 403 • ACCESS RESTRICTED
            </span>
            <h2 className="text-2xl font-bold font-display text-white">
              Owner Authorization Required
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {authError || 'Only the verified store owner is authorized to access the store management dashboard.'}
            </p>
            <p className="text-xs text-neutral-400 font-mono">
              Authorized Store Owner: <strong className="text-indigo-300 font-mono">raj.nikhil0556@gmail.com</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsVerifying(true);
                user?.getIdToken(true).then(() => {
                  window.location.reload();
                });
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Verification</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Store Owner: Render administrative dashboard and load data
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="border-b border-neutral-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
              Store Control Panel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            Lumina Digital Management
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'Sales Overview' },
            { id: 'moderation', label: 'Moderation Queue' },
            { id: 'audit_logs', label: 'Security & Audit Logs' },
            { id: 'reconciliation', label: 'Settlement & Route' },
            { id: 'products', label: 'Products Catalog' },
            { id: 'orders', label: 'Customer Orders' },
            { id: 'coupons', label: 'Discounts & Coupons' },
            { id: 'subscribers', label: 'Subscribers' },
            { id: 'settings', label: 'Store Settings' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (t.id === 'settings') {
                  setActivePage('settings');
                } else {
                  setActiveTab(t.id as any);
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                  : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
              }`}
            >
              {t.id === 'settings' && <Settings className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Authorization Security Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d162d]/90 via-[#0a1124]/90 to-[#070c1a] border border-white/[0.1] shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-neutral-300">
            Owner & Support Mail:{' '}
            <strong className="text-white font-mono">{ownerSession?.email || user?.email || 'raj.nikhil0556@gmail.com'}</strong>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            SUPER_ADMIN • VERIFIED OWNER
          </span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400 text-[11px] font-mono">
          <span className="text-indigo-300">Firebase Admin SDK Verified</span>
          <span className="text-neutral-600">•</span>
          <span>{ownerSession?.verifiedAt ? new Date(ownerSession.verifiedAt).toLocaleTimeString() : 'Active Session'}</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium">Total Digital Sales</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                {formatPrice(totalRevenue)}
              </div>
              <p className="text-[11px] text-emerald-400 font-mono">100% automated delivery</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium">Total Customer Orders</span>
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                {totalOrdersCount}
              </div>
              <p className="text-[11px] text-neutral-400">Instant digital fulfillment</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium">Active Digital Products</span>
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                {totalProductsCount}
              </div>
              <p className="text-[11px] text-purple-400 font-mono">E-books, AI prompts & kits</p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-medium">Email Subscribers</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-display text-white">
                {totalSubscribersCount}
              </div>
              <p className="text-[11px] text-amber-400 font-mono">Ready for CSV export</p>
            </div>
          </div>

          {/* Recent Orders in Overview */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-display">Recent Customer Transactions</h3>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                View all orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Items</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="text-neutral-200">
                      <td className="py-3 font-mono text-indigo-400">{o.orderNumber}</td>
                      <td className="py-3">
                        <span className="font-semibold block text-white">{o.customerName}</span>
                        <span className="text-[11px] text-neutral-400">{o.customerEmail}</span>
                      </td>
                      <td className="py-3">{o.items.length} file(s)</td>
                      <td className="py-3 font-mono font-bold text-white">{formatPrice(o.totalAmount)}</td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Delivered
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">Digital Catalog ({products.length})</h3>
            <button
              type="button"
              onClick={() => setIsCreatingProduct(!isCreatingProduct)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingProduct ? 'Cancel' : 'Add New Digital Product'}</span>
            </button>
          </div>

          {/* Add Product Form */}
          {isCreatingProduct && (
            <form onSubmit={handleSaveNewProduct} className="p-6 rounded-2xl bg-neutral-900 border border-neutral-700 space-y-4 max-w-2xl">
              <h4 className="text-base font-bold text-white">Create New Digital Resource</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 500+ Notion Productivity Pack"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white"
                  >
                    <option value="E-books">E-books</option>
                    <option value="AI Prompts">AI Prompts</option>
                    <option value="Prompt Packs">Prompt Packs</option>
                    <option value="Templates">Templates</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-300 mb-1">Format</label>
                  <input
                    type="text"
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-300 mb-1">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={newShortDesc}
                  onChange={(e) => setNewShortDesc(e.target.value)}
                  placeholder="Key value proposition and who it's for..."
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Publish Digital Product
              </button>
            </form>
          )}

          {/* Product Catalog Table */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-mono">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Deliverable</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {products.map(p => (
                  <tr key={p.id} className="text-neutral-200 hover:bg-neutral-850/40">
                    <td className="py-3 font-semibold text-white max-w-xs truncate">{p.title}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-white">{formatPrice(p.price)}</td>
                    <td className="py-3 text-neutral-400">{p.pagesOrCount}</td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">Customer Orders ({orders.length})</h3>
            <span className="text-xs text-neutral-400">Real-time purchase logs</span>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] overflow-x-auto shadow-xl backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-neutral-400 font-mono">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer Email</th>
                  <th className="pb-3">Gateway</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {orders.map(o => (
                  <tr key={o.id} className="text-neutral-200">
                    <td className="py-3 font-mono text-indigo-400">{o.orderNumber}</td>
                    <td className="py-3 text-white font-medium">{o.customerEmail}</td>
                    <td className="py-3 uppercase font-mono text-[11px] text-neutral-400">{o.paymentMethod}</td>
                    <td className="py-3 text-neutral-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 font-mono font-bold text-white">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Active Access
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COUPONS & DISCOUNTS */}
      {activeTab === 'coupons' && (
        <div className="space-y-4 animate-in fade-in">
          <h3 className="text-lg font-bold text-white font-display">Active Store Coupon Codes</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coupons.map(c => (
              <div key={c.code} className="p-5 rounded-2xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] space-y-2 shadow-lg backdrop-blur-xl hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    {c.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {c.discountPercent}% OFF
                  </span>
                </div>
                <p className="text-xs text-neutral-300">{c.description}</p>
                <div className="pt-2 text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>Usage: Active</span>
                  <span>Min cart: {c.minPurchase ? formatPrice(c.minPurchase) : 'None'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: NEWSLETTER SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">
              Subscribers ({newsletterSubscribers.length})
            </h3>
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.1] text-white flex items-center gap-2 border border-white/[0.1] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] overflow-x-auto shadow-xl backdrop-blur-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] text-neutral-400 font-mono">
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Acquisition Source</th>
                  <th className="pb-3">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {newsletterSubscribers.map(s => (
                  <tr key={s.id} className="text-neutral-200">
                    <td className="py-3 text-white font-mono">{s.email}</td>
                    <td className="py-3 text-neutral-400">{s.source}</td>
                    <td className="py-3 text-neutral-500">{new Date(s.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TRUST & MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <ModerationQueuePanel
          onTakedownProduct={(productId) => {
            deleteProduct(productId);
            showToast('Product taken down from public catalog', 'info');
          }}
          showToast={showToast}
        />
      )}

      {/* TAB 7: SECURITY & AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <AuditLogsPanel showToast={showToast} />
      )}

      {/* TAB 8: SETTLEMENT & ROUTE RECONCILIATION */}
      {activeTab === 'reconciliation' && (
        <ReconciliationPanel showToast={showToast} />
      )}
    </div>
  );
};
