import { describe, expect, it } from "vitest";
import { ROUND_EVENTS, ROUND_STATES, type RoundState } from "../rounds/roundMachine";
import {
  describeTawaf,
  getTawafWalkingGuidanceKey,
  tawafCompletedCircuits,
  tawafCurrentCircuit,
  tawafTransition,
} from "./tawafMachine";

function run(events: Parameters<typeof tawafTransition>[1][]): RoundState {
  let s: RoundState = "NOT_STARTED";
  for (const e of events) {
    const r = tawafTransition(s, e);
    if (!r.ok) throw new Error(r.error);
    s = r.state;
  }
  return s;
}

describe("Tawaf state machine", () => {
  it("walks NOT_STARTED → ROUND_1..ROUND_7 → COMPLETED sequentially", () => {
    let s: RoundState = "NOT_STARTED";
    const seen: RoundState[] = [s];
    const start = tawafTransition(s, "START");
    expect(start.ok).toBe(true);
    s = (start as { state: RoundState }).state;
    seen.push(s);
    for (let i = 0; i < 7; i++) {
      const r = tawafTransition(s, "COMPLETE_ROUND");
      expect(r.ok).toBe(true);
      s = (r as { state: RoundState }).state;
      seen.push(s);
    }
    expect(seen).toEqual([...ROUND_STATES]);
  });

  it("reports completed circuits and the next circuit", () => {
    expect(describeTawaf("NOT_STARTED")).toEqual({ completed: 0, next: null });
    expect(describeTawaf("ROUND_1")).toEqual({ completed: 0, next: 1 });
    expect(describeTawaf("ROUND_5")).toEqual({ completed: 4, next: 5 });
    expect(describeTawaf("COMPLETED")).toEqual({ completed: 7, next: null });
    expect(tawafCompletedCircuits(run(["START", "COMPLETE_ROUND", "COMPLETE_ROUND"]))).toBe(2);
    expect(tawafCurrentCircuit("ROUND_7")).toBe(7);
  });

  describe("invalid transitions", () => {
    it("cannot complete a circuit before starting", () => {
      expect(tawafTransition("NOT_STARTED", "COMPLETE_ROUND").ok).toBe(false);
    });
    it("cannot exceed 7 circuits", () => {
      expect(tawafTransition("COMPLETED", "COMPLETE_ROUND").ok).toBe(false);
    });
    it("cannot start twice", () => {
      for (const s of ROUND_STATES.filter((x) => x !== "NOT_STARTED")) {
        expect(tawafTransition(s, "START").ok).toBe(false);
      }
    });
    it("never skips a circuit: every successful transition moves at most one step", () => {
      for (const s of ROUND_STATES) {
        for (const e of ROUND_EVENTS) {
          const r = tawafTransition(s, e);
          if (!r.ok || e === "RESET") continue;
          const delta = ROUND_STATES.indexOf(r.state) - ROUND_STATES.indexOf(s);
          expect(Math.abs(delta)).toBe(1);
        }
      }
    });
  });

  describe("undo", () => {
    it("reverts only the latest completed circuit", () => {
      expect(tawafTransition("ROUND_4", "UNDO")).toEqual({ ok: true, state: "ROUND_3" });
      expect(tawafTransition("COMPLETED", "UNDO")).toEqual({ ok: true, state: "ROUND_7" });
    });
    it("is rejected when no circuit has been completed", () => {
      expect(tawafTransition("NOT_STARTED", "UNDO").ok).toBe(false);
      expect(tawafTransition("ROUND_1", "UNDO").ok).toBe(false);
    });
  });

  it("reset returns to NOT_STARTED from any state", () => {
    for (const s of ROUND_STATES) expect(tawafTransition(s, "RESET")).toEqual({ ok: true, state: "NOT_STARTED" });
  });

  it("selects brisk-walking guidance for circuits 1–3 and normal walking for 4–7", () => {
    expect([1, 2, 3].map((c) => getTawafWalkingGuidanceKey(c as 1))).toEqual(Array(3).fill("tawaf.walking.circuits_1_3"));
    expect([4, 5, 6, 7].map((c) => getTawafWalkingGuidanceKey(c as 4))).toEqual(Array(4).fill("tawaf.walking.circuits_4_7"));
  });
});
