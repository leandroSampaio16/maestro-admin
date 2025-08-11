import {
  pgTable,
  foreignKey,
  unique,
  text,
  timestamp,
  boolean,
  uuid,
  doublePrecision,
  jsonb,
  integer,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./user";

export const organizationRoles = pgEnum("organization_roles", [
  "owner",
  "admin",
  "user",
]);

export const organizationStatus = pgEnum("organization_status", [
  "active",
  "suspended",
  "archived",
  "pending_verification",
]);

export const organizationInviteStatus = pgEnum("organization_invite_status", [
  "pending",
  "accepted",
  "expired",
]);

export const organizations = pgTable("organizations", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: text().notNull(),
  description: text(),
  website: text(),
  logoUrl: text("logo_url"),
  status: organizationStatus().notNull().default("active"),
  metadata: jsonb().default({}),
  maxMembers: integer("max_members").default(50),
  ownerId: text("owner_id"),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
});

export const organizationUsers = pgTable(
  "organization_users",
  {
    id: uuid().primaryKey().notNull().defaultRandom(),
    organizationId: uuid("organization_id").notNull(),
    userId: text("user_id").notNull(), // Changed from uuid to text
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    role: organizationRoles("role").notNull().default("user"),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organizations.id],
      name: "organization_users_organization_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "organization_users_user_id_fkey",
    }).onDelete("cascade"),
    unique("organization_users_user_id_organization_id_unique").on(
      table.userId,
      table.organizationId,
    ),
  ],
);

export const organizationInvites = pgTable("organization_invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  invitedBy: text("invited_by")
    .notNull()
    .references(() => user.id),
  status: organizationInviteStatus("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "string" }),
});

export type OrganizationInvite = typeof organizationInvites.$inferSelect;
export type OrganizationInviteStatus =
  (typeof organizationInviteStatus.enumValues)[number];
export type OrganizationRole = (typeof organizationRoles.enumValues)[number];
export type Organization = typeof organizations.$inferSelect;
export type OrganizationUser = typeof organizationUsers.$inferSelect;
