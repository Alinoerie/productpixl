# ProductPixl Brand System

## Positioning (market-fit)

**Category:** AI listing studio — images + copy for marketplace sellers.

**ICP:** Solo and small-team sellers (10–200 SKUs) on Amazon and European marketplaces (Bol.com, Amazon DE/UK), launching or refreshing listings without agencies or €207/mo suites.

**Tagline:** Launch before you list.

**True USP:** ProductPixl owns the *pre-listing* moment — one photo → research-backed gallery + copy — with pay-when-you-generate economics. Catalog-sync tools (e.g. ButterflAI) start from existing SKUs; ASIN suites (e.g. Pixii) need a live listing; we start from your product shot.

**One-liner:** Photo-first AI listing studio: gallery images + marketplace copy from one photo, pay only when you generate.

**Canonical copy:** `src/lib/marketing-usp.ts`

## Why Amber #F59E0B on Near-Black #0F0E0D

Research-backed direction for 2026: move away from overused startup blue *and* warm copper/orange commerce clichés. **Amber on dark** is distinctive, premium, and warm — it signals craft and attention without the cold precision of blue or the aggressive energy of orange. Amber reads as a creative studio, not a marketplace clone. The near-black background communicates focus and quality.

## Color System

### Brand Palette

| Token | Hex | Use |
|---|---|---|
| **Amber** | `#F59E0B` | All CTAs, links, focus rings, brand accents |
| **Amber Light** | `#FCD34D` | Hover states, highlights |
| **Amber Dark** | `#D97706` | Active/pressed states |
| **Background** | `#0F0E0D` | Primary dark background |
| **Surface 2** | `#1C1917` | Cards, elevated dark surfaces |
| **Surface 3** | `#292524` | Inputs, tertiary surfaces |

### Light Mode

| Token | Hex | Use |
|---|---|---|
| **Background** | `#FAFAF9` | Page background (warm off-white) |
| **Surface** | `#FFFFFF` | Cards, modals |
| **Surface 2** | `#F5F5F4` | Muted backgrounds |
| **Text** | `#1C1917` | Primary text |
| **Text Muted** | `#57534E` | Secondary text |
| **Border** | `#E7E5E4` | Borders, dividers |

Amber `#F59E0B` remains the accent in both modes.

### Semantic Tokens

| Token | Hex | Use |
|---|---|---|
| Success | `#059669` | Grades A, completed states |
| Warning | `#D97706` | Paywall, low credits |
| Error | `#DC2626` | Failures, grade F |

### Avoid

Pure Amazon orange, warm copper/linen palettes, Inter-only purple-blue gradients, neon-on-black "AI slop" aesthetics, indigo/iris purple.

## Brand Pillars

1. **Photo-first** — No ASIN required. Launch SKUs before they exist on Amazon.
2. **Pay when you generate** — Credits, not subscriptions. Early sellers hate lock-in.
3. **Research-backed** — Category intelligence and listing-specific prompts, not random AI.
4. **Amazon + Europe** — Bol.com and EU marketplaces as first-class, not footnotes.
5. **RUFUS / COSMO aware** — Copy structured for semantic search, not keyword stuffing.

## Voice

- **Clear** over clever. Sellers are busy.
- **Confident** not hype. No "revolutionary AI".
- **Specific** — modules (L1, L3), credits, minutes — not vague "magic".
- **Honest** — MVP scope visible; trust beats overclaiming.

## Competitor Contrast (messaging)

| Them | Us |
|---|---|
| Pixii: ASIN in | Photo in |
| Pixii: €207/mo | Credits from €0 |
| Perci: text only | Images + copy |
| Amazon AI: free generic | Research-backed generation + QA |

## Implementation

All UI colors flow from CSS custom properties in `src/app/globals.css`. Components reference `var(--amber)`, `var(--bg)`, `var(--text)`, etc. — never hardcode brand hex in TSX except user-editable brand profile defaults.

Default brand profile colors for new users: primary `#F59E0B`, secondary `#0891B2`.

## Animation

- Page load: single fade-up, opacity 0→1 + translateY 20→0, 600ms, ease power2.out
- GSAP free tier — no license concerns

## Credit System

- 1 credit = 1 image generation
- Exports are free after generation
- Starter: 10 credits, one-time, no card required
