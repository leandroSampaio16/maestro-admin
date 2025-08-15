import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import AdminUserDashboard from "@/features/admin/users/overview/components/admin-user-dashboard"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Admin" })

  return {
    title: t("userOverviewTitle"),
    description: t("userOverviewDescription"),
  }
}

export default async function AdminUserOverviewPage() {
  const t = await getTranslations("Admin")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("userOverviewTitle")}</h1>
          <p className="text-muted-foreground">{t("userOverviewDescription")}</p>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton variant="card" count={6} />}>
        <AdminUserDashboard />
      </Suspense>
    </div>
  )
}
