import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  Mail,
  ShieldCheck,
  Zap,
  ExternalLink,
  BookOpen,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  Search,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { downloadDigitalProduct, downloadRawFile } from '../utils/fileDownloader';
import { copyTextToClipboard } from '../utils/clipboard';

export const AccessPage: React.FC = () => {
  const { currentOrder, orders, products, openSampleModal, showToast, setActivePage, settings } = useStore();
  const supportEmail = settings?.supportEmail || 'raj.nikhil0556@gmail.com';
  const { user } = useAuth();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Search order state if coming directly
  const [lookupEmail, setLookupEmail] = useState('');
  const [activeViewOrder, setActiveViewOrder] = useState(currentOrder || orders[0] || null);

  useEffect(() => {
    if (currentOrder) {
      setActiveViewOrder(currentOrder);
    } else if (orders.length > 0) {
      setActiveViewOrder(orders[0]);
    }
  }, [currentOrder, orders]);

  const handleDownload = async (product: any) => {
    setDownloadingId(product.id);
    showToast(`Preparing verified download for "${product.title}"...`, 'info');
    try {
      await downloadDigitalProduct(product, {
        userId: user?.uid,
        orderNumber: activeViewOrder?.orderNumber,
        email: activeViewOrder?.customerEmail || user?.email || undefined
      });
      showToast(`Downloaded "${product.title}" successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Download failed. Please check your purchase verification.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const copyOrderId = async (id: string) => {
    await copyTextToClipboard(id);
    setCopiedOrderId(true);
    showToast('Order ID copied to clipboard', 'success');
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    const found = orders.find(
      o => o.customerEmail.toLowerCase() === lookupEmail.toLowerCase().trim() ||
           o.orderNumber.toLowerCase() === lookupEmail.toLowerCase().trim()
    );
    if (found) {
      setActiveViewOrder(found);
      showToast('Order found!', 'success');
    } else {
      showToast('No orders found for this email/order ID.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* If an active order is selected */}
      {activeViewOrder ? (
        <div className="space-y-8 animate-in fade-in">
          {/* Top Banner */}
          <div className="text-center space-y-3 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-block text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              Payment Confirmed • Immediate Delivery
            </span>

            <h1 className="text-2xl sm:text-4xl font-bold font-display text-white">
              Thank You for Your Order!
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
              Your digital materials are ready to download immediately. We have also emailed an encrypted access backup to <strong className="text-white">{activeViewOrder.customerEmail}</strong>.
            </p>

            {/* Order token card */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 mt-2">
              <span>Order Ref: <strong className="font-mono text-white">{activeViewOrder.orderNumber}</strong></span>
              <button
                type="button"
                onClick={() => copyOrderId(activeViewOrder.orderNumber)}
                className="text-neutral-400 hover:text-white"
                title="Copy order number"
              >
                {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Download Items List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-lg font-bold font-display text-white">
                Your Downloadable Files ({activeViewOrder.items.length})
              </h2>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Lifetime Access Active
              </span>
            </div>

            <div className="space-y-4">
              {activeViewOrder.items.map((item, idx) => {
                const prod = item.product || products.find(p => p.id === item.productId) || item;
                const prodId = prod.id || item.productId || `item-${idx}`;
                const isDownloading = downloadingId === prodId;
                const bundled = prod.bundledBooks || item.bundledBooks;

                return (
                  <div
                    key={prodId}
                    className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 transition-all hover:border-neutral-700"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-500/20 text-indigo-300">
                            {prod.format || item.format}
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {prod.fileSize || 'Digital Asset'}
                          </span>
                          <span className="text-xs text-neutral-500">•</span>
                          <span className="text-xs text-neutral-400">
                            {prod.pagesOrCount || 'Instant Delivery'}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{prod.title || item.title}</h3>
                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {prod.shortDescription || 'Full commercial license deliverable unlocked.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {prod.ebookDetails && (
                          <button
                            type="button"
                            onClick={() => openSampleModal(prod)}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-1.5 border border-neutral-700 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                            <span>Read E-Book Online</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDownload(prod)}
                          disabled={isDownloading}
                          className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                        >
                          {isDownloading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Download {bundled ? 'Full ZIP Bundle' : 'Now'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* If product contains bundled books (like The Ultimate AI Creator 2-in-1) */}
                    {bundled && bundled.length > 0 && (
                      <div className="pt-3 border-t border-neutral-800/80">
                        <div className="text-xs font-bold text-neutral-300 mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          <span>Both Included PDF E-Books (Download individually or read):</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {bundled.map(book => (
                            <div
                              key={book.id}
                              className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-white truncate">
                                  {book.title}
                                </div>
                                <div className="text-[10px] text-neutral-400">
                                  {book.pages} • {book.role} • {book.format}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  downloadRawFile(book.filename, book.downloadContent, 'application/pdf');
                                  showToast(`Downloading ${book.title}...`, 'success');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Access Instructions & Guides */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display">
              How to Use Your Purchased Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-300">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Terminal className="w-4 h-4" />
                  <span>AI Prompts & Vaults</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Open the downloaded text or markdown bundle. Copy any prompt, replace bracketed fields, and paste into ChatGPT or Claude 3.5 Sonnet.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <BookOpen className="w-4 h-4" />
                  <span>E-Books & Guides</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Read on Apple Books, Kindle, Adobe Acrobat, or any standard PDF reader. Bookmarks and clickable chapter links are embedded.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-850 space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold">
                  <FileText className="w-4 h-4" />
                  <span>Notion & Figma Kits</span>
                </div>
                <p className="text-neutral-400 leading-relaxed">
                  Click the template link included in your deliverable file, then click "Duplicate" in top-right of your Notion / Figma account.
                </p>
              </div>
            </div>
          </div>

          {/* Re-download & Support Assurance */}
          <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Need help or lost your file? Email us anytime at <a href={`mailto:${supportEmail}`} className="text-white hover:text-indigo-300 font-semibold font-mono underline">{supportEmail}</a>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('shop')}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium shrink-0"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        /* Order lookup form when visiting directly */
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Customer Access & Download Portal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              Already purchased from Lumina Digital? Enter your purchase email or order ID below to re-access all your downloadable files.
            </p>
          </div>

          <form
            onSubmit={handleLookup}
            className="max-w-md mx-auto p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3"
          >
            <label className="block text-xs font-semibold text-neutral-300">
              Your Purchase Email or Order ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="alex@example.com or ORD-XXXXX"
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Find Files</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Instant lookup against our automated customer vault.
            </p>
          </form>
        </div>
      )}
    </div>
  );
};
