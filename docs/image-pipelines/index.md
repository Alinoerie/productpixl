# PHOILA PIPELINE INDEX
## V1.2 — Unified Pipeline Map
### Which pipeline to run, when, and how they connect

---

## WHAT THIS IS

A reference guide that maps both PHOILA content pipelines, explains their relationship, and helps determine which pipeline to run for any given product or campaign.

**This is not an execution brief.** It is a decision-making map. The execution details live in each pipeline's own document.

---

## THE TWO PIPELINES

### Pipeline A — A+ Content Pipeline
**Document:** `PHOILA_Aplus_PIPELINE.md` (current: v5.4)  
**What it does:** Generates Amazon A+ enhanced brand content visuals — the rich visual modules that appear below the main product listing, below the fold.  
**Output:** 7–15 A+ module images (M1–M15), executor-selected per product  
**Image specs:** Mix of 970×600, 970×300, and 1500×600 px at 144 DPI  
**Text:** A+ modules support text overlays (text layer added in Seller Central, v6 addresses baked-in text)  
**Brand registered:** Required for Premium modules (M11–M15)  

### Pipeline L — Listing Image Pipeline
**Document:** `PHOILA_LISTING_PIPELINE.md` (current: v1.1)  
**What it does:** Generates Amazon listing gallery images — the 9 images visible in the image carousel above the fold.  
**Output:** 12 Listing module images (L1–L12), Ali selects best 6 for live listing  
**Image specs:** All 1:1 square, up to 1500×1500 px at 144 DPI  
**Text:** L1 (Main Hero) must be text-free. L2–L12 can include text overlays and infographics  

---

## HOW THEY RELATE

```
AMAZON LISTING STRUCTURE (top to bottom):

┌─────────────────────────────────────────────────────────┐
│  IMAGE GALLERY  (Pipeline L — Listing Images)           │
│  Images 1–9 visible before scrolling                    │
│  L1 Main Hero + L2–L9 selected additional images       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PRODUCT TITLE + BULLETS + DESCRIPTION                   │
│  (Text — no pipeline needed)                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  A+ CONTENT  (Pipeline A — A+ Modules)                  │
│  M1–M15 modules — visible after scrolling                │
│  Only appears if brand is registered                     │
└─────────────────────────────────────────────────────────┘
```

**The Listing pipeline feeds the image gallery (above the fold).**  
**The A+ pipeline enriches the brand content below the fold.**  

They serve different purposes and appear at different points in the buyer's journey. They are complementary, not competing.

---

## WHICH PIPELINE DO I RUN?

### Decision Tree

```
STEP 1: What does Ali want?
├── A+ Content only        → Run Pipeline A
├── Listing Images only    → Run Pipeline L
└── Both                  → Run Pipeline L first, then Pipeline A

STEP 2: Does Ali know which to run?
├── Yes — they specified   → Run what they asked for
└── No — they said "images" or "content"
    ├── Is this a new product with no existing listing?  → Recommend Pipeline L first (images go live fastest)
    ├── Is this an established listing with weak conversion? → Recommend Pipeline A (A+ lifts conversion)
    ├── Is this a premium brand with strong visual identity? → Recommend Both (maximum impact)
    └── Is this a commodity product competing on price?  → Recommend Pipeline L only (A+ less effective without brand differentiation)
```

### Quick Reference: When to Use Each

| Situation | Recommended Pipeline |
|-----------|--------------------|
| New product launch | Pipeline L (listing images go live first) |
| Low conversion on existing listing | Pipeline A (A+ lifts conversion rates) |
| Premium brand with strong visuals | Both (maximum brand impact) |
| Simple commodity product | Pipeline L only (A+ less impactful without brand story) |
| Strong origin/story brand (natural, artisan, heritage) | Both + prioritize Brand Story modules |
| Fashion/apparel/visual category | Both (image-heavy category) |
| Technical product with specs focus | Pipeline L (detail/spec images) + Pipeline A (comparison/specs modules) |
| Limited budget — one pipeline only | Pipeline L (higher ROI per image) |
| Brand registered, premium positioning | Both (use M11–M15 Premium modules) |

### The "Both" Advantage

When running both pipelines (Pipeline L → Pipeline A in sequence):

1. **Listing images are generated and approved first** — these establish the visual language
2. **A+ pipeline inherits the visual intelligence** — the Step 2 analysis and Step 3 category intelligence from the Listing run is reused
3. **Reserve images feed A+** — the 6 Listing images not selected for the gallery can be used as reference inputs for A+ generations
4. **Visual coherence** — the listing and A+ content feel like one unified brand experience

