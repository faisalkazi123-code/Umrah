import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { getDua, getInstructionsByGroup } from "@shared/content";
import { Page } from "@/components/AppShell";
import { Button, ButtonLink } from "@/components/Button";
import { DuaCard } from "@/components/Dua";
import { Icon } from "@/components/Icon";
import { GenderInstructionCards } from "@/components/InstructionCard";
import { useJourneyStore } from "@/store/journeyStore";
import { useToastStore } from "@/store/toastStore";

interface Props {
  ns: "niyyah" | "talbiyah";
  duaKey: string;
  flag: "niyyahDone" | "talbiyahDone";
  guidanceGroup?: string;
  back: string;
  next: string;
}

/** Niyyah and Talbiyah: show the text (when verified), then let the pilgrim mark it complete. */
function RecitationStep({ ns, duaKey, flag, guidanceGroup, back, next }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { journey, setFlag } = useJourneyStore();
  const show = useToastStore((s) => s.show);
  const dua = getDua(duaKey);
  const done = !!journey?.[flag];

  return (
    <Page title={t(`${ns}.title`)} back={back}>
      {dua && <DuaCard dua={dua} />}
      {guidanceGroup && <GenderInstructionCards items={getInstructionsByGroup(guidanceGroup)} />}
      {done ? (
        <div className="space-y-3">
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-primary-soft p-4 font-semibold text-primary" role="status">
            <Icon name="check" />
            {t(`${ns}.done`)}
          </p>
          <ButtonLink to={next}>{t(`${ns}.next`)}</ButtonLink>
        </div>
      ) : (
        <Button
          onClick={() => {
            const r = setFlag(flag, true);
            if (!r.ok) return show(r.error);
            navigate(next);
          }}
        >
          {t(`${ns}.markComplete`)}
        </Button>
      )}
    </Page>
  );
}

export function Niyyah() {
  return <RecitationStep ns="niyyah" duaKey="dua.niyyah" flag="niyyahDone" back="/journey/ihram" next="/journey/ihram/talbiyah" />;
}

export function Talbiyah() {
  return (
    <RecitationStep ns="talbiyah" duaKey="dua.talbiyah" flag="talbiyahDone" guidanceGroup="talbiyah" back="/journey/ihram/niyyah" next="/journey/haram" />
  );
}
