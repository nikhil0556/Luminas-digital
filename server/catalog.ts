/**
 * Server-side Product Catalog & Price Authority
 *
 * CRITICAL SECURITY DIRECTIVE:
 * Prices sent from browser clients are NEVER trusted.
 * The backend calculates the exact payable amount, discounts, and item deliverables
 * directly from this server authority.
 */

export interface ProductCatalogEntry {
  id: string;
  slug: string;
  title: string;
  price: number; // Base currency: INR
  format: string;
  pagesOrCount: string;
  downloadFilename: string;
  deliverableFileContent?: string;
}

export const SERVER_PRODUCT_CATALOG: Record<string, ProductCatalogEntry> = {
  // Current Lumina Digital Prompt Products
  'prod-editing-designing-50-slash': {
    id: 'prod-editing-designing-50-slash',
    slug: '50-trending-one-word-slash-prompts-editing-designing',
    title: '50 Trending One-Word “/” Prompts for Edits & Designs',
    price: 1699, // ~$20
    format: 'PDF',
    pagesOrCount: '5-Page Master PDF Book (50 Prompts)',
    downloadFilename: '50-Trending-One-Word-Prompts-Edits-Designs-Lumina.pdf'
  },
  'prod-chatgpt-100-slash': {
    id: 'prod-chatgpt-100-slash',
    slug: '100-trending-chatgpt-slash-prompts',
    title: '100 Trending ChatGPT "/" Prompts for Personal Help & Productivity',
    price: 1699, // ~$20
    format: 'PDF',
    pagesOrCount: '4-Page Master PDF Book (100 Prompts)',
    downloadFilename: '100-Trending-ChatGPT-Slash-Prompts-Lumina.pdf'
  },
  'prod-prompts-duo-bundle-20': {
    id: 'prod-prompts-duo-bundle-20',
    slug: 'chatgpt-slash-prompts-pdf-books-duo-bundle',
    title: 'The Ultimate 150 “/” Prompts PDF Books Duo',
    price: 1699, // ~$20
    format: 'PDF Bundle',
    pagesOrCount: '9 Pages (2 Complete Master PDF Books)',
    downloadFilename: 'Complete-150-Prompts-PDF-Books-Duo-Bundle-Lumina.zip'
  },
  // Store Catalog Guides & Templates
  'prod-fin-free': {
    id: 'prod-fin-free',
    slug: 'how-to-be-financially-free-in-young-age',
    title: 'How to Be Financially Free in Young Age',
    price: 1699, // ~$20
    format: 'PDF',
    pagesOrCount: '8-Page Master Guide',
    downloadFilename: 'How-to-Be-Financially-Free-in-Young-Age.pdf'
  },
  'prod-ai-mega': {
    id: 'prod-ai-mega',
    slug: 'ai-mega-prompt-engineering-bible',
    title: 'AI Mega-Prompt Engineering Bible (500+ Prompts)',
    price: 2449, // ~$29
    format: 'Prompt Vault & PDF',
    pagesOrCount: '500+ Curated Prompts',
    downloadFilename: 'AI-Mega-Prompt-Engineering-Bible-Lumina.pdf'
  },
  'book-opening-playbook': {
    id: 'book-opening-playbook',
    slug: 'the-ultimate-ai-creator-opening-visual-playbook',
    title: 'The Ultimate AI Creator (Opening Source & Visual Playbook)',
    price: 2849, // ~$34
    format: 'Illustrated PDF Playbook',
    pagesOrCount: '22-Page Master PDF Book',
    downloadFilename: 'The-Ultimate-AI-Creator-Opening-Playbook-Lumina.pdf'
  },
  'book-main-3500-prompts': {
    id: 'book-main-3500-prompts',
    slug: 'the-ultimate-ai-creator-3500-prompts-library',
    title: 'The Ultimate AI Creator & Business Mega-Pack (Main 3,500 Prompt Library)',
    price: 2849, // ~$34
    format: 'Complete Master Library (PDF)',
    pagesOrCount: '248-Page Master Library (3,500 Prompts)',
    downloadFilename: 'The-Ultimate-AI-Creator-and-Business-Mega-Pack-3500-Prompts.pdf'
  },
  'prod-notion-os': {
    id: 'prod-notion-os',
    slug: 'ultimate-notion-freelance-os',
    title: 'Ultimate Notion Freelance Operating System',
    price: 2849, // ~$34
    format: 'Notion Template',
    pagesOrCount: 'Complete Workspace',
    downloadFilename: 'Notion-Freelance-OS-Access-Kit.pdf'
  },
  'prod-freelance-kit': {
    id: 'prod-freelance-kit',
    slug: 'high-ticket-client-acquisition-toolkit',
    title: 'High-Ticket Client Acquisition Toolkit',
    price: 3299, // ~$39
    format: 'Toolkit & Templates',
    pagesOrCount: '25+ Templates',
    downloadFilename: 'High-Ticket-Client-Acquisition-Kit.zip'
  },
  'prod-viral-prompts': {
    id: 'prod-viral-prompts',
    slug: 'viral-content-hooks-threads-system',
    title: 'Viral Content Hooks & Thread Architecture',
    price: 1849, // ~$22
    format: 'Guide & Swipe File',
    pagesOrCount: '150+ Templates',
    downloadFilename: 'Viral-Content-Hooks-System.pdf'
  },
  'prod-deep-work': {
    id: 'prod-deep-work',
    slug: 'deep-work-focus-sprint-planner',
    title: 'Deep Work & Focus Sprint Planner',
    price: 1699, // ~$20
    format: 'Digital Planner & PDF',
    pagesOrCount: '90-Day Sprint System',
    downloadFilename: 'Deep-Work-Focus-Sprint-Planner.pdf'
  },
  'prod-solo-founder': {
    id: 'prod-solo-founder',
    slug: 'zero-to-one-solo-founder-playbook',
    title: 'Zero-to-One Solo Founder Playbook',
    price: 2249, // ~$27
    format: 'Master Playbook',
    pagesOrCount: '12 Detailed Modules',
    downloadFilename: 'Solo-Founder-Playbook-Lumina.pdf'
  },
  'prod-student-study-os': {
    id: 'prod-student-study-os',
    slug: 'academic-excellence-student-study-os',
    title: 'Academic Excellence & Active Recall Study OS',
    price: 1749, // ~$21
    format: 'Notion & PDF Kit',
    pagesOrCount: 'Full System',
    downloadFilename: 'Academic-Excellence-Study-OS.pdf'
  },
  'prod-b2b-marketing-blueprint': {
    id: 'prod-b2b-marketing-blueprint',
    slug: 'b2b-growth-marketing-blueprint',
    title: 'B2B Growth Marketing & Lead Generation Blueprint',
    price: 2199, // ~$26
    format: 'Framework & Templates',
    pagesOrCount: '8 Comprehensive Modules',
    downloadFilename: 'B2B-Growth-Marketing-Blueprint.pdf'
  },
  'prod-ai-business-suite': {
    id: 'prod-ai-business-suite',
    slug: 'ai-for-business-operations-suite',
    title: 'AI for Business Operations & Automation Suite',
    price: 2099, // ~$25
    format: 'SOPs & Prompts',
    pagesOrCount: '30+ Workflows',
    downloadFilename: 'AI-Business-Operations-Suite.zip'
  },
  'prod-personal-brand': {
    id: 'prod-personal-brand',
    slug: 'linkedin-x-personal-brand-accelerator',
    title: 'LinkedIn & X Personal Brand Accelerator',
    price: 1849, // ~$22
    format: 'Playbook & Calendar',
    pagesOrCount: '60-Day Strategy',
    downloadFilename: 'Personal-Brand-Accelerator.pdf'
  },
  'prod-landing-copy': {
    id: 'prod-landing-copy',
    slug: 'high-converting-landing-page-copywriting-framework',
    title: 'High-Converting Landing Page Copywriting Framework',
    price: 2699, // ~$32
    format: 'Swipe File & Guide',
    pagesOrCount: '12 Proven Frameworks',
    downloadFilename: 'Landing-Page-Copywriting-Framework.pdf'
  }
};

