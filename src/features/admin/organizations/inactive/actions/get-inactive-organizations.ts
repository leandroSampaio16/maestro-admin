"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizations, 
  organizationUsers 
} from "@/db/schema";
import { eq, and, inArray, count } from "drizzle-orm";

export interface InactiveOrganization {
  id: string;
  name: string;
  description?: string;
  status: "suspended" | "archived";
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
}

export async function getInactiveOrganizations(): Promise<{
  success: boolean;
  data?: InactiveOrganization[];
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

    // Get all inactive organizations (suspended or archived)
    const inactiveOrgs = await db
      .select()
      .from(organizations)
      .where(inArray(organizations.status, ["suspended", "archived"]))
      .orderBy(organizations.updatedAt);

    // Get member counts for each organization
    const organizationsWithMemberCount = await Promise.all(
      inactiveOrgs.map(async (org) => {
        const [memberCountResult] = await db
          .select({ count: count() })
          .from(organizationUsers)
          .where(eq(organizationUsers.organizationId, org.id));

        return {
          id: org.id,
          name: org.name,
          description: org.description || undefined,
          status: org.status as "suspended" | "archived",
          memberCount: memberCountResult.count,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          ownerId: org.ownerId || undefined,
        };
      })
    );

    return {
      success: true,
      data: organizationsWithMemberCount,
    };
  } catch (error) {
    console.error("Error fetching inactive organizations:", error);
    return {
      success: false,
      error: "Failed to fetch inactive organizations",
    };
  }
}
