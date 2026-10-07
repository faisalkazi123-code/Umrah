import { describe, expect, it } from "vitest";
import ar from "./locales/ar.json";
import en from "./locales/en.json";
import i18n, { changeLanguage, initI18n, localized } from "./index";

function keys(o: object, prefix = ""): string[] {
  return Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? keys(v as object, `${prefix}${k}.`) : [`${prefix}${k}`]));
}

describe("language switching", () => {
  it("switches strings and document direction between English and Arabic", async () => {
    initI18n("en");
    expect(document.documentElement.dir).toBe("ltr");
    expect(i18n.t("nav.home")).toBe("Home");
    await changeLanguage("ar");
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("ar");
    expect(i18n.t("nav.home")).toBe("الرئيسية");
    await changeLanguage("en");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("Arabic and English locales define the same keys", () => {
    expect(keys(ar).sort()).toEqual(keys(en).sort());
  });

  it("falls back to English content when no reviewed Arabic exists", () => {
    expect(localized({ en: "Talbiyah", ar: null }, "ar")).toBe("Talbiyah");
    expect(localized({ en: "Talbiyah", ar: "التلبية" }, "ar")).toBe("التلبية");
  });
});
