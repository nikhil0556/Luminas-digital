import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface EbookMockupProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EbookMockup: React.FC<EbookMockupProps> = ({
  product,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-28 h-36 text-xs',
    md: 'w-full aspect-[3/4] max-w-[240px]',
    lg: 'w-full aspect-[3/4] max-w-[340px]'
  }[size];

  const gradientFrom = product.coverGradient?.from || '#059669';
  const gradientTo = product.coverGradient?.to || '#022c22';
  const accentColor = product.coverGradient?.accent || '#34d399';

  const isFinancialFreedom =
    product.id === 'prod-fin-free' ||
    product.slug === 'how-to-be-financially-free-in-young-age' ||
    product.slug === 'how-to-be-financially-free-at-a-young-age';

  return (
    <div className={`relative flex items-center justify-center select-none group/mockup ${className}`}>
      {/* 3D Depth Shadow */}
      <div
        className="absolute inset-x-4 bottom-1 h-6 blur-xl opacity-60 transition-opacity duration-300 group-hover/mockup:opacity-90"
        style={{ background: isFinancialFreedom ? '#2563eb' : gradientFrom }}
      />

      {/* Book Container with 3D perspective */}
      <div
        className={`relative ${sizeClasses} rounded-r-lg rounded-l-xs overflow-hidden shadow-2xl transition-all duration-300 group-hover/mockup:-translate-y-1.5 group-hover/mockup:shadow-blue-500/20 flex flex-col justify-between border-t border-r border-b border-white/15`}
        style={{
          background: isFinancialFreedom
            ? 'linear-gradient(145deg, #1d4ed8 0%, #1e40af 100%)'
            : `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
        }}
      >
        {/* Subtle Spine Highlight & 3D Lighting effect */}
        <div className="absolute inset-y-0 left-0 w-3.5 bg-gradient-to-r from-black/50 via-white/15 to-transparent pointer-events-none z-20 border-r border-black/30" />
        
        {/* Right side page-stack spatial depth */}
        <div className="absolute inset-y-1 right-0 w-1.5 bg-gradient-to-l from-white/25 via-neutral-300/10 to-transparent pointer-events-none z-20" />

        {/* Diagonal Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-10" />

        {/* Custom Header for the PDF publication */}
        {isFinancialFreedom ? (
          <div className="z-10 relative">
            <div className="p-3 bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 text-slate-950 border-b border-blue-900/40">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-black tracking-widest text-slate-900 uppercase">
                  PDF Edition
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-800">
                  8 Pages
                </span>
              </div>
              <h4 className="text-slate-950 font-display font-black text-xs sm:text-sm leading-tight mt-1 tracking-tight">
                How to Be Financially Free in Young Age
              </h4>
              <p className="text-[10px] font-semibold text-slate-800 mt-0.5 leading-none">
                A guide to budgeting and saving
              </p>
            </div>

            {/* Inner Card on Cover */}
            <div className="p-3">
              <div className="p-2.5 rounded-lg bg-white/95 text-slate-900 shadow-sm border border-blue-200">
                <div className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  The 50/30/20 Roadmap
                </div>
                <div className="text-[9px] text-slate-700 mt-1 line-clamp-2">
                  Compound interest, emergency funds, side hustles & 30-day challenge.
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[8px] font-mono text-slate-600">
                  <span>Needs • Wants • Savings</span>
                  <span className="font-bold text-blue-600">@nikhil0556__</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Default Cover Top */
          <div className="p-4 z-10 relative">
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full backdrop-blur-md bg-black/40 border border-white/15"
                style={{ color: accentColor }}
              >
                <BookOpen className="w-2.5 h-2.5" />
                {product.format}
              </span>
              <span className="text-[10px] text-white/70 font-mono font-medium">
                {product.pagesOrCount}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-1.5 opacity-80">
              <div className="w-4 h-4 rounded bg-white/20 flex items-center justify-center text-[9px] font-black text-white">
                L
              </div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-white/90">
                Lumina Guide
              </span>
            </div>

            <div className="mt-3">
              <h4 className="text-white font-display font-bold text-sm sm:text-base leading-tight tracking-tight drop-shadow-sm line-clamp-3">
                {product.title}
              </h4>
              {product.subtitle && (
                <p className="text-white/80 text-[11px] mt-1.5 line-clamp-2 leading-relaxed font-medium">
                  {product.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Banner on Cover */}
        <div className="p-3 z-10 relative border-t border-white/10 bg-black/30 backdrop-blur-xs flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-[10px] font-semibold text-white/90">
              {isFinancialFreedom ? 'By Lumina & @nikhil0556__' : 'Gen Z Edition'}
            </span>
          </div>
          <span className="text-[9px] text-white/60 font-mono">2026</span>
        </div>

        {/* Book Edge Effect on the right */}
        <div className="absolute inset-y-1 right-0 w-1 bg-gradient-to-l from-white/30 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
