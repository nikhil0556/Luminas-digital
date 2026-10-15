export interface PdfPageCard {
  title?: string;
  text?: string;
  bullets?: string[];
  badge?: string;
  callout?: string;
}

export interface UltimatePdfPage {
  pageNumber: number;
  title: string;
  subtitle?: string;
  headerTag?: string;
  statCallout?: {
    stat: string;
    text: string;
  };
  keyPoints?: {
    title: string;
    text: string;
  }[];
  tableData?: {
    headers: string[];
    rows: { item: string; description: string; budget: string; status: string }[];
  };
  cards?: PdfPageCard[];
}

/**
 * The 22-Page "The Ultimate AI Creator" E-Book Opening Source & Visual Playbook
 * Author: Nikhil Rajbhar
 * Date: September 18, 2026
 * Published for: Creators, Freelancers, Marketers & Solopreneurs
 */
export const ULTIMATE_AI_CREATOR_PAGES: UltimatePdfPage[] = [
  {
    pageNumber: 1,
    headerTag: 'OFFICIAL PLAYBOOK COVER',
    title: 'The Ultimate AI Creator',
    subtitle: '3,500+ AI Prompts for Creators and Freelancers',
    cards: [
      {
        badge: 'SEPTEMBER 18, 2026 EDITION',
        title: 'The Ultimate AI Creator',
        text: 'Presented to Creators and Marketers • For Creators\n\nAuthor: Nikhil Rajbhar\nFounder: Nikhil Raj (@nikhil0556__)\nPublished by Lumina Digital\n\nTurn artificial intelligence into your unfair creative and business advantage. 3,500+ field-calibrated prompt frameworks for ChatGPT, Claude 3.5, Gemini, and Midjourney.',
        callout: 'Official Master Playbook & Opening Source Guide • 2026 Verified Release'
      }
    ]
  },
  {
    pageNumber: 2,
    headerTag: 'HOW TO USE',
    title: 'Getting Maximum Value',
    subtitle: 'Utilize This Playbook Effectively',
    cards: [
      {
        title: 'Empower Your Creative Workflow',
        text: 'This playbook is designed to empower creators, freelancers, and small businesses with practical AI strategies that elevate their projects and streamline workflows. Discover valuable insights that will change your approach to AI.',
        callout: 'Inside, you will find over 3,500 prompts and structured frameworks tailored for various needs. Whether you are a student or a solopreneur, these tools will enhance your creativity and effectiveness in the digital landscape.'
      }
    ],
    keyPoints: [
      {
        title: 'Modular Building Blocks',
        text: 'Every prompt is engineered with clear [VARIABLES] you can customize for your specific niche, audience, and goals.'
      },
      {
        title: 'Cross-Model Calibration',
        text: 'Tested for reliability on OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini Pro, and Midjourney v6.'
      }
    ]
  },
  {
    pageNumber: 3,
    headerTag: 'AI BASICS OVERVIEW',
    title: 'AI Basics',
    subtitle: 'Essential Knowledge for Beginners',
    cards: [
      {
        title: 'Core Fundamentals & Mindset',
        text: 'Understanding AI is essential for maximizing the potential of its prompts. Familiarize yourself with the capabilities, limitations, and common mistakes to enhance your interactions and outcomes.',
        callout: 'By mastering these basics, you can harness the power of AI tools effectively. Knowing what prompts to use and how to structure them will significantly improve your experience and results.'
      }
    ],
    keyPoints: [
      {
        title: 'Capabilities',
        text: 'Pattern matching, creative drafting, ideation synthesis, code generation, and strategic outlining.'
      },
      {
        title: 'Limitations & Guardrails',
        text: 'Lack of real-time intuition, potential hallucinations, and sensitivity to prompt vagueness.'
      }
    ]
  },
  {
    pageNumber: 4,
    headerTag: 'AI PROMPTING GUIDE',
    title: '7-Part Formula',
    subtitle: 'Crafting Effective AI Prompts with Structure',
    cards: [
      {
        title: 'The 7 Essential Components',
        text: 'The 7-Part Prompt Formula is essential for crafting effective prompts. Each component—Role, Context, Goal, Constraints, Inputs, Output, and Quality Check—guides users in creating precise and impactful requests. Understanding this framework improves interactions with AI tools and ensures desired results.',
        bullets: [
          '1. Role: Who the AI acts as (e.g. "Senior Direct-Response Copywriter")',
          '2. Context: Relevant brand background, target market & situation',
          '3. Goal: Exact desired outcome and objective',
          '4. Constraints: Negative limits, excluded words, word counts, tone boundaries',
          '5. Inputs: Raw data, transcripts, customer quotes, or reference samples',
          '6. Output: Strict structure (table, markdown, bullets, code snippet)',
          '7. Quality Check: Verification criteria and scoring rubric'
        ],
        callout: 'By breaking down prompts into these seven elements, users can tailor their requests to specific needs. For instance, clearly defining the Role and Context can significantly enhance the AI\'s understanding, leading to more relevant outputs.'
      }
    ]
  },
  {
    pageNumber: 5,
    headerTag: 'THE ULTIMATE AI CREATOR',
    title: 'Prompt Customization',
    subtitle: 'Adapting for Audience and Context',
    cards: [
      {
        title: 'Tailoring Variables Across Mediums',
        text: 'Customizing AI prompts is essential for achieving relevant outputs. By replacing key variables like tone, audience, and format, you can tailor responses to meet specific needs. Understanding how to adapt prompts will enhance their effectiveness in various contexts.',
        callout: 'Consider your target audience when crafting prompts. Different platforms require unique styles. For instance, a casual tone may work for social media, while a formal tone is better suited for professional emails. This adaptability is key to engaging effectively with diverse users.'
      }
    ],
    keyPoints: [
      {
        title: 'Audience Persona',
        text: 'Calibrate jargon, vocabulary level, and psychological triggers to whether you are writing for Gen Z, B2B executives, or clients.'
      },
      {
        title: 'Tone Modulation',
        text: 'Switch between conversational, provocative, empathetic, analytical, or high-energy marketing tones with a single variable.'
      }
    ]
  },
  {
    pageNumber: 6,
    headerTag: 'PROMPT ITERATION',
    title: 'Iteration Process',
    subtitle: 'Enhancing Prompt Quality Through Steps',
    cards: [
      {
        title: 'The Prompt Iteration Loop',
        text: 'The Prompt Iteration Loop enhances the quality of generated content by emphasizing a structured approach. This iterative process, consisting of drafting, critiquing, revising, verifying, and finalizing, ensures optimal results.',
        bullets: [
          'Step 1 (Drafting): Generate initial concepts with wide baseline parameters.',
          'Step 2 (Critiquing): Evaluate against voice, factualness, and punchiness.',
          'Step 3 (Revising): Apply corrective constraints and tighten phrasing.',
          'Step 4 (Verifying): Fact-check all citations, metrics, and logic paths.',
          'Step 5 (Finalizing): Polish for publication and log into your prompt vault.'
        ],
        callout: 'By following these steps, users can refine their prompts for clarity and effectiveness. Each phase provides an opportunity to improve the prompt\'s quality, ultimately leading to more accurate and valuable outcomes.'
      }
    ]
  },
  {
    pageNumber: 7,
    headerTag: 'AI RESEARCH GUIDE',
    title: 'Research Workflow',
    subtitle: 'Effective Strategies for Quality Research Prompts',
    cards: [
      {
        title: 'High-Integrity Intelligence Gathering',
        text: 'The research workflow is essential for effective AI prompting. Begin by identifying your research questions, then utilize AI tools to gather relevant sources. Ensure you assess the credibility of these sources to maintain accuracy and reliability in your outputs.',
        callout: 'Fact-checking is critical in the process. Use prompts to verify information and cross-reference data to minimize uncertainty. This approach enhances the quality of your work and builds trust with your audience by ensuring the information you provide is factual and well-supported.'
      }
    ],
    keyPoints: [
      {
        title: 'Primary Source Grounding',
        text: 'Feed verified documentation, PDFs, and data sheets into the prompt before requesting analytical synthesis.'
      },
      {
        title: 'Uncertainty Tagging',
        text: 'Explicitly prompt AI to separate verified facts, reasonable inferences, and unknown variables.'
      }
    ]
  },
  {
    pageNumber: 8,
    headerTag: 'COPYWRITING PROCESS',
    title: 'Copywriting Process',
    subtitle: 'Effective Writing Steps for Engagement',
    cards: [
      {
        title: 'The 6-Stage Copy Engine',
        text: 'The copywriting process is essential for any successful marketing strategy. It involves crafting compelling content that resonates with your audience and drives them to take action, ensuring effective communication of your message.',
        bullets: [
          'Stage 1: Deep customer pain point and desire research',
          'Stage 2: High-converting headline creation (PAS, AIDA, Before-After-Bridge)',
          'Stage 3: Irresistible hook formulation to stop the feed scroll',
          'Stage 4: Value-stacked body copy with proof and objection handling',
          'Stage 5: Friction-free Call-to-Action (CTA) design',
          'Stage 6: Human-in-the-loop editing, cadence, and rhythm check'
        ],
        callout: 'By breaking down the copywriting process into distinct steps—research, headline creation, hooks, body copy, call-to-action (CTA), and editing—you can enhance clarity and effectiveness, ultimately optimizing your marketing efforts.'
      }
    ]
  },
  {
    pageNumber: 9,
    headerTag: 'AI CREATOR PLAYBOOK',
    title: 'Copywriting Essentials',
    subtitle: 'Hooks, Captions & Conversions',
    statCallout: {
      stat: '70% increase in click-through rates',
      text: 'Effective copy boosts engagement and customer conversion across digital channels.'
    },
    keyPoints: [
      {
        title: 'HOOKS',
        text: 'Engaging hooks capture attention and draw readers into your content, increasing interaction and interest within the first 3 seconds.'
      },
      {
        title: 'CAPTIONS',
        text: 'Crafting effective captions can enhance social media engagement and deliver clear messages across TikTok, Instagram, and LinkedIn.'
      },
      {
        title: 'ADS',
        text: 'Persuasive ads clearly communicate benefits and features, driving conversions and audience action effectively.'
      }
    ]
  },
  {
    pageNumber: 10,
    headerTag: 'BUSINESS STRATEGY PROCESS',
    title: 'Business Strategy Process',
    subtitle: 'From Customer Problem to Measurement',
    cards: [
      {
        title: 'Customer Pain Points to Market Dominance',
        text: 'In developing a successful business strategy, understanding your customer\'s pain points is crucial. Identifying specific challenges allows for tailored solutions that resonate deeply with your target audience.',
        callout: 'Once the customer problem is defined, you can effectively carve out your market niche. This involves creating a unique value proposition that sets your offer apart from competitors and aligns with customer needs.'
      }
    ],
    keyPoints: [
      {
        title: 'Customer Problem Definition',
        text: 'Diagnose the exact emotional and financial toll of your customer\'s current roadblock.'
      },
      {
        title: 'Market Niche Carving',
        text: 'Position against legacy alternatives with faster time-to-value and hyper-focused deliverables.'
      }
    ]
  },
  {
    pageNumber: 11,
    headerTag: 'BUSINESS STRATEGY VAULT',
    title: 'Business Strategy Insights',
    subtitle: 'Personas, Market Research & Frameworks',
    statCallout: {
      stat: '70% of successful businesses analyze customer personas',
      text: 'Understanding your audience is crucial to designing sustainable revenue flywheels.'
    },
    keyPoints: [
      {
        title: 'PERSONAS',
        text: 'Define your target audience to tailor your strategies effectively and maximize engagement.'
      },
      {
        title: 'MARKET RESEARCH',
        text: 'Conduct thorough research to understand trends, demands, and competitors in your niche.'
      },
      {
        title: 'DECISION FRAMEWORKS',
        text: 'Utilize structured frameworks to evaluate options, manage risk, and make informed strategic decisions.'
      }
    ]
  },
  {
    pageNumber: 12,
    headerTag: 'SEO PROCESS',
    title: 'SEO Process Overview',
    subtitle: 'From Keywords to Optimization',
    cards: [
      {
        title: 'Organic Search Authority Architecture',
        text: 'The SEO process is essential for enhancing online visibility. By understanding search intent and effectively mapping keywords, you can create compelling content that resonates with your audience.',
        callout: 'This structured approach guides you through each stage, ensuring your content is optimized for search engines while maintaining quality and relevance. A thorough human review further elevates effectiveness and accuracy.'
      }
    ],
    keyPoints: [
      {
        title: 'Search Intent Mapping',
        text: 'Differentiate between informational, transactional, and navigational keyword clusters.'
      },
      {
        title: 'On-Page Structure',
        text: 'Engineered headers, FAQ schema, internal linking anchors, and keyword density.'
      }
    ]
  },
  {
    pageNumber: 13,
    headerTag: 'AI CREATOR PLAYBOOK',
    title: 'SEO Prompt Vault',
    subtitle: 'Keyword Ideas, Content Briefs & Meta Descriptions',
    statCallout: {
      stat: 'Over 70% of online experiences begin with a search engine',
      text: 'High-ranking organic content compound dividends over months and years.'
    },
    keyPoints: [
      {
        title: 'KEYWORD IDEAS',
        text: 'Discover effective keyword strategies to enhance your content visibility and engagement in search results.'
      },
      {
        title: 'CONTENT BRIEFS',
        text: 'Create concise briefs that clarify objectives, target audience, and key messaging for each piece of content.'
      },
      {
        title: 'META DESCRIPTIONS',
        text: 'Craft compelling meta descriptions that boost click-through rates while accurately reflecting your content.'
      }
    ]
  },
  {
    pageNumber: 14,
    headerTag: 'AI PLAYBOOK',
    title: 'Coding Process',
    subtitle: 'Steps for Effective Automation and Quality Assurance',
    cards: [
      {
        title: 'Engineering & Automation Workflows',
        text: 'The Coding & Automation Process is essential for effectively transforming ideas into functional applications. Begin by clearly defining your requirements, followed by a structured planning phase to outline your objectives. This establishes a strong foundation for coding and implementation.',
        callout: 'After coding, testing ensures your application works as intended. Debugging identifies and resolves issues, followed by comprehensive documentation for future reference. This process streamlines your workflow, enabling better automation and efficiency, while ensuring quality and reliability in your projects.'
      }
    ]
  },
  {
    pageNumber: 15,
    headerTag: 'AI CREATOR PACK',
    title: 'Coding & Automation Vault',
    subtitle: 'Debugging, Requirements & Documentation',
    statCallout: {
      stat: '75% success rate in AI project completion',
      text: 'Essential for effective automation, error diagnosis, and production-grade coding.'
    },
    keyPoints: [
      {
        title: 'DEBUGGING',
        text: 'Identify and resolve issues in AI-generated outputs for optimal results.'
      },
      {
        title: 'REQUIREMENTS',
        text: 'Clearly define project needs before starting coding or automation tasks for success.'
      },
      {
        title: 'DOCUMENTATION',
        text: 'Maintain comprehensive records of all processes for easy reference and troubleshooting.'
      }
    ]
  },
  {
    pageNumber: 16,
    headerTag: 'VIDEO CREATION',
    title: 'Video Creation Process',
    subtitle: 'Steps to Create Engaging Videos',
    cards: [
      {
        title: 'Short-Form & Long-Form Video Engine',
        text: 'The video creation process begins with a strong idea, setting the stage for effective storytelling. Developing a captivating hook engages viewers immediately, laying the groundwork for a compelling narrative.',
        callout: 'A well-structured script and detailed storyboard guide production, ensuring that every shot captures the intended message. Incorporating B-roll and thoughtful captions enhances viewer experience, while a striking thumbnail draws attention online.'
      }
    ],
    keyPoints: [
      {
        title: 'Pacing & B-Roll Anchors',
        text: 'Change visual stimuli every 2.5 seconds to maximize audience retention curves.'
      },
      {
        title: 'Thumbnail & Title Synergy',
        text: 'Match the opening 3 seconds directly with thumbnail promise to prevent drop-off.'
      }
    ]
  },
  {
    pageNumber: 17,
    headerTag: 'THE ULTIMATE AI CREATOR & BUSINESS MEGA-PACK — COMPLETE PLAYBOOK, 2026-09-18',
    title: 'Captivating Content',
    subtitle: 'Viral Video Vault',
    cards: [
      {
        title: 'Viral Video Production Resources',
        text: 'Explore essential resources and templates for creating engaging short-form video content that resonates with your audience and boosts engagement.',
        bullets: [
          '15-Second Hook Synthesizer Prompts',
          'Storyboard Script Templates with camera cues',
          'Dynamic Caption Formatting Protocols',
          'Curiosity-Gap Title Matrix for YouTube Shorts and TikTok'
        ],
        callout: 'Engineered specifically for creators producing daily Reels, TikToks, and YouTube Shorts.'
      }
    ]
  },
  {
    pageNumber: 18,
    headerTag: 'FREELANCER WORKFLOW GUIDE',
    title: 'Freelancer Workflow',
    subtitle: 'A Step-by-Step Guide to Success',
    cards: [
      {
        title: 'Client Lifecycle & Operational Freedom',
        text: 'The freelancer workflow is essential for ensuring smooth project execution. Each stage, from lead generation to follow-up, is crucial for maintaining client relationships and fostering successful outcomes.',
        callout: 'By systematically addressing each phase, freelancers can enhance their efficiency and effectiveness. This structured approach allows for better time management and clearer communication with clients throughout the project lifecycle.'
      }
    ],
    keyPoints: [
      {
        title: 'Lead Inbound & Discovery',
        text: 'Pre-qualify prospects automatically with structured intake forms and AI-generated scope briefs.'
      },
      {
        title: 'Proposal & Scope Defense',
        text: 'Prevent scope creep by generating iron-clad deliverable boundaries and milestone sign-offs.'
      }
    ]
  },
  {
    pageNumber: 19,
    headerTag: 'AI CREATOR TOOLKIT',
    title: 'Productivity Systems',
    subtitle: 'Streamline Your Operations and Save Time',
    cards: [
      {
        title: 'Standard Operating Procedures (SOPs)',
        text: 'Creating Standard Operating Procedures (SOPs) transforms repeated work into efficient workflows. By documenting processes, you streamline tasks, reduce errors, and enhance team collaboration. SOPs serve as valuable references, ensuring consistency in execution while allowing for easy onboarding of new team members.',
        callout: 'Incorporate checklists and templates to facilitate everyday tasks. These tools help break down complex processes into manageable steps. By leveraging AI workflows, you can automate repetitive actions, freeing up time for more strategic work, ultimately enhancing productivity and achieving your business goals.'
      }
    ]
  },
  {
    pageNumber: 20,
    headerTag: 'PROMPT LIBRARY GUIDE',
    title: 'Personal Prompt Library',
    subtitle: 'Organize, Tag, and Optimize Your Library',
    cards: [
      {
        title: 'Building Your Prompt Second Brain',
        text: 'Organizing your personal prompt library is crucial for maximizing efficiency. By implementing a structured naming convention, tags, and folders, you can easily access and manage your valuable prompts.',
        bullets: [
          'Naming Syntax: [Category]_[Action]_[Audience]_[Version]',
          'Modular Variables: Wrap bracketed variables like [PRODUCT_NAME] for quick batch substitution',
          'Testing Scorecards: Log winning prompts with conversion or engagement metrics',
          'Continuous Refinement: Quarterly versioning for model upgrades'
        ],
        callout: 'Versioning allows you to track changes and improvements, while testing scorecards help evaluate the effectiveness of each prompt. This systematic approach enables continuous refinement and promotes better results in your projects.'
      }
    ]
  },
  {
    pageNumber: 21,
    headerTag: 'DOCUMENT OVERVIEW',
    title: 'Monetization Ideas',
    subtitle: 'Ethical Ways to Use AI Prompts',
    tableData: {
      headers: ['Item', 'Description', 'Budget', 'Status'],
      rows: [
        { item: 'Service', description: 'Template Creation', budget: '$250', status: 'In Progress' },
        { item: 'Content', description: 'System Development', budget: '$750', status: 'Planned' },
        { item: 'Research', description: 'Support Services', budget: '$2,000', status: 'Not Started' }
      ]
    },
    keyPoints: [
      {
        title: 'Target 1: $500 / Month',
        text: 'Package and sell niche-specific prompt packs, Notion templates, and creator swipe files.'
      },
      {
        title: 'Target 2: $1,000 / Month',
        text: 'Deliver AI-augmented content systems and automated social media calendars for local businesses.'
      },
      {
        title: 'Target 3: $2,000+ / Month',
        text: 'Provide high-ticket AI workflow optimization, research consulting, and custom agency SOP implementations.'
      }
    ]
  },
  {
    pageNumber: 22,
    headerTag: 'COMMUNITY & CONTACT',
    title: 'Start Creating!',
    subtitle: 'Connect, Collaborate & Get Ongoing Support',
    cards: [
      {
        badge: 'OFFICIAL PUBLISHER SUPPORT',
        title: 'Start Creating Today!',
        text: 'DM Us: @luminadigital.com\nFor help: raj.nikhil0556@gmail.com\n\nFounder: Nikhil Raj\nSocials: @nikhil0556__\n\nPublished by Lumina Digital • 2026 Editions',
        callout: 'Thank you for investing in your creative and entrepreneurial journey. Start applying the 7-Part Prompt Formula today!'
      }
    ]
  }
];

