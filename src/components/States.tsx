import { useTranslation } from "react-i18next";
import { useRouteError } from "react-router";
import { ButtonLink } from "./Button";
import { Icon } from "./Icon";

export function LoadingSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-8" aria-busy="true" aria-label={t("common.loading")}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-3xl bg-surface-2" />
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center text-muted">
      <Icon name="search" className="size-10" />
      <p>{message}</p>
    </div>
  );
}

export function ErrorState() {
  const { t } = useTranslation();
  const error = useRouteError();
  if (error) console.error(error);
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
      <p className="text-xl font-bold">{t("common.error")}</p>
      <button type="button" className="min-h-12 font-semibold text-primary underline" onClick={() => window.location.reload()}>
        {t("common.retry")}
      </button>
      <ButtonLink to="/" variant="secondary">
        {t("common.goHome")}
      </ButtonLink>
    </div>
  );
}
