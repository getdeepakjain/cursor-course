/** Support CTA + tiny REST route hint for developers. */
export function DashboardOverviewFooter() {
  return (
    <>
      <footer className="mx-8 mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white px-6 py-4 text-sm text-neutral-600 shadow-sm">
        <p>Have any questions, feedback or need support? We&apos;d love to hear from you!</p>
        <a
          href="mailto:support@example.com"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6d28d9]"
        >
          Contact us
        </a>
      </footer>
      <p className="mt-6 px-8 text-center text-xs text-neutral-400">
        REST: <code className="font-mono text-neutral-500">GET/POST /api/keys</code>,{" "}
        <code className="font-mono text-neutral-500">GET/PUT/DELETE /api/keys/[id]</code>
      </p>
    </>
  );
}
