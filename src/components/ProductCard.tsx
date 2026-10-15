import React from 'react';
import { motion } from 'motion/react';
import { Star, ShoppingBag, Eye, Heart, ArrowRight, Zap } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { EbookMockup } from './EbookMockup';
import { PromptPackMockup } from './PromptPackMockup';
import { TemplateMockup } from './TemplateMockup';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featured = false }) => {
  const {
    navigateToProduct,
    addToCart,
    wishlist,
    toggleWishlist,
    formatPrice,
    openSampleModal,
    openPromptModal,
    openCheckoutModal
  } = useStore();

  const isWishlisted = wishlist.includes(product.id);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const renderMockup = () => {
    if (product.category === 'E-books') {
      return <EbookMockup product={product} size="md" />;
    }
    if (product.category === 'AI Prompts' || product.category === 'Prompt Packs') {
      return <PromptPackMockup product={product} size="md" />;
    }
    return <TemplateMockup product={product} size="md" />;
  };

  const handleQuickPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.category === 'E-books' && product.ebookDetails) {
      openSampleModal(product);
    } else if (product.aiDetails) {
      openPromptModal(product);
    } else {
      navigateToProduct(product.slug);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCheckoutModal(product);
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      onClick={() => navigateToProduct(product.slug)}
      whileHover={{ y: -6, rotateX: 1.5, rotateY: -1.5 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`group relative rounded-2xl glass product-card-glow flex flex-col justify-between overflow-hidden cursor-pointer blow-on-reach hover-breeze transition-colors duration-300 ${
        featured ? 'ring-1 ring-indigo-500/40 shadow-indigo-500/10' : ''
      }`}
    >
      {/* Subtle hover gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.07] via-transparent to-cyan-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Top badges & Wishlist */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.isBestSeller && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/35 backdrop-blur-md shadow-sm">
              <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
              Best Seller
            </span>
          )}
          {product.isNewRelease && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 backdrop-blur-md shadow-sm">
              New
            </span>
          )}
          {discountPercent && (
            <span className="clay-badge px-2 py-0.5 text-[11px] font-bold">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 ${
            isWishlisted
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105'
              : 'bg-black/60 text-neutral-300 hover:text-white hover:bg-black/80 border border-white/15 hover:scale-105'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Mockup Preview Area with spatial perspective & ambient spotlight */}
      <div className="relative p-6 pt-12 pb-4 bg-gradient-to-b from-[#161e34]/60 to-[#0a0e1c]/80 flex items-center justify-center overflow-hidden min-h-[220px] spatial-mockup-stage">
        {/* Soft radial glow behind mockup */}
        <div className="absolute inset-0 bg-radial from-indigo-500/15 via-transparent to-transparent opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 pointer-events-none" />
        
        <div className="spatial-mockup-element transition-transform duration-300 ease-out">
          {renderMockup()}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
        <div>
          {/* Format & Rating */}
          <div className="flex items-center justify-between gap-2 text-xs mb-2">
            <span className="text-indigo-400/90 font-mono font-semibold tracking-wider uppercase text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-semibold text-neutral-200">{product.rating.toFixed(2)}</span>
              <span className="text-neutral-500 text-[11px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-neutral-100 group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Actions */}
        <div className="mt-5 pt-4 border-t border-white/[0.08]">
          <div className="flex items-baseline justify-between gap-2 mb-3.5">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-display text-white group-hover:text-indigo-200 transition-colors">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-neutral-300 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded-md">
              {product.pagesOrCount}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleQuickPreview}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/[0.1] hover:border-white/[0.2] transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview</span>
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleBuyNow}
              className="clay-btn btn-shine-sweep px-3 py-2 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Buy Now</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
