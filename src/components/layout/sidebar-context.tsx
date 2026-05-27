"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
  mobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pp-sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((value) => {
      const next = !value;
      localStorage.setItem("pp-sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        toggle,
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarToggle() {
  const { collapsed, toggle, openMobile } = useSidebar();

  return (
    <>
      <button
        type="button"
        onClick={openMobile}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={toggle}
        className="hidden min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] md:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {collapsed ? "Expand" : "Collapse"}
      </button>
    </>
  );
}
