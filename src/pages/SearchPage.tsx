import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Sparkles,
  Zap,
  Star,
  ShoppingBag,
  ArrowRight,
  BookOpen,
  Layers,
  Flame,
  Palette,
  Tag,
  Eye,
  Check,
  ChevronRight,
  RefreshCw,
  Heart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { searchProducts, POPULAR_SEARCH_SUGGESTIONS, saveRecentSearch } from '../utils/searchEngine';
import { HighlightText } from '../components/HighlightText';
import { STORE_SECTIONS } from '../data/searchSections';
import { TRENDING_100_SLASH_PROMPTS } from '../data/trendingSlashPrompts';
import { ONE_WORD_EDITING_PROMPTS } from '../data/editingDesigningPrompts';
import { Product } from '../types';

const QUICK_TOPICS = [
  'AI',
  'ChatGPT',
  'Money',
  'Finance',
  'Saving',
  'Productivity',
  'Prompts',
  'Design',
  'Notion',
  'Editing'
];

export const SearchPage: React.FC = () => {
  const {
    products,
    globalSearchQuery,
    setGlobalSearchQuery,
    navigateToSearch,
    navigateToProduct,
    addToCart,
    formatPrice,
    openSampleModal,
    openPromptModal,
    navigateToSection,
    wishlist,
    toggleWishlist,
    setActivePage
  } = useStore();

  const [queryInput, setQueryInput] = useState<string>(globalSearchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under20' | '20to30' | 'above30'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'price-low' | 'price-high' | 'newest'>('relevance');

  // Keep local query input synced when globalSearchQuery changes
  useEffect(() => {
    if (globalSearchQuery !== undefined) {
      setQueryInput(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Execute search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = queryInput.trim();
    saveRecentSearch(clean);
    navigateToSearch(clean);
  };

  const handleTopicClick = (topic: string) => {
    setQueryInput(topic);
    saveRecentSearch(topic);
    navigateToSearch(topic);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedFormat('all');
    setPriceFilter('all');
    setMinRating(0);
    setSortBy('relevance');
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedFormat !== 'all' ||
    priceFilter !== 'all' ||
    minRating > 0 ||
    sortBy !== 'relevance';

  // Compute Search Results using our Centralized Search Engine
  const searchResults = useMemo(() => {
    return searchProducts(globalSearchQuery || '', products, {
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      format: selectedFormat !== 'all' ? selectedFormat : undefined,
      priceRange: priceFilter,
      minRating: minRating > 0 ? minRating : undefined,
      sortBy
    });
  }, [globalSearchQuery, products, selectedCategory, selectedFormat, priceFilter, minRating, sortBy]);

  // Check for matching sections or prompt vaults based on query
  const queryLower = (globalSearchQuery || '').toLowerCase().trim();

  const relevantSection = useMemo(() => {
    if (!queryLower) return null;
    return (
      STORE_SECTIONS.find(sec => {
        return (
          sec.title.toLowerCase().includes(queryLower) ||
          sec.keywords.some(k => k.toLowerCase().includes(queryLower) || queryLower.includes(k.toLowerCase()))
        );
      }) || null
    );
  }, [queryLower]);

  const hasPromptKeyword =
    queryLower.includes('prompt') ||
    queryLower.includes('slash') ||
    queryLower.includes('chatgpt') ||
    queryLower.includes('ai') ||
    queryLower.includes('command') ||
    queryLower.includes('design') ||
    queryLower.includes('editing');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'E-books':
        return <BookOpen className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AI Prompts':
      case 'Prompt Packs':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  // Best seller fallback products if no results
  const recommendedProducts = useMemo(() => {
    return products.filter(p => p.isBestSeller).slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen bg-neutral-950 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <button
            type="button"
            onClick={() => setActivePage('home')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => setActivePage('shop')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Catalog
          </button>
          <span>/</span>
          <span className="text-indigo-400 font-semibold truncate max-w-[200px] sm:max-w-none">
            {globalSearchQuery ? `Search: "${globalSearchQuery}"` : 'Search Products'}
          </span>
        </div>

        {/* Search Header Banner */}
        <div className="bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Search Engine</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
              {globalSearchQuery ? (
                <>
                  Results for <span className="text-indigo-400">"{globalSearchQuery}"</span>
                </>
              ) : (
                'Search Lumina Digital Library'
              )}
            </h1>

            <p className="text-sm text-neutral-400 mt-2">
              Explore digital books, AI prompts, Notion systems, finance guides, and creator tools.
              Searches titles, descriptions, categories, and keyword topics.
            </p>

            {/* In-page Live Search Form */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Search by topic, e-book name, keyword (e.g. AI, money, finance, design)..."
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-950/90 border border-neutral-700/80 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />
                {queryInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setQueryInput('');
                      navigateToSearch('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer shrink-0 flex items-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Topic Chips */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-neutral-400">Popular:</span>
              {QUICK_TOPICS.map(topic => {
                const isActive = (globalSearchQuery || '').toLowerCase() === topic.toLowerCase();
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleTopicClick(topic)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 hover:text-white border-neutral-700/60'
                    }`}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section Direct Recommendation if query matches a section */}
        {relevantSection && (
          <div className="p-4 rounded-2xl bg-neutral-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{relevantSection.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {relevantSection.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{relevantSection.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateToSection(relevantSection)}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>Explore Section</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter and Sorting Bar */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Category Filter */}
            <select
              aria-label="Filter by Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="AI Prompts">AI Prompts</option>
              <option value="E-books">E-books</option>
              <option value="Notion Templates">Notion Templates</option>
              <option value="Prompt Packs">Prompt Packs</option>
            </select>

            {/* Format Filter */}
            <select
              aria-label="Filter by Format"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Formats</option>
              <option value="PDF / EPUB">PDF / EPUB</option>
              <option value="Notion Template">Notion Template</option>
              <option value="PDF + Notion Vault">PDF + Notion Vault</option>
              <option value="Prompt Vault">Prompt Vault</option>
            </select>

            {/* Price Filter */}
            <select
              aria-label="Filter by Price"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Prices</option>
              <option value="under20">Under $22 (Under ₹1,800)</option>
              <option value="20to30">$22 - $30 (₹1,800 - ₹2,500)</option>
              <option value="above30">$30+ (₹2,500+)</option>
            </select>

            {/* Minimum Rating */}
            <select
              aria-label="Filter by Rating"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">★ 4.5 & Above</option>
              <option value="4.8">★ 4.8 & Above</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort & Count */}
          <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-800">
            <span className="text-xs font-mono text-neutral-400">
              <strong className="text-white">{searchResults.length}</strong> {searchResults.length === 1 ? 'product' : 'products'} found
            </span>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer font-mono"
              >
                <option value="relevance">Sort: Most Relevant</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="price-low">Sort: Price (Low to High)</option>
                <option value="price-high">Sort: Price (High to Low)</option>
                <option value="newest">Sort: New Releases</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results Grid */}
        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => {
              const { product, highlightSnippet, primaryMatchField } = result;
              const isWishlisted = wishlist.includes(product.id);
              const discountPercent = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;

              return (
                <div
                  key={product.id}
                  className="group bg-neutral-900/85 hover:bg-neutral-900 border border-neutral-800 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 relative"
                >
                  {/* Top Row: Thumbnail + Category + Match Reason */}
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div
                        onClick={() => navigateToProduct(product.slug)}
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-md cursor-pointer group-hover:scale-105 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${product.coverGradient.from}, ${product.coverGradient.to})`
                        }}
                      >
                        {getCategoryIcon(product.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono font-semibold text-indigo-400">
                            {product.category}
                          </span>
                          {product.isBestSeller && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Best Seller
                            </span>
                          )}
                          {product.isNewRelease && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              New
                            </span>
                          )}
                        </div>

                        {/* Match Reason Pill */}
                        {primaryMatchField && globalSearchQuery && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-mono text-neutral-400">
                            <Tag className="w-2.5 h-2.5 text-indigo-400" />
                            <span>Matched by {primaryMatchField}</span>
                          </div>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                          isWishlisted
                            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-400' : ''}`} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => navigateToProduct(product.slug)}
                      className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2"
                    >
                      <HighlightText text={product.title} query={globalSearchQuery} />
                    </h3>

                    {/* Highlighted Snippet or Subtitle */}
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                      {highlightSnippet ? (
                        <HighlightText text={highlightSnippet} query={globalSearchQuery} />
                      ) : product.subtitle ? (
                        <HighlightText text={product.subtitle} query={globalSearchQuery} />
                      ) : (
                        product.shortDescription
                      )}
                    </p>

                    {/* Metadata chips */}
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-3 pt-3 border-t border-neutral-800/80">
                      <span>{product.pagesOrCount}</span>
                      <span>•</span>
                      <span>{product.format}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-neutral-500 text-[10px]">({product.reviewsCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Price & Actions */}
                  <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold font-mono text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-neutral-500 line-through font-mono">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      {discountPercent && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          Save {discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sample Preview button if ebook or prompt */}
                      {product.ebookDetails && (
                        <button
                          type="button"
                          onClick={() => openSampleModal(product)}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="Read 10-page free sample"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                      )}

                      {product.aiDetails && (
                        <button
                          type="button"
                          onClick={() => openPromptModal(product)}
                          className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="Preview prompt sample"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
              <Search className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-bold text-white">
                No matching products found
              </h2>
              <p className="text-sm text-neutral-400 mt-1.5">
                We couldn't find any products matching{' '}
                <strong className="text-white font-mono">"{globalSearchQuery}"</strong> with the selected filters.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}

            {/* Helpful Topic Suggestions */}
            <div className="pt-4 border-t border-neutral-800/80 max-w-lg mx-auto">
              <span className="text-xs font-mono text-neutral-400 block mb-3">
                Try searching for these popular topics:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {POPULAR_SEARCH_SUGGESTIONS.map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleTopicClick(suggestion)}
                    className="px-3 py-1.5 rounded-xl text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Fallback Best Sellers */}
            <div className="pt-8 border-t border-neutral-800 text-left">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Popular Customer Favorites</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActivePage('shop')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Browse all products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedProducts.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => navigateToProduct(prod.slug)}
                    className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 cursor-pointer flex items-center gap-3 transition-colors group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${prod.coverGradient.from}, ${prod.coverGradient.to})`
                      }}
                    >
                      {getCategoryIcon(prod.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 truncate block">
                        {prod.title}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {formatPrice(prod.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