/**
 * Overview of the 35 Core Categories inside the 248-page 3,500 Prompts Master Library
 */
export const MEGAPACK_35_CATEGORIES = [
  { id: 'copywriting', name: 'Copywriting', promptRange: '0001 - 0100', pages: '3 - 9', desc: 'Hooks, persuasive copy, offers, CTAs, editing and conversion-focused writing.' },
  { id: 'content-creation', name: 'Content Creation', promptRange: '0101 - 0200', pages: '10 - 16', desc: 'Content ideas, briefs, calendars, repurposing, storytelling and editorial systems.' },
  { id: 'social-media', name: 'Social Media', promptRange: '0201 - 0300', pages: '17 - 23', desc: 'Platform strategy, posts, engagement, community and content planning.' },
  { id: 'instagram', name: 'Instagram', promptRange: '0301 - 0400', pages: '24 - 30', desc: 'Reels, carousels, captions, Stories, profile optimization and growth experiments.' },
  { id: 'youtube', name: 'YouTube', promptRange: '0401 - 0500', pages: '31 - 37', desc: 'Video concepts, scripts, thumbnails, retention, channels and publishing workflows.' },
  { id: 'short-form-video', name: 'Short-Form Video & Reels', promptRange: '0501 - 0600', pages: '38 - 44', desc: 'Hooks, scripts, shot lists, pacing, B-roll and repurposing.' },
  { id: 'tiktok', name: 'TikTok', promptRange: '0601 - 0700', pages: '45 - 51', desc: 'TikTok concepts, storytelling, trends, captions, community and testing.' },
  { id: 'linkedin', name: 'LinkedIn', promptRange: '0701 - 0800', pages: '52 - 58', desc: 'Professional content, thought leadership, carousels, posts and networking.' },
  { id: 'twitter', name: 'X/Twitter', promptRange: '0801 - 0900', pages: '59 - 65', desc: 'Threads, concise posts, hooks, conversations and content systems.' },
  { id: 'email-marketing', name: 'Email Marketing', promptRange: '0901 - 1000', pages: '66 - 72', desc: 'Welcome sequences, newsletters, launches, segmentation and optimization.' },
  { id: 'landing-pages', name: 'Landing Pages & Sales Pages', promptRange: '1001 - 1100', pages: '73 - 79', desc: 'Page structure, headlines, proof, objections, CTAs and conversion reviews.' },
  { id: 'ecommerce', name: 'Ecommerce & Product Descriptions', promptRange: '1101 - 1200', pages: '80 - 86', desc: 'Product pages, benefits, merchandising, FAQs, bundles and retention.' },
  { id: 'branding', name: 'Branding & Brand Strategy', promptRange: '1201 - 1300', pages: '87 - 93', desc: 'Positioning, voice, identity, messaging and brand consistency.' },
  { id: 'marketing-strategy', name: 'Marketing Strategy', promptRange: '1301 - 1400', pages: '94 - 100', desc: 'Campaign planning, channels, funnels, measurement and experimentation.' },
  { id: 'business-strategy', name: 'Business Strategy', promptRange: '1401 - 1500', pages: '101 - 107', desc: 'Goals, models, priorities, risks, decisions and execution plans.' },
  { id: 'market-research', name: 'Market Research', promptRange: '1501 - 1600', pages: '108 - 114', desc: 'Market maps, trends, customer needs, competitor research and source checking.' },
  { id: 'customer-research', name: 'Customer Research & Personas', promptRange: '1601 - 1700', pages: '115 - 121', desc: 'Interviews, personas, jobs-to-be-done, objections and customer insights.' },
  { id: 'offer-creation', name: 'Offer Creation & Positioning', promptRange: '1701 - 1800', pages: '122 - 128', desc: 'Offers, packages, differentiation, value propositions and guarantees.' },
  { id: 'sales-lead-gen', name: 'Sales & Lead Generation', promptRange: '1801 - 1900', pages: '129 - 135', desc: 'Prospecting, qualification, discovery, follow-up, objections and CRM workflows.' },
  { id: 'freelancer-business', name: 'Freelancer Business', promptRange: '1901 - 2000', pages: '136 - 142', desc: 'Niches, services, portfolios, pricing logic, proposals and client systems.' },
  { id: 'client-comm', name: 'Client Communication & Proposals', promptRange: '2001 - 2100', pages: '143 - 149', desc: 'Briefs, proposals, scope, revisions, updates, handoffs and follow-ups.' },
  { id: 'productivity', name: 'Productivity & Time Management', promptRange: '2101 - 2200', pages: '150 - 156', desc: 'Priorities, planning, focus, scheduling, delegation and review systems.' },
  { id: 'sops-ops', name: 'SOPs & Operations', promptRange: '2201 - 2300', pages: '157 - 163', desc: 'Standard operating procedures, checklists, QA, handoffs and process improvement.' },
  { id: 'project-management', name: 'Project Management', promptRange: '2301 - 2400', pages: '164 - 170', desc: 'Requirements, milestones, risks, dependencies, status reports and retrospectives.' },
  { id: 'seo', name: 'SEO', promptRange: '2401 - 2500', pages: '171 - 177', desc: 'Search intent, keywords, on-page SEO, briefs, audits and content optimization.' },
  { id: 'blogging', name: 'Blogging & Content Strategy', promptRange: '2501 - 2600', pages: '178 - 184', desc: 'Editorial planning, outlines, articles, refreshes, clusters and quality checks.' },
  { id: 'youtube-seo', name: 'YouTube SEO & Video Discovery', promptRange: '2601 - 2700', pages: '185 - 191', desc: 'Titles, descriptions, keywords, chapters, packaging and analytics review.' },
  { id: 'coding', name: 'Coding & Software Development', promptRange: '2701 - 2800', pages: '192 - 198', desc: 'Requirements, architecture, implementation, refactoring and code review.' },
  { id: 'debugging', name: 'Debugging, Testing & Documentation', promptRange: '2801 - 2900', pages: '199 - 205', desc: 'Bugs, tests, edge cases, docs, release notes and troubleshooting.' },
  { id: 'automation', name: 'Automation & No-Code Workflows', promptRange: '2901 - 3000', pages: '206 - 212', desc: 'Workflow mapping, triggers, conditions, data handling and automation QA.' },
  { id: 'data-analysis', name: 'Data Analysis & Spreadsheets', promptRange: '3001 - 3100', pages: '213 - 219', desc: 'Cleaning, formulas, analysis, summaries, dashboards and decision insights.' },
  { id: 'ai-image', name: 'AI Image & Design Prompts', promptRange: '3101 - 3200', pages: '220 - 226', desc: 'Composition, lighting, art direction, layouts, branding and visual variations.' },
  { id: 'ai-video', name: 'AI Video & Creative Production', promptRange: '3201 - 3300', pages: '227 - 233', desc: 'Visual concepts, storyboards, camera direction, scenes and editing plans.' },
  { id: 'digital-products', name: 'Digital Products, Courses & Ebooks', promptRange: '3301 - 3400', pages: '234 - 240', desc: 'Product research, outlines, lessons, worksheets, packaging and QA.' },
  { id: 'entrepreneurship', name: 'Entrepreneurship, Growth & Future AI Workflows', promptRange: '3401 - 3500', pages: '241 - 247', desc: 'Experiments, systems, productization, AI adoption and scalable workflows.' }
];

