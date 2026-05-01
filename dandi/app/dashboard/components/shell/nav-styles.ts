/** Shared nav row look: inactive links / disabled placeholders. */
export const navInactive =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium leading-snug text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800 [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-neutral-400 hover:[&_svg]:text-neutral-500";

/** “Coming soon” rows: same spacing as links but non-interactive. */
export const navDisabled = `${navInactive} cursor-not-allowed opacity-70 hover:bg-transparent hover:text-neutral-500`;

/** Current route highlight (Overview). */
export const navActive =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-semibold leading-snug text-[#7C3AED] bg-violet-50 [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:text-[#7C3AED]";
