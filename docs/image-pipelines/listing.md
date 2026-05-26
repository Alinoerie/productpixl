# PHOILA LISTING IMAGE PIPELINE
## V1.4 — PHOILA LISTING STANDARD
### Universal Brief for the Executor — Any Amazon Product Category

---

## WHAT THIS IS

A repeatable, production-grade Amazon listing image generation pipeline. Ali sends ONE product photo. The executor delivers a curated set of polished Amazon listing visuals — optimized for conversion, category-perfect, brand-perfect, every image.

The pipeline is **CATEGORY-AGNOSTIC**. It works for handcream, supplements, electronics, apparel, kitchenware, pet products, toys, books, automotive, food, beauty — anything Amazon sells.

**Quality standard: 8-10/10. 7/10 is the production-ready minimum. 6/10 is not acceptable. Ever.**

---

## WHAT'S DIFFERENT FROM A+ PIPELINE

| | A+ Pipeline | Listing Pipeline |
|--|------------|-----------------|
| **Purpose** | Enhanced brand content on product detail page (below the fold) | The 9 images in the Amazon image gallery (above the fold, first impression) |
| **Placement** | A+ content block within the product detail page | Image carousel on listing — visible without scrolling |
| **Image count** | 7–15 modules, executor-selected from 15 | Up to 9 images total (1 main hero + 8 additional) |
| **Ratio strategy** | Mix of 970×600, 970×300, 1500×600 | All 1:1 square, up to 1500×1500 |
| **Text allowed** | Yes — A+ modules support text overlays | Image 1 (main) must be text-free. Images 2–9 can include text and infographics |
| **Who sees it** | Shoppers who scroll past the main image | Every shopper — it's the first thing they see |

**Both pipelines are independent.** Run either one alone, or both together. The Listing pipeline feeds the image gallery. The A+ pipeline enriches the brand content below it.

---

## WHAT YOU NEED

