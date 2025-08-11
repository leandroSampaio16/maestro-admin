"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizations, 
  organizationUsers, 
  organizationInvites,
  user 
} from "@/db/schema";
import { eq, count, and, gte, sql } from "drizzle-orm";
import { userHasAccessAndPermission } from "@/lib/better-auth/check-access";

export interface AdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  archivedOrganizations: number;
  totalMembers: number;
  totalInvites: number;
  pendingInvites: number;
  recentGrowth: {
    organizationsThisMonth: number;
    membersThisMonth: number;
    invitesThisMonth: number;
  };
  organizationsByStatus: {
    active: number;
    suspended: number;
    archived: number;
    pending_verification: number;
  };
  membersByRole: {
    owner: number;
    admin: number;
    user: number;
  };
}

export async function getAdminStats(): Promise<{
  success: boolean;
  data?: AdminStats;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Check if user has admin access (member of ADMIN_ORG)
    const adminOrgId = process.env.ADMIN_ORG;
    if (!adminOrgId) {
      return {
        success: false,
        error: "Admin organization not configured",
      };
    }

    const userOrgMembership = await db
      .select()
      .from(organizationUsers)
      .where(
        and(
          eq(organizationUsers.userId, session.user.id),
          eq(organizationUsers.organizationId, adminOrgId)
        )
      )
      .limit(1);

    if (userOrgMembership.length === 0) {
      return {
        success: false,
        error: "Access denied. Admin privileges required.",
      };
    }

    // Get current date for monthly calculations
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Get total organizations
    const [totalOrgsResult] = await db
      .select({ count: count() })
      .from(organizations);

    // Get organizations by status
    const organizationsByStatus = await db
      .select({
        status: organizations.status,
        count: count(),
      })
      .from(organizations)
      .groupBy(organizations.status);

    // Get total members
    const [totalMembersResult] = await db
      .select({ count: count() })
      .from(organizationUsers);

    // Get members by role
    const membersByRole = await db
      .select({
        role: organizationUsers.role,
        count: count(),
      })
      .from(organizationUsers)
      .groupBy(organizationUsers.role);

    // Get total invites
    const [totalInvitesResult] = await db
      .select({ count: count() })
      .from(organizationInvites);

    // Get pending invites
    const [pendingInvitesResult] = await db
      .select({ count: count() })
      .from(organizationInvites)
      .where(eq(organizationInvites.status, "pending"));

    // Get recent growth (this month)
    const [organizationsThisMonthResult] = await db
      .select({ count: count() })
      .from(organizations)
      .where(gte(organizations.createdAt, firstDayOfMonth.toISOString()));

    const [membersThisMonthResult] = await db
      .select({ count: count() })
      .from(organizationUsers)
      .where(gte(organizationUsers.createdAt, firstDayOfMonth.toISOString()));

    const [invitesThisMonthResult] = await db
      .select({ count: count() })
      .from(organizationInvites)
      .where(gte(organizationInvites.createdAt, firstDayOfMonth.toISOString()));

    // Process organization status counts
    const statusCounts = {
      active: 0,
      suspended: 0,
      archived: 0,
      pending_verification: 0,
    };

    organizationsByStatus.forEach((item) => {
      if (item.status && item.status in statusCounts) {
        statusCounts[item.status as keyof typeof statusCounts] = item.count;
      }
    });

    // Process member role counts
    const roleCounts = {
      owner: 0,
      admin: 0,
      user: 0,
    };

    membersByRole.forEach((item) => {
      if (item.role && item.role in roleCounts) {
        roleCounts[item.role as keyof typeof roleCounts] = item.count;
      }
    });

    const stats: AdminStats = {
      totalOrganizations: totalOrgsResult.count,
      activeOrganizations: statusCounts.active,
      suspendedOrganizations: statusCounts.suspended,
      archivedOrganizations: statusCounts.archived,
      totalMembers: totalMembersResult.count,
      totalInvites: totalInvitesResult.count,
      pendingInvites: pendingInvitesResult.count,
      recentGrowth: {
        organizationsThisMonth: organizationsThisMonthResult.count,
        membersThisMonth: membersThisMonthResult.count,
        invitesThisMonth: invitesThisMonthResult.count,
      },
      organizationsByStatus: statusCounts,
      membersByRole: roleCounts,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return {
      success: false,
      error: "Failed to fetch admin statistics",
    };
  }
}