This is the recommended approach for premium brands or any product where the buyer journey is longer and brand storytelling matters.

---

## UNIFIED WORKFLOW

Both pipelines share the same first three steps. This is by design — it means running Both is efficient because the analysis work is shared.

```
ALI SENDS: Product photo + product name + any notes
              ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 1 — RECEIVE & VERIFY INPUT                        │
│  (same process for both pipelines)                       │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 1.5 — PRODUCT DATA COLLECTION                     │
│  Q1–Q12 sent to Ali. Wait for responses before Step 2.  │
│  (same for both pipelines)                              │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 2 — DEEP IMAGE ANALYSIS                          │
│  Product physicals, label transcription, mood/feel      │
│  (same output for both pipelines — document once)       │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 3 — CATEGORY & COMPETITOR RESEARCH               │
│  Subcategory, top competitors, emotional triggers,      │
│  positioning gap                                        │
│  (same output for both pipelines — document once)       │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  STEP 4 — PIPELINE SELECTION                           │
│  Ask Ali: A only / L only / Both                        │
└─────────────────────────────────────────────────────────┘
              ↓
    ┌──────────────┬─────────────────┐
    ↓              ↓                 ↓
Pipeline A    Pipeline L      Pipeline L → A
(A+ only)     (Listing only)  (Both in sequence)
    ↓              ↓                 ↓
  Steps 5-7      Steps 5-8        Steps 5-8 (L)
                                  then Steps 5-7 (A)
```

### Shared Analysis Documents

Steps 2 and 3 output the same document structure regardless of which pipeline runs:
- `step2_image_analysis.md` — all product observations
- `step3_category_research.md` — category intelligence brief

These documents are **internal only** and live in the client's shared research folder. They are not delivered to the client but they power all subsequent prompt writing.

---

## PIPELINE A — A+ CONTENT

### Document
`/home/alisionary/.openclaw/workspace/team/PHOILA_Aplus_PIPELINE.md`

### Current Version
v5.3

### What It Delivers
Up to 15 A+ module images (M1–M15):
- 10 Standard modules (available to all sellers)
- 5 Premium modules (requires Brand Registered)

### Image Gallery
Modules selected per-product based on category and brand needs. Not all 15 are generated every time — the executor selects the most impactful subset (minimum 6, maximum 12).

| ID | Module | Dimensions | Purpose |
|----|--------|-----------|---------|
| M1 | Header with Text | 970×600 | Brand hero — first A+ impression |
| M2 | Image + Text | 970×300 | Feature callout, 50/50 split |
| M3 | Text + Image | 970×300 | Benefit claim, mirrored layout |
| M4 | Image Grid | 970×600 | 4-panel visual depth |
| M5 | Product Showcase | 970×600 | Multiple products in context |
| M6 | Comparison Chart | 970×600 | Competitive differentiation |
| M7 | Large Image + Text | 1500×600 | Full-width atmospheric hero |
| M8 | Technical Specifications | 970×300 | Specs and ingredients |
| M9 | Hotspot Image | 970×600 | Interactive callout image |
| M10 | Category Navigation | 970×300 | Cross-sell guidance |
| M11 | FAQ Module | 970×600 | Objection handling (Premium) |
| M12 | Video Module | 1500×600 | Video hero frame (Premium) |
| M13 | Shoppable Image | 1500×600 | Lifestyle hotspots (Premium) |
| M14 | Card Carousel | 1500×600 | Scrolling story cards (Premium) |
| M15 | Shoppable Lookbook | 1500×600 | Editorial commerce (Premium) |

### Quality Bar
8-10/10. 7/10 is the production-ready minimum. 6/10 is unacceptable.

### Brand Registered Check
Before running Pipeline A, confirm with Ali whether the brand is Brand Registered. If not:
- Premium modules (M11–M15) are not eligible
- Run only Standard modules (M1–M10)

---

## PIPELINE L — LISTING IMAGES

### Document
`/home/alisionary/.openclaw/workspace/team/PHOILA_LISTING_PIPELINE.md`

### Current Version
v1.1

### What It Delivers
12 Listing module images (L1–L12), from which Ali selects 6 for the live listing.

### Image Library
All 12 are generated. Ali picks the best 6 (selection must include L1 + at least 1 lifestyle + at least 1 detail/quality). Remaining images are held in reserve for A+ pipeline or future use.

