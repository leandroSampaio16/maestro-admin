"use server";

import { db } from "@/db/drizzle";
import { organizations, organizationUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserOrganization = async (userId: string) => {
  try {
    const result = await db
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
      .limit(1);

    if (result.length === 0) {
      return {
        success: false,
        error: "No organization found for user",
      };
    }

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    console.error("Failed to get user organization:", error);
    return {
      success: false,
      error: "Failed to fetch organization",
    };
  }
};
