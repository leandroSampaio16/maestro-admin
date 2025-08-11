CREATE TYPE "public"."organization_status" AS ENUM('active', 'suspended', 'archived', 'pending_verification');--> statement-breakpoint
CREATE TABLE "organization_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_users" ALTER COLUMN "role" SET DEFAULT 'user'::text;--> statement-breakpoint
DROP TYPE "public"."organization_roles";--> statement-breakpoint
CREATE TYPE "public"."organization_roles" AS ENUM('owner', 'admin', 'user');--> statement-breakpoint
ALTER TABLE "organization_users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."organization_roles";--> statement-breakpoint
ALTER TABLE "organization_users" ALTER COLUMN "role" SET DATA TYPE "public"."organization_roles" USING "role"::"public"."organization_roles";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "status" "organization_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "max_members" integer DEFAULT 50;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "owner_id" text;--> statement-breakpoint
ALTER TABLE "organization_audit_log" ADD CONSTRAINT "organization_audit_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_audit_log" ADD CONSTRAINT "organization_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;