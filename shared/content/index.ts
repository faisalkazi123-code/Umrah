import { z } from "zod";
import duasJson from "../../server/seed/content/duas.json" with { type: "json" };
import checklistJson from "../../server/seed/content/checklist.json" with { type: "json" };
import ihramJson from "../../server/seed/content/ihram.json" with { type: "json" };
import tawafJson from "../../server/seed/content/tawaf.json" with { type: "json" };
import saeeJson from "../../server/seed/content/saee.json" with { type: "json" };
import completionJson from "../../server/seed/content/completion.json" with { type: "json" };
import madinahJson from "../../server/seed/content/madinah.json" with { type: "json" };
import hajjTypesJson from "../../server/seed/content/hajj-types.json" with { type: "json" };
import footnotesJson from "../../server/seed/content/footnotes.json" with { type: "json" };
import { checklistItemSchema, duaSchema, instructionSchema, type ChecklistItem, type Dua, type Instruction } from "./schema.js";

/** Content is bundled so every screen works offline; the same JSON seeds the database. */
export const duas: Dua[] = z.array(duaSchema).parse(duasJson);
export const checklistItems: ChecklistItem[] = z
  .array(checklistItemSchema)
  .parse(checklistJson)
  .sort((a, b) => a.order - b.order);
export const instructions: Instruction[] = z
  .array(instructionSchema)
  .parse([...ihramJson, ...tawafJson, ...saeeJson, ...completionJson, ...madinahJson, ...hajjTypesJson, ...footnotesJson])
  .sort((a, b) => a.order - b.order);

export function getDua(key: string): Dua | undefined {
  return duas.find((d) => d.key === key);
}

export function getInstruction(key: string): Instruction | undefined {
  return instructions.find((i) => i.key === key);
}

export function getInstructionsByGroup(group: string): Instruction[] {
  return instructions.filter((i) => i.group === group);
}

export function getChecklistBySection(section: ChecklistItem["section"]): ChecklistItem[] {
  return checklistItems.filter((i) => i.section === section);
}

export * from "./schema.js";
