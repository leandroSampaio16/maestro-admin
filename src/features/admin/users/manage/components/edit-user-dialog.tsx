"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Building2, AlertCircle, Loader2, Save } from "lucide-react"
import { editUser } from "@/features/admin/users/manage/actions/edit-user"
import {
  getAvailableOrganizations,
  type AvailableOrganization,
} from "@/features/admin/users/create/actions/get-available-organizations"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import MultipleSelector from "@/components/ui/multiple-selector"
import { createAdminOrganization } from "@/features/admin/organizations/create/actions/create-admin-organization"
import type { UserWithDetails } from "@/features/admin/users/manage/actions/get-all-users"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithDetails | null
  onUserUpdated: () => void
}

interface FormData {
  name: string
  email: string
  organizationIds: string[]
}

interface FormErrors {
  name?: string
  email?: string
  organizationIds?: string
}

export function EditUserDialog({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) {
  const t = useTranslations("Admin")
  const tCommon = useTranslations("Common")

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    organizationIds: [],
  })

  const [organizations, setOrganizations] = useState<AvailableOrganization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        organizationIds: user.organizations.map((org) => org.id),
      })
    }
  }, [user])

  // Load available organizations when dialog opens
  useEffect(() => {
    if (open) {
      const fetchOrganizations = async () => {
        setIsLoadingOrgs(true)
        try {
          const result = await getAvailableOrganizations()
          if (result.success && result.data) {
            setOrganizations(result.data)
          } else {
            toast.error(result.error || "Failed to load organizations")
          }
        } catch (error) {
          console.error("Error loading organizations:", error)
          toast.error("Failed to load organizations")
        } finally {
          setIsLoadingOrgs(false)
        }
      }

      fetchOrganizations()
    }
  }, [open])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t("nameRequired")
    } else if (formData.name.length < 2) {
      newErrors.name = t("nameMinLength")
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t("emailRequired")
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = t("emailInvalid")
    }

    // Organization validation
    if (formData.organizationIds.length === 0) {
      newErrors.organizationIds = t("atLeastOneOrganizationRequired")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await editUser({
        userId: user.id,
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        organizationIds: formData.organizationIds,
      })

      if (result.success) {
        toast.success(t("userUpdatedSuccess"))
        onUserUpdated()
        onOpenChange(false)
      } else {
        toast.error(result.error || t("userUpdatedError"))
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast.error(t("userUpdatedError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Organization selection handled via MultipleSelector

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("editUser")}
          </DialogTitle>
          <DialogDescription>{t("editUserDescription")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("basicInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  {t("fullName")} *
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-name"
                    type="text"
                    placeholder={t("fullNamePlaceholder")}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={cn("pl-10", errors.name && "border-destructive focus-visible:ring-destructive")}
                    disabled={isLoading}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="edit-email" className="text-sm font-medium">
                  {t("email")} *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={cn("pl-10", errors.email && "border-destructive focus-visible:ring-destructive")}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Email Verified Checkbox */}
              {/* Email Verified Checkbox removed for consistency */}
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {t("organizations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingOrgs ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              ) : organizations.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{t("noOrganizationsAvailable")}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t("selectOrganizationsDescription")}</p>
                  <div className="space-y-2">
                    <MultipleSelector
                      value={formData.organizationIds.map((id) => {
                        const org = organizations.find((o) => o.id === id)
                        return org ? { value: org.id, label: org.name } : { value: id, label: id }
                      })}
                      onChange={async (opts) => {
                        const CREATE_TOKEN = "__create_org__"
                        const hasCreate = opts.some((o) => o.value === CREATE_TOKEN)
                        if (hasCreate) {
                          // Keep any other selected ids and then create a new org
                          const keptIds = opts.filter((o) => o.value !== CREATE_TOKEN).map((o) => o.value)

                          if (!formData.email.trim()) {
                            toast.error(t("organizationCreationEmailMissing"))
                            return
                          }

                          try {
                            setIsLoadingOrgs(true)
                            const nameBase = formData.name.trim() || formData.email.split("@")[0]
                            const result = await createAdminOrganization({
                              name: `${nameBase}'s Organization`,
                              maxMembers: 10,
                              initialEmails: [formData.email.toLowerCase().trim()],
                            })

                            if (result.success && result.data?.organization) {
                              const newOrg = result.data.organization
                              setOrganizations((prev) => [...prev, newOrg])
                              handleInputChange("organizationIds", Array.from(new Set([...keptIds, newOrg.id])))
                              toast.success(t("organizationCreatedSuccess"))
                            } else {
                              toast.error(result.error || t("organizationCreatedError"))
                            }
                          } catch (e) {
                            console.error(e)
                            toast.error(t("organizationCreatedError"))
                          } finally {
                            setIsLoadingOrgs(false)
                          }
                        } else {
                          handleInputChange(
                            "organizationIds",
                            opts.map((o) => o.value),
                          )
                        }
                      }}
                      options={[
                        { value: "__create_org__", label: t("createMyOrganization") },
                        ...organizations.map((org) => ({ value: org.id, label: org.name })),
                      ]}
                      placeholder={t("selectOrganizationsPlaceholder")}
                      disabled={isLoading || isLoadingOrgs}
                    />
                  </div>
                  {errors.organizationIds && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.organizationIds}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingOrgs}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("updating")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
