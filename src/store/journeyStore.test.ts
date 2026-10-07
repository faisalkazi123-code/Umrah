import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDb, loadJourney, resetDbConnection } from "@/lib/db";

// Keep tests offline: the sync layer must never reach a network.
vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));

async function freshStore() {
  vi.resetModules();
  const mod = await import("./journeyStore");
  await mod.useJourneyStore.getState().hydrate();
  return mod.useJourneyStore;
}

beforeEach(async () => {
  const db = await getDb();
  await Promise.all([db.clear("journey"), db.clear("outbox"), db.clear("bookmarks")]);
  await resetDbConnection();
});

describe("journey store persistence", () => {
  it("persists checklist ticks immediately and restores them after a restart", async () => {
    let store = await freshStore();
    store.getState().toggleChecklist("checklist.ihram.ghusl", true);
    store.getState().toggleChecklist("checklist.ihram.nails", true);
    store.getState().toggleChecklist("checklist.ihram.nails", false);
    await store.getState().persisted();

    store = await freshStore(); // simulates closing and reopening the app
    expect(store.getState().journey?.checklist).toEqual({ "checklist.ihram.ghusl": true, "checklist.ihram.nails": false });
  });

  it("restores Tawaf exactly: 4 circuits completed, next = circuit 5", async () => {
    let store = await freshStore();
    expect(store.getState().tawaf("START").ok).toBe(true);
    for (let i = 0; i < 4; i++) expect(store.getState().tawaf("COMPLETE_ROUND").ok).toBe(true);
    await store.getState().persisted();

    store = await freshStore();
    expect(store.getState().journey?.tawaf).toBe("ROUND_5");
  });

  it("restores Sa'ee progress after a restart", async () => {
    let store = await freshStore();
    store.getState().tawaf("START");
    for (let i = 0; i < 7; i++) store.getState().tawaf("COMPLETE_ROUND");
    store.getState().saee("START");
    for (let i = 0; i < 3; i++) store.getState().saee("COMPLETE_ROUND");
    await store.getState().persisted();

    store = await freshStore();
    expect(store.getState().journey?.saee).toBe("ROUND_4");
  });

  it("rejects invalid transitions without changing state", async () => {
    const store = await freshStore();
    const r = store.getState().tawaf("COMPLETE_ROUND");
    expect(r.ok).toBe(false);
    expect(store.getState().saee("START").ok).toBe(false);
  });

  it("queues every change for sync in order", async () => {
    const store = await freshStore();
    store.getState().tawaf("START");
    store.getState().tawaf("COMPLETE_ROUND");
    await store.getState().persisted();
    const ops = await (await getDb()).getAll("outbox");
    expect(ops.map((o) => o.type)).toEqual(["createJourney", "round", "round"]);
  });

  it("reset clears the journey but keeps bookmarks", async () => {
    const store = await freshStore();
    const { useBookmarkStore } = await import("./bookmarkStore");
    await useBookmarkStore.getState().toggle("dua.talbiyah");
    store.getState().toggleChecklist("checklist.ihram.ghusl", true);
    store.getState().resetJourney();
    await store.getState().persisted();
    expect(await loadJourney()).toBeNull();
    expect(await (await getDb()).getAllKeys("bookmarks")).toEqual(["dua.talbiyah"]);
  });
});
