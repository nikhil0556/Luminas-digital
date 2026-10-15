import { Product, SearchResult, SearchFilterOptions, SearchMatchField, SearchAnalyticsEvent } from '../types';

/**
 * Lumina Digital Centralized Search Engine
 * Relevance-scored, multi-word, typo-tolerant, synonym-expanded search system.
 */

// ---------------------------------------------------------------------------
// Normalization & Tokenization
// ---------------------------------------------------------------------------

/**
 * Normalizes text: converts to lowercase, replaces punctuation/special characters
 * with spaces while preserving words, and collapses whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[/\\_#+\-@]/g, ' ') // treat separators as spaces
    .replace(/[^a-z0-9\s]/g, '') // remove remaining punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits query or text into clean, non-empty tokens.
 */
export function tokenize(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm.split(' ').filter(t => t.length > 0);
}

// ---------------------------------------------------------------------------
// Synonym & Semantic Alias Map
// ---------------------------------------------------------------------------

const SYNONYM_MAP: Record<string, string[]> = {
  ai: ['artificial intelligence', 'machine learning', 'generative ai', 'genai', 'chatgpt', 'claude', 'midjourney', 'llm'],
  'artificial intelligence': ['ai', 'chatgpt', 'claude', 'machine learning'],
  chatgpt: ['chat gpt', 'gpt', 'gpt4', 'gpt-4', 'gpt-4o', 'openai', 'ai', 'prompt', 'prompts'],
  'chat gpt': ['chatgpt', 'gpt', 'openai', 'ai'],
  gpt: ['chatgpt', 'openai', 'ai'],
  claude: ['anthropic', 'ai', 'chatgpt'],
  midjourney: ['mj', 'image generation', 'photo editing', 'design', 'ai art'],
  
  money: ['finance', 'finances', 'financial', 'wealth', 'budget', 'saving', 'savings', 'cash', 'income', 'debt'],
  finance: ['financial', 'money', 'finances', 'wealth', 'budget', 'saving', 'investing', 'personal finance'],
  financial: ['finance', 'money', 'finances', 'wealth', 'budgeting', 'saving'],
  saving: ['savings', 'save', 'budget', 'budgeting', 'money', 'finance', 'emergency fund'],
  savings: ['saving', 'save', 'budget', 'money', 'finance'],
  budget: ['budgeting', '50 30 20', 'money', 'finance', 'saving'],
  budgeting: ['budget', 'saving', 'money', 'finance', '50 30 20 rule'],
  investing: ['investment', 'wealth', 'compound interest', 'finance'],
  
  prompt: ['prompts', 'slash prompts', 'chatgpt prompts', 'prompt pack', 'prompting', 'commands'],
  prompts: ['prompt', 'slash prompts', 'chatgpt prompts', 'prompt pack', 'prompting', 'commands'],
  slash: ['slash prompts', 'prompts', 'commands', 'shortcuts', 'cheatsheet'],
  
  design: ['designing', 'designs', 'designer', 'graphic design', 'photo editing', 'aesthetics', 'visual'],
  designing: ['design', 'designs', 'graphic design', 'photo editing', 'visual'],
  designs: ['design', 'designing', 'graphic design'],
  edit: ['editing', 'edits', 'editor', 'photo editing', 'retouching'],
  editing: ['edit', 'edits', 'photo editing', 'design', 'graphic design', 'photoshop'],
  edits: ['edit', 'editing', 'photo editing', 'design'],
  
  book: ['ebook', 'ebooks', 'e-book', 'e-books', 'pdf', 'pdf book', 'guide', 'playbook'],
  books: ['book', 'ebook', 'ebooks', 'e-book', 'pdf books', 'guides'],
  ebook: ['book', 'books', 'e-book', 'pdf book', 'guide', 'read'],
  ebooks: ['ebook', 'book', 'books', 'e-books', 'pdf books'],
  
  productivity: ['productive', 'focus', 'deep work', 'flow state', 'efficiency', 'time management', 'habits', 'organization'],
  productive: ['productivity', 'focus', 'deep work', 'efficiency'],
  focus: ['deep work', 'productivity', 'flow state', 'time blocking'],
  
  template: ['templates', 'notion', 'workspace', 'dashboard', 'second brain'],
  templates: ['template', 'notion', 'workspace', 'dashboard'],
  notion: ['notion template', 'templates', 'workspace', 'second brain', 'productivity'],
  
  freelance: ['freelancer', 'freelancing', 'agency', 'client', 'consulting', 'contracts'],
  freelancer: ['freelance', 'freelancing', 'agency', 'client'],
  business: ['startup', 'founder', 'solopreneur', 'agency', 'entrepreneur', 'sales', 'marketing', 'revenue', 'mrr'],
  founder: ['solopreneur', 'entrepreneur', 'solo founder', 'startup', 'indie hacker', 'business'],
  
  student: ['study', 'studying', 'exam', 'exams', 'college', 'school', 'active recall', 'grades'],
  study: ['student', 'studying', 'exam', 'exams', 'active recall', 'learning'],
  
  marketing: ['b2b', 'leads', 'growth', 'funnels', 'social media', 'traffic', 'copywriting', 'viral'],
  copywriting: ['copy', 'landing page', 'headlines', 'marketing', 'writing'],
  bundle: ['pack', 'combo', 'duo', 'collection', 'vault']
};

