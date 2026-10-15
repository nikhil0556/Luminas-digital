import React from 'react';
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  Download,
  Lock,
  Star,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Palette,
  Terminal,
  Layers,
  Zap,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PdfBooksPromptsSectionProps {
  className?: string;
  id?: string;
}

export const PdfBooksPromptsSection: React.FC<PdfBooksPromptsSectionProps> = ({
  className = '',
  id = 'pdf-books-prompts-section'
}) => {
  const {
    products,
    addToCart,
    navigateToProduct,
    formatPrice,
    isProductPurchased,
    downloadItem
  } = useStore();

  const prod100 = products.find(p => p.id === 'prod-chatgpt-100-slash');
  const prod50 = products.find(p => p.id === 'prod-editing-designing-50-slash');
  const prodBundle = products.find(p => p.id === 'prod-prompts-duo-bundle-20');

  const isPurchased100 = isProductPurchased('prod-chatgpt-100-slash');
  const isPurchased50 = isProductPurchased('prod-editing-designing-50-slash');
  const isPurchasedBundle = isProductPurchased('prod-prompts-duo-bundle-20');

  return (
    <section id={id} className={`space-y-8 scroll-mt-24 blow-on-reach ${className}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>OFFICIAL DIGITAL PDF BOOK SECTION • {formatPrice(1699)} (~$20)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Official ChatGPT “/” Prompt PDF Books & Guides
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Due to intellectual property and premium curation, our full 100-prompt personal help vault and 50-prompt editing/designing collections are officially published as comprehensive, downloadable high-resolution PDF books at <strong>{formatPrice(1699)}</strong> (~$20) each.
          </p>
        </div>

        {/* Guarantee Pill */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Instant PDF Download + Unlocks Web Copy Vault</span>
        </div>
      </div>

      {/* Special 2-in-1 Combo Offer Banner if bundle exists */}
      {prodBundle && (
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/80 to-cyan-950/70 border-2 border-indigo-500/40 p-6 sm:p-8 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  SPECIAL DUO COMBO • BOTH BOOKS FOR {formatPrice(prodBundle.price)} (~$20)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-900/90 text-neutral-200 border border-neutral-700">
                  9 Pages Total
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-900/90 text-neutral-200 border border-neutral-700">
                  150 Slash Prompts
                </span>
              </div>

              <h3 className="text-xl sm:text-3xl font-bold font-display text-white">
                The Ultimate 150 “/” Prompts PDF Books Duo
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Get <strong>both</strong> official PDF books together: <em>50 Trending One-Word Prompts for Edits & Designs</em> + <em>100 Trending ChatGPT Prompts for Personal Help & Productivity</em>. Includes instant PDF downloads and lifetime unlocked copy access to both web vaults for just <strong>{formatPrice(prodBundle.price)}</strong> (~$20).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Book 1: 50 Prompts for Photo, Visuals & Designs (5-Page PDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Book 2: 100 Prompts for Personal Help & Productivity (4-Page PDF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlocks 1-Click Copy on all 150 commands in the Web Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Printable A4 & US Letter Cheatsheets included</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-950/80 border border-indigo-500/30 rounded-2xl p-5 shrink-0 text-center space-y-4 min-w-[240px] backdrop-blur-md">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                  Complete Duo Package
                </div>
                <div className="flex items-baseline justify-center gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-bold font-display text-white">
                    {formatPrice(prodBundle.price)}
                  </span>
                  <span className="text-sm text-neutral-500 line-through">
                    {formatPrice(prodBundle.originalPrice || 40)}
                  </span>
                </div>
                <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Best Value • Both Books
                </span>
              </div>

              {isPurchasedBundle ? (
                <button
                  type="button"
                  onClick={() => downloadItem(prodBundle)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Both PDF Books</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => addToCart(prodBundle, 1)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Buy Both Books ({formatPrice(prodBundle.price)})</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigateToProduct(prodBundle.slug)}
                className="w-full text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                View Full Bundle Breakdown →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The Two Individual $20 PDF Books Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book 1: 50 Prompts for Edits & Designs ($20) */}
        {prod50 && (
          <div className="relative rounded-3xl bg-gradient-to-b from-[#131b2e]/90 via-[#0e1424]/95 to-[#080d1a] border border-white/[0.09] p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-400/40 backdrop-blur-xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_45px_-12px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_28px_55px_-12px_rgba(99,102,241,0.25)] group hover:-translate-y-1.5">
            <div className="space-y-5">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    PDF BOOK #1 • {formatPrice(prod50.price)} (~$20)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                    5-Page PDF Guide
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-white">4.99</span>
                  <span className="text-neutral-500">(247 reviews)</span>
                </div>
              </div>

              {/* Book Title & Description */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                  ChatGPT 50 “/” Prompts for Edits & Designs
                </h3>
                <p className="text-xs sm:text-sm text-indigo-300/90 font-medium mt-1">
                  Official 5-Page PDF Cheatsheet & Guide • Photo, Aesthetics, Social Layouts & Materials
                </p>
                <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed">
                  Calibrated single-keyword slash directives for visual editing, AI image restyling, lighting effects, and social design. Features /Cinematic, /Luxury, /Minimal, /Cyberpunk, /3D, /Story, /OldMoney, /Chrome, /Glass, and 41 more directives.
                </p>
              </div>

              {/* Table of Contents Highlights */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2 backdrop-blur-md">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-neutral-400 block">
                  Included in this 5-Page PDF Book:
                </span>
                <ul className="text-xs text-neutral-300 space-y-1.5 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Page 1:</strong> Photo & Lighting (/Cinematic, /Portrait, /Product, /Studio, /Neon, /Dramatic...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Page 2:</strong> Aesthetic & Mood (/Luxury, /Minimal, /Vibrant, /Futuristic, /Pastel, /Vintage...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Page 3:</strong> Social & Formats (/Poster, /Flyer, /Thumbnail, /Story 9:16, /Reel, /Carousel...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Pages 4-5:</strong> Fashion, Lifestyle & Materials (/OldMoney, /3D, /Glitch, /Chrome, /Glass...)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions & Price */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Official PDF Book Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-display text-white">
                    {formatPrice(prod50.price)}
                  </span>
                  <span className="text-xs text-neutral-500 line-through">
                    {formatPrice(prod50.originalPrice || 40)}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                    50% OFF
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigateToProduct(prod50.slug)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-neutral-200 transition-colors border border-white/[0.1] text-center cursor-pointer"
                >
                  Details
                </button>

                {isPurchased50 ? (
                  <button
                    type="button"
                    onClick={() => downloadItem(prod50)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(prod50, 1)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold btn-premium-primary text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy PDF Book ({formatPrice(prod50.price)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Book 2: 100 Prompts for Personal Help & Productivity ($20) */}
        {prod100 && (
          <div className="relative rounded-3xl bg-gradient-to-b from-[#0e1c2b]/90 via-[#0a1524]/95 to-[#070e1a] border border-white/[0.09] p-6 sm:p-8 flex flex-col justify-between hover:border-cyan-400/40 backdrop-blur-xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_45px_-12px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_28px_55px_-12px_rgba(6,182,212,0.25)] group hover:-translate-y-1.5">
            <div className="space-y-5">
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
                    PDF BOOK #2 • {formatPrice(prod100.price)} (~$20)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                    4-Page PDF Cheatsheet
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="font-bold text-white">4.99</span>
                  <span className="text-neutral-500">(382 reviews)</span>
                </div>
              </div>

              {/* Book Title & Description */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                  ChatGPT 100 “/” Prompts for Personal Help
                </h3>
                <p className="text-xs sm:text-sm text-cyan-300/90 font-medium mt-1">
                  Official 4-Page PDF Cheatsheet & Master Guide • Personal Help, Writing, Coding, Study & Business
                </p>
                <p className="text-xs text-neutral-300 mt-2.5 leading-relaxed">
                  Turn ChatGPT into a high-precision command-line engine for your daily tasks. 100 battle-tested slash-style prompt commands covering Personal Help, Productivity, Writing, Exam Prep, Coding, Business, Creative, and Marketing.
                </p>
              </div>

              {/* Table of Contents Highlights */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2 backdrop-blur-md">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-neutral-400 block">
                  Included in this 4-Page PDF Book:
                </span>
                <ul className="text-xs text-neutral-300 space-y-1.5 font-sans">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Page 1:</strong> Productivity, Writing & Study Prep (/plan, /prioritize, /rewrite, /outline, /explain...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Page 2:</strong> Study Prep, Coding & Tech Shortcuts, Business (/code, /debug, /optimize, /refactor, /resume...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Page 3:</strong> Creative, Personal Help & Social (/poem, /motivate, /budget, /mealplan, /hashtags...)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Page 4:</strong> Marketing Campaigns & Custom Instructions Hotkey Setup (96–100)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions & Price */}
            <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Official PDF Book Price
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-display text-white">
                    {formatPrice(prod100.price)}
                  </span>
                  <span className="text-xs text-neutral-500 line-through">
                    {formatPrice(prod100.originalPrice || 40)}
                  </span>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                    50% OFF
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigateToProduct(prod100.slug)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-neutral-200 transition-colors border border-white/[0.1] text-center cursor-pointer"
                >
                  Details
                </button>

                {isPurchased100 ? (
                  <button
                    type="button"
                    onClick={() => downloadItem(prod100)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => addToCart(prod100, 1)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Buy PDF Book ({formatPrice(prod100.price)})</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
