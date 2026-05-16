import { cn } from "@/lib/utils";

/** Primary CTA — violet accent aligned with dashboard. */
export const landingBtnPrimary = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/30",
  "bg-gradient-to-b from-violet-600 to-violet-700 px-4 text-sm font-semibold text-white shadow-md shadow-violet-900/25",
  "outline-none transition-all hover:from-violet-500 hover:to-violet-600 hover:shadow-lg hover:shadow-violet-900/30",
  "focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafaf9]",
  "active:translate-y-px",
  "dark:from-violet-500 dark:to-violet-600 dark:focus-visible:ring-offset-[#0c0a12]"
);

export const landingBtnPrimarySm = cn(landingBtnPrimary, "h-9 px-3.5");

export const landingBtnPrimaryLg = cn(landingBtnPrimary, "h-11 min-h-11 w-full px-6 text-base sm:h-12 sm:min-h-12 sm:w-auto");

export const landingBtnSecondary = cn(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-zinc-300/90",
  "bg-white/90 px-4 text-sm font-semibold text-zinc-800 shadow-sm backdrop-blur-sm",
  "outline-none transition-all hover:border-zinc-400 hover:bg-white hover:shadow-md",
  "focus-visible:ring-2 focus-visible:ring-violet-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafaf9]",
  "active:translate-y-px",
  "dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-background"
);

export const landingBtnSecondaryLg = cn(landingBtnSecondary, "h-11 min-h-11 w-full px-6 text-base sm:h-12 sm:min-h-12 sm:w-auto");
