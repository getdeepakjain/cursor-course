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

        <div className="-mx-0 overflow-x-auto px-1 pb-2 sm:px-2">
          <table className="min-w-[36rem] text-left text-sm sm:min-w-full">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <th className="whitespace-nowrap px-3 py-3 sm:px-4">Name</th>
                <th className="whitespace-nowrap px-3 py-3 sm:px-4">Summarizer usage</th>
                <th className="min-w-[8rem] px-3 py-3 sm:min-w-0 sm:px-4">Key</th>
                <th className="whitespace-nowrap px-3 py-3 text-right sm:px-4">Options</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-500 sm:py-12">
                    Loading…
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-500 sm:py-12">
                    No API keys yet. Use the + button to create one.
                  </td>
                </tr>
              ) : (
                keys.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-neutral-100 transition-colors hover:bg-neutral-50/80"
                  >
                    <td className="max-w-[10rem] truncate px-3 py-3 font-medium text-neutral-900 sm:max-w-none sm:px-4 sm:py-4">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 tabular-nums text-neutral-600 sm:px-4 sm:py-4">
                      {row.usage.toLocaleString()}
                    </td>
                    <td className="max-w-0 px-3 py-3 sm:max-w-none sm:px-4 sm:py-4">
                      <span className="inline-block max-w-[min(240px,55vw)] truncate rounded-full bg-neutral-100 px-2.5 py-1.5 font-mono text-[11px] text-neutral-800 sm:max-w-[min(420px,50vw)] sm:px-3 sm:text-xs">
                        {revealed[row.id] ?? row.maskedSecret}
                      </span>
                    </td>
                    <td className="px-2 py-3 sm:px-4 sm:py-4">
                      <div className="flex flex-wrap justify-end gap-0.5 sm:flex-nowrap">
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
