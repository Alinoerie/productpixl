# MVP Image Modules (cursorproductpixl)

Fast-path subset of the full PHOILA Listing pipeline. See [listing.md](./listing.md) for L1–L12 specifications.

| Module | Included in MVP | Notes |
|--------|-----------------|-------|
| L1 Main Hero | Always | White background, nano-banana-pro, 1500×1500 |
| L3 Lifestyle | Always | Simplified scene prompts; composite in phase 2 |
| L4 Texture | Always | Macro detail |
| L8 Packaging | Optional (user toggle) | Unboxing / first-touch |

Runtime config: `src/pipelines/modules.ts`

Generation model: `google/nano-banana-pro` with `allow_fallback_model: true`.

Rate limit: 12s between Replicate calls; 3 retries with exponential backoff on 429.
