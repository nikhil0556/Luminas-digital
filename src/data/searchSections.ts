export interface StoreSection {
  id: string;
  title: string;
  subtitle: string;
  page: string;
  sectionAnchor?: string;
  categoryFilter?: string;
  badge: string;
  iconName: 'Flame' | 'BookOpen' | 'Sparkles' | 'ShoppingBag' | 'Star' | 'HelpCircle' | 'FileText' | 'Zap' | 'Palette';
  keywords: string[];
  description: string;
}

export const STORE_SECTIONS: StoreSection[] = [
  {
    id: 'ultimate-ai-creator-section',
    title: 'The Ultimate AI Creator & Business Section',
    subtitle: 'Dual PDF Books: 22-page opening playbook by Nikhil Rajbhar + 248-page 3,500 prompt master library',
    page: 'home',
    sectionAnchor: '#ultimate-ai-creator-section',
    badge: 'Flagship 2-Book Suite',
    iconName: 'Zap',
    keywords: [
      'the ultimate ai creator & business tool',
      'the ultimate ai creator & business section',
      'the ultimate ai creator',
      'ai creator',
      'nikhil rajbhar',
      'nikhil raj',
      'nikhil0556__',
      'opening source',
      'pdf book',
      '3500 prompts',
      '3500 ai prompts',
      'mega-pack',
      'megapack',
      '7-part formula',
      'copywriting',
      'monetization',
      'video creation',
      'seo vault',
      'coding vault',
      'freelancer workflow'
    ],
    description: 'Explore the 22-page opening visual playbook by Nikhil Rajbhar and the complete 248-page 3,500 prompt library. Read sample and download both ebooks once paid.'
  },
  {
    id: 'trending-slash-prompts',
    title: '100 Trending ChatGPT "/" Prompts Section',
    subtitle: 'Quick-reference slash-style prompt commands cheatsheet & live vault',
    page: 'ai-prompts',
    sectionAnchor: '#trending-slash-section',
    badge: 'Trending Section',
    iconName: 'Flame',
    keywords: [
      'trending',
      'slash',
      'chatgpt',
      'prompts',
      'trading',
      'command',
      'commands',
      'cheat sheet',
      'cheatsheet',
      '100 prompts',
      'eli5',
      'debug',
      'plan',
      'code',
      'prioritize',
      'writing',
      'study',
      'exam prep',
      'business',
      'shortcuts',
      'cheatsheet pdf'
    ],
    description: 'Browse, test & 1-click copy 100 slash-syntax prompt commands across 8 high-impact categories.'
  },
  {
    id: 'ai-prompts-vault',
    title: 'AI Prompts & Engineered Mega-Packs',
    subtitle: 'Calibrated prompt vaults tested on GPT-4o, Claude 3.5 & Midjourney',
    page: 'ai-prompts',
    sectionAnchor: '#all-prompt-packs',
    badge: 'AI Prompts',
    iconName: 'Sparkles',
    keywords: [
      'ai',
      'prompts',
      'gpt-4o',
      'claude',
      'midjourney',
      'mega pack',
      'megapack',
      'copywriting',
      'marketing prompts',
      'creator pack',
      'prompt engineering',
      'viral prompts',
      'solopreneur prompts'
    ],
    description: '3,500+ battle-tested prompts engineered for marketers, solopreneurs, and creators.'
  },
  {
    id: 'ebooks-library',
    title: 'E-Books & Strategy Guides Section',
    subtitle: 'Actionable publications on finance, remote work, and creator growth',
    page: 'ebooks',
    badge: 'E-Books Library',
    iconName: 'BookOpen',
    keywords: [
      'ebook',
      'ebooks',
      'book',
      'books',
      'guide',
      'guides',
      'finance',
      'financial playbook',
      'money',
      'investing',
      'remote work',
      'solopreneur',
      'creator blueprint',
      'pdf',
      'reading',
      'chapters'
    ],
    description: 'Interactive e-books with built-in PDF chapter readers and immediate digital downloads.'
  },
  {
    id: 'notion-templates-section',
    title: 'Notion Systems & Workflow Templates',
    subtitle: 'Ready-to-use digital dashboards, operating systems, and trackers',
    page: 'shop',
    categoryFilter: 'Templates',
    badge: 'Templates & OS',
    iconName: 'ShoppingBag',
    keywords: [
      'template',
      'templates',
      'notion',
      'notion os',
      'system',
      'productivity',
      'dashboard',
      'workflow',
      'second brain',
      'planner',
      'notion templates',
      'organizer'
    ],
    description: 'Battle-tested Notion dashboards for solopreneurs, students, and digital creators.'
  },
  {
    id: 'best-sellers-section',
    title: 'Best Sellers & Customer Favorites Section',
    subtitle: 'The most downloaded and highest-rated digital resources in the store',
    page: 'home',
    sectionAnchor: '#best-sellers',
    badge: 'Customer Favorites',
    iconName: 'Zap',
    keywords: [
      'best',
      'bestsellers',
      'best sellers',
      'popular',
      'top rated',
      'favorites',
      'trending products',
      'hot',
      'most downloaded'
    ],
    description: 'Explore the top-performing resources chosen by thousands of customers.'
  },
  {
    id: 'featured-products-section',
    title: "Featured Products & Editor's Picks Section",
    subtitle: 'Curated collection of flagship digital assets with 4.9+ star ratings',
    page: 'home',
    sectionAnchor: '#featured-products',
    badge: "Editor's Picks",
    iconName: 'Star',
    keywords: [
      'featured',
      'picks',
      'recommended',
      'editor',
      'handpicked',
      'flagship',
      'curated'
    ],
    description: 'Handcrafted digital tools backed by exceptional customer feedback.'
  },
  {
    id: 'faq-help-section',
    title: 'FAQ, Licenses & Customer Support',
    subtitle: 'Clear answers on instant delivery, 14-day refund policy, and commercial rights',
    page: 'faq',
    badge: 'Help & FAQ',
    iconName: 'HelpCircle',
    keywords: [
      'faq',
      'help',
      'support',
      'questions',
      'refund',
      'refunds',
      'money back',
      'guarantee',
      'download',
      'delivery',
      'license',
      'commercial license',
      'payment'
    ],
    description: 'Instant answers to all common questions, order assistance, and license guides.'
  }
];
