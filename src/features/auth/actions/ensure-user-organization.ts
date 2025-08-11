"use server";

import { createOrganizationForUser } from "./create-organization-for-user";
import { getUserOrganization } from "./get-user-organization";

interface EnsureUserOrganizationData {
  userId: string;
  userName: string;
}

export const ensureUserOrganization = async ({
  userId,
  userName,
}: EnsureUserOrganizationData) => {
  try {
    // First, check if user already has an organization
    const existingOrg = await getUserOrganization(userId);

    if (existingOrg.success) {
      return existingOrg; // User already has an organization
    }

    // User doesn't have an organization, create one
    console.log(`Creating organization for user ${userId} (${userName})`);

    const orgResult = await createOrganizationForUser({
      userId,
      userName,
    });

    if (!orgResult.success || !orgResult.data) {
      return {
        success: false,
        error: "Failed to create organization for user",
      };
    }

    // Return the newly created organization in the same format as getUserOrganization
    return {
      success: true,
      data: {
        organization: orgResult.data.organization,
        organizationUser: orgResult.data.organizationUser,
      },
    };
  } catch (error) {
    console.error("Failed to ensure user organization:", error);
    return {
      success: false,
      error: "Failed to ensure user has organization",
    };
  }
};
