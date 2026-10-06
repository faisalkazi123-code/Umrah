import { type RoundState, completedRounds, currentRound, transition } from "../rounds/roundMachine.js";
import { getSaeeDirection, type SaeeHill } from "./saeeDirection.js";

export type SaeeState = RoundState;
export const saeeTransition = transition;
export const saeeCompletedRounds = completedRounds;
export const saeeCurrentRound = currentRound;

/** Where the pilgrim currently stands for a given Sa'ee state. */
export function getSaeeLocation(state: SaeeState): SaeeHill {
  if (state === "NOT_STARTED") return "SAFA";
  if (state === "COMPLETED") return "MARWAH";
  return getSaeeDirection(currentRound(state)!).from;
}