- **Replicate API token:** `r8_YbA...tZcs`
- **Model:** `google/nano-banana-pro` (Pixii's engine — product-consistent image generation)
- **Fallback model:** `google/nano-banana-pro` with `allow_fallback_model: true`
- **Output specs:** 1:1 square, up to 1500×1500 @ 144 DPI (see Module Specs Table)
- Any product image Ali provides
- Research skills: web search, browser, QMD knowledge base

---

## THE 12-IMAGE LISTING MODULE LIBRARY

All listing images follow the Amazon image gallery convention:
- **Image 1 (Main Hero):** Pure white background, product only, no text, no props, no models
- **Images 2–9:** Can include lifestyle, infographics, comparisons, text overlays, human presence

The executor generates all 12 from the library. Ali selects the best 6 for the live listing. Remaining 6 are held in reserve and can feed the A+ pipeline.

### Module Library

| ID | Module Name | Image # | Purpose | Text Allowed? |
|----|-----------|---------|---------|--------------|
| L1 | Main Hero | 1 | Clean product isolation — the Amazon main image | NO |
| L2 | Size & Scale Reference | 2–3 | Flat-lay or worn with measurement annotations | YES |
| L3 | Lifestyle In-Context | 2–4 | Product in real use — human connection, aspirational context | YES |
| L4 | Texture & Detail Close-Up | 2–5 | Material, build quality, features — extreme close-up | YES |
| L5 | Mood & Atmosphere | 2–4 | Brand world, lifestyle, aspirational — no product required | YES |
| L6 | Quality Construction | 2–5 | Craftsmanship, inner lining, tags, hardware details | YES |
| L7 | Fabric & Material Callout | 2–5 | Composition, certifications, GSM weight, material story | YES |
| L8 | Packaging & Unboxing | 2–5 | What arrives at the door — presentation, inclusion, branding | YES |
| L9 | Brand Story | 2–6 | Origin, values, provenance — who made this and why | YES |
| L10 | Comparison / Versus | 2–6 | Our product vs generic/competitor — brand power play | YES |
| L11 | Lifestyle Alternate | 2–5 | Different setting, angle, model, context from L3 | YES |
| L12 | Lifestyle Action | 2–5 | Product in active use, motion, real moment of value delivery | YES |

### L1–L12 Detailed Specifications

---

#### L1 — MAIN HERO
**Purpose:** The first image shoppers see. This is the purchase decision image. Amazon requires: pure white background (#FFFFFF), product only, no text, no watermark, no logo outside of the product label, no mannequin or model.

**Specs:** 1000×1000 px minimum (Amazon enforced). Recommended: 1500×1500 for maximum fidelity. 1:1 square. 72 DPI minimum (Amazon), 144 DPI recommended.

**Visual direction:**
```
Scene: Pure white (#FFFFFF) infinity cove or seamless white sweep. 
No shadows, no gradients, no environmental context.
The product is the sole subject — center-framed, occupying 75–85% of the frame.
Dead front-facing or 3/4 view showing the full label.
Lighting: even, neutral, no hot spots, no reflections that obscure detail.
The product must be instantly recognizable — this IS the listing thumbnail.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 2 variants (Ali picks best)

---

#### L2 — SIZE & SCALE REFERENCE
**Purpose:** Remove buyer uncertainty about physical size. Critical for online-only purchases where buyers cannot handle the product.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: The product shown with clear size context.
Options by category:
— Apparel/Accessories: Flat-lay on a hard surface with a ruler or tape measure 
  visible alongside. Or worn on a real person with height/size clearly readable.
— Small products (supplements, cosmetics, gadgets): Placed next to a familiar 
  reference object (coin, credit card, pen, iPhone) that everyone knows the size of.
— Large products (furniture, equipment): Shown with a person for scale.
Lighting: Clean, even, product clearly legible. No dramatic shadows.
Background: White or very light neutral — not busy.
The measurement reference must be REAL and READABLE — not guessed.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K | **Variant strategy:** 1 shot (or 2 if category is size-critical like apparel)

---

#### L3 — LIFESTYLE IN-CONTEXT
**Purpose:** Show the product in its natural use environment with a human element. This creates emotional connection — the buyer sees themselves using the product.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: A real person using the product in a setting that matches the target buyer.
The setting is aspirational but relatable — not a celebrity campaign, not stock photo generic.
Category examples:
— Apparel: Person wearing the item in a real-life context — street, café, park, 
  home — not a studio backdrop. Real gesture, real clothing interaction.
— Beauty/Cosmetics: Hands applying product, reflection in mirror, daily ritual moment.
— Food/Supplements: Person in kitchen or at table with the product present.
— Electronics: Hands holding the device, in-use context, not just product on table.
Lighting: Natural or softly directed. Warm and inviting. Never clinical.
Mood: The lifestyle the target buyer wants to inhabit.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 2 variants (critical image — different settings/models)

---

#### L4 — TEXTURE & DETAIL CLOSE-UP
**Purpose:** Build trust through quality perception. Close-up of material, surface, construction detail — the tactile reality of the product.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: Extreme close-up of the most compelling detail.
Options by category:
— Apparel: Stitching, fabric weave, seam quality, button/zipper hardware, 
  tag detail, lining texture.
— Beauty: Formula texture, product dispensing, ingredient visible on skin.
— Electronics: Port detail, button feel, material grain, edge finishing.
— Food: Ingredient texture visible, powder granularity, oil sheen, 
  cross-section detail.
— Packaging: Label texture, embossing, foil stamping, printing quality.
Camera: Macro lens feel — 90mm or 100mm equivalent. Shallow depth of field 
acceptable if it draws attention to the detail.
Lighting: Controlled. Can be dramatic — side lighting to reveal texture 
contours. Not flat.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 1 shot

---

#### L5 — MOOD & ATMOSPHERE
**Purpose:** Establish brand world without necessarily showing the product. The aspirational identity — what does owning this brand mean about the person who buys it?

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: The brand's world — atmosphere, mood, aesthetic without product required.
This image should communicate the emotional territory of the brand.
— Luxury/Premium: Clean, minimal, editorial, high-end environment.
— Natural/Organic: Natural textures, organic shapes, earthy palette, 
  sunlight, outdoor or natural interior.
— Urban/Streetwear: City context, street aesthetic, contemporary culture.
— Fitness/Performance: Energy, movement, performance environment.
— Artisanal/Handcrafted: Workshop, materials in process, craftsperson context.
The product CAN appear but is not required. If it appears, it should feel 
natural in the scene — not forced.
Lighting: Atmospheric. Can be moody, dramatic, warm — whatever matches the brand.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 1 shot

---

#### L6 — QUALITY CONSTRUCTION
**Purpose:** Credibility through visible craftsmanship. Show the build quality, the hidden details that separate premium from budget.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: The details that reveal quality — things a buyer can't see on a standard photo.
Options:
— Apparel: Inner lining visible, seam finishing (French seams, flatlock, reinforced 
  collar), zipper pull detail, button construction, tag placement.
— Electronics: Port internals, hinge mechanism, speaker grille, antenna detail, 
  material thickness cross-section.
— Beauty: Cap mechanism, inner seal, pump mechanism, airless container internals.
— Home/Kitchen: Handle attachment, hinge quality, weight distribution, 
  material thickness.
— Packaging: Box construction, emboss quality, foil depth, printing registration.
Camera: Medium close-up. Can include exploded view concept if it communicates 
assembly quality.
Lighting: Clean but can emphasize depth — slight side light to reveal dimension.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K | **Variant strategy:** 1 shot

---

#### L7 — FABRIC & MATERIAL CALLOUT
**Purpose:** Rational justification for emotional purchase. Certifications, material composition, performance characteristics — the science/truth behind the product.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: Material story told visually.
Options:
— Apparel: Fabric swatch shown flat with label callout listing composition 
  (e.g. "92% Organic Cotton / 8% Elastane"). Include certification badges 
  (OEKO-TEX, GOTS, Fair Trade) as graphic elements on the image.
— Beauty: Ingredient key visual (key botanical, active molecule diagram, 
  key ingredient callout). Can include percentage claims ("12% Vitamin C").
— Electronics: Material callout (anodized aluminum, recycled ocean plastic, 
  glass reinforced) with material cross-section.
— Food: Key ingredient highlighted (key botanical, farm origin photo), 
  supplement facts panel visible.
Can include infographic elements (charts, comparison bars) as long as they 
are integrated into the image composition — not floating text overlays.
Color palette: Category-appropriate. Clinical precision for health/science 
categories. Warm/earthy for natural products.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K | **Variant strategy:** 1 shot

---

#### L8 — PACKAGING & UNBOXING
**Purpose:** The first-touch experience. What does the customer receive? The unboxing moment is a purchase driver — premium packaging = premium product in the buyer's mind.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: The full packaging experience.
Options:
— If branded box/bag exists: Show the closed box or bag in a styled context — 
  on a doorstep, on a gift table, opened with contents revealed.
— If bulk/pouch packaging: Show the pouch standing, sealed, with any 
  included accessories laid out beside it.
— If no outer packaging (sachets,blisters): Show the full kit laid out 
  as it arrives — all units, insert, instructions.
The brand's packaging design should be clearly visible. If the packaging 
carries key product info (ingredients, usage instructions), ensure it is legibly shown.
Lighting: Bright and inviting. This is the anticipation moment — the image 
should make the buyer excited to open the box.
Background: Clean. Can be lifestyle (gift table, doorstep, bed) or neutral.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K | **Variant strategy:** 1 shot

---

#### L9 — BRAND STORY
**Purpose:** Emotional connection to the origin. Who made this, where, why? Humanizes the purchase and builds brand loyalty beyond the transaction.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: The origin story — where and how this product is made or the world 
it comes from.
Options:
— Artisan/Handcrafted: The craftsperson, the workshop, hands at work, 
  raw materials, the process.
— Natural/Organic: The source ingredient in its natural environment 
  (olive grove, herb farm, wild harvest location), farmer or gatherer context.
— Brand founder: Founder portrait with the product, brand origin location.
— Historical/Heritage: The provenance context — old building, traditional 
  method, generational continuity.
— Urban/Contemporary: The studio, the city, the cultural context.
The brand name should be visible in the image. This is also a brand-building 
image — it should feel intentional, not incidental.
Mood: Authentic, warm, specific. Not generic stock photo.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 1 shot

---

#### L10 — COMPARISON / VERSUS
**Purpose:** Direct differentiation. Show the product against a competitor or a "generic" baseline — brand power communicated visually, not through text.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: Our product positioned as clearly superior.
Options:
— Direct competitor comparison: Both products side by side, our product 
  dominant left or larger. Same lighting, same angle — equal treatment 
  except ours is clearly hero.
— "Generic" comparison: A generic/unbranded version of the same product 
  type alongside our branded product. The quality gap should be immediately visible.
— Feature comparison: Our product shown with a key feature visibly superior 
  (thicker fabric, larger capacity, premium materials) vs the alternative.
Lighting: Equal treatment for all products shown. Ours lit to look its best, 
but the comparison must feel fair — not manipulated.
Visual hierarchy: Our product is clearly the hero. The comparison product 
is clearly secondary — smaller, less prominent, or in the background.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K | **Variant strategy:** 1 shot (or 2 if category is highly competitive)

---

#### L11 — LIFESTYLE ALTERNATE
**Purpose:** Different context, different emotional trigger. Second lifestyle angle that reaches buyers who didn't connect with L3's setting/model.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: Same category relevance as L3, different context.
— If L3 shows indoor lifestyle, L11 shows outdoor.
— If L3 shows a young person, L11 shows a different demographic.
— If L3 shows the product in a city context, L11 shows it in nature.
— If L3 shows the product being applied/used, L11 shows the result/state after use.
The product must be the same. The context must be meaningfully different.
This image exists because different buyers self-identify with different 
lifestyle scenarios — L3 might not reach all buyers.
Quality bar: Same as L3. This is a parallel track, not a lower-priority shot.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 1 shot

---

#### L12 — LIFESTYLE ACTION
**Purpose:** The product in motion — active use, real value delivery moment. Creates urgency and desire through action.

**Specs:** 1:1 square. 720×720 px minimum. Recommended 1500×1500. 144 DPI.

**Visual direction:**
```
Scene: The moment of value delivery — product actively being used, 
not just sitting in context.
Options by category:
— Apparel: Person mid-motion — walking, stretching, active in the garment. 
  Not standing static. Movement suggested by body language and pose.
— Beauty: Product being applied (hands, skin, hair). Immediate sensory connection.
— Food: Food being prepared, consumed, or plated. The moment of enjoyment.
— Fitness/Supplements: Capsule being taken, powder being mixed, post-workout moment.
— Electronics: Device in active use — typing, photographing, listening.
— Cleaning/Home: The before/after moment, product actively cleaning.
Camera: Can have slight motion feel — not frozen studio static.
Lighting: Energetic. Can use motion blur selectively (not heavy). 
Dynamic and alive — not still life.
```

**Nano-Banana-Pro ratio:** 1:1 | **Resolution:** 2K or 4K | **Variant strategy:** 1 shot (or 2 for categories where active use is the primary conversion driver)

---

## THE UNIFIED PIPELINE WORKFLOW

This section explains how the Listing pipeline and A+ pipeline relate, and how to run them in sequence or independently.

---

### WORKFLOW OVERVIEW

```
ALI SENDS: Product photo + product name + any notes

EXECUTOR RECEIVES → STEP 1: VERIFY INPUT
                              ↓
                    STEP 1.5: PRODUCT DATA COLLECTION
                    (Q1-Q12 sent to Ali — wait for responses)
                              ↓
                    STEP 2: DEEP IMAGE ANALYSIS
                    (same as A+ pipeline)
                              ↓
                    STEP 3: CATEGORY & COMPETITOR RESEARCH
                    (same as A+ pipeline)
                              ↓
                    STEP 4: UNIFIED MODULE SELECTION
                    ┌──────────────────────────────┐
                    │ Ask Ali: Which pipeline?      │
                    │ A. A+ Pipeline only           │
                    │ B. Listing Pipeline only      │
                    │ C. Both (Listing → A+)        │
                    └──────────────────────────────┘
                              ↓
                    [PIPELINE-SPECIFIC EXECUTION]
                              ↓
                    STEP 5: QUALITY GATE
                    STEP 6: DELIVERY
```

**The analysis phase (Steps 1–3) is shared.** The executor performs the full Step 2 image analysis and Step 3 research once. Then uses those findings to power whichever pipeline runs.

---

### PIPELINE SELECTION (Step 4 — Ask Ali)

After completing Steps 2 and 3, the executor asks:

```
Step 2 and Step 3 complete. Here's what I found:
— Category: [X]
— Brand tone: [Y]
— Top competitor visual theme: [Z]

Which pipeline should I run?
A. A+ Pipeline only — [brief description]
B. Listing Pipeline only — [brief description]  
C. Both — Listing first (best 6 images), then A+ fed from remaining
```

Ali chooses. If Ali doesn't respond within a reasonable time, default to **B (Listing Pipeline only)** unless the product has strong brand storytelling potential (then default to **C**).

---

### RUNNING BOTH PIPELINES (Option C — Recommended for Strong Brands)

When Ali selects "Both" or when the product has strong brand storytelling potential:

```
Phase 1 — Listing Pipeline
Generate all 12 L-modules (L1–L12).
Present to Ali for selection: "Choose your 6 best images for the listing."
Ali selects 6 → live listing images confirmed.

Phase 2 — A+ Pipeline (feeds from Listing)
Unselected 6 Listing images are held in reserve.
The executor runs the A+ pipeline (M1–M15).
Where appropriate, reserve Listing images can be used AS INPUT 
reference images for A+ generations (the product's listing context is 
already established — reuse this visual intelligence).
Remaining Listing images feed A+ modules where they fit.
```

**Advantage of running Both:** The Listing images establish the brand visual language first. The A+ pipeline then inherits that visual coherence — the result is a unified brand experience from listing to A+ content.

---

## STEP-BY-STEP EXECUTION

### STEP 1 — RECEIVE & VERIFY INPUT

Ali sends: 1 product image.

Verify you have:
- [ ] The product image file (check it actually opens)
- [ ] The Amazon product category (if Ali didn't specify, infer from the image)
- [ ] Any brand guidelines, color palettes, or style direction (ask if missing)
- [ ] Any competitor products Ali wants to differentiate from

If anything is unclear, ask Ali before proceeding. Never guess.

---

### STEP 1.5 — PRODUCT DATA COLLECTION

Before generating anything, collect structured product data from Ali. Send all questions in a single message. Short answers — no essays needed.

```
PRODUCT DATA INTAKE:

Q1.  Brand name — exactly as it appears on the label:
Q2.  Product name — exactly as it appears on the label:
Q3.  Dimensions — L × W × H (include unit — cm, mm, inches):
Q4.  Weight (include unit — g, kg, ml, oz):
Q5.  Materials or ingredients — fabric composition, active ingredients, key compounds:
Q6.  Color(s) — exact name(s) or hex codes if known:
Q7.  Key features or claims — what makes this product special:
Q8.  Target buyer — who is this for (age range, lifestyle, values):
Q9.  Competitors to differentiate from — specific brands or product types (or "none"):
Q10. Brand guidelines or style direction — colors, tone, fonts, any rules (or "none"):
Q11. Amazon subcategory — where should this be listed (or "unsure"):
Q12. Brand Registered on Amazon? — YES / NO (determines Premium module eligibility):
```

Wait for Ali's responses before proceeding to Step 2. Do not infer — Ali's written responses take precedence over any image-derived assumptions.

**Note:** If Ali already provided some of this data in the initial message, skip those questions and confirm: "I have [X] from your message — checking the remaining items."

**Dimensional anchor:** After receiving Q3 dimensions, derive a scale anchor phrase from the SCALE ANCHOR TABLE (Step 5) and embed it in every scene prompt throughout the run.

---

### STEP 2 — DEEP IMAGE ANALYSIS

**Identical to the A+ pipeline.** Perform the full analysis documented in PHOILA_Aplus_PIPELINE.md Steps 2A through 2F. Document:
- Product physicals (shape, material, color, texture, closure)
- Text on product (literal transcription — every word, font, case)
- Label design (shape, placement, logo style, colors, finish)
- Cap/lid/closure details
- Product presentation in the image
- Mood, feel, positioning

Store all Step 2 findings. Every prompt in Step 5 will be built from these exact observations.

---

### STEP 3 — CATEGORY & COMPETITOR RESEARCH

**Identical to the A+ pipeline.** Perform the full research documented in PHOILA_Aplus_PIPELINE.md Steps 3.1 through 3.5.1. Document ALL of the following:
- Amazon subcategory tree (3.1)
- Top 5 competitor listings — visual themes, color, lifestyle scenarios, absent elements (3.2)
- **CTR thumbnail analysis** at 200×200px crop — what wins attention in search (3.2.1)
- **Review image mining** — top 50 buyer photos: what features they photograph, what they demonstrate (3.2.2)
- **Sponsored ad creative analysis** — PPC-tested image patterns from top sponsored results (3.2.3)
- **Image sequence pattern** — document full gallery sequence of top 5 sellers, derive the narrative arc convention (3.2.4)
- **Objection mapping** — top 3 buyer objections from Q&A and 1-2 star reviews, each mapped to a resolving visual (3.2.5)
- Emotional purchase triggers (3.3)
- **Trigger-to-visual translation table** — each trigger mapped to exact visual element + module + camera framing (3.3.1)
- Positioning gap (3.4)
- Full category intelligence brief including PPC pattern, buyer-photographed features, objections, sequence pattern (3.5)
- **Competitor visual anti-pattern map** — 3 category clichés to specifically avoid in every scene prompt (3.5.1)

Store all Step 3 findings. The category intelligence — especially the trigger translation table and anti-pattern map — drives module selection and every prompt in Step 5.

---

### STEP 4 — SELECT LISTING MODULES & VARIANT STRATEGY

Using the 12-image library and the category intelligence from Step 3, select which modules to generate for this specific product.

**Step 4a — Select applicable modules**

```
LISTING MODULE SELECTION:
L1 Main Hero: ALWAYS — required by Amazon for image 1
L2 Size & Scale: [YES/NO] — WHY: [reason]
L3 Lifestyle In-Context: [YES/NO] — WHY: [reason]
L4 Texture & Detail: [YES/NO] — WHY: [reason]
L5 Mood & Atmosphere: [YES/NO] — WHY: [reason]
L6 Quality Construction: [YES/NO] — WHY: [reason]
L7 Fabric & Material: [YES/NO] — WHY: [reason]
L8 Packaging & Unboxing: [YES/NO] — WHY: [reason]
L9 Brand Story: [YES/NO] — WHY: [reason]
L10 Comparison / Versus: [YES/NO] — WHY: [reason]
L11 Lifestyle Alternate: [YES/NO] — WHY: [reason]
L12 Lifestyle Action: [YES/NO] — WHY: [reason]

Total to generate: [N] modules
```

**Rules:**
- L1 is ALWAYS generated (Amazon requirement)
- Always include at least one lifestyle module (L3 or L11 or L12)
- Always include at least one detail/quality module (L4, L6, or L7)
- Packaging (L8) only if the product has meaningful packaging
- Comparison (L10) only if competitive differentiator is clear

**Step 4b — Variant strategy per module**

```
VARIANT STRATEGY:
L1 Main Hero: 2 variants — WHY: critical first impression, Ali picks best
L2 Size/Scale: [1/2 variants]
L3 Lifestyle: [1/2 variants] — WHY: if critical emotional driver, 2 variants
L4 Texture Detail: 1 variant
L5 Mood: 1 variant
L6 Quality: 1 variant
L7 Material: 1 variant
L8 Packaging: 1 variant
L9 Brand Story: 1 variant
L10 Comparison: [1/2 variants] — WHY: if competitive category, 2 variants
L11 Lifestyle Alternate: 1 variant
L12 Lifestyle Action: [1/2 variants] — WHY: if active use is primary driver
```

**Step 4c — Confirm pipeline with Ali**

Present the module selection summary and ask:
```
Listing module selection:
L1 Main Hero (2 variants)
+ [N-1] other modules
Total: [N] images

Run this pipeline? Reply: YES / EDIT [module adjustments]
```

---

### STEP 5 — CRAFT MODULE-SPECIFIC PROMPTS

This step mirrors the A+ pipeline prompt structure but is adapted for listing image requirements.

**THE UNIVERSAL PROMPT TEMPLATE FOR LISTING IMAGES:**

```
[CONSTRAINT BLOCK — non-negotiable, paste literal Step 2 observations]
"The product in the reference image is a [BRAND] [PRODUCT TYPE]. Exact specifications:
— Container shape: [OBSERVED SHAPE AND PROPORTIONS]
— Primary color: [OBSERVED HEX OR PRECISE COLOR DESCRIPTION]
— Secondary colors: [OBSERVED COLORS]
— Material / texture: [OBSERVED MATERIAL AND SURFACE FINISH]
— Closure: [OBSERVED CAP/LID TYPE, COLOR, MATERIAL]
— Label: [OBSERVED LABEL PLACEMENT, SHAPE, BACKGROUND COLOR]
— Text on label reads EXACTLY: '[LITERAL TRANSCRIPTION FROM STEP 2 — every word]
— Label typography: [OBSERVED FONT STYLE — serif/sans, weight, any distinctive features]
— Any additional markings: [ANY OTHER VISIBLE TEXT, SYMBOLS, LOGOS]
— Physical dimensions: [FROM Q3: L × W × H in stated unit, e.g. '4cm × 4cm × 4cm']
— Scale anchor: [DERIVED from Q3 — see SCALE ANCHOR TABLE: e.g. 'roughly the size of a Lego brick']
Do NOT change, regenerate, recreate, blur, distort, recolor, restyle, or alter any of these
product elements. The product in the output must be IDENTICAL to this reference.
Do NOT rescale or enlarge the product beyond its stated physical dimensions."

[SCENE BLOCK — specific to the Listing module type and grounded in Step 3 findings]
[Every scene must address ALL of the following sub-blocks:]

[SCENE LAYERS — mandatory 3-layer specification for all lifestyle/atmospheric scenes]
Foreground (0–30% depth): [specific object, material, color, position relative to product]
  e.g. "A white ceramic coffee cup with a thin brown ring stain on its base, 8cm left of product, slightly out of focus"
Mid-ground (product zone, 30–60% depth): [product placement, angle, scale as % of frame height]
  e.g. "The product centered at 45-degree angle, occupying 55% of frame height, textured surface catching side light"
Background (60–100% depth): [environment description, depth, light source character]
  e.g. "Gym floor visible at steep angle, rubber flooring texture, overhead strip lights blurred to horizontal bokeh streaks at f/1.4"

[COMPETITOR CONTRAST — mandatory in every scene]
Category cliché to avoid (from Step 3.5.1 anti-pattern map): [exact visual element]
This scene must be visually distinct. DO NOT include: [exact element to avoid].
DO include instead: [specific differentiator from Step 3 positioning gap].

[TRIGGER ACTIVATION — mandatory in every scene]
Activating trigger: [trigger name from Step 3.3.1 translation table]
Via: [specific visual element in this scene that activates it]
  e.g. "Activating: 'fear of re-injury' via tight shot of hinged joint mechanism at peak compression — showing mechanical stability at the moment of maximum stress"

[PROP SPECIFICATION — mandatory for any scene with props; be exact or omit entirely]
Prop 1: [name] | [material] | [color/hex] | [position: direction + distance from product] | [size relative to product height]
  e.g. "Protein shaker | translucent black plastic | #1A1A1A | 12cm right of product | 40% of product height"
Prop 2: [name] | [material] | [color] | [position] | [size]
  (Never write "include relevant props" — specify exactly or do not add props)

[Scene must fill a positioning gap identified in Step 3.4 — not what competitors are doing]
[Scene must reinforce an emotional purchase trigger mapped in Step 3.3.1]
[All props must be SPECIFIC — not "some fruit" — "a halved Blood Orange with seeds visible, rind curling back slightly"]

[STYLE & QUALITY ENFORCEMENT BLOCK]
"[STEP 2 OBSERVED COLOR TEMPERATURE] color temperature throughout.
[STEP 2 OBSERVED MATERIAL QUALITY] material tactile quality.
[CATEGORY-SPECIFIC RENDER STANDARD — e.g. 'Premium apparel editorial photography',
'Luxury skincare campaign photography', 'Professional food photography'].
Lens: [SPECIFIC LENS — e.g. '85mm f/1.4 for creamy bokeh', '50mm f/1.2 for subject
separation', '90mm macro for texture work'].
Lighting: [SPECIFIC QUALITY — e.g. 'Rembrandt key light from upper-left, 2:1 ratio',
'Large softbox above for even diffuse wrap', 'Natural window with 45-degree fill'].
Light & shadow specification:
  Key light: [direction, modifier, distance, color temperature — e.g. 'Gridded 60cm octabox at 45° upper-left, 1.2m from product, 5600K daylight']
  Fill light: [direction, ratio to key — e.g. 'White V-flat reflector at right, 3:1 ratio (key:fill)']
  Background light: [yes/no + separation intent — e.g. 'Small gridded spot from below-behind, halo separation from bg']
  Shadow intent: [cast shadow character + direction — e.g. 'Hard cast shadow to the right, ~15cm long, 40% opacity — confirms product physicality']
Mood: [CATEGORY EMOTIONAL TONE — e.g. 'intimate and sensory', 'confident and aspirational',
'warm and trusted'].
Camera & lens: [FROM CAMERA/LENS PRESETS TABLE — specify body + lens + aperture + lighting, e.g. 'Sony A7R V · FE 90mm Macro G OSS @ f/2.8 · natural window light'].
Realism mandate: Authentic product photography — NOT CGI, NOT 3D render, NOT AI composite. Natural lens physics: slight vignette at frame edges, authentic depth-of-field falloff, ISO grain matching conditions (ISO 200 studio / ISO 800 natural light). Minor imperfections allowed: micro-shadows, authentic surface reflections, real material texture variation.
Aspect ratio: 1:1 square.
Amazon listing image standard. No compromises."

[NEGATIVE PROMPT BLOCK — mandatory for every generation, include verbatim in the API call prompt]
"DO NOT generate any of the following:
— [Category cliché #1 from Step 3.5.1 anti-pattern map]
— [Category cliché #2 from Step 3.5.1 anti-pattern map]
— Deformed hands, fingers, or faces if human is in frame
— Floating or gravity-violating objects
— Text, letters, or words appearing in the scene background (hallucination risk)
— Competitor products or recognizable brand logos visible in background
— Stock-photo aesthetic: [category-specific cliché — e.g. 'smiling model in gym gear on plain studio backdrop']
— CGI material rendering — must show authentic material grain and surface variation
— Any visual element listed in the ANTI-PATTERN MAP from Step 3.5.1"
```

---

### SCALE ANCHOR TABLE

After Q3 is received, derive the scale anchor automatically. Include this phrase in every scene prompt showing the product in context. Forces correct physical scale instead of "plausible-but-wrong" AI sizing.

| Largest axis from Q3 | Scale Anchor Phrase |
|---------------------|---------------------|
| < 2 cm | "roughly the size of a human fingernail" |
| 2–5 cm | "roughly the size of a Lego brick / wine cork" |
| 5–10 cm | "roughly the size of half a smartphone" |
| 10–20 cm | "roughly the size of a smartphone" |
| 20–30 cm | "roughly the size of a paperback book" |
| 30–50 cm | "roughly the size of a shoebox" |
| > 50 cm | "roughly the size of a laptop" |

Add to CONSTRAINT BLOCK: `— Scale anchor: The product is [anchor phrase]. Enforce this scale throughout the scene.`

For any scene with human hand or body in frame, also add to SCENE BLOCK: `"Respect stated dimensions: the product is [anchor phrase]. A real adult hand holding this product would [describe proportional relationship]. Do not enlarge."`

---

### CAMERA/LENS PRESETS — CATEGORY-ADAPTIVE

Industry-standard commercial product photography selections. Pick based on Step 3 category. Include in STYLE block as: `Camera: [body] · [lens] @ [aperture] · [lighting condition].`

| Category | Hero / Studio | Lifestyle / Atmospheric |
|----------|--------------|------------------------|
| Skincare / Beauty | Phase One IQ4 150MP · XCD 90mm f/3.2 @ f/8 · large softbox | Sony A7R V · FE 90mm Macro G OSS @ f/2.8 · natural window |
| Texture / Macro | Hasselblad X2D 100C · XCD 35-75mm @ f/5.6 · side-lit | Canon EOS R5 · RF 100mm Macro L IS USM @ f/4 · ring light |
| Apparel flat lay | Phase One XT · Schneider 60mm LS @ f/11 · diffused overhead | Canon EOS R5 · RF 50mm f/1.2L @ f/8 · soft north-window |
| Apparel lifestyle | Hasselblad X2D · XCD 45P @ f/4 · ambient | Leica Q3 · Summilux 28mm ASPH @ f/2 · available light |
| Food detail | Canon EOS R5 · RF 100mm Macro L IS USM @ f/8 · diffused side | Sony A7R V · FE 90mm Macro @ f/4 · natural window |
| Food atmospheric | Canon EOS R5 · TS-E 45mm f/2.8 tilt-shift @ f/5.6 | Nikon Z9 · Nikkor Z 50mm f/1.2 S @ f/2 |
| Electronics spec | Nikon Z9 · Nikkor Z MC 105mm f/2.8 VR S @ f/11 · even softbox | Sony A7R V · FE 85mm GM @ f/5.6 · ambient |
| Small cosmetics | Phase One IQ4 · Rodinald 90mm @ f/8 · large softbox | Sony A7R V · FE 90mm Macro @ f/3.5 · natural light |
| Jewellery | Nikon D850 · Nikkor 105mm Micro @ f/16 · tent lighting | Canon EOS R5 · RF 100mm Macro L @ f/8 · macro ring |
| Home / Kitchen | Phase One IQ4 · XCD 90mm @ f/11 · large softbox | Sony A7R V · Zeiss Batis 25mm f/2 @ f/2.8 |
| Default | Sony A7R V · FE 90mm Macro G OSS @ f/5.6 · softbox | Sony A7R V · FE 85mm GM @ f/1.4 · natural light |

Always specify: **body + lens + aperture + lighting condition**. Specificity prevents AI defaulting to CGI-perfect studio rendering.

---

### HUMAN COMPOSITE GATE

**SCALE-SAFE** — AI can generate end-to-end (no human body in frame):
- L1 Main Hero (pure white bg, product only)
- L4 Texture & detail (no hand required)
- L5 Mood & atmosphere (product as accent or absent)
- L6 Quality construction (close-up detail, no hand)
- L7 Material callout (swatch or ingredient visual)
- L8 Packaging (box or pouch isolated)
- L9 Brand Story (origin location, atmosphere — no hand holding product)
- L10 Comparison (both products isolated as objects)

**SCALE-CRITICAL** — Mandatory composite workflow. Do NOT attempt end-to-end AI:
- L2 Size & Scale when hand-held (product in hand for reference)
- L3 Lifestyle In-Context (person using or holding product)
- L11 Lifestyle Alternate (person using or holding product)
- L12 Lifestyle Action (active use with human body in frame)

**Rule:** For SCALE-CRITICAL modules, skip end-to-end AI and go directly to COMPOSITE FALLBACK — this is the correct path, not a failure path. Current AI models cannot reliably enforce physical dimensions when human anatomy is the dominant scale reference in frame.

---

### L1 SPECIAL INSTRUCTIONS (AMAZON MAIN IMAGE REQUIREMENTS)

The Main Hero (L1) has strict Amazon requirements. The prompt must include:

```
[MAIN HERO REQUIREMENTS — ABSOLUTE CONSTRAINTS]
"— Amazon main image standard: pure white (#FFFFFF) background, no shadows, 
  no gradients, no environmental context.
— Product only — no props, no models, no hands, no lifestyle elements.
— No text, no watermarks, no logos beyond what is printed on the product label.
— Product occupies 75–85% of the frame, centered.
— Front-facing or slight 3/4 view showing full label clearly.
— No mannequin visible — product must be free-hanging or on a white surface only.
— If the product has a logo on the label, that logo is part of the product and is fine.
— If the product has a brand name printed on it, that is fine — it is the product label."
```

Any violation of the above = reject and regenerate. Amazon will suppress listings that don't meet main image requirements.

---

## STEP 6 — UPLOAD & GENERATE

**6.1 — Upload the product image**

```bash
curl -s -F "file=@<input_image>.<ext>" "https://tmpfiles.org/api/v1/upload"
```
Extract the direct URL from the JSON response — use the URL that contains `/dl/` (not the page URL). The page URL (`tmpfiles.org/wWw66.../image.jpg`) returns HTML. The download URL (`tmpfiles.org/dl/wWw66.../image.jpg`) returns the actual image file. **Always convert page URL to /dl/ URL before passing to Replicate.** Test it by opening in browser before proceeding.

**Rate limit:** Account has ~6 req/min on NBP. Space generations 12s apart. Use retry logic with 15s backoff on 429.

**Note:** tmpfiles.org URLs expire after 60 minutes. Re-upload the product image if your session runs longer than that before generation completes. (tmpfiles.org links are for Discord review and approval only — 60-min TTL. Permanent assets are the local JPEG files in the client folder. Always share local file paths alongside tmpfiles links for client handoff.)

**6.2 — Generate each visual per module, with rate-limit handling**

```python
import os, replicate, requests, time
from pathlib import Path
from PIL import Image

# Load token from credentials file (never hardcode tokens in scripts)
creds_path = Path('/home/alisionary/.openclaw/workspace/credentials/replicate-api.md')
token = None
if creds_path.exists():
    with open(creds_path, 'rb') as f:
        data = f.read()
    for line in data.split(b'\n'):
        if line.startswith(b'r8_'):
            token = line.decode('latin-1').strip()
            break
assert token and token.startswith('r8_'), f"No valid Replicate token found in {creds_path}"
os.environ['REPLICATE_API_TOKEN'] = token
client = replicate.Client()

# Fill these from Step 1.5 intake — MANDATORY, no defaults
brand = "[BRAND_FROM_STEP_1_5]"      # brand name — exactly as on label
product = "[PRODUCT_FROM_STEP_1_5]"  # product name — exactly as on label
client_name = "[CLIENT_FOLDER_NAME]" # folder name under clients/
input_url = 'https://tmpfiles.org/dl/<YOUR_UPLOADED_URL>.jpg'

# Validate URL is actually an image
r = requests.head(input_url, timeout=10)
assert r.status_code == 200 and 'image' in r.headers.get('content-type', ''), \
    f"URL is not an image! Got {r.status_code} {r.headers.get('content-type')}. Use /dl/ URL."
print(f"Image URL OK: {r.headers.get('content-type')}")

output_dir = Path(f'/home/alisionary/.openclaw/workspace/projects/Active Projects/phoila/clients/{client_name}/LISTING_V10')
output_dir.mkdir(parents=True, exist_ok=True)

# VARIANT_STRATEGY — define from Step 4b decisions
# Key = cfg['key'], Value = number of variants (1 or 2)
VARIANT_STRATEGY = {
    'L01_main_hero':   2,  # always 2 — critical first impression
    'L02_size_scale': 1,
    'L03_lifestyle':  2,  # critical emotional driver — 2 variants
    'L04_texture':    1,
    'L05_mood':       1,
    'L06_quality':    1,
    'L07_material':   1,
    'L08_packaging':  1,
    'L09_brand_story': 1,
    'L10_comparison': 1,
    'L11_lifestyle_alt': 1,
    'L12_action':     1,
}

# Module configs — the executor fills prompts from Step 5
# All images: 1:1 square, 144 DPI
# Resolution: 2K standard, 4K for hero and lifestyle images
# Target size: 1500x1500 (Amazon accepts up to 10000x10000, 1500x1500 is good balance of quality/size)
module_configs = [
    {'key': 'L01_main_hero',    'module': 'L01', 'type': 'main_hero',    'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '4K'},
    {'key': 'L02_size_scale',  'module': 'L02', 'type': 'size_scale',   'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '2K'},
    {'key': 'L03_lifestyle',   'module': 'L03', 'type': 'lifestyle',   'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '4K'},
    {'key': 'L04_texture',     'module': 'L04', 'type': 'texture',      'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '2K'},
    {'key': 'L05_mood',        'module': 'L05', 'type': 'mood',         'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '4K'},
    {'key': 'L06_quality',     'module': 'L06', 'type': 'quality',      'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '2K'},
    {'key': 'L07_material',    'module': 'L07', 'type': 'material',     'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '2K'},
    {'key': 'L08_packaging',   'module': 'L08', 'type': 'packaging',    'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '2K'},
    {'key': 'L09_brand_story', 'module': 'L09', 'type': 'brand_story',  'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '4K'},
    {'key': 'L10_comparison',  'module': 'L10', 'type': 'comparison',   'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '2K'},
    {'key': 'L11_lifestyle_alt','module': 'L11', 'type': 'lifestyle_alt','prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '4K'},
    {'key': 'L12_action',      'module': 'L12', 'type': 'action',       'prompt': '<FULL PROMPT FROM STEP 5>', 'size': 1500, 'res': '4K'},
]

# Filter to only modules selected in Step 4 (present in VARIANT_STRATEGY)
selected = [cfg for cfg in module_configs if cfg['key'] in VARIANT_STRATEGY]

# Rate-limit helper: retry with exponential backoff on 429
def run_with_retry(prompt, res, max_attempts=3, delay=15):
    for attempt in range(max_attempts):
        try:
            return client.run(
                'google/nano-banana-pro',
                input={
                    'prompt': prompt,
                    'image_input': [input_url],
                    'aspect_ratio': '1:1',
                    'resolution': res,
                    'allow_fallback_model': True,
                }
            )
        except Exception as e:
            if '429' in str(e) or 'rate limit' in str(e).lower():
                wait = delay * (attempt + 1)
                print(f"  Rate limited — sleeping {wait}s before retry {attempt+2}/{max_attempts}", flush=True)
                time.sleep(wait)
            else:
                raise
    raise Exception(f"Failed after {max_attempts} attempts")

for cfg in selected:
    variant_count = VARIANT_STRATEGY[cfg['key']]
    for v in range(1, variant_count + 1):
        suffix = f"_v{v}" if variant_count > 1 else ""
        base_name = f"{brand}_{product}_{cfg['module']}_{cfg['type']}{suffix}"
        print(f"\nGenerating {base_name}...")

        t0 = time.time()
        out = run_with_retry(cfg['prompt'], cfg['res'])

        # Download raw output
        img_url = out[0] if isinstance(out, list) else str(out)
        print(f"  URL: {img_url}")
        raw_bytes = requests.get(img_url).content
        raw_path = output_dir / f"{base_name}_raw.jpeg"
        raw_path.write_bytes(raw_bytes)

        # Post-process to exact 1:1 dimensions (1500x1500)
        img = Image.open(raw_path)
        # Ensure 1:1 — crop to square from center if needed
        src_w, src_h = img.size
        if src_w != src_h:
            crop_size = min(src_w, src_h)
            left = (src_w - crop_size) // 2
            top = (src_h - crop_size) // 2
            img = img.crop((left, top, left + crop_size, top + crop_size))
        # Resize to target size
        if img.size != (cfg['size'], cfg['size']):
            img = img.resize((cfg['size'], cfg['size']), Image.LANCZOS)

        final_path = output_dir / f"{base_name}.jpeg"
        img.save(str(final_path), 'JPEG', quality=95)
        raw_path.unlink()
        elapsed = time.time() - t0
        print(f"  Saved: {final_path} — {img.size} ({elapsed:.0f}s)")

        # Rate limit: 6 req/min on NBP — wait 12s between each generation
        time.sleep(12)
```

**Run each separately.** 28-60 seconds each. Never in parallel batch. With rate-limit handling, a full 12-image run takes approximately 20-25 minutes.

**6.3 — Verify dimensions post-generation**

After downloading each image, verify pixel dimensions:
```python
from PIL import Image
img = Image.open('output/L01_main_hero.jpeg')
print(f"{img.size} — expected 1500x1500")
# If wrong, resize with LANCZOS and save at exact dimensions
if img.size != (1500, 1500):
    img = img.resize((1500, 1500), Image.LANCZOS)
    img.save("output/L01_main_hero_exact.jpeg", quality=95)
```

---

## STEP 7 — QUALITY GATE & SELECTION

### THE 4-CHECK QUALITY GATE

Apply to every image:

```
VISUAL: [name]
OUTPUT URL: [replicate delivery URL]

CHECK 1 — PRODUCT FIDELITY
Q: Is the brand name, product name, and all label text IDENTICAL to Step 2 transcription?
   Every letter, same font, same case, same position.
   Score: [10/10] [7/10 — minor shift] [FAIL — text wrong, missing, or corrupted]
   Action if FAIL: Composite fallback

CHECK 2 — SCENE APPROPRIATENESS
Q: Does the scene match the intended module type (L1-L12) AND module purpose from Step 4?
   Does it fill the positioning gap from Step 3?
   Score: [10/10] [7/10] [FAIL]
   Action if FAIL: Rewrite scene block and regenerate

CHECK 3 — EMOTIONAL IMPACT
Q: Does this image make someone want to click "Add to Cart"?
   Would a real Amazon shopper pause on this? Does it communicate value and desire?
   10/10 — instant click impulse, campaign quality
   8–9/10 — compelling, clearly professional
   7/10 — solid, production-ready minimum
   6/10 — flat, generic, missing the mark
   5 or below — actively off-putting or wrong
   Minimum to APPROVE: 7/10.
   Action if 6 or below: Regenerate.

CHECK 4 — AI ARTIFACT CHECK (lifestyle / action / human modules only)
Q: Any deformed anatomy (hands, fingers, faces)? Floating objects? Physics violations?
   Text hallucinations on product label or in scene?
   Pass: no artifacts visible
   Fail: artifact present
   Action if FAIL: Simplify scene, remove human element, or composite product + scene separately

OVERALL SCORE: [___/10]
VERDICT: [APPROVE] / [REGENERATE — issue: ___] / [COMPOSITE — paste product on scene]
```

**Rule: Any single FAIL = regenerate. Any CHECK 3 score of 6 or below = regenerate.**

### L1 MAIN HERO — ADDITIONAL VALIDATION

For L1 specifically, also validate Amazon compliance:
- [ ] Background is pure white (#FFFFFF), no shadows, no gradients
- [ ] Product only — no props, no models, no hands visible
- [ ] No text on the image outside of what's on the product label
- [ ] Product occupies 75-85% of frame
- [ ] Label is clearly legible and front-facing

Any Amazon compliance violation = automatic FAIL and regenerate.

---

### COMPOSITE FALLBACK TRIGGER

**Two triggers — composite on EITHER condition:**

1. **Quality failure:** Nano-Banana-Pro fails product fidelity after **2 attempts** — do not waste a third attempt
2. **Scale-critical scene:** L2 (hand-held), L3, L11, or L12 when human body is in frame — route directly to composite on the **first attempt**, do not attempt end-to-end AI generation

Execute composite:

1. Generate the SCENE without the product reference (remove `image_input`)
2. Download the generated scene
3. Use the original product image as a layer on top:
```python
# pip install rembg pillow
import subprocess
from PIL import Image

def composite_product_on_scene(product_path, scene_path, output_path, target_size=1500, center=True):
    subprocess.run(['rembg', 'i', product_path, '/tmp/product_nobg.png'], check=True)
    scene = Image.open(scene_path).convert('RGBA').resize((target_size, target_size), Image.LANCZOS)
    product = Image.open('/tmp/product_nobg.png').convert('RGBA')
    ph = int(target_size * 0.70)
    pw = int(product.width * (ph / product.height))
    product = product.resize((pw, ph), Image.LANCZOS)
    if center:
        x = (target_size - pw) // 2
    else:
        x = int(target_size * 0.55) - pw // 2
    y = (target_size - ph) // 2
    scene.paste(product, (x, y), product)
    scene.convert('RGB').save(output_path, 'JPEG', quality=95)
    print(f"Composite saved: {output_path}")
# Usage: center=True for L1/L2 (Amazon requires centered product). center=False for L3/L5/L9 (atmospheric placement OK).
```
4. Deliver the composite — this guarantees 100% product fidelity

---

### ALI SELECTION PHASE

After all images are QA-approved, present to Ali:

**SELECTION RULE:** Ali's 6 choices must include at minimum:
- L1 (always required, auto-selected as Image 1)
- 1 lifestyle image (L3, L11, or L12)
- 1 detail/quality image (L4, L6, or L7)

The remaining 3 slots are freely chosen from the remaining modules. This prevents a listing with 6 lifestyle shots and no product detail.

```
12 images generated and QA-approved.
Please select your 6 listing images (images 2-7 in the Amazon gallery).
Image 1 (L1 Main Hero) is pre-selected.

L1 Main Hero: [URL] [auto-selected — Amazon requirement]

L2 Size/Scale:   [URL_A] / [URL_B — if 2 variants] → pick one
L3 Lifestyle:    [URL_A] / [URL_B — if 2 variants] → pick one  
L4 Texture:      [URL]
L5 Mood:        [URL]
L6 Quality:     [URL]
L7 Material:    [URL]
L8 Packaging:   [URL]
L9 Brand Story:  [URL]
L10 Comparison:  [URL]
L11 Lifestyle Alt: [URL]
L12 Action:      [URL]

Reply with your 6 picks (L2-L12, any 6 — must include 1 lifestyle and 1 detail/quality).
Or reply APPROVE ALL — default selection: L1 (required), L3 Lifestyle, L4 Texture, L5 Mood, L2 Size/Scale, L9 Brand Story (or next available if any weren't generated).
```

Ali selects 6 → confirmed as listing images. Remaining images held for A+ pipeline.

---

## STEP 8 — DELIVERY

### DELIVERY STRUCTURE

Filename format: `{BRAND}_{PRODUCTNAME}_L{MODULE_ID}_{MODULE_TYPE}.jpeg`

Example: `MikeTyson_MerchHoodie_L01_main_hero_v2.jpeg`

```
/home/alisionary/.openclaw/workspace/projects/Active Projects/phoila/clients/<CLIENT_NAME>/
├── LISTING_V10/
│   ├── MikeTyson_MerchHoodie_L01_main_hero_v1.jpeg      # or _v2.jpeg if variants
│   ├── MikeTyson_MerchHoodie_L01_main_hero_v2.jpeg
│   ├── MikeTyson_MerchHoodie_L02_size_scale.jpeg
│   ├── MikeTyson_MerchHoodie_L03_lifestyle_v1.jpeg
│   ├── MikeTyson_MerchHoodie_L03_lifestyle_v2.jpeg
│   ├── MikeTyson_MerchHoodie_L04_texture.jpeg
│   ├── MikeTyson_MerchHoodie_L05_mood.jpeg
│   ├── MikeTyson_MerchHoodie_L06_quality.jpeg
│   ├── MikeTyson_MerchHoodie_L07_material.jpeg
│   ├── MikeTyson_MerchHoodie_L08_packaging.jpeg
│   ├── MikeTyson_MerchHoodie_L09_brand_story.jpeg
│   ├── MikeTyson_MerchHoodie_L10_comparison.jpeg
│   ├── MikeTyson_MerchHoodie_L11_lifestyle_alt.jpeg
│   └── MikeTyson_MerchHoodie_L12_action.jpeg
├── prompts/
│   └── all_prompts.md                # All generated prompts verbatim
├── qa_scores.md                      # 4-check gate results per image
└── composite_fallbacks/              # Any images that needed composite treatment
    └── [composited images]
```

**Research docs (Steps 2-4) are INTERNAL — not delivered to client. Only the image assets and the QA scores are delivered.**

### UPLOAD AND DELIVER

- Upload all generated images to tmpfiles.org
- Share links in Discord with the quality score summary per module:
  `L1 Main Hero [10/10] APPROVE | L2 Size/Scale [8/10] APPROVE | L4 Texture [FAIL] COMPOSITED`
- Tag the output as v1.1 Phoila Listing Standard
- Mark which 6 images Ali selected for the live listing
- (tmpfiles.org links are for Discord review and approval only — 60-min TTL. Permanent assets are the local JPEG files in the client folder. Always share local file paths alongside tmpfiles links for client handoff.)

---

## QUICK REFERENCE: NANO BANANA PRO API FOR LISTING

```python
client.run('google/nano-banana-pro', input={
    'prompt': '...',
    'image_input': ['https://...'],   # 1-14 reference images
    'aspect_ratio': '1:1',           # 1:1 — all listing images
    'resolution': '2K',              # 1K, 2K, 4K — 2K standard, 4K for hero/lifestyle
    'allow_fallback_model': True,    # falls back to Seedream-5 if NBP fails
})
```

---

## AMAZON LISTING IMAGE SPECS QUICK REFERENCE

| Module | Min Dimensions | Recommended | Ratio | DPI | Amazon Requirement |
|--------|---------------|-------------|-------|-----|-------------------|
| L1 Main Hero | 1000×1000 | 1500×1500 | 1:1 | 144 | **MUST be pure white bg, no text, product only** |
| L2–L12 | 720×720 | 1500×1500 | 1:1 | 144 | Text allowed (except on product unless label) |

**Amazon listing image gallery — image order:**
```
Image 1: Main Hero (white bg) ← Amazon enforces this
Image 2–7: Additional images (your selection — size, lifestyle, detail, etc.)
Image 8–9: (optional) A+ content images or more lifestyle
```

**Total: Up to 9 images.**

---

## IF STUCK — QUICK TROUBLESHOOTING

| Problem | Immediate Fix |
|---------|--------------|
| Main hero has any shadow or gradient on white bg | Regenerate — Amazon will suppress |
| Product looks AI-generated/fake | Use 2 reference images (different angles) in image_input |
| Lifestyle looks like generic stock photo | Delete scene block. Rewrite using positioning GAP from Step 3 |
| Texture shot looks flat and lifeless | Add "extreme macro photography, 100mm lens, 5:1 magnification ratio" |
| Hands/body look deformed in lifestyle | Simplify scene. Remove human element. Composite product + human separately |
| Model times out | Add `allow_fallback_model: True`. Try again at different hour |
| Product color drifts from reference | Use 2 reference images, explicit color constraint in prompt |
| Text on label broken/distorted | Composite fallback — paste clean product on scene |
| Scene looks like every competitor | Rewrite scene using positioning gap from Step 3 — be specific about what's missing |
| Prompt too long / model ignores parts | Prioritize constraint block. Put most important fidelity elements FIRST |

---

## WHAT GREAT LISTING PROMPTS LOOK LIKE — FULL EXAMPLES

**BAD PROMPT (L1 Main Hero):**
> "A product photo of a black hoodie on a white background."

**GOOD PROMPT — MAIN HERO (L1):**
> "The product in the reference image is a Mike Tyson Merch black hoodie, size M. Exact specifications:
> — Container shape: Standard unisex hoodie silhouette, pre-washed Terry cotton, relaxed fit
> — Primary color: Matte solid black #0D0D0D, no sheen
> — Secondary colors: Chest text reads 'TYSON' in bold red #CC0000 sans-serif all-caps, approximately 8cm wide
> — Material / texture: 380gsm French Terry cotton, visible loop back texture, soft-touch pre-washed finish
> — Closure: No zipper — pullover style. Hood with flat drawstrings, antique silver aglets
> — Label: Woven neck label inside, black with white text 'TYSON' + size M
> — Text on garment reads EXACTLY: 'TYSON' — bold red all-caps sans-serif, center chest, approximately 8cm wide
> — No other text, graphics, or embellishments on the garment
> Do NOT change, regenerate, blur, distort, recolor, or alter any of these product elements.
>
> Scene: Pure white (#FFFFFF) infinity cove studio backdrop. No shadows, no gradients, no environmental elements whatsoever. The hoodie is displayed on a white ghost mannequin or laid flat on a white seamless surface — front-facing, hood relaxed behind neck, sleeves hanging naturally. The 'TYSON' red chest text is dead-center and perfectly legible. No props, no price tags, no hang tags visible, no models, no hands. The hoodie occupies 80% of the frame — large, confident, the hero of the image. Lighting: even front light on white, no shadows cast by the garment on the backdrop. Shot on Phase One IQ4 150MP with XCD 90mm lens at f/11 for maximum label text legibility. 1500×1500 px at 144 DPI, 1:1 square. Amazon main image standard. No compromises."

**BAD PROMPT (L3 Lifestyle):**
> "A guy wearing a black hoodie."

**GOOD PROMPT — LIFESTYLE (L3):**
> "The product in the reference image is a Mike Tyson Merch black hoodie, size M. [FULL CONSTRAINT BLOCK AS ABOVE]. Do NOT alter the product.
>
> Scene: An Amsterdam coffeeshop interior at golden hour — warm afternoon light streaming through large street-facing windows. The hoodie is being worn by a real person: a man in his 30s, casual confident posture, slightly relaxed into the seat. He's holding a coffee cup, engaged in conversation, not posing. The 'TYSON' red text is clearly visible on his chest. The setting is lived-in and authentic — wooden tables, ambient chatter, the energy of a real Amsterdam spot. In the background: cannabis leaf iconography on wall art, a curated menu board, the texture of real urban culture. The hoodie looks completely natural in this context — it belongs here. The light is warm and flattering. Camera at eye level, slightly wide (35mm) to capture the environment and the person. Aspect fills the frame — the human and the setting tell the story together.
>
> Style: Urban streetwear editorial photography. Warm amber tones, golden hour warmth. Shot on Leica Q3 with 28mm Summilux at f/2 for environmental context and subject separation. 1:1 square, 1500×1500 px at 144 DPI. Authentic Amsterdam coffeeshop energy. No compromises."

---

## STEP 8 — RUN RETROSPECTIVE (mandatory after every run)

**Do NOT fix anything here. Document only. Ali reviews weekly.**

After every completed run, append one entry to:
`/home/alisionary/.openclaw/workspace/team/PHOILA_LISTING_RUNLOG.md`

Use this exact format:

```
---
## Run: [CLIENT] — [PRODUCT NAME]
Date: YYYY-MM-DD
Executor: [agent name]

### Failures
- [Module ID] [Module name] — [what failed and why]
- (none if all passed first attempt)

### Regenerations
- [Module ID] — regenerated [N] times — reason: [why first gen was rejected]
- (none if no regenerations)

### Underperforming Prompts
- [Module ID] — score: [X/10] — what was weak: [specific weakness]
- (none if all scored 8+)

### Issues to Fix
- [Issue description] — affects: [which module(s) or step] — severity: [P0/P1/P2]

### Mandatory Notes
- [Anything that would block future runs or degrade quality if not addressed]

### Recommended Fixes (for Ali's weekly review)
- [Module/Step]: [Exact change recommended] — rationale: [why]
```

**Rules:**
- Skip sections with "(none)" — don't delete them, mark them none
- Score any module that needed regeneration as underperforming regardless of final score
- Any P0 issue gets a mandatory note as well
- Do NOT update the pipeline SOP — that happens at the weekly review with Ali

---

## FILEPATH

Saved to: `/home/alisionary/.openclaw/workspace/team/PHOILA_LISTING_PIPELINE.md`

---

## CHANGELOG

| Date | Version | Change |
|------|---------|--------|
| 2026-05-25 | **v1.4** | **Deep research + precision prompting** — Step 3: expanded from "identical to A+" to explicit full checklist including 3.2.1 CTR thumbnail analysis, 3.2.2 review image mining, 3.2.3 sponsored ad creative analysis, 3.2.4 image sequence pattern (primary for Listing — defines gallery narrative arc), 3.2.5 objection mapping, 3.3.1 trigger-to-visual translation table, 3.5.1 competitor anti-pattern map. Step 5 template: added SCENE LAYERS (3-layer spec), COMPETITOR CONTRAST block, TRIGGER ACTIVATION declaration, PROP SPECIFICATION format; STYLE block extended with light & shadow spec; NEGATIVE PROMPT block added as 4th mandatory template block. |
| 2026-05-24 | **v1.3** | **Physical realism enforcement** — Fix A: dimensional anchor (Q3 dimensions + scale phrase) added to CONSTRAINT BLOCK; Step 1.5 note added. Fix B: CAMERA/LENS PRESETS table added (category-adaptive, research-backed); realism mandate (no CGI, authentic lens physics) added to STYLE block. Fix C: HUMAN COMPOSITE GATE section added — L2/L3/L11/L12 with human in frame route directly to composite, skip end-to-end AI; COMPOSITE FALLBACK TRIGGER updated with dual-trigger rule. |
| 2026-05-23 | **v1.2** | **Agent-agnostic + data collection** — Added Step 1.5 (Product Data Collection): Q1–Q12 structured intake sent to Ali before any generation. Updated workflow diagram to include Step 1.5. Replaced all "Claudius" references with "the executor" / "the agent". Runlog Executor field changed to [agent name]. |
| 2026-05-23 | **v1.1** | **Audit fixes** — Removed dead ratio parameter from run_with_retry. Raised CHECK 3 approval threshold from 5/10 to 7/10, clarified scoring scale. Added CHECK 4 AI artifact check. Added selection composition rule (must include lifestyle + detail). Defined APPROVE ALL default order. Fixed composite fallback: added center parameter (center=True for L1/L2, center=False for L3/L5/L9). Fixed Discord delivery score format (removed invalid 9/10). Added tmpfiles review-only clarification. |
| 2026-05-23 | **v1.0** | **Initial release** — 12-image Listing module library (L1–L12), category-adaptive, unified workflow with A+ pipeline, full Python generation code, quality gate, delivery structure, prompt examples |
