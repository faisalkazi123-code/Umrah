import { useTranslation } from "react-i18next";
import type { ChecklistItem as Item } from "@shared/content/schema";
import { localized } from "@/i18n";
import { ReviewBadge } from "./ContentNotice";
import { Icon } from "./Icon";

export function ChecklistItem({ item, checked, onChange }: { item: Item; checked: boolean; onChange: (checked: boolean) => void }) {
  const { t, i18n } = useTranslation();
  const id = `chk-${item.key}`;
  return (
    <label
      htmlFor={id}
      className={`flex min-h-14 cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3 transition-colors ${
        checked ? "border-primary/40 bg-primary-soft" : "border-line bg-surface hover:bg-surface-2"
      }`}
    >
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden="true"
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 peer-focus-visible:outline-3 peer-focus-visible:outline-accent ${
          checked ? "border-primary bg-primary text-primary-ink" : "border-muted/60"
        }`}
      >
        {checked && <Icon name="check" className="size-5" />}
      </span>
      <span className="flex-1">
        <span className={`block text-lg ${checked ? "text-muted line-through decoration-1" : ""}`}>{localized(item.label, i18n.language)}</span>
        <span className="mt-1 flex flex-wrap gap-2">
          {item.audience !== "all" && <span className="text-sm font-medium text-primary">{t(`audience.${item.audience}`)}</span>}
          <ReviewBadge status={item.reviewStatus} />
        </span>
      </span>
    </label>
  );
}
