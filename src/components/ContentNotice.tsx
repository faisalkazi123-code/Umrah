import { useTranslation } from "react-i18next";
import type { ReviewStatus, Source } from "@shared/content/schema";
import { Icon } from "./Icon";

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  const { t } = useTranslation();
  if (status !== "needs_review") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent" title={t("content.needsReview")}>
      <Icon name="info" className="size-3.5" />
      {t("content.needsReview")}
    </span>
  );
}

export function AwaitingSource({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <p className="flex gap-2 rounded-2xl bg-surface-2 p-3 text-sm text-muted">
      <Icon name="info" className="size-5 text-accent" />
      <span>{message ?? t("content.awaitingSource")}</span>
    </p>
  );
}

export function SourceLine({ source }: { source: Source }) {
  const { t } = useTranslation();
  return (
    <p className="text-xs text-muted">
      {source.sourcePage
        ? t("content.sourcePage", { doc: source.sourceDocument, page: source.sourcePage })
        : t("content.source", { doc: source.sourceDocument })}
    </p>
  );
}
