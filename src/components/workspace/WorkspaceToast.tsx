import { Check } from "lucide-react";

export function WorkspaceToast({ toast }: { toast: string }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[1500] flex max-w-[calc(100vw-40px)] items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--background)] px-4 py-3 text-xs font-semibold text-[var(--ink)] shadow-[var(--shadow-raised)]"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-[var(--success)] shadow-[var(--shadow-inset-sm)]">
        <Check size={14} strokeWidth={2.5} />
      </span>

      <span className="truncate">{toast}</span>
    </div>
  );
}