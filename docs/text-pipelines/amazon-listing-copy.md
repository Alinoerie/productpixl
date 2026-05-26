# Amazon Listing Copy Pipeline (MVP)

## Output fields

- `title` — max 200 characters
- `bullets` — exactly 5 bullet points
- `description` — plain text, max 2000 characters
- `backendKeywords` — comma-separated search terms, max 250 bytes

## Steps

1. **Intake** — product name, brand, category, materials, features, target buyer, marketplace selector (US/UK/DE tone hints; English output in MVP).
2. **Research (Tavily)** — competitor titles, keyword frequency, review themes.
3. **Generate** — structured JSON via Gemini Flash (Replicate) with Amazon policy constraints.
4. **Persist** — `ListingCopy` model linked to `Product`.
5. **Export** — UI copy/edit, download JSON.

## Credit cost

1 credit per copy generation run.

## Phase 2

- GEO localization (nl/de/fr) per marketplace
- Bol.com-specific field mapping
- Backend keyword byte validator per locale
