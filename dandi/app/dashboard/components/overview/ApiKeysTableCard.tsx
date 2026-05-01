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
    <div className="mt-8 px-8">
      <div className="rounded-xl border border-neutral-200/80 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">API keys</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
              The key is used to authenticate your requests to the API. To learn more, see the{" "}
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
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-md shadow-violet-300/40 transition-transform hover:scale-105 hover:bg-[#6d28d9] active:scale-95"
            aria-label="Create API key"
          >
            <PlusIcon />
          </button>
        </div>

        {error ? (
          <p className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <div className="overflow-x-auto px-2 pb-2">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Usage</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3 text-right">Options</th>
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
                    <td className="px-4 py-4 tabular-nums text-neutral-600">{row.usage.toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <span className="inline-block max-w-[min(420px,70vw)] truncate rounded-full bg-neutral-100 px-3 py-1.5 font-mono text-xs text-neutral-800">
                        {revealed[row.id] ?? row.maskedSecret}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-0.5">
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
