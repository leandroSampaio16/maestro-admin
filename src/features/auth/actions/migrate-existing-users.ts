"use server";

import { db } from "@/db/drizzle";
import { user, organizationUsers } from "@/db/schema";
import { eq, notInArray } from "drizzle-orm";
import { createOrganizationForUser } from "./create-organization-for-user";

/**
 * Migration script to create organizations for existing users who don't have one
 * This should be run once after implementing the database hooks approach
 */
export const migrateExistingUsers = async () => {
  try {
    console.log("Starting migration for existing users without organizations...");

    // Find users who don't have any organization association
    const usersWithOrganizations = await db
      .select({ userId: organizationUsers.userId })
      .from(organizationUsers);

    const userIdsWithOrganizations = usersWithOrganizations.map(
      (org) => org.userId,
    );

    let usersWithoutOrganizations;
    if (userIdsWithOrganizations.length > 0) {
      usersWithoutOrganizations = await db
        .select()
        .from(user)
        .where(notInArray(user.id, userIdsWithOrganizations));
    } else {
      // If no users have organizations yet, get all users
      usersWithoutOrganizations = await db.select().from(user);
    }

    console.log(
      `Found ${usersWithoutOrganizations.length} users without organizations`,
    );

    let successCount = 0;
    let errorCount = 0;

    // Create organizations for users who don't have one
    for (const userRecord of usersWithoutOrganizations) {
      try {
        await createOrganizationForUser({
          userId: userRecord.id,
          userName: userRecord.name,
        });
        successCount++;
        console.log(
          `✓ Created organization for user: ${userRecord.id} (${userRecord.name})`,
        );
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Failed to create organization for user ${userRecord.id}:`,
          error,
        );
      }
    }

    console.log(
      `Migration completed: ${successCount} successful, ${errorCount} errors`,
    );

    return {
      success: true,
      data: {
        totalUsers: usersWithoutOrganizations.length,
        successCount,
        errorCount,
      },
    };
  } catch (error) {
    console.error("Migration failed:", error);
    return {
      success: false,
      error: "Migration failed",
    };
  }
};