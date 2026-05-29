import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare — ProductPixl vs the Rest",
  description: "See how ProductPixl stacks up against Pixii, Pebblely, CreatorKit and other AI product photography tools — feature by feature.",
};

const CHECK = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CROSS = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PARTIAL = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

type CellValue = React.ReactNode;

interface FeatureRow {
  feature: string;
  description?: string;
  productpixl: CellValue;
  pixii: CellValue;
  pebblely: CellValue;
  creatorkit: CellValue;
}

const FEATURES: FeatureRow[] = [
  // ── Core Product ──────────────────────────────
  {
    feature: "Product fidelity guarantee",
    description: "AI preserves your product's colour, shape, and proportions across every generated module",
    productpixl: CHECK,
    pixii: PARTIAL,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  {
    feature: "QA scoring per module",
    description: "Each generated module gets a quality score — flagging deviations from your source product",
    productpixl: CHECK,
    pixii: CROSS,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  {
    feature: "Background Consistency Lock",
    description: "Lock the same background across all modules for a product — ideal for variations",
    productpixl: CHECK,
    pixii: CROSS,
    pebblely: PARTIAL,
    creatorkit: CROSS,
  },
  // ── Amazon Coverage ──────────────────────────────
  {
    feature: "Listing Images (L1–L12)",
    description: "Full 12-module Amazon listing gallery — hero, lifestyle, texture, infographics",
    productpixl: CHECK,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: PARTIAL,
  },
  {
    feature: "A+ Content modules",
    description: "M1/M2/M3/M4/M7/M8 enhanced brand content for Brand Registered sellers",
    productpixl: CHECK,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  {
    feature: "Amazon-native output formats",
    description: "Images optimised for Amazon's exact dimension and file-format requirements",
    productpixl: CHECK,
    pixii: CHECK,
    pebblely: PARTIAL,
    creatorkit: CROSS,
  },
  // ── Workflow ────────────────────────────────────
  {
    feature: "ASIN lookup",
    description: "Pull product data automatically from an Amazon ASIN — zero manual entry",
    productpixl: CROSS,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  {
    feature: "AI pre-fills product details",
    description: "Upload image → AI extracts name, description, materials, dimensions",
    productpixl: CHECK,
    pixii: CHECK,
    pebblely: PARTIAL,
    creatorkit: CHECK,
  },
  {
    feature: "Editable outputs",
    description: "Regenerate individual modules or edit text/layers after generation",
    productpixl: PARTIAL,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: PARTIAL,
  },
  {
    feature: "Catalog / bulk generation",
    description: "Scale one listing design across 100s of SKUs automatically",
    productpixl: CROSS,
    pixii: CHECK,
    pebblely: PARTIAL,
    creatorkit: PARTIAL,
  },
  // ── Pricing ────────────────────────────────────
  {
    feature: "Pay-per-generation (no subscription)",
    description: "Buy credits as you go — no monthly fee, credits never expire",
    productpixl: CHECK,
    pixii: CROSS,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  {
    feature: "Free trial (no card required)",
    description: "Try before you buy — 10 free credits on signup",
    productpixl: CHECK,
    pixii: CHECK,
    pebblely: CHECK,
    creatorkit: CHECK,
  },
  {
    feature: "Per-generation cost (Listing + A+)",
    description: "Full Listing + A+ package at ~€0.66–0.75 per generation",
    productpixl: CHECK,
    pixii: PARTIAL,
    pebblely: PARTIAL,
    creatorkit: PARTIAL,
  },
  // ── Output Quality ──────────────────────────────
  {
    feature: "12 listing image modules",
    description: "Generates 12 distinct hero/lifestyle/texture/scale/infographic modules",
    productpixl: CHECK,
    pixii: PARTIAL,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  {
    feature: "Lifestyle + mood photography",
    description: "AI-generated lifestyle contexts — not just white-background product shots",
    productpixl: CHECK,
    pixii: CHECK,
    pebblely: CHECK,
    creatorkit: CHECK,
  },
  {
    feature: "Infographic / size-scale modules",
    description: "Dedicated modules showing dimensions, comparisons, and technical specs",
    productpixl: CHECK,
    pixii: PARTIAL,
    pebblely: CROSS,
    creatorkit: CROSS,
  },
  // ── Platform ────────────────────────────────────
  {
    feature: "Amazon + Shopify + TikTok",
    description: "Works across Amazon, Shopify storefronts, and TikTok Shop",
    productpixl: PARTIAL,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: CHECK,
  },
  {
    feature: "API / developer access",
    description: "Programmatic generation via API for agencies and SaaS integrations",
    productpixl: PARTIAL,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: CHECK,
  },
  {
    feature: "Multi-user / agency plans",
    description: "Team seats, brand management, and agency workflows",
    productpixl: CROSS,
    pixii: CHECK,
    pebblely: CROSS,
    creatorkit: CHECK,
  },
];

function FeatureTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            <th style={{ textAlign: "left", padding: "12px 16px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 220 }}>Feature</th>
            {[
              { name: "ProductPixl", href: null, highlight: true },
              { name: "Pixii", href: "https://pixii.app", highlight: false },
              { name: "Pebblely", href: "https://pebblely.com", highlight: false },
              { name: "CreatorKit", href: "https://creatorkit.com", highlight: false },
            ].map(({ name, href, highlight }, i) => (
              <th key={name} style={{
                textAlign: "center",
                padding: "12px 8px",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: "13px",
                color: highlight ? "#F59E0B" : "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                minWidth: 100,
              }}>
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: highlight ? "#F59E0B" : "var(--text-muted)", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                    {name}
                  </a>
                ) : name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((row, i) => (
            <tr key={row.feature} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
              <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: row.description ? "2px" : 0 }}>{row.feature}</p>
                {row.description && <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{row.description}</p>}
              </td>
              {(["productpixl", "pixii", "pebblely", "creatorkit"] as const).map((key) => (
                <td key={key} style={{ textAlign: "center", padding: "14px 8px", verticalAlign: "middle" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>{row[key]}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VerdictCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      padding: "1.5rem",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      flex: 1,
      minWidth: 240,
    }}>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--text-primary)", marginBottom: "0.75rem" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function ComparePage() {
  return (
    <>
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fade-up 0.4s ease-out; }
        .compare-section { animation: fade-up 0.5s ease-out; }
      `}</style>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem" }}>

        {/* ── Hero ───────────────────────────────── */}
        <div className="animate-fade-up" style={{ textAlign: "center", padding: "3.5rem 0 2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "100px", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#F59E0B", fontFamily: "'Space Grotesk', sans-serif" }}>Feature comparison</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "clamp(28px, 5vw, 44px)", color: "var(--text-primary)", letterSpacing: "-0.025em", marginBottom: "1rem", lineHeight: 1.15 }}>
            ProductPixl vs the competition
          </h1>
          <p style={{ fontSize: "16px", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>
            Here's where we win, where we tie, and where we&apos;re honest about the trade-offs. No marketing fluff — just the features that matter for Amazon sellers.
          </p>
        </div>

        {/* ── Score summary ──────────────────────── */}
        <div className="compare-section" style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
          {[
            { label: "ProductPixl", score: "9.2", note: "Best for fidelity + A+ depth", href: null, highlight: true },
            { label: "Pixii", score: "8.4", note: "Best for ASIN-first workflow", href: "https://pixii.app", highlight: false },
            { label: "Pebblely", score: "6.1", note: "Best for background themes", href: "https://pebblely.com", highlight: false },
            { label: "CreatorKit", score: "5.8", note: "Best for video + ads", href: "https://creatorkit.com", highlight: false },
          ].map((item) => (
            <div key={item.label} style={{
              flex: "1 1 200px",
              padding: "1.25rem",
              background: item.highlight ? "rgba(245,158,11,0.08)" : "var(--bg-elevated)",
              border: `1px solid ${item.highlight ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
              borderRadius: "12px",
              textAlign: "center",
            }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "14px", color: item.highlight ? "#F59E0B" : "var(--text-secondary)", marginBottom: "6px" }}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline", textDecorationStyle: "dotted" }}>
                    {item.label}
                  </a>
                ) : item.label}
              </p>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: "32px", color: item.highlight ? "#F59E0B" : "var(--text-primary)", lineHeight: 1 }}>{item.score}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", marginTop: "6px" }}>{item.note}</p>
            </div>
          ))}
        </div>

        {/* ── Table ─────────────────────────────── */}
        <div className="compare-section" style={{ marginBottom: "3rem" }}>
          <FeatureTable />
        </div>

        {/* ── Legend ─────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "3rem", padding: "12px 16px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: "12px", color: "var(--text-muted)" }}>LEGEND:</span>
          {[
            { icon: CHECK, label: "Full support" },
            { icon: PARTIAL, label: "Partial / limited" },
            { icon: CROSS, label: "Not available" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {icon}
              <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Verdict cards ─────────────────────── */}
        <div className="compare-section" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          <VerdictCard title="Where ProductPixl wins">
            <ul style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, paddingLeft: "1.1rem", listStyle: "none" }}>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Product fidelity</strong> — QA scoring + fidelity model means every module preserves your product\&apos;s exact look. No AI hallucinations changing your bag\&apos;s colour or shape.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>
                <span><strong style={{ color: "var(--text-primary)" }}>A+ depth</strong> — 12 listing modules + 6 A+ modules covers the full Amazon funnel. Most tools stop at lifestyle shots.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Pay-per-gen</strong> — No $39/mo subscription. Credits never expire. You pay only when you generate.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#22C55E", flexShrink: 0 }}>✓</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Background Lock</strong> — Keep the same background locked across all modules for a product family. Critical for multi-variant sellers.</span>
              </li>
            </ul>
          </VerdictCard>

          <VerdictCard title="Where Pixii is stronger">
            <ul style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, paddingLeft: "1.1rem", listStyle: "none" }}>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "#F59E0B", flexShrink: 0 }}>→</span>
                <span><strong style={{ color: "var(--text-primary)" }}><a href="https://pixii.app" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "underline", textDecorationStyle: "dotted" }}>ASIN lookup</a></strong> — Enter an ASIN and it pulls your existing Amazon data automatically. Zero typing.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#F59E0B", flexShrink: 0 }}>→</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Editable layers</strong> — Every output is a design file, not just an image. Change text, swap elements per module.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#F59E0B", flexShrink: 0 }}>→</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Catalog scale</strong> — Create one master design and auto-apply across thousands of SKUs. Built for agencies.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#F59E0B", flexShrink: 0 }}>→</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Multi-platform</strong> — Amazon, Shopify, TikTok Shop, Walmart, Mercado Libre. Broader than ProductPixl today.</span>
              </li>
            </ul>
          </VerdictCard>

          <VerdictCard title="Where others have value">
            <ul style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7, paddingLeft: "1.1rem", listStyle: "none" }}>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "#6B7280", flexShrink: 0 }}>•</span>
                <span><strong style={{ color: "var(--text-primary)" }}><a href="https://pebblely.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "underline", textDecorationStyle: "dotted" }}>Pebblely</a></strong> — Great background themes and simple product-on-background shots. Cheaper if you just need lifestyle images, not full Amazon listings.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#6B7280", flexShrink: 0 }}>•</span>
                <span><strong style={{ color: "var(--text-primary)" }}><a href="https://creatorkit.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-primary)", textDecoration: "underline", textDecorationStyle: "dotted" }}>CreatorKit</a></strong> — Best if you need AI video ads for Facebook/Instagram alongside product photos. Not Amazon-focused.</span>
              </li>
              <li style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "8px" }}>
                <span style={{ color: "#6B7280", flexShrink: 0 }}>•</span>
                <span><strong style={{ color: "var(--text-primary)" }}>Wizart</strong> — No live data captured. Reviews suggest it targets interior/furniture renderings rather than Amazon e-commerce.</span>
              </li>
            </ul>
          </VerdictCard>
        </div>

        {/* ── Bottom CTA ─────────────────────────── */}
        <div className="compare-section" style={{ textAlign: "center", padding: "2.5rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "16px" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "22px", color: "var(--text-primary)", marginBottom: "8px" }}>
            Want to see ProductPixl for yourself?
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", marginBottom: "1.5rem" }}>
            10 free credits on signup. No credit card. Generate your first Listing + A+ package in minutes.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/register" style={{ padding: "12px 28px", background: "#F59E0B", color: "#000", borderRadius: "8px", fontWeight: 700, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
              Start free →
            </a>
            <a href="/pricing" style={{ padding: "12px 28px", background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-strong)", borderRadius: "8px", fontWeight: 600, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", textDecoration: "none" }}>
              View pricing
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
