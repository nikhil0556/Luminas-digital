import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Share2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  DollarSign,
  Layers
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { downloadProductFile, downloadRawFile } from '../utils/fileDownloader';

export const EbookReaderModal: React.FC = () => {
  const { sampleModalProduct, closeSampleModal, addToCart, formatPrice, showToast, orders } = useStore();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'page' | 'toc'>('page');

  useEffect(() => {
    // Reset to page 1 whenever a new product modal opens
    setCurrentPage(1);
    setViewMode('page');
  }, [sampleModalProduct?.id]);

  if (!sampleModalProduct) return null;

  const ebook = sampleModalProduct.ebookDetails;
  const pdfPages = ebook?.pdfPages || [];
  const totalPages = pdfPages.length > 0 ? pdfPages.length : (ebook?.pages || 8);

  const activePageData = pdfPages.find(p => p.pageNumber === currentPage);

  const isAiCreator =
    sampleModalProduct.id === 'prod-ai-mega' ||
    sampleModalProduct.title.toLowerCase().includes('ai creator');

  const isPaidUser = orders.some(o =>
    o.items?.some(item => item.productId === sampleModalProduct.id)
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleDownload = () => {
    downloadProductFile(sampleModalProduct);
    showToast('Download started for ' + sampleModalProduct.title, 'success');
  };

  const handleDownloadSpecificBook = (bookId: string) => {
    const book = sampleModalProduct.bundledBooks?.find(b => b.id === bookId);
    if (book) {
      downloadRawFile(book.filename, book.downloadContent, 'application/pdf');
      showToast(`Downloading ${book.title}...`, 'success');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeSampleModal}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-[#131b32]/95 via-[#0e1428]/95 to-[#080d1a] border border-white/[0.12] rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_35px_-5px_rgba(99,102,241,0.22)] backdrop-blur-2xl flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.03] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.2 rounded font-bold">
                  {isAiCreator ? 'Official Opening E-Book' : 'Interactive Reader'}
                </span>
                <span className="text-xs text-neutral-400 truncate hidden sm:inline">
                  {isAiCreator ? 'By Nikhil Rajbhar (@nikhil0556__)' : 'Lumina Digital Publishing'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white truncate">
                {sampleModalProduct.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('page')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'page'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Page View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('toc')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'toc'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Index ({totalPages})
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeSampleModal}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors ml-1"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Control Bar */}
        {viewMode === 'page' && (
          <div className="px-4 sm:px-6 py-2 bg-neutral-900/95 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-300 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-400">Jump to:</span>
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="bg-neutral-800 border border-neutral-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>
                    Page {num}{pdfPages[num - 1]?.title ? `: ${pdfPages[num - 1].title}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-neutral-400 font-mono text-[11px]">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={handlePrevPage}
                  className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-white transition-colors"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={handleNextPage}
                  className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-white transition-colors"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950/70">
          {viewMode === 'toc' ? (
            /* Table of Contents view */
            <div className="max-w-2xl mx-auto space-y-4 py-4 animate-in fade-in">
              <h4 className="text-base font-bold font-display text-white border-b border-neutral-800 pb-2 flex items-center justify-between">
                <span>Document Index & Chapters</span>
                <span className="text-xs text-neutral-400 font-normal">{totalPages} Total Pages</span>
              </h4>
              <div className="space-y-2">
                {(ebook?.tableOfContents || []).map((chapter, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      setViewMode('page');
                    }}
                    className="p-3 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px] font-bold flex items-center justify-center border border-blue-500/20">
                        {i + 1}
                      </span>
                      <span className="text-neutral-200 group-hover:text-white font-medium">
                        {chapter}
                      </span>
                    </div>
                    <span className="text-[11px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read Page →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : activePageData ? (
            isAiCreator ? (
              /* THE ULTIMATE AI CREATOR: Authentic 22-page dark navy visual playbook */
              <div className="max-w-2xl mx-auto bg-[#0b1526] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1e293b] animate-in fade-in duration-150 text-slate-100">
                {/* Cover on Page 1 */}
                {currentPage === 1 && (
                  <div className="relative p-8 sm:p-10 bg-gradient-to-b from-[#112344] via-[#0d1a33] to-[#0b1526] text-center border-b-2 border-blue-900/40">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-[11px] font-mono text-blue-300 uppercase tracking-widest font-semibold mb-4">
                      September 18, 2026 Edition
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight">
                      The Ultimate AI Creator
                    </h1>
                    <p className="text-base sm:text-lg font-bold text-blue-300 mt-2 tracking-wide">
                      3,500+ AI Prompts for Creators and Freelancers
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                      <div className="font-semibold text-slate-200">
                        Presented to Creators and Marketers • For Creators
                      </div>
                      <div>Presented by Author: <strong className="text-white">Nikhil Rajbhar</strong></div>
                      <div className="text-blue-400 font-medium">Founder Nikhil Raj (@nikhil0556__)</div>
                    </div>
                  </div>
                )}

                {/* Header for Pages 2 to 22 */}
                {currentPage > 1 && (
                  <div className="px-6 py-4 bg-[#0e213d] text-white flex items-center justify-between border-b border-blue-800/40">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-blue-400 uppercase">
                        {activePageData.headerTag || `Page ${currentPage} of ${totalPages}`}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-white font-display">
                        {activePageData.title}
                      </h2>
                      {activePageData.subtitle && (
                        <p className="text-xs text-slate-300 font-medium">
                          {activePageData.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-200 flex items-center justify-center text-xs font-mono font-bold">
                      {currentPage}
                    </div>
                  </div>
                )}

                {/* Page Body */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Stat Callout (if present, e.g. Page 9, 11, 13, 15) */}
                  {activePageData.statCallout && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-700/60 shadow-md">
                      <div className="text-xl sm:text-2xl font-black text-blue-300 font-display">
                        {activePageData.statCallout.stat}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 mt-1">
                        {activePageData.statCallout.text}
                      </div>
                    </div>
                  )}

                  {/* Key Points Grid (if present) */}
                  {activePageData.keyPoints && activePageData.keyPoints.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activePageData.keyPoints.map((kp, kpIdx) => (
                        <div
                          key={kpIdx}
                          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1"
                        >
                          <div className="text-xs font-bold font-display uppercase tracking-wider text-blue-300">
                            {kp.title}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {kp.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Table Data (if present, e.g. Page 21 Monetization Ideas) */}
                  {activePageData.tableData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/90">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-950 text-blue-300 uppercase font-mono font-semibold text-[10px] border-b border-slate-800">
                          <tr>
                            {activePageData.tableData.headers.map((h, hIdx) => (
                              <th key={hIdx} className="px-3 py-2.5">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                          {activePageData.tableData.rows.map((r, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-800/40">
                              <td className="px-3 py-2 font-bold text-white">{r.item}</td>
                              <td className="px-3 py-2 text-slate-300">{r.description}</td>
                              <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{r.budget}</td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Standard Cards */}
                  {activePageData.cards?.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 shadow-md border border-slate-800 space-y-2.5 text-slate-200"
                    >
                      {card.title && (
                        <h3 className="text-sm sm:text-base font-black text-white font-display tracking-tight border-b border-slate-800 pb-1.5 flex items-center justify-between">
                          <span>{card.title}</span>
                          {card.badge && (
                            <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full font-bold">
                              {card.badge}
                            </span>
                          )}
                        </h3>
                      )}

                      {card.text && (
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-300 whitespace-pre-line font-normal">
                          {card.text}
                        </p>
                      )}

                      {card.bullets && card.bullets.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {card.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="text-xs sm:text-sm leading-relaxed flex items-start gap-2 text-slate-300">
                              <span className="text-blue-400 font-bold shrink-0 mt-0.5">•</span>
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {card.callout && (
                        <div className="mt-2.5 p-3 rounded-xl bg-blue-950/70 border border-blue-800/60 text-blue-200 text-xs font-semibold flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{card.callout}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Page 22 Back Cover Special Highlight */}
                  {currentPage === 22 && (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-700/60 text-center space-y-3">
                      <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center text-blue-400">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-white font-display">
                        Start Creating with The 7-Part Formula!
                      </h4>
                      <div className="text-xs text-slate-300 space-y-1 font-mono">
                        <div>DM Us: <span className="text-blue-300">@luminadigital.com</span></div>
                        <div>Support: <a href="mailto:raj.nikhil0556@gmail.com" className="text-blue-300 hover:underline">raj.nikhil0556@gmail.com</a></div>
                        <div>Founder: <span className="text-white">Nikhil Raj (@nikhil0556__)</span></div>
                      </div>
                    </div>
                  )}

                  {/* Bottom Footer */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>Nikhil Rajbhar • @nikhil0556__</span>
                    <div className="flex items-center gap-2">
                      {currentPage < totalPages ? (
                        <button
                          type="button"
                          onClick={handleNextPage}
                          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-colors"
                        >
                          Next: Page {currentPage + 1} →
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete 22-Page Playbook
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Generic PDF Page Rendering (e.g. Financially Free in Young Age) */
              <div className="max-w-2xl mx-auto bg-[#2563eb] rounded-2xl overflow-hidden shadow-2xl border-4 border-[#1d4ed8] animate-in fade-in duration-150 text-slate-900">
                {currentPage === 1 && (
                  <div className="relative p-6 sm:p-8 bg-gradient-to-b from-orange-400 via-amber-300 to-amber-200 text-center border-b-2 border-blue-700/30">
                    <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-950/60 uppercase tracking-wider font-semibold">
                      Lumina Digital Publishing
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 font-display tracking-tight leading-tight">
                      {sampleModalProduct.title}
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1.5 tracking-wide">
                      {sampleModalProduct.subtitle}
                    </p>
                  </div>
                )}

                {currentPage > 1 && (
                  <div className="px-6 py-4 bg-[#1d4ed8] text-white flex items-center justify-between border-b border-blue-500/40">
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-blue-200 uppercase">
                        Page {currentPage} of {totalPages}
                      </span>
                      <h2 className="text-sm sm:text-base font-black text-white font-display">
                        {activePageData.title}
                      </h2>
                      {activePageData.subtitle && (
                        <p className="text-[11px] text-blue-100/90 font-medium">
                          {activePageData.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-blue-500/40 text-white flex items-center justify-center text-xs font-mono font-bold">
                      {currentPage}
                    </div>
                  </div>
                )}

                <div className="p-4 sm:p-6 space-y-4">
                  {activePageData.cards?.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-4 sm:p-5 rounded-2xl bg-white shadow-md border border-blue-100 space-y-2.5 text-slate-900"
                    >
                      {card.title && (
                        <h3 className="text-sm sm:text-base font-black text-slate-950 font-display tracking-tight border-b border-slate-100 pb-1.5 flex items-center justify-between">
                          <span>{card.title}</span>
                          {card.badge && (
                            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                              {card.badge}
                            </span>
                          )}
                        </h3>
                      )}

                      {card.text && (
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-line font-normal">
                          {card.text}
                        </p>
                      )}

                      {card.bullets && card.bullets.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {card.bullets.map((b, bIdx) => (
                            <div key={bIdx} className="text-xs sm:text-sm leading-relaxed flex items-start gap-2 text-slate-800">
                              <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {card.callout && (
                        <div className="mt-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs font-semibold flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">{card.callout}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-white/90 font-medium px-1">
                    <span>Author: @nikhil0556__</span>
                    <div className="flex items-center gap-2">
                      {currentPage < totalPages ? (
                        <button
                          type="button"
                          onClick={handleNextPage}
                          className="text-xs font-bold text-white bg-blue-700/80 hover:bg-blue-700 px-3 py-1 rounded-lg transition-colors"
                        >
                          Next: Page {currentPage + 1} →
                        </button>
                      ) : (
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete Guide
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Fallback generic chapter text reader */
            <div className="max-w-2xl mx-auto bg-neutral-900 p-6 rounded-2xl border border-neutral-800 space-y-4">
              <h4 className="text-lg font-bold text-white font-display">
                {ebook?.sampleChapterTitle}
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {ebook?.sampleChapterContent}
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-4 sm:px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isAiCreator
                ? 'Official 2-in-1 Release • Authored by Nikhil Rajbhar (@nikhil0556__)'
                : 'Official digital edition by Lumina Digital & @nikhil0556__'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {sampleModalProduct.bundledBooks && sampleModalProduct.bundledBooks.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleDownloadSpecificBook('book-opening-playbook')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center gap-1.5 transition-colors"
                  title="Download Book 1 PDF (22 Pages)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Book 1 (22p)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSpecificBook('book-main-3500-prompts')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center gap-1.5 transition-colors"
                  title="Download Book 2 PDF (248 Pages)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Book 2 (248p)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            )}

            {!isPaidUser && (
              <button
                type="button"
                onClick={() => {
                  addToCart(sampleModalProduct, 1);
                  closeSampleModal();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-lg shadow-blue-600/20 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Get Both E-Books ({formatPrice(sampleModalProduct.price)})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
