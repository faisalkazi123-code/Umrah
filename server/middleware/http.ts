import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function parse<T extends z.ZodType>(schema: T, value: unknown): z.infer<T> {
  const r = schema.safeParse(value);
  if (!r.success) throw new HttpError(400, r.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; "));
  return r.data;
}

/** Bodies must be JSON: cross-site JSON requests need a CORS preflight, which blocks form-post CSRF. */
export function requireJson(req: Request, _res: Response, next: NextFunction) {
  if (["POST", "PATCH", "PUT"].includes(req.method) && !req.is("application/json")) {
    return next(new HttpError(415, "Content-Type must be application/json"));
  }
  next();
}

/** Only explicitly allowed origins get CORS headers; same-origin requests need none. */
export function cors(allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && allowed.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Vary", "Origin");
    }
    if (req.method === "OPTIONS") return res.sendStatus(origin && allowed.includes(origin) ? 204 : 403);
    next();
  };
}

// Express identifies error handlers by arity, so all four parameters are required.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  if (typeof err === "object" && err && "type" in err && err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
