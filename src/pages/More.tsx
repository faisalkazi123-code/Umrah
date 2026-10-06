import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Page } from "@/components/AppShell";
import { Icon, type IconName } from "@/components/Icon";

export function LinkList({ links }: { links: { to: string; label: string; icon: IconName }[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
      {links.map((l) => (
        <li key={l.to}>
          <Link to={l.to} className="flex min-h-16 items-center gap-4 px-5 hover:bg-surface-2">
            <Icon name={l.icon} className="size-6 text-primary" />
            <span className="flex-1 text-lg">{l.label}</span>
            <Icon name="chevron" className="size-5 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export const guideLinks = (t: (k: string) => string) => [
  { to: "/guide/reminders", label: t("guide.reminders"), icon: "checklist" as const },
  { to: "/guide/madinah", label: t("guide.madinah"), icon: "info" as const },
  { to: "/guide/hajj-types", label: t("guide.hajjTypes"), icon: "info" as const },
  { to: "/guide/footnotes", label: t("guide.footnotes"), icon: "book" as const },
];

export default function More() {
  const { t } = useTranslation();
  return (
    <Page title={t("more.title")}>
      <h2 className="text-lg font-bold">{t("more.guide")}</h2>
      <LinkList links={guideLinks(t)} />
      <LinkList links={[{ to: "/settings", label: t("more.settings"), icon: "settings" }]} />
    </Page>
  );
}
