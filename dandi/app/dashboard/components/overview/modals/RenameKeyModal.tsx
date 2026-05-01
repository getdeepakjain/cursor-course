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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-title"
    >
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-xl">
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
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave()}
            className="rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
