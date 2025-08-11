"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizationInvites,
  organizationUsers,
  organizations,
  user
} from "@/db/schema";
import { eq, and, desc, ne } from "drizzle-orm";

export interface AdminInvite {
  id: string;
  email: string;
  organizationId: string;
  organizationName: string;
  status: "pending" | "accepted" | "expired";
  invitedBy: string;
  inviterEmail: string;
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export async function getAllInvites(): Promise<{
  success: boolean;
  data?: AdminInvite[];
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

    // Get all invites with organization and inviter information
    const allInvites = await db
      .select({
        id: organizationInvites.id,
        email: organizationInvites.email,
        organizationId: organizationInvites.organizationId,
        organizationName: organizations.name,
        status: organizationInvites.status,
        invitedBy: organizationInvites.invitedBy,
        inviterEmail: user.email,
        createdAt: organizationInvites.createdAt,
        expiresAt: organizationInvites.expiresAt,
        acceptedAt: organizationInvites.acceptedAt,
      })
      .from(organizationInvites)
      .innerJoin(organizations, eq(organizationInvites.organizationId, organizations.id))
      .innerJoin(user, eq(organizationInvites.invitedBy, user.id))
      .where(ne(organizations.id, adminOrgId)) // Exclude admin organization invites
      .orderBy(desc(organizationInvites.createdAt));

    // Check for expired invites and update them
    const now = new Date();
    const expiredInvites = allInvites.filter(invite => 
      invite.status === "pending" && new Date(invite.expiresAt) < now
    );

    if (expiredInvites.length > 0) {
      // Update expired invites in database
      await Promise.all(
        expiredInvites.map(invite =>
          db
            .update(organizationInvites)
            .set({ status: "expired" })
            .where(eq(organizationInvites.id, invite.id))
        )
      );
    }

    // Return updated data with expired status
    const updatedInvites = allInvites.map(invite => ({
      ...invite,
      acceptedAt: invite.acceptedAt || undefined,
      status: (invite.status === "pending" && new Date(invite.expiresAt) < now 
        ? "expired" 
        : invite.status) as "pending" | "accepted" | "expired",
    }));

    return {
      success: true,
      data: updatedInvites,
    };
  } catch (error) {
    console.error("Error fetching all invites:", error);
    return {
      success: false,
      error: "Failed to fetch invites",
    };
  }
}
