"use client";

import { MenuIcon } from "./sidebar-icons";
import { AuthButtons } from "@/app/components/AuthButtons";

type Props = {
  onExpand: () => void;
};

/** Thin top bar when the sidebar is collapsed (hamburger restores the rail). */
export function CollapsedHeader({ onExpand }: Props) {
  return (
    <div className="sticky top-0 z-20 flex h-12 min-h-12 shrink-0 items-center gap-2 border-b border-neutral-200/90 bg-white/95 px-3 backdrop-blur-sm sm:h-11 sm:min-h-11">
      <button
        type="button"
        onClick={onExpand}
        className="flex size-10 shrink-0 touch-manipulation items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:size-9"
        aria-label="Open sidebar"
      >
        <MenuIcon />
      </button>
      <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-neutral-800">Dandi AI</span>
      <div className="ml-auto min-w-0 shrink-0">
        <AuthButtons variant="compact" callbackUrl="/dashboard" />
      </div>
    </div>
  );
}