/**
 * Expands query tokens using the synonym dictionary.
 */
export function getSynonymsForToken(token: string): string[] {
  const clean = normalizeText(token);
  if (!clean) return [];
  const found = SYNONYM_MAP[clean];
  if (found) return found;
  
  // Check multi-word keys
  for (const [key, list] of Object.entries(SYNONYM_MAP)) {
    if (key === clean) return list;
  }
  return [];
}

// ---------------------------------------------------------------------------
// Levenshtein & Typo Tolerance
// ---------------------------------------------------------------------------

/**
 * Calculates Levenshtein edit distance between two normalized words.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Checks if word A is a typo of word B with length-calibrated thresholds.
 * - length < 4: exact match required
 * - length 4-6: distance <= 1 allowed (e.g., 'finace' -> 'finance', 'desgin' -> 'design')
 * - length >= 7: distance <= 2 allowed (e.g., 'prodcutivity' -> 'productivity')
 */
export function isFuzzyMatch(queryWord: string, targetWord: string): boolean {
  if (queryWord === targetWord) return true;
  const qLen = queryWord.length;
  const tLen = targetWord.length;
  
  // Quick length cutoff
  if (Math.abs(qLen - tLen) > 2) return false;
  if (qLen < 4) return false;

  const maxDist = qLen >= 7 ? 2 : 1;
  return levenshteinDistance(queryWord, targetWord) <= maxDist;
}

// ---------------------------------------------------------------------------
// Highlight & Snippet Generation
// ---------------------------------------------------------------------------

/**
 * Extracts a concise highlight snippet from product text that contains query matches.
 */
export function extractHighlightSnippet(product: Product, queryTokens: string[]): string {
  if (!queryTokens.length) return product.shortDescription;

  // Fields to search for snippet
  const fields = [
    product.subtitle || '',
    product.shortDescription,
    product.fullDescription,
    ...(product.whatsIncluded || []),
    ...(product.keyBenefits || [])
  ];

  for (const field of fields) {
    if (!field) continue;
    const lower = field.toLowerCase();
    for (const token of queryTokens) {
      const idx = lower.indexOf(token);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(field.length, idx + token.length + 60);
        let snippet = field.slice(start, end).trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < field.length) snippet = snippet + '...';
        return snippet;
      }
    }
  }

  return product.shortDescription;
}

// ---------------------------------------------------------------------------
// Core Scoring & Search Engine
// ---------------------------------------------------------------------------

interface ProductSearchIndex {
  product: Product;
  normalizedTitle: string;
  normalizedSubtitle: string;
  normalizedCategory: string;
  normalizedSubcategory: string;
  normalizedTags: string[];
  normalizedKeywords: string[];
  normalizedShortDesc: string;
  normalizedFullDesc: string;
  normalizedFeatures: string[];
  allWords: Set<string>;
}

// In-memory indexed cache
let cachedIndex: { productsRef: Product[]; index: ProductSearchIndex[] } | null = null;

