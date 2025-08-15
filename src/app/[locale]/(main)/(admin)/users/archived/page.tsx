import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Archive } from "lucide-react"
import { ArchivedUsersManagement } from "@/features/admin/users/archived/components/archived-users-management"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin")
  
  return {
    title: t("archivedUsers"),
    description: t("archivedUsersDescription"),
  }
}

export default async function ArchivedUsersPage() {
  const t = await getTranslations("Admin")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Archive className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("archivedUsers")}</h1>
          <p className="text-muted-foreground">{t("archivedUsersDescription")}</p>
        </div>
      </div>

      <ArchivedUsersManagement />
    </div>
  )
}
