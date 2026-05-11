import { cn } from "@/lib/utils";

/** Primary CTA — warm accent, Wasp-inspired; works on light landing shell. */
export const landingBtnPrimary = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-amber-400/45",
  "bg-[#f5d148] px-4 text-sm font-semibold text-zinc-900 shadow-md shadow-amber-950/12",
  "outline-none transition-all hover:border-amber-500/55 hover:bg-[#e4c037] hover:shadow-lg hover:shadow-amber-950/18",
  "focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f3f1]",
  "active:translate-y-px",
  "dark:border-amber-300/40 dark:bg-amber-400 dark:text-zinc-950 dark:shadow-amber-950/25 dark:hover:bg-amber-300 dark:focus-visible:ring-offset-background"
);

export const landingBtnPrimarySm = cn(landingBtnPrimary, "h-9 px-3.5");

export const landingBtnPrimaryLg = cn(landingBtnPrimary, "h-11 min-h-11 w-full px-6 text-base sm:h-12 sm:min-h-12 sm:w-auto");

export const landingBtnSecondary = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-zinc-300/90",
  "bg-white/90 px-4 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm",
  "outline-none transition-all hover:border-zinc-400 hover:bg-white hover:shadow-md",
  "focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f3f3f1]",
  "active:translate-y-px",
  "dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-background"
);

export const landingBtnSecondaryLg = cn(landingBtnSecondary, "h-11 min-h-11 w-full px-6 text-base sm:h-12 sm:min-h-12 sm:w-auto");
