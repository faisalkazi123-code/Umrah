import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Page } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmationDialog } from "@/components/Dialog";
import { FontSizeSelector, LanguageSwitcher, ThemeSwitcher } from "@/components/Settings";
import { APP_CONFIG } from "@/config/app";
import { subscribeSync, type SyncStatus } from "@/lib/sync";
import { useJourneyStore } from "@/store/journeyStore";
import { useToastStore } from "@/store/toastStore";

type OfflineState = "ready" | "pending" | "unsupported";

function useOfflineState(): OfflineState {
  const [state, setState] = useState<OfflineState>(() => ("serviceWorker" in navigator ? "pending" : "unsupported"));
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let alive = true;
    void navigator.serviceWorker.getRegistration().then((reg) => {
      if (alive && reg?.active) setState("ready");
    });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-3">
      <h2 className="font-bold">{title}</h2>
      {children}
    </Card>
  );
}

function ExternalOrPending({ label, url }: { label: string; url: string | null }) {
  const { t } = useTranslation();
  return url ? (
    <a href={url} className="font-semibold text-primary underline" target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  ) : (
    <p className="text-muted">{t("settings.notConfigured")}</p>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const resetJourney = useJourneyStore((s) => s.resetJourney);
  const show = useToastStore((s) => s.show);
  const [confirming, setConfirming] = useState(false);
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const offline = useOfflineState();
  useEffect(() => {
    const unsub = subscribeSync(setSync);
    return () => {
      unsub();
    };
  }, []);

  return (
    <Page title={t("settings.title")} back="/more">
      <Card className="space-y-6">
        <LanguageSwitcher />
        <FontSizeSelector />
        <ThemeSwitcher />
      </Card>
      <Section title={t("settings.audio")}>
        <p className="text-muted">{t("settings.audioNone")}</p>
      </Section>
      <Section title={t("settings.offline")}>
        <p className="text-muted" data-testid="offline-status">
          {t(offline === "ready" ? "settings.offlineReady" : offline === "pending" ? "settings.offlineNotReady" : "settings.offlineUnsupported")}
        </p>
      </Section>
      {sync && (
        <Section title={t("settings.sync")}>
          <p className="text-muted">{sync.pending > 0 ? t("settings.syncPending", { count: sync.pending }) : t("settings.syncIdle")}</p>
          {sync.lastError && <p className="text-sm text-danger">{t("settings.syncError")}</p>}
        </Section>
      )}
      <Section title={t("settings.reset")}>
        <p className="text-muted">{t("settings.resetBody")}</p>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          {t("settings.reset")}
        </Button>
      </Section>
      <Section title={t("settings.about")}>
        <p>
          {APP_CONFIG.name} · {t("settings.version", { version: APP_CONFIG.version })}
        </p>
      </Section>
      <Section title={t("settings.privacy")}>
        <p className="text-muted">{t("settings.privacyBody")}</p>
        {APP_CONFIG.privacyUrl && <ExternalOrPending label={t("settings.privacy")} url={APP_CONFIG.privacyUrl} />}
      </Section>
      <Section title={t("settings.terms")}>
        <ExternalOrPending label={t("settings.terms")} url={APP_CONFIG.termsUrl} />
      </Section>
      <ConfirmationDialog
        open={confirming}
        danger
        title={t("settings.resetTitle")}
        body={t("settings.resetBody")}
        confirmLabel={t("settings.resetConfirm")}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          resetJourney();
          show(t("settings.resetDone"));
        }}
      />
    </Page>
  );
}
