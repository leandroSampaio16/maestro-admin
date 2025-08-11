import { db } from "@/db/drizzle";
import { organizationInvites, organizationUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function acceptInvite(inviteId: string, userId: string) {
  // Mark invite as accepted
  const invite = await db
    .select()
    .from(organizationInvites)
    .where(eq(organizationInvites.id, inviteId))
    .limit(1);

  if (invite.length === 0) {
    return { error: "Invite not found" };
  }

  await db
    .update(organizationInvites)
    .set({
      status: "accepted",
      acceptedAt: new Date().toISOString(),
    })
    .where(eq(organizationInvites.id, inviteId));

  // Add user to organization (assuming you have an organizationMembers table)

  if (invite.length) {
    await db.insert(organizationUsers).values({
      userId,
      organizationId: invite[0].organizationId,
      role: "member", // or whatever default role you want
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
