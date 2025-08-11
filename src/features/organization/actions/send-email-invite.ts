"use server";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { Resend } from "resend";

import { db } from "@/db/drizzle";
import {
	organizationInvites,
	organizationUsers,
	user as userTable,
} from "@/db/schema";
import { userHasAccessAndPermission } from "@/lib/better-auth/check-access";

export async function saveInviteToDB(
	organizationId: string,
	email: string,
	invitedBy: string,
	token: string,
) {
	const invite = await db.insert(organizationInvites).values({
		organizationId,
		email,
		invitedBy,
		token,
		status: "pending",
		createdAt: new Date().toISOString(),
		// 30 days from now (1000 ms * 60 sec * 60 min * 24 hr * 30 days)
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
	});

	return invite;
}

export async function sendEmailInvite(
	organizationId: string,
	email: string,
	invitedBy: string,
) {
	try {
		const { hasAccess, user } = await userHasAccessAndPermission(
			organizationId,
			"admin",
		);

		if (!hasAccess || !user) {
			return { error: "You do not have access to perform this action" };
		}

		// we need to check if the user is not already a member of the organization or has any pending invite from that org
		const isMember = await db
			.select()
			.from(organizationUsers)
			.innerJoin(userTable, eq(organizationUsers.userId, userTable.id))
			.where(
				and(
					eq(userTable.email, email),
					eq(organizationUsers.organizationId, organizationId),
				),
			);

		if (isMember.length > 0) {
			return {
				error: "The invited user is already a member of this organization",
			};
		}

		const pendingInvite = await db
			.select()
			.from(organizationInvites)
			.where(
				and(
					eq(organizationInvites.email, email),
					eq(organizationInvites.organizationId, organizationId),
				),
			);

		if (pendingInvite.length > 0) {
			return {
				error: "The invited user has a pending invite",
			};
		}

		// Check if user already exists
		const existingUser = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		const userExists = existingUser.length > 0;

		const token = crypto.randomBytes(32).toString("hex");
		await saveInviteToDB(organizationId, email, invitedBy, token);

		// Send different links based on whether user exists
		const inviteUrl = userExists
			? `${process.env.NEXT_PUBLIC_APP_URL}/en/invite/${token}?email=${encodeURIComponent(email)}`
			: `${process.env.NEXT_PUBLIC_APP_URL}/en/signup?invite=${token}`;

		const emailContent = userExists
			? `<p>You're invited to join an organization</p> <a href="${inviteUrl}">Accept Invite</a>`
			: `<p>You're invited to join an organization</p> <a href="${inviteUrl}">Sign Up and Accept Invite</a>`;

		const resend = new Resend(process.env.RESEND_API_KEY);
		const { data, error } = await resend.emails.send({
			from: "invites@maestro.com",
			to: email,
			subject: "You're invited to join an organization",
			html: emailContent,
			headers: {
				"X-Entity-Ref-ID": `${Date.now()}`,
			},
		});

		console.log(data);

		if (error) {
			console.error(error);
			return { error: error.message };
		}

		return { success: true };
	} catch (error) {
		console.error(error);
		return { error: "Failed to send email invite" };
	}
}
