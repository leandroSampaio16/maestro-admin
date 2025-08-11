"use server";

import { db } from "@/db/drizzle";
import { organizations, organizationUsers } from "@/db/schema/organizations";

interface CreateOrganizationForUserData {
  userId: string;
  userName: string;
}

export const createOrganizationForUser = async ({
  userId,
  userName,
}: CreateOrganizationForUserData) => {
  try {
    // Create the organization
    const [organization] = await db
      .insert(organizations)
      .values({
        name: `${userName}'s Organization`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (!organization) {
      throw new Error("Failed to create organization");
    }

    // Link the user to the organization
    const [organizationUser] = await db
      .insert(organizationUsers)
      .values({
        organizationId: organization.id,
        userId,
        role: "owner",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (!organizationUser) {
      // If linking fails, we should ideally clean up the organization
      console.error(
        `Organization created but user linking failed. Organization ID: ${organization.id}, User ID: ${userId}`,
      );
      throw new Error("Failed to link user to organization");
    }

    return {
      success: true,
      data: { organization, organizationUser },
    };
  } catch (error) {
    console.error("Failed to create organization for user:", error);
    throw error; // Re-throw so the database hook can catch and log it
  }
};
