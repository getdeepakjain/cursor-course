type Props = {
  open: boolean;
  value: string;
  onValueChange: (v: string) => void;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function RenameKeyModal({ open, value, onValueChange, saving, onCancel, onSave }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-title"
    >
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-5 shadow-xl sm:rounded-xl sm:p-6">
        <h2 id="rename-title" className="text-lg font-semibold text-neutral-900">
          Rename key
        </h2>
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700">
            Name
            <input
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              className="mt-1.5 block w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-neutral-900 outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/30"
              autoFocus
            />
          </label>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="touch-manipulation rounded-lg border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 sm:py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave()}
            className="touch-manipulation rounded-lg bg-[#7C3AED] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50 sm:py-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
