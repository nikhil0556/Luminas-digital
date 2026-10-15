import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ReportProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
  creatorId?: string;
  creatorName?: string;
}

export const ReportProductModal: React.FC<ReportProductModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  creatorId,
  creatorName
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<'copyright' | 'misleading' | 'harmful' | 'malware' | 'broken_file' | 'other'>('copyright');
  const [description, setDescription] = useState('');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide specific details explaining the violation.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${productId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle,
          creatorId: creatorId || 'creator-unknown',
          creatorName: creatorName || 'Creator',
          reportedByUserId: user?.uid || 'guest-reporter',
          reporterEmail: reporterEmail || 'anonymous@luminadigital.com',
          reason,
          description
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSubmittedReportId(data.reportId || 'REP-RECVD');
    } catch (err: any) {
      setError(err?.message || 'Error communicating with Trust & Safety queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl relative"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {submittedReportId ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-display">Report Submitted</h3>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto leading-relaxed">
                Thank you for helping keep the Lumina creator community safe. Ticket <span className="font-mono text-indigo-400">{submittedReportId}</span> has been dispatched to our Trust & Safety moderation team for investigation.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Report Digital Product</h3>
                  <p className="text-[11px] text-neutral-400 truncate max-w-xs">{productTitle}</p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Reason for Report
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="copyright">Intellectual Property or DMCA Violation</option>
                  <option value="broken_file">Corrupted, Empty, or Non-Working Digital File</option>
                  <option value="misleading">Misleading Advertising, Description, or Pricing</option>
                  <option value="malware">Security Risk, Suspicious Archive, or Malicious Code</option>
                  <option value="harmful">Prohibited, Abusive, or Offensive Content</option>
                  <option value="other">Other Marketplace Policy Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Your Email Address (for status updates)
                </label>
                <input
                  type="email"
                  required
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Specific Details & Evidence
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe where the issue occurs, original copyright links if applicable, or error details..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Submitting to Queue...' : 'Submit Abuse Report'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
