import { completedRounds, type RoundEvent, type RoundState, transition, TOTAL_ROUNDS } from "../rounds/roundMachine.js";
import type { Journey, JourneyFlag, StageKey, StageStatus } from "./journeyTypes.js";

export type JourneyResult = { ok: true; journey: Journey } | { ok: false; error: string };

export function createJourney(id: string, now: string): Journey {
  return {
    id,
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    niyyahDone: false,
    talbiyahDone: false,
    haramEntered: false,
    shavingDone: false,
    tawaf: "NOT_STARTED",
    saee: "NOT_STARTED",
    checklist: {},
  };
}

export function getStageStatus(j: Journey, stage: StageKey): StageStatus {
  switch (stage) {
    case "ihram":
      if (j.niyyahDone && j.talbiyahDone) return "COMPLETED";
      return j.niyyahDone || j.talbiyahDone || Object.values(j.checklist).some(Boolean) ? "IN_PROGRESS" : "NOT_STARTED";
    case "tawaf":
      if (j.tawaf === "COMPLETED") return "COMPLETED";
      return j.haramEntered || j.tawaf !== "NOT_STARTED" ? "IN_PROGRESS" : "NOT_STARTED";
    case "saee":
      if (j.saee === "COMPLETED") return "COMPLETED";
      return j.saee !== "NOT_STARTED" ? "IN_PROGRESS" : "NOT_STARTED";
    case "completion":
      return j.shavingDone ? "COMPLETED" : j.saee === "COMPLETED" ? "IN_PROGRESS" : "NOT_STARTED";
    case "complete":
      return j.completedAt ? "COMPLETED" : "NOT_STARTED";
  }
}

/** Units: niyyah, talbiyah, entering the Haram, 7 Tawaf circuits, 7 Sa'ee rounds, shaving/trimming. */
export const TOTAL_PROGRESS_UNITS = 3 + TOTAL_ROUNDS * 2 + 1;

export function getProgress(j: Journey | null): { done: number; total: number; percent: number } {
  if (!j) return { done: 0, total: TOTAL_PROGRESS_UNITS, percent: 0 };
  const done =
    Number(j.niyyahDone) +
    Number(j.talbiyahDone) +
    Number(j.haramEntered) +
    completedRounds(j.tawaf) +
    completedRounds(j.saee) +
    Number(j.shavingDone);
  return { done, total: TOTAL_PROGRESS_UNITS, percent: Math.round((done / TOTAL_PROGRESS_UNITS) * 100) };
}

export function getCurrentStage(j: Journey): StageKey {
  if (j.completedAt) return "complete";
  if (j.saee === "COMPLETED") return "completion";
  if (j.tawaf === "COMPLETED") return "saee";
  if (j.niyyahDone && j.talbiyahDone) return "tawaf";
  return "ihram";
}

/** Route the "Continue Umrah" button should open. */
export function getContinueRoute(j: Journey): string {
  if (j.completedAt) return "/journey/complete";
  if (j.saee === "COMPLETED") return "/journey/completion";
  if (j.saee !== "NOT_STARTED") return "/journey/saee";
  if (j.tawaf === "COMPLETED") return "/journey/tawaf/complete";
  if (j.tawaf !== "NOT_STARTED") return "/journey/tawaf";
  if (j.haramEntered) return "/journey/tawaf";
  if (j.niyyahDone && j.talbiyahDone) return "/journey/haram";
  if (j.niyyahDone) return "/journey/ihram/talbiyah";
  return "/journey/ihram";
}

function touch(j: Journey, now: string): Journey {
  return { ...j, updatedAt: now };
}

export function setFlag(j: Journey, flag: JourneyFlag, value: boolean, now: string): JourneyResult {
  if (j.completedAt) return { ok: false, error: "This Umrah journey is already complete" };
  if (flag === "shavingDone" && value && j.saee !== "COMPLETED") {
    return { ok: false, error: "Sa'ee must be completed before shaving / trimming" };
  }
  return { ok: true, journey: touch({ ...j, [flag]: value }, now) };
}

export function applyTawafEvent(j: Journey, event: RoundEvent, now: string): JourneyResult {
  if (j.completedAt) return { ok: false, error: "This Umrah journey is already complete" };
  if (event !== "START" && event !== "COMPLETE_ROUND" && j.saee !== "NOT_STARTED") {
    return { ok: false, error: "Tawaf cannot be changed after Sa'ee has started" };
  }
  const r = transition(j.tawaf, event);
  if (!r.ok) return r;
  return { ok: true, journey: touch({ ...j, tawaf: r.state }, now) };
}

export function applySaeeEvent(j: Journey, event: RoundEvent, now: string): JourneyResult {
  if (j.completedAt) return { ok: false, error: "This Umrah journey is already complete" };
  if (event === "START" && j.tawaf !== "COMPLETED") {
    return { ok: false, error: "Tawaf must be completed before starting Sa'ee" };
  }
  if ((event === "UNDO" || event === "RESET") && j.shavingDone) {
    return { ok: false, error: "Sa'ee cannot be changed after shaving / trimming" };
  }
  const r = transition(j.saee, event);
  if (!r.ok) return r;
  return { ok: true, journey: touch({ ...j, saee: r.state }, now) };
}

export function completeUmrah(j: Journey, now: string): JourneyResult {
  if (j.completedAt) return { ok: false, error: "This Umrah journey is already complete" };
  if (j.tawaf !== "COMPLETED" || j.saee !== "COMPLETED") {
    return { ok: false, error: "Tawaf and Sa'ee must be completed first" };
  }
  return { ok: true, journey: { ...j, shavingDone: true, completedAt: now, updatedAt: now } };
}

export function setChecklistItem(j: Journey, key: string, checked: boolean, now: string): Journey {
  return touch({ ...j, checklist: { ...j.checklist, [key]: checked } }, now);
}

export type { RoundState };
