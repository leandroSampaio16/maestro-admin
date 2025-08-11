"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizationInvites,
  organizationUsers,
  organizations,
  organizationAuditLog
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function cancelInvite(inviteId: string): Promise<{
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

    // Get the invite with organization information
    const [invite] = await db
      .select({
        id: organizationInvites.id,
        email: organizationInvites.email,
        organizationId: organizationInvites.organizationId,
        organizationName: organizations.name,
        status: organizationInvites.status,
      })
      .from(organizationInvites)
      .innerJoin(organizations, eq(organizationInvites.organizationId, organizations.id))
      .where(eq(organizationInvites.id, inviteId))
      .limit(1);

    if (!invite) {
      return {
        success: false,
        error: "Invite not found",
      };
    }

    // Prevent cancelling invites to admin organization
    if (invite.organizationId === adminOrgId) {
      return {
        success: false,
        error: "Cannot cancel invites to admin organization",
      };
    }

    if (invite.status === "accepted") {
      return {
        success: false,
        error: "Cannot cancel an accepted invite",
      };
    }

    if (invite.status === "expired") {
      // If already expired, just delete it
      await db
        .delete(organizationInvites)
        .where(eq(organizationInvites.id, inviteId));
    } else {
      // Mark as expired
      await db
        .update(organizationInvites)
        .set({ 
          status: "expired",
        })
        .where(eq(organizationInvites.id, inviteId));
    }

    // Log the admin action
    await db.insert(organizationAuditLog).values({
      organizationId: invite.organizationId,
      userId: session.user.id,
      action: "cancel_invite",
      details: {
        organizationName: invite.organizationName,
        inviteEmail: invite.email,
        previousStatus: invite.status,
        cancelledBy: session.user.email,
      },
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: { inviteId, status: "expired" },
    };
  } catch (error) {
    console.error("Error cancelling invite:", error);
    return {
      success: false,
      error: "Failed to cancel invite",
    };
  }
}
