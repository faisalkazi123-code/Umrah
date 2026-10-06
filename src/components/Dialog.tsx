import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { Icon } from "./Icon";

/** Native <dialog>: focus is trapped and Escape closes it. */
function useModal(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const handler = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    d.addEventListener("cancel", handler);
    return () => d.removeEventListener("cancel", handler);
  }, [onClose]);
  return ref;
}

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  body?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({ open, title, body, confirmLabel, danger, onConfirm, onCancel }: ConfirmationDialogProps) {
  const { t } = useTranslation();
  const ref = useModal(open, onCancel);
  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(92vw,28rem)] rounded-3xl bg-surface p-6 text-ink shadow-xl backdrop:bg-black/50"
    >
      {open && (
        <div className="space-y-5">
          <h2 id="confirm-title" className="text-xl font-bold">
            {title}
          </h2>
          {body && <div className="text-muted">{body}</div>}
          <div className="flex flex-col gap-3">
            <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} autoFocus>
              {confirmLabel}
            </Button>
            <Button variant="ghost" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}

export function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  const ref = useModal(open, onClose);
  return (
    <dialog
      ref={ref}
      aria-labelledby="sheet-title"
      className="mx-auto mt-auto mb-0 max-h-[90dvh] w-full max-w-2xl rounded-t-3xl bg-surface p-0 text-ink shadow-xl backdrop:bg-black/50 md:mb-auto md:rounded-3xl"
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <h2 id="sheet-title" className="text-lg font-bold">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label={t("duas.close")} className="inline-flex size-12 items-center justify-center rounded-full hover:bg-surface-2">
              <Icon name="close" />
            </button>
          </div>
          <div className="overflow-y-auto p-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
