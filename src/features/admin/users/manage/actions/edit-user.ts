"use server"

import { db } from "@/db/drizzle"
import { user, organizationUsers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface EditUserParams {
  userId: string
  name?: string
  email?: string
  emailVerified?: boolean
  organizationIds?: string[]
}

export interface EditUserResponse {
  success: boolean
  data?: {
    id: string
    name: string
    email: string
    emailVerified: boolean
  }
  error?: string
}

export async function editUser(params: EditUserParams): Promise<EditUserResponse> {
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

    const { userId, name, email, emailVerified, organizationIds } = params

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email.toLowerCase().trim()))
        .limit(1)

      if (existingUser.length > 0 && existingUser[0].id !== userId) {
        return {
          success: false,
          error: "Email is already taken by another user",
        }
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<typeof user.$inferInsert> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email.toLowerCase().trim()
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified
    updateData.updatedAt = new Date()

    // Update user in database
    const [updatedUser] = await db.update(user).set(updateData).where(eq(user.id, userId)).returning({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    })

    if (!updatedUser) {
      return {
        success: false,
        error: "User not found",
      }
    }

    // Update organization memberships if provided
    if (organizationIds !== undefined) {
      // Remove user from all organizations first
      await db.delete(organizationUsers).where(eq(organizationUsers.userId, userId))

      // Add user to new organizations
      if (organizationIds.length > 0) {
        const organizationMemberships = organizationIds.map((orgId) => ({
          organizationId: orgId,
          userId: userId,
          role: "user" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))

        await db.insert(organizationUsers).values(organizationMemberships)
      }
    }

    console.log(`✅ User ${userId} updated by admin ${sessionData.user.id}`)

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error("Error editing user:", error)
    return {
      success: false,
      error: "Failed to update user",
    }
  }
}
