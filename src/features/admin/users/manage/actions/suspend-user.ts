"use server"

import { db } from "@/db/drizzle"
import { session } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface SuspendUserResponse {
  success: boolean
  error?: string
}

export async function suspendUser(userId: string): Promise<SuspendUserResponse> {
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

    // Prevent self-suspension
    if (sessionData.user.id === userId) {
      return {
        success: false,
        error: "Cannot suspend your own account",
      }
    }

    // Delete all user sessions to effectively suspend them
    await db.delete(session).where(eq(session.userId, userId))

    console.log(`✅ User ${userId} suspended by admin ${sessionData.user.id}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error suspending user:", error)
    return {
      success: false,
      error: "Failed to suspend user",
    }
  }
}
