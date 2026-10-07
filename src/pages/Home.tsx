import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { getContinueRoute, getCurrentStage, getProgress } from "@shared/domain/journey/journeyMachine";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { CircularProgress } from "@/components/Progress";
import { APP_CONFIG } from "@/config/app";
import { useJourneyStore } from "@/store/journeyStore";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { journey, startJourney } = useJourneyStore();
  const progress = getProgress(journey);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
      <header className="flex items-center gap-3">
        <img src={APP_CONFIG.logo} alt="" className="size-10 md:hidden" />
        <h1 className="text-2xl font-bold text-primary">{APP_CONFIG.name}</h1>
      </header>

      <Card className="flex flex-col items-center gap-5 py-8 text-center">
        {journey ? (
          <>
            <CircularProgress value={progress.percent} size={140}>
              <span className="block text-3xl font-bold">{progress.percent}%</span>
            </CircularProgress>
            {journey.completedAt ? (
              <p className="text-lg font-semibold">{t("home.completed")}</p>
            ) : (
              <div>
                <p className="text-muted">{t("home.currentStage")}</p>
                <p className="text-2xl font-bold" data-testid="current-stage">
                  {t(`stage.${getCurrentStage(journey)}`)}
                </p>
              </div>
            )}
            <span className="sr-only">{t("home.progress", { percent: progress.percent })}</span>
            <ButtonLink to={getContinueRoute(journey)}>{journey.completedAt ? t("home.review") : t("home.continueUmrah")}</ButtonLink>
          </>
        ) : (
          <>
            <p className="text-lg">{t("home.noJourney")}</p>
            <Button
              onClick={() => {
                startJourney();
                navigate("/journey/ihram");
              }}
            >
              {t("home.startUmrah")}
            </Button>
          </>
        )}
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[
          { to: "/duas", icon: "book" as const, label: t("nav.duas") },
          { to: "/checklist", icon: "checklist" as const, label: t("nav.checklist") },
          { to: "/guide", icon: "info" as const, label: t("home.guide") },
        ].map((l) => (
          <ButtonLink key={l.to} to={l.to} variant="secondary" className="flex-col py-3">
            <Icon name={l.icon} />
            {l.label}
          </ButtonLink>
        ))}
      </div>
    </div>
  );
}
