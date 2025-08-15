"use server"

import { db } from "@/db/drizzle"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface RestoreUserResponse {
  success: boolean
  error?: string
}

export async function restoreUser(userId: string): Promise<RestoreUserResponse> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionData?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Remove archived flag
    await db.update(user).set({ archived: false }).where(eq(user.id, userId))

    console.log(`✅ User ${userId} restored by admin ${sessionData.user.id}`)

    return { success: true }
  } catch (error) {
    console.error("Error restoring user:", error)
    return { success: false, error: "Failed to restore user" }
  }
}
