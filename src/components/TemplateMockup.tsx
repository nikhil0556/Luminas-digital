import React from 'react';
import { Layers, FileText, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';

interface TemplateMockupProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const TemplateMockup: React.FC<TemplateMockupProps> = ({
  product,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-28 h-36 text-xs',
    md: 'w-full aspect-[3/4] max-w-[240px]',
    lg: 'w-full aspect-[3/4] max-w-[340px]'
  }[size];

  const gradientFrom = product.coverGradient?.from || '#7c3aed';
  const gradientTo = product.coverGradient?.to || '#2e1065';
  const accentColor = product.coverGradient?.accent || '#a78bfa';

  return (
    <div className={`relative flex items-center justify-center select-none group/mockup ${className}`}>
      {/* Ambient soft glow */}
      <div
        className="absolute inset-x-4 bottom-2 h-8 blur-2xl opacity-50 transition-opacity duration-300 group-hover/mockup:opacity-80"
        style={{ background: gradientFrom }}
      />

      <div
        className={`relative ${sizeClasses} rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_40px_-10px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover/mockup:-translate-y-1.5 border border-white/20 flex flex-col justify-between`}
        style={{
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
        }}
      >
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Header bar mimicking a workspace OS */}
        <div className="p-3.5 z-10 relative bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-white/90">
            <Layers className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>{product.format}</span>
          </div>
          <span className="text-[10px] text-white/70 font-mono">
            {product.pagesOrCount}
          </span>
        </div>

        {/* Workspace preview card mock */}
        <div className="p-4 z-10 relative flex-1 flex flex-col justify-center">
          {/* Mock UI window */}
          <div className="p-3 rounded-lg bg-black/45 border border-white/10 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-white/70" />
                <span className="text-[10px] font-medium text-white/90">Workspace Dashboard</span>
              </div>
              <ArrowUpRight className="w-3 h-3 text-white/40" />
            </div>
            
            {/* Mock task / database lines */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] text-white/70">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">Automated Sprint Board</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-white/70">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                <span className="truncate">Financial & Cashflow Tracker</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-white font-display font-bold text-sm sm:text-base leading-tight tracking-tight line-clamp-2">
              {product.title}
            </h4>
          </div>
        </div>

        {/* Bottom banner */}
        <div className="p-3 z-10 relative bg-black/40 border-t border-white/10 backdrop-blur-xs flex items-center justify-between">
          <span className="text-[9px] font-medium text-white/80">Instant 1-Click Access</span>
          <span className="text-[9px] font-mono text-emerald-400">Zero Setup</span>
        </div>
      </div>
    </div>
  );
};