export const SAMPLE_3500_PROMPTS = [
  {
    id: '0001',
    category: 'Copywriting',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Copywriting specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Keep the output concise but operational.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '0011',
    category: 'Copywriting',
    type: 'Plan Prompt',
    prompt: 'Build a practical Copywriting plan for [GOAL] aimed at [AUDIENCE]. Start with required inputs, then give a step-by-step workflow, deliverables, owners, timing, risks, and measurable quality checks. Keep recommendations realistic for [BUDGET/RESOURCES]. Work specifically for a new creator starting from zero. Include a table when comparison or prioritization improves clarity.',
    variables: ['GOAL', 'AUDIENCE', 'BUDGET/RESOURCES']
  },
  {
    id: '0101',
    category: 'Content Creation',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Content Creation specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Give both a fast version and a thorough version of the workflow.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '0301',
    category: 'Instagram',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Instagram specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Include a table when comparison or prioritization improves clarity.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '0401',
    category: 'YouTube',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior YouTube specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Include questions I should answer before executing the plan.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '0501',
    category: 'Short-Form Video & Reels',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Short-Form Video & Reels specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Include [VARIABLE] placeholders so I can reuse the prompt.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '1001',
    category: 'Landing Pages & Sales Pages',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Landing Pages & Sales Pages specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Keep the output concise but operational.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '1401',
    category: 'Business Strategy',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Business Strategy specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Include questions I should answer before executing the plan.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '1701',
    category: 'Offer Creation & Positioning',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Offer Creation & Positioning specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. End with the next three actions I should take.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '1901',
    category: 'Freelancer Business',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Freelancer Business specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Give one strong example and one weak example with an explanation.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '2701',
    category: 'Coding & Software Development',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Coding & Software Development specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. End with the next three actions I should take.',
    variables: ['PROJECT/BRAND']
  },
  {
    id: '3401',
    category: 'Entrepreneurship, Growth & Future AI Workflows',
    type: 'Diagnose Prompt',
    prompt: 'Act as a senior Entrepreneurship, Growth & Future AI Workflows specialist. Diagnose the current situation for [PROJECT/BRAND]. Identify the 5 most important problems, explain the evidence needed for each, and give a prioritized action plan with quick wins and longer-term fixes. Ask for missing inputs before making strong assumptions. Work specifically for a new creator starting from zero. Include questions I should answer before executing the plan.',
    variables: ['PROJECT/BRAND']
  }
];

