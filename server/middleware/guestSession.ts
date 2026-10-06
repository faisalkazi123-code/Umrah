import { createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import type { Db } from "../db/client.js";
import { guestSessions } from "../db/schema.js";

export const GUEST_COOKIE = "uc_guest";
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

declare module "express-serve-static-core" {
  interface Request {
    guestSessionId?: string;
  }
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Anonymous guest identity: a random 256-bit token in an httpOnly cookie. Only its hash is stored.
 * All journey/bookmark queries are scoped to the resolved guest session (prevents IDOR).
 */
export function guestSession(db: Db, opts: { secureCookie: boolean }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token: unknown = req.cookies?.[GUEST_COOKIE];
      if (typeof token === "string" && /^[a-f0-9]{64}$/.test(token)) {
        const [row] = await db
          .update(guestSessions)
          .set({ lastSeenAt: new Date() })
          .where(eq(guestSessions.tokenHash, hash(token)))
          .returning({ id: guestSessions.id });
        if (row) {
          req.guestSessionId = row.id;
          return next();
        }
      }
      const fresh = randomBytes(32).toString("hex");
      const [created] = await db.insert(guestSessions).values({ tokenHash: hash(fresh) }).returning({ id: guestSessions.id });
      req.guestSessionId = created!.id;
      res.cookie(GUEST_COOKIE, fresh, {
        httpOnly: true,
        sameSite: "lax",
        secure: opts.secureCookie,
        maxAge: ONE_YEAR_MS,
        path: "/api",
      });
      next();
    } catch (err) {
      next(err);
    }
  };
}
