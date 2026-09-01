import { Check } from "lucide-react";

export function WorkspaceToast({ toast }: { toast: string }) {
  if (!toast) return null;

  return (
    <div className="toast">
      <Check size={15} /> {toast}
    </div>
  );
}
