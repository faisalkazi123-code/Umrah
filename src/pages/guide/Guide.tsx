import { useTranslation } from "react-i18next";
import { getChecklistBySection, getInstructionsByGroup } from "@shared/content";
import { Page } from "@/components/AppShell";
import { ChecklistItem } from "@/components/ChecklistItem";
import { InstructionCard } from "@/components/InstructionCard";
import { useJourneyStore } from "@/store/journeyStore";
import { guideLinks, LinkList } from "../More";

export function GuideIndex() {
  const { t } = useTranslation();
  return (
    <Page title={t("guide.title")} back="/more">
      <LinkList links={guideLinks(t)} />
    </Page>
  );
}

/** Renders a guide section strictly from source content records. */
export function GuideSection({ group, titleKey }: { group: string; titleKey: string }) {
  const { t } = useTranslation();
  return (
    <Page title={t(titleKey)} back="/guide">
      {getInstructionsByGroup(group).map((i) => (
        <InstructionCard key={i.key} item={i} />
      ))}
    </Page>
  );
}

export function Reminders() {
  const { t } = useTranslation();
  const { journey, toggleChecklist } = useJourneyStore();
  return (
    <Page title={t("guide.reminders")} back="/guide">
      {getChecklistBySection("before_ihram").map((i) => (
        <ChecklistItem key={i.key} item={i} checked={!!journey?.checklist[i.key]} onChange={(c) => toggleChecklist(i.key, c)} />
      ))}
    </Page>
  );
}
