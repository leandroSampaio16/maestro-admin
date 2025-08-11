"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { organizations, organizationUsers, user } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { userHasAccessAndPermission } from "@/lib/better-auth/check-access";

export const getOrganizationMembers = async (organizationId: string) => {
  try {
    // Get current user session and check access
    const { hasAccess } = await userHasAccessAndPermission(organizationId);

    if (!hasAccess) {
      return {
        success: false,
        error: "You do not have access to perform this action on this organization",
      };
    }

    // Get all members of the organization
    const members = await db
      .select({
        id: organizationUsers.id,
        organizationId: organizationUsers.organizationId,
        userId: organizationUsers.userId,
        role: organizationUsers.role,
        joinedAt: organizationUsers.createdAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(organizationUsers)
      .innerJoin(user, eq(organizationUsers.userId, user.id))
      .where(eq(organizationUsers.organizationId, organizationId))
      .orderBy(organizationUsers.createdAt);

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("Failed to get organization members:", error);
    return {
      success: false,
      error: "Failed to fetch organization members",
    };
  }
};