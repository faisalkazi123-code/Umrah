import { create } from "zustand";
import {
  applySaeeEvent,
  applyTawafEvent,
  completeUmrah,
  createJourney,
  setChecklistItem,
  setFlag,
  type JourneyResult,
} from "@shared/domain/journey/journeyMachine";
import type { Journey, JourneyFlag } from "@shared/domain/journey/journeyTypes";
import type { RoundEvent } from "@shared/domain/rounds/roundMachine";
import { loadJourney, saveJourney } from "@/lib/db";
import { enqueue } from "@/lib/sync";
import type { OutboxOp } from "@/lib/syncTypes";

export type ActionResult = { ok: true } | { ok: false; error: string };

interface JourneyStore {
  hydrated: boolean;
  journey: Journey | null;
  hydrate: () => Promise<void>;
  /** Resolves once every queued write has reached IndexedDB. */
  persisted: () => Promise<void>;
  startJourney: () => Journey;
  setFlag: (flag: Exclude<JourneyFlag, "shavingDone">, value: boolean) => ActionResult;
  tawaf: (event: RoundEvent) => ActionResult;
  saee: (event: RoundEvent) => ActionResult;
  toggleChecklist: (key: string, checked: boolean) => void;
  completeUmrah: () => ActionResult;
  resetJourney: () => void;
}

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();

// Writes are serialized so IndexedDB always ends with the latest state, in order.
let writeChain: Promise<void> = Promise.resolve();
function persist(j: Journey | null, ops: OutboxOp[]) {
  writeChain = writeChain
    .then(() => saveJourney(j))
    .then(async () => {
      for (const op of ops) await enqueue(op);
    })
    .catch((err: unknown) => console.error("Failed to persist journey", err));
  return writeChain;
}

export const useJourneyStore = create<JourneyStore>((set, get) => {
  /** The current journey, or a new unsaved one (persisted only if the action succeeds). */
  function base(): { journey: Journey; created: boolean } {
    const current = get().journey;
    return current ? { journey: current, created: false } : { journey: createJourney(uuid(), now()), created: true };
  }

  /** State is updated synchronously (so a double tap sees the new state), then persisted. */
  function commit(apply: (j: Journey) => JourneyResult, op: (j: Journey) => OutboxOp): ActionResult {
    const { journey, created } = base();
    const result = apply(journey);
    if (!result.ok) return result;
    set({ journey: result.journey });
    const ops: OutboxOp[] = created ? [{ type: "createJourney", journeyId: journey.id }] : [];
    void persist(result.journey, [...ops, op(result.journey)]);
    return { ok: true };
  }

  return {
    hydrated: false,
    journey: null,

    hydrate: async () => {
      const journey = await loadJourney();
      set({ journey, hydrated: true });
    },

    persisted: () => writeChain,

    startJourney: () => {
      const j = createJourney(uuid(), now());
      set({ journey: j });
      void persist(j, [{ type: "createJourney", journeyId: j.id }]);
      return j;
    },

    setFlag: (flag, value) =>
      commit((j) => setFlag(j, flag, value, now()), (j) => ({
        type: "patchJourney",
        journeyId: j.id,
        body: { [flag]: value },
      })),

    tawaf: (event) =>
      commit((j) => applyTawafEvent(j, event, now()), (j) => ({ type: "round", kind: "tawaf", journeyId: j.id, event })),

    saee: (event) =>
      commit((j) => applySaeeEvent(j, event, now()), (j) => ({ type: "round", kind: "saee", journeyId: j.id, event })),

    toggleChecklist: (key, checked) => {
      commit((j) => ({ ok: true, journey: setChecklistItem(j, key, checked, now()) }), (j) => ({ type: "checklist", journeyId: j.id, key, checked }));
    },

    completeUmrah: () =>
      commit((j) => completeUmrah(j, now()), (j) => ({ type: "patchJourney", journeyId: j.id, body: { complete: true } })),

    /** Clears progress and checklist only; bookmarks and settings are untouched. */
    resetJourney: () => {
      set({ journey: null });
      void persist(null, []);
    },
  };
});
