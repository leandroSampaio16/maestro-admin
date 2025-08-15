"use server"

import { db } from "@/db/drizzle"
import { user, session, organizationUsers, organizations } from "@/db/schema"
import { desc, eq, sql, count, ilike, or, and } from "drizzle-orm"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"

export interface ArchivedUserWithDetails {
  id: string
  name: string
  email: string
  image: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  sessionCount: number
  organizationCount: number
  organizations: Array<{
    id: string
    name: string
    role: string
  }>
}

export interface GetArchivedUsersParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: "name" | "email" | "createdAt" | "lastLoginAt"
  sortOrder?: "asc" | "desc"
}

export interface GetArchivedUsersResponse {
  success: boolean
  data?: {
    users: ArchivedUserWithDetails[]
    totalCount: number
    totalPages: number
    currentPage: number
  }
  error?: string
}

export async function getArchivedUsers(params: GetArchivedUsersParams = {}): Promise<GetArchivedUsersResponse> {
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

    const { page = 1, limit = 20, search = "", sortBy = "createdAt", sortOrder = "desc" } = params

    const offset = (page - 1) * limit

    // Build search condition
    const searchCondition = search ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`)) : undefined

    // Only include archived users
    const baseCondition = eq(user.archived, true)
    const whereCondition = searchCondition ? and(baseCondition, searchCondition) : baseCondition

    // Get total count
    const [totalCountResult] = await db.select({ count: count() }).from(user).where(whereCondition)

    const totalCount = totalCountResult.count
    const totalPages = Math.ceil(totalCount / limit)

    // Build sort condition
    const sortColumn = {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: sql`MAX(${session.createdAt})`,
    }[sortBy]

    const orderDirection = sortOrder === "asc" ? "asc" : "desc"

    // Get archived users with their details
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: sql<string | null>`MAX(${session.createdAt})`,
        sessionCount: sql<number>`COUNT(DISTINCT ${session.id})`,
        organizationCount: sql<number>`COUNT(DISTINCT ${organizationUsers.organizationId})`,
      })
      .from(user)
      .leftJoin(session, eq(user.id, session.userId))
      .leftJoin(organizationUsers, eq(user.id, organizationUsers.userId))
      .where(whereCondition)
      .groupBy(user.id)
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : sortColumn)
      .limit(limit)
      .offset(offset)

    // Get organization details for each user
    const usersWithOrganizations: ArchivedUserWithDetails[] = await Promise.all(
      users.map(async (userData) => {
        const userOrganizations = await db
          .select({
            id: organizations.id,
            name: organizations.name,
            role: organizationUsers.role,
          })
          .from(organizationUsers)
          .innerJoin(organizations, eq(organizationUsers.organizationId, organizations.id))
          .where(eq(organizationUsers.userId, userData.id))

        return {
          ...userData,
          createdAt: userData.createdAt.toISOString(),
          updatedAt: userData.updatedAt.toISOString(),
          organizations: userOrganizations,
        }
      }),
    )

    return {
      success: true,
      data: {
        users: usersWithOrganizations,
        totalCount,
        totalPages,
        currentPage: page,
      },
    }
  } catch (error) {
    console.error("Error fetching archived users:", error)
    return {
      success: false,
      error: "Failed to fetch archived users",
    }
  }
}
