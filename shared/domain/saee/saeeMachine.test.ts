import { describe, expect, it } from "vitest";
import { getSaeeDirection } from "./saeeDirection";
import { getSaeeLocation, saeeCompletedRounds, saeeTransition } from "./saeeMachine";

describe("getSaeeDirection", () => {
  it.each([
    [1, "SAFA", "MARWAH"],
    [2, "MARWAH", "SAFA"],
    [3, "SAFA", "MARWAH"],
    [4, "MARWAH", "SAFA"],
    [5, "SAFA", "MARWAH"],
    [6, "MARWAH", "SAFA"],
    [7, "SAFA", "MARWAH"],
  ] as const)("round %i goes %s → %s", (round, from, to) => {
    expect(getSaeeDirection(round)).toEqual({ round, from, to });
  });

  it("final round ends at Al-Marwah", () => {
    expect(getSaeeDirection(7).to).toBe("MARWAH");
  });

  it.each([0, 8, -1, 1.5, Number.NaN])("rejects invalid round %s", (round) => {
    expect(() => getSaeeDirection(round)).toThrow(RangeError);
  });
});

describe("Sa'ee state machine", () => {
  it("tracks location through all seven rounds and ends at Marwah", () => {
    let s = saeeTransition("NOT_STARTED", "START");
    expect(s.ok && getSaeeLocation(s.state)).toBe("SAFA");
    const locations: string[] = [];
    let state = s.ok ? s.state : "NOT_STARTED";
    for (let i = 0; i < 7; i++) {
      s = saeeTransition(state, "COMPLETE_ROUND");
      if (!s.ok) throw new Error(s.error);
      state = s.state;
      locations.push(getSaeeLocation(state));
    }
    expect(locations).toEqual(["MARWAH", "SAFA", "MARWAH", "SAFA", "MARWAH", "SAFA", "MARWAH"]);
    expect(state).toBe("COMPLETED");
    expect(saeeCompletedRounds(state)).toBe(7);
  });

  it("cannot exceed 7 rounds or complete before starting", () => {
    expect(saeeTransition("COMPLETED", "COMPLETE_ROUND").ok).toBe(false);
    expect(saeeTransition("NOT_STARTED", "COMPLETE_ROUND").ok).toBe(false);
  });

  it("undo reverts the latest round", () => {
    expect(saeeTransition("ROUND_3", "UNDO")).toEqual({ ok: true, state: "ROUND_2" });
    expect(saeeTransition("ROUND_1", "UNDO").ok).toBe(false);
  });
});
