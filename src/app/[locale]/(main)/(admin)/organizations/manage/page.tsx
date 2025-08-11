import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { OrganizationsManagement } from "@/features/admin/organizations/manage/components/organizations-management";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Settings } from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });

  return {
    title: t("manageOrganizationsTitle"),
    description: t("manageOrganizationsDescription"),
  };
}

export default async function ManageOrganizationsPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            {t("manageOrganizationsTitle")}
          </h1>
          <p className="text-muted-foreground">{t("manageOrganizationsDescription")}</p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="card" count={4} />}>
        <OrganizationsManagement />
      </Suspense>
    </div>
  );
}