function buildSearchIndex(products: Product[]): ProductSearchIndex[] {
  if (cachedIndex && cachedIndex.productsRef === products) {
    return cachedIndex.index;
  }

  const index = products.map(product => {
    const normTitle = normalizeText(product.title);
    const normSubtitle = normalizeText(product.subtitle || '');
    const normCategory = normalizeText(product.category);
    const normSubcategory = normalizeText(product.subcategory || '');
    const normTags = (product.tags || []).map(normalizeText).filter(Boolean);
    const normKeywords = (product.keywords || []).map(normalizeText).filter(Boolean);
    const normShortDesc = normalizeText(product.shortDescription);
    const normFullDesc = normalizeText(product.fullDescription || '');
    const normFeatures = [
      ...(product.whatsIncluded || []),
      ...(product.features || []),
      ...(product.keyBenefits || [])
    ].map(normalizeText).filter(Boolean);

    // Extract all distinct words for fast lookup
    const allWords = new Set<string>();
    [
      ...tokenize(normTitle),
      ...tokenize(normSubtitle),
      ...tokenize(normCategory),
      ...tokenize(normSubcategory),
      ...normTags.flatMap(tokenize),
      ...normKeywords.flatMap(tokenize),
      ...tokenize(normShortDesc),
      ...normFeatures.flatMap(tokenize)
    ].forEach(w => {
      if (w.length >= 2) allWords.add(w);
    });

    return {
      product,
      normalizedTitle: normTitle,
      normalizedSubtitle: normSubtitle,
      normalizedCategory: normCategory,
      normalizedSubcategory: normSubcategory,
      normalizedTags: normTags,
      normalizedKeywords: normKeywords,
      normalizedShortDesc: normShortDesc,
      normalizedFullDesc: normFullDesc,
      normalizedFeatures: normFeatures,
      allWords
    };
  });

  cachedIndex = { productsRef: products, index };
  return index;
}

/**
 * Searches and scores products using the multi-tier relevance algorithm.
 * 
 * Order of relevance:
 * 1. Exact title match (highest score)
 * 2. Title starts with query
 * 3. Title contains query phrase
 * 4. Exact keyword match
 * 5. Exact tag match
 * 6. Category / Subcategory match
 * 7. Subtitle phrase/token match
 * 8. Description match
 * 9. Partial word / prefix match ("finan" -> finance, "produc" -> productivity, "desig" -> design)
 * 10. Synonym matches (AI -> artificial intelligence, money -> finance, saving -> savings)
 * 11. Typo-tolerant fuzzy matches ("finace", "desgin", "prodcutivity")
 * 12. Multi-word compounding bonus when all query tokens match
 */
