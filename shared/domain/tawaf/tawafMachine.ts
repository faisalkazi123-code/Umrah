import {
  type RoundNumber,
  type RoundState,
  completedRounds,
  currentRound,
  transition,
} from "../rounds/roundMachine.js";

export type TawafState = RoundState;
export const tawafTransition = transition;
export const tawafCompletedCircuits = completedRounds;
export const tawafCurrentCircuit = currentRound;

/** Which walking-guidance record applies to a circuit (content keys in tawaf.json). */
export function getTawafWalkingGuidanceKey(circuit: RoundNumber): "tawaf.walking.circuits_1_3" | "tawaf.walking.circuits_4_7" {
  return circuit <= 3 ? "tawaf.walking.circuits_1_3" : "tawaf.walking.circuits_4_7";
}

export function describeTawaf(state: TawafState): { completed: number; next: RoundNumber | null } {
  return { completed: completedRounds(state), next: currentRound(state) };
}
