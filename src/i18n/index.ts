import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

/**
 * Supported UI languages. Add Urdu, Hindi, Malayalam, Bengali, Indonesian or Turkish by
 * adding a locale file and an entry here; `dir` drives document-level RTL.
 */
export const LANGUAGES = {
  en: { label: "English", dir: "ltr" },
  ar: { label: "العربية", dir: "rtl" },
} as const;
export type Language = keyof typeof LANGUAGES;

export function isLanguage(v: unknown): v is Language {
  return typeof v === "string" && v in LANGUAGES;
}

export function applyDocumentLanguage(lang: Language) {
  document.documentElement.lang = lang;
  document.documentElement.dir = LANGUAGES[lang].dir;
}

export function initI18n(lang: Language) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    lng: lang,
    fallbackLng: "en",
    interpolation: { escapeValue: false }, // React already escapes output
    returnNull: false,
  });
  applyDocumentLanguage(lang);
  return i18n;
}

export async function changeLanguage(lang: Language) {
  await i18n.changeLanguage(lang);
  applyDocumentLanguage(lang);
}

/** Pick the localized value of a content field, falling back to English when no reviewed translation exists. */
export function localized(value: { en: string | null; ar: string | null }, lang: string): string | null {
  return (lang === "ar" ? value.ar : value.en) ?? value.en;
}

export default i18n;
