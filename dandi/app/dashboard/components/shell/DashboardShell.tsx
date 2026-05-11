"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useIsNarrowLayout } from "@/hooks/use-is-narrow-layout";
import { CollapsedHeader } from "./CollapsedHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { useSidebarPersist } from "./use-sidebar-persist";

type Props = { children: ReactNode };

/**
 * Dashboard chrome: collapsible sidebar + optional collapsed header + main scroll area.
 * On narrow viewports the sidebar becomes a fixed drawer with a dimmed backdrop.
 */
export function DashboardShell({ children }: Props) {
  const { sidebarOpen, persistOpen } = useSidebarPersist();
  const narrow = useIsNarrowLayout();

  useEffect(() => {
    if (!narrow || !sidebarOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [narrow, sidebarOpen]);

  return (
    <div className="relative flex min-h-screen bg-[#F3F4F6] text-neutral-900 antialiased">
      {narrow && sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[34] bg-black/45 backdrop-blur-[1px] transition-opacity"
          aria-label="Close navigation menu"
          onClick={() => persistOpen(false)}
        />
      ) : null}

      <DashboardSidebar
        layout={narrow ? "drawer" : "rail"}
        sidebarOpen={sidebarOpen}
        onCollapse={() => persistOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!sidebarOpen ? <CollapsedHeader onExpand={() => persistOpen(true)} /> : null}
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
