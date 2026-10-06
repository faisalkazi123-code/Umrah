import { create } from "zustand";
import { changeLanguage, type Language } from "@/i18n";
import { applyFontSize, applyTheme, loadPrefs, savePrefs, type FontSize, type Prefs, type Theme } from "@/lib/prefs";

interface PrefsStore extends Prefs {
  setLanguage: (l: Language) => void;
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
  completeOnboarding: () => void;
}

export const usePrefsStore = create<PrefsStore>((set, get) => {
  const save = (patch: Partial<Prefs>) => {
    set(patch);
    const { language, theme, fontSize, onboarded } = get();
    savePrefs({ language, theme, fontSize, onboarded });
  };
  return {
    ...loadPrefs(),
    setLanguage: (language) => {
      save({ language });
      void changeLanguage(language);
    },
    setTheme: (theme) => {
      save({ theme });
      applyTheme(theme);
    },
    setFontSize: (fontSize) => {
      save({ fontSize });
      applyFontSize(fontSize);
    },
    completeOnboarding: () => save({ onboarded: true }),
  };
});