| ID | Module | Image # | Text Allowed? | Purpose |
|----|--------|---------|--------------|---------|
| L1 | Main Hero | 1 | NO | Clean product isolation — Amazon requirement |
| L2 | Size & Scale Reference | 2–3 | YES | Physical size context |
| L3 | Lifestyle In-Context | 2–4 | YES | Product in real use |
| L4 | Texture & Detail Close-Up | 2–5 | YES | Material and build quality |
| L5 | Mood & Atmosphere | 2–4 | YES | Brand world and lifestyle |
| L6 | Quality Construction | 2–5 | YES | Craftsmanship visibility |
| L7 | Fabric & Material Callout | 2–5 | YES | Composition and certifications |
| L8 | Packaging & Unboxing | 2–5 | YES | First-touch experience |
| L9 | Brand Story | 2–6 | YES | Origin and values |
| L10 | Comparison / Versus | 2–6 | YES | Competitive differentiation |
| L11 | Lifestyle Alternate | 2–5 | YES | Different context/angle |
| L12 | Lifestyle Action | 2–5 | YES | Active use moment |

### Quality Bar
8-10/10. 7/10 is the production-ready minimum. 6/10 is unacceptable.

### Amazon Compliance (L1 Main Hero)
Strict requirements — violations cause listing suppression:
- Pure white (#FFFFFF) background, no shadows, no gradients
- Product only — no props, models, hands, watermarks
- No text outside of what appears on the product label
- Product occupies 75–85% of frame, centered

---

## CATEGORY-ADAPTIVE PRINCIPLE

Both pipelines are **category-agnostic by design**. The product image is the input. The executor analyzes it, detects the category, and adapts:

- **Module selection** — L4 Texture might be critical for apparel, L8 Packaging critical for beauty
- **Scene direction** — a supplement and a hoodie have completely different lifestyle contexts
- **Visual language** — clinical precision for medical grade vs warm artisanal for natural products
- **Emotional triggers** — different purchase drivers in beauty vs tools vs food

The analyst fills in the specifics per product. The pipeline provides the framework.

---

## FILE ORGANIZATION

When both pipelines run, create a single shared research/ folder at the client root — Steps 2-3 analysis is shared, not duplicated.

```
/clients/<CLIENT_NAME>/
├── research/               ← SHARED — generated once, used by both pipelines
│   ├── step2_image_analysis.md
│   ├── step3_category_research.md
│   └── step4_module_selection.md
├── APLUS_V50/
│   ├── [M01-M15 images]
│   ├── prompts/all_prompts.md
│   └── qa_scores.md
├── LISTING_V10/
│   ├── [L01-L12 images]
│   ├── prompts/all_prompts.md
│   └── qa_scores.md
```

Full path prefix: `/home/alisionary/.openclaw/workspace/projects/Active Projects/phoila/clients/<CLIENT_NAME>/`

**Research docs (Steps 2–4) are shared when both pipelines run.** They are internal only — not delivered to the client.

---

## VERSION SUMMARY

| Document | Version | Status |
|----------|---------|--------|
| PHOILA_Aplus_PIPELINE.md | v5.4 | Active |
| PHOILA_LISTING_PIPELINE.md | v1.2 | Active |
| PHOILA_PIPELINE_INDEX.md | v1.2 | Active — this document |

---

## QUICK DECISION CARD

```
ALI SENDS: Product photo

ASK: "A+ only / Listing only / Both?"

DEFAULT: Listing only (higher ROI per image, faster to live)

RECOMMEND BOTH WHEN:
□ Premium brand with strong visual identity
□ New product launch (both go live together)
□ Weak conversion despite good listing
□ Brand Registered (access to M11-M15)
□ Strong origin/story (artisan, natural, heritage)
□ Fashion/visual category

DEFAULT TO LISTING ONLY WHEN:
□ Commodity product competing on price
□ Limited budget — one pipeline
□ Simple product with no brand story
□ Need fastest path to live listing
```

---

## FILEPATH

Saved to: `/home/alisionary/.openclaw/workspace/team/PHOILA_PIPELINE_INDEX.md`

---

## CHANGELOG

| Date | Version | Change |
|------|---------|--------|
| 2026-05-23 | **v1.2** | **Agent-agnostic + data collection** — Added Step 1.5 to unified workflow diagram. Updated A+ and Listing versions to v5.4 and v1.2. Replaced "Claudius" with "the executor" throughout. |
| 2026-05-23 | **v1.1** | **Audit fixes** — Updated A+ pipeline version from v5.1 to v5.3. Added L1 cross-reference note (always selected for listing — not from reserve pool). Updated research folder structure to show shared folder when both pipelines run (not duplicated inside each pipeline folder). Updated quality bar language to match new 7/10 minimum threshold. |
| 2026-05-23 | **v1.0** | **Initial release** — unified pipeline map, decision tree, workflow diagram, version summary, quick decision card |
