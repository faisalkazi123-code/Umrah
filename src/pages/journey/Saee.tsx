import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { getDua, getInstruction } from "@shared/content";
import { canUndo, completedRounds, currentRound, TOTAL_ROUNDS } from "@shared/domain/rounds/roundMachine";
import { getSaeeDirection } from "@shared/domain/saee/saeeDirection";
import { getSaeeLocation } from "@shared/domain/saee/saeeMachine";
import { Page } from "@/components/AppShell";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmationDialog } from "@/components/Dialog";
import { DuaViewer } from "@/components/Dua";
import { Icon } from "@/components/Icon";
import { InstructionCard } from "@/components/InstructionCard";
import { RoundProgress } from "@/components/Progress";
import { useJourneyStore } from "@/store/journeyStore";
import { useRoundActions } from "./useRoundActions";

export default function Saee() {
  const { t } = useTranslation();
  const { journey, saee } = useJourneyStore();
  const [duaOpen, setDuaOpen] = useState(false);
  const state = journey?.saee ?? "NOT_STARTED";
  const completed = completedRounds(state);
  const round = currentRound(state);
  const direction = round ? getSaeeDirection(round) : null;
  const tawafDone = journey?.tawaf === "COMPLETED";
  const locked = !!journey?.shavingDone;
  const actions = useRoundActions(saee, {
    completed: (n) => t("saee.completedToast", { n }),
    undone: (n) => t("saee.undone", { n }),
    undoLabel: t("saee.undo"),
  });
  const greenLights = getInstruction("saee.green_lights");
  const guidance = getInstruction("saee.guidance");
  const after = getInstruction("saee.complete");
  const dua = getDua("dua.saee") ?? null;
  const lastCompleted = state === "COMPLETED" ? TOTAL_ROUNDS : completed;

  if (!tawafDone && state === "NOT_STARTED") {
    return (
      <Page title={t("saee.title")} back="/journey">
        <p className="rounded-2xl bg-accent-soft p-4" role="note">
          {t("saee.needTawaf")}
        </p>
        <ButtonLink to="/journey/tawaf">{t("tawaf.title")}</ButtonLink>
      </Page>
    );
  }

  return (
    <Page title={t("saee.title")} back="/journey">
      <Card className="space-y-5 text-center">
        <p className="text-sm font-semibold tracking-widest text-muted uppercase">{t("saee.round")}</p>
        <p className="text-6xl font-bold text-primary tabular-nums" data-testid="saee-counter" aria-live="polite" dir="ltr">
          {state === "COMPLETED" ? <Icon name="check" className="mx-auto size-16" /> : `${round ?? 0} / ${TOTAL_ROUNDS}`}
        </p>
        <RoundProgress completed={completed} current={round} label={t("saee.completedCount", { count: completed })} />
        <p className="text-muted" data-testid="saee-completed">
          {t("saee.completedCount", { count: completed })}
        </p>
      </Card>

      {direction && (
        <Card className="space-y-4" data-testid="saee-direction">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <div className="rounded-2xl bg-surface-2 p-3">
              <p className="text-sm text-muted">{t("saee.location")}</p>
              <p className="text-xl font-bold" data-testid="saee-from">
                {t(`saee.${direction.from}`)}
              </p>
            </div>
            <Icon name="arrow" className="size-10 text-accent" />
            <div className="rounded-2xl border-2 border-primary bg-primary-soft p-3">
              <p className="text-sm text-muted">{t("saee.destination")}</p>
              <p className="text-xl font-bold text-primary" data-testid="saee-to">
                {t(`saee.${direction.to}`)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {state === "NOT_STARTED" && <Button onClick={actions.start}>{t("saee.start")}</Button>}

      {greenLights && state !== "COMPLETED" && <InstructionCard item={greenLights} highlight />}
      {guidance && state !== "COMPLETED" && <InstructionCard item={guidance} />}

      {round && direction && (
        <>
          <Button variant="secondary" onClick={() => setDuaOpen(true)}>
            <Icon name="book" />
            {t("tawaf.readDua")}
          </Button>
          <Button onClick={actions.askComplete} disabled={locked}>
            {t("saee.completeRound", { n: round })}
          </Button>
        </>
      )}

      {state === "COMPLETED" && (
        <>
          <Card className="space-y-2 text-center" role="status">
            <p className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
              <Icon name="check" className="size-8" />
              {t("saee.done")}
            </p>
            <p className="text-muted">
              {t("saee.location")} {t(`saee.${getSaeeLocation(state)}`)}
            </p>
          </Card>
          {after && <InstructionCard item={after} />}
          <ButtonLink to="/journey/completion">{t("saee.next")}</ButtonLink>
        </>
      )}

      {locked ? (
        <p className="text-center text-sm text-muted">{t("saee.locked")}</p>
      ) : (
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          {canUndo(state) && (
            <Button variant="ghost" onClick={() => actions.undo(lastCompleted)}>
              <Icon name="undo" />
              {t("saee.undo")}
            </Button>
          )}
          {state !== "NOT_STARTED" && (
            <Button variant="danger" onClick={actions.askReset}>
              {t("saee.reset")}
            </Button>
          )}
          {state === "NOT_STARTED" && (
            <Link to="/journey/tawaf/complete" className="text-center text-primary underline">
              {t("afterTawaf.title")}
            </Link>
          )}
        </div>
      )}

      <ConfirmationDialog
        open={actions.confirming && !!direction}
        title={t("saee.confirmTitle", { n: round })}
        body={direction ? t("saee.confirmBody", { to: t(`saee.${direction.to}`) }) : undefined}
        confirmLabel={direction ? t("saee.confirm", { to: t(`saee.${direction.to}`) }) : ""}
        onConfirm={() => round && actions.confirmComplete(round)}
        onCancel={actions.cancel}
      />
      <ConfirmationDialog
        open={actions.resetting}
        danger
        title={t("saee.resetTitle")}
        body={t("saee.resetBody")}
        confirmLabel={t("saee.reset")}
        onConfirm={actions.confirmReset}
        onCancel={actions.cancel}
      />
      <DuaViewer dua={dua} open={duaOpen} onClose={() => setDuaOpen(false)} />
    </Page>
  );
}
