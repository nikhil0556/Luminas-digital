import React from 'react';
import { ShieldCheck, Lock, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PolicyPage: React.FC = () => {
  const { policyTab, setPolicyTab, settings } = useStore();
  const supportEmail = settings?.supportEmail || 'raj.nikhil0556@gmail.com';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-4">
        <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
          Legal & Compliance
        </span>
        <h1 className="text-3xl font-bold font-display text-white mt-1">
          Store Policies & Customer Protection
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Effective date: January 1, 2026. Last revised: February 2026.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setPolicyTab('refund')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
            policyTab === 'refund'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>14-Day Refund Policy</span>
        </button>

        <button
          type="button"
          onClick={() => setPolicyTab('terms')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
            policyTab === 'terms'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Terms & Conditions</span>
        </button>

        <button
          type="button"
          onClick={() => setPolicyTab('privacy')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 ${
            policyTab === 'privacy'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Privacy Policy</span>
        </button>
      </div>

      {/* Refund Policy */}
      {policyTab === 'refund' && (
        <div className="space-y-6 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Our 14-Day "Zero Risk" Promise:</strong> If any Lumina Digital product fails to provide clear practical value, we will issue a full 100% refund.
            </span>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Scope of Guarantee</h2>
            <p>
              We want you to purchase with complete peace of mind. Because digital items (PDF e-books, Notion templates, AI prompt packs) are delivered instantly, standard physical return logistics do not apply. However, if within 14 days of purchase you are unsatisfied with the material, simply reach out to us.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. How to Request a Refund</h2>
            <p>
              Simply reply to your order confirmation email or email <a href={`mailto:${supportEmail}`} className="text-indigo-400 hover:underline font-mono font-semibold">{supportEmail}</a> with your Order Number (e.g. LUM-XXXXX) and a brief sentence explaining why the product did not suit your needs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Processing Time</h2>
            <p>
              Refunds are approved within 24 hours of receipt and credited back to your original payment method (Credit Card, PayPal, Apple Pay, or UPI) within 3–5 business days depending on your bank.
            </p>
          </section>
        </div>
      )}

      {/* Terms & Conditions */}
      {policyTab === 'terms' && (
        <div className="space-y-6 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Digital Single-User License</h2>
            <p>
              When you purchase an e-book, AI prompt pack, template, or guide from Lumina Digital, you are granted a non-exclusive, perpetual, single-user commercial and personal license.
            </p>
            <p className="text-neutral-400">
              You MAY: Use the prompts, templates, and frameworks in your personal career, client projects, social media, and commercial ventures.
            </p>
            <p className="text-neutral-400">
              You MAY NOT: Re-sell, redistribute, sublicense, or share the raw digital product files publicly on file sharing platforms or torrent sites.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Automated Delivery</h2>
            <p>
              All products are delivered electronically immediately upon completed transaction. We do not provide physical goods or physical shipping.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Lifetime Free Revisions</h2>
            <p>
              Your purchase entitles you to all minor revisions and prompt updates for the purchased item without additional charge.
            </p>
          </section>
        </div>
      )}

      {/* Privacy Policy */}
      {policyTab === 'privacy' && (
        <div className="space-y-6 text-neutral-300 text-xs sm:text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
            <p>
              We only collect your email address and name strictly to deliver your digital access tokens, generate your order receipt, and send critical product updates.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Payment Data & Security</h2>
            <p>
              We do not store or process your credit card numbers or financial credentials on our servers. All transactions are tokenized and processed via PCI-DSS Level 1 compliant processors (Stripe, PayPal, Apple Pay).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Zero Data Sale Pledge</h2>
            <p>
              We do not sell, rent, or trade your personal data to data brokers or third-party advertisers. You may request total data deletion at any time by contacting our support team.
            </p>
          </section>
        </div>
      )}
    </div>
  );
};
