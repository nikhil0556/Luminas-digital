import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  CartItem,
  Order,
  Coupon,
  CustomerReview,
  NewsletterSubscriber,
  ProductCategory,
  StoreSettings,
  DashboardTab,
  CreatorDashboardTab
} from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { REVIEWS } from '../data/reviews';
import { downloadProductFile } from '../utils/fileDownloader';
import { StoreSection, STORE_SECTIONS } from '../data/searchSections';
import { useAuth } from './AuthContext';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Lumina Digital',
  tagline: 'Digital Products That Help You Learn, Create & Grow',
  supportEmail: 'raj.nikhil0556@gmail.com',
  creatorHandle: '@nikhil0556__',
  announcementText: 'Special Launch Offer: Use code LUMINA20 for 20% off all digital assets!',
  enableAnnouncementBar: true,
  activeCouponCode: 'LUMINA20',
  activeCouponDiscount: 20,
  defaultCurrency: 'INR',
  enableInstantFulfillment: true,
  enableSocialProofToasts: false,
  enableExitIntentModal: true,
  taxRatePercent: 0,
  testMode: false,
  paymentGateways: {
    card: true,
    paypal: true,
    razorpay: true,
    applePay: true
  },
  razorpayPaymentButtonId: '',
  accentTheme: 'indigo'
};

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
  title?: string;
  orderNumber?: string;
}

export interface FulfillVerifiedOrderResult {
  order: Order;
  dbConfirmed: boolean;
}

interface StoreContextType {
  // Navigation & View
  activePage: string;
  setActivePage: (page: string) => void;
  selectedProductSlug: string | null;
  navigateToProduct: (slug: string) => void;
  selectedOrderId: string | null;
  navigateToOrder: (orderId: string) => void;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (cat: string) => void;
  policyTab: 'privacy' | 'terms' | 'refund';
  setPolicyTab: (tab: 'privacy' | 'terms' | 'refund') => void;
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  navigateToDashboard: (tab?: DashboardTab) => void;
  navigateToCreatorDashboard: (tab?: CreatorDashboardTab) => void;
  navigateToBecomeCreator: () => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProductsToDefault: () => void;

  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  openCheckoutModal: (product?: Product) => void;
  closeCheckoutModal: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartItemCount: number;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  discountAmount: number;
  finalTotal: number;

