import type { RoundNumber } from "../rounds/roundMachine.js";

export type SaeeHill = "SAFA" | "MARWAH";
export interface SaeeDirection {
  round: RoundNumber;
  from: SaeeHill;
  to: SaeeHill;
}

/**
 * Odd rounds go Safa → Marwah, even rounds go Marwah → Safa.
 * Round 7 therefore ends at Al-Marwah.
 */
export function getSaeeDirection(round: number): SaeeDirection {
  if (!Number.isInteger(round) || round < 1 || round > 7) {
    throw new RangeError(`Sa'ee round must be an integer from 1 to 7, received ${round}`);
  }
  const odd = round % 2 === 1;
  return { round: round as RoundNumber, from: odd ? "SAFA" : "MARWAH", to: odd ? "MARWAH" : "SAFA" };
}
