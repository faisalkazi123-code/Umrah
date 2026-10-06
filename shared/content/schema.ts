import { z } from "zod";

/**
 * Religious content integrity (see CLAUDE.md §14–16):
 * - awaiting_source: the supplied Umrah Guide has not been transcribed yet. Text fields must be null.
 * - needs_review:    text exists but has not been verified against the guide. Shown with a review badge,
 *                    except Arabic / transliteration / meaning of duas, which are never shown until approved.
 * - approved:        verified against the guide by a reviewer.
 */
export const reviewStatusSchema = z.enum(["awaiting_source", "needs_review", "approved"]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

export const sourceSchema = z.object({
  sourceDocument: z.string().min(1),
  sourceSection: z.string().nullable(),
  sourcePage: z.number().int().positive().nullable(),
  sourceReference: z.string().nullable(),
});
export type Source = z.infer<typeof sourceSchema>;

export const localizedSchema = z.object({ en: z.string().min(1), ar: z.string().nullable() });
export const optionalLocalizedSchema = z.object({ en: z.string().nullable(), ar: z.string().nullable() });

export const audienceSchema = z.enum(["all", "men", "women"]);
export type Audience = z.infer<typeof audienceSchema>;

const base = {
  key: z.string().regex(/^[a-z0-9_.-]+$/),
  source: sourceSchema,
  reviewStatus: reviewStatusSchema,
};

export const duaCategorySchema = z.enum(["ihram", "talbiyah", "haram", "tawaf", "saee", "leaving_haram"]);
export type DuaCategory = z.infer<typeof duaCategorySchema>;

export const duaSchema = z
  .object({
    ...base,
    category: duaCategorySchema,
    title: localizedSchema,
    arabic: z.string().nullable(),
    transliteration: z.string().nullable(),
    meaning: optionalLocalizedSchema,
    audioUrl: z.string().nullable(),
  })
  .superRefine(noTextWhileAwaiting(["arabic", "transliteration"]));
export type Dua = z.infer<typeof duaSchema>;

export const instructionSchema = z
  .object({
    ...base,
    group: z.string().min(1),
    order: z.number().int(),
    audience: audienceSchema,
    title: localizedSchema,
    body: optionalLocalizedSchema,
  })
  .superRefine(noTextWhileAwaiting([]));
export type Instruction = z.infer<typeof instructionSchema>;

export const checklistSectionSchema = z.enum(["before_ihram", "ihram", "tawaf", "saee", "completion"]);
export type ChecklistSection = z.infer<typeof checklistSectionSchema>;

export const checklistItemSchema = z.object({
  ...base,
  section: checklistSectionSchema,
  order: z.number().int(),
  audience: audienceSchema,
  label: localizedSchema,
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

function noTextWhileAwaiting(fields: string[]) {
  return (val: Record<string, unknown> & { reviewStatus: ReviewStatus }, ctx: z.RefinementCtx) => {
    if (val.reviewStatus !== "awaiting_source") return;
    for (const f of fields) {
      if (val[f] !== null) ctx.addIssue({ code: "custom", message: `${f} must be null while awaiting_source`, path: [f] });
    }
    for (const f of ["meaning", "body"]) {
      const v = val[f] as { en: string | null; ar: string | null } | undefined;
      if (v && (v.en !== null || v.ar !== null)) {
        ctx.addIssue({ code: "custom", message: `${f} must be null while awaiting_source`, path: [f] });
      }
    }
  };
}

/** Dua text (Arabic, transliteration, meaning) is only shown once approved. */
export function isDuaTextPublishable(d: Dua): boolean {
  return d.reviewStatus === "approved" && d.arabic !== null;
}

/** Instruction bodies may be shown with a review badge once text exists. */
export function hasInstructionBody(i: Instruction): boolean {
  return i.reviewStatus !== "awaiting_source" && i.body.en !== null;
}
