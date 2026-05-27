"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RECENT_KEY = "pp-brand-recent-colors";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function pushRecent(hex: string) {
  const next = [hex, ...loadRecent().filter((c) => c.toLowerCase() !== hex.toLowerCase())].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function ColorPickerSplit({
  label,
  hint,
  value,
  onChange,
  brandPrimary,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
  brandPrimary: string;
}) {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function commit(hex: string) {
    onChange(hex);
    pushRecent(hex);
    setRecent(loadRecent());
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        {hint ? <p className="text-xs text-[var(--muted-fg)]">{hint}</p> : null}
      </div>
      <div className="inline-flex overflow-hidden rounded-lg border border-[var(--border)]">
        <button
          type="button"
          className="flex h-10 min-w-[3rem] items-center gap-2 border-r border-[var(--border)] px-2"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="h-6 w-6 rounded-md border border-black/10 shadow-inner" style={{ backgroundColor: value }} />
          <span className="font-mono text-xs text-[var(--muted-fg)]">{value.toUpperCase()}</span>
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center hover:bg-[var(--muted)]"
          onClick={() => setOpen((v) => !v)}
          aria-label={`Open ${label} picker`}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      {open ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow-md)]">
          <input
            type="color"
            value={value}
            onChange={(e) => commit(e.target.value)}
            className="h-10 w-full cursor-pointer rounded border-0 bg-transparent"
            aria-label={label}
          />
          <Input
            value={value}
            onChange={(e) => commit(e.target.value)}
            className="mt-2 font-mono text-sm transition-[border-color,box-shadow] duration-150 focus-visible:ring-2"
            style={{ ["--tw-ring-color" as string]: `${brandPrimary}55` }}
          />
          {recent.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {recent.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cn("h-6 w-6 rounded-md border border-black/10", c === value && "ring-2 ring-offset-1")}
                  style={{ backgroundColor: c, ["--tw-ring-color" as string]: brandPrimary }}
                  onClick={() => commit(c)}
                  aria-label={`Recent color ${c}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
