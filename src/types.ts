export type ProductCategory =
  | 'E-books'
  | 'AI Prompts'
  | 'Prompt Packs'
  | 'Templates'
  | 'Guides'
  | 'Digital Guides'
  | 'Checklists'
  | 'Productivity'
  | 'Business'
  | 'Creator Resources'
  | 'Study Resources'
  | 'Marketing Resources'
  | 'Other Digital Downloads';

export type ProductFormat = 'PDF' | 'ePub' | 'Notion Template' | 'Prompt Vault (JSON/TXT)' | 'Spreadsheet (XLSX/Sheets)' | 'Figma Kit' | 'Bundle (ZIP)' | 'Audio / MP3' | 'Custom Download';

export type ProductStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'unpublished'
  | 'suspended';

export type CreatorStatus = 'pending' | 'under_review' | 'verified' | 'suspended' | 'rejected';

export type CreatorType =
  | 'Individual Creator'
  | 'Studio / Agency'
  | 'Brand / Business'
  | 'Prompt Engineer / AI Specialist'
  | 'Independent Author';

export interface ProductVersion {
  version: string;
  releasedAt: string;
  changelog: string;
  fileId?: string;
  fileName?: string;
  fileSize?: string;
}

export interface DigitalFileAsset {
  fileId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  format: ProductFormat;
  uploadedAt: string;
  storageKey?: string;
  checksum?: string;
}

