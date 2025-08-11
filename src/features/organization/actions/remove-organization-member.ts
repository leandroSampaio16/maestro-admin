"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { organizations, organizationUsers, user } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { userHasAccessAndPermission } from "@/lib/better-auth/check-access";

export const removeOrganizationMember = async (
	organizationId: string,
	userIdToRemove: string,
) => {
	try {
		// Get current user session
		const { hasAccess, user: currentUser } = await userHasAccessAndPermission(
			organizationId,
			"admin",
		);

		if (!hasAccess || !currentUser) {
			return {
				success: false,
				error:
					"You do not have access to perform this action on this organization",
			};
		}

		// Prevent user from removing themselves
		if (currentUser.id === userIdToRemove) {
			return {
				success: false,
				error: "You cannot remove yourself from the organization",
			};
		}

		// Start a database transaction
		const result = await db.transaction(async (tx) => {
			// Check if the user to remove exists in the organization and is not an owner
			const memberToRemove = await tx
				.select({
					role: organizationUsers.role,
				})
				.from(organizationUsers)
				.where(
					and(
						eq(organizationUsers.organizationId, organizationId),
						eq(organizationUsers.userId, userIdToRemove),
					),
				)
				.limit(1);

			if (memberToRemove.length === 0) {
				throw new Error("User is not a member of this organization");
			}

			if (memberToRemove[0].role === "owner") {
				throw new Error("You cannot remove the owner of the organization");
			}

			// Check how many organizations the user will have after removal
			const userOrganizationCount = await tx
				.select({ count: count() })
				.from(organizationUsers)
				.where(eq(organizationUsers.userId, userIdToRemove));

			const remainingOrganizations = userOrganizationCount[0].count - 1;

			// Remove the user from the organization
			await tx
				.delete(organizationUsers)
				.where(
					and(
						eq(organizationUsers.organizationId, organizationId),
						eq(organizationUsers.userId, userIdToRemove),
					),
				);

			// If user will have no organizations left, create a new one for them
			if (remainingOrganizations === 0) {
				// Get user details for organization name
				const userDetails = await tx
					.select({
						name: user.name,
						email: user.email,
					})
					.from(user)
					.where(eq(user.id, userIdToRemove))
					.limit(1);

				if (userDetails.length === 0) {
					throw new Error("User not found");
				}

				const userData = userDetails[0];
				const organizationName = userData.name
					? `${userData.name}'s Organization`
					: `${userData.email.split("@")[0]}'s Organization`;

				// Create new organization
				const [newOrganization] = await tx
					.insert(organizations)
					.values({
						name: organizationName,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					})
					.returning();

				if (!newOrganization) {
					throw new Error("Failed to create new organization");
				}

				// Link user to the new organization as owner
				await tx.insert(organizationUsers).values({
					organizationId: newOrganization.id,
					userId: userIdToRemove,
					role: "owner",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});

				return {
					memberRemoved: true,
					newOrganizationCreated: true,
					newOrganization,
				};
			}

			return {
				memberRemoved: true,
				newOrganizationCreated: false,
			};
		});

		return {
			success: true,
			message: result.newOrganizationCreated
				? "Member removed successfully and a new organization was created for them"
				: "Member removed successfully",
			data: result,
		};
	} catch (error) {
		console.error("Failed to remove organization member:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to remove member from organization",
		};
	}
};
