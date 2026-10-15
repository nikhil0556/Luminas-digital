import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  Download,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Check,
  Star,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Code,
  Search,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import {
  ULTIMATE_AI_CREATOR_PAGES,
  MEGAPACK_35_CATEGORIES,
  SAMPLE_3500_PROMPTS
} from '../data/ultimateAiCreatorData';
import { downloadRawFile } from '../utils/fileDownloader';

export const UltimateAiCreatorSection: React.FC = () => {
  const {
    products,
    openSampleModal,
    addToCart,
    showToast,
    formatPrice,
    orders,
    navigateToProduct
  } = useStore();

  const { userPurchases } = useAuth();

  const [activeTab, setActiveTab] = useState<'both' | 'opening-book' | 'main-megapack'>('both');
  const [selectedCategory, setSelectedCategory] = useState<string>('Copywriting');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Find the product
  const aiCreatorProduct = products.find(p => p.id === 'prod-ai-mega') || products[0];

  // Check if user has purchased this product
  const isPaidUser = orders.some(o =>
    o.items?.some(item => item.productId === 'prod-ai-mega')
  ) || (userPurchases && userPurchases.some(p => p.productId === 'prod-ai-mega'));

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    showToast('Prompt copied to clipboard! Paste into ChatGPT or Claude.', 'success');
    setTimeout(() => {
      setCopiedPromptId(null);
    }, 2500);
  };

  const handleDownloadBook1 = () => {
    if (!isPaidUser) {
      showToast('Please purchase the bundle to download the full 22-page master PDF.', 'info');
      addToCart(aiCreatorProduct, 1);
      return;
    }
    const book1 = aiCreatorProduct.bundledBooks?.find(b => b.id === 'book-opening-playbook');
    if (book1) {
      downloadRawFile(book1.filename, book1.downloadContent, 'application/pdf');
      showToast('Downloading Book 1: The Ultimate AI Creator (22-Page Playbook)...', 'success');
    }
  };

  const handleDownloadBook2 = () => {
    if (!isPaidUser) {
      showToast('Please purchase the bundle to download the 248-page 3,500 prompts PDF.', 'info');
      addToCart(aiCreatorProduct, 1);
      return;
    }
    const book2 = aiCreatorProduct.bundledBooks?.find(b => b.id === 'book-main-3500-prompts');
    if (book2) {
      downloadRawFile(book2.filename, book2.downloadContent, 'application/pdf');
      showToast('Downloading Book 2: 3,500 Prompts Master Library (248 Pages)...', 'success');
    }
  };

  const filteredPrompts = SAMPLE_3500_PROMPTS.filter(p =>
    p.category.toLowerCase().includes(selectedCategory.toLowerCase())
  );
  const displayPrompts = filteredPrompts.length > 0 ? filteredPrompts : SAMPLE_3500_PROMPTS.slice(0, 3);

  return (
    <section
      id="ultimate-ai-creator-section"
      className="py-14 sm:py-20 bg-gradient-to-b from-[#090f22] via-[#0d1530] to-[#070b18] text-white relative overflow-hidden border-y border-white/[0.08] blow-on-reach"
    >
      {/* Subtle background ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-subtle mask-radial-faded opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold mb-3 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Official 2-in-1 Dual E-Book Release • September 18, 2026 Edition</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
              The Ultimate AI Creator & Business Tool
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-300 max-w-3xl">
              Two comprehensive digital PDF books engineered by <strong className="text-white">Nikhil Rajbhar</strong>. Includes the <strong className="text-blue-300">22-Page Opening Visual Playbook</strong> and the complete <strong className="text-indigo-300">248-Page 3,500 Prompts Master Library</strong>. Both accessible once paid.
            </p>
          </div>

          {/* Paid / Unpaid Status Card */}
          <div className="shrink-0">
            {isPaidUser ? (
              <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 backdrop-blur-md shadow-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                    License Active
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Full Access to Both E-Books Unlocked
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(aiCreatorProduct, 1)}
                  className="px-6 py-3.5 rounded-xl btn-premium-primary text-white font-bold text-sm shadow-xl shadow-indigo-600/35 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Get Both E-Books — {formatPrice(aiCreatorProduct.price)}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-black/40 border border-white/[0.08] rounded-2xl mb-8 max-w-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'both'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Both E-Books Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('opening-book')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'opening-book'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Book 1: Opening Guide (22 Pages)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('main-megapack')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'main-megapack'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Book 2: 3,500 Prompts (248 Pages)</span>
          </button>
        </div>

        {/* Tab 1: BOTH E-BOOKS DUAL PRESENTATION */}
        {(activeTab === 'both' || activeTab === 'opening-book') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* BOOK 1 CARD */}
            <div className="bg-gradient-to-b from-[#131b32]/90 via-[#0e1428]/95 to-[#080d1a] rounded-3xl border border-white/[0.1] hover:border-blue-500/40 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_15px_35px_-10px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_25px_50px_-12px_rgba(59,130,246,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-900/50 text-blue-300 border border-blue-700/40">
                    File 1 • E-Book Opening Source
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    22 Illustrated Pages
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white font-display">
                  The Ultimate AI Creator: Visual Playbook
                </h3>
                <p className="text-xs font-medium text-blue-300 mt-1">
                  By Nikhil Rajbhar • Founder Nikhil Raj (@nikhil0556__)
                </p>

                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  The opening visual sourcebook engineered for creators, freelancers, and marketers. Provides actionable frameworks across 22 structured pages:
                </p>

                {/* 4 Key Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-blue-300">The 7-Part Formula</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Role, Context, Goal, Constraints, Inputs, Output, QA
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-blue-300">Copywriting Essentials</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      70% CTR boost frameworks for hooks, captions & ads
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-blue-300">Coding & QA Vault</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      75% automation success rate & debugging protocols
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-blue-300">Monetization Matrix</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      $250, $750, and $2,000 monthly target roadmaps
                    </div>
                  </div>
                </div>

                {/* Table of contents mini badge list */}
                <div className="text-xs text-slate-400 mb-6">
                  <span className="font-semibold text-slate-300">Includes: </span>
                  AI Basics • Iteration Loop • SEO Prompt Vault • Viral Video Vault • Freelancer SOPs • Personal Prompt Second Brain • Official Support.
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openSampleModal(aiCreatorProduct)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Read 22-Page Opening E-Book</span>
                </button>

                {isPaidUser ? (
                  <button
                    type="button"
                    onClick={handleDownloadBook1}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Book 1 PDF (22 Pages)</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Full PDF unlocks when paid</span>
                  </div>
                )}
              </div>
            </div>

            {/* BOOK 2 CARD */}
            <div className="bg-gradient-to-b from-[#131b32]/90 via-[#0e1428]/95 to-[#080d1a] rounded-3xl border border-white/[0.1] hover:border-indigo-500/40 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_15px_35px_-10px_rgba(0,0,0,0.8)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_25px_50px_-12px_rgba(99,102,241,0.25)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5">
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-900/50 text-indigo-300 border border-indigo-700/40">
                    File 2 • Main 3,500 Prompt Library
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    248 PDF Pages
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white font-display">
                  The Ultimate AI Creator & Business Mega-Pack
                </h3>
                <p className="text-xs font-medium text-indigo-300 mt-1">
                  3,500 Original, Practical AI Prompts across 35 Business Sectors
                </p>

                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  The master reference book. 3,500 field-calibrated prompt formulas (numbered 0001 to 3500) covering every modern marketing, product, creative, and operational requirement:
                </p>

                {/* 4 Key Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-indigo-300">35 Core Sectors</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Copywriting, SEO, Coding, Social Media, Sales, SOPs
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-indigo-300">7-Day Implementation</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Step-by-step rollout plan on Page 248 of the book
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-indigo-300">Master Quality Checklist</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      10-point verification to eliminate AI hallucinations
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="text-xs font-bold text-indigo-300">Multi-Model Compatible</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      ChatGPT Plus, Claude 3.5 Sonnet, Gemini, Midjourney
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mb-6">
                  <span className="font-semibold text-slate-300">Format: </span>
                  Full 248-Page Master PDF Book + JSON/CSV Prompt Vault for Notion & Spreadsheet import.
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('main-megapack')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4 text-indigo-400" />
                  <span>Browse 35 Categories (3,500 Prompts)</span>
                </button>

                {isPaidUser ? (
                  <button
                    type="button"
                    onClick={handleDownloadBook2}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Book 2 PDF (248 Pages)</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Full 248-page PDF unlocks when paid</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 or 3: INTERACTIVE 35-CATEGORY EXPLORER */}
        {(activeTab === 'both' || activeTab === 'main-megapack') && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  Book 2 Directory • 3,500 Prompts Matrix
                </span>
                <h3 className="text-2xl font-black text-white font-display mt-0.5">
                  Explore The 35 Core Categories
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Click any category to view its prompt range, book pages, and sample battle-tested prompt.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Total Prompts:</span>
                <span className="px-3 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded-full font-mono text-xs font-bold">
                  3,500 Prompts
                </span>
              </div>
            </div>

            {/* 35 Category Chips Scroll Container */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
              {MEGAPACK_35_CATEGORIES.map(cat => {
                const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cat.promptRange}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Category Details & Live Prompt Showcase */}
            {(() => {
              const matchedCat = MEGAPACK_35_CATEGORIES.find(
                c => c.name.toLowerCase() === selectedCategory.toLowerCase()
              ) || MEGAPACK_35_CATEGORIES[0];

              return (
                <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white font-display flex items-center gap-2">
                        <span>{matchedCat.name}</span>
                        <span className="text-xs font-normal text-slate-400">
                          (Pages {matchedCat.pages} in Book 2)
                        </span>
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {matchedCat.desc}
                      </p>
                    </div>

                    <div className="text-xs font-mono text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-lg border border-indigo-800/40 font-bold">
                      Prompts {matchedCat.promptRange}
                    </div>
                  </div>

                  {/* Sample Prompts for this category */}
                  <div className="space-y-4">
                    {displayPrompts.map(p => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-indigo-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded">
                              Prompt #{p.id}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {p.type || p.category}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyPrompt(p.id, p.prompt)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            {copiedPromptId === p.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>1-Click Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
                          {p.prompt}
                        </p>

                        {p.variables && p.variables.length > 0 && (
                          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              Variables:
                            </span>
                            {p.variables.map((v, vIdx) => (
                              <span
                                key={vIdx}
                                className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700"
                              >
                                [{v}]
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Purchase Callout & Trust Footer */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant Digital Delivery • Immediate Post-Payment Access</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white font-display">
              Get Both E-Books For {formatPrice(aiCreatorProduct.price)}{' '}
              <span className="text-sm font-normal text-slate-400 line-through ml-2">
                {formatPrice(aiCreatorProduct.originalPrice || 59)}
              </span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Once paid, both PDF books (22 Pages Opening Guide & 248 Pages 3,500 Prompts Master Library) and all raw prompt vaults unlock immediately for high-speed download and web reading.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isPaidUser ? (
              <>
                <button
                  type="button"
                  onClick={handleDownloadBook1}
                  className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Book 1</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadBook2}
                  className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Book 2</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openSampleModal(aiCreatorProduct)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Read 22-Page Sample</span>
                </button>

                <button
                  type="button"
                  onClick={() => addToCart(aiCreatorProduct, 1)}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy Both E-Books ({formatPrice(aiCreatorProduct.price)})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
