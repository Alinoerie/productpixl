export interface GraderInput {
  title: string;
  bullets: string[];
  description?: string;
  backendKeywords?: string;
}

export interface GraderCheck {
  id: string;
  label: string;
  score: number;
  max: number;
  tip: string;
}

export interface GraderResult {
  grade: "A" | "B" | "C" | "D" | "F";
  score: number;
  summary: string;
  checks: GraderCheck[];
  rufusTips: string[];
}

function gradeFromScore(score: number): GraderResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 78) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

export function gradeListing(input: GraderInput): GraderResult {
  const checks: GraderCheck[] = [];
  const title = input.title.trim();
  const bullets = input.bullets.filter(Boolean);
  const desc = (input.description ?? "").trim();

  // Title length (Amazon ~200)
  const titleLen = title.length;
  const titleScore =
    titleLen >= 80 && titleLen <= 200 ? 20 : titleLen >= 40 ? 12 : titleLen > 0 ? 6 : 0;
  checks.push({
    id: "title",
    label: "Title length & clarity",
    score: titleScore,
    max: 20,
    tip:
      titleLen < 80
        ? "Expand title with key benefit + differentiator (aim 80–200 chars)."
        : titleLen > 200
          ? "Shorten title — Amazon truncates long titles in search."
          : "Title length looks solid.",
  });

  // Bullet count
  const bulletScore = bullets.length === 5 ? 20 : bullets.length >= 3 ? 12 : bullets.length > 0 ? 6 : 0;
  checks.push({
    id: "bullets",
    label: "Bullet completeness",
    score: bulletScore,
    max: 20,
    tip:
      bullets.length !== 5
        ? "Use exactly 5 bullets — Amazon shoppers scan this block first."
        : "Five bullets present.",
  });

  // Benefit-led bullets (not all-caps keyword dumps)
  const keywordStuff = bullets.filter((b) => (b.match(/[A-Z]{4,}/g) ?? []).length > 2).length;
  const benefitScore = keywordStuff === 0 ? 15 : keywordStuff <= 1 ? 8 : 0;
  checks.push({
    id: "benefit",
    label: "Benefit-led copy (RUFUS-ready)",
    score: benefitScore,
    max: 15,
    tip:
      keywordStuff > 1
        ? "Reduce ALL-CAPS keyword blocks — write for buyers and Amazon's AI surfaces."
        : "Bullets read naturally for humans and RUFUS.",
  });

  // Description
  const descScore = desc.length >= 400 ? 15 : desc.length >= 150 ? 10 : desc.length > 0 ? 5 : 0;
  checks.push({
    id: "description",
    label: "Description depth",
    score: descScore,
    max: 15,
    tip:
      desc.length < 150
        ? "Add a richer description — answer 'who is this for?' and 'why trust this brand?'"
        : "Description has reasonable depth.",
  });

  // Backend keywords
  const kw = (input.backendKeywords ?? "").trim();
  const kwScore = kw.length >= 50 && kw.length <= 250 ? 15 : kw.length > 0 ? 8 : 0;
  checks.push({
    id: "keywords",
    label: "Backend keywords",
    score: kwScore,
    max: 15,
    tip:
      !kw
        ? "Add backend search terms (max 250 bytes) — not visible to shoppers but helps A9."
        : "Backend keywords present.",
  });

  // Mobile scan (short first bullet)
  const firstBullet = bullets[0] ?? "";
  const mobileScore = firstBullet.length >= 40 && firstBullet.length <= 220 ? 15 : firstBullet ? 8 : 0;
  checks.push({
    id: "mobile",
    label: "Mobile-first scan",
    score: mobileScore,
    max: 15,
    tip: "Lead bullet 1 with your strongest benefit — most shoppers never scroll.",
  });

  const total = checks.reduce((s, c) => s + c.score, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = Math.round((total / max) * 100);
  const grade = gradeFromScore(score);

  const rufusTips = [
    "Structure bullets as answers: 'Who is it for?' 'What problem does it solve?'",
    "Use specific materials and numbers — vague claims underperform in semantic search.",
    "Pair strong copy with L1 hero + lifestyle gallery — ProductPixl generates both from one photo.",
  ];

  const summary =
    grade === "A" || grade === "B"
      ? "Strong foundation. Minor tweaks could lift conversion further."
      : grade === "C"
        ? "Average listing — competitors with better gallery + copy will outrank you."
        : "Critical gaps — fix before spending on ads.";

  return { grade, score, summary, checks, rufusTips };
}
