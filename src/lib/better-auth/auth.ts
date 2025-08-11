import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { createOrganizationForUser } from "@/features/auth/actions/create-organization-for-user";
import { acceptInvite } from "@/features/organization/actions/accept-invite";
import { findValidInvite } from "@/features/organization/actions/get-valid-invite";

// Helper function to extract cookie value from request headers
function getCookieValue(
	cookieHeader: string | null,
	cookieName: string,
): string | null {
	if (!cookieHeader) return null;

	const cookies = cookieHeader.split(";");
	for (const cookie of cookies) {
		const [name, value] = cookie.trim().split("=");
		if (name === cookieName) {
			return decodeURIComponent(value);
		}
	}
	return null;
}

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [nextCookies()],
		databaseHooks: {
		user: {
			create: {
				after: async (user, ctx) => {
					try {
						console.log("ctx", ctx);

						// Check for invite from query parameters (regular signup) or cookie (OAuth)
						const inviteFromQuery = ctx?.query?.invite;
						const cookieHeader = ctx?.headers?.get
							? ctx.headers.get("cookie")
							: null;
						const inviteFromCookie = getCookieValue(
							cookieHeader,
							"pending_invite",
						);
						const inviteToken = inviteFromQuery || inviteFromCookie;

						// Handle invites to ADMIN_ORG
						const adminOrgId = process.env.ADMIN_ORG;
						if (!adminOrgId) {
							throw new Error("ADMIN_ORG environment variable not configured");
						}

						if (inviteToken) {
							const pendingInvite = await findValidInvite(
								inviteToken,
								user.email,
							);

							if (pendingInvite && pendingInvite.organizationId === adminOrgId) {
								console.log(
									`User ${user.id} accepting invite to admin org ${pendingInvite.organizationId}`,
								);
								await acceptInvite(pendingInvite.id, user.id);
								console.log(
									`Successfully added user ${user.name} to admin organization ${pendingInvite.organizationId}`,
								);

								// Organization selection will be handled by client store initializer

								// Clear the pending invite cookie if it was used
								if (inviteFromCookie) {
									// Note: We can't directly clear cookies here, but the menu page will handle cleanup
									console.log(
										"Invite processed from cookie, will be cleared on next page load",
									);
								}
								return;
							} else if (pendingInvite) {
								throw new Error("Access denied. Only invites to the administrative organization are allowed.");
							}
						}

						// No invite - create organization for user (for testing/development)
						console.log(`Creating organization for user ${user.id} without invite`);
						await createOrganizationForUser({
							userId: user.id,
							userName: user.name || user.email
						});
					} catch (error) {
						// Log the error and re-throw to prevent user creation
						console.error(
							`Failed to process user creation for ${user.id}:`,
							error,
						);
						throw error;
					}
				},
			},
		},
	},
	hooks: {
		signIn: {
			before: async (ctx) => {
				// Restrict login to ADMIN_ORG only
				const adminOrgId = process.env.ADMIN_ORG;
				if (!adminOrgId) {
					throw new Error("ADMIN_ORG environment variable not configured");
				}

				// Get user from context
				const userEmail = ctx.body?.email;
				if (!userEmail) {
					return; // Let other validation handle missing email
				}

				// Find user by email
				const { db } = await import("@/db/drizzle");
				const { user, organizationUsers } = await import("@/db/schema");
				const { eq } = await import("drizzle-orm");

				const existingUser = await db
					.select()
					.from(user)
					.where(eq(user.email, userEmail))
					.limit(1);

				if (existingUser.length === 0) {
					return; // User doesn't exist, let signup handle it
				}

				// Check if user belongs to admin organization
				const existingMembership = await db
					.select()
					.from(organizationUsers)
					.where(
						eq(organizationUsers.userId, existingUser[0].id)
					)
					.limit(1);

				if (existingMembership.length === 0 || existingMembership[0].organizationId !== adminOrgId) {
					throw new Error("Access denied. Only members of the administrative organization can log in.");
				}
			},
		},
	},
});
