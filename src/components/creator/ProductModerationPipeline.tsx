import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Eye,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { Product, ProductStatus } from '../../types';

interface ProductModerationPipelineProps {
  product: Product;
  onSimulateDecision?: (
    productId: string,
    decision: 'approved' | 'rejected' | 'suspended',
    note?: string
  ) => Promise<{ success: boolean; error?: string }>;
  onUnpublish?: (productId: string) => Promise<{ success: boolean; error?: string }>;
  onPublish?: (productId: string) => Promise<{ success: boolean; error?: string }>;
  onSubmitForReview?: (productId: string) => Promise<{ success: boolean; error?: string }>;
  showToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const ProductModerationPipeline: React.FC<ProductModerationPipelineProps> = ({
  product,
  onSimulateDecision,
  onUnpublish,
  onPublish,
  onSubmitForReview,
  showToast
}) => {
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [rejectReason, setRejectReason] = useState('Please clarify what is included in the digital bundle and provide a preview excerpt.');
  const [isProcessing, setIsProcessing] = useState(false);

  const status = product.status || 'draft';

  // Stepper representation
  const steps: { key: ProductStatus; label: string; desc: string }[] = [
    { key: 'draft', label: '1. Creator Draft', desc: 'Private upload & configuration' },
    { key: 'pending_review', label: '2. Moderation Review', desc: 'Quality & license inspection' },
    { key: 'published', label: '3. Live on Marketplace', desc: 'Discoverable by all buyers' }
  ];

  const getStepState = (stepKey: ProductStatus) => {
    if (status === 'published') {
      return 'completed';
    }
    if (status === 'pending_review') {
      if (stepKey === 'draft') return 'completed';
      if (stepKey === 'pending_review') return 'current';
      return 'upcoming';
    }
    if (status === 'rejected' || status === 'suspended') {
      if (stepKey === 'draft') return 'completed';
      if (stepKey === 'pending_review') return 'failed';
      return 'upcoming';
    }
    // draft
    if (stepKey === 'draft') return 'current';
    return 'upcoming';
  };

  const handleDecision = async (decision: 'approved' | 'rejected' | 'suspended') => {
    if (!onSimulateDecision) return;
    setIsProcessing(true);
    const res = await onSimulateDecision(
      product.id,
      decision,
      decision === 'rejected' ? rejectReason : undefined
    );
    setIsProcessing(false);
    if (res.success) {
      showToast(`Moderation decision applied: ${decision.toUpperCase()}`, 'success');
    } else {
      showToast(res.error || 'Failed to update moderation state.', 'error');
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-4 text-xs">
      {/* Stepper Pipeline */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-white">Marketplace Moderation Pipeline:</span>
          <span className="font-mono text-neutral-400">Creator Uploads → Validation → Review → Published</span>
        </div>

        <button
          type="button"
          onClick={() => setShowAdminControls(!showAdminControls)}
          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <span>{showAdminControls ? 'Hide Reviewer Tools' : 'Reviewer / Admin Sandbox Tools'}</span>
        </button>
      </div>

      {/* Visual Pipeline Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {steps.map(step => {
          const state = getStepState(step.key);
          return (
            <div
              key={step.key}
              className={`p-2.5 rounded-lg border transition-all ${
                state === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                  : state === 'current'
                  ? 'bg-indigo-950/30 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/20'
                  : state === 'failed'
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  : 'bg-neutral-900/40 border-neutral-800/80 text-neutral-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px]">{step.label}</span>
                {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {state === 'current' && <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                {state === 'failed' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <p className="text-[10px] text-neutral-400">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Moderation Notes if rejected or suspended */}
      {(status === 'rejected' || status === 'suspended' || product.moderationNotes) && (
        <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] space-y-1">
          <p className="font-bold text-neutral-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Moderator Feedback Note:</span>
          </p>
          <p className="text-neutral-400 italic">
            "{product.moderationNotes || 'Please revise your listing details before re-submission.'}"
          </p>
        </div>
      )}

      {/* Reviewer / Admin Testing Tools Sandbox */}
      {showAdminControls && onSimulateDecision && (
        <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Moderation Workflow Simulator</span>
            </span>
            <span className="text-[10px] text-neutral-400">
              Test lifecycle status changes instantly
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleDecision('approved')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Publish</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleDecision('rejected')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Reject with Note</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleDecision('suspended')}
              className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Suspend Listing</span>
            </button>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 mb-1">Rejection Reason note (if rejecting):</label>
            <input
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-white text-xs outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