export interface ProductPreviewSample {
  type: 'text' | 'prompts' | 'toc' | 'excerpt';
  title: string;
  content: string;
  samplePrompts?: { title: string; prompt: string; variableHint?: string }[];
  tocItems?: string[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice?: number;
  currency?: 'USD' | 'EUR' | 'GBP' | 'INR';
  category: ProductCategory;
  subcategory?: string;
  tags: string[];
  keywords?: string[];
  productType?: 'ebook' | 'ai-prompt' | 'template' | 'guide' | 'bundle' | 'digital-product' | 'checklist';
  format: ProductFormat;
  pagesOrCount: string; // e.g. "184 Pages" or "1,200+ Prompts" or "12 Notion Databases"
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNewRelease?: boolean;
  isFeatured?: boolean;
  coverImage?: string; // custom upload thumbnail / cover URL or base64 data
  thumbnail?: string;
  coverGradient: {
    from: string;
    to: string;
    accent: string;
  };
  whatsIncluded: string[];
  whoItsFor: string[];
  keyBenefits: string[];
  features: string[];
  fileSize?: string;
  downloadFilename: string;
  downloadContent?: string; // Content simulated or payload for download file
  digitalFile?: DigitalFileAsset;
  version?: string;
  versionChangelog?: string;
  versions?: ProductVersion[];
  requirements?: string[];
  previewSample?: ProductPreviewSample;
  author?: string;
  bundledBooks?: {
    id: string;
    title: string;
    subtitle?: string;
    filename: string;
    pages: number;
    description: string;
    downloadContent: string;
  }[];
  // AI Prompt specific fields
  aiDetails?: {
    promptCount: number;
    categoriesIncluded: string[];
    examplePrompts: {
      category: string;
      title: string;
      prompt: string;
      variables?: string[];
      outputPreview?: string;
    }[];
    compatibleTools: string[];
    usageInstructions: string[];
  };
  // E-book specific fields
  ebookDetails?: {
    pages: number;
    tableOfContents: string[];
    sampleChapterTitle: string;
    sampleChapterContent: string;
    authorHandle?: string;
    pdfPages?: {
      pageNumber: number;
      title: string;
      subtitle?: string;
      cards?: {
        title?: string;
        text?: string;
        bullets?: string[];
        badge?: string;
        callout?: string;
      }[];
    }[];
  };
  // Multi-creator marketplace attributes
  creatorId?: string; // permanent Firebase Auth UID
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;
  creatorType?: CreatorType;
  isCreatorProduct?: boolean;
  status?: ProductStatus;
  moderationNotes?: string;
  moderationHistory?: { status: ProductStatus; timestamp: string; note: string; actor: string }[];
  isArchived?: boolean;
  archiveReason?: string;
  salesCount?: number;
  totalRevenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  format: ProductFormat;
  downloadFilename: string;
  downloadContent?: string;
  bundledBooks?: {
    id: string;
    title: string;
    subtitle?: string;
    filename: string;
    pages: number;
    description: string;
    downloadContent: string;
  }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'card' | 'paypal' | 'razorpay' | 'apple_pay';
  createdAt: string;
  accessToken: string;
  downloadCount: number;
}

export interface CustomerReview {
  id: string;
  productId?: string;
  authorName: string;
  authorRole: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g., 20 for 20% or 10 for $10
  minOrderAmount?: number;
  description: string;
  expiresAt?: string;
  usageCount: number;
}

export interface NewsletterSubscriber {
  email: string;
  date: string;
  source: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  creatorHandle: string;
  announcementText: string;
  enableAnnouncementBar: boolean;
  activeCouponCode: string;
  activeCouponDiscount: number;
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'INR';
  enableInstantFulfillment: boolean;
  enableSocialProofToasts: boolean;
  enableExitIntentModal: boolean;
  taxRatePercent: number;
  testMode: boolean;
  paymentGateways: {
    card: boolean;
    paypal: boolean;
    razorpay: boolean;
    applePay: boolean;
  };
  razorpayPaymentButtonId?: string;
  accentTheme: 'indigo' | 'emerald' | 'blue' | 'purple';
}

export interface UserPreferences {
  currency?: 'USD' | 'EUR' | 'GBP' | 'INR';
  newsletterSubscribed?: boolean;
  emailReceipts?: boolean;
  productUpdates?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL?: string;
  role?: 'customer' | 'admin' | 'creator';
  accountType?: 'customer' | 'creator';
  creatorUid?: string;
  authProvider?: string;
  purchasedProductIds: string[];
  savedProductIds: string[];
  createdAt: string;
  updatedAt?: string;
  lastLoginAt: string;
  preferences?: UserPreferences;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface FirestorePurchase {
  id?: string;
  userId: string;
  productId: string;
  orderId: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  status?: 'completed' | 'pending' | 'failed' | 'refunded';
  purchasedAt: string;
  accessStatus: 'active' | 'revoked';
  productTitle?: string;
  amountPaid?: number;
  verificationToken?: string;
}

export interface FirestoreDownload {
  id?: string;
  userId: string;
  productId: string;
  downloadCount: number;
  lastDownloadedAt: string;
  productTitle?: string;
  fileName?: string;
}

export interface FirestoreOrder {
  orderId: string;
  userId: string;
  customerEmail: string;
  products: {
    productId: string;
    title: string;
    price: number;
    format?: string;
  }[];
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  createdAt: string;
}

export interface ChatSessionRecord {
  sessionId: string;
  userId: string;
  messages: {
    id?: string;
    sender: 'user' | 'agent';
    text: string;
    timestamp: string;
    sources?: { title: string; url: string }[];
  }[];
  createdAt: string;
  updatedAt: string;
}

// Search System Types
export type SearchMatchField =
  | 'title'
  | 'keyword'
  | 'tag'
  | 'category'
  | 'subcategory'
  | 'subtitle'
  | 'description'
  | 'fuzzy';

export interface SearchResult {
  product: Product;
  score: number;
  matchedTerms: string[];
  matchedField: SearchMatchField;
  primaryMatchField?: SearchMatchField;
  highlightSnippet?: string;
  matchType?: string;
}

export interface SearchFilterOptions {
  category?: string;
  format?: string;
  priceRange?: 'all' | 'under20' | '20to30' | 'above30';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  productType?: string;
  sortBy?: 'relevance' | 'popular' | 'price-low' | 'price-high' | 'rating' | 'newest';
  limit?: number;
}

export interface SearchAnalyticsEvent {
  query: string;
  resultCount: number;
  selectedProductId?: string;
  timestamp: string;
  source: 'live-dropdown' | 'search-page' | 'navbar' | 'hero' | 'chip';
}

export type DashboardTab =
  | 'profile'
  | 'purchases'
  | 'orders'
  | 'downloads'
  | 'settings'
  | 'support'
  | 'signout';

export type CreatorDashboardTab =
  | 'overview'
  | 'products'
  | 'add-product'
  | 'sales'
  | 'earnings'
  | 'payouts'
  | 'customers'
  | 'analytics'
  | 'profile'
  | 'payment-setup'
  | 'security'
  | 'support';

export interface CreatorVerificationStatus {
  idVerified: boolean;
  taxCompleted: boolean;
  paymentVerified: boolean;
  idType?: 'passport' | 'national_id' | 'driver_license';
  idNumberMasked?: string;
  taxIdMasked?: string;
  businessRegistrationNumber?: string;
  notes?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export interface CreatorPayoutSettings {
  payoutMethod: 'bank_transfer' | 'paypal' | 'stripe_connect' | 'upi';
  accountHolderName: string;
  accountNumberOrEmail: string;
  bankNameOrIfsc?: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR';
  minimumPayoutThreshold: number;
  isConfigured: boolean;
  // Marketplace Linked Account / Razorpay Route Integration
  onboardingStatus?: 'not_started' | 'in_progress' | 'linked' | 'rejected';
  linkedAccountId?: string; // Masked provider account ID (e.g., acc_route_****)
  bankSettlementStatus?: 'active' | 'under_verification' | 'suspended';
  lastPayoutDate?: string;
  lastPayoutAmount?: number;
  payoutSchedule?: 'instant' | 'daily' | 'weekly' | 'monthly';
}

export interface CreatorProfile {
  creatorUid: string; // Firebase Authentication permanent UID
  displayName: string;
  businessName?: string;
  profileImage: string;
  bio: string;
  creatorType: CreatorType;
  country: string;
  email: string;
  accountStatus: CreatorStatus;
  verificationStatus: CreatorVerificationStatus;
  payoutSettings: CreatorPayoutSettings;
  socialLinks?: {
    twitter?: string;
    github?: string;
    website?: string;
    youtube?: string;
    linkedin?: string;
  };
  totalSales: number;
  totalEarnings: number;
  balanceAvailable: number;
  balancePending: number;
  totalWithdrawn: number;
  createdDate: string;
  updatedDate: string;
  followersCount?: number;
  viewCount?: number;
  conversionRate?: number;
}

export interface CreatorPayoutRecord {
  payoutId: string;
  creatorUid: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  payoutMethod: string;
  destination: string;
  transactionRef?: string;
  createdAt: string;
  processedAt?: string;
}

export interface CreatorSaleItem {
  orderId: string;
  productId: string;
  productTitle: string;
  customerName: string;
  customerEmailMasked: string;
  grossAmount: number;
  platformFee: number;
  providerFee?: number;
  taxAmount?: number;
  netEarnings: number;
  currency: string;
  date: string;
  status: 'completed' | 'refunded';
}

export interface ProductReport {
  id: string;
  productId: string;
  productTitle: string;
  creatorId: string;
  creatorName?: string;
  reportedByUserId?: string;
  reporterEmail?: string;
  reason: 'copyright' | 'misleading' | 'harmful' | 'malware' | 'broken_file' | 'other';
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
  actionTaken?: 'none' | 'product_suspended' | 'creator_warned' | 'creator_suspended';
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: 'admin' | 'creator' | 'system';
  action: string;
  targetType: 'creator' | 'product' | 'order' | 'payout' | 'user' | 'report';
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  productTitle?: string;
  userId: string;
  authorName: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase: boolean;
  createdAt: string;
  status: 'published' | 'hidden';
}

export interface CreatorFollow {
  id: string;
  userId: string;
  creatorId: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
}

export interface DisputeRecord {
  id: string;
  orderId: string;
  paymentId: string;
  creatorId: string;
  customerId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'open' | 'under_review' | 'resolved_refunded' | 'resolved_rejected';
  createdAt: string;
  evidence?: string;
}

export interface LoginActivityItem {
  id: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  device: string;
  location?: string;
  status: 'success' | 'failed';
  isCurrent?: boolean;
}


