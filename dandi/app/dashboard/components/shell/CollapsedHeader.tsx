"use client";

import { MenuIcon } from "./sidebar-icons";

type Props = {
  onExpand: () => void;
};

/** Thin top bar when the sidebar is collapsed (hamburger restores the rail). */
export function CollapsedHeader({ onExpand }: Props) {
  return (
    <div className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b border-neutral-200/90 bg-white/95 px-3 backdrop-blur-sm">
      <button
        type="button"
        onClick={onExpand}
        className="flex size-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        aria-label="Open sidebar"
      >
        <MenuIcon />
      </button>
      <span className="text-sm font-semibold tracking-tight text-neutral-800">Dandi AI</span>
    </div>
  );
}
