"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizations, 
  organizationUsers,
  organizationAuditLog 
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function suspendOrganization(organizationId: string): Promise<{
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

    // Prevent suspending the admin organization itself
    if (organizationId === adminOrgId) {
      return {
        success: false,
        error: "Cannot suspend the admin organization",
      };
    }

    // Get the organization to check its current status
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

    if (organization.status === "suspended") {
      return {
        success: false,
        error: "Organization is already suspended",
      };
    }

    if (organization.status === "archived") {
      return {
        success: false,
        error: "Cannot suspend an archived organization",
      };
    }

    // Suspend the organization
    const [updatedOrganization] = await db
      .update(organizations)
      .set({
        status: "suspended",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    if (!updatedOrganization) {
      return {
        success: false,
        error: "Failed to suspend organization",
      };
    }

    // Log the admin action
    await db.insert(organizationAuditLog).values({
      organizationId: organizationId,
      userId: session.user.id,
      action: "suspend_organization",
      details: {
        organizationName: organization.name,
        previousStatus: organization.status,
        newStatus: "suspended",
        suspendedBy: session.user.email,
        reason: "Administrative action",
      },
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: updatedOrganization,
    };
  } catch (error) {
    console.error("Error suspending organization:", error);
    return {
      success: false,
      error: "Failed to suspend organization",
    };
  }
}
