type Props = {
  secret: string | null;
  onDismiss: () => void;
  onCopied: () => void;
};

/** One-time full secret display after `POST /api/keys`. */
export function NewSecretModal({ secret, onDismiss, onCopied }: Props) {
  if (!secret) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-labelledby="secret-once-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-amber-200/80 bg-amber-50 p-6 shadow-xl">
        <h2 id="secret-once-title" className="text-lg font-semibold text-amber-950">
          Copy your new secret
        </h2>
        <p className="mt-2 text-sm text-amber-900/80">This is the only time the full key is shown. Store it somewhere safe.</p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-amber-200 bg-white p-3 font-mono text-xs text-neutral-900">
          {secret}
        </pre>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(secret);
                onCopied();
              } catch {
                /* clipboard blocked */
              }
            }}
            className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-950"
          >
            Copy to clipboard
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-950 hover:bg-amber-100"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
