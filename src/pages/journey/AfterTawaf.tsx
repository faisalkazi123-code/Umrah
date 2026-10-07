import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { getChecklistBySection, getInstruction } from "@shared/content";
import { Page } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { ChecklistItem } from "@/components/ChecklistItem";
import { InstructionCard } from "@/components/InstructionCard";
import { useJourneyStore } from "@/store/journeyStore";
import { useToastStore } from "@/store/toastStore";

export default function AfterTawaf() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { journey, toggleChecklist, saee } = useJourneyStore();
  const show = useToastStore((s) => s.show);
  const tawafDone = journey?.tawaf === "COMPLETED";
  const info = getInstruction("tawaf.after");

  const startSaee = () => {
    if (journey?.saee === "NOT_STARTED") {
      const r = saee("START");
      if (!r.ok) return show(r.error);
    }
    navigate("/journey/saee");
  };

  return (
    <Page title={t("afterTawaf.title")} back="/journey/tawaf">
      {!tawafDone && (
        <p className="rounded-2xl bg-accent-soft p-4" role="note">
          {t("afterTawaf.needTawaf")}{" "}
          <Link to="/journey/tawaf" className="font-semibold text-primary underline">
            {t("tawaf.title")}
          </Link>
        </p>
      )}
      <p className="text-lg">{t("afterTawaf.intro")}</p>
      <div className="space-y-3">
        {getChecklistBySection("tawaf").map((i) => (
          <ChecklistItem key={i.key} item={i} checked={!!journey?.checklist[i.key]} onChange={(c) => toggleChecklist(i.key, c)} />
        ))}
      </div>
      {info && <InstructionCard item={info} />}
      <Button onClick={startSaee} disabled={!tawafDone}>
        {t("afterTawaf.startSaee")}
      </Button>
    </Page>
  );
}
