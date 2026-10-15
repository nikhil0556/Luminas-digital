import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, Sparkles, Mail, ArrowRight } from 'lucide-react';
import { FAQS } from '../data/faqs';
import { useStore } from '../context/StoreContext';

export const FaqPage: React.FC = () => {
  const { setActivePage } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(FAQS[0]?.id || null);

  const categories = ['All', 'Delivery & Access', 'Payment & Security', 'Product Usage', 'Refunds & Guarantees', 'Support & Updates'];

  const filteredFaqs = FAQS.filter(f => {
    if (selectedCategory !== 'All' && f.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-neutral-400">
          Clear answers about ordering, automated digital delivery, file compatibility, and refunds.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions (e.g., refund, format, Notion, ChatGPT)..."
          className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset text-sm text-white placeholder-neutral-500"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'clay-btn-gold !text-neutral-950 font-bold'
                : 'neu-raised text-neutral-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400 glass rounded-2xl">
            No matching questions found. Try another search keyword.
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const isOpen = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl glass overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-white hover:text-indigo-300 transition-colors"
                >
                  <span className="flex-1">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                    <p>{faq.answer}</p>
                    <span className="inline-block mt-3 text-[10px] font-mono font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded">
                      Category: {faq.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help CTA */}
      <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-3">
        <h3 className="text-base font-bold text-white font-display">Still have questions?</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
          Our team is available every day to help you choose the right resource or resolve technical issues.
        </p>
        <button
          type="button"
          onClick={() => setActivePage('contact')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center gap-1.5 shadow-md"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Support Desk</span>
        </button>
      </div>
    </div>
  );
};
