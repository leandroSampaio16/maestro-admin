import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("Common");
  
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <h1 className="text-2xl font-bold">404</h1>
      <h2 className="mt-4 text-lg font-semibold">{t("notFound")}</h2>
      <p className="mt-2 text-muted-foreground">{t("notFoundDescription")}</p>
    </div>
  );
}
