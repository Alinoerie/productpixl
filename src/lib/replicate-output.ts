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

/** Image models return FileOutput (with .url()) or a plain URL string. */
export function extractReplicateUrl(output: unknown): string {
  if (typeof output === "string") {
    const trimmed = output.trim();
    if (trimmed.startsWith("http")) return trimmed;
  }

  if (Array.isArray(output)) {
    for (const item of output) {
      try {
        return extractReplicateUrl(item);
      } catch {
        continue;
      }
    }
  }

  if (output && typeof output === "object") {
    const obj = output as { url?: () => string };
    if (typeof obj.url === "function") {
      const fromMethod = String(obj.url()).trim();
      if (fromMethod.startsWith("http")) return fromMethod;
    }
    const asString = String(output).trim();
    if (asString.startsWith("http")) return asString;
  }

  const text = extractReplicateText(output).trim();
  if (text.startsWith("http")) return text;

  throw new Error("No image URL in model output");
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
