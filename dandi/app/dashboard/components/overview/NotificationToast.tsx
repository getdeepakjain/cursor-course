import type { ToastVariant } from "./types";

function ToastCheckIcon() {
  return (
    <svg className="size-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function ToastCloseIcon() {
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ToastTrashIcon() {
  return (
    <svg className="size-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3H21l-1 13h-3.778M4.5 5.25h15M9.75 5.25v-.878a2.25 2.25 0 0 1 .66-1.591L11.25 2.25h1.5l1.84 1.591a2.25 2.25 0 0 1 .66 1.591v.878"
      />
    </svg>
  );
}

type Props = {
  message: string;
  variant: ToastVariant;
  onDismiss: () => void;
};

/** Floating toast: success (green) or destructive action feedback (red). */
export function NotificationToast({ message, variant, onDismiss }: Props) {
  const danger = variant === "danger";
  return (
    <div
      className={
        danger
          ? "pointer-events-auto flex max-w-[min(90vw,28rem)] items-center gap-3 rounded-full bg-red-600 px-4 py-3 pl-5 pr-2 text-sm font-medium text-white shadow-lg shadow-red-900/30"
          : "pointer-events-auto flex max-w-[min(90vw,28rem)] items-center gap-3 rounded-full bg-emerald-500 px-4 py-3 pl-5 pr-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/20"
      }
      role="status"
      aria-live={danger ? "assertive" : "polite"}
    >
      {danger ? <ToastTrashIcon /> : <ToastCheckIcon />}
      <span className="min-w-0 flex-1 leading-snug">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-full p-2 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
        aria-label="Dismiss notification"
      >
        <ToastCloseIcon />
      </button>
    </div>
  );
}
