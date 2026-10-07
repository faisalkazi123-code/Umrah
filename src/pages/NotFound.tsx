import { useTranslation } from "react-i18next";
import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{t("common.notFound")}</h1>
      <ButtonLink to="/">{t("common.goHome")}</ButtonLink>
    </div>
  );
}