export const BOOK_1_DOWNLOAD_CONTENT = `%PDF-1.4
% LUMINA DIGITAL - THE ULTIMATE AI CREATOR
% Author: Nikhil Rajbhar
% Edition: September 18, 2026
% Total Pages: 22 Pages Visual Playbook

THE ULTIMATE AI CREATOR: 3,500+ AI PROMPTS FOR CREATORS AND FREELANCERS
Presented by Author: Nikhil Rajbhar
Presented to Creators and Marketers • For Creators
Founder: Nikhil Raj (@nikhil0556__)
Support: raj.nikhil0556@gmail.com | DM Us: @luminadigital.com

TABLE OF CONTENTS:
Page 1: Official Playbook Cover
Page 2: Getting Maximum Value - Utilize This Playbook Effectively
Page 3: AI Basics - Essential Knowledge for Beginners
Page 4: 7-Part Formula - Crafting Effective AI Prompts with Structure (Role, Context, Goal, Constraints, Inputs, Output, Quality Check)
Page 5: Prompt Customization - Adapting for Audience and Context
Page 6: Iteration Process - Enhancing Prompt Quality Through Steps
Page 7: Research Workflow - Effective Strategies for Quality Research Prompts
Page 8: Copywriting Process - Effective Writing Steps for Engagement
Page 9: Copywriting Essentials - Hooks, Captions & Ads (70% CTR boost)
Page 10: Business Strategy Process - From Customer Problem to Measurement
Page 11: Business Strategy Insights - Personas, Market Research, Decision Frameworks
Page 12: SEO Process Overview - From Keywords to Optimization
Page 13: SEO Prompt Vault - Keyword Ideas, Content Briefs, Meta Descriptions
Page 14: Coding Process - Steps for Effective Automation and QA
Page 15: Coding & Automation Vault - Debugging, Requirements, Documentation (75% success rate)
Page 16: Video Creation Process - Steps to Create Engaging Videos
Page 17: Captivating Content - Viral Video Vault
Page 18: Freelancer Workflow - A Step-by-Step Guide to Success
Page 19: Productivity Systems - Streamline Your Operations and Save Time (SOPs)
Page 20: Personal Prompt Library - Organize, Tag, and Optimize Your Library
Page 21: Monetization Ideas - Ethical Ways to Use AI Prompts ($250, $750, $2,000 targets)
Page 22: Start Creating! - Contact & Support

--- DETAILED EXCERPT: THE 7-PART PROMPT FORMULA ---
1. Role: Define who the AI acts as (e.g., "Act as a senior direct-response copywriter").
2. Context: Give relevant background, brand situation, and user environment.
3. Goal: State the exact measurable outcome you need.
4. Constraints: State rules, length, exclusions, and prohibited cliches.
5. Inputs: Provide transcripts, raw notes, or reference text.
6. Output: Demand exact structure (table, JSON, numbered list).
7. Quality Check: Define how the answer should be evaluated before final use.

(Full 22-page high-resolution PDF authenticated for your licensed account)`;

