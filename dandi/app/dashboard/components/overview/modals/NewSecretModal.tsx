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
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="alertdialog"
      aria-labelledby="secret-once-title"
    >
      <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-amber-200/80 bg-amber-50 p-5 shadow-xl sm:rounded-xl sm:p-6">
        <h2 id="secret-once-title" className="text-lg font-semibold text-amber-950">
          Copy your new secret
        </h2>
        <p className="mt-2 text-sm text-amber-900/80">This is the only time the full key is shown. Store it somewhere safe.</p>
        <pre className="mt-4 max-h-[40vh] overflow-auto break-all rounded-lg border border-amber-200 bg-white p-3 font-mono text-[11px] text-neutral-900 sm:text-xs">
          {secret}
        </pre>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
            className="touch-manipulation rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-950 sm:py-2"
          >
            Copy to clipboard
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="touch-manipulation rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-medium text-amber-950 hover:bg-amber-100 sm:py-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
