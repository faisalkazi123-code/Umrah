import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Journey } from "@shared/domain/journey/journeyTypes";
import type { OutboxOp } from "./syncTypes";

interface UmrahDB extends DBSchema {
  journey: { key: "current"; value: Journey };
  bookmarks: { key: string; value: { duaKey: string; createdAt: string } };
  outbox: { key: number; value: OutboxOp; autoIncrement: true };
}

let dbPromise: Promise<IDBPDatabase<UmrahDB>> | null = null;

export function getDb() {
  dbPromise ??= openDB<UmrahDB>("umrah-companion", 1, {
    upgrade(db) {
      db.createObjectStore("journey");
      db.createObjectStore("bookmarks", { keyPath: "duaKey" });
      db.createObjectStore("outbox", { autoIncrement: true });
    },
  });
  return dbPromise;
}

export async function loadJourney(): Promise<Journey | null> {
  return (await (await getDb()).get("journey", "current")) ?? null;
}

/** Writes are awaited before the UI moves on so progress survives an immediate app close. */
export async function saveJourney(j: Journey | null) {
  const db = await getDb();
  if (j) await db.put("journey", j, "current");
  else await db.delete("journey", "current");
}

export async function loadBookmarks(): Promise<string[]> {
  const all = await (await getDb()).getAll("bookmarks");
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((b) => b.duaKey);
}

export async function setBookmark(duaKey: string, on: boolean) {
  const db = await getDb();
  if (on) await db.put("bookmarks", { duaKey, createdAt: new Date().toISOString() });
  else await db.delete("bookmarks", duaKey);
}

/** Test helper: close and forget the connection. */
export async function resetDbConnection() {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}
