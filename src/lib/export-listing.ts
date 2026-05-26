import { getMarketplace, type MarketplaceId } from "@/lib/marketplaces";

export type ListingExportPayload = {
  title: string;
  bullets: string[];
  description?: string | null;
  backendKeywords?: string | null;
};

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatListingPlain(copy: ListingExportPayload, marketplaceId: string) {
  const mp = getMarketplace(marketplaceId);
  const bullets = copy.bullets.filter(Boolean);
  const header = `# ${mp.flag} ${mp.label} listing export`;

  if (marketplaceId === "SHOPIFY") {
    return [
      header,
      "",
      "PRODUCT TITLE",
      copy.title,
      "",
      "DESCRIPTION",
      copy.description ?? "",
      "",
      "HIGHLIGHTS",
      ...bullets.map((b, i) => `${i + 1}. ${b}`),
      "",
      copy.backendKeywords ? `TAGS: ${copy.backendKeywords}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (marketplaceId === "BOL_NL") {
    return [
      header,
      mp.copyNote,
      "",
      "Titel",
      copy.title,
      "",
      "Bulletpoints",
      ...bullets.map((b, i) => `${i + 1}. ${b}`),
      "",
      "Beschrijving",
      copy.description ?? "",
      "",
      copy.backendKeywords ? `Zoektermen: ${copy.backendKeywords}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    header,
    mp.copyNote,
    "",
    "Title",
    copy.title,
    "",
    "Bullets",
    ...bullets.map((b, i) => `${i + 1}. ${b}`),
    "",
    "Description",
    copy.description ?? "",
    "",
    copy.backendKeywords ? `Backend keywords: ${copy.backendKeywords}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatListingCsv(copy: ListingExportPayload, marketplaceId: MarketplaceId) {
  const bullets = [...copy.bullets];
  while (bullets.length < 5) bullets.push("");

  const row = [
    copy.title,
    bullets[0] ?? "",
    bullets[1] ?? "",
    bullets[2] ?? "",
    bullets[3] ?? "",
    bullets[4] ?? "",
    copy.description ?? "",
    copy.backendKeywords ?? "",
    marketplaceId,
  ].map(escapeCsv);

  const headers = [
    "title",
    "bullet_1",
    "bullet_2",
    "bullet_3",
    "bullet_4",
    "bullet_5",
    "description",
    "backend_keywords",
    "marketplace",
  ];

  return `${headers.join(",")}\n${row.join(",")}`;
}

export function listingExportFilename(slug: string, marketplaceId: string, ext: "txt" | "csv" | "json") {
  const mp = getMarketplace(marketplaceId);
  const market = mp.label.replace(/\s+/g, "-").toLowerCase();
  return `${slug}-${market}-listing.${ext}`;
}
