import { and, eq, sql } from "drizzle-orm";
import { checklistItems, duas, instructions } from "../../shared/content/index.js";
import { createDb, type Db } from "../db/client.js";
import * as t from "../db/schema.js";

const STAGES = [
  { key: "ihram", position: 1, titleEn: "Ihram", titleAr: "الإحرام" },
  { key: "tawaf", position: 2, titleEn: "Tawaf", titleAr: "الطواف" },
  { key: "saee", position: 3, titleEn: "Sa'ee", titleAr: "السعي" },
  { key: "completion", position: 4, titleEn: "Shaving / Trimming", titleAr: "الحلق / التقصير" },
  { key: "complete", position: 5, titleEn: "Complete", titleAr: "اكتمال العمرة" },
];

/** Key-order-independent JSON (jsonb does not preserve key order). */
function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

async function recordVersion(db: Db, contentType: "dua" | "step" | "checklist_item", contentKey: string, data: unknown) {
  const [latest] = await db
    .select()
    .from(t.contentVersions)
    .where(and(eq(t.contentVersions.contentType, contentType), eq(t.contentVersions.contentKey, contentKey)))
    .orderBy(sql`${t.contentVersions.version} desc`)
    .limit(1);
  if (latest && canonical(latest.data) === canonical(data)) return;
  if (latest) {
    await db.update(t.contentVersions).set({ status: "archived" }).where(eq(t.contentVersions.id, latest.id));
  }
  await db.insert(t.contentVersions).values({
    contentType,
    contentKey,
    version: (latest?.version ?? 0) + 1,
    status: "published",
    data,
    note: "Imported from server/seed/content",
  });
}

export async function seed(db: Db) {
  for (const s of STAGES) {
    await db.insert(t.stages).values(s).onConflictDoUpdate({ target: t.stages.key, set: s });
  }
  for (const d of duas) {
    const row = {
      key: d.key,
      category: d.category,
      titleEn: d.title.en,
      titleAr: d.title.ar,
      arabic: d.arabic,
      transliteration: d.transliteration,
      meaningEn: d.meaning.en,
      meaningAr: d.meaning.ar,
      audioUrl: d.audioUrl,
      ...d.source,
      reviewStatus: d.reviewStatus,
    };
    await db.insert(t.duas).values(row).onConflictDoUpdate({ target: t.duas.key, set: row });
    await recordVersion(db, "dua", d.key, d);
  }
  for (const i of instructions) {
    const row = {
      key: i.key,
      group: i.group,
      position: i.order,
      audience: i.audience,
      titleEn: i.title.en,
      titleAr: i.title.ar,
      bodyEn: i.body.en,
      bodyAr: i.body.ar,
      ...i.source,
      reviewStatus: i.reviewStatus,
    };
    await db.insert(t.steps).values(row).onConflictDoUpdate({ target: t.steps.key, set: row });
    await recordVersion(db, "step", i.key, i);
  }
  for (const c of checklistItems) {
    const row = {
      key: c.key,
      section: c.section,
      position: c.order,
      audience: c.audience,
      labelEn: c.label.en,
      labelAr: c.label.ar,
      ...c.source,
      reviewStatus: c.reviewStatus,
    };
    await db.insert(t.checklistItems).values(row).onConflictDoUpdate({ target: t.checklistItems.key, set: row });
    await recordVersion(db, "checklist_item", c.key, c);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { db, pool } = createDb();
  await seed(db);
  await pool.end();
  console.info(`Seeded ${STAGES.length} stages, ${duas.length} duas, ${instructions.length} steps, ${checklistItems.length} checklist items`);
}
