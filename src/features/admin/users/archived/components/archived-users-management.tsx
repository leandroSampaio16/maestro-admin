"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSkeleton } from "@/components/ui/loading-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Archive,
  MoreHorizontal,
  RotateCcw,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Mail,
  Building2,
  Activity,
  UserX,
} from "lucide-react"
import { getArchivedUsers, type ArchivedUserWithDetails } from "@/features/admin/users/archived/actions/get-archived-users"
import { restoreUser } from "@/features/admin/users/archived/actions/restore-user"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { pt, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"

interface RestoreUserDialog {
  open: boolean
  user: ArchivedUserWithDetails | null
}

export function ArchivedUsersManagement() {
  const t = useTranslations("Admin")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const dateLocale = locale === "pt" ? pt : enUS

  const [users, setUsers] = useState<ArchivedUserWithDetails[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ArchivedUserWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "lastLoginAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [restoreDialog, setRestoreDialog] = useState<RestoreUserDialog>({
    open: false,
    user: null,
  })

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getArchivedUsers({
          search: searchTerm,
          sortBy,
          sortOrder,
          limit: 50, // Show more users for admin
        })

        if (result.success && result.data) {
          setUsers(result.data.users)
          setFilteredUsers(result.data.users)
        } else {
          setError(result.error || "Failed to fetch archived users")
        }
      } catch (err) {
        console.error("Error fetching archived users:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [searchTerm, sortBy, sortOrder])

  const handleRestore = async () => {
    if (!restoreDialog.user) return

    setActionLoading(restoreDialog.user.id)

    try {
      const result = await restoreUser(restoreDialog.user.id)
      if (result.success) {
        toast.success(t("userRestoredSuccess"))
        setUsers((prev) => prev.filter((u) => u.id !== restoreDialog.user!.id))
        setFilteredUsers((prev) => prev.filter((u) => u.id !== restoreDialog.user!.id))
        setRestoreDialog({ open: false, user: null })
      } else {
        toast.error(result.error || t("userRestoredError"))
      }
    } catch (error) {
      console.error("Error restoring user:", error)
      toast.error(t("userRestoredError"))
    } finally {
      setActionLoading(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getArchivedBadge = () => {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <Archive className="h-3 w-3 mr-1" />
        {t("archived")}
      </Badge>
    )
  }

  if (isLoading) {
    return <LoadingSkeleton variant="card" count={4} />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t("filters")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("searchArchivedUsers")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t("name")}</SelectItem>
                  <SelectItem value="email">{t("email")}</SelectItem>
                  <SelectItem value="createdAt">{t("dateCreated")}</SelectItem>
                  <SelectItem value="lastLoginAt">{t("lastLogin")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{t("descending")}</SelectItem>
                  <SelectItem value="asc">{t("ascending")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Archived Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("noArchivedUsersFound")}</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? t("noArchivedUsersMatchFilter") : t("noArchivedUsersYet")}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id} className="w-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Left Section */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.image || undefined} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          {getArchivedBadge()}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            <span>
                              {user.organizationCount} {t("organizations")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            <span>
                              {user.sessionCount} {t("sessions")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {user.lastLoginAt
                                ? formatDistanceToNow(new Date(user.lastLoginAt), {
                                    addSuffix: true,
                                    locale: dateLocale,
                                  })
                                : t("neverLoggedIn")}
                            </span>
                          </div>
                        </div>
                        {user.organizations.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            {user.organizations.slice(0, 3).map((org) => (
                              <Badge key={org.id} variant="outline" className="text-xs">
                                {org.name} ({org.role})
                              </Badge>
                            ))}
                            {user.organizations.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.organizations.length - 3} {t("more")}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={actionLoading === user.id}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setRestoreDialog({ open: true, user })}
                            className="text-primary"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {t("restoreUser")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={restoreDialog.open}
        onOpenChange={(open) => setRestoreDialog({ open, user: restoreDialog.user })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("restoreUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("restoreUserConfirm", { name: restoreDialog.user?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={actionLoading === restoreDialog.user?.id}
            >
              {actionLoading === restoreDialog.user?.id ? t("restoring") : t("restoreUser")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
