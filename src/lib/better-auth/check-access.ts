import { db } from "@/db/drizzle";
import { organizationUsers } from "@/db/schema/organizations";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "./auth";

export const userHasAccessAndPermission = async (
  organizationId: string,
  permission: "owner" | "admin" | "member" = "member",
) => {
  // Define permission hierarchy
  const permissionHierarchy = {
    owner: 3,
    admin: 2,
    member: 1,
  };

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { hasAccess: false, user: null };
  }

  // Get all roles that satisfy the required permission or higher
  const allowedRoles = Object.entries(permissionHierarchy)
    .filter(([role, level]) => level >= permissionHierarchy[permission])
    .map(([role]) => role) as ("owner" | "admin" | "member")[];

  const userAccess = await db
    .select()
    .from(organizationUsers)
    .where(
      and(
        eq(organizationUsers.organizationId, organizationId),
        eq(organizationUsers.userId, session.user.id),
        inArray(organizationUsers.role, allowedRoles),
      ),
    );

  return {
    hasAccess: userAccess.length > 0,
    user: session.user,
  };
};
