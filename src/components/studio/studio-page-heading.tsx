"use client";

import { usePathname } from "next/navigation";
import { CONTENT_STUDIO_TABS } from "@/lib/studio-routes";

/** Visible or screen-reader page title for studio sub-routes (e2e + a11y). */
export function StudioPageHeading() {
  const pathname = usePathname();
  const tab = CONTENT_STUDIO_TABS.find((t) => t.match(pathname) && t.href !== "/studio");
  if (!tab) return null;

  return (
    <h1 className="sr-only">{tab.label}</h1>
  );
}
