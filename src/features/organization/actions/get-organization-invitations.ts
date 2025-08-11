"use server";

import { db } from "@/db/drizzle";
import { organizationInvites, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { userHasAccessAndPermission } from "@/lib/better-auth/check-access";

export const getOrganizationInvitations = async (organizationId: string) => {
  try {
    // Get current user session and check access
    const { hasAccess } = await userHasAccessAndPermission(organizationId);

    if (!hasAccess) {
      return {
        success: false,
        error:
          "You do not have access to perform this action on this organization",
      };
    }

    // Get all pending invitations for the organization
    const invitations = await db
      .select({
        id: organizationInvites.id,
        token: organizationInvites.token,
        email: organizationInvites.email,
        organizationId: organizationInvites.organizationId,
        status: organizationInvites.status,
        expiresAt: organizationInvites.expiresAt,
        createdAt: organizationInvites.createdAt,
        acceptedAt: organizationInvites.acceptedAt,
        invitedBy: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(organizationInvites)
      .innerJoin(user, eq(organizationInvites.invitedBy, user.id))
      .where(eq(organizationInvites.organizationId, organizationId))
      .orderBy(organizationInvites.createdAt);

    return {
      success: true,
      data: invitations,
    };
  } catch (error) {
    console.error("Failed to get organization invitations:", error);
    return {
      success: false,
      error: "Failed to fetch organization invitations",
    };
  }
};
