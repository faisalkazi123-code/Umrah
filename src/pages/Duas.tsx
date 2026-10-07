import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { duas, duaCategorySchema, isDuaTextPublishable, type Dua } from "@shared/content";
import { Page } from "@/components/AppShell";
import { DuaCard, DuaViewer } from "@/components/Dua";
import { Icon } from "@/components/Icon";
import { EmptyState } from "@/components/States";
import { useBookmarkStore } from "@/store/bookmarkStore";

type Filter = "all" | "saved" | Dua["category"];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ًͯ-ٰٟ']/g, "");
}

export function searchDuas(list: Dua[], query: string, t: (k: string) => string): Dua[] {
  const q = normalize(query.trim());
  if (!q) return list;
  return list.filter((d) => {
    const fields = [d.title.en, d.title.ar, t(`duas.category.${d.category}`)];
    if (isDuaTextPublishable(d)) fields.push(d.arabic, d.transliteration, d.meaning.en, d.meaning.ar);
    return fields.some((f) => f && normalize(f).includes(q));
  });
}

export default function Duas() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Dua | null>(null);
  const saved = useBookmarkStore((s) => s.keys);

  const results = useMemo(() => {
    const base =
      filter === "all" ? duas : filter === "saved" ? duas.filter((d) => saved.includes(d.key)) : duas.filter((d) => d.category === filter);
    return searchDuas(base, query, t);
  }, [filter, query, saved, t]);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: t("duas.all") },
    { value: "saved", label: t("duas.bookmarked") },
    ...duaCategorySchema.options.map((c) => ({ value: c, label: t(`duas.category.${c}`) })),
  ];

  return (
    <Page title={t("duas.title")}>
      <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-line bg-surface px-4 focus-within:border-primary">
        <Icon name="search" className="size-5 text-muted" />
        <span className="sr-only">{t("duas.search")}</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("duas.search")} className="h-12 flex-1 bg-transparent text-lg outline-none" />
      </label>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={t("duas.title")}>
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`min-h-11 shrink-0 rounded-full border px-4 font-medium whitespace-nowrap ${
              filter === f.value ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {results.length === 0 ? (
        <EmptyState message={t("duas.empty")} />
      ) : (
        <ul className="space-y-3">
          {results.map((d) => (
            <li key={d.key}>
              <DuaCard dua={d} onOpen={() => setOpen(d)} />
            </li>
          ))}
        </ul>
      )}
      <DuaViewer dua={open} open={!!open} onClose={() => setOpen(null)} />
    </Page>
  );
}
