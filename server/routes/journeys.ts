import { randomUUID } from "node:crypto";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { Router, type Request } from "express";
import {
  createBookmarkBody,
  createJourneyBody,
  patchChecklistBody,
  patchJourneyBody,
  roundEventBody,
  uuidParam,
} from "../../shared/api/schemas.js";
import {
  applySaeeEvent,
  applyTawafEvent,
  completeUmrah,
  setFlag,
  type JourneyResult,
} from "../../shared/domain/journey/journeyMachine.js";
import type { Journey } from "../../shared/domain/journey/journeyTypes.js";
import { JOURNEY_FLAGS } from "../../shared/domain/journey/journeyTypes.js";
import type { Db } from "../db/client.js";
import * as t from "../db/schema.js";
import { HttpError, parse } from "../middleware/http.js";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

function guestId(req: Request): string {
  if (!req.guestSessionId) throw new HttpError(401, "No guest session");
  return req.guestSessionId;
}

/** Loads a journey owned by the guest, locking it for the rest of the transaction. */
async function loadJourney(tx: Tx, id: string, guest: string, lock: boolean): Promise<Journey> {
  const base = tx
    .select()
    .from(t.journeys)
    .where(and(eq(t.journeys.id, id), eq(t.journeys.guestSessionId, guest), isNull(t.journeys.archivedAt)));
  const [row] = lock ? await base.for("update") : await base;
  // Same 404 whether the journey is missing or belongs to someone else (no IDOR oracle).
  if (!row) throw new HttpError(404, "Journey not found");
  const [tawaf] = await tx.select().from(t.tawafProgress).where(eq(t.tawafProgress.journeyId, id));
  const [saee] = await tx.select().from(t.saeeProgress).where(eq(t.saeeProgress.journeyId, id));
  const checks = await tx
    .select({ key: t.checklistItems.key, checked: t.journeyChecklist.checked })
    .from(t.journeyChecklist)
    .innerJoin(t.checklistItems, eq(t.checklistItems.id, t.journeyChecklist.checklistItemId))
    .where(eq(t.journeyChecklist.journeyId, id));
  return {
    id: row.id,
    startedAt: row.startedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    niyyahDone: row.niyyahDone,
    talbiyahDone: row.talbiyahDone,
    haramEntered: row.haramEntered,
    shavingDone: row.shavingDone,
    tawaf: tawaf?.state ?? "NOT_STARTED",
    saee: saee?.state ?? "NOT_STARTED",
    checklist: Object.fromEntries(checks.map((c) => [c.key, c.checked])),
  };
}

async function saveJourney(tx: Tx, j: Journey) {
  const now = new Date(j.updatedAt);
  await tx
    .update(t.journeys)
    .set({
      niyyahDone: j.niyyahDone,
      talbiyahDone: j.talbiyahDone,
      haramEntered: j.haramEntered,
      shavingDone: j.shavingDone,
      completedAt: j.completedAt ? new Date(j.completedAt) : null,
      updatedAt: now,
    })
    .where(eq(t.journeys.id, j.id));
  await tx.update(t.tawafProgress).set({ state: j.tawaf, updatedAt: now }).where(eq(t.tawafProgress.journeyId, j.id));
  await tx.update(t.saeeProgress).set({ state: j.saee, updatedAt: now }).where(eq(t.saeeProgress.journeyId, j.id));
}

function unwrap(r: JourneyResult): Journey {
  // 409: the request is well-formed but not a valid transition from the current state.
  if (!r.ok) throw new HttpError(409, r.error);
  return r.journey;
}

