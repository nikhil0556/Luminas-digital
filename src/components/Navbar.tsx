import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  BookOpen,
  Sparkles,
  Layers,
  Heart,
  Settings,
  HelpCircle,
  Mail,
  Info,
  Globe,
  ArrowRight,
  FileText,
  Flame,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { useCreator } from '../context/CreatorContext';
import { LiveSearchDropdown } from './LiveSearchDropdown';

export const Navbar: React.FC = () => {
  const { user, userProfile, isOwner, loading, openAuthModal, logout } = useAuth();
  const { isCreator, creatorProfile } = useCreator();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const {
    activePage,
    setActivePage,
    cartItemCount,
    setIsCartOpen,
    wishlist,
    currency,
    setCurrency,
    setActiveCategoryFilter,
    settings,
    globalSearchQuery,
    setGlobalSearchQuery,
    navigateToSearch,
    navigateToRequirement,
    navigateToDashboard,
    clearUserSessionState,
    showToast
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState(globalSearchQuery || '');
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for dynamic header opacity and blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep navSearchQuery synced if globalSearchQuery changes
  useEffect(() => {
    setNavSearchQuery(globalSearchQuery);
  }, [globalSearchQuery]);

  const handleNavClick = (page: string, categoryFilter?: string) => {
    setActivePage(page);
    if (categoryFilter) {
      setActiveCategoryFilter(categoryFilter);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigateToSearch(navSearchQuery.trim());
      setNavSearchOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'glass-strong shadow-[0_12px_32px_-8px_rgba(0,0,0,0.85)]'
          : 'glass border-b border-white/[0.08]'
      }`}
    >
      {/* Top micro announcement bar */}
      {settings.enableAnnouncementBar && (
        <div className="bg-gradient-to-r from-indigo-950/70 via-purple-950/80 to-emerald-950/70 py-1.5 px-4 text-center border-b border-white/[0.06] backdrop-blur-md">
          <p className="text-[11px] font-medium text-white/90 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>{settings.announcementText}</span>
            <button
              type="button"
              onClick={() => handleNavClick('shop')}
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-white underline hover:text-indigo-200 ml-1 cursor-pointer"
            >
              Claim discount <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all">
              <div className="w-full h-full bg-[#070a14] rounded-[11px] flex items-center justify-center">
                <span className="font-display font-black text-white text-base tracking-tighter group-hover:scale-110 transition-transform">
                  L✦
                </span>
              </div>
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white tracking-tight flex items-center gap-1">
                {settings.storeName.includes(' ') ? (
                  <>
                    {settings.storeName.split(' ')[0]}
                    <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                      {settings.storeName.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                ) : (
                  <>
                    {settings.storeName}
                    <span className="text-indigo-400">✦</span>
                  </>
                )}
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-neutral-400 -mt-1 font-mono">
                Digital Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1 bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activePage === 'home'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('shop', 'All Products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activePage === 'shop'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Shop All
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ebooks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePage === 'ebooks'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>E-books</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('ai-prompts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePage === 'ai-prompts'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Prompts</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('ai-prompts');
                setTimeout(() => {
                  const el = document.querySelector('#pdf-books-prompts-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-neutral-300 hover:text-white hover:bg-white/[0.05]"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDF Books</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Vault
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('ai-prompts');
                setTimeout(() => {
                  const el = document.querySelector('#trending-slash-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 text-neutral-300 hover:text-white hover:bg-white/[0.05]"
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trending Prompts</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                100
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePage === 'about'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              About
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('faq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePage === 'faq'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePage === 'contact'
                  ? 'text-white bg-white/[0.09] shadow-sm border border-white/[0.12]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(isCreator ? 'creator-dashboard' : 'become-creator')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activePage === 'creator-dashboard' || activePage === 'become-creator'
                  ? 'text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/30'
                  : 'text-indigo-300 hover:text-white hover:bg-indigo-950/60 border border-indigo-500/35'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isCreator ? 'Creator Studio' : 'Sell on Lumina'}</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative hidden sm:flex items-center">
              <select
                aria-label="Select currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="neu-raised text-neutral-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            {/* Search Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setNavSearchOpen(!navSearchOpen)}
              className={`w-9 h-9 rounded-xl neu-raised flex items-center justify-center transition-colors cursor-pointer ${
                navSearchOpen
                  ? 'text-indigo-400 border-indigo-500/50'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Search products"
              aria-label="Toggle search"
            >
              <Search className="w-4 h-4" />
            </motion.button>

            {/* Firebase Google Auth User Profile / Login */}
            {loading ? (
              <div className="hidden sm:flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 animate-pulse">
                <div className="w-6 h-6 rounded-full bg-neutral-800" />
                <div className="w-16 h-3 rounded bg-neutral-800 hidden md:block" />
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 transition-colors cursor-pointer"
                  title="Your Account & Firestore Synced Vault"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full border border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium hidden md:inline max-w-[100px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse hidden sm:inline" />
                </button>

                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-72 bg-[#0a0f22]/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_25px_-5px_rgba(99,102,241,0.22)] p-3.5 z-50 text-xs animate-in fade-in zoom-in-95">
                      <div className="flex items-start gap-3 pb-3 mb-3 border-b border-white/[0.08]">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full border border-neutral-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                            {(user.displayName || user.email || 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden flex-1 min-w-0">
                          <p className="font-semibold text-white truncate text-xs">{user.displayName || 'Customer'}</p>
                          <p className="text-[11px] text-neutral-400 truncate font-mono">{user.email}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            {user.emailVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Verified Email</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>Verification Pending</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigateToDashboard('profile');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-neutral-200 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 transition-colors flex items-center justify-between font-semibold cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Customer Dashboard</span>
                          </span>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                            Buyer
                          </span>
                        </button>

                        {/* Dedicated Creator Dashboard Entry */}
                        {isCreator ? (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setActivePage('creator-dashboard');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-neutral-200 hover:text-white bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/40 transition-colors flex items-center justify-between font-semibold cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              <span>Creator Studio</span>
                            </span>
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded capitalize">
                              {creatorProfile?.accountStatus.replace('_', ' ') || 'Seller'}
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setActivePage('become-creator');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-emerald-300 hover:text-emerald-200 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 transition-colors flex items-center justify-between font-semibold cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Sell on Lumina</span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-emerald-400" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigateToDashboard('purchases');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>My Purchases & Licenses</span>
                          <span className="text-[10px] font-mono text-indigo-400">
                            {userProfile?.purchasedProductIds?.length || 0} items
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            navigateToDashboard('settings');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <KeyRound className="w-3 h-3 text-neutral-400" />
                            <span>Security & Providers</span>
                          </span>
                        </button>

                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setUserDropdownOpen(false);
                              setActivePage('admin');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 transition-colors flex items-center justify-between font-medium cursor-pointer"
                          >
                            <span>Store Admin Panel</span>
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                              Owner
                            </span>
                          </button>
                        )}

                        <div className="flex items-center justify-between text-neutral-400 px-2.5 py-1 bg-neutral-800/40 rounded-lg mt-1">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Firebase Firestore</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-300 font-semibold">Live Sync</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-neutral-800">
                        <button
                          type="button"
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await logout();
                            clearUserSessionState();
                            showToast('You have been safely signed out.', 'info');
                            if (['dashboard', 'admin', 'control-panel', 'settings', 'store-config'].includes(activePage)) {
                              setActivePage('home');
                            }
                          }}
                          className="w-full px-2.5 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-2 font-medium cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Sign in with Email or Google"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  title="Create free customer account"
                >
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Cart Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsCartOpen(true)}
              className="clay-btn btn-shine-sweep relative px-3.5 py-2 text-white flex items-center gap-2 text-xs font-bold cursor-pointer"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="clay-badge-sapphire w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[11px] font-mono"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </motion.button>

            {/* Store Settings link */}
            <button
              type="button"
              onClick={() => handleNavClick('settings')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                activePage === 'settings'
                  ? 'bg-neutral-800 border-indigo-500/50 text-indigo-400'
                  : 'bg-neutral-900/60 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Store Settings & Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Live Search Header Bar */}
      {navSearchOpen && (
        <div className="border-t border-white/[0.08] bg-[#070b16]/95 backdrop-blur-2xl px-4 py-3 animate-in slide-in-from-top-2 shadow-xl">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <LiveSearchDropdown
              autoFocus
              searchQuery={navSearchQuery}
              onSearchChange={setNavSearchQuery}
              onSelectCategory={(cat) => {
                handleNavClick('shop', cat);
                setNavSearchOpen(false);
              }}
              placeholder="Search e-books, AI prompts, Notion templates..."
            />
            <button
              type="button"
              onClick={() => setNavSearchOpen(false)}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/[0.1] transition-colors shrink-0 cursor-pointer"
              title="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#070b16]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs text-neutral-400">
            <span>Currency:</span>
            <select
              aria-label="Select mobile currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 text-white rounded px-2 py-1 font-mono text-xs"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          {/* Mobile search bar */}
          <div className="pb-3 border-b border-neutral-800">
            <LiveSearchDropdown
              searchQuery={navSearchQuery}
              onSearchChange={setNavSearchQuery}
              onSelectCategory={(cat) => {
                handleNavClick('shop', cat);
              }}
              placeholder="Search products, prompts, requirements..."
            />
          </div>

          {/* User Account / Google Sign-In in Mobile Menu */}
          {loading ? (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center gap-2.5 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-neutral-800" />
              <div className="space-y-1 flex-1">
                <div className="w-24 h-3 bg-neutral-800 rounded" />
                <div className="w-32 h-2.5 bg-neutral-800/60 rounded" />
              </div>
            </div>
          ) : user ? (
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-neutral-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.displayName || 'Customer'}</p>
                  <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    clearUserSessionState();
                    showToast('You have been safely signed out.', 'info');
                    if (['dashboard', 'admin', 'control-panel', 'settings', 'store-config'].includes(activePage)) {
                      setActivePage('home');
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-neutral-800 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActivePage('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 px-3 bg-indigo-600/25 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Customer Dashboard</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-800/80">
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cloud Firestore Synced
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {userProfile?.purchasedProductIds?.length || 0} purchased
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                openAuthModal('login');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              <span>Sign in / Create Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              activePage === 'home' ? 'bg-neutral-800 text-white' : 'text-neutral-300'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('shop', 'All Products')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              activePage === 'shop' ? 'bg-neutral-800 text-white' : 'text-neutral-300'
            }`}
          >
            Shop All Products
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ebooks')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              activePage === 'ebooks' ? 'bg-neutral-800 text-white' : 'text-neutral-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              E-books Marketplace
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Gen Z Guide
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('ai-prompts')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              activePage === 'ai-prompts' ? 'bg-neutral-800 text-white' : 'text-neutral-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Prompts & Packs
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              3,500+
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePage('ai-prompts');
              setMobileMenuOpen(false);
              setTimeout(() => {
                const el = document.querySelector('#pdf-books-prompts-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 120);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-neutral-300 hover:text-white hover:bg-neutral-800"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              PDF Books
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              Vault
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActivePage('ai-prompts');
              setMobileMenuOpen(false);
              setTimeout(() => {
                const el = document.querySelector('#trending-slash-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 120);
            }}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between text-neutral-300 hover:text-white hover:bg-neutral-800"
          >
            <span className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400" />
              Trending Prompts
            </span>
            <span className="text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md">
              100
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick(isCreator ? 'creator-dashboard' : 'become-creator')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              activePage === 'creator-dashboard' || activePage === 'become-creator'
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-300 hover:bg-neutral-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isCreator ? 'Creator Dashboard & Sales' : 'Become a Creator (Sell)'}
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              90% Split
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              activePage === 'about' ? 'bg-neutral-800 text-white' : 'text-neutral-300'
            }`}
          >
            About Lumina
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('faq')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              activePage === 'faq' ? 'bg-neutral-800 text-white' : 'text-neutral-300'
            }`}
          >
            FAQ & Product Access
          </button>
          {/* Customer Care Mobile Card */}
          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5 my-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Customer Care
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Replies &lt; 12h</span>
            </div>
            <a
              href={`mailto:${settings?.supportEmail || 'raj.nikhil0556@gmail.com'}`}
              className="text-xs text-indigo-300 font-mono block hover:underline truncate"
            >
              {settings?.supportEmail || 'raj.nikhil0556@gmail.com'}
            </a>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="w-full mt-1 py-1.5 text-center text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
            >
              Open Support Desk
            </button>
          </div>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => handleNavClick('settings')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  activePage === 'settings' ? 'bg-neutral-800 text-indigo-400' : 'text-neutral-300'
                }`}
              >
                <Settings className="w-4 h-4 text-indigo-400" />
                Store Settings & Config
              </button>
              <button
                type="button"
                onClick={() => handleNavClick('admin')}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  activePage === 'admin' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
                }`}
              >
                <FileText className="w-4 h-4" />
                Store Admin & Catalog
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
