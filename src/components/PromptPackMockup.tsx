import React from 'react';
import { Terminal, Sparkles, Cpu, Bot } from 'lucide-react';
import { Product } from '../types';

interface PromptPackMockupProps {
  product: Product;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PromptPackMockup: React.FC<PromptPackMockupProps> = ({
  product,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-28 h-36 text-xs',
    md: 'w-full aspect-[3/4] max-w-[240px]',
    lg: 'w-full aspect-[3/4] max-w-[340px]'
  }[size];

  const gradientFrom = product.coverGradient?.from || '#4f46e5';
  const gradientTo = product.coverGradient?.to || '#1e1b4b';
  const accentColor = product.coverGradient?.accent || '#818cf8';

  return (
    <div className={`relative flex items-center justify-center select-none group/mockup ${className}`}>
      {/* Ambient Glow */}
      <div
        className="absolute inset-x-4 bottom-2 h-8 blur-2xl opacity-50 transition-opacity duration-300 group-hover/mockup:opacity-80"
        style={{ background: gradientFrom }}
      />

      <div
        className={`relative ${sizeClasses} rounded-xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_40px_-10px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover/mockup:-translate-y-1.5 border border-white/20 flex flex-col justify-between`}
        style={{
          background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
        }}
      >
        {/* Futuristic grid lines pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

        {/* Top bar with terminal dots */}
        <div className="p-3.5 z-10 relative bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500/80" />
            <div className="w-2 h-2 rounded-full bg-amber-500/80" />
            <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono" style={{ color: accentColor }}>
            <Cpu className="w-3 h-3" />
            <span>AI VAULT</span>
          </div>
        </div>

        {/* Center Prompt Preview Box */}
        <div className="p-4 z-10 relative flex-1 flex flex-col justify-center">
          <div className="p-3 rounded-lg bg-black/50 border border-white/10 backdrop-blur-sm shadow-inner">
            <div className="flex items-center gap-1.5 text-[10px] text-white/50 font-mono mb-1.5">
              <Terminal className="w-3 h-3 text-indigo-400" />
              <span>Prompt Syntax v4.0</span>
            </div>
            <p className="text-[11px] font-mono text-white/90 leading-tight">
              <span className="text-emerald-400">system:</span> Act as expert <br />
              <span className="text-indigo-300">input:</span> &#123;target_goal&#125;
            </p>
          </div>

          <div className="mt-3">
            <h4 className="text-white font-display font-bold text-sm sm:text-base leading-tight tracking-tight line-clamp-2">
              {product.title}
            </h4>
            <div className="mt-1 flex items-center gap-1.5">
              <Bot className="w-3 h-3 text-indigo-300" />
              <span className="text-[10px] font-semibold text-white/80">{product.pagesOrCount}</span>
            </div>
          </div>
        </div>

        {/* Bottom AI Tools bar */}
        <div className="p-3 z-10 relative bg-black/40 border-t border-white/10 backdrop-blur-xs flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="text-[9px] font-medium text-white/80">GPT-4o & Claude 3.5</span>
          </div>
          <span className="text-[9px] font-mono text-white/50">Verified</span>
        </div>
      </div>
    </div>
  );
};
