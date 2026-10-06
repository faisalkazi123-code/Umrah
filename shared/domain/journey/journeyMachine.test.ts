import { describe, expect, it } from "vitest";
import {
  applySaeeEvent,
  applyTawafEvent,
  completeUmrah,
  createJourney,
  getContinueRoute,
  getProgress,
  getStageStatus,
  setFlag,
  TOTAL_PROGRESS_UNITS,
} from "./journeyMachine";
import type { Journey } from "./journeyTypes";

const NOW = "2026-01-01T00:00:00.000Z";
const unwrap = (r: { ok: true; journey: Journey } | { ok: false; error: string }) => {
  if (!r.ok) throw new Error(r.error);
  return r.journey;
};

function withTawafDone(): Journey {
  let j = createJourney("j1", NOW);
  j = unwrap(setFlag(j, "niyyahDone", true, NOW));
  j = unwrap(setFlag(j, "talbiyahDone", true, NOW));
  j = unwrap(setFlag(j, "haramEntered", true, NOW));
  j = unwrap(applyTawafEvent(j, "START", NOW));
  for (let i = 0; i < 7; i++) j = unwrap(applyTawafEvent(j, "COMPLETE_ROUND", NOW));
  return j;
}

describe("journey progress", () => {
  it("is 0% for no journey and for a fresh journey", () => {
    expect(getProgress(null).percent).toBe(0);
    expect(getProgress(createJourney("j", NOW)).done).toBe(0);
  });

  it("counts niyyah, talbiyah, haram, circuits, rounds and shaving", () => {
    const j = withTawafDone();
    expect(getProgress(j).done).toBe(10);
    let k = unwrap(applySaeeEvent(j, "START", NOW));
    for (let i = 0; i < 7; i++) k = unwrap(applySaeeEvent(k, "COMPLETE_ROUND", NOW));
    k = unwrap(completeUmrah(k, NOW));
    expect(getProgress(k)).toEqual({ done: TOTAL_PROGRESS_UNITS, total: TOTAL_PROGRESS_UNITS, percent: 100 });
  });
});

describe("journey ordering rules", () => {
  it("does not allow Sa'ee before Tawaf is complete", () => {
    expect(applySaeeEvent(createJourney("j", NOW), "START", NOW).ok).toBe(false);
  });

  it("does not allow completion before Sa'ee is complete", () => {
    expect(completeUmrah(withTawafDone(), NOW).ok).toBe(false);
    expect(setFlag(withTawafDone(), "shavingDone", true, NOW).ok).toBe(false);
  });

  it("locks Tawaf undo once Sa'ee has started", () => {
    const j = unwrap(applySaeeEvent(withTawafDone(), "START", NOW));
    expect(applyTawafEvent(j, "UNDO", NOW).ok).toBe(false);
  });

  it("derives stage statuses and the continue route", () => {
    const fresh = createJourney("j", NOW);
    expect(getStageStatus(fresh, "ihram")).toBe("NOT_STARTED");
    expect(getContinueRoute(fresh)).toBe("/journey/ihram");
    const j = withTawafDone();
    expect(getStageStatus(j, "ihram")).toBe("COMPLETED");
    expect(getStageStatus(j, "tawaf")).toBe("COMPLETED");
    expect(getStageStatus(j, "saee")).toBe("NOT_STARTED");
    expect(getContinueRoute(j)).toBe("/journey/tawaf/complete");
    const mid = unwrap(applyTawafEvent(withTawafDone(), "UNDO", NOW));
    expect(getContinueRoute(mid)).toBe("/journey/tawaf");
  });
});
