import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { CreateUserForm } from "@/features/admin/users/create/components/create-user-form"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { UserPlus } from "lucide-react"

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: "Admin" })

  return {
    title: t("createUserTitle"),
    description: t("createUserDescription"),
  }
}

export default async function CreateUserPage() {
  const t = await getTranslations("Admin")

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserPlus className="h-8 w-8" />
            {t("createUserTitle")}
          </h1>
          <p className="text-muted-foreground">{t("createUserDescription")}</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Suspense fallback={<LoadingSkeleton variant="form" count={8} />}>
          <CreateUserForm />
        </Suspense>
      </div>
    </div>
  )
}
