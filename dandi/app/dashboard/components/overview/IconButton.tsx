import type { ReactNode } from "react";

type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
};

/** Icon-only control in the keys table (tooltip via native `title`). */
export function IconButton({ label, onClick, disabled, children }: Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-9 min-w-9 touch-manipulation items-center justify-center rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-[#7C3AED] disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
