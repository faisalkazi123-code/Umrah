import { useToastStore } from "@/store/toastStore";

export function Toast() {
  const { toast, dismiss } = useToastStore();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 md:bottom-6">
      {toast && (
        <div key={toast.id} role="status" className="pointer-events-auto flex max-w-md items-center gap-4 rounded-2xl bg-ink px-5 py-3 text-bg shadow-lg">
          <span className="flex-1">{toast.text}</span>
          {toast.action && (
            <button
              type="button"
              className="min-h-11 rounded-xl px-3 font-bold text-accent-soft underline"
              onClick={() => {
                toast.action?.onClick();
                dismiss();
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
