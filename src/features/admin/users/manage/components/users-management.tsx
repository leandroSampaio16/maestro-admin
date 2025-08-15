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
  DropdownMenuSeparator,
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
  Users,
  MoreHorizontal,
  Archive,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  Mail,
  Building2,
  Activity,
  UserCheck,
  UserX,
  Edit,
  Key,
} from "lucide-react"
import { getAllUsers, type UserWithDetails } from "@/features/admin/users/manage/actions/get-all-users"
import { archiveUser } from "@/features/admin/users/manage/actions/archive-user"
import { EditUserDialog } from "./edit-user-dialog"
import { ResetPasswordDialog } from "./reset-password-dialog"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { pt, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"

interface ArchiveUserDialog {
  open: boolean
  user: UserWithDetails | null
}

interface EditUserDialogState {
  open: boolean
  user: UserWithDetails | null
}

interface ResetPasswordDialogState {
  open: boolean
  user: UserWithDetails | null
}

export function UsersManagement() {
  const t = useTranslations("Admin")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const dateLocale = locale === "pt" ? pt : enUS

  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "email" | "createdAt" | "lastLoginAt">("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [archiveDialog, setArchiveDialog] = useState<ArchiveUserDialog>({
    open: false,
    user: null,
  })

  const [editDialog, setEditDialog] = useState<EditUserDialogState>({
    open: false,
    user: null,
  })

  const [resetPasswordDialog, setResetPasswordDialog] = useState<ResetPasswordDialogState>({
    open: false,
    user: null,
  })

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getAllUsers({
          search: searchTerm,
          sortBy,
          sortOrder,
          limit: 50, // Show more users for admin
        })

        if (result.success && result.data) {
          setUsers(result.data.users)
          setFilteredUsers(result.data.users)
        } else {
          setError(result.error || "Failed to fetch users")
        }
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [searchTerm, sortBy, sortOrder])

  const handleArchive = async () => {
    if (!archiveDialog.user) return

    setActionLoading(archiveDialog.user.id)

    try {
      const result = await archiveUser(archiveDialog.user.id)
      if (result.success) {
        toast.success(t("userArchivedSuccess"))
        setUsers((prev) => prev.filter((u) => u.id !== archiveDialog.user!.id))
        setFilteredUsers((prev) => prev.filter((u) => u.id !== archiveDialog.user!.id))
        setArchiveDialog({ open: false, user: null })
      } else {
        toast.error(result.error || t("userArchivedError"))
      }
    } catch (error) {
      console.error("Error archiving user:", error)
      toast.error(t("userArchivedError"))
    } finally {
      setActionLoading(null)
    }
  }

  const handleUserUpdated = () => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers({
          search: searchTerm,
          sortBy,
          sortOrder,
          limit: 50,
        })

        if (result.success && result.data) {
          setUsers(result.data.users)
          setFilteredUsers(result.data.users)
        }
      } catch (err) {
        console.error("Error refreshing users:", err)
      }
    }

    fetchUsers()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (user: UserWithDetails) => {
    if (user.lastLoginAt) {
      const lastLogin = new Date(user.lastLoginAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      if (lastLogin > thirtyDaysAgo) {
        return (
          <Badge variant="secondary" className="bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground">
            <UserCheck className="h-3 w-3 mr-1" />
            {t("active")}
          </Badge>
        )
      }
    }

    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
        <UserX className="h-3 w-3 mr-1" />
        {t("inactive")}
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
                    placeholder={t("searchUsers")}
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

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("noUsersFound")}</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? t("noUsersMatchFilter") : t("noUsersYet")}
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
                          {getStatusBadge(user)}
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
                          <DropdownMenuItem onClick={() => setEditDialog({ open: true, user })}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("editUser")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setResetPasswordDialog({ open: true, user })}>
                            <Key className="h-4 w-4 mr-2" />
                            {t("resetPassword")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setArchiveDialog({ open: true, user })}
                            className="text-primary"
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            {t("archiveUser")}
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

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, user: editDialog.user })}
        user={editDialog.user}
        onUserUpdated={handleUserUpdated}
      />

      {/* Reset Password Dialog */}
      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onOpenChange={(open) => setResetPasswordDialog({ open, user: resetPasswordDialog.user })}
        user={resetPasswordDialog.user}
      />

      {/* Archive Confirmation Dialog */}
      <AlertDialog
        open={archiveDialog.open}
        onOpenChange={(open) => setArchiveDialog({ open, user: archiveDialog.user })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("archiveUserTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("archiveUserConfirm", { name: archiveDialog.user?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={actionLoading === archiveDialog.user?.id}
            >
              {actionLoading === archiveDialog.user?.id ? t("archiving") : t("archiveUser")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
