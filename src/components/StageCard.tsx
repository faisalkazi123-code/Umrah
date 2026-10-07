import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { StageKey, StageStatus } from "@shared/domain/journey/journeyTypes";
import { Icon } from "./Icon";

export function StatusPill({ status }: { status: StageStatus }) {
  const { t } = useTranslation();
  const cls =
    status === "COMPLETED" ? "bg-primary text-primary-ink" : status === "IN_PROGRESS" ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted";
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{t(`status.${status}`)}</span>;
}

export function StageCard({ n, stage, status, to, current }: { n: number; stage: StageKey; status: StageStatus; to: string; current: boolean }) {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      data-testid={`stage-${stage}`}
      aria-current={current ? "step" : undefined}
      className={`flex min-h-20 items-center gap-4 rounded-3xl border bg-surface p-4 shadow-sm hover:bg-surface-2 ${current ? "border-2 border-primary" : "border-line"}`}
    >
      <span
        className={`flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
          status === "COMPLETED" ? "bg-primary text-primary-ink" : "bg-primary-soft text-primary"
        }`}
      >
        {status === "COMPLETED" ? <Icon name="check" /> : String(n).padStart(2, "0")}
      </span>
      <span className="flex-1">
        <span className="block text-lg font-bold">{t(`stage.${stage}`)}</span>
        <span className="mt-1 inline-block">
          <StatusPill status={status} />
        </span>
      </span>
      <Icon name="chevron" className="size-6 text-muted" />
    </Link>
  );
}
