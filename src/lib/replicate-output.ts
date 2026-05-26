/** Replicate often returns streamed text as an array of string chunks — join all of them. */
export function extractReplicateText(output: unknown): string {
  if (typeof output === "string") return output;
  if (Array.isArray(output)) {
    return output.map((chunk) => String(chunk ?? "")).join("");
  }
  if (output && typeof output === "object") {
    const obj = output as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.output === "string") return obj.output;
    if (Array.isArray(obj.output)) {
      return obj.output.map((chunk) => String(chunk ?? "")).join("");
    }
    return String(Object.values(obj)[0] ?? "");
  }
  return String(output ?? "");
}

export function parseJsonFromModel<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error("Model returned invalid JSON");
  }
}
