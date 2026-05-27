"use client";

import { useState } from "react";
import { ProjectsBulkActions } from "@/components/projects/projects-bulk-actions";
import { DashboardProjectCard } from "@/components/dashboard/dashboard-project-card";

type ProjectItem = {
  id: string;
  name: string;
  status: string;
  marketplace: string;
  createdAt: Date;
  hasCopy: boolean;
  hasImages: boolean;
  thumbs: { id: string; imageUrl: string | null }[];
};

export function ProjectsSelectableGrid({ products }: { products: ProjectItem[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    setSelected(products.map((p) => p.id));
  }

  function deselectAll() {
    setSelected([]);
  }

  const allVisibleSelected = products.length > 0 && products.every((p) => selected.includes(p.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ProjectsBulkActions selectedIds={selected} onClear={() => setSelected([])} />
        <div className="ml-auto flex items-center gap-2">
          <input
            type="checkbox"
            checked={allVisibleSelected}
            onChange={() => (allVisibleSelected ? deselectAll() : selectAll())}
            aria-label={allVisibleSelected ? "Deselect all visible" : "Select all visible"}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="text-xs text-[var(--muted-fg)]">
            {allVisibleSelected ? "All visible selected" : "Select all visible"}
          </span>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const checked = selected.includes(p.id);
          return (
            <div key={p.id} className="relative">
              <div className="absolute left-3 top-3 z-10 rounded-md bg-[var(--card)]/90 p-1 shadow-sm backdrop-blur-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(p.id)}
                  aria-label={`Select ${p.name}`}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </div>
              <DashboardProjectCard {...p} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
