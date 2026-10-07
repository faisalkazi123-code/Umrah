import { IS_DEMO } from "@/config/mode";
import { getDb } from "./db";
import type { OutboxOp } from "./syncTypes";

/**
 * Offline-first sync. The device is the source of truth for the pilgrim's progress; every change
 * is applied locally first and queued here. The queue is flushed in order whenever the API is
 * reachable. If the API rejects an operation (e.g. the server state diverged), the op is dropped
 * and reported in Settings — local progress is never rolled back mid-ritual.
 */
export interface SyncStatus {
  pending: number;
  lastError: string | null;
  lastSyncedAt: string | null;
}

type Listener = (s: SyncStatus) => void;
const listeners = new Set<Listener>();
let status: SyncStatus = { pending: 0, lastError: null, lastSyncedAt: null };
let flushing = false;

function emit(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l(status));
}

export function subscribeSync(l: Listener) {
  if (IS_DEMO) return () => false;
  listeners.add(l);
  l(status);
  return () => listeners.delete(l);
}

export async function enqueue(op: OutboxOp) {
  if (IS_DEMO) return; // the demo has no server to sync with
  const db = await getDb();
  await db.add("outbox", op);
  emit({ pending: await db.count("outbox") });
  void flush();
}

const json = (body: unknown): RequestInit => ({
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
  credentials: "same-origin",
});

async function send(op: OutboxOp): Promise<Response> {
  switch (op.type) {
    case "createJourney":
      return fetch("/api/journeys", { method: "POST", ...json({ id: op.journeyId }) });
    case "patchJourney":
      return fetch(`/api/journeys/${op.journeyId}`, { method: "PATCH", ...json(op.body) });
    case "round":
      return fetch(`/api/journeys/${op.journeyId}/${op.kind}`, { method: "PATCH", ...json({ event: op.event }) });
    case "checklist":
      return fetch(`/api/checklist/${encodeURIComponent(op.key)}`, {
        method: "PATCH",
        ...json({ journeyId: op.journeyId, checked: op.checked }),
      });
    case "bookmark": {
      if (op.on) return fetch("/api/bookmarks", { method: "POST", ...json({ duaKey: op.duaKey }) });
      const list = await fetch("/api/bookmarks", { credentials: "same-origin" });
      if (!list.ok) return list;
      const found = ((await list.json()) as { id: string; duaKey: string }[]).find((b) => b.duaKey === op.duaKey);
      if (!found) return new Response(null, { status: 204 });
      return fetch(`/api/bookmarks/${found.id}`, { method: "DELETE", credentials: "same-origin" });
    }
  }
}

async function apiAvailable(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { credentials: "same-origin", cache: "no-store" });
    if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return false;
    return ((await res.json()) as { status?: string }).status === "ok";
  } catch {
    return false;
  }
}

export async function flush() {
  if (flushing || (typeof navigator !== "undefined" && !navigator.onLine)) return;
  flushing = true;
  try {
    const db = await getDb();
    if ((await db.count("outbox")) === 0) return;
    if (!(await apiAvailable())) return;
    let cursor = await db.transaction("outbox").store.openCursor();
    const items: { key: number; op: OutboxOp }[] = [];
    while (cursor) {
      items.push({ key: cursor.key, op: cursor.value });
      cursor = await cursor.continue();
    }
    for (const { key, op } of items) {
      let res: Response;
      try {
        res = await send(op);
      } catch {
        return; // network dropped: keep the remaining queue for later
      }
      if (res.status >= 500 || res.status === 429) return;
      if (!res.ok) emit({ lastError: `${op.type} rejected (${res.status})` });
      await db.delete("outbox", key);
      emit({ pending: await db.count("outbox") });
    }
    emit({ lastSyncedAt: new Date().toISOString() });
  } finally {
    flushing = false;
  }
}

export function startSync() {
  if (IS_DEMO) return;
  void (async () => emit({ pending: await (await getDb()).count("outbox") }))();
  window.addEventListener("online", () => void flush());
  void flush();
}
