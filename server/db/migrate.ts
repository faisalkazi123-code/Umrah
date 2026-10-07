import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { createDb } from "./client.js";

// Run from the repository root (npm run db:migrate).
const migrationsFolder = path.resolve("server/db/migrations");

const { db, pool } = createDb();
await migrate(db, { migrationsFolder });
await pool.end();
console.info("Migrations applied");
