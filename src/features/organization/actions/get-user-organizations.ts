"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { organizations, organizationUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserOrganizations = async (userId?: string) => {
  try {
    if (!userId) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return {
          success: false,
          error: "User not authenticated",
        };
      }

      userId = session.user.id;
    }

    // Get all organizations user has access to
    const userOrganizations = await db
      .select({
        organization: organizations,
        organizationUser: organizationUsers,
      })
      .from(organizationUsers)
      .innerJoin(
        organizations,
        eq(organizationUsers.organizationId, organizations.id),
      )
      .where(eq(organizationUsers.userId, userId))
      .orderBy(organizations.name);

    return {
      success: true,
      data: userOrganizations,
    };
  } catch (error) {
    console.error("Failed to get user organizations:", error);
    return {
      success: false,
      error: "Failed to fetch organizations",
    };
  }
};
