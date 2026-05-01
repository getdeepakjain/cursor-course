"use client";

import { useCallback, useEffect, useState } from "react";
import { SIDEBAR_STORAGE_KEY } from "./constants";

/**
 * Sidebar visibility + persistence.
 * Defaults open on SSR; reads localStorage after mount to avoid hydration mismatch.
 */
export function useSidebarPersist() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (v === "0") setSidebarOpen(false);
    } catch {
      /* private mode / blocked storage */
    }
  }, []);

  const persistOpen = useCallback((open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  return { sidebarOpen, persistOpen };
}
