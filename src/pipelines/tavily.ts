import { sleep } from "@/lib/utils";

export interface ResearchSummary {
  categoryThemes: string[];
  positioningGaps: string[];
  objections: string[];
  antiPatterns: string[];
  rawSnippets: string[];
}

export async function runCategoryResearch(
  productName: string,
  category: string
): Promise<ResearchSummary> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    await sleep(800);
    return {
      categoryThemes: ["white hero", "lifestyle context", "ingredient callouts"],
      positioningGaps: ["more authentic lifestyle", "stronger texture proof"],
      objections: ["size uncertainty", "material quality", "value for money"],
      antiPatterns: [
        "smiling model on plain studio backdrop",
        "floating product with blue gradient",
      ],
      rawSnippets: [],
    };
  }

  const queries = [
    `${productName} ${category} Amazon best seller listing images`,
    `${category} Amazon buyer complaints reviews`,
    `${productName} competitor Amazon product page`,
  ];

  const snippets: string[] = [];

  for (const query of queries) {
    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: key,
          query,
          max_results: 5,
          search_depth: "basic",
        }),
      });
      const data = (await res.json()) as {
        results?: { content?: string; title?: string }[];
      };
      for (const r of data.results ?? []) {
        if (r.content) snippets.push(r.content.slice(0, 400));
      }
    } catch {
      /* continue */
    }
  }

  return {
    categoryThemes: ["lifestyle", "hero white background", "detail macro"],
    positioningGaps: ["authentic in-use moments", "premium material proof"],
    objections: ["fit and size", "quality vs price", "durability"],
    antiPatterns: ["generic stock gym backdrop", "over-saturated CGI look"],
    rawSnippets: snippets,
  };
}

export async function runCopyResearch(
  productName: string,
  category: string,
  marketplace: string
): Promise<{ keywords: string[]; competitorTitles: string[]; snippets: string[] }> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) {
    await sleep(600);
    return {
      keywords: ["premium", "organic", "fast shipping", category.split(">")[0]?.trim() ?? "quality"],
      competitorTitles: [`${productName} — Premium Edition`, `Best ${productName} for Daily Use`],
      snippets: [],
    };
  }

  const query = `${productName} ${category} ${marketplace} Amazon listing title keywords`;
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: key, query, max_results: 8 }),
  });
  const data = (await res.json()) as { results?: { content?: string; title?: string }[] };
  const snippets = (data.results ?? []).map((r) => r.content ?? "").filter(Boolean);
  const titles = (data.results ?? []).map((r) => r.title ?? "").filter(Boolean);

  return {
    keywords: extractKeywords(snippets.join(" ")),
    competitorTitles: titles.slice(0, 5),
    snippets,
  };
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}
