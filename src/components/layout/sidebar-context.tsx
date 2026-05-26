"use client";

import { createContext, useContext, useEffect, useState } from "react";

const SidebarContext = createContext({
  collapsed: false,
  toggle: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

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

  return <SidebarContext.Provider value={{ collapsed, toggle }}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarToggle() {
  const { collapsed, toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-fg)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? "Expand" : "Toggle sidebar"}
    </button>
  );
}
