import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import AdminInviteManagement from "@/features/admin/organizations/invites/components/admin-invite-management";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });

  return {
    title: t("inviteMembersTitle"),
    description: t("inviteMembersDescription"),
  };
}

export default async function AdminInvitesPage() {
  const t = await getTranslations("Admin");

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("inviteMembersTitle")}</h1>
        <p className="text-muted-foreground">{t("inviteMembersDescription")}</p>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="card" count={3} />}>
        <AdminInviteManagement />
      </Suspense>
    </div>
  );
}
