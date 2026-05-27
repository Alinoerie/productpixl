export type RuleType = "ALWAYS" | "NEVER" | "IF";

export type BrandRule = {
  id: string;
  type: RuleType;
  text: string;
};

const RULE_LINE = /^\[(ALWAYS|NEVER|IF)\]\s*(.+)$/i;

function ruleId(index: number) {
  return `rule-${index}-${Date.now()}`;
}

export function parseGuidelinesToRules(guidelines: string | null | undefined): BrandRule[] {
  if (!guidelines?.trim()) return [];
  const lines = guidelines.split("\n").map((l) => l.trim()).filter(Boolean);
  const parsed = lines
    .map((line, index) => {
      const match = line.match(RULE_LINE);
      if (!match) return null;
      return {
        id: ruleId(index),
        type: match[1].toUpperCase() as RuleType,
        text: match[2].trim(),
      };
    })
    .filter(Boolean) as BrandRule[];
  if (parsed.length > 0) return parsed;
  return [{ id: ruleId(0), type: "ALWAYS", text: guidelines.trim() }];
}

export function serializeRulesToGuidelines(rules: BrandRule[]): string {
  return rules
    .filter((r) => r.text.trim())
    .map((r) => `[${r.type}] ${r.text.trim()}`)
    .join("\n");
}

export function defaultRulesForProfile(input: {
  displayName?: string | null;
  language?: string;
  tone?: string;
  primaryColor?: string;
}): BrandRule[] {
  const lang = input.language === "de" ? "German" : input.language === "nl" ? "Dutch" : "English";
  return [
    {
      id: "default-always-lang",
      type: "ALWAYS",
      text: `Use ${lang} marketplace formatting for titles and bullets when generating copy.`,
    },
    {
      id: "default-never-claims",
      type: "NEVER",
      text: "Make medical claims, guaranteed results, or competitor comparisons without proof.",
    },
    {
      id: "default-always-color",
      type: "ALWAYS",
      text: `Keep hero accents aligned with brand primary color ${input.primaryColor ?? "#6366F1"}.`,
    },
    {
      id: "default-if-skincare",
      type: "IF",
      text: "The product is skincare or beauty — show clean, soft lighting and inclusive skin tones.",
    },
  ];
}
