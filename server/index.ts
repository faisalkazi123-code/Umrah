import "dotenv/config";
import path from "node:path";
import { createApp } from "./app.js";
import { createDb } from "./db/client.js";

const port = Number(process.env.PORT ?? 3001);
const { db } = createDb();
const isProd = process.env.NODE_ENV === "production";

const app = createApp({
  db,
  corsOrigins: (process.env.CORS_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  secureCookie: process.env.COOKIE_SECURE === "true",
  staticDir: isProd ? path.resolve("dist") : undefined,
});

app.listen(port, () => console.info(`API listening on http://localhost:${port}`));
