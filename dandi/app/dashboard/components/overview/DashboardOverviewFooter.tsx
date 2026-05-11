/** Support CTA + tiny REST route hint for developers. */
export function DashboardOverviewFooter() {
  return (
    <>
      <footer className="mx-4 mt-8 flex flex-col gap-4 rounded-xl border border-neutral-200/80 bg-white px-4 py-4 text-sm text-neutral-600 shadow-sm sm:mx-6 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 md:mx-8">
        <p className="min-w-0 leading-relaxed">
          Have any questions, feedback or need support? We&apos;d love to hear from you!
        </p>
        <a
          href="mailto:support@example.com"
          className="inline-flex shrink-0 touch-manipulation items-center justify-center rounded-full bg-[#7C3AED] px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6d28d9]"
        >
          Contact us
        </a>
      </footer>
      <p className="mt-4 px-4 text-center text-xs leading-relaxed text-neutral-400 sm:mt-6 sm:px-6 md:px-8">
        REST:{" "}
        <code className="break-all font-mono text-neutral-500">GET/POST /api/keys</code>,{" "}
        <code className="break-all font-mono text-neutral-500">GET/PUT/DELETE /api/keys/[id]</code>
      </p>
    </>
  );
}
