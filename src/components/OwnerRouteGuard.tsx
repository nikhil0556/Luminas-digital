import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Lock, ArrowLeft, LogIn, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { verifyOwnerWithServer, OwnerCheckResult } from '../lib/ownerAuth';

interface OwnerRouteGuardProps {
  children: React.ReactNode;
  panelTitle?: string;
}

export const OwnerRouteGuard: React.FC<OwnerRouteGuardProps> = ({
  children,
  panelTitle = 'Store Control Panel & Settings'
}) => {
  const { user, loading: authLoading, openAuthModal, logout } = useAuth();
  const { setActivePage } = useStore();

  const [verifying, setVerifying] = useState<boolean>(true);
  const [authResult, setAuthResult] = useState<OwnerCheckResult | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthorization() {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setAuthResult({ authorized: false, status: 401, error: 'Sign in required' });
          setVerifying(false);
        }
        return;
      }

      setVerifying(true);
      const res = await verifyOwnerWithServer(user);
      if (isMounted) {
        setAuthResult(res);
        setVerifying(false);
      }
    }

    checkAuthorization();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Loading state: Never render admin UI while verifying
  if (authLoading || verifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Shield className="w-7 h-7 animate-pulse text-indigo-400" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-display">
              Verifying Owner Authorization
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Validating session tokens against server-authoritative Firebase Admin credentials...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Cryptographic handshake in progress</span>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated visitor
  if (!user || authResult?.status === 401) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-900 border border-neutral-800 text-center max-w-lg w-full space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Restricted Area • Authentication Required
            </span>
            <h2 className="text-2xl font-bold font-display text-white">
              {panelTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              This administrative area is restricted to the verified store owner. Please sign in with your authorized owner credentials.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as Store Owner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated non-owner (HTTP 403 Forbidden)
  if (!authResult?.authorized) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20">
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-900 border border-rose-500/30 text-center max-w-lg w-full space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/20">
              HTTP 403 • FORBIDDEN
            </span>
            <h2 className="text-2xl font-bold font-display text-white">
              Owner Authorization Required
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Your account (<strong className="text-white font-mono">{user.email || user.uid}</strong>) is authenticated as a customer or creator, but is not authorized as the store owner.
            </p>
            <p className="text-xs text-neutral-400">
              Control Panel, Store Configuration, and financial controls can only be accessed by the verified owner.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                openAuthModal('login');
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Verified Owner: safely render protected panel
  return <>{children}</>;
};
