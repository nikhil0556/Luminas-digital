import React, { useState } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  ShieldCheck,
  FileText,
  Lock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Product, ProductStatus, CreatorDashboardTab } from '../../types';
import { ProductModerationPipeline } from './ProductModerationPipeline';

interface ProductsSectionProps {
  creatorProducts: Product[];
  canSell: boolean;
  setActiveCreatorTab: (tab: CreatorDashboardTab) => void;
  updateCreatorProduct: (id: string, updates: Partial<Product>) => Promise<any>;
  deleteCreatorProduct: (id: string) => Promise<any>;
  duplicateProduct: (id: string) => Promise<any>;
  submitProductForReview: (id: string) => Promise<any>;
  unpublishProduct: (id: string) => Promise<any>;
  publishProduct: (id: string) => Promise<any>;
  simulateModerationDecision: (
    id: string,
    decision: 'approved' | 'rejected' | 'suspended',
    note?: string
  ) => Promise<any>;
  navigateToProduct: (slug: string) => void;
  onOpenPreview: (product: Product) => void;
  onOpenEdit: (product: Product) => void;
  onOpenVersionModal: (product: Product) => void;
  onOpenDeleteModal: (product: Product) => void;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  creatorProducts,
  canSell,
  setActiveCreatorTab,
  updateCreatorProduct,
  duplicateProduct,
  submitProductForReview,
  unpublishProduct,
  publishProduct,
  simulateModerationDecision,
  navigateToProduct,
  onOpenPreview,
  onOpenEdit,
  onOpenVersionModal,
  onOpenDeleteModal,
  showToast
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPipelineId, setExpandedPipelineId] = useState<string | null>(null);

  // Status Counts
  const counts = {
    all: creatorProducts.length,
    draft: creatorProducts.filter(p => !p.status || p.status === 'draft').length,
    pending_review: creatorProducts.filter(p => p.status === 'pending_review').length,
    published: creatorProducts.filter(p => p.status === 'published').length,
    rejected: creatorProducts.filter(p => p.status === 'rejected').length,
    unpublished: creatorProducts.filter(p => p.status === 'unpublished').length,
    suspended: creatorProducts.filter(p => p.status === 'suspended').length
  };

  // Filtered products
  const filtered = creatorProducts.filter(product => {
    // Status filter
    if (statusFilter !== 'all') {
      const prodStatus = product.status || 'draft';
      if (prodStatus !== statusFilter) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchSubcategory = product.subcategory?.toLowerCase().includes(q);
      const matchTags = product.tags?.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchCategory && !matchSubcategory && !matchTags) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status?: ProductStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Published & Live</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Changes Requested</span>
          </span>
        );
      case 'unpublished':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
            <Eye className="w-3 h-3" />
            <span>Unpublished</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Ban className="w-3 h-3" />
            <span>Suspended</span>
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700">
            <ShieldCheck className="w-3 h-3" />
            <span>Private Draft</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Asset button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">My Creator Catalog</h2>
          <p className="text-xs text-neutral-400">
            Manage your digital assets, upload files to the secure vault, release updates, and track moderation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setActiveCreatorTab('add-product')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Asset</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>All Products</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'published'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Published</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.published}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('pending_review')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'pending_review'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Pending Review</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.pending_review}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'draft'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Drafts</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.draft}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'rejected'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Rejected</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.rejected}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('unpublished')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'unpublished'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <span>Unpublished / Archived</span>
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
              {counts.unpublished}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by title, category, format, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Product List / Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center">
          <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-300 font-medium text-sm mb-1">No products match this filter</p>
          <p className="text-neutral-500 text-xs mb-4">
            Upload your first digital guide, prompt pack, e-book, or template to start selling.
          </p>
          <button
            type="button"
            onClick={() => setActiveCreatorTab('add-product')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Your First Product</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(product => {
            const currencySymbol = product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';
            const isPipelineExpanded = expandedPipelineId === product.id;

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4 transition-all hover:border-neutral-700/80"
              >
                {/* Main Row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Left: Thumbnail & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Cover Thumbnail */}
                    <div
                      className="w-16 h-20 rounded-xl overflow-hidden shadow-md border border-neutral-800 shrink-0 flex flex-col justify-between p-1.5 relative cursor-pointer"
                      onClick={() => onOpenPreview(product)}
                      style={{
                        background: product.coverImage
                          ? `url(${product.coverImage}) center/cover no-repeat`
                          : `linear-gradient(135deg, ${product.coverGradient?.from || '#4f46e5'}, ${product.coverGradient?.to || '#7c3aed'})`
                      }}
                    >
                      <span className="text-[8px] uppercase font-bold text-white px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm self-start">
                        {product.format}
                      </span>
                      <span className="text-[8px] font-mono text-white px-1 py-0.5 rounded bg-black/60 backdrop-blur-sm self-end">
                        v{product.version || '1.0.0'}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                          {product.category}
                        </span>
                        {product.subcategory && (
                          <span className="text-[10px] text-neutral-500">/ {product.subcategory}</span>
                        )}
                        {getStatusBadge(product.status)}
                      </div>

                      <h3
                        className="text-sm font-bold text-white hover:text-indigo-400 transition-colors cursor-pointer"
                        onClick={() => onOpenPreview(product)}
                      >
                        {product.title}
                      </h3>

                      <p className="text-xs text-neutral-400 line-clamp-1 max-w-xl">
                        {product.shortDescription}
                      </p>

                      {/* File Vault Deliverable Pill */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1 font-mono text-neutral-300">
                          <Lock className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[180px]">
                            {product.digitalFile?.fileName || product.downloadFilename}
                          </span>
                        </div>
                        <span className="text-neutral-600">•</span>
                        <span className="font-mono">
                          {product.digitalFile?.fileSize || product.fileSize || 'Protected'}
                        </span>
                        <span className="text-neutral-600">•</span>
                        <span className="text-neutral-400">{product.pagesOrCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex items-center gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800/80 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Price</p>
                      <p className="text-sm font-bold text-white font-mono">
                        {currencySymbol}{product.price}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Sales</p>
                      <p className="text-sm font-bold text-neutral-200 font-mono">
                        {product.salesCount || 0}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">Net Earned</p>
                      <p className="text-sm font-bold text-emerald-400 font-mono">
                        {currencySymbol}{((product.salesCount || 0) * product.price * 0.9).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800/80 text-xs">
                  {/* Left Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onOpenPreview(product)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Customer preview"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenEdit(product)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Edit metadata & files"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenVersionModal(product)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Release new version & changelog"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>New Version</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const res = await duplicateProduct(product.id);
                        if (res.success) {
                          showToast('Product duplicated as draft!', 'success');
                        } else {
                          showToast(res.error || 'Failed to duplicate.', 'error');
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Duplicate listing"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Duplicate</span>
                    </button>

                    {/* Moderation Stepper Toggle */}
                    <button
                      type="button"
                      onClick={() => setExpandedPipelineId(isPipelineExpanded ? null : product.id)}
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPipelineExpanded
                          ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Moderation Status</span>
                      {isPipelineExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Submit for review button if draft or rejected */}
                    {(product.status === 'draft' || product.status === 'rejected') && (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await submitProductForReview(product.id);
                          if (res.success) {
                            showToast('Product submitted for review!', 'success');
                          } else {
                            showToast(res.error || 'Failed to submit for review.', 'error');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submit For Review</span>
                      </button>
                    )}

                    {/* Publish / Unpublish Toggle */}
                    {product.status === 'published' ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await unpublishProduct(product.id);
                          if (res.success) {
                            showToast('Product unpublished from marketplace.', 'info');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium transition-colors cursor-pointer"
                      >
                        Unpublish
                      </button>
                    ) : product.status === 'unpublished' ? (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await publishProduct(product.id);
                          if (res.success) {
                            showToast('Product published live!', 'success');
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
                      >
                        Re-Publish Live
                      </button>
                    ) : null}

                    {/* Delete Product (Safe Deletion with Customer Protection) */}
                    <button
                      type="button"
                      onClick={() => onOpenDeleteModal(product)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title="Delete or archive product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Moderation Pipeline & Reviewer Sandbox */}
                {isPipelineExpanded && (
                  <ProductModerationPipeline
                    product={product}
                    onSimulateDecision={simulateModerationDecision}
                    onPublish={publishProduct}
                    onUnpublish={unpublishProduct}
                    onSubmitForReview={submitProductForReview}
                    showToast={showToast}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