  // Orders
  orders: Order[];
  currentOrder: Order | null;
  placeOrder: (customerData: {
    customerEmail: string;
    customerName: string;
    paymentMethod: 'card' | 'paypal' | 'razorpay' | 'apple_pay';
  }) => Order;
  fulfillVerifiedOrder: (orderData: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    paymentId: string;
    paymentMethod: 'card' | 'paypal' | 'razorpay' | 'apple_pay';
    purchases: Array<{
      productId: string;
      productTitle: string;
      amount: number;
      currency: string;
    }>;
  }) => Promise<FulfillVerifiedOrderResult>;
  downloadItem: (product: Product, orderNumber?: string) => void;

  // Reviews
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id' | 'date'>) => void;

  // Newsletter
  subscribers: NewsletterSubscriber[];
  subscribeNewsletter: (email: string, source?: string) => { success: boolean; message: string };

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;

  // Modals
  sampleModalProduct: Product | null;
  openSampleModal: (product: Product) => void;
  closeSampleModal: () => void;

  promptModalProduct: Product | null;
  openPromptModal: (product: Product) => void;
  closePromptModal: () => void;

  // Session state clearing
  clearUserSessionState: () => void;

  // Currency
  currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  setCurrency: (c: 'USD' | 'EUR' | 'GBP' | 'INR') => void;
  formatPrice: (amount: number) => string;

  // Toasts
  toasts: Toast[];
  showToast: (
    message: string,
    type?: 'success' | 'info' | 'error',
    options?: { title?: string; duration?: number; orderNumber?: string } | number
  ) => void;
  removeToast: (id: string) => void;

  // Store Settings & Operations
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettingsToDefault: () => void;
  clearOrders: () => void;
  exportStoreBackup: () => void;
  importStoreBackup: (jsonData: string) => { success: boolean; message: string };
  newsletterSubscribers: NewsletterSubscriber[];

  // Data Fetching & Skeleton Loading States
  isLoadingProducts: boolean;
  setIsLoadingProducts: (loading: boolean) => void;
  isLoadingProductDetail: boolean;
  setIsLoadingProductDetail: (loading: boolean) => void;
  simulateDataFetch: (durationMs?: number) => Promise<void>;

  // Product Purchase State
  isProductPurchased: (productId: string) => boolean;

  // Global Search & Sections / Requirements Navigation
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  navigateToSearch: (query: string) => void;
  navigateToSection: (section: StoreSection) => void;
  navigateToRequirement: (requirement: string) => void;
}

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'LUMINA20',
    discountType: 'percentage',
    value: 20,
    description: '20% off entire store for Gen Z creators',
    usageCount: 142
  },
  {
    code: 'WELCOME10',
    discountType: 'fixed',
    value: 10,
    minOrderAmount: 25,
    description: '₹10 off orders of ₹25 or more',
    usageCount: 89
  },
  {
    code: 'GENZ30',
    discountType: 'percentage',
    value: 30,
    description: '30% student & young professional launch discount',
    usageCount: 265
  },
  {
    code: 'CREATOR15',
    discountType: 'percentage',
    value: 15,
    description: '15% creator welcome perk',
    usageCount: 54
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    user,
    userProfile,
    userPurchases,
    userOrders,
    syncPurchasedProducts,
    syncSavedProducts,
    recordPurchase,
    recordOrder,
    recordDownload,
    openAuthModal
  } = useAuth();

  // Navigation State
  const [activePage, setActivePage] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('q')) return 'search';
      if (window.location.pathname === '/search') return 'search';
    } catch {
      // ignore
    }
    return 'home';
  });
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('profile');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All Products');
  const [policyTab, setPolicyTab] = useState<'privacy' | 'terms' | 'refund'>('privacy');

  const navigateToDashboard = (tab?: DashboardTab) => {
    if (tab) setDashboardTab(tab);
    setActivePage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCreatorDashboard = (_tab?: CreatorDashboardTab) => {
    setActivePage('creator-dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBecomeCreator = () => {
    setActivePage('become-creator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Modals
  const [sampleModalProduct, setSampleModalProduct] = useState<Product | null>(null);
  const [promptModalProduct, setPromptModalProduct] = useState<Product | null>(null);

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Normalize any old product IDs (e.g. prod-trending-100-slash-prompts -> prod-chatgpt-100-slash)
        const normalized = parsed.map((p: Product) => {
          const canonicalId = p.id === 'prod-trending-100-slash-prompts' ? 'prod-chatgpt-100-slash' : p.id;
          const match = INITIAL_PRODUCTS.find(ip => ip.id === canonicalId);
          if (match) {
            return {
              ...match,
              ...p,
              id: match.id,
              slug: match.slug,
              title: match.title,
              subtitle: match.subtitle,
              price: match.price,
              originalPrice: match.originalPrice,
              category: match.category,
              subcategory: match.subcategory || p.subcategory,
              productType: match.productType || p.productType,
              tags: match.tags,
              keywords: match.keywords || p.keywords,
              format: match.format,
              pagesOrCount: match.pagesOrCount,
              ebookDetails: match.ebookDetails || p.ebookDetails,
              aiDetails: match.aiDetails || p.aiDetails,
              author: match.author || p.author,
              bundledBooks: match.bundledBooks || p.bundledBooks,
              coverGradient: match.coverGradient || p.coverGradient,
              downloadFilename: match.downloadFilename || p.downloadFilename,
              downloadContent: match.downloadContent || p.downloadContent,
              whatsIncluded: match.whatsIncluded || p.whatsIncluded,
              whoItsFor: match.whoItsFor || p.whoItsFor,
              keyBenefits: match.keyBenefits || p.keyBenefits
            };
          }
          return p;
        });

        // Add any missing initial products
        const existingIds = new Set(normalized.map((p: Product) => p.id));
        const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
        const combined = [...normalized, ...missing];

        // Deduplicate products by ID
        const uniqueProducts: Product[] = [];
        const seenIds = new Set<string>();
        for (const prod of combined) {
          if (!seenIds.has(prod.id)) {
            seenIds.add(prod.id);
            uniqueProducts.push(prod);
          }
        }

        try {
          localStorage.setItem('lumina_products', JSON.stringify(uniqueProducts));
        } catch {
          // ignore
        }
        return uniqueProducts;
      }
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Keep StoreContext synchronized with CreatorContext product modifications
  useEffect(() => {
    const handleProductsUpdated = () => {
      try {
        const saved = localStorage.getItem('lumina_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          setProducts(parsed);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('lumina:products-updated', handleProductsUpdated);
    window.addEventListener('storage', handleProductsUpdated);
    return () => {
      window.removeEventListener('lumina:products-updated', handleProductsUpdated);
      window.removeEventListener('storage', handleProductsUpdated);
    };
  }, []);

  // Data Fetching & Loading States
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState<boolean>(false);

  // Global Search State & Section Navigation
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    } catch {
      return '';
    }
  });

  const navigateToSearch = (query: string) => {
    const clean = query.trim();
    setGlobalSearchQuery(clean);
    setActivePage('search');
    try {
      const url = new URL(window.location.href);
      if (clean) {
        url.searchParams.set('q', clean);
      } else {
        url.searchParams.delete('q');
      }
      window.history.pushState({ page: 'search', q: clean }, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q !== null) {
          setGlobalSearchQuery(q);
          setActivePage('search');
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToSection = (section: StoreSection) => {
    setActivePage(section.page);
    if (section.categoryFilter) {
      setActiveCategoryFilter(section.categoryFilter);
    }
    if (section.sectionAnchor) {
      setTimeout(() => {
        const el = document.querySelector(section.sectionAnchor!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToRequirement = (requirement: string) => {
    const q = requirement.trim();
    setGlobalSearchQuery(q);
    const qLower = q.toLowerCase();

    // Check if query points to trending slash prompt commands
    if (
      qLower.includes('slash') ||
      qLower.includes('trending') ||
      qLower.includes('trading') ||
      qLower.startsWith('/') ||
      qLower.includes('prompt command')
    ) {
      setActivePage('ai-prompts');
      setTimeout(() => {
        const el = document.querySelector('#trending-slash-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
      return;
    }

    // Check if query is looking for FAQ, licensing or support
    if (qLower.includes('faq') || qLower.includes('refund') || qLower.includes('license') || qLower.includes('support')) {
      setActivePage('faq');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check if query is looking specifically for e-books
    if (qLower.includes('ebook') || qLower.includes('book') || qLower.includes('pdf guide')) {
      setActivePage('ebooks');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Default to shop catalog filtered by requirement
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const simulateDataFetch = (durationMs = 600): Promise<void> => {
    setIsLoadingProducts(true);
    return new Promise(resolve => {
      setTimeout(() => {
        setIsLoadingProducts(false);
        resolve();
      }, durationMs);
    });
  };

  // Save products on change
  useEffect(() => {
    localStorage.setItem('lumina_products', JSON.stringify(products));
  }, [products]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_cart');
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        return parsed.map(item => {
          const match = INITIAL_PRODUCTS.find(p => p.id === item.product?.id);
          if (match) {
            return {
              ...item,
              product: {
                ...item.product,
                price: match.price,
                originalPrice: match.originalPrice
              }
            };
          }
          return item;
        });
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);

  const openCheckoutModal = (product?: Product) => {
    if (product) {
      addToCart(product, 1);
    }
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  useEffect(() => {
    localStorage.setItem('lumina_cart', JSON.stringify(cart));
  }, [cart]);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_wishlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('lumina_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_coupons');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_COUPONS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Seed initial order for preview demonstration
    return [
      {
        id: 'ord-sample-01',
        orderNumber: 'LUM-94821',
        customerEmail: 'alex.creator@example.com',
        customerName: 'Alex Rivera',
        items: [
          {
            productId: 'prod-fin-free',
            title: 'How to Be Financially Free at a Young Age',
            price: 24,
            format: 'PDF',
            downloadFilename: 'How-To-Be-Financially-Free-Young-Age-Lumina.pdf'
          },
          {
            productId: 'prod-ai-mega',
            title: 'The Ultimate AI Creator & Business Mega-Pack',
            price: 29,
            format: 'Prompt Vault (JSON/TXT)',
            downloadFilename: 'AI-Creator-Business-MegaPack-Vault.zip'
          }
        ],
        subtotal: 53,
        discountAmount: 10.6,
        total: 42.4,
        couponCode: 'LUMINA20',
        paymentMethod: 'card',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        accessToken: 'sec_tok_99182a7f82',
        downloadCount: 3
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lumina_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync orders with authenticated user's Firestore records across devices
  useEffect(() => {
    if (user && userOrders && userOrders.length > 0) {
      const firestoreOrders: Order[] = userOrders.map((fo) => ({
        id: fo.orderId,
        orderNumber: fo.orderId,
        customerEmail: fo.customerEmail,
        customerName: user.displayName || 'Customer',
        items: fo.products.map((p) => ({
          productId: p.productId,
          title: p.title,
          price: p.price,
          format: (p.format as any) || 'PDF',
          downloadFilename: `${p.productId}.pdf`
        })),
        subtotal: fo.amount,
        discountAmount: 0,
        total: fo.amount,
        paymentMethod: (fo.paymentMethod as any) || 'razorpay',
        createdAt: fo.createdAt,
        accessToken: `tok_${fo.orderId}`,
        downloadCount: 1
      }));
      setOrders(firestoreOrders);
    } else if (!user || (!userOrders || userOrders.length === 0)) {
      setOrders([]);
    }
  }, [user, userOrders]);

  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_reviews');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem('lumina_reviews', JSON.stringify(reviews));
  }, [reviews]);

  // Newsletter Subscribers State
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(() => {
    try {
      const saved = localStorage.getItem('lumina_subscribers');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      { email: 'creator.jordan@example.com', date: '2026-09-10', source: 'Homepage Exit Modal' },
      { email: 'sarah.student@university.edu', date: '2026-09-12', source: 'Free Prompt Starter Kit' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('lumina_subscribers', JSON.stringify(subscribers));
  }, [subscribers]);

  // Currency (Base currency: INR)
  const [currency, setCurrencyState] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>(() => {
    try {
      const saved = localStorage.getItem('lumina_currency');
      if (saved === 'USD' || saved === 'EUR' || saved === 'GBP' || saved === 'INR') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'INR';
  });

  const setCurrency = (c: 'USD' | 'EUR' | 'GBP' | 'INR') => {
    setCurrencyState(c);
    try {
      localStorage.setItem('lumina_currency', c);
    } catch {
      // ignore
    }
  };

  const currencyRates: Record<string, { symbol: string; rate: number }> = {
    INR: { symbol: '₹', rate: 1 },
    USD: { symbol: '$', rate: 1 / 83.5 },
    EUR: { symbol: '€', rate: 0.92 / 83.5 },
    GBP: { symbol: '£', rate: 0.78 / 83.5 }
  };

  const formatPrice = (amount: number): string => {
    const info = currencyRates[currency] || currencyRates.INR;
    const converted = amount * info.rate;
    if (currency === 'INR') {
      return `${info.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${info.symbol}${converted.toFixed(2)}`;
  };

  // Toast System
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'error' = 'success',
    options?: { title?: string; duration?: number; orderNumber?: string } | number
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const title = typeof options === 'object' ? options?.title : undefined;
    const orderNumber = typeof options === 'object' ? options?.orderNumber : undefined;
    const duration =
      typeof options === 'number'
        ? options
        : typeof options === 'object' && options?.duration
        ? options.duration
        : 4500;

    setToasts(prev => [...prev, { id, message, type, title, orderNumber }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Store Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('lumina_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          !parsed.supportEmail ||
          !parsed.supportEmail.includes('@') ||
          parsed.supportEmail === 'support@luminadigital.com'
        ) {
          parsed.supportEmail = 'raj.nikhil0556@gmail.com';
        }
        return {
          ...DEFAULT_STORE_SETTINGS,
          ...parsed,
          supportEmail: (parsed.supportEmail && parsed.supportEmail.includes('@')) ? parsed.supportEmail : 'raj.nikhil0556@gmail.com',
          enableSocialProofToasts: false
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STORE_SETTINGS;
  });

  // Sync with server support configuration
  useEffect(() => {
    fetch('/api/support/config')
      .then(r => r.ok ? r.json() : null)
      .then(cfg => {
        if (cfg?.supportEmail && typeof cfg.supportEmail === 'string' && cfg.supportEmail.includes('@')) {
          setSettings(prev => {
            if (prev.supportEmail !== cfg.supportEmail) {
              return { ...prev, supportEmail: cfg.supportEmail };
            }
            return prev;
          });
        }
      })
      .catch(() => {
        // use default
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('lumina_store_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
    if (newSettings.supportEmail) {
      fetch('/api/support/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supportEmail: newSettings.supportEmail })
      }).catch(() => {});
    }
    showToast('Store settings updated successfully!', 'success');
  };

  const resetSettingsToDefault = () => {
    setSettings(DEFAULT_STORE_SETTINGS);
    localStorage.setItem('lumina_store_settings', JSON.stringify(DEFAULT_STORE_SETTINGS));
    showToast('Settings restored to initial default.', 'info');
  };

  const clearOrders = () => {
    setOrders([]);
    localStorage.removeItem('lumina_orders');
    showToast('Order history and test customer data cleared.', 'info');
  };

  const exportStoreBackup = () => {
    try {
      const backupData = {
        version: '2.1',
        exportDate: new Date().toISOString(),
        storeName: settings.storeName,
        settings,
        products,
        orders,
        coupons,
        reviews,
        subscribers
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Store backup exported successfully!', 'success');
    } catch {
      showToast('Error exporting backup file', 'error');
    }
  };

  const importStoreBackup = (jsonData: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings) {
        setSettings({ ...DEFAULT_STORE_SETTINGS, ...parsed.settings });
      }
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        setProducts(parsed.products);
      }
      if (Array.isArray(parsed.orders)) {
        setOrders(parsed.orders);
      }
      if (Array.isArray(parsed.coupons) && parsed.coupons.length > 0) {
        setCoupons(parsed.coupons);
      }
      showToast('Store backup restored successfully!', 'success');
      return { success: true, message: 'Store data successfully imported!' };
    } catch {
      showToast('Failed to import backup: invalid JSON format', 'error');
      return { success: false, message: 'Invalid JSON file format' };
    }
  };

  // Navigation helpers
  const navigateToProduct = (slug: string) => {
    setIsLoadingProductDetail(true);
    setSelectedProductSlug(slug);
    setActivePage('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Smooth transition to simulate data fetching and show skeleton
    setTimeout(() => {
      setIsLoadingProductDetail(false);
    }, 380);
  };

  const navigateToOrder = (orderId: string) => {
    const ord = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (ord) {
      setCurrentOrder(ord);
      setSelectedOrderId(ord.id);
      setActivePage('access');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (cartSubtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.value, cartSubtotal);
    }
  }
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  // Cart actions
  const addToCart = (product: Product, quantity = 1) => {
    if (!product || !product.id) {
      showToast('Product information unavailable.', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Digital products typically only need 1 per customer, but allow increment if desired
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.title}" to your cart!`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isSaved = prev.includes(productId);
      const updated = isSaved ? prev.filter(id => id !== productId) : [...prev, productId];
      if (isSaved) {
        showToast('Removed from saved items', 'info');
      } else {
        showToast('Saved to your wishlist!', 'success');
      }
      if (user) {
        syncSavedProducts(updated).catch(e => console.warn('Wishlist sync notice:', e));
      }
      return updated;
    });
  };

  // Coupon actions
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find(c => c.code.toUpperCase() === trimmed);
    if (!found) {
      return { success: false, message: 'Invalid discount coupon code' };
    }
    if (found.minOrderAmount && cartSubtotal < found.minOrderAmount) {
      return {
        success: false,
        message: `Order must be at least $${found.minOrderAmount} to use this coupon`
      };
    }
    setAppliedCoupon(found);
    showToast(`Coupon applied! ${found.description}`, 'success');
    return { success: true, message: `Coupon applied: ${found.description}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
    showToast(`Coupon "${newCoupon.code}" created!`, 'success');
  };

  // Place Order
  const placeOrder = (customerData: {
    customerEmail: string;
    customerName: string;
    paymentMethod: 'card' | 'paypal' | 'razorpay' | 'apple_pay';
  }): Order => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `LUM-${randomNum}`;
    const orderId = `ord-${Date.now()}`;
    const accessToken = `sec_tok_${Math.random().toString(36).substring(2, 12)}`;

    const orderItems = cart.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      format: item.product.format,
      downloadFilename: item.product.downloadFilename,
      downloadContent: item.product.downloadContent,
      bundledBooks: item.product.bundledBooks
    }));

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerEmail: customerData.customerEmail,
      customerName: customerData.customerName || 'Customer',
      items: orderItems,
      subtotal: cartSubtotal,
      discountAmount,
      total: finalTotal,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      paymentMethod: customerData.paymentMethod,
      createdAt: new Date().toISOString(),
      accessToken,
      downloadCount: 0
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    setSelectedOrderId(newOrder.id);
    clearCart();
    setAppliedCoupon(null);

    // Sync order and purchase records with Firestore if authenticated
    if (user) {
      recordOrder({
        orderId: newOrder.orderNumber,
        products: orderItems.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          format: item.format
        })),
        amount: finalTotal,
        currency,
        paymentStatus: 'completed',
        paymentMethod: customerData.paymentMethod
      }).catch(e => console.warn('Order record notice:', e));

      orderItems.forEach(item => {
        recordPurchase({
          productId: item.productId,
          orderId: newOrder.orderNumber,
          productTitle: item.title,
          amountPaid: item.price,
          verificationToken: newOrder.accessToken
        }).catch(e => console.warn('Purchase record notice:', e));
      });

      syncPurchasedProducts(orderItems.map(item => item.productId)).catch(e =>
        console.warn('Purchase sync notice:', e)
      );
    }

    // Trigger celebration confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setActivePage('access');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Purchase completed successfully! Access your downloads below.', 'success');
    return newOrder;
  };

  // Fulfill Server-Verified Order (Cryptographically verified by backend and confirmed in Firestore)
  const fulfillVerifiedOrder = async (orderData: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    paymentId: string;
    paymentMethod: 'card' | 'paypal' | 'razorpay' | 'apple_pay';
    purchases: Array<{
      productId: string;
      productTitle: string;
      amount: number;
      currency: string;
    }>;
  }): Promise<FulfillVerifiedOrderResult> => {
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      title: item.product.title,
      price: item.product.price,
      format: item.product.format,
      downloadFilename: item.product.downloadFilename,
      downloadContent: item.product.downloadContent,
      bundledBooks: item.product.bundledBooks
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderData.orderNumber,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName || 'Customer',
      items: orderItems,
      subtotal: cartSubtotal,
      discountAmount,
      total: finalTotal,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      paymentMethod: orderData.paymentMethod,
      createdAt: new Date().toISOString(),
      accessToken: `tok_rzp_${orderData.paymentId}`,
      downloadCount: 0
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    setSelectedOrderId(newOrder.id);
    clearCart();
    setAppliedCoupon(null);

    let dbConfirmed = false;

    // Sync order and purchase records with Firestore database
    if (user) {
      try {
        const orderRecordPromise = recordOrder({
          orderId: newOrder.orderNumber,
          products: orderItems.map(item => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            format: item.format
          })),
          amount: finalTotal,
          currency,
          paymentStatus: 'completed',
          paymentMethod: orderData.paymentMethod
        });

        // Record verified purchases in Firestore
        const purchasePromises = orderData.purchases.map(p =>
          recordPurchase({
            productId: p.productId,
            orderId: newOrder.orderNumber,
            paymentId: orderData.paymentId,
            productTitle: p.productTitle,
            amountPaid: p.amount,
            amount: p.amount,
            currency: p.currency,
            status: 'completed',
            verificationToken: newOrder.accessToken
          })
        );

        const syncPromise = syncPurchasedProducts(orderData.purchases.map(p => p.productId));

        const [orderResult, purchaseResults] = await Promise.all([
          orderRecordPromise,
          Promise.all(purchasePromises),
          syncPromise
        ]);

        dbConfirmed = Boolean(orderResult && purchaseResults.every(Boolean));
        console.log(`[StoreContext] Order #${newOrder.orderNumber} confirmed in database:`, {
          orderResult,
          purchasesCount: purchaseResults.length,
          dbConfirmed
        });
      } catch (err) {
        console.warn('[StoreContext] Database confirmation notice:', err);
      }
    } else {
      dbConfirmed = true;
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setActivePage('access');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Global success toast notification triggered after payment is verified on the server and purchase confirmed in database
    showToast(
      `Payment verified & purchase confirmed in database! Order #${orderData.orderNumber} is unlocked with instant access to your digital files.`,
      'success',
      {
        title: 'Payment & Purchase Confirmed',
        orderNumber: orderData.orderNumber,
        duration: 6500
      }
    );

    return { order: newOrder, dbConfirmed };
  };

  // Download item action
  const downloadItem = (product: Product, orderNumber?: string) => {
    if (!product || !product.id) {
      showToast('Product file unavailable for download.', 'error');
      return;
    }
    if (user) {
      recordDownload(product.id, product.title, product.downloadFilename).catch(e =>
        console.warn('Download tracking notice:', e)
      );
    }
    downloadProductFile(product, orderNumber);
    showToast(`Downloading "${product.downloadFilename || product.title}"...`, 'success');

    // Update download count if in an order
    if (currentOrder) {
      setOrders(prev =>
        prev.map(o => (o.id === currentOrder.id ? { ...o, downloadCount: o.downloadCount + 1 } : o))
      );
    }
  };

  // Product Purchase Verification
  const isProductPurchased = (productId: string): boolean => {
    // 1. Check authenticated Firestore purchases collection
    if (user && userPurchases.length > 0) {
      const hasVerifiedPurchase = userPurchases.some(p => {
        if (p.accessStatus !== 'active') return false;
        if (p.productId === productId) return true;
        if (
          (productId === 'prod-chatgpt-100-slash' || productId === 'prod-trending-100-slash-prompts') &&
          (p.productId === 'prod-chatgpt-100-slash' || p.productId === 'prod-trending-100-slash-prompts')
        ) {
          return true;
        }
        if (
          p.productId === 'prod-prompts-duo-bundle-20' &&
          (productId === 'prod-chatgpt-100-slash' ||
            productId === 'prod-trending-100-slash-prompts' ||
            productId === 'prod-editing-designing-50-slash')
        ) {
          return true;
        }
        return false;
      });
      if (hasVerifiedPurchase) return true;
    }

    // 2. Check Firestore user profile
    if (userProfile?.purchasedProductIds?.includes(productId)) {
      return true;
    }
    if (
      (productId === 'prod-chatgpt-100-slash' || productId === 'prod-trending-100-slash-prompts') &&
      (userProfile?.purchasedProductIds?.includes('prod-chatgpt-100-slash') ||
        userProfile?.purchasedProductIds?.includes('prod-trending-100-slash-prompts'))
    ) {
      return true;
    }

    // 3. Check verified orders in current session
    return orders.some(order =>
      order.items.some(item => {
        if (item.productId === productId) return true;
        // Alias support for the 100 slash prompts product ID
        if (
          (productId === 'prod-chatgpt-100-slash' || productId === 'prod-trending-100-slash-prompts') &&
          (item.productId === 'prod-chatgpt-100-slash' || item.productId === 'prod-trending-100-slash-prompts')
        ) {
          return true;
        }
        // The 150 prompt Duo Bundle unlocks both 50 and 100 prompt books
        if (
          item.productId === 'prod-prompts-duo-bundle-20' &&
          (productId === 'prod-chatgpt-100-slash' ||
            productId === 'prod-trending-100-slash-prompts' ||
            productId === 'prod-editing-designing-50-slash')
        ) {
          return true;
        }
        return false;
      })
    );
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProd, ...prev]);
    showToast(`Product "${newProd.title}" added to store!`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
    showToast('Product updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted from store', 'info');
  };

  const resetProductsToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('lumina_products');
    showToast('Products reset to initial catalog', 'info');
  };

  // Reviews
  const addReview = (reviewData: Omit<CustomerReview, 'id' | 'date'>) => {
    const newReview: CustomerReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: 'Just now'
    };
    setReviews(prev => [newReview, ...prev]);
    showToast('Thank you! Your verified review was posted.', 'success');
  };

  // Newsletter
  const subscribeNewsletter = (email: string, source = 'Website Form') => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      return { success: false, message: 'Please enter a valid email address' };
    }
    if (subscribers.some(s => s.email.toLowerCase() === trimmed)) {
      return { success: true, message: 'You are already on our insider list! Check your inbox.' };
    }
    const newSub: NewsletterSubscriber = {
      email: trimmed,
      date: new Date().toISOString().split('T')[0],
      source
    };
    setSubscribers(prev => [newSub, ...prev]);
    showToast('Welcome to Lumina! Check your inbox for your 15% discount code.', 'success');
    return { success: true, message: 'Success! Welcome to Lumina Digital.' };
  };

  // Sample Modals
  const openSampleModal = (product: Product) => {
    setSampleModalProduct(product);
  };
  const closeSampleModal = () => {
    setSampleModalProduct(null);
  };

  const openPromptModal = (product: Product) => {
    setPromptModalProduct(product);
  };
  const closePromptModal = () => {
    setPromptModalProduct(null);
  };

  // Clear all temporary client-side session data upon sign out
  const clearUserSessionState = () => {
    setOrders([]);
    setCurrentOrder(null);
    setSelectedOrderId(null);
    setDashboardTab('profile');
    setSampleModalProduct(null);
    setPromptModalProduct(null);
    try {
      sessionStorage.clear();
      localStorage.removeItem('lumina_orders');
      localStorage.removeItem('lumina_checkout_state');
      localStorage.removeItem('lumina_temp_session');
    } catch (_e) {
      // ignore
    }
  };

  return (
    <StoreContext.Provider
      value={{
        activePage,
        setActivePage,
        dashboardTab,
        setDashboardTab,
        navigateToDashboard,
        navigateToCreatorDashboard,
        navigateToBecomeCreator,
        selectedProductSlug,
        navigateToProduct,
        selectedOrderId,
        navigateToOrder,
        activeCategoryFilter,
        setActiveCategoryFilter,
        policyTab,
        setPolicyTab,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProductsToDefault,
        cart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        isCheckoutOpen: isCheckoutModalOpen,
        setIsCheckoutOpen: setIsCheckoutModalOpen,
        openCheckoutModal,
        closeCheckoutModal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartItemCount,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        discountAmount,
        finalTotal,
        orders,
        currentOrder,
        placeOrder,
        fulfillVerifiedOrder,
        downloadItem,
        reviews,
        addReview,
        subscribers,
        subscribeNewsletter,
        wishlist,
        toggleWishlist,
        sampleModalProduct,
        openSampleModal,
        closeSampleModal,
        promptModalProduct,
        openPromptModal,
        closePromptModal,
        clearUserSessionState,
        currency,
        setCurrency,
        formatPrice,
        toasts,
        showToast,
        removeToast,
        settings,
        updateSettings,
        resetSettingsToDefault,
        clearOrders,
        exportStoreBackup,
        importStoreBackup,
        newsletterSubscribers: subscribers,
        isLoadingProducts,
        setIsLoadingProducts,
        isLoadingProductDetail,
        setIsLoadingProductDetail,
        simulateDataFetch,
        isProductPurchased,
        globalSearchQuery,
        setGlobalSearchQuery,
        navigateToSearch,
        navigateToSection,
        navigateToRequirement
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
