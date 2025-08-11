import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { user } from "./user";

export const organizationAuditLog = pgTable("organization_audit_log", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id),
  action: text().notNull(),
  details: jsonb().default({}),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  }).notNull().defaultNow(),
});

export type OrganizationAuditLog = typeof organizationAuditLog.$inferSelect;
export type NewOrganizationAuditLog = typeof organizationAuditLog.$inferInsert;
