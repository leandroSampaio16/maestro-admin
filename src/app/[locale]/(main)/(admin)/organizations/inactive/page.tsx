import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { InactiveOrganizationsList } from "@/features/admin/organizations/inactive/components/inactive-organizations-list";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Archive } from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });

  return {
    title: t("inactiveOrganizationsTitle"),
    description: t("inactiveOrganizationsDescription"),
  };
}

export default async function InactiveOrganizationsPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Archive className="h-8 w-8" />
            {t("inactiveOrganizationsTitle")}
          </h1>
          <p className="text-muted-foreground">{t("inactiveOrganizationsDescription")}</p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="card" count={4} />}>
        <InactiveOrganizationsList />
      </Suspense>
    </div>
  );
}
