import { EnvelopeIcon, GithubIcon, MoonIcon, TwitterIcon } from "./icons";

/** Status pill + placeholder social / theme actions (not wired to real auth). */
export function DashboardTopBar() {
  return (
    <div className="flex items-center justify-end gap-3 border-b border-neutral-200/80 bg-white/80 px-8 py-3 backdrop-blur-sm">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
        Operational
      </span>
      <div className="mx-2 hidden h-4 w-px bg-neutral-200 sm:block" />
      <div className="flex items-center gap-1 text-neutral-500">
        <a
          href="https://github.com/vercel/next.js"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="GitHub"
        >
          <GithubIcon />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Twitter"
        >
          <TwitterIcon />
        </a>
        <a
          href="mailto:support@example.com"
          className="rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Email"
        >
          <EnvelopeIcon />
        </a>
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-neutral-100 hover:text-neutral-800"
          aria-label="Theme (placeholder)"
        >
          <MoonIcon />
        </button>
      </div>
    </div>
  );
}
