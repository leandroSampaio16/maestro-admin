"use server";

import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { db } from "@/db/drizzle";
import { organizations, organizationUsers, user } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { userHasAccessAndPermission } from "@/lib/better-auth/check-access";

export const deleteOrganization = async (organizationId: string) => {
	try {
		// Get current user session and check access
		const { hasAccess, user: currentUser } = await userHasAccessAndPermission(
			organizationId,
			"owner",
		);

		// Verify user has access to this organization
		if (!hasAccess || !currentUser) {
			return {
				success: false,
				error:
					"You do not have access to perform this action on this organization",
			};
		}

		// Check if user has other organizations
		const userOrgCount = await db
			.select({ count: count() })
			.from(organizationUsers)
			.where(eq(organizationUsers.userId, currentUser.id));

		if (userOrgCount[0].count <= 1) {
			return {
				success: false,
				error: "You cannot delete your only organization",
			};
		}

		// Start a database transaction to ensure all operations are atomic
		const result = await db.transaction(async (tx) => {
			// Get the organization details before deletion
			const orgToDelete = await tx
				.select()
				.from(organizations)
				.where(eq(organizations.id, organizationId))
				.limit(1);

			if (orgToDelete.length === 0) {
				throw new Error("Organization not found");
			}

			// Get all members of the organization being deleted
			const organizationMembers = await tx
				.select({
					userId: organizationUsers.userId,
					userName: user.name,
					userEmail: user.email,
				})
				.from(organizationUsers)
				.innerJoin(user, eq(organizationUsers.userId, user.id))
				.where(eq(organizationUsers.organizationId, organizationId));

			// Check each member's organization count and create new organizations if needed
			const membersNeedingOrganizations: Array<{
				userId: string;
				userName: string | null;
				userEmail: string;
			}> = [];

			for (const member of organizationMembers) {
				// Count how many organizations this user belongs to
				const memberOrgCount = await tx
					.select({ count: count() })
					.from(organizationUsers)
					.where(eq(organizationUsers.userId, member.userId));

				// If they only belong to this organization (count = 1), they'll need a new one
				if (memberOrgCount[0].count <= 1) {
					membersNeedingOrganizations.push({
						userId: member.userId,
						userName: member.userName,
						userEmail: member.userEmail,
					});
				}
			}

			// Create new organizations for members who need them
			const newOrganizationsCreated: Array<{
				userId: string;
				organizationName: string;
				organizationId: string;
			}> = [];

			for (const member of membersNeedingOrganizations) {
				// Generate organization name based on user details
				const organizationName = member.userName
					? `${member.userName}'s Organization`
					: `${member.userEmail.split("@")[0]}'s Organization`;

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
					throw new Error(
						`Failed to create new organization for user ${member.userId}`,
					);
				}

				// Link user to the new organization as owner
				await tx.insert(organizationUsers).values({
					organizationId: newOrganization.id,
					userId: member.userId,
					role: "owner",
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
				});

				newOrganizationsCreated.push({
					userId: member.userId,
					organizationName,
					organizationId: newOrganization.id,
				});
			}

			// Now delete the organization (cascade will handle organizationUsers)
			await tx
				.delete(organizations)
				.where(eq(organizations.id, organizationId));

			return {
				deletedOrganization: orgToDelete[0],
				newOrganizationsCreated,
				membersProcessed: organizationMembers.length,
			};
		});

        // No cookie to clear; client store will handle selection updates

		return {
			success: true,
			message: `Organization "${result.deletedOrganization.name}" has been deleted successfully${
				result.newOrganizationsCreated.length > 0
					? `. Created ${result.newOrganizationsCreated.length} new organization(s) for members who would have been left without any organizations.`
					: ""
			}`,
			data: {
				deletedOrganization: result.deletedOrganization.name,
				newOrganizationsCreated: result.newOrganizationsCreated,
				membersProcessed: result.membersProcessed,
			},
		};
	} catch (error) {
		console.error("Failed to delete organization:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to delete organization",
		};
	}
};
