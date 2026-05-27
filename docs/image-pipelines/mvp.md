# Listing modules (cursorproductpixl)

Full PHOILA L1–L12 library is registered in `src/pipelines/modules.ts`. See [listing.md](./listing.md) for specifications.

| Module | Default in UI | Notes |
|--------|---------------|-------|
| L1 Main Hero | Always | White background, 4K |
| L2 Size & Scale | Optional | Reference objects / measurements |
| L3 Lifestyle | Core default | In-context scene, 4K |
| L4 Texture | Core default | Macro detail, 2K |
| L5 Mood & Atmosphere | Optional | Brand world, 4K |
| L6 Quality Construction | Optional | Craftsmanship detail, 2K |
| L7 Material Callout | Optional | Composition / certifications, 2K |
| L8 Packaging | Optional | Unboxing / first-touch, 2K |
| L9 Brand Story | Optional | Origin / provenance, 4K |
| L10 Comparison | Optional | Versus generic/competitor, 2K |
| L11 Lifestyle Alternate | Optional | Second lifestyle angle, 4K |
| L12 Lifestyle Action | Optional | Active use / motion, 4K |

**Starter run:** L1 + L3 + L4 (same as original MVP). Users can opt into any combination or **Full library (12)** in the image wizard.

Generation model: `google/nano-banana-pro` with `allow_fallback_model: true` (except L1 hero retry path).

Rate limit: 12s between Replicate calls; QA retry if score &lt; 7.
