import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  RefreshCw,
  ExternalLink,
  Ban
} from 'lucide-react';
import { ProductReport } from '../../types';

interface ModerationQueuePanelProps {
  onTakedownProduct?: (productId: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ModerationQueuePanel: React.FC<ModerationQueuePanelProps> = ({
  onTakedownProduct,
  showToast
}) => {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch moderation reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action, resolutionNotes: `Action ${action} taken by marketplace admin` })
      });
      if (res.ok) {
        showToast(`Report marked as ${action}`, 'success');
        setReports(prev => prev.map(r => (r.id === reportId ? { ...r, status: action } : r)));
      }
    } catch (err) {
      showToast('Failed to update report status', 'error');
    }
  };

  const handleTakedown = async (report: ProductReport) => {
    if (!window.confirm(`Are you sure you want to take down "${report.productTitle}"? This will unpublish the product from the marketplace.`)) {
      return;
    }
    if (onTakedownProduct) {
      onTakedownProduct(report.productId);
    }
    await handleAction(report.id, 'resolved');
    showToast(`Product "${report.productTitle}" removed and ticket resolved`, 'success');
  };

  const filteredReports = filterStatus === 'all'
    ? reports
    : reports.filter(r => r.status === filterStatus);

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-display text-white">
              Trust & Safety Moderation Queue
            </h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {pendingCount} Pending Action
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time customer abuse reports, DMCA copyright notices, and product integrity warnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
          >
            <option value="all">All Reports ({reports.length})</option>
            <option value="pending">Pending Only ({pendingCount})</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <button
            type="button"
            onClick={fetchReports}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reports Listing */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/40 rounded-2xl border border-neutral-800 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-white">Queue is completely clear</h4>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No abuse or copyright reports require administrative action at this moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(rep => (
            <div
              key={rep.id}
              className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 relative"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/60 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    rep.reason === 'copyright'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : rep.reason === 'malware'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {rep.reason.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-md">
                    {rep.productTitle}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-500">
                    ID: {rep.productId}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    rep.status === 'pending'
                      ? 'bg-rose-500/15 text-rose-400'
                      : rep.status === 'resolved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {rep.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description & Reporter */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="md:col-span-3 space-y-1">
                  <span className="text-[11px] text-neutral-400 font-medium block">Report Details:</span>
                  <p className="text-neutral-200 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/60 leading-relaxed font-sans">
                    {rep.description}
                  </p>
                </div>
                <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/40">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-mono">
                    Reporter Contact
                  </span>
                  <p className="text-white font-mono text-[11px] truncate">{rep.reporterEmail}</p>
                  <p className="text-neutral-500 text-[10px]">Creator: {rep.creatorName || rep.creatorId}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                {rep.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleAction(rep.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(rep.id, 'resolved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTakedown(rep)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Take Down Product</span>
                    </button>
                  </>
                )}
                {rep.status !== 'pending' && (
                  <span className="text-[11px] text-neutral-500 italic">
                    Resolved by administrator • Ticket closed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
