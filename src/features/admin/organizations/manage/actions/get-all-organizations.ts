"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizations, 
  organizationUsers,
  user
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export interface AdminOrganization {
  id: string;
  name: string;
  description?: string;
  status: "active" | "suspended" | "archived" | "pending_verification";
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  ownerEmail?: string;
}

export async function getAllOrganizations(): Promise<{
  success: boolean;
  data?: AdminOrganization[];
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

    // Get all organizations except the admin organization
    const allOrgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, adminOrgId))
      .then(adminOrg => 
        db.select()
          .from(organizations)
          .orderBy(organizations.createdAt)
      );

    // Filter out admin organization
    const filteredOrgs = allOrgs.filter(org => org.id !== adminOrgId);

    // Get member counts and owner info for each organization
    const organizationsWithDetails = await Promise.all(
      filteredOrgs.map(async (org) => {
        // Get member count
        const [memberCountResult] = await db
          .select({ count: count() })
          .from(organizationUsers)
          .where(eq(organizationUsers.organizationId, org.id));

        // Get owner info if ownerId exists
        let ownerEmail: string | undefined;
        if (org.ownerId) {
          const [owner] = await db
            .select({ email: user.email })
            .from(user)
            .where(eq(user.id, org.ownerId))
            .limit(1);
          ownerEmail = owner?.email;
        }

        return {
          id: org.id,
          name: org.name,
          description: org.description || undefined,
          status: org.status as "active" | "suspended" | "archived" | "pending_verification",
          memberCount: memberCountResult.count,
          createdAt: org.createdAt,
          updatedAt: org.updatedAt,
          ownerId: org.ownerId || undefined,
          ownerEmail,
        };
      })
    );

    return {
      success: true,
      data: organizationsWithDetails,
    };
  } catch (error) {
    console.error("Error fetching all organizations:", error);
    return {
      success: false,
      error: "Failed to fetch organizations",
    };
  }
}
