import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CreateOrganizationForm } from "@/features/admin/organizations/create/components/create-organization-form";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });

  return {
    title: t("createOrganizationTitle"),
    description: t("createOrganizationDescription"),
  };
}

export default async function CreateOrganizationPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {t("createOrganizationTitle")}
          </h1>
          <p className="text-muted-foreground">{t("createOrganizationDescription")}</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t("organizationDetails")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoadingSkeleton variant="form" count={6} />}>
            <CreateOrganizationForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
