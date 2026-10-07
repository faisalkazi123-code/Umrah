import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const sourceColumns = () => ({
  sourceDocument: text("source_document").notNull(),
  sourceSection: text("source_section"),
  sourcePage: integer("source_page"),
  sourceReference: text("source_reference"),
  reviewStatus: text("review_status", { enum: ["awaiting_source", "needs_review", "approved"] }).notNull(),
});

/** Reserved for future sign-in (phone OTP / email / Apple / Google). Guests never need a row here. */
export const users = pgTable("users", {
  id: id(),
  email: text("email").unique(),
  displayName: text("display_name"),
  createdAt: createdAt(),
});

export const guestSessions = pgTable("guest_sessions", {
  id: id(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
});

export const journeys = pgTable(
  "journeys",
  {
    id: uuid("id").primaryKey(),
    guestSessionId: uuid("guest_session_id")
      .notNull()
      .references(() => guestSessions.id, { onDelete: "cascade" }),
    niyyahDone: boolean("niyyah_done").notNull().default(false),
    talbiyahDone: boolean("talbiyah_done").notNull().default(false),
    haramEntered: boolean("haram_entered").notNull().default(false),
    shavingDone: boolean("shaving_done").notNull().default(false),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (t) => [index("journeys_guest_idx").on(t.guestSessionId)],
);

export const stages = pgTable("stages", {
  id: id(),
  key: text("key").notNull().unique(),
  position: integer("position").notNull(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
});

/** Instructional content: journey steps and guide sections (Madinah, Hajj types, footnotes). */
export const steps = pgTable(
  "steps",
  {
    id: id(),
    key: text("key").notNull().unique(),
    group: text("group").notNull(),
    position: integer("position").notNull(),
    audience: text("audience", { enum: ["all", "men", "women"] }).notNull(),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar"),
    bodyEn: text("body_en"),
    bodyAr: text("body_ar"),
    ...sourceColumns(),
  },
  (t) => [index("steps_group_idx").on(t.group)],
);

export const duas = pgTable("duas", {
  id: id(),
  key: text("key").notNull().unique(),
  category: text("category").notNull(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  arabic: text("arabic"),
  transliteration: text("transliteration"),
  meaningEn: text("meaning_en"),
  meaningAr: text("meaning_ar"),
  audioUrl: text("audio_url"),
  ...sourceColumns(),
});

export const checklistItems = pgTable("checklist_items", {
  id: id(),
  key: text("key").notNull().unique(),
  section: text("section").notNull(),
  position: integer("position").notNull(),
  audience: text("audience", { enum: ["all", "men", "women"] }).notNull(),
  labelEn: text("label_en").notNull(),
  labelAr: text("label_ar"),
  ...sourceColumns(),
});

export const journeyChecklist = pgTable(
  "journey_checklist",
  {
    journeyId: uuid("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    checklistItemId: uuid("checklist_item_id")
      .notNull()
      .references(() => checklistItems.id, { onDelete: "cascade" }),
    checked: boolean("checked").notNull(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.journeyId, t.checklistItemId] })],
);

const roundState = () =>
  text("state", {
    enum: ["NOT_STARTED", "ROUND_1", "ROUND_2", "ROUND_3", "ROUND_4", "ROUND_5", "ROUND_6", "ROUND_7", "COMPLETED"],
  })
    .notNull()
    .default("NOT_STARTED");

export const tawafProgress = pgTable("tawaf_progress", {
  journeyId: uuid("journey_id")
    .primaryKey()
    .references(() => journeys.id, { onDelete: "cascade" }),
  state: roundState(),
  updatedAt: updatedAt(),
});

export const saeeProgress = pgTable("saee_progress", {
  journeyId: uuid("journey_id")
    .primaryKey()
    .references(() => journeys.id, { onDelete: "cascade" }),
  state: roundState(),
  updatedAt: updatedAt(),
});

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: id(),
    guestSessionId: uuid("guest_session_id")
      .notNull()
      .references(() => guestSessions.id, { onDelete: "cascade" }),
    duaId: uuid("dua_id")
      .notNull()
      .references(() => duas.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [unique("bookmarks_guest_dua_uq").on(t.guestSessionId, t.duaId)],
);

/** Versioned snapshots of religious content: draft → review → published → archived. */
export const contentVersions = pgTable(
  "content_versions",
  {
    id: id(),
    contentType: text("content_type", { enum: ["dua", "step", "checklist_item"] }).notNull(),
    contentKey: text("content_key").notNull(),
    version: integer("version").notNull(),
    status: text("status", { enum: ["draft", "review", "published", "archived"] }).notNull(),
    data: jsonb("data").notNull(),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [unique("content_versions_uq").on(t.contentType, t.contentKey, t.version)],
);
