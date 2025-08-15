"use server"

import { db } from "@/db/drizzle"
import { user, session, account, organizationUsers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface DeleteUserResponse {
  success: boolean
  error?: string
}

export async function deleteUser(userId: string): Promise<DeleteUserResponse> {
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

    // Prevent self-deletion
    if (sessionData.user.id === userId) {
      return {
        success: false,
        error: "Cannot delete your own account",
      }
    }

    // Delete user data in correct order (foreign key constraints)
    await db.delete(session).where(eq(session.userId, userId))
    await db.delete(account).where(eq(account.userId, userId))
    await db.delete(organizationUsers).where(eq(organizationUsers.userId, userId))
    await db.delete(user).where(eq(user.id, userId))

    console.log(`✅ User ${userId} deleted by admin ${sessionData.user.id}`)

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      success: false,
      error: "Failed to delete user",
    }
  }
}
