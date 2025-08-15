"use server"

import { db } from "@/db/drizzle"
import { user, organizationUsers, account } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"


export interface CreateAdminUserParams {
  name: string
  email: string
  password: string
  organizationIds: string[]
  emailVerified?: boolean
}

export interface CreateAdminUserResponse {
  success: boolean
  data?: {
    id: string
    name: string
    email: string
  }
  error?: string
}

export async function createAdminUser(params: CreateAdminUserParams): Promise<CreateAdminUserResponse> {
  try {
    const { name, email, password, organizationIds, emailVerified = true } = params

    // Check if user is authenticated and has admin privileges
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return {
        success: false,
        error: "Unauthorized",
      }
    }

    // Use BetterAuth's signUpEmail API to create the user with proper password hashing
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: email.toLowerCase().trim(),
        password,
        name: name.trim(),
      },
    })

    if (!signUpResult.user) {
      return {
        success: false,
        error: "Failed to create user",
      }
    }

    const newUser = signUpResult.user

    // Update email verification status if needed
    if (emailVerified && !newUser.emailVerified) {
      await db
        .update(user)
        .set({
          emailVerified: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(user.id, newUser.id))
    }

    // Add user to organizations
    if (organizationIds.length > 0) {
      const organizationMemberships = organizationIds.map((orgId) => ({
        organizationId: orgId,
        userId: newUser.id,
        role: "user" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      await db.insert(organizationUsers).values(organizationMemberships)
    }

    console.log(`✅ User ${newUser.id} created by admin ${session.user.id}`)

    return {
      success: true,
      data: newUser,
    }
  } catch (error: unknown) {
    console.error("Error creating admin user:", error)
    
    // Handle specific BetterAuth errors
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
      return {
        success: false,
        error: "User with this email already exists",
      }
    }
    
    if (errorMessage.includes('Password too short')) {
      return {
        success: false,
        error: "Password must be at least 8 characters long",
      }
    }
    
    return {
      success: false,
      error: "Failed to create user",
    }
  }
}
