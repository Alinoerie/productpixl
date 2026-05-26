# PHOILA A+ CONTENT PIPELINE
## V5.6 — PHOILA SOPHISTICATED
### Universal Brief for the Executor — Any Amazon Product Category

---

## WHAT THIS IS

A repeatable, production-grade A+ content generation pipeline. Ali sends ONE product photo. The executor delivers a curated set of polished Amazon A+ visuals — one per A+ module — that match or exceed Pixii.ai quality.

The pipeline is **CATEGORY-AGNOSTIC**. It works for handcream, supplements, electronics, apparel, kitchenware, pet products, toys, books, automotive — anything Amazon sells.

**Quality standard: 8-10/10. 5/10 is not acceptable. Ever.**

---

## WHAT'S NEW IN V5.0

| | |
|--|--|
| **15 A+ Modules** | Full module library: 10 Standard + 5 Premium, each with dedicated Nano-Banana-Pro prompt |
| **Module Menu** | The executor selects from all 15 based on product/category analysis — no fixed set |
| **Amazon-Exact Specs** | All generations at exact Amazon DPI and dimensions (970×600, 970×300, 1500×600 @ 144 DPI) |
| **Lightweight QA** | 3-check quality gate — faster than v4's 7-point scorecard |
| **Copy deferred** | Text/copy layer deferred to v6. V5 focuses entirely on visual fidelity |
| **Variant strategy** | The executor decides per-module — critical modules get 2-3 variants, standard get 1 |
| **Filename convention** | `{BRAND}_{PRODUCTNAME}_M{MODULE_ID}_{MODULE_TYPE}.jpeg` — brand and product name always included |

---

## WHAT YOU NEED

