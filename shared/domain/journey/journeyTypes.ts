import type { RoundState } from "../rounds/roundMachine.js";

export const STAGE_KEYS = ["ihram", "tawaf", "saee", "completion", "complete"] as const;
export type StageKey = (typeof STAGE_KEYS)[number];

export type StageStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

/** Boolean milestones that are marked explicitly by the pilgrim. */
export const JOURNEY_FLAGS = ["niyyahDone", "talbiyahDone", "haramEntered", "shavingDone"] as const;
export type JourneyFlag = (typeof JOURNEY_FLAGS)[number];

export interface Journey {
  id: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  niyyahDone: boolean;
  talbiyahDone: boolean;
  haramEntered: boolean;
  shavingDone: boolean;
  tawaf: RoundState;
  saee: RoundState;
  /** Checklist item key → checked. */
  checklist: Record<string, boolean>;
}
