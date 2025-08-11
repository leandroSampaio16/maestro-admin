"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizations, 
  organizationUsers,
  organizationAuditLog,
  user
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function transferOwnership(
  organizationId: string, 
  newOwnerEmail: string
): Promise<{
  success: boolean;
  data?: any;
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

    // Prevent transferring ownership of the admin organization itself
    if (organizationId === adminOrgId) {
      return {
        success: false,
        error: "Cannot transfer ownership of the admin organization",
      };
    }

    // Get the organization
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Find the new owner user by email
    const [newOwner] = await db
      .select()
      .from(user)
      .where(eq(user.email, newOwnerEmail))
      .limit(1);

    if (!newOwner) {
      return {
        success: false,
        error: "User with this email not found",
      };
    }

    // Check if the new owner is already a member of the organization
    const [existingMembership] = await db
      .select()
      .from(organizationUsers)
      .where(
        and(
          eq(organizationUsers.userId, newOwner.id),
          eq(organizationUsers.organizationId, organizationId)
        )
      )
      .limit(1);

    // If not a member, add them as owner
    if (!existingMembership) {
      await db.insert(organizationUsers).values({
        userId: newOwner.id,
        organizationId: organizationId,
        role: "owner",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update existing membership to owner role
      await db
        .update(organizationUsers)
        .set({
          role: "owner",
        })
        .where(
          and(
            eq(organizationUsers.userId, newOwner.id),
            eq(organizationUsers.organizationId, organizationId)
          )
        );
    }

    // If there was a previous owner, demote them to admin
    if (organization.ownerId && organization.ownerId !== newOwner.id) {
      await db
        .update(organizationUsers)
        .set({
          role: "admin",
        })
        .where(
          and(
            eq(organizationUsers.userId, organization.ownerId),
            eq(organizationUsers.organizationId, organizationId)
          )
        );
    }

    // Update the organization's ownerId
    const [updatedOrganization] = await db
      .update(organizations)
      .set({
        ownerId: newOwner.id,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    if (!updatedOrganization) {
      return {
        success: false,
        error: "Failed to transfer ownership",
      };
    }

    // Get previous owner email for audit log
    let previousOwnerEmail: string | undefined;
    if (organization.ownerId) {
      const [previousOwner] = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, organization.ownerId))
        .limit(1);
      previousOwnerEmail = previousOwner?.email;
    }

    // Log the admin action
    await db.insert(organizationAuditLog).values({
      organizationId: organizationId,
      userId: session.user.id,
      action: "transfer_ownership",
      details: {
        organizationName: organization.name,
        previousOwner: previousOwnerEmail || "None",
        newOwner: newOwnerEmail,
        transferredBy: session.user.email,
      },
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: updatedOrganization,
    };
  } catch (error) {
    console.error("Error transferring ownership:", error);
    return {
      success: false,
      error: "Failed to transfer ownership",
    };
  }
}
