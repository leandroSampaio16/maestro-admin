"use server"

import { db } from "@/db/drizzle"
import { session, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface ArchiveUserResponse {
  success: boolean
  error?: string
}

export async function archiveUser(userId: string): Promise<ArchiveUserResponse> {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    })

    if (!sessionData?.user?.id) {
      return { success: false, error: "Not authenticated" }
    }

    // Prevent self-archive
    if (sessionData.user.id === userId) {
      return { success: false, error: "Cannot archive your own account" }
    }

    // Set archived flag
    await db.update(user).set({ archived: true }).where(eq(user.id, userId))

    // Delete all sessions for the archived user
    await db.delete(session).where(eq(session.userId, userId))

    console.log(`✅ User ${userId} archived by admin ${sessionData.user.id}`)

    return { success: true }
  } catch (error) {
    console.error("Error archiving user:", error)
    return { success: false, error: "Failed to archive user" }
  }
}
