"use server"

import { db } from "@/db/drizzle"
import { user, session } from "@/db/schema"
import { auth } from "@/lib/better-auth/auth"
import { headers } from "next/headers"
import { sql, gte } from "drizzle-orm"

export interface AdminUserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  totalSessions: number
}

export interface AdminUserStatsResponse {
  success: boolean
  data?: AdminUserStats
  error?: string
}

export async function getAdminUserStats(): Promise<AdminUserStatsResponse> {
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

    // Get total users count
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(user)

    const totalUsers = totalUsersResult[0]?.count || 0

    // Get active users (users who have logged in within the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeUsersResult = await db
      .select({ count: sql<number>`count(distinct ${user.id})` })
      .from(user)
      .leftJoin(session, sql`${session.userId} = ${user.id}`)
      .where(gte(session.createdAt, thirtyDaysAgo))

    const activeUsers = activeUsersResult[0]?.count || 0

    // Get new users this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(gte(user.createdAt, startOfMonth))

    const newUsersThisMonth = newUsersResult[0]?.count || 0

    // Get total sessions count
    const totalSessionsResult = await db.select({ count: sql<number>`count(*)` }).from(session)

    const totalSessions = totalSessionsResult[0]?.count || 0

    return {
      success: true,
      data: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        totalSessions,
      },
    }
  } catch (error) {
    console.error("Error fetching admin user stats:", error)
    return {
      success: false,
      error: "Failed to fetch user statistics",
    }
  }
}
