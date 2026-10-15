import React from 'react';
import { CheckCircle2, AlertCircle, Info, X, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      id="global-toast-container"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-2 sm:px-0"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto p-4 rounded-xl shadow-2xl border flex items-start gap-3 text-xs backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-neutral-900/95 border-emerald-500/50 text-neutral-100 shadow-emerald-950/30'
              : toast.type === 'error'
              ? 'bg-neutral-900/95 border-rose-500/50 text-neutral-100 shadow-rose-950/30'
              : 'bg-neutral-900/95 border-indigo-500/50 text-neutral-100 shadow-indigo-950/30'
          }`}
        >
          {toast.type === 'success' && (
            <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="p-1 rounded-lg bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/30">
              <Info className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 leading-snug min-w-0">
            {toast.title ? (
              <div className="font-semibold text-white mb-1 text-xs flex items-center gap-1.5 flex-wrap">
                <span>{toast.title}</span>
                {toast.type === 'success' && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Confirmed
                  </span>
                )}
                {toast.orderNumber && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                    #{toast.orderNumber}
                  </span>
                )}
              </div>
            ) : null}
            <p className="text-neutral-200 text-xs leading-relaxed font-normal">{toast.message}</p>
          </div>

          <button
            type="button"
            id={`btn-close-toast-${toast.id}`}
            onClick={() => removeToast(toast.id)}
            aria-label="Close notification"
            className="text-neutral-400 hover:text-white shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
