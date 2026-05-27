"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportDataSection() {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixl-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div>
        <p className="text-sm font-medium">Export my data</p>
        <p className="mt-1 text-sm text-[var(--muted-fg)]">
          Download a JSON copy of your profile, brands, products, assets, listing copies, and orders.
        </p>
      </div>
      <Button onClick={handleExport} disabled={exporting} variant="outline" size="sm">
        <Download className="h-4 w-4" />
        {exporting ? "Exporting…" : "Export data"}
      </Button>
    </div>
  );
}
