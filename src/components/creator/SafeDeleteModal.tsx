import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  Archive,
  Trash2,
  Lock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Product } from '../../types';

interface SafeDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (productId: string) => Promise<void>;
  isProcessing: boolean;
}

export const SafeDeleteModal: React.FC<SafeDeleteModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirmDelete,
  isProcessing
}) => {
  if (!isOpen || !product) return null;

  const hasPurchases = (product.salesCount && product.salesCount > 0) || (product.totalRevenue && product.totalRevenue > 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  hasPurchases
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                }`}
              >
                {hasPurchases ? <ShieldAlert className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {hasPurchases ? 'Protected Product: Safe Archiving' : 'Delete Product Listing'}
                </h3>
                <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[240px]">
                  {product.title}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation & Compliance Note */}
          {hasPurchases ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-300 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-white">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Existing Customer Purchases Detected ({product.salesCount || 0} orders)</span>
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Platform safety rule: To protect customers who have already paid for this asset, digital products with recorded sales cannot be abruptly destroyed.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 space-y-1.5">
                <p className="font-semibold text-white">What happens when you confirm:</p>
                <ul className="space-y-1 text-neutral-400 list-disc list-inside">
                  <li>Listing is immediately unpublished and hidden from marketplace catalog.</li>
                  <li>No new customers will be able to discover or buy this product.</li>
                  <li>Past verified purchasers retain full lifetime access to download their files.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-neutral-400">
              <p>
                Are you sure you want to permanently delete <strong className="text-white">"{product.title}"</strong>?
              </p>
              <p className="text-[11px] text-neutral-500">
                This item has zero recorded purchases. Its metadata and draft files will be permanently removed from your account.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => onConfirmDelete(product.id)}
              className={`px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                hasPurchases
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {hasPurchases ? (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Archiving...' : 'Safely Unpublish & Archive'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Deleting...' : 'Delete Permanently'}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
