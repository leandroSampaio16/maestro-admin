"use client"

import type React from "react"

import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import { resetUserPassword } from "@/features/admin/users/manage/actions/reset-user-password"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { UserWithDetails } from "@/features/admin/users/manage/actions/get-all-users"

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserWithDetails | null
}

interface FormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export function ResetPasswordDialog({ open, onOpenChange, user }: ResetPasswordDialogProps) {
  const t = useTranslations("Admin")
  const tCommon = useTranslations("Common")

  const [formData, setFormData] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = t("currentPasswordRequired")
    }

    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = t("passwordRequired")
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t("passwordMinLength")
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("confirmPasswordRequired")
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("passwordsDoNotMatch")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const result = await resetUserPassword({
        userId: user.id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      if (result.success) {
        toast.success(t("passwordResetSuccess"))
        onOpenChange(false)
        // Reset form
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setErrors({})
      } else {
        toast.error(result.error || t("passwordResetError"))
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      toast.error(t("passwordResetError"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t("resetPassword")}
          </DialogTitle>
          <DialogDescription>{t("resetPasswordDescription", { name: user?.name || user?.email || "User" })}</DialogDescription>
        </DialogHeader>

        <Alert className="bg-primary/10 border-primary/20 dark:bg-primary/10 dark:border-primary/20">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            {t("resetPasswordWarning")}
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="reset-currentPassword" className="text-sm font-medium">
              {t("currentPassword")} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-currentPassword"
                type={showPasswords.current ? "text" : "password"}
                placeholder={t("currentPasswordPlaceholder")}
                value={formData.currentPassword}
                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                className={cn(
                  "pl-10 pr-10",
                  errors.currentPassword && "border-destructive focus-visible:ring-destructive",
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => togglePasswordVisibility("current")}
                disabled={isLoading}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="reset-newPassword" className="text-sm font-medium">
              {t("newPassword")} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-newPassword"
                type={showPasswords.new ? "text" : "password"}
                placeholder={t("newPasswordPlaceholder")}
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className={cn("pl-10 pr-10", errors.newPassword && "border-destructive focus-visible:ring-destructive")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={() => togglePasswordVisibility("new")}
                disabled={isLoading}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="reset-confirmPassword" className="text-sm font-medium">
              {t("confirmPassword")} *
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="reset-confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
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
                onClick={() => togglePasswordVisibility("confirm")}
                disabled={isLoading}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} variant="default">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("resetting")}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {t("resetPassword")}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
