/**
 * Generic seven-round state machine shared by Tawaf and Sa'ee.
 *
 * Only sequential transitions are allowed:
 *   NOT_STARTED --START--> ROUND_1 --COMPLETE_ROUND--> ROUND_2 ... ROUND_7 --COMPLETE_ROUND--> COMPLETED
 * UNDO reverts the most recently completed round; RESET returns to NOT_STARTED.
 */
export const TOTAL_ROUNDS = 7 as const;

export const ROUND_STATES = [
  "NOT_STARTED",
  "ROUND_1",
  "ROUND_2",
  "ROUND_3",
  "ROUND_4",
  "ROUND_5",
  "ROUND_6",
  "ROUND_7",
  "COMPLETED",
] as const;

export type RoundState = (typeof ROUND_STATES)[number];
export type RoundNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const ROUND_EVENTS = ["START", "COMPLETE_ROUND", "UNDO", "RESET"] as const;
export type RoundEvent = (typeof ROUND_EVENTS)[number];

export type TransitionResult =
  | { ok: true; state: RoundState }
  | { ok: false; error: string };

const ORDER = ROUND_STATES;

function indexOf(state: RoundState): number {
  return ORDER.indexOf(state);
}

export function isRoundState(value: unknown): value is RoundState {
  return typeof value === "string" && (ROUND_STATES as readonly string[]).includes(value);
}

export function transition(state: RoundState, event: RoundEvent): TransitionResult {
  const i = indexOf(state);
  switch (event) {
    case "START":
      return state === "NOT_STARTED"
        ? { ok: true, state: "ROUND_1" }
        : { ok: false, error: `Cannot START from ${state}` };
    case "COMPLETE_ROUND":
      if (state === "NOT_STARTED") return { ok: false, error: "Rounds have not been started" };
      if (state === "COMPLETED") return { ok: false, error: `All ${TOTAL_ROUNDS} rounds are already complete` };
      return { ok: true, state: ORDER[i + 1] as RoundState };
    case "UNDO":
      // Only a completed round can be undone: ROUND_2..ROUND_7 and COMPLETED.
      if (state === "NOT_STARTED" || state === "ROUND_1") {
        return { ok: false, error: "There is no completed round to undo" };
      }
      return { ok: true, state: ORDER[i - 1] as RoundState };
    case "RESET":
      return { ok: true, state: "NOT_STARTED" };
  }
}

/** Number of rounds fully completed (0–7). */
export function completedRounds(state: RoundState): number {
  if (state === "NOT_STARTED") return 0;
  if (state === "COMPLETED") return TOTAL_ROUNDS;
  return indexOf(state) - 1;
}

/** The round currently being performed, or null when not started / completed. */
export function currentRound(state: RoundState): RoundNumber | null {
  if (state === "NOT_STARTED" || state === "COMPLETED") return null;
  return indexOf(state) as RoundNumber;
}

export function canUndo(state: RoundState): boolean {
  return transition(state, "UNDO").ok;
}
