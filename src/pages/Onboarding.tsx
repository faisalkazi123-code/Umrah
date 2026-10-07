import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/Settings";
import { APP_CONFIG } from "@/config/app";
import { useJourneyStore } from "@/store/journeyStore";
import { usePrefsStore } from "@/store/prefsStore";

/** Language → Welcome → Start Umrah. No registration. */
export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<"language" | "welcome">("language");
  const completeOnboarding = usePrefsStore((s) => s.completeOnboarding);
  const { journey, startJourney } = useJourneyStore();

  const finish = (start: boolean) => {
    completeOnboarding();
    if (start) {
      if (!journey) startJourney();
      navigate("/journey/ihram", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <img src={APP_CONFIG.logo} alt="" className="size-20" />
        <p className="text-2xl font-bold text-primary">{APP_CONFIG.name}</p>
        <p className="text-muted">{t("app.tagline")}</p>
      </div>
      {step === "language" ? (
        <div className="space-y-6">
          <h1 className="text-center text-xl font-bold">{t("onboarding.chooseLanguage")}</h1>
          <LanguageSwitcher />
          <Button onClick={() => setStep("welcome")}>{t("onboarding.continue")}</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-bold">{t("onboarding.welcomeTitle")}</h1>
            <p className="text-lg leading-relaxed">{t("onboarding.welcomeBody")}</p>
            <p className="text-sm text-muted">{t("onboarding.guestNote")}</p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => finish(true)}>{t("onboarding.startUmrah")}</Button>
            <Button variant="ghost" onClick={() => finish(false)}>
              {t("onboarding.continueGuest")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
