"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Lock, AlertCircle, Loader2, Building2, Eye, EyeOff } from "lucide-react"
import { createAdminUser } from "@/features/admin/users/create/actions/create-admin-user"
import {
  getAvailableOrganizations,
  type AvailableOrganization,
} from "@/features/admin/users/create/actions/get-available-organizations"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import MultipleSelector from "@/components/ui/multiple-selector"
import { createAdminOrganization } from "@/features/admin/organizations/create/actions/create-admin-organization"
import { createOrganizationForUser } from "@/features/auth/actions/create-organization-for-user"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  organizationIds: string[]
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  organizationIds?: string
}

export function CreateUserForm() {
  const t = useTranslations("Admin")
  const tCommon = useTranslations("Common")
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationIds: [],
  })

  const [organizations, setOrganizations] = useState<AvailableOrganization[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Load available organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
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
  }, [])

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

    // Password validation
    if (!formData.password) {
      newErrors.password = t("passwordRequired")
    } else if (formData.password.length < 8) {
      newErrors.password = t("passwordMinLength")
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("confirmPasswordRequired")
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatch")
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

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await createAdminUser({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        organizationIds: formData.organizationIds,
        emailVerified: false,
      })

      if (result.success) {
        toast.success(t("userCreatedSuccess"))
        // If no organizations were selected, automatically create one for the user
        if (formData.organizationIds.length === 0 && result.data?.id) {
          try {
            await createOrganizationForUser({
              userId: result.data.id,
              userName: formData.name.trim() || result.data.email.split("@")[0],
            })
            toast.success(t("organizationCreatedSuccess"))
          } catch (error) {
            console.error("Error creating organization for user:", error)
            toast.error(t("organizationCreatedError"))
          }
        }
        router.push("/users/manage")
      } else {
        toast.error(result.error || t("userCreatedError"))
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error(t("userCreatedError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleOrganizationToggle = (organizationId: string, checked: boolean) => {
    const newOrganizationIds = checked
      ? [...formData.organizationIds, organizationId]
      : formData.organizationIds.filter((id) => id !== organizationId)

    handleInputChange("organizationIds", newOrganizationIds)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("basicInformation")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              {t("fullName")} *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
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
            <Label htmlFor="email" className="text-sm font-medium">
              {t("email")} *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
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

          {/* Email Verified Checkbox removed */}
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("password")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              {t("password")} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={cn("pl-10 pr-10", errors.password && "border-destructive focus-visible:ring-destructive")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              {t("confirmPassword")} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPasswordPlaceholder")}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={cn(
                  "pl-10 pr-10",
                  errors.confirmPassword && "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
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

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={isLoading || isLoadingOrgs} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("creating")}
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              {t("createUser")}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
