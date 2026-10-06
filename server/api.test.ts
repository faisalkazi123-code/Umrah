// @vitest-environment node
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app";
import { createDb } from "./db/client";
import { seed } from "./seed/seed";

/**
 * Integration tests against a real PostgreSQL database.
 * Set TEST_DATABASE_URL (e.g. postgres://umrah:umrah@localhost:5432/umrah_test). Skipped when unset.
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("API", () => {
  const { db, pool } = createDb(url);
  const app = createApp({ db, rateLimitPerMinute: 10_000 });
  const JOURNEY = "6f1c2a7e-8a43-4c1b-9b0a-3c5f0f8c0b11";
  let agent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await pool.query("drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;");
    await migrate(db, { migrationsFolder: path.resolve("server/db/migrations") });
    await seed(db);
    agent = request.agent(app);
  });
  afterAll(() => pool.end());

  const send = (method: "post" | "patch", p: string, body: object) =>
    agent[method](`/api${p}`).set("Content-Type", "application/json").send(body);

  it("health", async () => {
    expect((await agent.get("/api/health")).body).toEqual({ status: "ok" });
  });

  it("serves content and withholds unapproved dua text", async () => {
    const duas = await agent.get("/api/duas");
    expect(duas.status).toBe(200);
    expect(duas.body.length).toBe(6);
    for (const d of duas.body) if (d.reviewStatus !== "approved") expect(d.arabic).toBeNull();
    expect((await agent.get("/api/duas/dua.talbiyah")).body.category).toBe("talbiyah");
    expect((await agent.get("/api/duas?category=tawaf")).body).toHaveLength(1);
    expect((await agent.get("/api/stages")).body.map((s: { key: string }) => s.key)).toEqual([
      "ihram", "tawaf", "saee", "completion", "complete",
    ]);
    expect((await agent.get("/api/stages/tawaf")).body.steps.length).toBeGreaterThan(0);
    expect((await agent.get("/api/steps?group=footnotes")).body).toHaveLength(4);
    expect((await agent.get("/api/steps/saee.green_lights")).body.audience).toBe("men");
    expect((await agent.get("/api/checklist")).body).toHaveLength(14);
    expect((await agent.get("/api/duas/nope")).status).toBe(404);
  });

  it("creates a guest journey without registration", async () => {
    expect((await agent.get("/api/journeys/current")).body).toEqual({ journey: null });
    const res = await send("post", "/journeys", { id: JOURNEY });
    expect(res.status).toBe(201);
    expect(res.body.journey).toMatchObject({ id: JOURNEY, tawaf: "NOT_STARTED", saee: "NOT_STARTED" });
    expect((await send("post", "/journeys", { id: JOURNEY })).status).toBe(201); // idempotent retry
    expect((await agent.get("/api/journeys/current")).body.journey.id).toBe(JOURNEY);
  });

  it("validates write bodies with Zod and requires JSON", async () => {
    expect((await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "JUMP" })).status).toBe(400);
    expect((await send("patch", `/journeys/${JOURNEY}`, { hacked: true })).status).toBe(400);
    expect((await send("patch", `/journeys/not-a-uuid/tawaf`, { event: "START" })).status).toBe(400);
    const form = await agent.patch(`/api/journeys/${JOURNEY}/tawaf`).type("form").send("event=START");
    expect(form.status).toBe(415);
  });

  it("rejects invalid Tawaf transitions and enforces 7 circuits", async () => {
    expect((await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "COMPLETE_ROUND" })).status).toBe(409);
    expect((await send("patch", `/journeys/${JOURNEY}/saee`, { event: "START" })).status).toBe(409);
    expect((await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "START" })).body.journey.tawaf).toBe("ROUND_1");
    for (let i = 0; i < 4; i++) await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "COMPLETE_ROUND" });
    expect((await agent.get("/api/journeys/current")).body.journey.tawaf).toBe("ROUND_5");
    expect((await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "UNDO" })).body.journey.tawaf).toBe("ROUND_4");
    for (let i = 0; i < 4; i++) await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "COMPLETE_ROUND" });
    const over = await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "COMPLETE_ROUND" });
    expect(over.status).toBe(409);
  });

  it("runs Sa'ee to completion and completes Umrah", async () => {
    expect((await send("patch", `/journeys/${JOURNEY}`, { complete: true })).status).toBe(409);
    await send("patch", `/journeys/${JOURNEY}/saee`, { event: "START" });
    for (let i = 0; i < 7; i++) await send("patch", `/journeys/${JOURNEY}/saee`, { event: "COMPLETE_ROUND" });
    expect((await send("patch", `/journeys/${JOURNEY}/saee`, { event: "COMPLETE_ROUND" })).status).toBe(409);
    const done = await send("patch", `/journeys/${JOURNEY}`, { complete: true });
    expect(done.status).toBe(200);
    expect(done.body.journey.completedAt).not.toBeNull();
    expect(done.body.journey.shavingDone).toBe(true);
  });

  it("persists checklist items by key", async () => {
    const res = await send("patch", "/checklist/checklist.ihram.ghusl", { journeyId: JOURNEY, checked: true });
    expect(res.status).toBe(200);
    expect((await agent.get("/api/journeys/current")).body.journey.checklist["checklist.ihram.ghusl"]).toBe(true);
  });

  it("isolates guests: another guest cannot read or modify the journey (IDOR)", async () => {
    const other = request.agent(app);
    const res = await other.patch(`/api/journeys/${JOURNEY}/tawaf`).set("Content-Type", "application/json").send({ event: "RESET" });
    expect(res.status).toBe(404);
    expect((await other.get("/api/journeys/current")).body.journey).toBeNull();
    const steal = await other.post("/api/journeys").set("Content-Type", "application/json").send({ id: JOURNEY });
    expect(steal.status).toBe(409);
  });

  it("manages bookmarks per guest", async () => {
    const created = await send("post", "/bookmarks", { duaKey: "dua.talbiyah" });
    expect(created.status).toBe(201);
    expect((await agent.get("/api/bookmarks")).body).toHaveLength(1);
    const other = request.agent(app);
    expect((await other.delete(`/api/bookmarks/${created.body.id}`)).status).toBe(404);
    expect((await agent.delete(`/api/bookmarks/${created.body.id}`)).status).toBe(204);
    expect((await agent.get("/api/bookmarks")).body).toHaveLength(0);
  });

  it("does not leak error details", async () => {
    const res = await agent.post("/api/journeys").set("Content-Type", "application/json").send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Malformed JSON" });
  });

  it("archives the previous journey when a new one is started (reset)", async () => {
    const res = await send("post", "/journeys", {});
    expect(res.status).toBe(201);
    expect(res.body.journey.id).not.toBe(JOURNEY);
    expect((await send("patch", `/journeys/${JOURNEY}/tawaf`, { event: "RESET" })).status).toBe(404);
  });
});
