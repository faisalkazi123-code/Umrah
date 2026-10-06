import { useState } from "react";
import type { ActionResult } from "@/store/journeyStore";
import type { RoundEvent } from "@shared/domain/rounds/roundMachine";
import { useToastStore } from "@/store/toastStore";

/** Confirmation, undo and reset flow shared by the Tawaf and Sa'ee counters. */
export function useRoundActions(
  dispatch: (e: RoundEvent) => ActionResult,
  messages: { completed: (n: number) => string; undone: (n: number) => string; undoLabel: string },
) {
  const show = useToastStore((s) => s.show);
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const run = (e: RoundEvent) => {
    const r = dispatch(e);
    if (!r.ok) show(r.error);
    return r.ok;
  };

  return {
    confirming,
    resetting,
    askComplete: () => setConfirming(true),
    askReset: () => setResetting(true),
    cancel: () => {
      setConfirming(false);
      setResetting(false);
    },
    confirmComplete: (n: number) => {
      setConfirming(false);
      if (run("COMPLETE_ROUND")) {
        show(messages.completed(n), { label: messages.undoLabel, onClick: () => run("UNDO") && show(messages.undone(n)) });
      }
    },
    undo: (n: number) => run("UNDO") && show(messages.undone(n)),
    confirmReset: () => {
      setResetting(false);
      run("RESET");
    },
    start: () => run("START"),
  };
}
