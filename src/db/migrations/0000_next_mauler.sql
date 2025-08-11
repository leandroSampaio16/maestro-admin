CREATE TYPE "public"."search_type_enum" AS ENUM('portugal', 'global', 'custom');--> statement-breakpoint
CREATE TYPE "public"."organization_invite_status" AS ENUM('pending', 'accepted', 'expired');--> statement-breakpoint
CREATE TYPE "public"."organization_roles" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "caes" (
	"cae" text,
	"label" text
);
--> statement-breakpoint
CREATE TABLE "processed_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"mark" varchar(100),
	"company_name" varchar(500),
	"nif_code" varchar(50) NOT NULL,
	"marketable_telephone" varchar(50),
	"telephone" varchar(100),
	"web_site" varchar(500),
	"email_portugal" varchar(500),
	"ticker_symbol" varchar(50),
	"city" varchar(200),
	"country" varchar(200),
	"address" text,
	"marketable_address" varchar(50),
	"postal_code" varchar(50),
	"president" varchar(500),
	"shareholders_equity_th_eur_last_avail_yr" numeric(15, 2),
	"economic_profitability_percent_last_avail_yr" numeric(5, 2),
	"financial_profitability_percent_last_avail_yr" numeric(5, 2),
	"number_of_employees_last_avail_yr" integer,
	"cash_cash_equivalent_th_eur_last_avail_yr" numeric(15, 2),
	"long_term_debt_th_eur_last_avail_yr" numeric(15, 2),
	"operating_revenue_turnover_th_eur_last_avail_yr" numeric(15, 2),
	"sales_th_eur_last_avail_yr" numeric(15, 2),
	"cost_of_goods_sold_consumed_th_eur_last_avail_yr" numeric(15, 2),
	"gross_profit_th_eur_last_avail_yr" numeric(15, 2),
	"other_operating_expenses_th_eur_last_avail_yr" numeric(15, 2),
	"operating_pl_th_eur_last_avail_yr" numeric(15, 2),
	"pl_before_tax_th_eur_last_avail_yr" numeric(15, 2),
	"taxation_th_eur_last_avail_yr" numeric(15, 2),
	"pl_after_tax_th_eur_last_avail_yr" numeric(15, 2),
	"material_costs_th_eur_last_avail_yr" numeric(15, 2),
	"cost_of_employees_th_eur_last_avail_yr" numeric(15, 2),
	"depreciation_th_eur_last_avail_yr" numeric(15, 2),
	"cash_flow_th_eur_last_avail_yr" numeric(15, 2),
	"ebit_th_eur_last_avail_yr" numeric(15, 2),
	"ebitda_th_eur_last_avail_yr" numeric(15, 2),
	"number_of_directors_managers" integer,
	"number_of_current_directors_managers" integer,
	"dm_full_name" varchar(500),
	"dm_uci" varchar(100),
	"dm_current_or_previous" varchar(20),
	"dm_job_title" varchar(500),
	"dm_type_of_role" varchar(100),
	"dm_board_committee_department" varchar(500),
	"dm_level_of_responsibility" varchar(100),
	"dm_also_shareholder" varchar(10),
	"dm_confirmation_dates" date,
	"dm_information_sources" varchar(100),
	"leasing_less_1_year" numeric(15, 2),
	"leasing_between_1_and_5_years" numeric(15, 2),
	"leasing_more_5_years" numeric(15, 2),
	"entities" varchar(100),
	"entity" varchar(100),
	"debt_type" varchar(100),
	"loan_granted_date" date,
	"loan_due_date" date,
	"loan_granted_limit_th_eur" numeric(15, 2),
	"loan_used_th_eur" numeric(15, 2),
	"loan_available_th_eur" numeric(15, 2),
	"average_interest_rate_percent" numeric(5, 2),
	"grant_type" varchar(100),
	"organization" varchar(100),
	"year_grant" integer,
	"amount_grant_eur" numeric(15, 2),
	"amount_grant_year_approved_eur" numeric(15, 2),
	"amount_grant_remaining_eur" numeric(15, 2),
	"no_of_shareholders" integer,
	"shareholder_name" varchar(500),
	"shareholder_first_name" varchar(100),
	"shareholder_last_name" varchar(100),
	"shareholder_bvd_id_number" varchar(50),
	"shareholder_city" varchar(100),
	"ish_country_iso_code" varchar(10),
	"ish_nace_core_code" varchar(20),
	"ish_nace_text_description" text,
	"ish_naics_core_code" varchar(20),
	"ish_naics_text_description" text,
	"ish_direct_percent" numeric(5, 2),
	"ish_total_percent" numeric(5, 2),
	"ish_information_source" varchar(100),
	"ish_operating_revenue_turnover_m_eur" numeric(15, 2),
	"ish_number_of_employees" integer,
	"ish_also_manager" varchar(50),
	"ish_name" varchar(500),
	"ish_first_name" varchar(100),
	"ish_last_name" varchar(100),
	"ish_bvd_id_number" varchar(50),
	"ish_city" varchar(100),
	"guo_number_of_employees" integer,
	"headquarters_information_date" date,
	"headquarters_current_archived" varchar(20),
	"guo_name" varchar(500),
	"guo_first_name" varchar(100),
	"guo_last_name" varchar(100),
	"guo_bvd_id_number" varchar(50),
	"guo_country_iso_code" varchar(10),
	"guo_city" varchar(100),
	"guo_nace_core_code" varchar(20),
	"guo_nace_text_description" text,
	"guo_naics_core_code" varchar(20),
	"guo_naics_text_description" text,
	"guo_direct_percent" numeric(5, 2),
	"guo_total_percent" numeric(5, 2),
	"guo_information_source" varchar(100),
	"guo_operating_revenue_turnover_m_eur" numeric(15, 2),
	"guo_total_assets_m_eur" numeric(15, 2),
	"guo_also_manager" varchar(50),
	"duo_name" varchar(500),
	"duo_first_name" varchar(100),
	"duo_last_name" varchar(100),
	"duo_bvd_id_number" varchar(50),
	"duo_country_iso_code" varchar(10),
	"duo_city" varchar(100),
	"duo_nace_core_code" varchar(20),
	"duo_nace_text_description" text,
	"duo_naics_core_code" varchar(20),
	"duo_naics_text_description" text,
	"duo_direct_percent" numeric(5, 2),
	"duo_total_percent" numeric(5, 2),
	"duo_information_source" varchar(100),
	"duo_operating_revenue_turnover_m_eur" numeric(15, 2),
	"duo_total_assets_m_eur" numeric(15, 2),
	"date_of_establishment" date,
	"last_available_year" integer,
	"number_of_available_years" integer,
	"latest_number_of_employees" integer,
	"iae_primary_codes" varchar(100),
	"iae_primary_labels" varchar(500),
	"cnae_2009_primary_code" varchar(20),
	"cnae_2009_primary_label" varchar(500),
	"cnae_2009_secondary_codes" varchar(500),
	"cnae_2009_secondary_labels" text,
	"director" varchar(500),
	"legal_form" varchar(100),
	"cae_rev4_primary_code" varchar(20),
	"cae_rev4_primary_label" varchar(500),
	"cae_rev4_secondary_codes" varchar(500),
	"cae_rev4_secondary_labels" text,
	"cae_rev3_primary_code" varchar(20),
	"cae_rev3_primary_label" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "processed_companies_nif_code_unique" UNIQUE("nif_code")
);
--> statement-breakpoint
CREATE TABLE "distinct_cities" (
	"city" text
);
--> statement-breakpoint
CREATE TABLE "incentive_projects" (
	"incentive_project_id" serial NOT NULL,
	"project_id" text NOT NULL,
	"incentive_program" text NOT NULL,
	"title" text,
	"description" text,
	"ai_description" jsonb,
	"document_urls" jsonb,
	"date_publication" timestamp with time zone,
	"date_start" timestamp with time zone,
	"date_end" timestamp with time zone,
	"total_budget" numeric(20, 2),
	"status" text,
	"all_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"eligibility_criteria" jsonb,
	"source_link" text,
	"gcs_document_urls" jsonb,
	CONSTRAINT "incentive_projects_incentive_project_id_project_id_incentive_program_pk" PRIMARY KEY("incentive_project_id","project_id","incentive_program")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"email" text NOT NULL,
	"organization_id" uuid NOT NULL,
	"invited_by" text NOT NULL,
	"status" "organization_invite_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	CONSTRAINT "organization_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organization_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"role" "organization_roles" DEFAULT 'member' NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "organization_users_user_id_organization_id_unique" UNIQUE("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospects_search" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"search_parameters_hash" varchar(64) NOT NULL,
	"search_parameters" jsonb DEFAULT '{}' NOT NULL,
	"search_results" jsonb DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"search_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"search_type" "search_type_enum" NOT NULL,
	"search_parameters" jsonb DEFAULT '{}' NOT NULL,
	"filters_applied" jsonb DEFAULT '{}' NOT NULL,
	"total_results_found" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"duration_ms" integer
);
--> statement-breakpoint
CREATE TABLE "search_history_companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"search_id" uuid NOT NULL,
	"company_ids" integer[] NOT NULL,
	"total_companies" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_invites" ADD CONSTRAINT "organization_invites_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_users" ADD CONSTRAINT "organization_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history" ADD CONSTRAINT "search_history_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "search_history_companies" ADD CONSTRAINT "search_history_companies_search_id_search_history_search_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search_history"("search_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "prospects_search_hash_idx" ON "prospects_search" USING btree ("search_parameters_hash");--> statement-breakpoint
CREATE INDEX "prospects_search_created_at_idx" ON "prospects_search" USING btree ("created_at");