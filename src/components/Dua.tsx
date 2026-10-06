import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { isDuaTextPublishable, type Dua } from "@shared/content/schema";
import { localized } from "@/i18n";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { Card } from "./Card";
import { AwaitingSource, SourceLine } from "./ContentNotice";
import { BottomSheet } from "./Dialog";
import { Icon } from "./Icon";

/** Streams audio only when pressed; nothing is preloaded (CLAUDE.md §53). */
export function AudioPlayer({ src }: { src: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => ref.current?.pause(), []);
  return (
    <div>
      <audio ref={ref} src={src} preload="none" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />
      <button
        type="button"
        onClick={() => (playing ? ref.current?.pause() : void ref.current?.play())}
        className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-primary-soft px-4 font-semibold text-primary"
      >
        <Icon name={playing ? "pause" : "play"} />
        {t("duas.listen")}
      </button>
    </div>
  );
}

export function DuaText({ dua }: { dua: Dua }) {
  const { t, i18n } = useTranslation();
  if (!isDuaTextPublishable(dua)) return <AwaitingSource message={t("content.awaitingDua")} />;
  const meaning = localized(dua.meaning, i18n.language);
  return (
    <div className="space-y-5">
      <section>
        <h4 className="sr-only">{t("duas.arabic")}</h4>
        <p lang="ar" className="arabic-text text-[1.75em]">
          {dua.arabic}
        </p>
      </section>
      {dua.transliteration && (
        <section>
          <h4 className="mb-1 text-sm font-semibold text-muted">{t("duas.transliteration")}</h4>
          <p dir="ltr" className="text-lg italic">
            {dua.transliteration}
          </p>
        </section>
      )}
      {meaning && (
        <section>
          <h4 className="mb-1 text-sm font-semibold text-muted">{t("duas.meaning")}</h4>
          <p className="text-lg">{meaning}</p>
        </section>
      )}
      {dua.audioUrl && <AudioPlayer src={dua.audioUrl} />}
    </div>
  );
}

export function BookmarkButton({ duaKey }: { duaKey: string }) {
  const { t } = useTranslation();
  const on = useBookmarkStore((s) => s.keys.includes(duaKey));
  const toggle = useBookmarkStore((s) => s.toggle);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t("duas.unbookmark") : t("duas.bookmark")}
      title={on ? t("duas.unbookmark") : t("duas.bookmark")}
      onClick={() => void toggle(duaKey)}
      className={`inline-flex size-12 items-center justify-center rounded-full hover:bg-surface-2 ${on ? "text-accent" : "text-muted"}`}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3h12v18l-6-4-6 4z" />
      </svg>
    </button>
  );
}

export function DuaViewer({ dua, open, onClose }: { dua: Dua | null; open: boolean; onClose: () => void }) {
  const { i18n } = useTranslation();
  return (
    <BottomSheet open={open && !!dua} title={dua ? localized(dua.title, i18n.language)! : ""} onClose={onClose}>
      {dua && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <BookmarkButton duaKey={dua.key} />
          </div>
          <DuaText dua={dua} />
          <SourceLine source={dua.source} />
        </div>
      )}
    </BottomSheet>
  );
}

/** Inline dua block used on ritual screens. */
export function DuaCard({ dua, onOpen }: { dua: Dua; onOpen?: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <Card className="space-y-3" data-testid={`dua-${dua.key}`}>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-accent">{t(`duas.category.${dua.category}`)}</p>
          <h3 className="text-lg font-bold">
            {onOpen ? (
              <button type="button" onClick={onOpen} className="min-h-11 text-start hover:underline">
                {localized(dua.title, i18n.language)}
              </button>
            ) : (
              localized(dua.title, i18n.language)
            )}
          </h3>
        </div>
        <BookmarkButton duaKey={dua.key} />
      </div>
      {!onOpen && (
        <>
          <DuaText dua={dua} />
          <SourceLine source={dua.source} />
        </>
      )}
    </Card>
  );
}
