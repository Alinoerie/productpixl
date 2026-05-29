import { NextRequest, NextResponse } from "next/server";

const SCRAPER_API_KEY = process.env.SCRAPERAPI_KEY;
const SCRAPER_API_URL = "http://api.scraperapi.com";

export interface AsinLookupResult {
  title: string;
  bullets: string[];
  description: string;
  imageUrl: string;
}

/**
 * Fetches and parses an Amazon product page by ASIN using ScraperAPI.
 * Falls back to a simple HTML parse if no API key is configured.
 */
async function fetchWithScraperAPI(asin: string): Promise<AsinLookupResult | null> {
  if (!SCRAPER_API_KEY) {
    // No API key — fall through to simple parse attempt
    return null;
  }

  const url = `https://www.amazon.com/dp/${asin}`;
  const apiUrl = `${SCRAPER_API_URL}?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=true`;

  const res = await fetch(apiUrl, {
    signal: AbortSignal.timeout(15000),
    headers: { "Accept": "text/html" },
  });

  if (!res.ok) return null;
  return parseAmazonHtml(await res.text());
}

/**
 * Attempts a direct fetch (bypasses CORS for server-side) and parses the result.
 * Works as a fallback when no ScraperAPI key is configured.
 */
async function fetchDirect(asin: string): Promise<AsinLookupResult | null> {
  const url = `https://www.amazon.com/dp/${asin}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    return parseAmazonHtml(await res.text());
  } catch {
    return null;
  }
}

/**
 * Parses Amazon product page HTML to extract listing data.
 * Uses simple regex/string matching — works for the current Amazon HTML structure.
 */
function parseAmazonHtml(html: string): AsinLookupResult | null {
  try {
    // Product title: look for the main product title element
    const titleMatch = html.match(/<span id="productTitle"[^>]*>([^<]+)<\/span>/i)
      || html.match(/"name":"([^"]+)"/)
      || html.match(/<h1[^>]*product-title[^>]*>([^<]+)</i);

    const title = titleMatch ? titleMatch[1].trim().replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#34;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">") : "";

    // Bullet points: feature bullets
    const bullets: string[] = [];
    const bulletMatches = html.matchAll(/<li[^>]*class="[^"]*(?:a-list-item|bulleted[^"]*)"[^>]*>([\s\S]*?)<\/li>/gi);
    for (const match of bulletMatches) {
      const text = match[1].replace(/<[^>]+>/g, "").trim();
      if (text && text.length > 10 && text.length < 500) {
        bullets.push(text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#34;/g, '"'));
      }
      if (bullets.length >= 5) break;
    }

    // Also look for specific bullet patterns in JSON data
    if (bullets.length < 3) {
      const featureMatch = html.match(/"featureBullets"\s*:\s*\[([\s\S]*?)\]/);
      if (featureMatch) {
        const featureBullets = featureMatch[1].matchAll(/"text"\s*:\s*"([^"]+)"/g);
        for (const fb of featureBullets) {
          const text = fb[1].trim();
          if (text && !bullets.includes(text)) {
            bullets.push(text);
          }
          if (bullets.length >= 5) break;
        }
      }
    }

    // Description / product description
    const descMatch = html.match(/<div id="productDescription"[^>]*>([\s\S]*?)<\/div>/i)
      || html.match(/"productDescription"\s*:\s*"([^"]+)"/)
      || html.match(/<span id="productDescription"[^>]*>([\s\S]*?)россия|<\/span>/i);
    let description = "";
    if (descMatch) {
      description = descMatch[1].replace(/<[^>]+>/g, "").trim().replace(/&amp;/g, "&");
    }

    // Main product image
    const imageMatch = html.match(/"landingImage"\s*:\s*"([^"]+)"/)
      || html.match(/"mainImage"\s*:\s*"([^"]+)"/)
      || html.match(/id="imgTagWrapperId"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i)
      || html.match(/"image"\s*:\s*\[\s*\{[^}]*"large"\s*:\s*"([^"]+)"/);
    let imageUrl = imageMatch ? imageMatch[1].trim() : "";

    // Fallback image extraction
    if (!imageUrl) {
      const imgMatch = html.match(/<img[^>]+id="landingImage"[^>]+src="([^"]+)"/i);
      imageUrl = imgMatch ? imgMatch[1] : "";
    }

    if (!title) return null;

    return {
      title,
      bullets: bullets.slice(0, 5),
      description,
      imageUrl,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { asin?: string };
    const asin = (body.asin ?? "").trim().toUpperCase();

    // Basic ASIN validation: 10 characters, alphanumeric
    if (!asin || !/^[A-Z0-9]{10}$/.test(asin)) {
      return NextResponse.json({ error: "Invalid ASIN format. ASINs are 10 characters (e.g. B08N5WRWNW)." }, { status: 400 });
    }

    let result: AsinLookupResult | null = null;
    let source: "scraperapi" | "direct" | null = null;

    // Try ScraperAPI first
    if (SCRAPER_API_KEY) {
      result = await fetchWithScraperAPI(asin);
      source = "scraperapi";
    }

    // Fallback: direct fetch
    if (!result) {
      result = await fetchDirect(asin);
      source = "direct";
    }

    if (!result) {
      return NextResponse.json(
        { error: "Could not fetch ASIN — enter details manually. Amazon blocking may require a ScraperAPI key." },
        { status: 422 }
      );
    }

    return NextResponse.json({ ...result, source });
  } catch (err) {
    console.error("[asin/lookup]", err);
    return NextResponse.json({ error: "Lookup failed — try again or enter details manually." }, { status: 500 });
  }
}
