import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

export function useOnline() {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}

export function OfflineBanner() {
  const { t } = useTranslation();
  if (useOnline()) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-accent-soft px-4 py-2 text-sm text-ink">
      <Icon name="offline" className="size-5 text-accent" />
      {t("common.offline")}
    </div>
  );
}
