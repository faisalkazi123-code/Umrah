import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router";
import { APP_CONFIG } from "@/config/app";
import { Icon, type IconName } from "./Icon";
import { OfflineBanner } from "./OfflineBanner";
import { Toast } from "./Toast";

const NAV: { to: string; key: string; icon: IconName; end?: boolean }[] = [
  { to: "/", key: "home", icon: "home", end: true },
  { to: "/journey", key: "journey", icon: "journey" },
  { to: "/duas", key: "duas", icon: "book" },
  { to: "/checklist", key: "checklist", icon: "checklist" },
  { to: "/more", key: "more", icon: "more" },
];

export function BottomNavigation() {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("nav.main")} className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-5">
        {NAV.map((n) => (
          <li key={n.to}>
            <NavLink
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${isActive ? "text-primary" : "text-muted"}`
              }
            >
              <Icon name={n.icon} />
              {t(`nav.${n.key}`)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function DesktopSidebar() {
  const { t } = useTranslation();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-e border-line bg-surface p-5 md:block">
      <div className="mb-8 flex items-center gap-3">
        <img src={APP_CONFIG.logo} alt="" className="size-10" />
        <span className="text-lg font-bold text-primary">{APP_CONFIG.name}</span>
      </div>
      <nav aria-label={t("nav.main")}>
        <ul className="space-y-1">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex min-h-12 items-center gap-3 rounded-2xl px-4 font-medium ${isActive ? "bg-primary-soft text-primary" : "text-ink hover:bg-surface-2"}`
                }
              >
                <Icon name={n.icon} />
                {t(`nav.${n.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function TopBar({ title, back }: { title: string; back?: string | true }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 border-b border-line bg-bg/95 px-2 backdrop-blur md:px-6">
      {back ? (
        <button
          type="button"
          onClick={() => (back === true ? navigate(-1) : navigate(back))}
          aria-label={t("nav.back")}
          className="inline-flex size-12 items-center justify-center rounded-full text-primary hover:bg-primary-soft"
        >
          <Icon name="back" />
        </button>
      ) : (
        <span className="w-3" />
      )}
      <h1 className="flex-1 truncate text-xl font-bold">{title}</h1>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
      </div>
      <BottomNavigation />
      <Toast />
    </div>
  );
}

/** Standard page body: a single readable column. */
export function Page({ title, back, children }: { title: string; back?: string | true; children: ReactNode }) {
  return (
    <>
      <TopBar title={title} back={back} />
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 py-5">{children}</div>
    </>
  );
}
