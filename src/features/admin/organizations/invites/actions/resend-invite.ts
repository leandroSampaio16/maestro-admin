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
import crypto from "crypto";
import { Resend } from "resend";

export async function resendInvite(inviteId: string): Promise<{
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
        token: organizationInvites.token,
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

    // Prevent resending invites to admin organization
    if (invite.organizationId === adminOrgId) {
      return {
        success: false,
        error: "Cannot resend invites to admin organization",
      };
    }

    if (invite.status !== "pending") {
      return {
        success: false,
        error: "Can only resend pending invites",
      };
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, invite.email))
      .limit(1);

    const userExists = !!existingUser;

    // Generate new token and extend expiry
    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpiryDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days

    // Update the invite with new token and expiry
    await db
      .update(organizationInvites)
      .set({
        token: newToken,
        expiresAt: newExpiryDate.toISOString(),
        createdAt: new Date().toISOString(), // Update created date for "resent" tracking
      })
      .where(eq(organizationInvites.id, inviteId));

    // Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Create different invite URLs based on whether user exists
    const inviteUrl = userExists
      ? `${process.env.NEXT_PUBLIC_APP_URL}/en/invite/${newToken}?email=${encodeURIComponent(invite.email)}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/en/signup?invite=${newToken}`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
        to: invite.email,
        subject: `Invitation to join ${invite.organizationName} (Resent)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join ${invite.organizationName}</h2>
            <p>Hello,</p>
            <p>This is a reminder that you've been invited to join <strong>${invite.organizationName}</strong>.</p>
            <p>Click the link below to ${userExists ? 'accept the invitation' : 'create your account and join'}:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                ${userExists ? 'Accept Invitation' : 'Create Account & Join'}
              </a>
            </div>
            <p><strong>Note:</strong> This invitation will expire on ${newExpiryDate.toLocaleDateString()}.</p>
            <p>If you have any questions, please contact your organization administrator.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This invitation was resent by an administrator. If you didn't expect this email, you can safely ignore it.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending resend email:", emailError);
      return {
        success: false,
        error: "Failed to send invitation email",
      };
    }

    // Log the admin action
    await db.insert(organizationAuditLog).values({
      organizationId: invite.organizationId,
      userId: session.user.id,
      action: "resend_invite",
      details: {
        organizationName: invite.organizationName,
        inviteEmail: invite.email,
        userExists,
        resentBy: session.user.email,
        newExpiryDate: newExpiryDate.toISOString(),
      },
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      data: { 
        inviteId, 
        newToken,
        expiresAt: newExpiryDate.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error resending invite:", error);
    return {
      success: false,
      error: "Failed to resend invite",
    };
  }
}
