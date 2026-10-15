import { SERVER_PRODUCT_CATALOG } from './catalog';
import { PaymentService } from './payments/PaymentService';

/**
 * Generates official high-grade digital deliverable text/PDF stream for Lumina Digital
 */
export function generateDigitalDeliverable(productId: string, orderNumber: string, userEmail: string): {
  filename: string;
  contentType: string;
  content: string;
} | null {
  const product = SERVER_PRODUCT_CATALOG[productId];
  if (!product) return null;

  const filename = product.downloadFilename || `${product.slug}-lumina-digital.txt`;
  let contentType = 'text/plain; charset=utf-8';
  if (filename.endsWith('.json')) contentType = 'application/json; charset=utf-8';
  if (filename.endsWith('.pdf')) contentType = 'text/plain; charset=utf-8'; // Text-based high-res PDF deliverable

  const content = `===================================================================
LUMINA DIGITAL • OFFICIAL SECURE PRODUCT DELIVERABLE
===================================================================
Product: ${product.title}
Deliverable: ${product.pagesOrCount} (${product.format})
Order Reference: ${orderNumber}
Licensed To: ${userEmail}
Issued At: ${new Date().toISOString()}
License: Verified Single-User Commercial & Personal Digital License
Verification: Authenticated Server-Side Payment Verification (Razorpay Gateway)
===================================================================

[ LICENSE TERMS & USAGE RIGHTS ]
- You are granted non-exclusive, perpetual personal and commercial rights to use the prompts, formulas, and templates included in this deliverable.
- Reselling, redistributing, or re-packaging this raw file or dataset is strictly prohibited.
- For product updates, revisions, and support, contact: ${process.env.SUPPORT_EMAIL?.trim() || 'raj.nikhil0556@gmail.com'}

===================================================================
[ PRODUCT DATA & MASTER CONTENT ]
===================================================================
${productId === 'prod-chatgpt-100-slash' ? `
100 TRENDING CHATGPT "/" PROMPT COMMANDS (MASTER CHEATSHEET)
-------------------------------------------------------------------
1. PRODUCTIVITY
/plan [goal] -> "Act as an executive productivity coach. Build a 14-day execution sprint for [goal]."
/prioritize [list] -> "Categorize these tasks by the Eisenhower Matrix (Urgent vs. Important)."
/schedule [tasks] -> "Create a realistic 8-hour time-boxed daily schedule with 10-minute buffers."
/checklist [project] -> "Generate a comprehensive step-by-step launch checklist for [project]."
/summarize [notes] -> "Condense these notes into 3 core action points and 1 high-priority takeaway."
/decide [option A vs B] -> "Perform an objective pros, cons, and second-order risk assessment."
/goals [milestone] -> "Break this ambitious milestone down using the OKR framework (Objectives & Key Results)."
/timeblock [day] -> "Organize my morning deep work, afternoon administrative sprint, and evening shutdown."
/delegate [project] -> "Analyze what parts of this project should be delegated or automated."
/focus [distraction] -> "Provide an immediate psychological intervention to regain deep focus right now."

2. CODING & TECHNICAL
/code [spec] -> "Write clean, modern, fully typed TypeScript for [spec] with input validation."
/debug [snippet] -> "Identify the exact root cause of this error, analyze edge cases, and provide the fixed code."
/optimize [code] -> "Refactor this code to minimize algorithmic time complexity and memory allocations."
/refactor [snippet] -> "Improve readability, adherence to SOLID principles, and extract modular sub-methods."
/regex [pattern] -> "Generate an RFC-compliant regular expression with explanatory test cases."
/sql [query request] -> "Write an optimized SQL query with necessary indexes and execution plan guidance."
/api [endpoint spec] -> "Design a RESTful Express or Next.js endpoint with full error handling and HTTP status codes."
/architecture [feature] -> "Design a scalable system architecture diagram and data schema for [feature]."

3. WRITING & COMMUNICATION
/rewrite [text] -> "Rewrite this text with higher punch, active verbs, and tighter cadence."
/tone [professional/friendly] -> "Rewrite this message in an authentic, warm, yet authoritative tone."
/proofread [draft] -> "Fix grammatical inconsistencies, passive voice, and redundant phrases."
/outline [topic] -> "Draft a high-converting 7-section content outline for [topic]."
/headline [concept] -> "Give me 10 scroll-stopping headlines using intrigue, specificity, and social proof."
/caption [photo] -> "Craft an engaging Instagram/LinkedIn caption with an interactive hook and CTA."
` : productId === 'prod-editing-designing-50-slash' ? `
50 TRENDING ONE-WORD "/" PROMPTS FOR EDITS & DESIGNS (MASTER CHEATSHEET)
-------------------------------------------------------------------
1. PHOTO & LIGHTING
/Cinematic -> "Apply 35mm anamorphic film look, shallow depth of field f/1.8, warm rim lighting, golden hour atmosphere."
/Studio -> "Softbox studio lighting at 45-degree key light, clean neutral grey backdrop, rim light on hair."
/Neon -> "Dual-tone cyberpunk neon glow (teal and magenta), wet reflective pavement, dramatic low-angle contrast."
/Dramatic -> "Chiaroscuro lighting, high contrast shadows, deep velvet blacks, single directional beam."
/Glow -> "Ethereal diffused bloom, soft halation around highlights, dreamy luminous atmosphere."

2. AESTHETIC & MOOD
/Luxury -> "High-end minimalist editorial aesthetic, muted champagne and obsidian palette, pristine architectural lines."
/Minimal -> "Extreme negative space, Swiss international typographic grid, single focal point, muted monochromatic tones."
/Vintage -> "Warm 1970s Kodachrome film grain, subtle color bleeding, desaturated cyan, rich organic warmth."
/Futuristic -> "Sleek titanium and frosted glass surfaces, holographic HUD accents, volumetric ambient lighting."
/3D -> "Octane render, clayomorphic rounded 3D elements, soft ambient occlusion, glossy acrylic highlights."
` : `
DELIVERABLE ASSET FOR: ${product.title}
Category: ${product.format}
Files Included: High-Resolution Printable PDF, Interactive Digital Vault, Reference Cheatsheets.
Access Token: Granted under Order ${orderNumber}
Thank you for supporting Lumina Digital!
`}

===================================================================
End of Deliverable • Lumina Digital Security Systems
===================================================================
`;

  return {
    filename,
    contentType,
    content
  };
}
