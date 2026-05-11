import type { KeyRow } from "../types";

type Props = {
  keyId: string | null;
  keys: KeyRow[];
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Destructive confirm: styled alertdialog (no native `confirm()`). */
export function DeleteKeyModal({ keyId, keys, busy, onCancel, onConfirm }: Props) {
  if (!keyId) return null;
  const label = keys.find((k) => k.id === keyId)?.name ?? "this key";
  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-t-2xl border-2 border-red-300 bg-white shadow-xl shadow-red-900/10 ring-1 ring-red-200/80 sm:rounded-xl">
        <div className="border-b border-red-200 bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 sm:px-6 sm:py-4">
          <h2 id="delete-title" className="text-lg font-semibold tracking-tight text-white">
            Delete API key
          </h2>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <p id="delete-desc" className="text-sm leading-relaxed text-red-950/90">
            Delete <span className="font-semibold text-red-900">{label}</span>? Apps using it will stop working. This
            cannot be undone.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="touch-manipulation rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 sm:py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onConfirm()}
              className="touch-manipulation rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50 sm:py-2"
            >
              {busy ? "Deleting…" : "Delete key"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
