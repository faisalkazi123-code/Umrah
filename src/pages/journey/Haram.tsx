import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { getDua, getInstruction } from "@shared/content";
import { Page } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { DuaCard } from "@/components/Dua";
import { InstructionCard } from "@/components/InstructionCard";
import { useJourneyStore } from "@/store/journeyStore";
import { useToastStore } from "@/store/toastStore";

export default function Haram() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { journey, setFlag, tawaf } = useJourneyStore();
  const show = useToastStore((s) => s.show);
  const instruction = getInstruction("haram.entering");
  const dua = getDua("dua.enter_haram");
  const ihramDone = !!journey?.niyyahDone && !!journey.talbiyahDone;
  const started = !!journey && journey.tawaf !== "NOT_STARTED";

  const start = () => {
    if (!journey?.haramEntered) {
      const r = setFlag("haramEntered", true);
      if (!r.ok) return show(r.error);
    }
    if (!started) {
      const r = tawaf("START");
      if (!r.ok) return show(r.error);
    }
    navigate("/journey/tawaf");
  };

  return (
    <Page title={t("haram.title")} back="/journey/ihram/talbiyah">
      {!ihramDone && (
        <p className="rounded-2xl bg-accent-soft p-4" role="note">
          {t("haram.needIhram")}{" "}
          <Link to="/journey/ihram" className="font-semibold text-primary underline">
            {t("stage.ihram")}
          </Link>
        </p>
      )}
      {instruction && <InstructionCard item={instruction} />}
      {dua && <DuaCard dua={dua} />}
      <Button onClick={start}>{started ? t("haram.continueTawaf") : t("haram.startTawaf")}</Button>
    </Page>
  );
}