export function journeyRouter(db: Db) {
  const r = Router();

  r.get("/journeys/current", async (req, res) => {
    const guest = guestId(req);
    const [row] = await db
      .select({ id: t.journeys.id })
      .from(t.journeys)
      .where(and(eq(t.journeys.guestSessionId, guest), isNull(t.journeys.archivedAt)))
      .orderBy(desc(t.journeys.startedAt))
      .limit(1);
    if (!row) return res.json({ journey: null });
    res.json({ journey: await db.transaction((tx) => loadJourney(tx, row.id, guest, false)) });
  });

  /** Starts a new journey; any previous active journey for this guest is archived, never deleted. */
  r.post("/journeys", async (req, res) => {
    const guest = guestId(req);
    const body = parse(createJourneyBody, req.body);
    const id = body.id ?? randomUUID();
    const journey = await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(t.journeys).where(eq(t.journeys.id, id));
      if (existing) {
        if (existing.guestSessionId !== guest) throw new HttpError(409, "Journey id already in use");
        if (!existing.archivedAt) return loadJourney(tx, id, guest, false); // idempotent retry
        throw new HttpError(409, "Journey has been archived");
      }
      await tx
        .update(t.journeys)
        .set({ archivedAt: new Date() })
        .where(and(eq(t.journeys.guestSessionId, guest), isNull(t.journeys.archivedAt)));
      await tx.insert(t.journeys).values({ id, guestSessionId: guest });
      await tx.insert(t.tawafProgress).values({ journeyId: id });
      await tx.insert(t.saeeProgress).values({ journeyId: id });
      return loadJourney(tx, id, guest, false);
    });
    res.status(201).json({ journey });
  });

  r.patch("/journeys/:id", async (req, res) => {
    const guest = guestId(req);
    const { id } = parse(uuidParam, req.params);
    const body = parse(patchJourneyBody, req.body);
    const journey = await db.transaction(async (tx) => {
      let j = await loadJourney(tx, id, guest, true);
      const now = new Date().toISOString();
      for (const flag of JOURNEY_FLAGS) {
        const value = (body as Partial<Record<string, boolean>>)[flag];
        if (value !== undefined && j[flag] !== value) j = unwrap(setFlag(j, flag, value, now));
      }
      if (body.complete) j = unwrap(completeUmrah(j, now));
      await saveJourney(tx, j);
      return j;
    });
    res.json({ journey });
  });

  for (const kind of ["tawaf", "saee"] as const) {
    r.patch(`/journeys/:id/${kind}`, async (req, res) => {
      const guest = guestId(req);
      const { id } = parse(uuidParam, req.params);
      const { event } = parse(roundEventBody, req.body);
      const journey = await db.transaction(async (tx) => {
        const j = await loadJourney(tx, id, guest, true);
        const now = new Date().toISOString();
        const next = unwrap(kind === "tawaf" ? applyTawafEvent(j, event, now) : applySaeeEvent(j, event, now));
        await saveJourney(tx, next);
        return next;
      });
      res.json({ journey });
    });
  }

  /** :id accepts the checklist item's UUID or its stable content key. */
  r.patch("/checklist/:id", async (req, res) => {
    const guest = guestId(req);
    const itemRef = req.params.id;
    if (typeof itemRef !== "string" || !/^[a-z0-9_.-]{1,100}$/i.test(itemRef)) throw new HttpError(400, "Invalid checklist item id");
    const { journeyId, checked } = parse(patchChecklistBody, req.body);
    const isUuid = uuidParam.safeParse({ id: itemRef }).success;
    const [item] = await db
      .select()
      .from(t.checklistItems)
      .where(isUuid ? or(eq(t.checklistItems.id, itemRef), eq(t.checklistItems.key, itemRef)) : eq(t.checklistItems.key, itemRef));
    if (!item) throw new HttpError(404, "Checklist item not found");
    await db.transaction(async (tx) => {
      await loadJourney(tx, journeyId, guest, true);
      await tx
        .insert(t.journeyChecklist)
        .values({ journeyId, checklistItemId: item.id, checked })
        .onConflictDoUpdate({
          target: [t.journeyChecklist.journeyId, t.journeyChecklist.checklistItemId],
          set: { checked, updatedAt: new Date() },
        });
    });
    res.json({ key: item.key, checked });
  });

  r.get("/bookmarks", async (req, res) => {
    const guest = guestId(req);
    const rows = await db
      .select({ id: t.bookmarks.id, duaKey: t.duas.key, createdAt: t.bookmarks.createdAt })
      .from(t.bookmarks)
      .innerJoin(t.duas, eq(t.duas.id, t.bookmarks.duaId))
      .where(eq(t.bookmarks.guestSessionId, guest))
      .orderBy(desc(t.bookmarks.createdAt));
    res.json(rows);
  });

  r.post("/bookmarks", async (req, res) => {
    const guest = guestId(req);
    const { duaKey } = parse(createBookmarkBody, req.body);
    const [dua] = await db.select({ id: t.duas.id }).from(t.duas).where(eq(t.duas.key, duaKey));
    if (!dua) throw new HttpError(404, "Dua not found");
    await db.insert(t.bookmarks).values({ guestSessionId: guest, duaId: dua.id }).onConflictDoNothing();
    const [row] = await db
      .select({ id: t.bookmarks.id, createdAt: t.bookmarks.createdAt })
      .from(t.bookmarks)
      .where(and(eq(t.bookmarks.guestSessionId, guest), eq(t.bookmarks.duaId, dua.id)));
    res.status(201).json({ ...row, duaKey });
  });

  r.delete("/bookmarks/:id", async (req, res) => {
    const guest = guestId(req);
    const { id } = parse(uuidParam, req.params);
    const deleted = await db
      .delete(t.bookmarks)
      .where(and(eq(t.bookmarks.id, id), eq(t.bookmarks.guestSessionId, guest)))
      .returning({ id: t.bookmarks.id });
    if (deleted.length === 0) throw new HttpError(404, "Bookmark not found");
    res.status(204).end();
  });

  return r;
}
