import { isLanguage, type Language } from "@/i18n";

/** Small preferences only (CLAUDE.md §40); structured progress lives in IndexedDB. */
export type Theme = "system" | "light" | "dark";
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface Prefs {
  language: Language;
  theme: Theme;
  fontSize: FontSize;
  onboarded: boolean;
}

const KEY = "uc.prefs.v1";
const THEMES: Theme[] = ["system", "light", "dark"];
const SIZES: FontSize[] = ["sm", "md", "lg", "xl"];

function detectLanguage(): Language {
  const nav = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
  return isLanguage(nav) ? nav : "en";
}

export function loadPrefs(): Prefs {
  const defaults: Prefs = { language: detectLanguage(), theme: "system", fontSize: "md", onboarded: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      language: isLanguage(p.language) ? p.language : defaults.language,
      theme: THEMES.includes(p.theme as Theme) ? (p.theme as Theme) : defaults.theme,
      fontSize: SIZES.includes(p.fontSize as FontSize) ? (p.fontSize as FontSize) : defaults.fontSize,
      onboarded: p.onboarded === true,
    };
  } catch {
    return defaults;
  }
}

export function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // Storage may be unavailable (private mode); preferences then last for the session only.
  }
}

export function applyTheme(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

export function applyFontSize(size: FontSize) {
  document.documentElement.dataset.fontSize = size;
}