- **Replicate API token:** `r8_YbA...tZcs`
- **Model:** `google/nano-banana-pro` (Pixii's engine — product-consistent image generation)
- **Fallback model:** `google/nano-banana-pro` with `allow_fallback_model: true` (falls back to Seedream-5)
- **Output specs:** Amazon A+ exact dimensions at 144 DPI (see Module Specs Table below)
- Any product image Ali provides
- Research skills: web search, browser, QMD knowledge base

---

## AMAZON A+ MODULE LIBRARY

### Standard A+ Modules

| ID | Module | Dimensions @ 144 DPI | Purpose |
|----|--------|---------------------|---------|
| M1 | Header with Text | 970 × 600 px | Brand hero — first impression, sets tone |
| M2 | Image + Text | 970 × 300 px | 50/50 split — image left, text right |
| M3 | Text + Image | 970 × 300 px | 50/50 split — text left, image right |
| M4 | Image Grid | 970 × 600 px | 3 or 4 column grid of images |
| M5 | Product Showcase | 970 × 600 px | Up to 6 products — image + title + bullet per item |
| M6 | Comparison Chart | 970 × 600 px | Side-by-side table comparing up to 5 products |
| M7 | Large Image + Text | 1500 × 600 px | Full-width image with text block overlaid |
| M8 | Technical Specifications | 970 × 300 px | Two-column table for specs |
| M9 | Hotspot Image | 970 × 600 px | Single image with interactive callout hotspots |
| M10 | Category Navigation | 970 × 300 px | Grid of subcategory thumbnails |

### Premium A+ Modules (Brand Registered)

| ID | Module | Dimensions @ 144 DPI | Purpose |
|----|--------|---------------------|---------|
| M11 | FAQ Module | 970 × 600 px | Expandable Q&A accordion |
| M12 | Video Module | 1500 × 600 px | Embedded video — static hero frame only |
| M13 | Shoppable Image | 1500 × 600 px | Lifestyle image with tappable product hotspots |
| M14 | A+ Card Carousel | 1500 × 600 px | Horizontal scrolling card stack |
| M15 | Shoppable Lookbook | 1500 × 600 px | Editorial-style shoppable image collection |

---

## THE 7-STEP PIPELINE

---

### STEP 1 — RECEIVE & VERIFY INPUT

Ali sends: 1 product image.

Verify you have:
- [ ] The product image file (check it actually opens)
- [ ] The Amazon product category (if Ali didn't specify, infer from the image)
- [ ] Any brand guidelines, color palettes, or style direction (ask if missing)
- [ ] Any competitor products Ali wants to differentiate from
- [ ] Amazon store brand (Standard A+) or Brand Registered (Premium A+) — this determines module eligibility

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

This step is the difference between generic outputs and stunning ones. **Spend real time here.**

**For EVERY product image, document ALL of the following:**

#### A. PRODUCT PHYSICALS
```
- Product type: (tube, jar, bottle, box, pouch, blister card, apparel, device, kit, bundle?)
- Estimated dimensions / proportions: (tall-thin? short-wide? flat? irregular?)
- Primary material: (glass, HDPE plastic, aluminum, steel, fabric, paperboard, silicone, bamboo?)
- Surface texture: (matte, glossy, soft-touch rubberized, ribbed, brushed metal, woven, smooth?)
- Primary color — be precise: (not "blue" — "deep cobalt blue #1B3A6B with a subtle satin sheen")
- Secondary color(s): (list every distinct color with hex codes where possible)
- Any surface decoration: (debossed logo? embossed pattern? etched text? printed gradient?)
```

#### B. TEXT ON PRODUCT — LITERAL TRANSCRIPTION
```
- Brand / company name exactly as spelled and capitalized:
- Product name exactly as printed:
- Subtitle / descriptor line:
- Tagline / positioning line:
- Ingredient list or technical specs (copy first 3 items exactly):
- Legal / warning text (copy first warning exactly):
- Any UPC, batch code, or manufacturing info:
- Font style — describe precisely: (serif / sans-serif / script / stencil / all-caps / mixed case?
  weight: light / regular / bold / black? width: condensed / normal / extended?
  any distinctive letterform features? e.g. "geometric sans with rounded terminals")
```

#### C. LABEL DESIGN
```
- Label shape: (full wraparound? front panel only? spot label? woven into packaging?)
- Label dimensions relative to product face: (40%? 80%? full?)
- Label background color and opacity: (white opaque? kraft? tinted clear?)
- Logo style: (wordmark only? icon only? combination? illustrated? minimalist line art?
  hand-drawn? geometric? vintage-typographic?)
- Logo placement on label: (top third? centered? bottom?)
- Any decorative borders or rules: (thin line? thick rule? double-line? ornamental?)
- Number of distinct colors on label: (1-color print? 2-color? full color process?)
- Barcode or QR code present: (yes/no, location)
- Label material finish: (paper matte? paper glossy? metallic foil stamp? soft-touch laminate?)
```

#### D. CAP / LID / CLOSURE
```
- Closure type: (flip-top cap, screw cap, pump dispenser, friction-fit lid, clip, zipper,
  velcro tab, snap closure, roll-on ball, dropper, spray trigger, push-pull cap?)
- Closure color and material: (white plastic? black metal? bamboo? cork? chrome?)
- Closure dimensions relative to container body: (same width? narrower? wider?)
- Any branding on closure itself: (embossed logo? printed text? none?)
- Tamper evident feature: (foil seal? shrink band? printed safety ring?)
```

#### E. PRODUCT PRESENTATION IN THE IMAGE
```
- Background: (pure white seamless? grey seamless? lifestyle setting? own branded backdrop?
  out of focus environmental? solid color — what color?)
- Lighting quality: (hard shadows / soft diffusion? professional studio / natural window /
  mixed? warm 3200K / neutral 4000K / cool 5600K / mixed?)
- Lighting direction: (flat front-lit? 45-degree side-lit? rim lit from behind? under-lit?)
- Product angle: (dead front-on? 15-degree off-axis? 3/4 view? overhead 90-degree?
  angled overhead 45-degree? side profile?)
- Product orientation in frame: (portrait? landscape? diagonal?)
- What else is in frame: (partial props visible? model's hand? shadow? reflection?)
- What's cut off or partially visible: (bottom of product cropped? cap partially cut?)
- Reflection or shadow cast: (reflection on surface below? cast shadow on backdrop?)
- Any dust, lint, air bubbles, or imperfections: (yes — note them so you know what to avoid)
```

#### F. MOOD, FEEL & POSITIONING
```
- 3 words that describe the vibe: (e.g. "clinical, precise, scientific" / "warm, artisanal, handcrafted")
- Price tier suggested by the packaging: (budget / mid-market / premium / luxury)
- Target customer demographic: (age range, gender, lifestyle, values — be specific)
- Retail context this belongs in: (high-end department store? health food shop? pharmacy?
  Amazon standard shelf? boutique specialist?)
- What does owning this product say about the buyer:
- What does this product NOT want to be associated with:
```

**Store all Step 2 findings — every prompt in Step 5 will be built from these exact observations.**

---

### STEP 3 — CATEGORY & COMPETITOR RESEARCH

Do this BEFORE writing a single prompt. Understand where this product sits in the competitive landscape.

**3.1 — Identify the Amazon subcategory tree**
```
Top-level: (e.g. Beauty & Personal Care)
  Mid-level: (e.g. Skin Care → Hand Creams)
  Sub-niche: (e.g. Natural / Organic Hand Creams)
```

**3.2 — Research top 5 competitor listings**
- Search: `[product type] Amazon best seller A+ content`
- Open 3-5 competitor listing pages in browser
- For each competitor, document:
  - What visual themes dominate their imagery?
  - What color palette do they use consistently?
  - What lifestyle scenarios do they show the product in?
  - What mood / tone does their copy use?
  - What is conspicuously ABSENT from their imagery?
- Compile dominant patterns across all competitors

**3.2.1 — CTR Thumbnail Analysis**
The main image is the only thing visible at 300×300px in Amazon search results. For each competitor, mentally crop to 200×200px and document:
```
THUMBNAIL ANALYSIS (200×200px mental crop):
- What is instantly recognizable at thumbnail scale?
- What color stands out against the white Amazon search background?
- Is there a dominant shape, silhouette, or pattern that stops the scroll?
- Does the hero image have implied motion or is it static?
- What % of the thumbnail is product vs negative space?
→ Output: What thumbnail composition pattern wins attention in this category?
```

**3.2.2 — Review Image Mining**
Open the top 50 customer reviews for the top 2-3 competitors. Buyers photograph what they actually care about — this is unfiltered purchase evidence:
```
BUYER PHOTO ANALYSIS — top 50 reviews:
- What features/angles do buyers photograph most?
- What do buyers show in their photos that the listing doesn't emphasize?
- What problem/benefit is visually demonstrated in 5-star review images?
- What failure mode appears in 1-2 star review images?
→ Output: Top 3 features buyers photograph — make these the hero of specific modules
```

**3.2.3 — Sponsored Ad Creative Analysis**
Search `[product type]` on Amazon. Top sponsored listings have tested their images against real paid traffic — their thumbnails are data-validated:
```
SPONSORED AD CREATIVE ANALYSIS:
- What image type are winning PPC ads using? (lifestyle / hero / infographic?)
- What is the thumbnail composition of the top 3 sponsored results?
- Is there a dominant visual pattern among sponsored vs organic top sellers?
→ Output: PPC-tested image pattern — prioritize this in M1/M7 decisions
```

**3.2.4 — Image Sequence Pattern** (critical for Listing pipeline — also informs A+ card narrative arc)
For the top 5 listings, document the full gallery image sequence order:
```
TOP SELLER IMAGE SEQUENCE ANALYSIS:
Seller 1: Image 1 = [type] | Image 2 = [type] | Image 3 = [type] | Image 4 = [type] | ...
Seller 2: Image 1 = [type] | Image 2 = [type] | Image 3 = [type] | Image 4 = [type] | ...
Seller 3: Image 1 = [type] | Image 2 = [type] | Image 3 = [type] | Image 4 = [type] | ...

DOMINANT SEQUENCE PATTERN in this category:
Position 1: [always white hero bg]
Position 2: [infographic / lifestyle / detail?]
Position 3: [...]
→ Output: Category sequence convention AND where to break it (the gap)
```
Buyers scan images in order. The sequence is a narrative arc. Generate modules informed by this arc — not just individual images.

**3.2.5 — Q&A + Negative Review Objection Mapping**
Extract top 3 buyer objections from the Q&A section and 1-2 star reviews. Map each to the visual that resolves it:
```
OBJECTION MAP:
Objection #1: "[verbatim buyer concern from reviews/Q&A]"
→ Visual that resolves this: [module ID + scene type]
  e.g. "will this fit my knee?" → L2/M8 size/scale module becomes critical

Objection #2: "[verbatim buyer concern]"
→ Visual that resolves this: [module ID + scene type]

Objection #3: "[verbatim buyer concern]"
→ Visual that resolves this: [module ID + scene type]
→ Rule: Each module selected in Step 4 must address at least one objection or emotional trigger
```

**3.3 — Identify emotional purchase triggers for this category**
- Search: `[category] emotional buying triggers` and `[category] customer pain points`
- What problem does this product solve that the buyer feels viscerally?
- What does owning this product signal to others about the buyer?
- What aspirational identity does the buyer want to inhabit?
- What is the #1 reason people in this category click "Add to Cart"?

**3.3.1 — Trigger-to-Visual Translation Table**
Map each identified emotional trigger to the exact visual element that activates it. This is the missing link between research and prompts:
```
TRIGGER TRANSLATION TABLE:
Trigger #1: [name — e.g. "fear of re-injury during activity"]
→ Visual element that activates this: [specific scene element]
→ Module best suited: [module ID + brief scene description]
→ Camera framing: [e.g. "tight on hinge joint at peak compression — showing mechanical stability at moment of maximum stress"]

Trigger #2: [name — e.g. "desire to return to sport"]
→ Visual element: [specific scene element, e.g. "gym environment, barbell in bg, athletic kit on floor"]
→ Module best suited: [module ID]
→ Camera framing: [e.g. "wide environmental — product is part of the athlete's world, not isolated"]

Trigger #3: [name]
→ Visual element: [specific scene element]
→ Module best suited: [module ID]
→ Camera framing: [describe]
```
Every scene prompt in Step 5 MUST declare which trigger it activates and via which visual element (see TRIGGER ACTIVATION block in the Step 5 template).

**3.4 — Define the positioning gap**
```
Competitor visual patterns dominant in this category:
1.
2.
3.

What is conspicuously ABSENT from competitor imagery:
1.
2.

Our creative territory — unclaimed by competitors:
1.
```

**3.5 — Document category intelligence**
```
CATEGORY INTELLIGENCE BRIEF:
- Amazon subcategory:
- Top 3 competitor visual themes:
- Category dominant color palette:
- Category dominant mood/tone:
- PPC-tested thumbnail pattern (from 3.2.3):
- Top 3 buyer-photographed features (from 3.2.2):
- Top 3 buyer objections from reviews (from 3.2.5):
- Image sequence pattern (from 3.2.4):
- #1 emotional purchase trigger:
- #2 emotional purchase trigger:
- #3 emotional purchase trigger:
- Trigger-to-visual translation (from 3.3.1):
- Positioning gap we've identified:
- Our creative angle (specific and ownable):
```

**3.5.1 — Competitor Visual Anti-Pattern Map**
Mandatory "what NOT to do" list — not just what's absent but what's cliché and overused:
```
ANTI-PATTERN MAP — DO NOT reproduce these in any module:
Cliché #1: [exact visual element — e.g. "smiling model in gym gear with product on plain studio backdrop"]
Cliché #2: [exact visual element — e.g. "product floating with blue gradient background"]
Cliché #3: [exact visual element — e.g. "before/after split image with red/green arrows"]

→ Every scene prompt in Step 5 must include the COMPETITOR CONTRAST block:
   "This scene must be visually distinct from [cliché]. Specifically DO NOT include: [exact element].
   DO include instead: [specific differentiator from positioning gap above]."
```

---

### STEP 4 — SELECT MODULES & VISUAL FRAMEWORK

This is where V5.0 differs from prior versions. Instead of fixing a set of 7 visuals, the executor selects from all 15 A+ modules based on what's appropriate for this product and category.

**RULE: Always include M1 (Header). Always include at least one lifestyle/atmospheric module.**

**MODULE COUNT RULE:** Select minimum 6 modules, maximum 12 per run. Fewer than 6 produces insufficient brand depth. More than 12 rarely adds value and creates scope creep.

**Step 4a — Select applicable modules from the 15-module library**

For this product, document which modules make sense:
```
MODULE SELECTION:
M1 Header with Text: [YES/NO] — WHY: [reason]
M2 Image + Text: [YES/NO] — WHY: [reason]
M3 Text + Image: [YES/NO] — WHY: [reason]
M4 Image Grid: [YES/NO] — WHY: [reason]
M5 Product Showcase: [YES/NO] — WHY: [reason]
M6 Comparison Chart: [YES/NO] — WHY: [reason]
M7 Large Image + Text: [YES/NO] — WHY: [reason]
M8 Technical Specifications: [YES/NO] — WHY: [reason]
M9 Hotspot Image: [YES/NO] — WHY: [reason]
M10 Category Navigation: [YES/NO] — WHY: [reason]
M11 FAQ Module: [YES/NO] — WHY: [reason]
M12 Video Module: [YES/NO] — WHY: [reason]
M13 Shoppable Image: [YES/NO] — WHY: [reason]
M14 Card Carousel: [YES/NO] — WHY: [reason]
M15 Shoppable Lookbook: [YES/NO] — WHY: [reason]

Total selected: [N] modules
```

**Step 4b — Assign visual types to each selected module**

Each module needs a visual type. Choose from the complete visual type menu:

| # | Visual Type | Best For |
|---|-------------|----------|
| 1 | **HERO / MAIN** | All products | Clean product isolation — the Amazon main image |
| 2 | **BRAND STORY ATMOSPHERE** | All products | Dark, moody, editorial — brand as art |
| 3 | **FLATLAY** | Small/packaged goods, food, supplements, accessories | Arranged collection, curated context |
| 4 | **LIFESTYLE IN-USE** | All products | Human connection, product being applied/used |
| 5 | **LIFESTYLE EXTREME** | All products | Product in an aspirational, storybook scenario |
| 6 | **SCALE / SIZE** | Everything | Size reference with familiar objects |
| 7 | **SINK / VANITY** | Beauty, personal care, dental | Daily ritual context at point of use |
| 8 | **KITCHEN / WORKSPACE** | Food, cookware, tools, office | Product in its natural usage environment |
| 9 | **GADGET / TECH DETAIL** | Electronics, devices, tools | Design refinement, ports, switches, materials |
| 10 | **APPAREL / FIT** | Clothing, shoes, accessories | Garment detail, fabric drape, fit on body |
| 11 | **MODEL / PORTRAIT** | Apparel, cosmetics, accessories | Human form as canvas for the product |
| 12 | **TEXTURE / MACRO** | All products | Formula, material, surface quality extreme close-up |
| 13 | **INGREDIENTS / PROCESS** | Food, skincare, supplements | What's inside, where it comes from, how it's made |
| 14 | **PACKAGING / UNBOXING** | All products | What arrives at the door, presentation, inclusion |
| 15 | **BEFORE / AFTER** | Beauty, supplements, cleaning, automotive | Transformation, proof of efficacy |
| 16 | **COMPARISON / ANATOMY** | Electronics, tools, toys | Internal/external detail, exploded view, components |
| 17 | **LIFESTYLE DETAIL** | All products | A single meaningful object in a larger beautiful scene |
| 18 | **SEASONAL / CAMPAIGN** | All products | Themed environment (holiday, summer, fitness, etc.) |
| 19 | **TESTIMONIAL / SOCIAL PROOF** | All products | Stylized customer moment, reviewer as hero |
| 20 | **INFOGRAPHIC** | All products | Data visualization on-product or adjacent |
| 21 | **BESTSELLER / AWARD** | All products | Badge, seal, or proof of recognition in scene |
| 22 | **GIFT / GIVING** | All products | Product as the moment of gifting |
| 23 | **STACK / COLLECTION** | All products | Multiple units, variety pack, full line context |
| 24 | **WILDLIFE / ENVIRONMENTAL** | Pet, food, sustainability brands | Product in its natural ecological context |

Document the full assignment:
```
VISUAL FRAMEWORK:
M1 Header with Text → [VISUAL TYPE] — WHY: [specific reason]
M2 Image + Text → [VISUAL TYPE] — WHY: [specific reason]
[M4 Image Grid] → [VISUAL TYPE] — WHY: [specific reason]
...etc for all selected modules
```

**Step 4c — Decide variant strategy per module**

For each selected module, decide if it needs variants:
```
VARIANT STRATEGY:
M1 Header: [1 shot / 2 variants / 3 variants] — WHY: [if 2-3, why critical]
M2 Image+Text: [1 shot / 2 variants / 3 variants]
...etc
```

Rule: Modules that are category-critical (e.g. M6 Comparison Chart for a competitive category, M7 Large Image for a luxury product) should get 2-3 variants. Standard informational modules (M8 Technical Specs, M10 Category Nav) typically need only 1.

**M14 CARD COUNT DECISION (if M14 is selected):**
Decide number of cards in the carousel: minimum 3, recommended 4–5, maximum 6.
Document here:
```
M14 Card Carousel: [N] cards — WHY: [narrative arc justification]
Card narrative arc:
  Card 1: [theme]
  Card 2: [theme]
  Card 3: [theme]
  Card N: [theme]
CONSISTENCY RULE: All cards in a set must share the same lighting temperature,
color grading, and product positioning angle.
Update VARIANT_STRATEGY and module_configs card count to match.
```

---

### STEP 5 — CRAFT MODULE-SPECIFIC PROMPTS

This is the most critical step. Each prompt is built from Step 2 observations and Step 3 intelligence, and is tailored to the specific A+ module type (M1-M15).

**THE UNIVERSAL PROMPT TEMPLATE — USE THIS EXACT STRUCTURE:**

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

[SCENE BLOCK — specific to this module type AND grounded in Step 3 findings]
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
[CATEGORY-SPECIFIC RENDER STANDARD — e.g. 'Luxury skincare campaign photography',
'Premium athletic wear editorial', 'Professional culinary photography'].
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
Aspect ratio: [EXACTLY MATCH THE MODULE SPEC — 970×600 @ 144 DPI = ~2.39:1,
970×300 @ 144 DPI = ~3.23:1, 1500×600 @ 144 DPI = exactly 2.5:1].
Amazon A+ module standard. No compromises."

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
- Flat lay, overhead, still life, product-on-surface
- Macro / texture close-ups
- Atmospheric brand shots (product as accent or absent)
- Comparison: both products isolated as objects

**SCALE-CRITICAL** — Mandatory composite workflow. Do NOT attempt end-to-end AI:
- Any module with human hand holding the product
- Any module with model wearing or holding the product
- Any module showing product at body scale for size reference

**Flagged A+ modules:**
| Module | Scale-Critical When |
|--------|---------------------|
| M3 Text+Image | Hand applying or holding product |
| M7 Large Image | Hand in frame for scale reference |
| M12 Video hero | Product in active hand use |
| M13 Shoppable | Model with product |
| M15 Lookbook | Human body in frame |

**Rule:** For SCALE-CRITICAL modules, skip end-to-end AI and go directly to COMPOSITE FALLBACK — this is the correct path, not a failure path. Current AI models cannot reliably enforce physical dimensions when human anatomy is the dominant scale reference in frame.

---

## MODULE-SPECIFIC PROMPT GUIDANCE (M1–M15)

### M1 — Header with Text
**Purpose:** Brand hero — first impression, sets tone.
**Specs:** 970 × 600 px @ 144 DPI
**Visual direction:** Clean, aspirational, brand-defining. This is the first thing a shopper sees.
```
Scene direction: Aspirational brand story setting — the visual should communicate the
brand's reason for being in one image. E.g. for natural skincare: a sunlit Mediterranean
terrace with ancient olive trees visible in soft morning haze. For tech: a sleek
workspace at dawn with the product as the protagonist. The background should suggest the
lifestyle the buyer wants to inhabit.
Lighting: [brand-appropriate — warm golden hour for natural/luxury, clean neutral for tech]
```
**Nano-Banana-Pro ratio:** 3:2 | **Resolution:** 2K

---

### M2 — Image + Text
**Purpose:** Feature callout — show product with a key benefit visually demonstrated.
**Specs:** 970 × 300 px @ 144 DPI
**Visual direction:** 50/50 split. Image side carries the visual proof; text side (filled by Seller Central) explains the benefit.
```
Scene direction: ONE specific benefit shown visually — the most compelling claim the
product makes. E.g. for handcream: dry cracked hands restored to smooth skin. For a
charger: ultra-fast charging shown with a battery percentage jumping. The product should
be prominent in the image portion. Lighting should flatter the product and the benefit claim.
```
**Nano-Banana-Pro ratio:** 16:9 (generate) → crop to 970×300 | **Resolution:** 2K

---

### M3 — Text + Image (mirror of M2)
**Purpose:** Benefit claim with visual proof — flipped layout.
**Specs:** 970 × 300 px @ 144 DPI
**Visual direction:** Same as M2 but image is on the right side. Use the same scene but consider a slightly different angle or crop that works better right-aligned.
```
Scene direction: The benefit visual — identical quality bar as M2.
```
**Nano-Banana-Pro ratio:** 16:9 (generate) → crop to 970×300 | **Resolution:** 2K

---

### M4 — Image Grid
**Purpose:** Visual depth — multiple angles, vignettes, or related images in a cohesive grid.
**Specs:** 970 × 600 px @ 144 DPI
**Visual direction:** Grid of 3 or 4 cells. Each cell should feel like a different chapter of the brand story — product detail, ingredient close-up, lifestyle moment, packaging shot. Cohesive lighting temperature across all cells.
```
Scene direction: A grid of 4 vignettes — (1) product isolated on [surface], (2) [close-up
of texture/ingredient], (3) [lifestyle context], (4) [detail shot of packaging].
Each cell should feel cohesive as a set — same lighting temperature, same brand palette.
Clean grid layout with consistent proportions per cell.
```
**Nano-Banana-Pro ratio:** 3:2 | **Resolution:** 2K

---

### M5 — Product Showcase
**Purpose:** Line extension — show related products or multiple units in context.
**Specs:** 970 × 600 px @ 144 DPI
**Visual direction:** Multiple units arranged in a composed still-life. Think of it as a flatlay but with a single product type repeated or in a line extension. Surface is critical here — it sets the brand context.
```
Scene direction: Arrange [3-6] units of the product on [relevant surface — marble shelf,
linen cloth, wooden tray, slate board] in a composed still-life. Lighting: soft and even,
north window or diffused studio. Each unit clearly visible and properly spaced.
Background should complement not compete.
```
**Nano-Banana-Pro ratio:** 3:2 | **Resolution:** 2K

---

### M6 — Comparison Chart
**Purpose:** Competitive differentiation — why this product wins over alternatives.
**Specs:** 970 × 600 px @ 144 DPI
**Visual direction:** The product is clearly positioned as the hero on one side. Other products or a comparison context sits in supporting position. Visual hierarchy must immediately communicate "this is the winner."
```
Scene direction: The hero product on the left, clearly lit and dominant. A comparison
context on the right — either direct competitor products alongside, or a visual that
reinforces the "before/without" scenario. E.g. for supplements: the bottle alongside
a clean lifestyle meal. For tech: the device alongside a professional workstation.
Surface: clean, neutral, category-appropriate.
```
**Nano-Banana-Pro ratio:** 3:2 | **Resolution:** 2K

---

### M7 — Large Image + Text
**Purpose:** Hero moment — full-width atmospheric impact with text overlay potential.
**Specs:** 1500 × 600 px @ 144 DPI
**Visual direction:** The most aspirational context for this product. The moment the buyer wants to inhabit when they purchase. The image should have enough negative space or clean area for copy text to sit without obscuring key visual elements. Text will be live Seller Central copy (v6 will address baked-in text).
```
Scene direction: The most aspirational scenario the brand can claim — not what competitors
are doing. E.g. for handcream: hands resting on a sun-warmed stone balcony overlooking
the sea, olive groves in the distance. For protein powder: a post-workout athlete in a
beautiful gym with natural light, the product visible. Leave [right third] of the frame
relatively clear for text overlay potential.
Lighting: Specific and dramatic — e.g. 'golden hour Rembrandt from upper left,
soft fill right, rim light from behind catching product edges'
```
**Nano-Banana-Pro ratio:** 21:9 (generate) → resize to 1500×600 | **Resolution:** 2K or 4K

---

### M8 — Technical Specifications
**Purpose:** Functional credibility — ingredients, dimensions, materials.
**Specs:** 970 × 300 px @ 144 DPI
**Visual direction:** Clean, clinical, highly legible. The product should be shown in a way that communicates precision and trustworthiness. This is where specs and ingredients get a visual stamp of authority.
```
Scene direction: The product shown flat or slightly angled on [neutral white/slate surface],
all packaging details clearly legible. Consider including the label/ingredient list visible
as a supporting element. Style: clean, clinical, premium pharmacy or laboratory aesthetic.
Color reproduction must be exact — this is a trust signal.
```
**Nano-Banana-Pro ratio:** 16:9 (generate) → crop to 970×300 | **Resolution:** 2K

---

### M9 — Hotspot Image
**Purpose:** Educational — explain features directly on the product image via interactive hotspots.
**Specs:** 970 × 600 px @ 144 DPI
**Visual direction:** Clean, well-lit single product shot — front-facing or 3/4 angle. The product must have enough surrounding space for hotspot callout labels to be clearly readable. Background should be plain or very subtly environmental — never busy.
```
Scene direction: The product isolated or on a plain neutral surface, shot from the angle
that best shows the features you want to highlight with hotspots. E.g. for a bottle:
front-facing to show pump mechanism and label. The background should be infinity cove
or very shallow depth-of-field environmental. No competing visual elements.
```
**Nano-Banana-Pro ratio:** 3:2 | **Resolution:** 2K

---

### M10 — Category Navigation
**Purpose:** Cross-sell — guide buyers to related subcategories.
**Specs:** 970 × 300 px @ 144 DPI
**Visual direction:** The product shown in its natural use environment, with enough context to suggest related categories. Think "the lifestyle this product belongs to" — if someone buys this, what else do they need?
```
Scene direction: The product in its natural use environment with complementary context.
E.g. for handcream: bathroom shelf with the product alongside a premium hand towel and
olive oil lotion. For a phone case: the phone in use alongside earbuds and a laptop.
Aspirational but relatable — the shopper should think "I need that too."
```
**Nano-Banana-Pro ratio:** 16:9 (generate) → crop to 970×300 | **Resolution:** 2K

---

### M11 — FAQ Module
**Purpose:** Answer common objections — text-only, no image generation needed for the FAQ itself.
**Visual direction:** Generate a supporting image using the scene direction below.

Scene direction: A macro image that communicates ingredient transparency and trust.
The visual should feel like "proof behind the answers." Generate a macro shot of:
— the primary active ingredient in its raw or processed form (e.g. a glass dish of
  the active compound, backlit to reveal its quality and purity)
— OR a texture/surface shot of the product that communicates quality (formula pour,
  granule detail, capsule cross-section)
Lighting: backlit or side-lit to reveal depth, jewel-like quality.
Background: very dark or very light — no competing elements.
The image should communicate transparency and quality without any text.
This is the visual trust signal that backs up the FAQ text answers.

**Nano-Banana-Pro ratio:** 3:2 | **Resolution:** 2K

---

### M12 — Video Module
**Purpose:** Embedded video with auto-play. V5 generates a static hero frame only.
**Specs:** 1500 × 600 px @ 144 DPI
**Visual direction:** The most compelling single frame from what would be a video. Think "the thumbnail that makes you click play." The product should be prominent and the mood should suggest movement and benefit.
```
Scene direction: The product mid-action or in the most impactful moment of its use case.
E.g. for handcream: hands in the motion of applying, formula visible on skin. For a
blender: ingredients mid-blend, contents swirling. A single frame that tells the whole story.
Lighting should be dynamic — suggest action, not static stillness.
```
**Nano-Banana-Pro ratio:** 21:9 (generate) → resize to 1500×600 | **Resolution:** 2K or 4K

---

### M13 — Shoppable Image
**Purpose:** Interactive lifestyle — tappable hotspots link to products.
**Specs:** 1500 × 600 px @ 144 DPI
**Visual direction:** Rich lifestyle context where the product feels completely at home. Aspirational but relatable. The setting must have enough visual complexity and clear focal points for multiple hotspot placements. No clutter — clean enough for hotspots to be readable.
```
Scene direction: The product in a full lifestyle scene — not just the product on a
surface. E.g. for handcream: a beautifully styled bedroom nightstand with the product,
a book, a small vase of flowers, soft morning light. For a kitchen gadget: a chef's
counter during active cooking, the product in use, ingredients visible. The entire
scene should feel curated and intentional.
```
**Nano-Banana-Pro ratio:** 21:9 (generate) → resize to 1500×600 | **Resolution:** 2K

---

### M14 — Card Carousel
**Purpose:** Horizontal scrolling story — each card is a chapter.
**Note:** Each card is a SEPARATE generation. Design the narrative across the carousel. Card count is decided in Step 4c.
**Specs:** 1500 × 600 px @ 144 DPI per card
**Visual direction:** Plan a narrative arc across the cards:
```
Card 1: Hero / Brand moment (use M1 prompt guidance)
Card 2: Key benefit #1 (use M2 prompt guidance)
Card 3: Key benefit #2 (use M2, different benefit)
Card 4: Lifestyle / use case (use M4 or M13 guidance)
Card 5: Ingredient / quality close-up (use M12 texture guidance)
```
Each card should be self-contained but visually coherent as a set — same lighting temperature, same color grading, same aspect ratio.
**Nano-Banana-Pro ratio:** 21:9 (generate) → resize to 1500×600 | **Resolution:** 2K

---

### M15 — Shoppable Lookbook
**Purpose:** Editorial commerce — aspirational editorial spread with embedded product links.
**Specs:** 1500 × 600 px @ 144 DPI
**Visual direction:** The most cinematic, editorial-quality image in the entire set. Think high-fashion magazine meets product photography. This is where the brand shows what it's capable of.
```
Scene direction: A cinematic lookbook sequence compressed into one frame — establishing
context (wide shot), product reveal (medium), sensory close-up (texture/ingredient),
human moment (hands or body in frame). The narrative should flow: setting → product →
sensory detail → aspirational payoff. This should look like it belongs in a premium
lifestyle magazine. Lighting: cohesive throughout, dramatic but controlled.
```
**Nano-Banana-Pro ratio:** 21:9 (generate) → resize to 1500×600 | **Resolution:** 2K or 4K

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
# Supports both plain tokens and null-padded tokens (file may contain embedded nulls)
creds_path = Path('/home/alisionary/.openclaw/workspace/credentials/replicate-api.md')
token = None
if creds_path.exists():
    with open(creds_path, 'rb') as f:
        data = f.read()
    for line in data.split(b'\n'):
        if line.startswith(b'r8_'):
            # Read as latin-1 to preserve embedded null bytes if any
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

# Validate URL is actually an image (tmpfiles.org page URLs return HTML, not image)
r = requests.head(input_url, timeout=10)
assert r.status_code == 200 and 'image' in r.headers.get('content-type', ''), \
    f"URL is not an image! Got {r.status_code} {r.headers.get('content-type')}. Use /dl/ URL."
print(f"Image URL OK: {r.headers.get('content-type')}")

output_dir = Path(f'/home/alisionary/.openclaw/workspace/projects/Active Projects/phoila/clients/{client_name}/APLUS_V50')
output_dir.mkdir(parents=True, exist_ok=True)

# VARIANT_STRATEGY — define from Step 4c decisions
# Key = cfg['key'], Value = number of variants (1, 2, or 3)
# Only include modules selected in Step 4a — omitted keys are skipped
VARIANT_STRATEGY = {
    'M01_header':     2,  # critical — always 2 variants
    'M02_image_text': 1,
    'M03_text_image': 1,
    'M04_grid':       1,
    'M06_comparison': 1,
    'M07_large':      2,  # critical — 2 variants
    'M08_specs':      1,
    'M09_hotspot':    1,
    'M11_faq':        1,
    'M12_video':      1,
    'M14_card1':      1,
    'M14_card2':      1,
    'M14_card3':      1,
    'M14_card4':      1,
}

# Module configs — the executor fills prompts from Step 5
# Ratio notes:
#   970×600 → use 3:2 (closest NBP-supported ratio; PIL verify post-gen)
#   970×300 → use 16:9 (3:1 unsupported) → center-crop height to 300px post-gen
#   1500×600 → use 21:9 (5:2 unsupported) → resize to 1500×600 post-gen
# Resolution: use 2K for most, 4K for 1500×600 large modules (M12/M13/M14/M15)
module_configs = [
    {'key': 'M01_header',     'module': 'M01', 'type': 'header',     'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 600, 'ratio': '3:2',  'crop': False, 'res': '2K'},
    {'key': 'M02_image_text', 'module': 'M02', 'type': 'image_text', 'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 300, 'ratio': '16:9', 'crop': True,  'res': '2K'},
    {'key': 'M03_text_image', 'module': 'M03', 'type': 'text_image', 'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 300, 'ratio': '16:9', 'crop': True,  'res': '2K'},
    {'key': 'M04_grid',       'module': 'M04', 'type': 'grid',       'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 600, 'ratio': '3:2',  'crop': False, 'res': '2K'},
    {'key': 'M05_showcase',   'module': 'M05', 'type': 'showcase',   'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 600, 'ratio': '3:2',  'crop': False, 'res': '2K'},
    {'key': 'M06_comparison', 'module': 'M06', 'type': 'comparison', 'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 600, 'ratio': '3:2',  'crop': False, 'res': '2K'},
    {'key': 'M07_large',      'module': 'M07', 'type': 'large',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    {'key': 'M08_specs',      'module': 'M08', 'type': 'specs',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 300, 'ratio': '16:9', 'crop': True,  'res': '2K'},
    {'key': 'M09_hotspot',    'module': 'M09', 'type': 'hotspot',    'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 600, 'ratio': '3:2',  'crop': False, 'res': '2K'},
    {'key': 'M10_category',   'module': 'M10', 'type': 'category',   'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 300, 'ratio': '16:9', 'crop': True,  'res': '2K'},
    {'key': 'M11_faq',        'module': 'M11', 'type': 'faq',        'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 970,  'h': 600, 'ratio': '3:2',  'crop': False, 'res': '2K'},
    {'key': 'M12_video',      'module': 'M12', 'type': 'video',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    {'key': 'M13_shoppable',  'module': 'M13', 'type': 'shoppable',  'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    # M14 Card Carousel — one entry per card (adjust card count to Step 4c decision)
    {'key': 'M14_card1',      'module': 'M14', 'type': 'card1',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    {'key': 'M14_card2',      'module': 'M14', 'type': 'card2',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    {'key': 'M14_card3',      'module': 'M14', 'type': 'card3',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    {'key': 'M14_card4',      'module': 'M14', 'type': 'card4',      'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
    {'key': 'M15_lookbook',   'module': 'M15', 'type': 'lookbook',   'prompt': '<FULL PROMPT FROM STEP 5>', 'w': 1500, 'h': 600, 'ratio': '21:9', 'crop': False, 'res': '4K'},
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
                    'aspect_ratio': cfg['ratio'],
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

        # Post-process to exact Amazon dimensions
        img = Image.open(raw_path)
        if cfg['crop']:
            # Center-crop height to target (for 16:9→970×300 modules)
            src_w, src_h = img.size
            scale = cfg['w'] / src_w
            img = img.resize((cfg['w'], int(src_h * scale)), Image.LANCZOS)
            src_w, src_h = img.size
            top = (src_h - cfg['h']) // 2
            img = img.crop((0, top, cfg['w'], top + cfg['h']))
        if img.size != (cfg['w'], cfg['h']):
            img = img.resize((cfg['w'], cfg['h']), Image.LANCZOS)

        final_path = output_dir / f"{base_name}.jpeg"
        img.save(str(final_path), 'JPEG', quality=95)
        raw_path.unlink()
        elapsed = time.time() - t0
        print(f"  Saved: {final_path} — {img.size} ({elapsed:.0f}s)")

        # Rate limit: 6 req/min on NBP — wait 12s between each generation
        time.sleep(12)
```

**Run each separately.** 28-60 seconds each. Never in parallel batch — timeouts kill quality and you lose visibility into per-visual issues. With rate-limit handling the full run takes ~30 min for 18 modules.

**6.3 — Verify dimensions post-generation**

After downloading each image, verify pixel dimensions:
```python
from PIL import Image
img = Image.open('output/M1_header.jpeg')
print(f"{img.size} — expected {cfg['w']}x{cfg['h']}")
# If wrong, resize with LANCZOS and save at exact dimensions
if img.size != (cfg['w'], cfg['h']):
    img = img.resize((cfg['w'], cfg['h']), Image.LANCZOS)
    img.save(f"output/{cfg['key']}_exact.jpeg", quality=95)
```

---

## STEP 7 — QUALITY GATE & DELIVERY

**Quality standard: 8-10/10. 7/10 is the production-ready minimum. 6/10 is not acceptable. Ever.**

### THE 4-CHECK QUALITY GATE

Faster than v4's 7-point scorecard. Apply to every image:

```
VISUAL: [name]
OUTPUT URL: [replicate delivery URL]

CHECK 1 — PRODUCT FIDELITY
Q: Is the brand name, product name, and all label text IDENTICAL to Step 2 transcription?
   Every letter, same font, same case, same position.
   Score: [10/10] [7/10 — minor shift] [FAIL — text wrong, missing, or corrupted]
   Action if FAIL: Composite fallback

CHECK 2 — SCENE APPROPRIATENESS
Q: Does the scene match the intended visual type AND module purpose from Step 4?
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

---

### COMPOSITE FALLBACK TRIGGER

**Two triggers — composite on EITHER condition:**

1. **Quality failure:** Nano-Banana-Pro fails product fidelity after **2 attempts** — do not waste a third attempt
2. **Scale-critical scene:** Module is flagged SCALE-CRITICAL (see HUMAN COMPOSITE GATE) — route directly to composite on the **first attempt**, do not attempt end-to-end AI generation

Execute composite:

1. Generate the SCENE without the product reference (remove `image_input`)
2. Download the generated scene
3. Use the original product image as a layer on top:
```python
# pip install rembg pillow
import subprocess
from PIL import Image

def composite_product_on_scene(product_path, scene_path, output_path, target_w, target_h, center=True):
    subprocess.run(['rembg', 'i', product_path, '/tmp/product_nobg.png'], check=True)
    scene = Image.open(scene_path).convert('RGBA').resize((target_w, target_h), Image.LANCZOS)
    product = Image.open('/tmp/product_nobg.png').convert('RGBA')
    ph = int(target_h * 0.7)
    pw = int(product.width * (ph / product.height))
    product = product.resize((pw, ph), Image.LANCZOS)
    if center:
        x = (target_w - pw) // 2
    else:
        x = int(target_w * 0.55) - pw // 2  # right of center — leaves left zone for text overlay (M7, M12)
    y = (target_h - ph) // 2
    scene.paste(product, (x, y), product)
    scene.convert('RGB').save(output_path, 'JPEG', quality=95)
    print(f"Composite saved: {output_path}")
# Usage: center=True for M1/M4/M6/M9 (product dominant). center=False for M7/M12/M13/M14/M15 (text overlay zone needed).
```
4. Deliver the composite — this guarantees 100% product fidelity

---

### DELIVERY STRUCTURE

Filename format: `{BRAND}_{PRODUCTNAME}_M{MODULE_ID}_{MODULE_TYPE}.jpeg`
Example: `ZealotsOfNature_Handcream_M01_header_with_text_v2.jpeg`

```
/home/alisionary/.openclaw/workspace/projects/Active Projects/phoila/clients/<CLIENT_NAME>/
├── ZealotsOfNature_Handcream_M01_header_with_text.jpeg      # or _v2.jpeg if variants generated
├── ZealotsOfNature_Handcream_M01_header_with_text_v2.jpeg
├── ZealotsOfNature_Handcream_M02_image_plus_text.jpeg
├── ZealotsOfNature_Handcream_M03_text_plus_image.jpeg
├── ZealotsOfNature_Handcream_M04_image_grid.jpeg
├── ZealotsOfNature_Handcream_M05_product_showcase.jpeg
├── ZealotsOfNature_Handcream_M06_comparison_chart.jpeg
├── ZealotsOfNature_Handcream_M07_large_image_text.jpeg
├── ZealotsOfNature_Handcream_M08_technical_specs.jpeg
├── ZealotsOfNature_Handcream_M09_hotspot_image.jpeg
├── ZealotsOfNature_Handcream_M10_category_nav.jpeg
├── ZealotsOfNature_Handcream_M11_faq_visual.jpeg
├── ZealotsOfNature_Handcream_M12_video_hero_frame.jpeg
├── ZealotsOfNature_Handcream_M13_shoppable_image.jpeg
├── ZealotsOfNature_Handcream_M14_card_01_carousel.jpeg
├── ZealotsOfNature_Handcream_M14_card_02_carousel.jpeg
├── ZealotsOfNature_Handcream_M15_shoppable_lookbook.jpeg
├── research/
│   ├── step2_image_analysis.md       # Step 2 findings — internal only
│   ├── step3_category_research.md    # Step 3 intelligence brief — internal only
│   └── step4_module_selection.md      # Steps 4a/4b/4c — module selection + rationale
├── prompts/
│   └── all_prompts.md                # All generated prompts verbatim
├── qa_scores.md                      # 4-check gate results per image
└── composite_fallbacks/              # Any images that needed composite treatment
    └── [composited images]
```

**Research docs (Steps 2-4) are INTERNAL — not delivered to client. Only the image assets and the QA scores are delivered.**

**Upload and deliver:**
- Upload all generated images to tmpfiles.org
- Share links in Discord with the quality score summary per module:
  `M1 Header [8/10] APPROVE | M2 Image+Text [8/10] APPROVE | M4 Grid [FAIL] COMPOSITED`
- Tag the output as v5.3 Phoila Sophisticated
- (tmpfiles.org links are for Discord review and approval only — 60-min TTL. Permanent assets are the local JPEG files in the client folder. Always share local file paths alongside tmpfiles links for client handoff.)

---

## QUICK REFERENCE: NANO BANANA PRO API

```python
client.run('google/nano-banana-pro', input={
    'prompt': '...',
    'image_input': ['https://...'],   # 1-14 reference images
    'aspect_ratio': '1:1',           # 1:1, 3:4, 9:16, 16:9, 21:9, 4:3, 3:2 — NOTE: 3:1 and 5:2 NOT supported
    'resolution': '2K',              # 1K, 2K, 4K — 2K for production
    'allow_fallback_model': True,     # falls back to Seedream-5 if NBP fails
})
```

---

## AMAZON A+ MODULE SPECS QUICK REFERENCE

| Module | Pixel Dimensions | Aspect Ratio | NBP Generation Ratio | Post-Process | DPI |
|--------|----------------|--------------|----------------------|--------------|-----|
| M1 Header | 970 × 600 | 1.617:1 | 3:2 | — | 144 |
| M2 Image+Text | 970 × 300 | 3.233:1 | **16:9** (3:1 unsupported) | crop to 970×300 | 144 |
| M3 Text+Image | 970 × 300 | 3.233:1 | **16:9** (3:1 unsupported) | crop to 970×300 | 144 |
| M4 Image Grid | 970 × 600 | 1.617:1 | 3:2 | — | 144 |
| M5 Showcase | 970 × 600 | 1.617:1 | 3:2 | — | 144 |
| M6 Comparison | 970 × 600 | 1.617:1 | 3:2 | — | 144 |
| **M7 Large** | **1500 × 600** | **2.5:1** | **21:9** (5:2 unsupported) | resize to 1500×600 | 144 |
| M8 Tech Specs | 970 × 300 | 3.233:1 | **16:9** (3:1 unsupported) | crop to 970×300 | 144 |
| M9 Hotspot | 970 × 600 | 1.617:1 | 3:2 | — | 144 |
| M10 Category Nav | 970 × 300 | 3.233:1 | **16:9** (3:1 unsupported) | crop to 970×300 | 144 |
| M11 FAQ Visual | 970 × 600 | 1.617:1 | 3:2 | — | 144 |
| **M12 Video** | **1500 × 600** | **2.5:1** | **21:9** (5:2 unsupported) | resize to 1500×600 | 144 |
| **M13 Shoppable** | **1500 × 600** | **2.5:1** | **21:9** (5:2 unsupported) | resize to 1500×600 | 144 |
| **M14 Carousel Card** | **1500 × 600** | **2.5:1** | **21:9** (5:2 unsupported) | resize to 1500×600 | 144 |
| **M15 Lookbook** | **1500 × 600** | **2.5:1** | **21:9** (5:2 unsupported) | resize to 1500×600 | 144 |

---

## IF STUCK — QUICK TROUBLESHOOTING

| Problem | Immediate Fix |
|---------|--------------|
| Text keeps breaking | Composite fallback — never deliver broken text |
| Product color drifts | Use 2 reference images (different angle of same product) |
| Scene looks like every competitor | Delete scene block. Rewrite using positioning GAP from Step 3 |
| Model times out | Add `allow_fallback_model: True`. Try again at different hour. |
| Hands look deformed | Simplify scene. Remove hands. Composite in real product + human element separately. |
| Texture shot looks AI-flat | Add "extreme macro photography, 100mm lens, 5:1 magnification ratio" to STYLE block |
| Lighting is flat and grey | Replace "soft lighting" with specific: "Rembrandt key at 45 degrees upper-left, silver 5-in-1 reflector fill, golden hair light from behind" |
| Background blends into product | Ensure observed product background color is noted. In scene block, specify a CONTRASTING setting color |
| Prompt too long / model ignores parts | Prioritize constraint block. Put the most important fidelity elements FIRST in the prompt |
| Wrong aspect ratio in output | Resize to exact pixel dimensions per the module spec table above |

---

## WHAT GREAT PROMPTS LOOK LIKE — FULL EXAMPLES

**BAD PROMPT:**
> "A nice hand cream product photo with a Mediterranean feel."

**GOOD PROMPT — HERO (M1 Header):**
> "The product in the reference image is a Zealots of Nature handcream tube. Exact specifications:
> — Container shape: Tall slim cylindrical squeeze tube, approximately 150mm tall × 35mm diameter
> — Primary color: Matte warm cream #F5F0E8, no gloss
> — Secondary colors: Olive green #6B7B3A accent stripe along label border, antique gold #B8860B flip-cap
> — Material / texture: Soft-touch semi-matte plastic, slightly tactile surface
> — Closure: Domed flip-top cap, antique gold colored, 18mm diameter, no branding on cap
> — Label: Front-facing rectangular panel label, 70mm × 45mm, cream background, full-color print
> — Text on label reads EXACTLY: 'ZEALOTS OF NATURE' (serif, small caps, dark brown #3D2B1F), second line: 'HAND CREAM' (sans-serif, 8pt, olive green), third line: 'Greek Bio Olive Oil · Panthenol · Vitamin E' (sans-serif, 6pt, dark brown), ingredient list at bottom in 5pt grey
> — Label typography: 'ZEALOTS OF NATURE' in a refined transitional serif, tracking +20, all small caps. 'HAND CREAM' in a clean geometric sans, regular weight.
> Do NOT change, regenerate, blur, distort, recolor, or alter any of these product elements.
>
> Scene: Pure white infinity cove studio backdrop. The tube stands dead-center, slightly rotated to show the full label face at a 15-degree off-axis angle — not flat front-on, not full 3/4, a confident and modern product presentation angle. Single large octobox softbox at 45 degrees upper-left. Secondary fill from below to eliminate under-chin shadow. The tube is the sole hero. No props, no shadows on backdrop, no reflections on the glossy cap. The label is perfectly legible and front-lit. The cream tube contrasts cleanly against the white backdrop. Aspect fills 65% of the vertical frame.
>
> Style: Clean premium cosmetics product photography. Neutral daylight color temperature. Matte plastic tactile quality visible under soft directional light. Shot on Hasselblad X2D 100MP with XCD 90mm lens at f/8 for maximum sharpness on label text. 970×600 px at 144 DPI (1.617:1 aspect). The confidence of a Chanel or Aesop hero shot. No compromises."

**GOOD PROMPT — LARGE IMAGE + TEXT (M7):**
> "The product in the reference image is a Zealots of Nature handcream tube. [FULL CONSTRAINT BLOCK AS ABOVE]. Do NOT alter the product.
>
> Scene: A sun-warmed Carrara marble kitchen counter at 8am, soft morning light from a window with sheer linen curtains casting gentle shadows. The tube stands at the center-right of the frame, label facing forward. To its left: a halved Blood Orange with seeds visible in the flesh cross-section, juice beading on the cut surface. A small sprig of fresh basil lies beside it. The left third of the frame is open and relatively uncluttered — this space is reserved for Amazon text overlay. In the blurred background: an ancient olive tree visible through the window, the Mediterranean morning light catching the silver leaves. The scene communicates the brand's origin story in a single frame.
>
> Style: Mediterranean editorial luxury skincare photography. Warm golden undertones throughout. Shot on Phase One IQ4 150MP with Rodinald 90mm lens at f/2.8 for slight background separation — the olive trees in the background should be soft bokeh, not competing with the product. 1500×600 px at 144 DPI (exactly 2.5:1 — the left third is clear for text). Aesop campaign quality. No compromises."

---

## CATEGORY-ADAPTIVE MODULE LIBRARY — EXTENSION (v5.2)

This section extends the A+ pipeline with the Listing Image pipeline module library. It explains how the two pipelines cross-reference and when to recommend a client runs both.

### Background

The A+ pipeline (v5.1) generates rich brand content modules that appear **below the fold** on Amazon product detail pages. The Listing pipeline (v1.0) generates the **image gallery** images that appear **above the fold**.

Both pipelines share Steps 1–3 (Input, Image Analysis, Category Research). They diverge at Step 4 (Module Selection).

### How Listing Images Feed A+ Content

When a client runs **Both pipelines** (Listing → A+), the unselected Listing images (6 from the L1–L12 library) can be used as reference inputs for A+ module generations.

**Cross-referencing rule:**
- Listing images (L1–L12) that were generated and approved but not selected for the live listing are eligible to use as `image_input` references for A+ generations
- This is valuable because the Listing run already established the product's visual language and brand context — reusing those reference images ensures consistency between the listing gallery and A+ content
- The `step2_image_analysis.md` and `step3_category_research.md` documents are shared between both pipelines — generate them once, use them in both

**Cross-reference table:**

| Listing Image | A+ Module It Can Feed | Why |
|---------------|----------------------|-----|
| L1 Main Hero | M1 Header, M9 Hotspot | Clean product reference for brand hero and callout modules (L1 is always selected for listing — use as secondary reference only, not from reserve pool) |
| L2 Size/Scale | M8 Technical Specs | Size reference for dimensional/measurement modules |
| L3 Lifestyle | M7 Large Image, M13 Shoppable | Rich lifestyle context for atmospheric and interactive modules |
| L4 Texture | M12 Video, M14 Card Carousel | Extreme close-up texture for detail and ingredient cards |
| L5 Mood | M14 Card Carousel, M15 Lookbook | Brand atmosphere for narrative card sequences |
| L6 Quality | M6 Comparison, M8 Specs | Construction detail for competitive and technical modules |
| L7 Material | M8 Technical Specs, M11 FAQ | Material composition for ingredient and FAQ visuals |
| L8 Packaging | M5 Product Showcase | Packaging context for multi-product or collection modules |
| L9 Brand Story | M14 Card Carousel | Origin narrative for story-driven card sequences |
| L10 Comparison | M6 Comparison Chart | Competitive visual directly feeds comparison module |
| L11 Lifestyle Alt | M7 Large Image, M13 Shoppable | Alternate lifestyle for multi-variant large/image modules |
| L12 Action | M12 Video | Active-use moment for video hero frame |

### When to Recommend Both Pipelines

Use the Decision Tree in `PHOILA_PIPELINE_INDEX.md`. Quick reference from the A+ perspective:

**Recommend adding A+ when:**
- Client's brand is Brand Registered (unlocks M11–M15 Premium modules)
- Product has meaningful brand story, origin, or provenance
- Competitive category where differentiation drives conversion
- Client has budget for both and wants maximum brand impact
- Product is in a visually-driven category (beauty, apparel, home décor)

**A+ only (no Listing) is appropriate when:**
- Client already has strong listing images and only needs A+ content
- The listing images are already live and converting — only A+ is missing
- Budget only allows one pipeline — Listing has higher immediate ROI for conversion

**Listing only (no A+) is appropriate when:**
- Brand is not Brand Registered (A+ not available)
- Client needs fastest path to live listing
- Commodity product without brand storytelling potential
- Budget constrains to one pipeline — Listing goes live faster and affects conversion immediately

### Category-Adaptive Module Selection Guide

The A+ module library (M1–M15) adapts per category. Below is guidance for common categories — the executor uses this as a starting point and adjusts based on Step 2 and Step 3 analysis.

**Apparel / Fashion:**
- Always include: M1 (hero), M4 (image grid — multiple angles), M10 (category nav — size/style options)
- Consider: M6 (comparison vs fast fashion), M7 (large lifestyle), M14 (card carousel showing outfit combinations)
- Skip: M8 (tech specs less relevant unless technical performance wear)

**Beauty / Cosmetics:**
- Always include: M1 (hero), M2/M3 (ingredient callouts), M11 (FAQ — skin type compatibility)
- Consider: M12 (before/after video frame), M13 (shoppable tutorial), M15 (lookbook)
- Skip: M10 (category nav less relevant for single-product listings)

**Food / Supplements:**
- Always include: M1 (hero), M8 (ingredients/nutritionals), M11 (FAQ — allergens, usage)
- Consider: M2/M3 (key ingredient close-up), M6 (comparison vs generic), M7 (origin story)
- Skip: M9 (hotspot less relevant for ingestible products)

**Electronics / Gadgets:**
- Always include: M1 (hero), M8 (specs), M9 (feature hotspots)
- Consider: M6 (comparison vs competitors), M4 (multi-angle image grid for component exploded view), M7 (lifestyle in context)
- Skip: M11 (FAQ less critical unless complex product)

**Home / Kitchen:**
- Always include: M1 (hero), M7 (lifestyle context), M8 (dimensions/materials)
- Consider: M4 (multiple angles), M6 (comparison vs other brands), M14 (use-case carousel)
- Skip: M10 (category nav unless line extension)

**Pet Products:**
- Always include: M1 (hero), M4 (image grid — product + pet), M7 (lifestyle with animal)
- Consider: M6 (comparison vs pet store brands), M11 (FAQ — safety, ingredients)
- Skip: M8 (tech specs less relevant)

---

## STEP 8 — RUN RETROSPECTIVE (mandatory after every run)

**Do NOT fix anything here. Document only. Ali reviews weekly.**

After every completed run, append one entry to:
`/home/alisionary/.openclaw/workspace/team/PHOILA_APLUS_RUNLOG.md`

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

Saved to: `/home/alisionary/.openclaw/workspace/team/PHOILA_Aplus_PIPELINE.md`

---

## CHANGELOG

| Date | Version | Change |
|------|---------|--------|
| 2026-05-25 | **v5.6** | **Deep research + precision prompting** — Step 3: added 3.2.1 CTR thumbnail analysis, 3.2.2 review image mining, 3.2.3 sponsored ad creative analysis, 3.2.4 image sequence pattern, 3.2.5 objection mapping, 3.3.1 trigger-to-visual translation table, 3.5.1 competitor anti-pattern map; category intelligence brief expanded with 5 new fields. Step 5 template: added SCENE LAYERS (mandatory 3-layer foreground/mid/bg spec), COMPETITOR CONTRAST block, TRIGGER ACTIVATION declaration, PROP SPECIFICATION format; STYLE block extended with light & shadow spec (key/fill/bg/shadow); NEGATIVE PROMPT block added as 4th mandatory template block. |
| 2026-05-24 | **v5.5** | **Physical realism enforcement** — Fix A: dimensional anchor (Q3 dimensions + scale phrase) added to CONSTRAINT BLOCK; Step 1.5 note added. Fix B: CAMERA/LENS PRESETS table added (category-adaptive, research-backed); realism mandate (no CGI, authentic lens physics) added to STYLE block. Fix C: HUMAN COMPOSITE GATE section added — SCALE-CRITICAL modules (M3/M7/M12/M13/M15 with human in frame) route directly to composite, skip end-to-end AI; COMPOSITE FALLBACK TRIGGER updated with dual-trigger rule. |
| 2026-05-23 | **v5.4** | **Agent-agnostic + data collection** — Added Step 1.5 (Product Data Collection): Q1–Q12 structured intake sent to Ali before any generation. Replaced all "Claudius" references with "the executor" / "the agent" — SOP now works for any agent. Runlog Executor field changed to [agent name]. |
| 2026-05-23 | **v5.3** | **Audit fixes** — Fixed M16 phantom module ref (replaced with M9). Fixed Step 6.3 verification snippet dict keys (w/h/key not width/height/name). Updated CHECK 3 quality gate: min score to approve raised from 5/10 to 7/10, scoring scale clarified. Added CHECK 4 AI artifact check. Added module count rule (min 6, max 12). Added M14 card count decision point in Step 4c. Improved M11 FAQ scene direction. Fixed composite fallback: added center parameter (center=True for product-dominant modules, center=False for text-overlay modules). Removed dead ratio parameter from run_with_retry. Header updated from V5.0 to V5.3. |
| 2026-05-23 | **v5.2** | **Category-Adaptive Extension** — appended new section explaining how Listing pipeline (v1.0) cross-references A+ pipeline, when to recommend Both, and category-adaptive module selection guide (apparel, beauty, food, electronics, home, pet). A+ pipeline v5.1 unchanged. |
| 2026-05-23 | **v5.1** | **Audit fixes** — corrected per-module NBP ratios for all 15 modules (M1/M4/M5/M6/M9/M11: 3:4→3:2; M2/M3/M8/M10: 3:4→16:9+crop). Fixed Python codegen (VARIANT_STRATEGY + SELECTED_MODULE_NAMES defined, download code added, center-crop for narrow modules, 4 M14 cards). Added composite fallback code (rembg+Pillow). Added tmpfiles.org 60-min TTL warning. |
| 2026-05-23 | v1 | Initial universal pipeline brief |
| 2026-05-23 | v4 | Expanded Step 4 from 12 to 24 visual types. Rewrote Step 7 into full per-visual scorecard with 7 checks. Added composite fallback protocol, quality improvement decision tree, two full prompt examples, troubleshooting guide |
| 2026-05-23 | **v5.0** | **PHOILA SOPHISTICATED** — 15-module library (10 Standard + 5 Premium) with dedicated prompt guidance per module. Executor selects from full menu based on product/category. Amazon-exact pixel dimensions at 144 DPI enforced. Lightweight 3-check QA gate. Variant strategy per-module (executor decides). Copy layer deferred to v6. Research docs internal-only. Composite fallback at 2 attempts. |
