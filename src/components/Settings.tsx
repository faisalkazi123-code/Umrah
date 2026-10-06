import { useTranslation } from "react-i18next";
import { LANGUAGES, type Language } from "@/i18n";
import type { FontSize, Theme } from "@/lib/prefs";
import { usePrefsStore } from "@/store/prefsStore";

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{label}</legend>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border-2 px-2 text-center font-medium has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent ${
              value === o.value ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface"
            }`}
          >
            <input type="radio" className="sr-only" name={label} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = usePrefsStore();
  return (
    <Segmented<Language>
      label={t("settings.language")}
      value={language}
      onChange={setLanguage}
      options={(Object.keys(LANGUAGES) as Language[]).map((l) => ({ value: l, label: LANGUAGES[l].label }))}
    />
  );
}

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme } = usePrefsStore();
  return (
    <Segmented<Theme>
      label={t("settings.theme")}
      value={theme}
      onChange={setTheme}
      options={(["system", "light", "dark"] as const).map((v) => ({ value: v, label: t(`settings.themeOption.${v}`) }))}
    />
  );
}

export function FontSizeSelector() {
  const { t } = useTranslation();
  const { fontSize, setFontSize } = usePrefsStore();
  return (
    <Segmented<FontSize>
      label={t("settings.textSize")}
      value={fontSize}
      onChange={setFontSize}
      options={(["sm", "md", "lg", "xl"] as const).map((v) => ({ value: v, label: t(`settings.size.${v}`) }))}
    />
  );
}
