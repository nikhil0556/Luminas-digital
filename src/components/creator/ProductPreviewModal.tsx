import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Eye,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  FileText,
  Download,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Calendar,
  Check,
  UserCheck
} from 'lucide-react';
import { Product, ProductStatus } from '../../types';

interface ProductPreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onSubmitForReview?: (productId: string) => void;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onSubmitForReview
}) => {
  if (!isOpen || !product) return null;

  const currencySymbol = product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$';

  const getStatusDisplay = (status?: ProductStatus) => {
    switch (status) {
      case 'published':
        return {
          label: 'Published & Live',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          desc: 'This item is publicly discoverable and purchasable in the Lumina Storefront.'
        };
      case 'pending_review':
        return {
          label: 'Pending Review',
          icon: <Clock className="w-4 h-4 text-indigo-400 animate-spin" />,
          color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          desc: 'Submitted for platform quality & licensing validation. Not yet visible to public shoppers.'
        };
      case 'rejected':
        return {
          label: 'Changes Requested / Rejected',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          desc: product.moderationNotes || 'The listing does not meet marketplace standards. Please edit and re-submit.'
        };
      case 'unpublished':
        return {
          label: 'Unpublished (Archived)',
          icon: <Eye className="w-4 h-4 text-neutral-400" />,
          color: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          desc: 'Hidden from marketplace catalog. Existing buyers retain access to verified downloads.'
        };
      case 'suspended':
        return {
          label: 'Suspended',
          icon: <Ban className="w-4 h-4 text-rose-400" />,
          color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          desc: 'Suspended due to content policy violation or rights inquiry.'
        };
      case 'draft':
      default:
        return {
          label: 'Private Draft',
          icon: <ShieldCheck className="w-4 h-4 text-neutral-400" />,
          color: 'bg-neutral-800 text-neutral-300 border-neutral-700',
          desc: 'Only visible to you. Must be submitted for moderation before public listing.'
        };
    }
  };

  const statusInfo = getStatusDisplay(product.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Creator Preview Mode
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                {statusInfo.icon}
                <span>{statusInfo.label}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Moderation Status Banner */}
          <div className="px-6 py-3 bg-neutral-950 border-b border-neutral-800 text-xs flex items-start gap-3">
            <div className="mt-0.5">{statusInfo.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-200">Publication Status: {statusInfo.label}</p>
              <p className="text-neutral-400 mt-0.5">{statusInfo.desc}</p>
            </div>
            {product.status === 'draft' && onSubmitForReview && (
              <button
                type="button"
                onClick={() => {
                  onSubmitForReview(product.id);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                Submit For Review
              </button>
            )}
          </div>

          {/* Modal Content Scroll Area */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Top Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Cover/Thumbnail */}
              <div className="md:col-span-1">
                <div
                  className="w-full aspect-[4/5] rounded-xl overflow-hidden shadow-lg border border-neutral-800 flex flex-col justify-between p-4 relative"
                  style={{
                    background: product.coverImage
                      ? `url(${product.coverImage}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${product.coverGradient?.from || '#4f46e5'}, ${product.coverGradient?.to || '#7c3aed'})`
                  }}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {product.format}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-indigo-300 backdrop-blur-sm">
                      v{product.version || '1.0.0'}
                    </span>
                  </div>

                  {!product.coverImage && (
                    <div className="text-center my-auto px-2 z-10">
                      <p className="text-white font-extrabold text-sm line-clamp-3 drop-shadow">
                        {product.title}
                      </p>
                      {product.subtitle && (
                        <p className="text-white/80 text-[11px] mt-1 line-clamp-2">
                          {product.subtitle}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="z-10 flex items-center justify-between text-[11px] text-white/90 bg-black/60 p-2 rounded-lg backdrop-blur-sm">
                    <span>{product.pagesOrCount}</span>
                    <span className="font-bold">{currencySymbol}{product.price}</span>
                  </div>
                </div>

                {/* Digital File Details */}
                <div className="mt-4 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300 font-semibold mb-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Secure Vault Deliverable</span>
                  </div>
                  <p className="text-neutral-400 truncate text-[11px]">
                    {product.digitalFile?.fileName || product.downloadFilename}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Size: {product.digitalFile?.fileSize || product.fileSize || 'Encrypted'}</span>
                    <span>Format: {product.format}</span>
                  </div>
                </div>
              </div>

              {/* Product Info Column */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      {product.category}
                    </span>
                    {product.subcategory && (
                      <span className="text-[11px] text-neutral-500">/ {product.subcategory}</span>
                    )}
                  </div>
                  <h1 className="text-xl font-extrabold text-white">{product.title}</h1>
                  {product.subtitle && (
                    <p className="text-xs text-neutral-400 mt-1">{product.subtitle}</p>
                  )}
                </div>

                {/* Creator Attribution */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {product.creatorName ? product.creatorName.slice(0, 2).toUpperCase() : 'CR'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{product.creatorName || 'Independent Creator'}</span>
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    </p>
                    <p className="text-[10px] text-neutral-500">{product.creatorHandle || '@creator'}</p>
                  </div>
                </div>

                {/* Pricing & Commercial Terms */}
                <div className="flex items-baseline gap-3 p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80">
                  <div className="text-2xl font-extrabold text-white font-mono">
                    {currencySymbol}{product.price}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-neutral-500 line-through font-mono">
                      {currencySymbol}{product.originalPrice}
                    </span>
                  )}
                  <span className="text-[11px] text-emerald-400 font-medium ml-auto">
                    Commercial & Personal License
                  </span>
                </div>

                {/* Short Description */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-300 mb-1">Overview</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{product.shortDescription}</p>
                </div>

                {/* What's Included */}
                {product.whatsIncluded && product.whatsIncluded.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-300 mb-2">What's Included</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {product.whatsIncluded.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {product.requirements && product.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-300 mb-2">Optional Requirements</h3>
                    <div className="space-y-1">
                      {product.requirements.map((req, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-amber-300/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {product.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[10px] text-neutral-400 font-mono"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Sample / Excerpt Section */}
            {product.previewSample && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Customer Preview / Sample Excerpt: {product.previewSample.title}</span>
                  </h3>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">
                    Sample Type: {product.previewSample.type}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {product.previewSample.content}
                </div>
              </div>
            )}

            {/* Version History Table */}
            {product.versions && product.versions.length > 0 && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Product Version & Changelog History</span>
                </h3>
                <div className="space-y-2">
                  {product.versions.map((ver, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">v{ver.version}</span>
                          <span className="text-[10px] text-neutral-500">
                            {new Date(ver.releasedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-neutral-400 text-[11px] mt-0.5">{ver.changelog}</p>
                      </div>
                      {ver.fileName && (
                        <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                          {ver.fileName}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-800 bg-neutral-950/60 shrink-0">
            <span className="text-[11px] text-neutral-500">
              Product ID: <code className="text-neutral-400">{product.id}</code>
            </span>
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(product);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Edit Metadata
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
