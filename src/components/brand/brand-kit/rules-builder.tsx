"use client";

import { Plus, Trash2 } from "lucide-react";
import type { BrandRule, RuleType } from "@/lib/brand-kit-rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<RuleType, string> = {
  ALWAYS: "bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]",
  NEVER: "bg-[var(--error-bg)] text-[var(--error)] border-[var(--error-border)]",
  IF: "bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)]",
};

export function RulesBuilder({
  rules,
  onChange,
}: {
  rules: BrandRule[];
  onChange: (rules: BrandRule[]) => void;
}) {
  function updateRule(id: string, patch: Partial<BrandRule>) {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRule(id: string) {
    onChange(rules.filter((r) => r.id !== id));
  }

  function addRule() {
    onChange([
      ...rules,
      { id: `rule-${Date.now()}`, type: "ALWAYS", text: "" },
    ]);
  }

  return (
    <div className="space-y-3">
      {rules.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 px-4 py-8 text-center">
          <svg viewBox="0 0 48 48" className="h-12 w-12 text-[var(--muted-fg)]" aria-hidden>
            <rect x="8" y="12" width="32" height="4" rx="2" fill="currentColor" opacity="0.35" />
            <rect x="8" y="22" width="24" height="4" rx="2" fill="currentColor" opacity="0.25" />
            <rect x="8" y="32" width="28" height="4" rx="2" fill="currentColor" opacity="0.2" />
          </svg>
          <p className="mt-3 text-sm text-[var(--muted-fg)]">No generation rules yet.</p>
          <Button type="button" size="sm" className="mt-3" onClick={addRule}>
            Add your first rule
          </Button>
        </div>
      ) : (
        rules.map((rule) => (
          <div
            key={rule.id}
            className="grid animate-in slide-in-from-top-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 duration-200 md:grid-cols-[auto_1fr_auto]"
          >
            <select
              value={rule.type}
              onChange={(e) => updateRule(rule.id, { type: e.target.value as RuleType })}
              className={cn(
                "h-9 rounded-lg border px-2 text-[11px] font-bold uppercase tracking-wide",
                TYPE_STYLES[rule.type]
              )}
            >
              <option value="ALWAYS">ALWAYS</option>
              <option value="NEVER">NEVER</option>
              <option value="IF">IF</option>
            </select>
            <Input
              value={rule.text}
              onChange={(e) => updateRule(rule.id, { text: e.target.value })}
              placeholder="Describe the constraint…"
              className="text-sm transition-[border-color,box-shadow] duration-150"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[var(--muted-fg)] hover:text-[var(--error)]"
              onClick={() => removeRule(rule.id)}
              aria-label="Delete rule"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
      {rules.length > 0 ? (
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={addRule}>
          <Plus className="h-4 w-4" />
          Add rule
        </Button>
      ) : null}
    </div>
  );
}
