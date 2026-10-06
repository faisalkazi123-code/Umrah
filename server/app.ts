import cookieParser from "cookie-parser";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import type { Db } from "./db/client.js";
import { guestSession } from "./middleware/guestSession.js";
import { cors, errorHandler, HttpError, requireJson } from "./middleware/http.js";
import { contentRouter } from "./routes/content.js";
import { journeyRouter } from "./routes/journeys.js";

export interface AppOptions {
  db: Db;
  corsOrigins?: string[];
  secureCookie?: boolean;
  /** Directory containing the built SPA; when set, it is served with an index.html fallback. */
  staticDir?: string;
  rateLimitPerMinute?: number;
}

export function createApp({ db, corsOrigins = [], secureCookie = false, staticDir, rateLimitPerMinute = 300 }: AppOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          mediaSrc: ["'self'"],
          connectSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'"],
          upgradeInsecureRequests: null,
        },
      },
    }),
  );

  const api = express.Router();
  api.use(rateLimit({ windowMs: 60_000, limit: rateLimitPerMinute, standardHeaders: "draft-7", legacyHeaders: false }));
  api.use(cors(corsOrigins));
  api.use(express.json({ limit: "16kb" }));
  api.use(requireJson);
  api.use(cookieParser());
  api.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  api.use(contentRouter(db));
  api.use(guestSession(db, { secureCookie }));
  api.use(journeyRouter(db));
  api.use((_req, _res, next) => next(new HttpError(404, "Not found")));
  api.use(errorHandler);
  app.use("/api", api);

  if (staticDir) {
    app.use(express.static(staticDir, { index: false, maxAge: "1h" }));
    app.get("/{*splat}", (_req, res) => res.sendFile(path.join(staticDir, "index.html")));
  }
  return app;
}
