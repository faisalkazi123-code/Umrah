import { describe, expect, it } from "vitest";
import { checklistItems, duas, instructions } from "./index";

describe("seed content integrity", () => {
  const all = [...duas, ...checklistItems, ...instructions];

  it("has unique keys", () => {
    const keys = all.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every record carries source traceability and a review status", () => {
    for (const c of all) {
      expect(c.source.sourceDocument).toBe("Umrah Guide.pdf");
      expect(["awaiting_source", "needs_review", "approved"]).toContain(c.reviewStatus);
    }
  });

  it("no dua text is approved without a page reference", () => {
    for (const d of duas.filter((x) => x.reviewStatus === "approved")) {
      expect(d.source.sourcePage).not.toBeNull();
      expect(d.arabic).not.toBeNull();
    }
  });

  it("covers every dua category required by the library", () => {
    expect(new Set(duas.map((d) => d.category))).toEqual(
      new Set(["ihram", "talbiyah", "haram", "tawaf", "saee", "leaving_haram"]),
    );
  });

  it("references the walking-guidance keys used by the Tawaf screen", () => {
    expect(instructions.map((i) => i.key)).toEqual(
      expect.arrayContaining(["tawaf.walking.circuits_1_3", "tawaf.walking.circuits_4_7", "saee.green_lights"]),
    );
  });
});
