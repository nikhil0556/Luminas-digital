import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
  Download,
  Star,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  TrendingUp,
  Award,
  Users,
  Flame,
  Search,
  Palette
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import { FAQS } from '../data/faqs';
import { PRODUCT_CATEGORIES } from '../data/initialProducts';
import { LiveSearchDropdown } from '../components/LiveSearchDropdown';
import { STORE_SECTIONS } from '../data/searchSections';
import { PdfBooksPromptsSection } from '../components/PdfBooksPromptsSection';
import { UltimateAiCreatorSection } from '../components/UltimateAiCreatorSection';
import { BlowReveal } from '../components/BlowReveal';
import { JoinWaitlistSection } from '../components/JoinWaitlistSection';

const staggerGridContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

const staggerGridItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' }
  }
};

export const HomePage: React.FC = () => {
  const {
    products,
    setActivePage,
    setActiveCategoryFilter,
    navigateToProduct,
    addToCart,
    reviews,
    formatPrice,
    subscribeNewsletter,
    isLoadingProducts,
    navigateToSection,
    navigateToRequirement,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useStore();

  const [heroSearchQuery, setHeroSearchQuery] = useState(globalSearchQuery || '');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(FAQS[0]?.id || null);
  const [emailInput, setEmailInput] = useState('');
  const [newsStatus, setNewsStatus] = useState('');

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);
  const newReleases = products.filter(p => p.isNewRelease || !p.isBestSeller).slice(0, 4);

  const handleCategoryClick = (cat: string) => {
    setActiveCategoryFilter(cat);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    const res = subscribeNewsletter(emailInput, 'Hero Free Resource');
    setNewsStatus(res.message);
    if (res.success) setEmailInput('');
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-20 overflow-hidden bg-hero-radiance rounded-3xl border border-white/[0.06] shadow-2xl mx-2 sm:mx-4">
        {/* Subtle grid and mesh overlay */}
        <div className="absolute inset-0 bg-grid-subtle mask-radial-faded opacity-50 pointer-events-none" />

        {/* Dynamic ambient floating light orbs (CSS only GPU transforms) */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-cyan-500/15 blur-[130px] rounded-full pointer-events-none hero-floating-blob-1" />
        <div className="absolute top-1/4 -left-16 w-[350px] h-[350px] bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none hero-floating-blob-2" />
        <div className="absolute bottom-10 -right-16 w-[400px] h-[320px] bg-cyan-500/12 blur-[110px] rounded-full pointer-events-none hero-floating-blob-1" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1222]/90 border border-white/[0.12] text-xs font-semibold text-neutral-300 backdrop-blur-xl mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-bold">2026 Editions Ready</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300">Curated Digital Tools for Gen Z & Creators</span>
          </div>

          {/* Mandatory Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-display text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Digital Products That Help You <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_4px_16px_rgba(99,102,241,0.3)]">
              Learn, Create & Grow.
            </span>
          </h1>

          {/* Mandatory Subheadline */}
          <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Practical e-books, AI prompts, templates, guides and digital resources designed to help you work smarter and build better.
          </p>

          {/* Connected Live Search to Sections & Products */}
          <div className="mt-8 max-w-xl mx-auto space-y-3.5">
            <LiveSearchDropdown
              searchQuery={heroSearchQuery}
              onSearchChange={setHeroSearchQuery}
              onSelectCategory={(cat) => {
                setActiveCategoryFilter(cat);
                setActivePage('shop');
              }}
              placeholder="Search requirements (e.g. '100 chatgpt prompts', 'trading', 'ebooks')..."
              className="w-full text-left"
            />

            {/* Quick-Jump Requirement Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
              <span className="text-[11px] text-neutral-400 font-mono">Quick Requirements:</span>
              <button
                type="button"
                onClick={() => navigateToRequirement('editing')}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-medium transition-all flex items-center gap-1 cursor-pointer hover:scale-105"
              >
                <Palette className="w-3 h-3 text-indigo-400" />
                <span>50 Editing Prompts</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToRequirement('100 trending chatgpt prompts')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-medium transition-all flex items-center gap-1 cursor-pointer hover:scale-105"
              >
                <Flame className="w-3 h-3 text-cyan-400" />
                <span>100 Slash Prompts</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToRequirement('trading')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.09] transition-all cursor-pointer hover:scale-105"
              >
                Trading AI Prompts
              </button>
              <button
                type="button"
                onClick={() => navigateToRequirement('financial playbook')}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border border-white/[0.09] transition-all cursor-pointer hover:scale-105"
              >
                Financial Playbook
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.querySelector('#featured-products');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-amber-300 border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer hover:scale-105"
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>Featured Picks</span>
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-md mx-auto">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActiveCategoryFilter('All Products');
                setActivePage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold clay-btn btn-shine-sweep text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setActivePage('ebooks');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold btn-premium-secondary btn-shine-sweep rounded-2xl text-neutral-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Browse E-books</span>
            </motion.button>
          </div>

          {/* Trust Value Ticker */}
          <BlowReveal direction="up" delay={0.2} gustSweep>
            <div className="mt-14 pt-8 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 text-left max-w-3xl mx-auto">
              <div className="glass-card-interactive p-3 rounded-2xl border border-white/[0.07] flex items-center gap-3 hover-breeze">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Instant Delivery</p>
                  <p className="text-[11px] text-neutral-400">Download in 3 seconds</p>
                </div>
              </div>

              <div className="glass-card-interactive p-3 rounded-2xl border border-white/[0.07] flex items-center gap-3 hover-breeze">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                  <Star className="w-4 h-4 fill-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">4.95 / 5.0 Rating</p>
                  <p className="text-[11px] text-neutral-400">1,800+ verified buyers</p>
                </div>
              </div>

              <div className="glass-card-interactive p-3 rounded-2xl border border-white/[0.07] flex items-center gap-3 hover-breeze">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Lifetime Updates</p>
                  <p className="text-[11px] text-neutral-400">Free future editions</p>
                </div>
              </div>

              <div className="glass-card-interactive p-3 rounded-2xl border border-white/[0.07] flex items-center gap-3 hover-breeze">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">14-Day Guarantee</p>
                  <p className="text-[11px] text-neutral-400">Hassle-free refund</p>
                </div>
              </div>
            </div>
          </BlowReveal>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES BAR */}
      <BlowReveal direction="breeze" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-section-graphite border border-white/[0.07] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Curated Collections
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Browse by Category
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('All Products');
                setActivePage('shop');
              }}
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>View all collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              { name: 'E-books', desc: 'Practical Guides & Wealth', icon: BookOpen, color: 'text-emerald-400', glow: 'from-emerald-500/20' },
              { name: 'AI Prompts', desc: 'ChatGPT & Claude Vaults', icon: Sparkles, color: 'text-indigo-400', glow: 'from-indigo-500/20' },
              { name: 'Templates', desc: 'Notion OS & Figma Kits', icon: Layers, color: 'text-purple-400', glow: 'from-purple-500/20' },
              { name: 'Productivity', desc: 'Neuro-Protocols & Focus', icon: Clock, color: 'text-amber-400', glow: 'from-amber-500/20' },
              { name: 'Business', desc: 'Agencies, MRR & Freelance', icon: TrendingUp, color: 'text-sky-400', glow: 'from-sky-500/20' }
            ].map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div
                  key={i}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group relative p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#141b31]/80 via-[#0e1426]/90 to-[#070b16] border border-white/[0.09] hover:border-indigo-400/50 backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_24px_-8px_rgba(0,0,0,0.65)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_-10px_rgba(99,102,241,0.22)] flex flex-col justify-between overflow-hidden hover-breeze"
                >
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/[0.08] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BlowReveal>

      {/* 2.5 SPOTLIGHT: 100 TRENDING CHATGPT '/' PROMPTS SECTION */}
      <BlowReveal direction="left" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-r from-cyan-500/35 via-indigo-500/35 to-emerald-500/35 shadow-[0_20px_45px_-15px_rgba(6,182,212,0.2)]">
          <div className="bg-[#090d1c]/95 rounded-[22px] p-6 sm:p-8 border border-cyan-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-2xl">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
                <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>HOT RELEASE • 100 CHATGPT '/' PROMPTS SECTION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                Trading, Coding, Writing & Productivity Slash Cheatsheet
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Slash-style rapid prompt commands with 1-click prompt copying and complete 4-page guide breakdown. Directly search commands like <code className="text-cyan-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.1] font-mono text-xs">/plan</code>, <code className="text-indigo-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.1] font-mono text-xs">/debug</code>, <code className="text-emerald-300 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.1] font-mono text-xs">/eli5</code>, or trading protocols.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-mono text-neutral-400">Includes:</span>
                {['Productivity', 'Writing', 'Coding', 'Business', 'Trading & Finance', 'Learning'].map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-mono text-neutral-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const sec = STORE_SECTIONS.find(s => s.id === 'trending-slash-prompts');
                  if (sec) navigateToSection(sec);
                }}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-black flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer hover:scale-[1.02]"
              >
                <Flame className="w-4 h-4 text-black" />
                <span>Open 100 Prompts Section</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                type="button"
                onClick={() => navigateToProduct('100-trending-chatgpt-slash-prompts-vault')}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>View Product Details ($14.99)</span>
              </button>
            </div>
          </div>
        </div>
      </BlowReveal>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <BlowReveal direction="up" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-6 sm:p-10 rounded-3xl bg-section-navy border border-white/[0.07] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>Editor's Picks</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Featured Products
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Handcrafted digital materials with the highest customer satisfaction.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('All Products');
                setActivePage('shop');
              }}
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <span>See entire store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoadingProducts ? (
            <ProductGridSkeleton count={4} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" />
          ) : (
            <motion.div
              variants={staggerGridContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {featuredProducts.map(product => (
                <motion.div key={product.id} variants={staggerGridItem}>
                  <ProductCard product={product} featured />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </BlowReveal>

      {/* 4. BEST SELLERS SECTION */}
      <BlowReveal direction="up" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="p-8 sm:p-12 rounded-3xl bg-section-purple border border-white/[0.08] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/12 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Customer Favorites</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
                Best Sellers
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                The most downloaded resources by Gen Z founders, creators, and professionals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('All Products');
                setActivePage('shop');
              }}
              className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Explore all best sellers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoadingProducts ? (
            <ProductGridSkeleton count={4} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" />
          ) : (
            <motion.div
              variants={staggerGridContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {bestSellers.map(product => (
                <motion.div key={product.id} variants={staggerGridItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </BlowReveal>

      {/* 5. BENEFITS SECTION */}
      <BlowReveal direction="breeze" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            Built for Execution
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-1">
            Practical digital resources for the modern creator.
          </h2>
          <p className="text-sm text-neutral-400 mt-3">
            Instant access. Download and start using. No fluffy filler, no 500-page bloated theory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-premium p-7 rounded-2xl border border-white/[0.08] space-y-3 hover-breeze">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Automated Access</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Never wait for shipping or manual fulfillment. Your secure download links and access tokens appear immediately on screen and arrive in your inbox in 3 seconds.
            </p>
          </div>

          <div className="glass-card-premium p-7 rounded-2xl border border-white/[0.08] space-y-3 hover-breeze">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Battle-Tested Frameworks</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Every prompt, template, and spreadsheet has been field-tested in real client projects, high-stakes student exams, and production digital businesses.
            </p>
          </div>

          <div className="glass-card-premium p-7 rounded-2xl border border-white/[0.08] space-y-3 hover-breeze">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Lifetime Edition Updates</h3>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Software and AI models evolve rapidly. When we update prompt syntax or release new e-book revisions, you get the updated files for free forever.
            </p>
          </div>
        </div>
      </BlowReveal>

      {/* 5.4 THE ULTIMATE AI CREATOR & BUSINESS TOOL DUAL E-BOOK SECTION */}
      <UltimateAiCreatorSection />

      {/* 5.5 OFFICIAL $20 PROMPT PDF BOOKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PdfBooksPromptsSection />
      </section>

      {/* 6. LIMITED-TIME BUNDLE CONVERSION OFFER */}
      <BlowReveal direction="breeze" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-950 via-[#101428] to-purple-950 border border-indigo-500/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>LIMITED TIME BUNDLE SPECIAL • SAVE 60%</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
                The Complete 2026 Gen Z Career & Wealth Suite
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                Get our flagship e-book <em>"How to Be Financially Free in Young Age"</em> + <em>The 3,500+ AI Creator Mega-Pack</em> + <em>The Life & Business Notion OS</em> bundled together.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300 pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  8-Page Illustrated Master Guide (PDF)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  3,500+ Prompt Vault
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Complete Notion 2nd Brain
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 glass-panel-elevated border border-white/[0.12] rounded-2xl p-6 text-center space-y-4 shadow-2xl">
              <div className="space-y-1">
                <span className="text-xs text-neutral-400 line-through">
                  Total Value: {formatPrice(10100)}
                </span>
                <div className="text-3xl sm:text-4xl font-bold font-display text-white">
                  {formatPrice(4100)}
                </div>
                <span className="inline-block text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Instant Savings of {formatPrice(6000)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const p1 = products.find(p => p.id === 'prod-fin-free');
                  const p2 = products.find(p => p.id === 'prod-ai-mega');
                  if (p1) addToCart(p1, 1);
                  if (p2) addToCart(p2, 1);
                }}
                className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold btn-premium-primary text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add Bundle to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-neutral-400">
                Instant delivery • 100% money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </BlowReveal>

      {/* 7. NEW RELEASES SECTION */}
      <BlowReveal direction="up" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Out of the Lab</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              New Releases
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Newly published frameworks calibrated for the latest 2026 digital landscape.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveCategoryFilter('All Products');
              setActivePage('shop');
            }}
            className="text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>View all new tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newReleases.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </BlowReveal>

      {/* 8. CUSTOMER REVIEWS / TESTIMONIALS */}
      <BlowReveal direction="breeze" gustSweep as="section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-section-graphite border border-white/[0.07] shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Verified Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white mt-1">
              Loved by ambitious young operators.
            </h2>
            <p className="text-sm text-neutral-400 mt-3">
              Real feedback from college students, freelance designers, creators, and indie builders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map(rev => (
              <div
                key={rev.id}
                className="glass-card-premium p-6 rounded-2xl border border-white/[0.08] flex flex-col justify-between hover-breeze"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.authorName}</h4>
                    <p className="text-[11px] text-neutral-400">{rev.authorRole}</p>
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </BlowReveal>

      {/* 9. FAQ ACCORDION SECTION */}
      <BlowReveal direction="up" gustSweep as="section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            Everything you need to know about purchasing, accessing, and using our digital materials.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.slice(0, 5).map(faq => {
            const isOpen = expandedFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl glass hover:border-indigo-500/40 overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/[0.06] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setActivePage('faq');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View all FAQs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </BlowReveal>

      {/* 10. JOIN THE VIP WAITLIST SECTION */}
      <JoinWaitlistSection />

      {/* 11. FINAL CTA SECTION */}
      <BlowReveal direction="breeze" gustSweep as="section" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#121932] via-[#0d1326] to-[#070a14] border border-indigo-500/30 p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-[0_20px_50px_-15px_rgba(99,102,241,0.25)]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/35 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="relative z-10 text-3xl sm:text-4xl font-bold font-display text-white max-w-xl mx-auto leading-tight">
            Ready to build, create, and master high-income skills?
          </h2>

          <p className="relative z-10 text-sm sm:text-base text-neutral-300 max-w-lg mx-auto">
            Explore our curated catalog of digital products with instant automated access and lifetime updates.
          </p>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('All Products');
                setActivePage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold btn-premium-primary text-white shadow-xl shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setActivePage('ebooks');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold btn-premium-secondary text-neutral-200 transition-colors cursor-pointer"
            >
              Browse E-books Only
            </button>
          </div>
        </div>
      </BlowReveal>
    </div>
  );
};
