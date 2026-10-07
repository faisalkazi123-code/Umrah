import { z } from "zod";
import { ROUND_EVENTS } from "../domain/rounds/roundMachine.js";

export const uuidParam = z.object({ id: z.uuid() });
export const keyParam = z.object({ key: z.string().regex(/^[a-z0-9_.-]{1,100}$/) });

export const createJourneyBody = z.object({ id: z.uuid().optional() }).strict();

export const patchJourneyBody = z
  .object({
    niyyahDone: z.boolean().optional(),
    talbiyahDone: z.boolean().optional(),
    haramEntered: z.boolean().optional(),
    complete: z.literal(true).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, "At least one field is required");

export const roundEventBody = z.object({ event: z.enum(ROUND_EVENTS) }).strict();

export const patchChecklistBody = z.object({ journeyId: z.uuid(), checked: z.boolean() }).strict();

export const createBookmarkBody = z.object({ duaKey: z.string().regex(/^[a-z0-9_.-]{1,100}$/) }).strict();
