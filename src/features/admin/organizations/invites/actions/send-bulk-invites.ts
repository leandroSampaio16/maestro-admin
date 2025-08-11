"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { 
  organizationInvites,
  organizationUsers,
  organizations,
  organizationAuditLog,
  user
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmailInvite } from "@/features/organization/actions/send-email-invite";

export interface BulkInviteRequest {
  organizationId: string;
  emails: string[];
  role: "admin" | "user";
  message?: string;
}

export interface BulkInviteResult {
  sent: number;
  failed: number;
  errors: string[];
  details: {
    email: string;
    success: boolean;
    error?: string;
  }[];
}

export async function sendBulkInvites(request: BulkInviteRequest): Promise<{
  success: boolean;
  data?: BulkInviteResult;
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

    // Validate target organization exists
    const [targetOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, request.organizationId))
      .limit(1);

    if (!targetOrg) {
      return {
        success: false,
        error: "Target organization not found",
      };
    }

    // Prevent inviting to admin organization
    if (request.organizationId === adminOrgId) {
      return {
        success: false,
        error: "Cannot send invites to admin organization",
      };
    }

    // Validate emails
    const validEmails = request.emails.filter(email => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

    if (validEmails.length === 0) {
      return {
        success: false,
        error: "No valid email addresses provided",
      };
    }

    const result: BulkInviteResult = {
      sent: 0,
      failed: 0,
      errors: [],
      details: [],
    };

    // Process each email
    for (const email of validEmails) {
      try {
        // Check if user is already a member
        const existingMember = await db
          .select()
          .from(organizationUsers)
          .innerJoin(user, eq(organizationUsers.userId, user.id))
          .where(
            and(
              eq(user.email, email),
              eq(organizationUsers.organizationId, request.organizationId)
            )
          )
          .limit(1);

        if (existingMember.length > 0) {
          result.failed++;
          result.errors.push(`${email}: User is already a member`);
          result.details.push({
            email,
            success: false,
            error: "User is already a member",
          });
          continue;
        }

        // Check if there's already a pending invite
        const existingInvite = await db
          .select()
          .from(organizationInvites)
          .where(
            and(
              eq(organizationInvites.email, email),
              eq(organizationInvites.organizationId, request.organizationId),
              eq(organizationInvites.status, "pending")
            )
          )
          .limit(1);

        if (existingInvite.length > 0) {
          result.failed++;
          result.errors.push(`${email}: Pending invite already exists`);
          result.details.push({
            email,
            success: false,
            error: "Pending invite already exists",
          });
          continue;
        }

        // Send the invite using existing function
        const inviteResult = await sendEmailInvite(
          request.organizationId,
          email,
          session.user.id
        );

        if (inviteResult.error) {
          result.failed++;
          result.errors.push(`${email}: ${inviteResult.error}`);
          result.details.push({
            email,
            success: false,
            error: inviteResult.error,
          });
        } else {
          result.sent++;
          result.details.push({
            email,
            success: true,
          });
        }
      } catch (error) {
        console.error(`Error sending invite to ${email}:`, error);
        result.failed++;
        result.errors.push(`${email}: Unexpected error occurred`);
        result.details.push({
          email,
          success: false,
          error: "Unexpected error occurred",
        });
      }
    }

    // Log the bulk invite action
    await db.insert(organizationAuditLog).values({
      organizationId: request.organizationId,
      userId: session.user.id,
      action: "bulk_invite_members",
      details: {
        organizationName: targetOrg.name,
        totalEmails: validEmails.length,
        sent: result.sent,
        failed: result.failed,
        role: request.role,
        customMessage: request.message || null,
        sentBy: session.user.email,
      },
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error sending bulk invites:", error);
    return {
      success: false,
      error: "Failed to send bulk invites",
    };
  }
}
