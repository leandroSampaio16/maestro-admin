import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import AdminDashboard from "@/features/admin/organizations/overview/components/admin-dashboard";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });

  return {
    title: t("overviewTitle"),
    description: t("overviewDescription"),
  };
}

export default async function AdminOverviewPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("overviewTitle")}</h1>
          <p className="text-muted-foreground">{t("overviewDescription")}</p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="card" count={6} />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
}
