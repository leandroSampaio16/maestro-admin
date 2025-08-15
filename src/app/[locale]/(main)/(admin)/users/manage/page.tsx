import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { UsersManagement } from "@/features/admin/users/manage/components/users-management"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Users } from "lucide-react"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Admin" })

  return {
    title: t("manageUsersTitle"),
    description: t("manageUsersDescription"),
  }
}

export default async function ManageUsersPage() {
  const t = await getTranslations("Admin")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            {t("manageUsersTitle")}
          </h1>
          <p className="text-muted-foreground">{t("manageUsersDescription")}</p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="card" count={4} />}>
        <UsersManagement />
      </Suspense>
    </div>
  )
}
