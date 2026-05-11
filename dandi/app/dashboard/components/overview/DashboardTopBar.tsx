import { EnvelopeIcon, GithubIcon, MoonIcon, TwitterIcon } from "./icons";
import { AuthButtons } from "@/app/components/AuthButtons";

/** Status pill + placeholder social / theme actions (not wired to real auth). */
export function DashboardTopBar() {
  return (
    <div className="flex flex-col gap-3 border-b border-neutral-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-x-4 sm:gap-y-2 sm:px-6 md:px-8">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <AuthButtons callbackUrl="/dashboard" className="w-full min-w-0 sm:w-auto" />
        <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
          Operational
        </span>
      </div>
      <div className="hidden h-4 w-px shrink-0 bg-neutral-200 sm:block" />
      <div className="flex items-center gap-0.5 text-neutral-500 sm:gap-1">
        <a
          href="https://github.com/vercel/next.js"
          target="_blank"
          rel="noopener noreferrer"
          className="touch-manipulation rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="GitHub"
        >
          <GithubIcon />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="touch-manipulation rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Twitter"
        >
          <TwitterIcon />
        </a>
        <a
          href="mailto:support@example.com"
          className="touch-manipulation rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Email"
        >
          <EnvelopeIcon />
        </a>
        <button
          type="button"
          className="touch-manipulation rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Theme (placeholder)"
        >
          <MoonIcon />
        </button>
      </div>
    </div>
  );
}
