export const DEMO_DURATION_MINUTES = 30;

export const DEMO_BOOKING_STEPS = ["Pick a time", "Your details", "Confirmed"] as const;

export type DemoDaySlot = {
  iso: string;
  dayLabel: string;
  dayNum: number;
  monthLabel: string;
};

export type DemoExpert = {
  name: string;
  title: string;
  imageUrl: string | null;
};

export function getDemoExpert(): DemoExpert {
  return {
    name: process.env.NEXT_PUBLIC_DEMO_EXPERT_NAME?.trim() || "ProductPixl Team",
    title: process.env.NEXT_PUBLIC_DEMO_EXPERT_TITLE?.trim() || "AI & Ecommerce Expert",
    imageUrl: process.env.NEXT_PUBLIC_DEMO_EXPERT_IMAGE?.trim() || null,
  };
}

export function getDemoExpertInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Next N calendar days starting tomorrow (includes weekends). */
export function getUpcomingDemoDays(count = 5, from = new Date()): DemoDaySlot[] {
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  const days: DemoDaySlot[] = [];
  while (days.length < count) {
    days.push({
      iso: cursor.toISOString().slice(0, 10),
      dayLabel: cursor.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: cursor.getDate(),
      monthLabel: cursor.toLocaleDateString("en-US", { month: "short" }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export const DEMO_TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
] as const;

export const DEMO_SKU_RANGES = [
  "Under 100 SKUs",
  "100–1,000 SKUs",
  "1,000–10,000 SKUs",
  "10,000+ SKUs",
] as const;

export const DEMO_PLATFORMS = ["Shopify", "WooCommerce", "Amazon", "Bol.com", "PrestaShop", "Other"] as const;

export function getCalendlyUrl() {
  return process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() || process.env.CALENDLY_URL?.trim() || "";
}

export function buildCalendlyPrefillUrl(base: string, params: { name: string; email: string; date?: string }) {
  try {
    const url = new URL(base);
    if (params.name) url.searchParams.set("name", params.name);
    if (params.email) url.searchParams.set("email", params.email);
    if (params.date) url.searchParams.set("date", params.date);
    return url.toString();
  } catch {
    return base;
  }
}
