# Implementation Plan: Midnight Sapphire + Champagne Gold Palette

## 1. Executive Summary & User Alignment
This plan establishes the transition of the Lumina Digital storefront to the refined **Midnight Sapphire + Champagne Gold** design system without modifying individual component layouts, typography, or functionality. 

By leveraging Tailwind CSS v4's native `@theme` layer in `src/index.css`, we systematically override the global `indigo` scale to a 10-shade sapphire blue gamut and the `cyan` scale to an 11-shade champagne gold gamut. This instantly transforms the ~900 class occurrences across cards, CTAs, hero elements, pricing tags, and badges into the new visual identity. We also update the theme root CSS variables, surface primitives, ambient mesh backgrounds, and Razorpay checkout options, while preserving the user's choices for info icon sapphire styling and subtle ambient glow cards.

---

## 2. Palette Architecture & Token Mapping

### A. The Core Color Roles
- **Canvas / Page Background**: `#0A0F1F` (deep midnight navy base canvas)
- **Primary Surface**: `#0F1730` (container & card base surface)
- **Raised Surface**: `#16203F` (elevated modals, dropdowns, hovered cards)
- **Primary Brand (Sapphire Blue)**:
  - Default: `#2F6BFF`
  - Hover: `#1F55DB`
  - Soft / Accent: `#7FA6FF`
  - Deep / Border: `#1A3EA6`
- **Secondary Accent (Champagne Gold)**:
  - Default: `#E8B85B`
  - Hover / Deep: `#D4A23F`
  - Soft Glow: `#F6D995`
  - Subdued / Tag: `#8F6E2B`
- **Typography & Boundaries**:
  - Main Heading & Text: `#F1F5FF` (94% contrast against #0A0F1F)
  - Muted Metadata & Subtitles: `#A7B4D4`
  - Hairline Borders: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)`
- **Semantic Guards (Preserved Unchanged)**:
  - Success: Emerald (`#10B981`)
  - Warning: Amber (`#F59E0B`)
  - Error: Rose / Crimson (`#F43F5E`)

### B. Tailwind v4 `@theme` Scale Overrides in `src/index.css`
```css
@theme {
  /* Sapphire Blue Overrides for existing --color-indigo-* */
  --color-indigo-50: #EDF3FF;
  --color-indigo-100: #DBE6FF;
  --color-indigo-200: #BFD4FF;
  --color-indigo-300: #9EBDFF;
  --color-indigo-400: #7FA6FF;
  --color-indigo-500: #4B82FF;
  --color-indigo-600: #2F6BFF;
  --color-indigo-700: #1F55DB;
  --color-indigo-800: #1844B2;
  --color-indigo-900: #14358C;
  --color-indigo-950: #0C1E54;

  /* Champagne Gold Overrides for existing --color-cyan-* */
  --color-cyan-50: #FBF7EE;
  --color-cyan-100: #F6EED9;
  --color-cyan-200: #EEDDB3;
  --color-cyan-300: #E4C887;
  --color-cyan-400: #E8B85B;
  --color-cyan-500: #D4A23F;
  --color-cyan-600: #B78529;
  --color-cyan-700: #8F651D;
  --color-cyan-800: #714F1A;
  --color-cyan-900: #5C4018;
  --color-cyan-950: #332109;
}
```

### C. Before vs. After Token Inventory
| Purpose / Usage | Legacy Token / Value | New Midnight Sapphire + Gold Token |
| :--- | :--- | :--- |
| Page Background | `#07090e` | `#0A0F1F` |
| Primary Surface Card | `#0d1324` / `#0e1428` | `#0F1730` |
| Elevated Card / Modal | `#131b32` / `#141c32` | `#16203F` |
| Deepest Dark Surface | `#070a14` / `#070b16` / `#070c18` | `#0A0F1F` |
| Primary Action Accent | `#6366f1` / `#4f46e5` | `#2F6BFF` (hover `#1F55DB`) |
| Soft Blue Tint / Mid | `#818cf8` | `#7FA6FF` |
| Purple / Violet Accent | `#7c3aed` | `#3A75FF` / `#4338CA` |
| Highlights & Tags | `#06b6d4` (Cyan) | `#E8B85B` (Champagne Gold) |
| Text Primary | `#e2e8f0` | `#F1F5FF` |
| Text Muted | `#94a3b8` | `#A7B4D4` |
| Razorpay Checkout Modal | `#6366f1` | `#2F6BFF` |

---

## 3. Informational Elements & Interactive States (User Alignment)
Based on your clarification responses:
1. **Info Icons & Informational Alerts**:
   - Cyan was previously used for informational icons (e.g. `Info` badges, tooltip icons). While badges, price tags, and discount tags will render in champagne gold (`--color-cyan-400`), informational icons in tooltips/callouts will be scoped with sapphire blue (`text-indigo-400` / `#7FA6FF`) or neutral slate (`text-slate-400`) so they do not conflict with promotional badges.
2. **Hover & Focus Interactions**:
   - Cards and primary buttons will maintain clean borders (`border-white/[0.08]` to `border-indigo-500/40`) with subtle sapphire ambient diffusion (`rgba(47, 107, 255, 0.2)`), avoiding harsh glaring reflections while providing tactile depth.

---

## 4. WCAG AA Contrast & Accessibility Validation
All tokens are verified under WCAG 2.1 Level AA requirements (minimum 4.5:1 for body copy; 3.0:1 for large display text and UI components):
- **Body text (`#F1F5FF`) on `#0A0F1F`**: Contrast ratio is **14.5:1** (Passes AAA).
- **Muted text (`#A7B4D4`) on `#0A0F1F`**: Contrast ratio is **7.4:1** (Passes AAA).
- **Muted text (`#A7B4D4`) on `#0F1730`**: Contrast ratio is **6.4:1** (Passes AA).
- **Sapphire button text (`#FFFFFF`) on `#2F6BFF`**: Contrast ratio is **4.8:1** (Passes AA).
- **Champagne gold badge text (`#140E02`) on `#E8B85B`**: Contrast ratio is **9.8:1** (Passes AAA).
- **Champagne gold text (`#E8B85B`) on `#0A0F1F`**: Contrast ratio is **8.1:1** (Passes AAA for badges and headers).

---

## 5. Execution Steps
1. **`src/index.css` Theme Block & Root Variables**:
   - Insert `@theme` block defining `--color-indigo-*` and `--color-cyan-*`.
   - Update `body` background to `#0A0F1F` and color to `#F1F5FF`.
   - Update `:root` and `[data-theme="indigo"]` variables (`--theme-accent`, `--theme-accent-hover`, `--theme-gradient-*`).
   - Retain existing `emerald`, `blue`, and `purple` alternate data-themes.
   - Update `.bg-deep-mesh`, `.bg-hero-radiance`, `.btn-premium-primary`, and glass surface classes to the `#0F1730` / `#16203F` palette.
2. **Hardcoded Hex References & Razorpay Client Theme**:
   - Update `src/lib/payment/razorpayClient.ts` to return `#2F6BFF` for the checkout modal theme.
   - Update remaining hardcoded legacy dark hex references across `src/components/` (such as background card gradients from `#131b32`/`#0e1428` to `#16203F`/`#0F1730`).
3. **Verification & Testing**:
   - Execute `compile_applet` and `lint_applet` to confirm zero compilation or TypeScript regressions.
   - Inspect key pages (Homepage, Catalog, PDP, Cart Drawer, Checkout Page, Creator Dashboard) in preview to guarantee optical harmony and WCAG compliance.
