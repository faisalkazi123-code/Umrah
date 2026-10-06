import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router";
import { getInstructionsByGroup } from "@shared/content";
import { Page } from "@/components/AppShell";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmationDialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { GenderInstructionCards } from "@/components/InstructionCard";
import { useJourneyStore } from "@/store/journeyStore";
import { useToastStore } from "@/store/toastStore";

export function Completion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { journey, completeUmrah } = useJourneyStore();
  const show = useToastStore((s) => s.show);
  const [confirming, setConfirming] = useState(false);
  const saeeDone = journey?.saee === "COMPLETED";

  if (journey?.completedAt) return <Navigate to="/journey/complete" replace />;

  return (
    <Page title={t("completion.title")} back="/journey/saee">
      {!saeeDone && (
        <p className="rounded-2xl bg-accent-soft p-4" role="note">
          {t("completion.needSaee")}
        </p>
      )}
      <GenderInstructionCards items={getInstructionsByGroup("completion")} />
      <Button onClick={() => setConfirming(true)} disabled={!saeeDone}>
        {t("completion.complete")}
      </Button>
      <ConfirmationDialog
        open={confirming}
        title={t("completion.confirmTitle")}
        body={t("completion.confirmBody")}
        confirmLabel={t("completion.confirm")}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          const r = completeUmrah();
          if (!r.ok) return show(r.error);
          navigate("/journey/complete");
        }}
      />
    </Page>
  );
}

export function UmrahComplete() {
  const { t } = useTranslation();
  const journey = useJourneyStore((s) => s.journey);
  if (!journey?.completedAt) return <Navigate to="/journey" replace />;
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-10 text-center">
      <h1 className="text-4xl font-bold text-primary">{t("complete.title")}</h1>
      <p className="text-xl font-semibold tracking-widest text-accent">{t("complete.subtitle")}</p>
      <Card className="w-full">
        <ul className="space-y-3 text-start">
          {(["ihram", "tawaf", "saee", "completion"] as const).map((s) => (
            <li key={s} className="flex items-center gap-3 text-lg">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-ink">
                <Icon name="check" className="size-5" />
              </span>
              {t(`stage.${s}`)}
            </li>
          ))}
        </ul>
      </Card>
      <div className="flex w-full flex-col gap-3">
        <ButtonLink to="/journey">{t("complete.review")}</ButtonLink>
        <ButtonLink to="/duas" variant="secondary">
          {t("complete.duas")}
        </ButtonLink>
        <ButtonLink to="/checklist" variant="secondary">
          {t("complete.checklist")}
        </ButtonLink>
      </div>
    </div>
  );
}
