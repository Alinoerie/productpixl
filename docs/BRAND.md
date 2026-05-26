# ProductPixl Brand System

## Positioning (market-fit)

**Category:** AI listing studio — images + copy for marketplace sellers.

**ICP:** Solo and small-team sellers (10–200 SKUs) on Amazon and European marketplaces (Bol.com, Amazon DE/UK), launching or refreshing listings without agencies or $207/mo suites.

**One-liner:** Launch before you list — one photo to publication-ready gallery and copy.

## Why this palette: Studio Iris

Research-backed direction for 2026 SaaS and creative tools: move away from overused startup blue *and* warm copper/orange commerce clichés. **Studio Iris** uses cool slate neutrals (precision, long-session comfort) with **indigo** as the primary action color (premium, creative, memorable) and **cyan** as the secondary (EU marketplaces, Bol.com, RUFUS/COSMO intelligence).

| Color | Hex | Role | Rationale |
|-------|-----|------|-----------|
| **Iris** | `#6366F1` | Primary CTA, links, focus rings | Premium indigo — distinct from Amazon orange and generic `#2563EB` SaaS blue. Reads as a creative studio, not a marketplace clone. |
| **Ink** | `#0F172A` | Text, dark UI | Cool slate-900 — crisp editorial contrast on light backgrounds. |
| **Mist** | `#F8FAFC` | Page background | Cool tinted neutral; reduces eye strain vs stark white without the dated “warm linen” look. |
| **Cyan** | `#0891B2` | EU / trust / RUFUS-ready | Secondary accent for Europe, Bol.com, grader tips, and algorithm-intelligence story. |
| **Slate** | `#E2E8F0` | Borders | Clean separation; works across marketing and dense studio UI. |

**Semantic colors (separate from brand):**

| Token | Hex | Use |
|-------|-----|-----|
| Success | `#059669` | Grades A, completed states |
| Warning | `#D97706` | Paywall, low credits (amber — not brand accent) |
| Error | `#DC2626` | Failures, grade F |

**Avoid:** Pure Amazon orange, warm copper/linen palettes, Inter-only purple-blue gradients, neon-on-black “AI slop” aesthetics.

## Brand pillars

1. **Photo-first** — No ASIN required. Launch SKUs before they exist on Amazon.
2. **Pay when you generate** — Credits, not subscriptions. Early sellers hate lock-in.
3. **Research-backed** — Tavily + PHOILA prompts, not random prompts.
4. **Amazon + Europe** — Bol.com and EU marketplaces as first-class, not footnotes.
5. **RUFUS / COSMO aware** — Copy structured for semantic search, not keyword stuffing.

## Voice

- **Clear** over clever. Sellers are busy.
- **Confident** not hype. No “revolutionary AI”.
- **Specific** — modules (L1, L3), credits, minutes — not vague “magic”.
- **Honest** — MVP scope visible; trust beats overclaiming.

## Competitor contrast (messaging)

| Them | Us |
|------|-----|
| Pixii: ASIN in | Photo in |
| Pixii: $207/mo | Credits from €0 |
| Perci: text only | Images + copy |
| Amazon AI: free generic | Research + QA pipeline |

## Implementation

All UI colors flow from CSS custom properties in `src/app/globals.css`. Components reference `var(--accent)`, `var(--teal)` (secondary cyan), `var(--ink)`, etc. — never hardcode brand hex in TSX except user-editable brand profile defaults.

Default brand profile colors for new users: primary `#6366F1`, secondary `#0891B2`.
