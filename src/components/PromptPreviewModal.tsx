import React, { useState } from 'react';
import { X, Terminal, Copy, Check, Sparkles, ShoppingBag, Lock, Unlock, Download } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { copyTextToClipboard } from '../utils/clipboard';

export const PromptPreviewModal: React.FC = () => {
  const {
    promptModalProduct,
    closePromptModal,
    addToCart,
    formatPrice,
    showToast,
    isProductPurchased,
    downloadItem
  } = useStore();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!promptModalProduct) return null;

  const ai = promptModalProduct.aiDetails;
  const examplePrompts = ai?.examplePrompts || [];
  const isPurchased = isProductPurchased(promptModalProduct.id);

  const handleCopy = async (text: string, idx: number) => {
    if (!isPurchased) {
      addToCart(promptModalProduct, 1);
      showToast('This prompt is locked. Added to cart to unlock!', 'info');
      return;
    }
    await copyTextToClipboard(text);
    setCopiedIndex(idx);
    showToast('Prompt copied to clipboard! Ready to paste into ChatGPT or Claude.', 'success');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleUnlockClick = () => {
    addToCart(promptModalProduct, 1);
    showToast(`Added "${promptModalProduct.title}" to cart to unlock full prompts!`, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-[#131b32]/95 via-[#0e1428]/95 to-[#080d1a] border border-white/[0.12] rounded-3xl shadow-[0_30px_70px_-15px_rgba(0,0,0,0.9),0_0_35px_-5px_rgba(99,102,241,0.22)] backdrop-blur-2xl flex flex-col overflow-hidden text-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${
              isPurchased
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
            }`}>
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold">
                  Interactive Prompt Vault
                </span>
                {isPurchased ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <Unlock className="w-2.5 h-2.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                {promptModalProduct.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={closePromptModal}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Status banner */}
          {isPurchased ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Unlock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-emerald-300">Purchased & Stored in Your Local Library</p>
                <p className="text-neutral-300 mt-0.5">
                  Full prompt templates, instructions, and 1-click clipboard copy are unlocked for your account.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs leading-relaxed">
                <p className="font-bold text-amber-300">Full Prompt Content is Protected & Locked</p>
                <p className="text-neutral-300 mt-0.5">
                  Users cannot view or copy the full prompt text unless this product is purchased and recorded in your local purchase history. Complete checkout to instantly unlock all prompt directives.
                </p>
              </div>
            </div>
          )}

          {/* Compatible tools pill row */}
          {ai?.compatibleTools && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-neutral-400 font-medium">Compatible with:</span>
              {ai.compatibleTools.map((tool, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px]"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}

          {/* Example Prompts List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                {isPurchased ? 'Unlocked Prompt Vault' : 'Vault Prompts (Locked)'} ({examplePrompts.length} of {ai?.promptCount || promptModalProduct.pagesOrCount})
              </h4>
              <span className="text-xs font-mono text-neutral-400">
                {isPurchased ? '1-Click Copy Ready' : 'Purchase Required to Reveal'}
              </span>
            </div>

            {examplePrompts.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 shrink-0">
                      {item.category}
                    </span>
                    <h5 className="text-sm font-bold text-white truncate">{item.title}</h5>
                  </div>

                  {isPurchased ? (
                    <button
                      type="button"
                      onClick={() => handleCopy(item.prompt, idx)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-all border border-neutral-700 cursor-pointer shrink-0"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleUnlockClick}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition-all border border-amber-500/30 cursor-pointer shrink-0"
                      title="Purchase to unlock full prompt"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unlock</span>
                    </button>
                  )}
                </div>

                {/* Prompt Text Box: Fully revealed ONLY if purchased */}
                {isPurchased ? (
                  <div className="p-3.5 rounded-lg bg-black/60 border border-neutral-800/80 font-mono text-xs text-neutral-300 leading-relaxed overflow-x-auto selection:bg-indigo-500">
                    {item.prompt}
                  </div>
                ) : (
                  <div className="relative p-4 rounded-xl bg-black/75 border border-neutral-800/80 overflow-hidden flex flex-col items-center justify-center text-center space-y-2 select-none">
                    <div className="filter blur-[5px] opacity-20 text-neutral-400 font-mono text-xs line-clamp-2 w-full text-left pointer-events-none">
                      Act as an elite prompt engineer. Formulate a multi-layered directive targeting [ROLE], utilizing custom framing with explicit constraints, negative guardrails, context tokens, and structured markdown output...
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Full Prompt Directive Locked</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 max-w-sm">
                      Full prompt text, parameters, and 1-click copy are protected until this product is purchased.
                    </p>
                  </div>
                )}

                {item.outputPreview && (
                  <div className="text-[11px] text-neutral-400 flex items-start gap-1.5 pt-1">
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>Expected Result: {item.outputPreview}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Call to action footer box */}
          {isPurchased ? (
            <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Digital License Active
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  All {ai?.promptCount || promptModalProduct.pagesOrCount} Prompts Unlocked
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Download offline package, JSON prompt schemas, and Notion templates.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => downloadItem(promptModalProduct)}
                  className="w-full sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full Vault</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-950/40 via-neutral-900 to-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                  Instant Access Deliverable
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">
                  Get all {ai?.promptCount || promptModalProduct.pagesOrCount} + JSON & Notion Vault
                </h4>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xl font-bold font-display text-white">
                  {formatPrice(promptModalProduct.price)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    addToCart(promptModalProduct, 1);
                    closePromptModal();
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buy Prompt Pack</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
