"use server";

import { db } from "@/db/drizzle";
import {
	organizationInvites,
	organizationUsers,
	user as userTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function acceptInviteForExistingUser(
	token: string,
	email: string,
) {
	try {
		// Find the invite
		const invite = await db
			.select()
			.from(organizationInvites)
			.where(
				and(
					eq(organizationInvites.token, token),
					eq(organizationInvites.email, email),
					eq(organizationInvites.status, "pending"),
				),
			)
			.limit(1);

		if (!invite.length) {
			return { error: "Invalid or expired invite" };
		}

		const inviteData = invite[0];

		// Check if expired
		if (new Date(inviteData.expiresAt) < new Date()) {
			// Mark as expired
			await db
				.update(organizationInvites)
				.set({ status: "expired" })
				.where(eq(organizationInvites.id, inviteData.id));
			return { error: "Invite has expired" };
		}

		// Find the user by email
		const existingUser = await db
			.select()
			.from(userTable)
			.where(eq(userTable.email, email))
			.limit(1);

		if (!existingUser.length) {
			return { error: "User not found. Please sign up first." };
		}

		const user = existingUser[0];

		// Check if user is already a member
		const isMember = await db
			.select()
			.from(organizationUsers)
			.where(
				and(
					eq(organizationUsers.userId, user.id),
					eq(organizationUsers.organizationId, inviteData.organizationId),
				),
			);

		if (isMember.length > 0) {
			return { error: "You are already a member of this organization" };
		}

		// Mark invite as accepted
		await db
			.update(organizationInvites)
			.set({
				status: "accepted",
				acceptedAt: new Date().toISOString(),
			})
			.where(eq(organizationInvites.id, inviteData.id));

		// Add user to organization
		await db.insert(organizationUsers).values({
			userId: user.id,
			organizationId: inviteData.organizationId,
			role: "member",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		return { success: true };
	} catch (error) {
		console.error("Error accepting invite:", error);
		return { error: "Failed to accept invite. Please try again." };
	}
}
