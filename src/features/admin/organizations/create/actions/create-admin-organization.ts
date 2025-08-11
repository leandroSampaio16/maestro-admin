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

export interface CreateAdminOrganizationData {
  name: string;
  maxMembers: number;
  initialEmails: string[];
}

export async function createAdminOrganization(data: CreateAdminOrganizationData): Promise<{
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

    // Validate initial emails
    if (!data.initialEmails || data.initialEmails.length === 0) {
      return {
        success: false,
        error: "At least one initial email is required",
      };
    }

    // Check if organization name already exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, data.name))
      .limit(1);

    if (existingOrg.length > 0) {
      return {
        success: false,
        error: "Organization name already exists",
      };
    }

    // Create the organization (owner will be set later via invites)
    const [newOrganization] = await db
      .insert(organizations)
      .values({
        name: data.name,
        maxMembers: data.maxMembers,
        status: "active",
        metadata: {
          initialEmails: data.initialEmails,
          createdBy: session.user.id,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    if (!newOrganization) {
      return {
        success: false,
        error: "Failed to create organization",
      };
    }

    // Note: Initial members will be added via invites in the next step
    // The first person to accept an invite will become the owner

    // Log the admin action
    await db.insert(organizationAuditLog).values({
      organizationId: newOrganization.id,
      userId: session.user.id,
      action: "create_organization",
      details: {
        organizationName: data.name,
        initialEmails: data.initialEmails,
        maxMembers: data.maxMembers,
        createdBy: session.user.email,
      },
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: {
        organization: newOrganization,
        initialEmails: data.initialEmails,
      },
    };
  } catch (error) {
    console.error("Error creating admin organization:", error);
    return {
      success: false,
      error: "Failed to create organization",
    };
  }
}
