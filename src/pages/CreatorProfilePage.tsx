import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Star,
  Package,
  Heart,
  Globe,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';

interface CreatorProfilePageProps {
  creatorId?: string;
  onBack?: () => void;
}

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  creatorId = 'creator-lumina-core',
  onBack
}) => {
  const { products, setActivePage, navigateToProduct, showToast } = useStore();
  const { user } = useAuth();

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(1420);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Filter products by this creator (or fallback to all if matching default)
  const creatorProducts = products.filter(
    p => (p.creatorId && p.creatorId === creatorId) || creatorId === 'creator-lumina-core' || !p.creatorId
  );

  const categories = ['All', ...Array.from(new Set(creatorProducts.map(p => p.category)))];

  const filteredProducts = activeCategory === 'All'
    ? creatorProducts
    : creatorProducts.filter(p => p.category === activeCategory);

  // Fetch follow status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const uid = user?.uid || 'guest';
        const res = await fetch(`/api/creators/${creatorId}/follow-status?userId=${uid}`);
        if (res.ok) {
          const data = await res.json();
          setIsFollowing(Boolean(data.isFollowing));
          if (typeof data.followerCount === 'number') {
            setFollowerCount(data.followerCount);
          }
        }
      } catch (err) {
        console.error('Failed to fetch follow status', err);
      }
    };
    fetchStatus();
  }, [creatorId, user?.uid]);

  const handleToggleFollow = async () => {
    if (!user) {
      showToast('Please sign in to follow creators.', 'info');
      return;
    }

    setLoadingFollow(true);
    try {
      const res = await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        showToast(
          data.isFollowing ? 'Creator added to your following list!' : 'Unfollowed creator',
          'success'
        );
      }
    } catch (err) {
      showToast('Failed to update follow status', 'error');
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Creator profile link copied to clipboard!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (onBack ? onBack() : setActivePage('shop'))}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Share profile"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Creator Header Banner */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              alt="Lumina Creator"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-indigo-500/40 object-cover shrink-0 shadow-lg"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  Lumina Creative Labs
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Creator</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-xl leading-relaxed">
                Specialized in professional AI prompt engineering, executive workflow systems, and pragmatic digital toolkits for modern creators and knowledge workers.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-1">
                <span className="flex items-center gap-1 text-white font-semibold">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{followerCount.toLocaleString()} followers</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{creatorProducts.length} published products</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 (340+ ratings)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              disabled={loadingFollow}
              onClick={handleToggleFollow}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 ${
                isFollowing
                  ? 'bg-neutral-800 text-neutral-200 hover:bg-rose-950/40 hover:text-rose-400 border border-neutral-700'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFollowing ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{isFollowing ? 'Following' : 'Follow Creator'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Catalog Filter */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Creator's Digital Catalog</h2>
            <p className="text-xs text-neutral-400">
              Instant digital delivery with secure verified download links
            </p>
          </div>

          {/* Categories pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(prod => (
            <ProductCard
              key={prod.id}
              product={prod}
              onSelect={() => navigateToProduct(prod.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