export const SERVER_COUPONS: Record<string, { code: string; type: 'percentage' | 'fixed'; value: number }> = {
  'LUMINA20': { code: 'LUMINA20', type: 'percentage', value: 20 },
  'SAVE10': { code: 'SAVE10', type: 'fixed', value: 800 },
  'WELCOME15': { code: 'WELCOME15', type: 'percentage', value: 15 },
  'CREATOR50': { code: 'CREATOR50', type: 'percentage', value: 50 },
  'FREE100': { code: 'FREE100', type: 'percentage', value: 100 }
};

/**
 * Server-Authoritative Price Calculation
 * Calculates subtotal, discount, and final amount based strictly on server catalog data.
 * Throws a 400 error if any item ID is not in the authoritative product catalog.
 */
export function calculateServerOrderMath(
  items: { productId: string; quantity: number }[],
  couponCode?: string
): {
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  validItems: { product: ProductCatalogEntry; quantity: number; itemTotal: number }[];
} {
  let subtotal = 0;
  const validItems: { product: ProductCatalogEntry; quantity: number; itemTotal: number }[] = [];

  for (const item of items) {
    const catalogItem = SERVER_PRODUCT_CATALOG[item.productId];
    if (!catalogItem) {
      const err: any = new Error(`Unknown product ID: "${item.productId}". Product does not exist in catalog.`);
      err.statusCode = 400;
      throw err;
    }
    const qty = Math.max(1, Math.min(20, Math.floor(item.quantity || 1)));
    const itemTotal = catalogItem.price * qty;
    subtotal += itemTotal;
    validItems.push({
      product: catalogItem,
      quantity: qty,
      itemTotal
    });
  }

  let discountAmount = 0;
  if (couponCode) {
    const coupon = SERVER_COUPONS[couponCode.toUpperCase().trim()];
    if (coupon) {
      if (coupon.type === 'percentage') {
        discountAmount = (subtotal * coupon.value) / 100;
      } else {
        discountAmount = Math.min(coupon.value, subtotal);
      }
    }
  }

  // Round to 2 decimal places to avoid float inaccuracies
  discountAmount = Math.round(discountAmount * 100) / 100;
  const finalTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount,
    finalTotal,
    validItems
  };
}
