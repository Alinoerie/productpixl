import type { ListingBuilderRow } from "@/lib/batch/types";

export type CsvColumnMap = {
  name: string;
  inputImageUrl: string;
  category?: string;
  marketplace?: string;
  materials?: string;
  colors?: string;
  keyFeatures?: string;
  targetBuyer?: string;
  competitors?: string;
  vibe?: string;
  useCase?: string;
  differentiators?: string;
  dimensions?: string;
};

export const LISTING_BUILDER_FIELD_OPTIONS = [
  { key: "name", label: "Product name", required: true },
  { key: "inputImageUrl", label: "Image URL", required: true },
  { key: "category", label: "Category", required: false },
  { key: "marketplace", label: "Marketplace", required: false },
  { key: "materials", label: "Materials", required: false },
  { key: "colors", label: "Colors", required: false },
  { key: "keyFeatures", label: "Key features", required: false },
  { key: "targetBuyer", label: "Target buyer", required: false },
  { key: "competitors", label: "Competitors", required: false },
  { key: "vibe", label: "Vibe", required: false },
  { key: "useCase", label: "Use case", required: false },
  { key: "differentiators", label: "Differentiators", required: false },
  { key: "dimensions", label: "Dimensions", required: false },
] as const;

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsvText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCsvLine(lines[0]!);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
}

function cellValue(row: string[], headers: string[], column?: string): string | undefined {
  if (!column) return undefined;
  const index = headers.indexOf(column);
  if (index < 0) return undefined;
  // Don't silently trim cell values — preserve intentional whitespace in product data
  const value = row[index];
  return value || undefined;
}

export function mapCsvRows(
  headers: string[],
  rows: string[][],
  columnMap: CsvColumnMap
): { rows: ListingBuilderRow[]; errors: string[] } {
  const errors: string[] = [];
  const mapped: ListingBuilderRow[] = [];

  rows.forEach((row, index) => {
    const lineNum = index + 2;
    const name = cellValue(row, headers, columnMap.name);
    const inputImageUrl = cellValue(row, headers, columnMap.inputImageUrl);

    if (!name) {
      errors.push(`Row ${lineNum}: product name is required`);
      return;
    }
    if (!inputImageUrl) {
      errors.push(`Row ${lineNum}: image URL is required`);
      return;
    }
    if (!/^https?:\/\//i.test(inputImageUrl)) {
      errors.push(`Row ${lineNum}: image URL must start with http:// or https://`);
      return;
    }

    mapped.push({
      name,
      inputImageUrl,
      category: cellValue(row, headers, columnMap.category),
      marketplace: cellValue(row, headers, columnMap.marketplace),
      materials: cellValue(row, headers, columnMap.materials),
      colors: cellValue(row, headers, columnMap.colors),
      keyFeatures: cellValue(row, headers, columnMap.keyFeatures),
      targetBuyer: cellValue(row, headers, columnMap.targetBuyer),
      competitors: cellValue(row, headers, columnMap.competitors),
      vibe: cellValue(row, headers, columnMap.vibe),
      useCase: cellValue(row, headers, columnMap.useCase),
      differentiators: cellValue(row, headers, columnMap.differentiators),
      dimensions: cellValue(row, headers, columnMap.dimensions),
    });
  });

  return { rows: mapped, errors };
}
