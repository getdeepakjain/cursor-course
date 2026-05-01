"use client";

import type { ReactNode } from "react";
import { CollapsedHeader } from "./CollapsedHeader";
import { DashboardSidebar } from "./DashboardSidebar";
import { useSidebarPersist } from "./use-sidebar-persist";

type Props = { children: ReactNode };

/**
 * Dashboard chrome: collapsible sidebar + optional collapsed header + main scroll area.
 */
export function DashboardShell({ children }: Props) {
  const { sidebarOpen, persistOpen } = useSidebarPersist();

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-neutral-900 antialiased">
      <DashboardSidebar sidebarOpen={sidebarOpen} onCollapse={() => persistOpen(false)} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!sidebarOpen ? <CollapsedHeader onExpand={() => persistOpen(true)} /> : null}
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
