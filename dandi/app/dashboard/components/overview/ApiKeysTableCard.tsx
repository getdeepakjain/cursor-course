import { IconButton } from "./IconButton";
import { CopyIcon, EyeIcon, EyeSlashIcon, PencilIcon, PlusIcon, TrashIcon } from "./icons";
import type { KeyRow } from "./types";

type Props = {
  keys: KeyRow[];
  loading: boolean;
  error: string | null;
  revealed: Record<string, string>;
  revealLoading: string | null;
  onOpenCreate: () => void;
  onToggleReveal: (id: string) => void;
  onCopy: (row: KeyRow) => void;
  onRename: (row: KeyRow) => void;
  onRequestDelete: (id: string) => void;
};

function KeyRowActions({
  row,
  revealed,
  revealLoading,
  onToggleReveal,
  onCopy,
  onRename,
  onRequestDelete,
}: {
  row: KeyRow;
  revealed: Record<string, string>;
  revealLoading: string | null;
  onToggleReveal: (id: string) => void;
  onCopy: (row: KeyRow) => void;
  onRename: (row: KeyRow) => void;
  onRequestDelete: (id: string) => void;
}) {
  return (
    <>
      <IconButton
        label={revealed[row.id] ? "Hide key" : "Reveal key"}
        onClick={() => void onToggleReveal(row.id)}
        disabled={revealLoading === row.id}
      >
        {revealed[row.id] ? <EyeSlashIcon /> : <EyeIcon />}
      </IconButton>
      <IconButton label="Copy key" onClick={() => void onCopy(row)}>
        <CopyIcon />
      </IconButton>
      <IconButton label="Rename" onClick={() => onRename(row)}>
        <PencilIcon />
      </IconButton>
      <IconButton label="Delete" onClick={() => onRequestDelete(row.id)}>
        <TrashIcon />
      </IconButton>
    </>
  );
}

/** API keys table, inline errors, and FAB to open the create modal. */
export function ApiKeysTableCard({
  keys,
  loading,
  error,
  revealed,
  revealLoading,
  onOpenCreate,
  onToggleReveal,
  onCopy,
  onRename,
  onRequestDelete,
}: Props) {
  const actionProps = {
    revealed,
    revealLoading,
    onToggleReveal,
    onCopy,
    onRename,
    onRequestDelete,
  };

  return (
    <div className="mt-6 px-4 sm:mt-8 sm:px-6 md:px-8">
      <div className="rounded-xl border border-neutral-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-neutral-100 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">API keys</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
              The key authenticates API requests. Usage counts GitHub README summarizer calls per key. To learn more,
              see the{" "}
              <a
                href="https://nextjs.org/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#7C3AED] hover:underline"
              >
                documentation
              </a>{" "}
              page.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
            <button
              type="button"
              onClick={onOpenCreate}
              className="hidden w-full touch-manipulation items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-300/30 hover:bg-[#6d28d9] sm:inline-flex sm:w-auto"
            >
              <PlusIcon />
              Create key
            </button>
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex size-10 touch-manipulation items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-md shadow-violet-300/40 transition-transform hover:scale-105 hover:bg-[#6d28d9] active:scale-95 sm:hidden"
              aria-label="Create API key"
            >
              <PlusIcon />
            </button>
          </div>
        </div>

        {error ? (
          <p
            className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800 sm:mx-6"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Mobile: stacked cards */}
        <div className="divide-y divide-neutral-100 sm:hidden">
          {loading ? (
            <p className="px-4 py-10 text-center text-neutral-500">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="px-4 py-10 text-center text-neutral-500">No API keys yet. Use the + button to create one.</p>
          ) : (
            keys.map((row) => (
              <div key={row.id} className="space-y-3 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Name</p>
                    <p className="mt-0.5 break-words font-medium text-neutral-900">{row.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Usage</p>
                    <p className="mt-0.5 tabular-nums text-neutral-600">{row.usage.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Key</p>
                  <span className="mt-1 block w-full truncate rounded-full bg-neutral-100 px-2.5 py-1.5 font-mono text-[11px] text-neutral-800">
                    {revealed[row.id] ?? row.maskedSecret}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Options</p>
                  <div className="flex shrink-0 flex-nowrap gap-0.5">
                    <KeyRowActions row={row} {...actionProps} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden overflow-x-auto px-2 pb-2 sm:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <th className="whitespace-nowrap px-4 py-3">Name</th>
                <th className="whitespace-nowrap px-4 py-3">Summarizer usage</th>
                <th className="px-4 py-3">Key</th>
                <th className="whitespace-nowrap px-4 py-3 text-right">Options</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-neutral-500">
                    Loading…
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-neutral-500">
                    No API keys yet. Use the + button to create one.
                  </td>
                </tr>
              ) : (
                keys.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-neutral-100 transition-colors hover:bg-neutral-50/80"
                  >
                    <td className="px-4 py-4 font-medium text-neutral-900">{row.name}</td>
                    <td className="whitespace-nowrap px-4 py-4 tabular-nums text-neutral-600">
                      {row.usage.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block max-w-[min(420px,50vw)] truncate rounded-full bg-neutral-100 px-3 py-1.5 font-mono text-xs text-neutral-800">
                        {revealed[row.id] ?? row.maskedSecret}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-nowrap justify-end gap-0.5">
                        <KeyRowActions row={row} {...actionProps} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
