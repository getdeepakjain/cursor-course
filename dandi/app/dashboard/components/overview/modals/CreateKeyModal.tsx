import type { FormEvent } from "react";

type Props = {
  open: boolean;
  name: string;
  onNameChange: (v: string) => void;
  creating: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
};

/** First step: label only; server returns secret in a follow-up modal. */
export function CreateKeyModal({ open, name, onNameChange, creating, onClose, onSubmit }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-title"
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-xl sm:rounded-xl sm:p-6">
        <h2 id="create-title" className="text-lg font-semibold text-neutral-900">
          Create API key
        </h2>
        <p className="mt-1 text-sm text-neutral-500">Add a label so you can recognize this key later.</p>
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-neutral-700">
            Name
            <input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Production"
              className="mt-1.5 block w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-neutral-900 outline-none ring-[#7C3AED]/30 focus:border-[#7C3AED] focus:ring-2"
              autoFocus
            />
          </label>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="touch-manipulation rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="touch-manipulation rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 sm:py-2"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
