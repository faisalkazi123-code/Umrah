import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { getCurrentStage, getProgress, getStageStatus } from "@shared/domain/journey/journeyMachine";
import { STAGE_KEYS, type Journey, type StageKey } from "@shared/domain/journey/journeyTypes";
import { Page } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { ProgressBar } from "@/components/Progress";
import { StageCard } from "@/components/StageCard";
import { useJourneyStore } from "@/store/journeyStore";

function stageRoute(stage: StageKey, j: Journey | null): string {
  switch (stage) {
    case "ihram":
      return "/journey/ihram";
    case "tawaf":
      return j && (j.tawaf !== "NOT_STARTED" || j.haramEntered) ? "/journey/tawaf" : "/journey/haram";
    case "saee":
      return j?.tawaf === "COMPLETED" && j.saee === "NOT_STARTED" ? "/journey/tawaf/complete" : "/journey/saee";
    case "completion":
      return "/journey/completion";
    case "complete":
      return "/journey/complete";
  }
}

export default function JourneyOverview() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { journey, startJourney } = useJourneyStore();
  const progress = getProgress(journey);
  const current = journey ? getCurrentStage(journey) : null;
  const stages = STAGE_KEYS.filter((s) => s !== "complete" || journey?.completedAt);

  return (
    <Page title={t("journey.title")}>
      {journey ? (
        <div className="space-y-2">
          <ProgressBar value={progress.percent} label={t("home.progress", { percent: progress.percent })} />
          <p className="text-sm text-muted">{t("home.progress", { percent: progress.percent })}</p>
        </div>
      ) : (
        <Button
          onClick={() => {
            startJourney();
            navigate("/journey/ihram");
          }}
        >
          {t("home.startUmrah")}
        </Button>
      )}
      <ol className="space-y-3">
        {stages.map((s, i) => (
          <li key={s}>
            <StageCard
              n={i + 1}
              stage={s}
              status={journey ? getStageStatus(journey, s) : "NOT_STARTED"}
              to={stageRoute(s, journey)}
              current={current === s}
            />
          </li>
        ))}
      </ol>
    </Page>
  );
}
