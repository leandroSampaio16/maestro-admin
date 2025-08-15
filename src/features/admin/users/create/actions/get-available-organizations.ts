"use server"

import { db } from "@/db/drizzle"
import { organizations } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface AvailableOrganization {
  id: string
  name: string
  memberCount: number
  status: string
}

export interface GetAvailableOrganizationsResponse {
  success: boolean
  data?: AvailableOrganization[]
  error?: string
}

export async function getAvailableOrganizations(): Promise<GetAvailableOrganizationsResponse> {
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

    // Get all active organizations
    const activeOrganizations = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        status: organizations.status,
      })
      .from(organizations)
      .where(eq(organizations.status, "active"))

    // For now, return organizations without member count calculation
    // In a real implementation, you'd join with organizationUsers to get counts
    const organizationsWithCounts: AvailableOrganization[] = activeOrganizations.map((org) => ({
      id: org.id,
      name: org.name,
      memberCount: 0, // TODO: Calculate actual member count
      status: org.status,
    }))

    return {
      success: true,
      data: organizationsWithCounts,
    }
  } catch (error) {
    console.error("Error fetching available organizations:", error)
    return {
      success: false,
      error: "Failed to fetch organizations",
    }
  }
}
