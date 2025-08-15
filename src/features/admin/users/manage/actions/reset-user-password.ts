"use server"

import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface ResetUserPasswordParams {
  userId: string
  currentPassword: string
  newPassword: string
}

export interface ResetUserPasswordResponse {
  success: boolean
  error?: string
}

export async function resetUserPassword(params: ResetUserPasswordParams): Promise<ResetUserPasswordResponse> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionData?.user?.id) {
      return {
        success: false,
        error: "Not authenticated",
      }
    }

    const { userId, currentPassword, newPassword } = params

    try {
      await auth.api.changePassword({
        body: {
          currentPassword,
          newPassword,
        },
        headers: await headers(),
        query: {
          userId, // Admin override to change another user's password
        },
      })
    } catch (error: any) {
      console.error("Error resetting user password:", error)
      return {
        success: false,
        error: error?.message || "Failed to reset password",
      }
    }

    console.log(`✅ Password reset for user ${userId} by admin ${sessionData.user.id}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error resetting user password:", error)
    return {
      success: false,
      error: "Failed to reset password",
    }
  }
}
