import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { getDua, getInstruction } from "@shared/content";
import { canUndo, completedRounds, currentRound, TOTAL_ROUNDS } from "@shared/domain/rounds/roundMachine";
import { getTawafWalkingGuidanceKey } from "@shared/domain/tawaf/tawafMachine";
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

export default function Tawaf() {
  const { t } = useTranslation();
  const { journey, tawaf } = useJourneyStore();
  const [duaOpen, setDuaOpen] = useState(false);
  const state = journey?.tawaf ?? "NOT_STARTED";
  const completed = completedRounds(state);
  const circuit = currentRound(state);
  const locked = !!journey && journey.saee !== "NOT_STARTED";
  const actions = useRoundActions(tawaf, {
    completed: (n) => t("tawaf.completedToast", { n }),
    undone: (n) => t("tawaf.undone", { n }),
    undoLabel: t("tawaf.undo"),
  });
  const guidanceKey = circuit ? getTawafWalkingGuidanceKey(circuit) : null;
  const guidance = guidanceKey ? getInstruction(guidanceKey) : null;
  const dua = getDua("dua.tawaf") ?? null;
  const lastCompleted = state === "COMPLETED" ? TOTAL_ROUNDS : completed;

  return (
    <Page title={t("tawaf.title")} back="/journey">
      <Card className="space-y-5 text-center">
        <p className="text-sm font-semibold tracking-widest text-muted uppercase">{t("tawaf.circuit")}</p>
        <p className="text-6xl font-bold text-primary tabular-nums" data-testid="tawaf-counter" aria-live="polite" dir="ltr">
          {state === "COMPLETED" ? (
            <Icon name="check" className="mx-auto size-16" />
          ) : (
            t("tawaf.of", { current: circuit ?? 0, total: TOTAL_ROUNDS })
          )}
        </p>
        <RoundProgress completed={completed} current={circuit} label={t("tawaf.completedCount", { count: completed })} />
        <p className="text-muted" data-testid="tawaf-completed">
          {t("tawaf.completedCount", { count: completed })}
        </p>
      </Card>

      {state === "NOT_STARTED" && (
        <>
          <p className="text-center text-lg">{t("tawaf.notStarted")}</p>
          <Button onClick={actions.start}>{t("tawaf.start")}</Button>
        </>
      )}

      {circuit && (
        <>
          {guidance && (
            <section className="space-y-2">
              <h2 className="font-bold">{t("tawaf.currentGuidance")}</h2>
              <InstructionCard item={guidance} highlight={circuit <= 3} />
            </section>
          )}
          <Button variant="secondary" onClick={() => setDuaOpen(true)}>
            <Icon name="book" />
            {t("tawaf.readDua")}
          </Button>
          <Button onClick={actions.askComplete} disabled={locked}>
            {t("tawaf.completeCircuit", { n: circuit })}
          </Button>
        </>
      )}

      {state === "COMPLETED" && (
        <>
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-primary-soft p-4 text-lg font-semibold text-primary" role="status">
            <Icon name="check" />
            {t("tawaf.done")}
          </p>
          <ButtonLink to="/journey/tawaf/complete">{t("tawaf.afterTawaf")}</ButtonLink>
        </>
      )}

      {locked ? (
        <p className="text-center text-sm text-muted">{t("tawaf.locked")}</p>
      ) : (
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          {canUndo(state) && (
            <Button variant="ghost" onClick={() => actions.undo(lastCompleted)}>
              <Icon name="undo" />
              {t("tawaf.undo")}
            </Button>
          )}
          {state !== "NOT_STARTED" && (
            <Button variant="danger" onClick={actions.askReset}>
              {t("tawaf.reset")}
            </Button>
          )}
          {state === "NOT_STARTED" && (
            <Link to="/journey/haram" className="text-center text-primary underline">
              {t("haram.title")}
            </Link>
          )}
        </div>
      )}

      <ConfirmationDialog
        open={actions.confirming && !!circuit}
        title={t("tawaf.confirmTitle", { n: circuit })}
        body={t("tawaf.confirmBody", { n: circuit })}
        confirmLabel={t("tawaf.confirm")}
        onConfirm={() => circuit && actions.confirmComplete(circuit)}
        onCancel={actions.cancel}
      />
      <ConfirmationDialog
        open={actions.resetting}
        danger
        title={t("tawaf.resetTitle")}
        body={t("tawaf.resetBody")}
        confirmLabel={t("tawaf.resetConfirm")}
        onConfirm={actions.confirmReset}
        onCancel={actions.cancel}
      />
      <DuaViewer dua={dua} open={duaOpen} onClose={() => setDuaOpen(false)} />
    </Page>
  );
}
