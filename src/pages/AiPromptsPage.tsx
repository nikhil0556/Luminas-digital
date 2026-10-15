import React, { useState } from 'react';
import {
  Sparkles,
  Terminal,
  Copy,
  Check,
  Bot,
  Cpu,
  ArrowRight,
  Eye,
  ShoppingBag,
  Search,
  Flame,
  Zap,
  Compass,
  Lock,
  Unlock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyTextToClipboard } from '../utils/clipboard';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ProductGridSkeleton';
import { AI_PROMPT_SUBCATEGORIES } from '../data/initialProducts';
import { SlashPromptsViewer } from '../components/SlashPromptsViewer';
import { PdfBooksPromptsSection } from '../components/PdfBooksPromptsSection';
import { BlowReveal } from '../components/BlowReveal';

export const AiPromptsPage: React.FC = () => {
  const {
    products,
    openPromptModal,
    addToCart,
    formatPrice,
    isLoadingProducts,
    isProductPurchased,
    showToast
  } = useStore();

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All AI Prompts');
  const [activeCopied, setActiveCopied] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'all' | 'trending-vault'>('all');

  const isMegaPackPurchased = isProductPurchased('prod-ai-mega');

  const handleSubcategoryChange = (sub: string) => {
    if (selectedSubcategory === sub) return;
    setIsTransitioning(true);
    setSelectedSubcategory(sub);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 280);
  };

  const isLoading = isLoadingProducts || isTransitioning;

  const promptProducts = products.filter(
    p => p.category === 'AI Prompts' || p.category === 'Prompt Packs' || p.aiDetails !== undefined
  );

  const filteredPromptProducts = promptProducts.filter(p => {
    if (selectedSubcategory === 'All AI Prompts') return true;
    const cat = selectedSubcategory;
    if (p.tags.includes(cat)) return true;
    if (p.aiDetails?.categoriesIncluded.includes(cat)) return true;
    return false;
  });

  const handleCopyPrompt = async (text: string, id: string) => {
    if (id === 'hero-test-prompt' && !isMegaPackPurchased) {
      const prod = products.find(p => p.id === 'prod-ai-mega');
      if (prod) addToCart(prod, 1);
      showToast('This prompt is locked. Added Mega-Pack to cart to unlock!', 'info');
      return;
    }
    await copyTextToClipboard(text);
    setActiveCopied(id);
    showToast('Prompt copied to clipboard!', 'success');
    setTimeout(() => setActiveCopied(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Hero Header */}
      <BlowReveal direction="breeze" gustSweep>
        <div className="text-center max-w-3xl mx-auto space-y-4 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Curated AI Engineering & Production Vaults</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white tracking-tight">
            Engineered AI Prompts & Slash Packs
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Stop prompting with vague questions and getting generic robotic fluff. Unlock calibrated prompt vaults and slash-style shortcuts tested on GPT-4o, Claude 3.5 Sonnet, and Gemini.
          </p>

          {/* Quick Nav Switcher */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#pdf-books-prompts-section"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-all shadow-lg shadow-emerald-900/20 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official PDF Books ($20 Each)</span>
              <ArrowRight className="w-3 h-3" />
            </a>
            <a
              href="#trending-slash-section"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 transition-all shadow-lg shadow-cyan-900/20 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trending: 100 ChatGPT '/' Prompts</span>
              <ArrowRight className="w-3 h-3" />
            </a>
            <a
              href="#all-prompt-packs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] text-neutral-300 border border-white/[0.09] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-neutral-400" />
              <span>Browse All Packs ({promptProducts.length})</span>
            </a>
          </div>
        </div>
      </BlowReveal>

      {/* DEDICATED OFFICIAL PDF BOOK SECTION ($20 EACH) */}
      <PdfBooksPromptsSection id="pdf-books-prompts-section" />

      {/* DEDICATED TRENDING AI PROMPT SECTION */}
      <BlowReveal direction="left" gustSweep as="section">
        <div id="trending-slash-section" className="space-y-6 pt-2 scroll-mt-24">
          <div className="p-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-emerald-500/20">
            <div className="bg-neutral-950/90 rounded-[22px] p-6 sm:p-8 space-y-6 border border-cyan-500/30 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    <Flame className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <span>TRENDING AI PROMPT SECTION</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                    100 Trending ChatGPT "/" Prompts
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
                    A quick-reference cheatsheet of slash-style prompt commands, grouped across 8 high-velocity categories. Includes 1-click copy, live search, and full 4-page guide structure.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-cyan-400">
                    100 Commands Loaded
                  </span>
                </div>
              </div>

              {/* Embedded Live Interactive Slash Prompts Viewer */}
              <SlashPromptsViewer showHeroBanner={false} />
            </div>
          </div>
        </div>
      </BlowReveal>

      {/* Interactive Quick-Test Prompt Playground Banner */}
      <BlowReveal direction="breeze" gustSweep>
        <div className="rounded-2xl bg-gradient-to-b from-[#131b32]/90 via-[#0e1428]/95 to-[#080d1a] border border-white/[0.12] p-6 sm:p-8 space-y-4 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              Direct Marketing Prompt from the 3,500+ Mega-Pack
            </h3>
          </div>
          <div>
            {isMegaPackPurchased ? (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <Unlock className="w-3 h-3" /> Unlocked in Your Library
              </span>
            ) : (
              <span className="text-xs font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                <Lock className="w-3 h-3" /> Locked • Mega-Pack Required
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] relative backdrop-blur-md">
          {isMegaPackPurchased ? (
            <>
              <p className="font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed">
                <span className="text-indigo-400 font-bold">System:</span> Act as an elite direct-response growth marketer.<br />
                <span className="text-emerald-400 font-bold">Prompt:</span> I am selling [PRODUCT_NAME] to [GEN_Z_AUDIENCE]. The primary pain point is [PAIN_POINT]. Generate 3 high-converting landing page hooks using psychological pattern interrupts. Remove all corporate jargon like "revolutionize" or "supercharge".
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-800/80">
                <span className="text-[11px] text-neutral-400">
                  Compatible with ChatGPT, Claude 3.5 Sonnet, and Gemini Pro
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyPrompt(
                      `Act as an elite direct-response growth marketer. I am selling [PRODUCT_NAME] to [GEN_Z_AUDIENCE]. The primary pain point is [PAIN_POINT]. Generate 3 high-converting landing page hooks using psychological pattern interrupts. Remove all corporate jargon like "revolutionize" or "supercharge".`,
                      'hero-test-prompt'
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700 cursor-pointer"
                >
                  {activeCopied === 'hero-test-prompt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-3">
              <div className="filter blur-[5px] opacity-20 text-neutral-400 font-mono text-xs line-clamp-1 pointer-events-none select-none">
                System: Act as an elite direct-response growth marketer. Prompt: I am selling [PRODUCT_NAME] to [GEN_Z_AUDIENCE]...
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Full Prompt Directive Locked</span>
              </div>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Full prompt directives and system templates from "The Ultimate AI Creator & Business Mega-Pack" are locked. Complete checkout to store this product in your local purchase history and unlock full prompt text.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const prod = products.find(p => p.id === 'prod-ai-mega');
                    if (prod) {
                      addToCart(prod, 1);
                      showToast('Added Mega-Pack to cart to unlock!', 'info');
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Unlock 3,500+ Mega-Pack ($29)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BlowReveal>

      {/* Subcategory Pills */}
      <div id="all-prompt-packs" className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Browse Prompt Specialties
          </h3>
          <span className="text-xs text-neutral-400">
            {filteredPromptProducts.length} Premium Packs Available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {AI_PROMPT_SUBCATEGORIES.map(sub => {
            const isSelected = selectedSubcategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => handleSubcategoryChange(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt Packs Products Grid / Skeleton Loading */}
      {isLoading ? (
        <ProductGridSkeleton count={3} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPromptProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* How to use AI Prompts Information box */}
      <BlowReveal direction="up" gustSweep as="section" className="p-8 sm:p-10 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-6">
        <div className="max-w-xl">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
            Quick Tutorial
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-1">
            How to Use Lumina Prompt Vaults
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Our prompt packs are engineered with strict parameter brackets to give you instant executive-level outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 hover-breeze">
            <span className="text-indigo-400 font-mono text-xs font-bold">STEP 01</span>
            <h4 className="text-sm font-bold text-white">Choose & Copy Prompt</h4>
            <p className="text-xs text-neutral-400">
              Browse your downloaded Notion vault or plain text file and copy any calibrated prompt with 1 click.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 hover-breeze">
            <span className="text-emerald-400 font-mono text-xs font-bold">STEP 02</span>
            <h4 className="text-sm font-bold text-white">Fill in Your Parameters</h4>
            <p className="text-xs text-neutral-400">
              Replace bracketed fields like &#123;target_audience&#125; or &#123;product_goal&#125; with your exact business details.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 hover-breeze">
            <span className="text-purple-400 font-mono text-xs font-bold">STEP 03</span>
            <h4 className="text-sm font-bold text-white">Paste & Get Elite Results</h4>
            <p className="text-xs text-neutral-400">
              Paste directly into ChatGPT, Claude 3.5, or Gemini. Experience human-quality, high-converting outputs immediately.
            </p>
          </div>
        </div>
      </BlowReveal>
    </div>
  );
};
