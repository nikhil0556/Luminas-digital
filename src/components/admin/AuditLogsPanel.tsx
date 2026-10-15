import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  RefreshCw,
  Clock,
  User,
  Filter,
  Terminal,
  Download
} from 'lucide-react';
import { AuditLog } from '../../types';

interface AuditLogsPanelProps {
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ showToast }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportLogs = () => {
    try {
      const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lumina-security-audit-logs-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Audit logs exported successfully', 'success');
    } catch {
      showToast('Failed to export audit logs', 'error');
    }
  };

  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.actorEmail.toLowerCase().includes(query) ||
      log.actorId.toLowerCase().includes(query) ||
      log.targetId?.toLowerCase().includes(query) ||
      log.targetType?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold font-display text-white">
              Immutable Security & Audit Trail
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              {logs.length} Events Logged
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full tamper-evident audit record of admin moderation, payment authorizations, and security events
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportLogs}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            type="button"
            onClick={fetchLogs}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by action (e.g. ORDER_VERIFIED, PRODUCT_MODERATED, actor email, target ID)..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-x-auto shadow-lg">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 font-mono bg-neutral-950/40">
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Target Resource</th>
              <th className="py-3 px-4">Client IP</th>
              <th className="py-3 px-4">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  No audit entries found matching filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="text-neutral-300 hover:bg-neutral-850/40">
                  <td className="py-3 px-4 text-neutral-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-white font-semibold font-sans">{log.actorEmail}</span>
                      <span className="text-[10px] text-neutral-500">{log.actorRole} • {log.actorId}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      log.action.includes('VERIFIED') || log.action.includes('SUCCESS')
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : log.action.includes('TAKEDOWN') || log.action.includes('DELETED')
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-200">
                    <span className="text-neutral-400 text-[10px] block">{log.targetType}</span>
                    <span className="font-semibold text-white">{log.targetId || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="py-3 px-4 text-neutral-300 font-sans max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '—'}
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
