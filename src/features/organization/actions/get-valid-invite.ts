import { and, eq } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { organizationInvites, organizations } from "@/db/schema";

export async function findValidInvite(token: string, email: string) {
	const invite = await db
		.select({
			id: organizationInvites.id,
			token: organizationInvites.token,
			email: organizationInvites.email,
			organizationId: organizationInvites.organizationId,
			status: organizationInvites.status,
			expiresAt: organizationInvites.expiresAt,
			createdAt: organizationInvites.createdAt,
			organizationName: organizations.name,
		})
		.from(organizationInvites)
		.innerJoin(
			organizations,
			eq(organizationInvites.organizationId, organizations.id),
		)
		.where(
			and(
				eq(organizationInvites.token, token),
				eq(organizationInvites.email, email),
				eq(organizationInvites.status, "pending"),
			),
		)
		.limit(1);

	if (!invite.length) return null;

	const inviteData = invite[0];

	// Check if expired
	if (new Date(inviteData.expiresAt) < new Date()) {
		// Mark as expired
		await db
			.update(organizationInvites)
			.set({ status: "expired" })
			.where(eq(organizationInvites.id, inviteData.id));
		return null;
	}

	return inviteData;
}