export function searchProducts(
  query: string,
  products: Product[],
  options: SearchFilterOptions = {}
): SearchResult[] {
  const cleanQuery = normalizeText(query);

  if (!cleanQuery) {
    let filtered = products.filter(product => {
      if (options.category && options.category !== 'all' && options.category !== 'All Products') {
        const matchCat =
          product.category.toLowerCase() === options.category.toLowerCase() ||
          (product.tags && product.tags.some(t => t.toLowerCase() === options.category?.toLowerCase()));
        if (!matchCat) return false;
      }
      if (options.format && options.format !== 'all') {
        if (!product.format.toLowerCase().includes(options.format.toLowerCase())) return false;
      }
      if (options.priceRange) {
        if (options.priceRange === 'under20') {
          const isUnder = product.price < 1800 || (product.price < 22 && product.price < 100);
          if (!isUnder) return false;
        }
        if (options.priceRange === '20to30') {
          const inRange = (product.price >= 1800 && product.price <= 2500) || (product.price >= 20 && product.price <= 30);
          if (!inRange) return false;
        }
        if (options.priceRange === 'above30') {
          const isAbove = product.price > 2500 || (product.price > 30 && product.price < 100);
          if (!isAbove) return false;
        }
      }
      if (options.minPrice !== undefined && product.price < options.minPrice) return false;
      if (options.maxPrice !== undefined && product.price > options.maxPrice) return false;
      if (options.minRating && options.minRating > 0 && product.rating < options.minRating) return false;
      if (options.productType && product.productType && product.productType !== options.productType) return false;
      return true;
    });

    const sortBy = options.sortBy || 'relevance';
    filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return (b.isNewRelease ? 1 : 0) - (a.isNewRelease ? 1 : 0);
      const aRev = a.reviewCount || (a as any).reviewsCount || 0;
      const bRev = b.reviewCount || (b as any).reviewsCount || 0;
      return bRev * b.rating - aRev * a.rating;
    });

    if (options.limit && options.limit > 0) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered.map(product => ({
      product,
      score: 100,
      matchedTerms: [],
      matchedField: 'category' as SearchMatchField,
      primaryMatchField: 'category' as SearchMatchField,
      highlightSnippet: product.shortDescription
    }));
  }

  const queryTokens = tokenize(cleanQuery);
  if (!queryTokens.length) return [];

  const index = buildSearchIndex(products);
  const results: SearchResult[] = [];

  // Pre-expand synonyms for all query tokens
  const tokenSynonymMap: Map<string, string[]> = new Map();
  for (const token of queryTokens) {
    tokenSynonymMap.set(token, getSynonymsForToken(token));
  }

  for (const item of index) {
    const { product } = item;

    // Apply strict filters before scoring
    if (options.category && options.category !== 'all' && options.category !== 'All Products') {
      const matchCat =
        product.category.toLowerCase() === options.category.toLowerCase() ||
        (product.tags && product.tags.some(t => t.toLowerCase() === options.category?.toLowerCase()));
      if (!matchCat) continue;
    }

    if (options.format && options.format !== 'all') {
      if (!product.format.toLowerCase().includes(options.format.toLowerCase())) continue;
    }

    if (options.priceRange) {
      if (options.priceRange === 'under20') {
        const isUnder = product.price < 1800 || (product.price < 22 && product.price < 100);
        if (!isUnder) continue;
      }
      if (options.priceRange === '20to30') {
        const inRange = (product.price >= 1800 && product.price <= 2500) || (product.price >= 20 && product.price <= 30);
        if (!inRange) continue;
      }
      if (options.priceRange === 'above30') {
        const isAbove = product.price > 2500 || (product.price > 30 && product.price < 100);
        if (!isAbove) continue;
      }
    }

    if (options.minPrice !== undefined && product.price < options.minPrice) continue;
    if (options.maxPrice !== undefined && product.price > options.maxPrice) continue;
    if (options.minRating && options.minRating > 0 && product.rating < options.minRating) continue;
    if (options.productType && product.productType && product.productType !== options.productType) continue;

    let score = 0;
    const matchedTerms = new Set<string>();
    let primaryMatchField: SearchMatchField = 'description';
    let tokensMatchedCount = 0;

    // -------------------------------------------------------------------------
    // 1. Exact Title Match
    // -------------------------------------------------------------------------
    if (item.normalizedTitle === cleanQuery) {
      score += 550;
      matchedTerms.add(cleanQuery);
      primaryMatchField = 'title';
    } else if (item.normalizedTitle.startsWith(cleanQuery)) {
      score += 320;
      matchedTerms.add(cleanQuery);
      primaryMatchField = 'title';
    } else if (item.normalizedTitle.includes(cleanQuery)) {
      score += 240;
      matchedTerms.add(cleanQuery);
      primaryMatchField = 'title';
    }

    // -------------------------------------------------------------------------
    // 2. Keyword & Tag Exact Phrase Matches
    // -------------------------------------------------------------------------
    for (const kw of item.normalizedKeywords) {
      if (kw === cleanQuery) {
        score += 200;
        matchedTerms.add(kw);
        if (primaryMatchField !== 'title') primaryMatchField = 'keyword';
      } else if (kw.includes(cleanQuery) || cleanQuery.includes(kw)) {
        score += 110;
        matchedTerms.add(kw);
        if (primaryMatchField !== 'title') primaryMatchField = 'keyword';
      }
    }

    for (const tag of item.normalizedTags) {
      if (tag === cleanQuery) {
        score += 160;
        matchedTerms.add(tag);
        if (primaryMatchField !== 'title' && primaryMatchField !== 'keyword') primaryMatchField = 'tag';
      } else if (tag.includes(cleanQuery)) {
        score += 85;
        matchedTerms.add(tag);
      }
    }

    // -------------------------------------------------------------------------
    // 3. Category & Subcategory Matches
    // -------------------------------------------------------------------------
    if (item.normalizedCategory === cleanQuery) {
      score += 140;
      matchedTerms.add(item.normalizedCategory);
      if (primaryMatchField === 'description') primaryMatchField = 'category';
    } else if (item.normalizedCategory.includes(cleanQuery)) {
      score += 75;
      matchedTerms.add(cleanQuery);
      if (primaryMatchField === 'description') primaryMatchField = 'category';
    }

    if (item.normalizedSubcategory && item.normalizedSubcategory.includes(cleanQuery)) {
      score += 80;
      matchedTerms.add(cleanQuery);
      if (primaryMatchField === 'description') primaryMatchField = 'subcategory';
    }

    // -------------------------------------------------------------------------
    // 4. Subtitle & Description Phrase Matches
    // -------------------------------------------------------------------------
    if (item.normalizedSubtitle.includes(cleanQuery)) {
      score += 110;
      matchedTerms.add(cleanQuery);
      if (primaryMatchField === 'description') primaryMatchField = 'subtitle';
    }

    if (item.normalizedShortDesc.includes(cleanQuery)) {
      score += 80;
      matchedTerms.add(cleanQuery);
    } else if (item.normalizedFullDesc.includes(cleanQuery)) {
      score += 40;
      matchedTerms.add(cleanQuery);
    }

    // -------------------------------------------------------------------------
    // 5. Individual Token & Partial / Prefix / Fuzzy / Synonym Scoring
    // -------------------------------------------------------------------------
    for (const qToken of queryTokens) {
      let tokenMatched = false;
      const synonyms = tokenSynonymMap.get(qToken) || [];

      // A. Title token match
      if (item.normalizedTitle.includes(qToken)) {
        score += 90;
        tokenMatched = true;
        matchedTerms.add(qToken);
        if (primaryMatchField === 'description') primaryMatchField = 'title';
      }

      // B. Keyword token match
      for (const kw of item.normalizedKeywords) {
        if (kw === qToken) {
          score += 85;
          tokenMatched = true;
          matchedTerms.add(qToken);
          if (primaryMatchField === 'description') primaryMatchField = 'keyword';
          break;
        } else if (kw.includes(qToken)) {
          score += 50;
          tokenMatched = true;
          matchedTerms.add(qToken);
          if (primaryMatchField === 'description') primaryMatchField = 'keyword';
          break;
        }
      }

      // C. Tag token match
      for (const tag of item.normalizedTags) {
        if (tag === qToken) {
          score += 70;
          tokenMatched = true;
          matchedTerms.add(qToken);
          if (primaryMatchField === 'description') primaryMatchField = 'tag';
          break;
        } else if (tag.includes(qToken)) {
          score += 40;
          tokenMatched = true;
          matchedTerms.add(qToken);
          break;
        }
      }

      // D. Subtitle token match
      if (item.normalizedSubtitle.includes(qToken)) {
        score += 45;
        tokenMatched = true;
        matchedTerms.add(qToken);
        if (primaryMatchField === 'description') primaryMatchField = 'subtitle';
      }

      // E. Category / Subcategory token match
      if (item.normalizedCategory.includes(qToken)) {
        score += 55;
        tokenMatched = true;
        matchedTerms.add(qToken);
        if (primaryMatchField === 'description') primaryMatchField = 'category';
      }

      // F. Short / Full description token match
      if (item.normalizedShortDesc.includes(qToken)) {
        score += 35;
        tokenMatched = true;
        matchedTerms.add(qToken);
      } else if (item.normalizedFullDesc.includes(qToken)) {
        score += 18;
        tokenMatched = true;
        matchedTerms.add(qToken);
      }

      // G. Features & Benefits token match
      for (const feat of item.normalizedFeatures) {
        if (feat.includes(qToken)) {
          score += 20;
          tokenMatched = true;
          matchedTerms.add(qToken);
          break;
        }
      }

      // H. Partial word / Prefix match (e.g. "finan" -> "finance", "produc" -> "productivity")
      if (qToken.length >= 3) {
        for (const word of item.allWords) {
          if (word.startsWith(qToken) && word !== qToken) {
            score += 40;
            tokenMatched = true;
            matchedTerms.add(word);
            break;
          }
        }
      }

      // I. Synonym Matching (e.g. AI -> artificial intelligence, money -> finance)
      if (synonyms.length > 0) {
        for (const syn of synonyms) {
          const synNorm = normalizeText(syn);
          if (
            item.normalizedTitle.includes(synNorm) ||
            item.normalizedKeywords.some(k => k.includes(synNorm)) ||
            item.normalizedTags.some(t => t.includes(synNorm)) ||
            item.normalizedShortDesc.includes(synNorm) ||
            item.normalizedCategory.includes(synNorm)
          ) {
            score += 65;
            tokenMatched = true;
            matchedTerms.add(syn);
            break;
          }
        }
      }

      // J. Fuzzy / Typo tolerance (e.g. "finace" -> "finance", "desgin" -> "design", "prodcutivity" -> "productivity")
      if (!tokenMatched && qToken.length >= 4) {
        for (const word of item.allWords) {
          if (isFuzzyMatch(qToken, word)) {
            score += 45;
            tokenMatched = true;
            matchedTerms.add(word);
            if (primaryMatchField === 'description') primaryMatchField = 'fuzzy';
            break;
          }
        }
      }

      if (tokenMatched) {
        tokensMatchedCount++;
      }
    }

    // -------------------------------------------------------------------------
    // 6. Multi-Word Query Bonus
    // -------------------------------------------------------------------------
    if (queryTokens.length > 1) {
      if (tokensMatchedCount === queryTokens.length) {
        // All query tokens found in this product!
        score += 150;
      } else if (tokensMatchedCount > 1) {
        score += (tokensMatchedCount / queryTokens.length) * 80;
      }
    }

    // Minimum score threshold to qualify as a relevant result
    if (score >= 25 && tokensMatchedCount > 0) {
      // Small popularity/bestseller booster for ties
      if (product.isBestSeller) score += 10;
      if (product.isFeatured) score += 5;
      const rev = product.reviewCount || (product as any).reviewsCount || 0;
      score += Math.min(10, (product.rating * rev) / 100);

      results.push({
        product,
        score: Math.round(score),
        matchedTerms: Array.from(matchedTerms),
        matchedField: primaryMatchField,
        primaryMatchField,
        highlightSnippet: extractHighlightSnippet(product, queryTokens),
        matchType: primaryMatchField
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Sorting Results
  // ---------------------------------------------------------------------------
  const sortBy = options.sortBy || 'relevance';

  results.sort((a, b) => {
    if (sortBy === 'relevance') {
      return b.score - a.score;
    }
    if (sortBy === 'popular') {
      const aRev = a.product.reviewCount || (a.product as any).reviewsCount || 0;
      const bRev = b.product.reviewCount || (b.product as any).reviewsCount || 0;
      return bRev * b.product.rating - aRev * a.product.rating;
    }
    if (sortBy === 'price-low') {
      return a.product.price - b.product.price;
    }
    if (sortBy === 'price-high') {
      return b.product.price - a.product.price;
    }
    if (sortBy === 'rating') {
      return b.product.rating - a.product.rating;
    }
    if (sortBy === 'newest') {
      return (b.product.isNewRelease ? 1 : 0) - (a.product.isNewRelease ? 1 : 0);
    }
    return b.score - a.score;
  });

  if (options.limit && options.limit > 0) {
    return results.slice(0, options.limit);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Search Analytics & Recent Searches Helpers
// ---------------------------------------------------------------------------

const RECENT_SEARCHES_KEY = 'lumina_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export const POPULAR_SEARCH_SUGGESTIONS: string[] = [
  'AI Prompts',
  '100 Trending ChatGPT Prompts',
  'Financial Freedom',
  '50 Editing & Designing Prompts',
  'Notion OS',
  'Personal Finance',
  'Productivity',
  'Viral Video Prompts',
  'Solo Founder Playbook',
  'Student Study OS'
];

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): void {
  const clean = query.trim();
  if (!clean || clean.length < 2) return;
  try {
    const existing = getRecentSearches();
    const updated = [clean, ...existing.filter(s => s.toLowerCase() !== clean.toLowerCase())].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore
  }
}

export function logSearchAnalytics(event: SearchAnalyticsEvent): void {
  // Production analytics logger: in this application, we log to console
  // and maintain privacy (never storing customer PII or payment info)
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[SearchAnalytics]', event);
  }
}

/**
 * Splits a text into matched and unmatched chunks for safe visual highlighting.
 */
export function getHighlightedChunks(
  text: string,
  query: string
): { text: string; match: boolean }[] {
  if (!text || !query.trim()) return [{ text, match: false }];
  const tokens = tokenize(query).filter(t => t.length >= 2);
  if (!tokens.length) return [{ text, match: false }];

  const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.filter(Boolean).map(part => ({
    text: part,
    match: tokens.some(t => t.toLowerCase() === part.toLowerCase())
  }));
}

