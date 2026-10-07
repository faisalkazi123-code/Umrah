import { useTranslation } from "react-i18next";
import { hasInstructionBody, type Instruction } from "@shared/content/schema";
import { localized } from "@/i18n";
import { Card } from "./Card";
import { AwaitingSource, ReviewBadge, SourceLine } from "./ContentNotice";

export function InstructionCard({ item, highlight = false }: { item: Instruction; highlight?: boolean }) {
  const { t, i18n } = useTranslation();
  const body = hasInstructionBody(item) ? localized(item.body, i18n.language) : null;
  return (
    <Card className={`space-y-3 ${highlight ? "border-2 border-accent" : ""}`} data-testid={`instruction-${item.key}`}>
      <div className="flex flex-wrap items-center gap-2">
        {item.audience !== "all" && (
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.audience === "men" ? "bg-primary-soft text-primary" : "bg-accent-soft text-accent"}`}>
            {t(`audience.${item.audience}`)}
          </span>
        )}
        <ReviewBadge status={item.reviewStatus} />
      </div>
      <h3 className="text-lg font-bold">{localized(item.title, i18n.language)}</h3>
      {body ? <p className="whitespace-pre-line leading-relaxed">{body}</p> : <AwaitingSource />}
      <SourceLine source={item.source} />
    </Card>
  );
}

/** Men's and women's guidance shown side by side (stacked on phones), never merged. */
export function GenderInstructionCards({ items }: { items: Instruction[] }) {
  const ordered = [...items].sort((a, b) => ["men", "women", "all"].indexOf(a.audience) - ["men", "women", "all"].indexOf(b.audience));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ordered.map((i) => (
        <InstructionCard key={i.key} item={i} />
      ))}
    </div>
  );
}
