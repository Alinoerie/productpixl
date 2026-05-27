/** Shared offsets for fixed bottom nav + safe area (matches AppShellBottomNav height). */
export const MOBILE_BOTTOM_NAV_OFFSET = "calc(4.5rem + env(safe-area-inset-bottom))";

export const MOBILE_STICKY_FOOTER_CLASS =
  "sticky z-10 md:static md:bottom-auto bottom-[var(--mobile-nav-offset)]";

export const MOBILE_FIXED_ABOVE_NAV_CLASS =
  "fixed inset-x-0 z-30 border-t border-[var(--border)] bg-[var(--card)]/95 p-3 backdrop-blur-md md:hidden bottom-[var(--mobile-nav-offset)]";
