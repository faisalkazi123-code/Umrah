import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";
import { keyParam } from "../../shared/api/schemas.js";
import type { Db } from "../db/client.js";
import * as t from "../db/schema.js";
import { HttpError, parse } from "../middleware/http.js";

type DuaRow = typeof t.duas.$inferSelect;
type StepRow = typeof t.steps.$inferSelect;
type ChecklistRow = typeof t.checklistItems.$inferSelect;

const source = (r: DuaRow | StepRow | ChecklistRow) => ({
  sourceDocument: r.sourceDocument,
  sourceSection: r.sourceSection,
  sourcePage: r.sourcePage,
  sourceReference: r.sourceReference,
});

/** Dua text is withheld until it is approved against the guide (CLAUDE.md §16). */
export function toDuaDto(r: DuaRow) {
  const publish = r.reviewStatus === "approved";
  return {
    id: r.id,
    key: r.key,
    category: r.category,
    title: { en: r.titleEn, ar: r.titleAr },
    arabic: publish ? r.arabic : null,
    transliteration: publish ? r.transliteration : null,
    meaning: { en: publish ? r.meaningEn : null, ar: publish ? r.meaningAr : null },
    audioUrl: publish ? r.audioUrl : null,
    source: source(r),
    reviewStatus: r.reviewStatus,
  };
}

const toStepDto = (r: StepRow) => ({
  id: r.id,
  key: r.key,
  group: r.group,
  order: r.position,
  audience: r.audience,
  title: { en: r.titleEn, ar: r.titleAr },
  body: r.reviewStatus === "awaiting_source" ? { en: null, ar: null } : { en: r.bodyEn, ar: r.bodyAr },
  source: source(r),
  reviewStatus: r.reviewStatus,
});

export const toChecklistDto = (r: ChecklistRow) => ({
  id: r.id,
  key: r.key,
  section: r.section,
  order: r.position,
  audience: r.audience,
  label: { en: r.labelEn, ar: r.labelAr },
  source: source(r),
  reviewStatus: r.reviewStatus,
});

const listQuery = z.object({
  group: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  q: z.string().max(100).optional(),
});

export function contentRouter(db: Db) {
  const r = Router();

  r.get("/stages", async (_req, res) => {
    res.json(await db.select().from(t.stages).orderBy(asc(t.stages.position)));
  });

  r.get("/stages/:key", async (req, res) => {
    const { key } = parse(keyParam, req.params);
    const [stage] = await db.select().from(t.stages).where(eq(t.stages.key, key));
    if (!stage) throw new HttpError(404, "Stage not found");
    const steps = await db.select().from(t.steps).where(eq(t.steps.group, key)).orderBy(asc(t.steps.position));
    res.json({ ...stage, steps: steps.map(toStepDto) });
  });

  r.get("/steps", async (req, res) => {
    const { group } = parse(listQuery, req.query);
    const rows = await db
      .select()
      .from(t.steps)
      .where(group ? eq(t.steps.group, group) : undefined)
      .orderBy(asc(t.steps.group), asc(t.steps.position));
    res.json(rows.map(toStepDto));
  });

  r.get("/steps/:key", async (req, res) => {
    const { key } = parse(keyParam, req.params);
    const [row] = await db.select().from(t.steps).where(eq(t.steps.key, key));
    if (!row) throw new HttpError(404, "Step not found");
    res.json(toStepDto(row));
  });

  r.get("/duas", async (req, res) => {
    const { category, q } = parse(listQuery, req.query);
    const conds: SQL[] = [];
    if (category) conds.push(eq(t.duas.category, category));
    if (q) {
      const like = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
      conds.push(or(ilike(t.duas.titleEn, like), ilike(t.duas.titleAr, like))!);
    }
    const rows = await db.select().from(t.duas).where(and(...conds)).orderBy(asc(t.duas.key));
    res.json(rows.map(toDuaDto));
  });

  r.get("/duas/:key", async (req, res) => {
    const { key } = parse(keyParam, req.params);
    const [row] = await db.select().from(t.duas).where(eq(t.duas.key, key));
    if (!row) throw new HttpError(404, "Dua not found");
    res.json(toDuaDto(row));
  });

  r.get("/checklist", async (_req, res) => {
    const rows = await db.select().from(t.checklistItems).orderBy(asc(t.checklistItems.section), asc(t.checklistItems.position));
    res.json(rows.map(toChecklistDto));
  });

  return r;
}
