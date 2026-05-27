"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationPrefs {
  emailOnGenerationComplete: boolean;
  emailOnLowCredits: boolean;
  marketingUpdates: boolean;
  weeklyDigest: boolean;
}

interface NotificationPrefsCardProps {
  initialPrefs: NotificationPrefs;
}

export function NotificationPrefsCard({ initialPrefs }: NotificationPrefsCardProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function updatePref(key: keyof NotificationPrefs, value: boolean) {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/account/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // revert on error
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Generation complete</p>
              <p className="text-xs text-[var(--muted-fg)]">Email when a product run finishes</p>
            </div>
            <Toggle
              checked={prefs.emailOnGenerationComplete}
              onChange={(v) => updatePref("emailOnGenerationComplete", v)}
              disabled={saving}
            />
          </li>
          <li className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Low credit balance</p>
              <p className="text-xs text-[var(--muted-fg)]">Email when credits fall below 5</p>
            </div>
            <Toggle
              checked={prefs.emailOnLowCredits}
              onChange={(v) => updatePref("emailOnLowCredits", v)}
              disabled={saving}
            />
          </li>
          <li className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Product updates</p>
              <p className="text-xs text-[var(--muted-fg)]">Newsletter and feature announcements</p>
            </div>
            <Toggle
              checked={prefs.marketingUpdates}
              onChange={(v) => updatePref("marketingUpdates", v)}
              disabled={saving}
            />
          </li>
          <li className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Weekly digest</p>
              <p className="text-xs text-[var(--muted-fg)]">Summary of credits, assets, and listings every Monday</p>
            </div>
            <Toggle
              checked={prefs.weeklyDigest}
              onChange={(v) => updatePref("weeklyDigest", v)}
              disabled={saving}
            />
          </li>
        </ul>
        {saved && (
          <p className="mt-3 text-xs font-medium text-[var(--accent)]">Preferences saved</p>
        )}
      </CardContent>
    </Card>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        backgroundColor: checked ? "var(--accent)" : "var(--muted)",
      }}
    >
      <span
        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)] transition-transform"
        style={{
          transform: checked ? "translateX(20px)" : "translateX(0)",
        }}
      />
    </button>
  );
}
