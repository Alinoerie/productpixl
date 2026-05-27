"use client";

import { useEffect, useId, useRef, useState } from "react";
import { filterCategories } from "@/lib/amazon-categories";
import { cn } from "@/lib/utils";

export function CategoryCombobox({
  id,
  label,
  value,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestions = filterCategories(query);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filled = value.trim().length > 0;

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className={cn(
          "pointer-events-none absolute left-3 z-10 origin-left text-[var(--muted-fg)] transition-all",
          filled || open
            ? "top-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]"
            : "top-1/2 -translate-y-1/2 text-sm"
        )}
      >
        {label}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="peer w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 pt-5 pb-2 text-sm outline-none transition-colors focus:border-[var(--accent)] disabled:opacity-60"
        value={query}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
      />
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-[var(--shadow-md)]"
        >
          {suggestions.map((item) => (
            <li key={item} role="option" aria-selected={item === value}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--muted)]/40"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item);
                  setQuery(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
