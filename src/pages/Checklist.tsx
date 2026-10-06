import { useTranslation } from "react-i18next";
import { checklistItems, checklistSectionSchema } from "@shared/content";
import { Page } from "@/components/AppShell";
import { ChecklistItem } from "@/components/ChecklistItem";
import { ProgressBar } from "@/components/Progress";
import { useJourneyStore } from "@/store/journeyStore";

export default function Checklist() {
  const { t } = useTranslation();
  const { journey, toggleChecklist } = useJourneyStore();
  return (
    <Page title={t("checklist.title")}>
      {checklistSectionSchema.options.map((section) => {
        const items = checklistItems.filter((i) => i.section === section);
        if (items.length === 0) return null;
        const done = items.filter((i) => journey?.checklist[i.key]).length;
        return (
          <section key={section} className="space-y-3" aria-labelledby={`sec-${section}`}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 id={`sec-${section}`} className="text-lg font-bold">
                {t(`checklist.section.${section}`)}
              </h2>
              <span className="text-sm text-muted">{t("checklist.progress", { done, total: items.length })}</span>
            </div>
            <ProgressBar value={(done / items.length) * 100} label={t("checklist.progress", { done, total: items.length })} />
            {items.map((i) => (
              <ChecklistItem key={i.key} item={i} checked={!!journey?.checklist[i.key]} onChange={(c) => toggleChecklist(i.key, c)} />
            ))}
          </section>
        );
      })}
    </Page>
  );
}
