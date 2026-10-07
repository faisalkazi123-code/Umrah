import { useTranslation } from "react-i18next";
import { getChecklistBySection, getInstructionsByGroup } from "@shared/content";
import { Page } from "@/components/AppShell";
import { ButtonLink } from "@/components/Button";
import { ChecklistItem } from "@/components/ChecklistItem";
import { GenderInstructionCards } from "@/components/InstructionCard";
import { useJourneyStore } from "@/store/journeyStore";

export default function Ihram() {
  const { t } = useTranslation();
  const { journey, toggleChecklist } = useJourneyStore();
  const items = getChecklistBySection("ihram");
  return (
    <Page title={t("ihram.title")} back="/journey">
      <p className="text-lg">{t("ihram.intro")}</p>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{t("ihram.checklist")}</h2>
        {items.map((i) => (
          <ChecklistItem key={i.key} item={i} checked={!!journey?.checklist[i.key]} onChange={(c) => toggleChecklist(i.key, c)} />
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{t("ihram.guidance")}</h2>
        <GenderInstructionCards items={getInstructionsByGroup("ihram")} />
      </section>
      <ButtonLink to="/journey/ihram/niyyah">{t("ihram.next")}</ButtonLink>
    </Page>
  );
}
