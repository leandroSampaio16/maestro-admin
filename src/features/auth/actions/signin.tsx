"use server";

import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db/drizzle";
import { organizationUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const signIn = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // First, attempt to sign in
    const signInResult = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    // Get the user from the sign-in result
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user) {
      return {
        error: "Authentication failed. Please try again.",
      };
    }

    // Check if user belongs to the admin organization
    const adminOrgId = process.env.ADMIN_ORG;
    if (!adminOrgId) {
      console.error("ADMIN_ORG environment variable not set");
      return {
        error: "System configuration error. Please contact support.",
      };
    }

    // Check if user is member of admin organization
    const userOrgMembership = await db
      .select()
      .from(organizationUsers)
      .where(
        eq(organizationUsers.userId, session.user.id)
      )
      .limit(1);

    const isAdminOrgMember = userOrgMembership.some(
      (membership) => membership.organizationId === adminOrgId
    );

    if (!isAdminOrgMember) {
      // Sign out the user since they don't have access
      await auth.api.signOut({
        headers: new Headers(),
      });
      
      return {
        error: "Access denied. Only authorized organization members can login.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      error: "Invalid email or password. Please try again.",
    };
  }
};