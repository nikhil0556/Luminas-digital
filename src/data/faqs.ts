export interface FAQItem {
  id: string;
  category: 'Delivery & Access' | 'Payments & Security' | 'AI Prompts' | 'Formats & Compatibility' | 'Refunds & Support';
  question: string;
  answer: string;
}

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Delivery & Access',
    question: 'How do I access and download my digital products after payment?',
    answer: 'Instantly! Immediately upon completing your secure checkout, you will be redirected to your personal Customer Access & Download Page with direct one-click download links for all your purchased items. We also automatically send a copy of your receipt and direct download links to your provided email address.'
  },
  {
    id: 'faq-2',
    category: 'Delivery & Access',
    question: 'Do my download links ever expire?',
    answer: 'No. You receive lifetime access to all purchased files. You can revisit your download hub anytime using your email and order number, and you receive all future updates and revisions of the digital products for free.'
  },
  {
    id: 'faq-3',
    category: 'Payments & Security',
    question: 'What payment methods do you accept, and is checkout secure?',
    answer: 'We support all major Credit & Debit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and international regional gateways including Razorpay and Stripe. All transactions are encrypted with industry-standard 256-bit SSL encryption. We never store or see your payment card details.'
  },
  {
    id: 'faq-4',
    category: 'AI Prompts',
    question: 'How do the AI Prompts work, and which AI tools are they compatible with?',
    answer: 'Our AI Prompts and Prompt Packs are precision-crafted with parameter brackets like {niche} and {target_audience}. You simply copy the prompt, fill in your details, and paste it into your AI assistant. They are tested and 100% compatible with ChatGPT (GPT-4o & free), Claude 3.5 Sonnet, Google Gemini, Midjourney v6, and Perplexity.'
  },
  {
    id: 'faq-5',
    category: 'AI Prompts',
    question: 'Are the AI prompts beginner-friendly if I’ve never used AI before?',
    answer: 'Yes, absolutely. Every prompt pack comes with a quick-start visual guide, prompt chaining cheat sheet, and curated video walkthrough showing you exactly how to achieve elite outputs in under 2 minutes.'
  },
  {
    id: 'faq-6',
    category: 'Formats & Compatibility',
    question: 'What file formats do you deliver?',
    answer: 'Depending on the product: E-books come in crisp, high-resolution PDF and mobile-friendly ePub format. Templates are delivered as 1-click Notion duplicate links, editable Google Sheets/Excel files, or Figma community files. Prompt packs come in searchable JSON, plain text, and Notion database formats.'
  },
  {
    id: 'faq-7',
    category: 'Formats & Compatibility',
    question: 'Can I read the e-books on my iPad, Kindle, or phone?',
    answer: 'Yes. All our e-books are formatted to render beautifully on Apple Books, Amazon Kindle apps, standard PDF readers, tablets, and smartphones.'
  },
  {
    id: 'faq-8',
    category: 'Refunds & Support',
    question: 'What is your refund policy for digital products?',
    answer: 'We stand behind the quality of our digital resources with a 14-day customer satisfaction guarantee. If a product does not deliver the promised value or you experience technical difficulties our team cannot resolve, simply contact our customer care team at raj.nikhil0556@gmail.com for a hassle-free resolution.'
  },
  {
    id: 'faq-9',
    category: 'Refunds & Support',
    question: 'How quickly does customer support respond?',
    answer: 'Our dedicated customer success team operates 7 days a week. We guarantee a thoughtful response within 12 hours (and usually under 2 hours during peak working hours).'
  },
  {
    id: 'faq-10',
    category: 'Payments & Security',
    question: 'Can I get an official invoice for company expense reimbursement?',
    answer: 'Yes! Every purchase order confirmation includes a downloadable, tax-compliant PDF receipt and invoice that you can submit directly to your company or tax accountant.'
  }
];
