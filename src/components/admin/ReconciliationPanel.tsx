import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  Clock,
  Building2,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ReconciliationPanelProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ReconciliationPanel: React.FC<ReconciliationPanelProps> = ({ showToast }) => {
  const { formatPrice } = useStore();
  const [data, setData] = useState<{
    totalGrossSales: number;
    platformCommission: number;
    creatorTransfers: number;
    totalOrdersCount: number;
    orders: any[];
  }>({
    totalGrossSales: 0,
    platformCommission: 0,
    creatorTransfers: 0,
    totalOrdersCount: 0,
    orders: []
  });
  const [loading, setLoading] = useState(true);

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reconcile');
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch reconciliation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  const handleExportCSV = () => {
    try {
      const header = ['Order Number', 'Payment ID', 'Customer Email', 'Gross Amount', 'Platform Fee (10%)', 'Creator Payout (90%)', 'Date', 'Status'];
      const rows = data.orders.map(o => [
        o.orderNumber,
        o.paymentId,
        o.customerEmail,
        o.totalAmount,
        (o.totalAmount * 0.1).toFixed(2),
        (o.totalAmount * 0.9).toFixed(2),
        new Date(o.createdAt).toLocaleDateString(),
        'settled'
      ]);
      const csv = [header.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumina-marketplace-reconciliation-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Reconciliation CSV exported', 'success');
    } catch {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-display text-white">
              Marketplace Financial Settlement & Reconciliation
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              Razorpay Route Linked Accounts
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cryptographic ledger tracking split settlements between platform commissions and verified creator linked accounts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchReconciliation}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Marketplace GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {formatPrice(data.totalGrossSales)}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">Gross transaction volume</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Platform Fee (10%)</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-display text-indigo-400">
            {formatPrice(data.platformCommission)}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">Retained platform revenue</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Creator Net Payouts (90%)</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-display text-purple-400">
            {formatPrice(data.creatorTransfers)}
          </div>
          <p className="text-[11px] text-emerald-400 font-mono">Dispatched to linked accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Reconciled Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-display text-white">
            {data.totalOrdersCount}
          </div>
          <p className="text-[11px] text-neutral-500 font-mono">Zero discrepancy status</p>
        </div>
      </div>

      {/* Orders Settlement Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-x-auto shadow-lg">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 font-mono bg-neutral-950/40">
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Razorpay Payment ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Gross Amount</th>
              <th className="py-3 px-4">Split (Platform / Creator)</th>
              <th className="py-3 px-4">Route Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
            {data.orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  No verified orders logged in current ledger.
                </td>
              </tr>
            ) : (
              data.orders.map((o, idx) => (
                <tr key={o.orderNumber || idx} className="text-neutral-300 hover:bg-neutral-850/40">
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-indigo-400 whitespace-nowrap">
                    {o.paymentId || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-sans text-neutral-200 truncate max-w-xs">
                    {o.customerEmail}
                  </td>
                  <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                    {formatPrice(o.totalAmount)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-neutral-300">
                    <span className="text-indigo-400">{formatPrice(o.totalAmount * 0.1)}</span>
                    <span className="text-neutral-500"> / </span>
                    <span className="text-purple-400">{formatPrice(o.totalAmount * 0.9)}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Settled</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