export const BOOK_2_DOWNLOAD_CONTENT = `%PDF-1.4
% THE ULTIMATE AI CREATOR & BUSINESS MEGA-PACK
% 3,500 Original, Practical AI Prompts
% Complete Prompt Library + Practical AI Workflow Guide
% Total Pages: 248 Pages

THE ULTIMATE AI CREATOR & BUSINESS MEGA-PACK
3,500 Original, Practical AI Prompts for creators, freelancers, marketers, entrepreneurs, digital-product sellers and modern businesses.
Published by Lumina Digital • Author: Nikhil Rajbhar

=======================================================
HOW TO USE THIS MEGA-PACK
=======================================================
Pick a category, copy a prompt, replace the [VARIABLES], run it in your preferred AI tool, review the output, then iterate. The prompts are designed as starting systems rather than magic commands. Better inputs and human review usually produce better results.

THE 7-PART PROMPT FORMULA:
Role: who the AI should act as.
Context: relevant background.
Goal: the outcome you need.
Constraints: limits, rules and exclusions.
Inputs: the material or data provided.
Output: exact format and structure.
Quality check: how the answer should be evaluated.

PROMPT DEBUGGING:
If a result is weak, check five things:
1. The goal may be vague
2. Context may be missing
3. Constraints may conflict
4. The requested format may be unclear
5. There may be no evaluation criteria
Fix one issue at a time and rerun the prompt.

HUMAN-IN-THE-LOOP CHECKLIST:
Before publishing or deploying AI output, verify factual claims, calculations, citations, code behavior, originality, privacy, confidential information, copyright concerns, brand claims and platform rules. Treat AI output as a draft or assistant contribution, not automatic truth.

=======================================================
DIRECTORY OF 35 CORE CATEGORIES (PROMPTS 0001 - 3500)
=======================================================
1. Copywriting (Prompts 0001 - 0100 | Pages 3-9)
2. Content Creation (Prompts 0101 - 0200 | Pages 10-16)
3. Social Media (Prompts 0201 - 0300 | Pages 17-23)
4. Instagram (Prompts 0301 - 0400 | Pages 24-30)
5. YouTube (Prompts 0401 - 0500 | Pages 31-37)
6. Short-Form Video & Reels (Prompts 0501 - 0600 | Pages 38-44)
7. TikTok (Prompts 0601 - 0700 | Pages 45-51)
8. LinkedIn (Prompts 0701 - 0800 | Pages 52-58)
9. X/Twitter (Prompts 0801 - 0900 | Pages 59-65)
10. Email Marketing (Prompts 0901 - 1000 | Pages 66-72)
11. Landing Pages & Sales Pages (Prompts 1001 - 1100 | Pages 73-79)
12. Ecommerce & Product Descriptions (Prompts 1101 - 1200 | Pages 80-86)
13. Branding & Brand Strategy (Prompts 1201 - 1300 | Pages 87-93)
14. Marketing Strategy (Prompts 1301 - 1400 | Pages 94-100)
15. Business Strategy (Prompts 1401 - 1500 | Pages 101-107)
16. Market Research (Prompts 1501 - 1600 | Pages 108-114)
17. Customer Research & Personas (Prompts 1601 - 1700 | Pages 115-121)
18. Offer Creation & Positioning (Prompts 1701 - 1800 | Pages 122-128)
19. Sales & Lead Generation (Prompts 1801 - 1900 | Pages 129-135)
20. Freelancer Business (Prompts 1901 - 2000 | Pages 136-142)
21. Client Communication & Proposals (Prompts 2001 - 2100 | Pages 143-149)
22. Productivity & Time Management (Prompts 2101 - 2200 | Pages 150-156)
23. SOPs & Operations (Prompts 2201 - 2300 | Pages 157-163)
24. Project Management (Prompts 2301 - 2400 | Pages 164-170)
25. SEO (Prompts 2401 - 2500 | Pages 171-177)
26. Blogging & Content Strategy (Prompts 2501 - 2600 | Pages 178-184)
27. YouTube SEO & Video Discovery (Prompts 2601 - 2700 | Pages 185-191)
28. Coding & Software Development (Prompts 2701 - 2800 | Pages 192-198)
29. Debugging, Testing & Documentation (Prompts 2801 - 2900 | Pages 199-205)
30. Automation & No-Code Workflows (Prompts 2901 - 3000 | Pages 206-212)
31. Data Analysis & Spreadsheets (Prompts 3001 - 3100 | Pages 213-219)
32. AI Image & Design Prompts (Prompts 3101 - 3200 | Pages 220-226)
33. AI Video & Creative Production (Prompts 3201 - 3300 | Pages 227-233)
34. Digital Products, Courses & Ebooks (Prompts 3301 - 3400 | Pages 234-240)
35. Entrepreneurship, Growth & Future AI Workflows (Prompts 3401 - 3500 | Pages 241-247)

=======================================================
7-DAY AI IMPLEMENTATION PLAN (PAGE 248)
=======================================================
Day 1: Pick one business or creator goal and one category.
Day 2: Customize five prompts with your own context.
Day 3: Build one repeatable workflow from the prompts.
Day 4: Test outputs and record what worked.
Day 5: Turn the best prompt into a reusable template.
Day 6: Document the workflow as an SOP.
Day 7: Review results, improve weak prompts, and organize your personal prompt library.

MASTER QUALITY CHECKLIST:
[ ] Clear goal
[ ] Enough context
[ ] Useful constraints
[ ] Correct output format
[ ] Facts verified
[ ] Sensitive data protected
[ ] Originality reviewed
[ ] Code tested where relevant
[ ] Platform rules checked
[ ] Human judgment applied

(Full 248-page complete master prompt directory authenticated for licensed account)`;
