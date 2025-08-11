"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { organizations, organizationUsers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const switchOrganization = async (organizationId: string) => {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Validate that user has access to this organization
    const userOrgAccess = await db
      .select({
        organization: organizations,
        organizationUser: organizationUsers,
      })
      .from(organizationUsers)
      .innerJoin(
        organizations,
        eq(organizationUsers.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationUsers.userId, session.user.id),
          eq(organizations.id, organizationId),
        ),
      )
      .limit(1);

    if (userOrgAccess.length === 0) {
      return {
        success: false,
        error: "User does not have access to this organization",
      };
    }

    return {
      success: true,
      data: {
        organization: userOrgAccess[0].organization,
        organizationUser: userOrgAccess[0].organizationUser,
      },
    };
  } catch (error) {
    console.error("Failed to switch organization:", error);
    return {
      success: false,
      error: "Failed to switch organization",
    };
  }
};
