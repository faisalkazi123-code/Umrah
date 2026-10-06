import type { RoundEvent } from "@shared/domain/rounds/roundMachine";

export type OutboxOp =
  | { type: "createJourney"; journeyId: string }
  | { type: "patchJourney"; journeyId: string; body: Record<string, boolean> }
  | { type: "round"; kind: "tawaf" | "saee"; journeyId: string; event: RoundEvent }
  | { type: "checklist"; journeyId: string; key: string; checked: boolean }
  | { type: "bookmark"; duaKey: string; on: boolean };
