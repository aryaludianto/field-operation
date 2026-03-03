CREATE TYPE "public"."mission_status" AS ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'COORDINATOR', 'FIELD_CREW');--> statement-breakpoint
CREATE TYPE "public"."report_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"label" varchar(120) NOT NULL,
	"type" varchar(60) NOT NULL,
	"storage_key" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "field_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mission_id" uuid NOT NULL,
	"author_id" uuid,
	"author_name" varchar(120) NOT NULL,
	"author_role" "user_role" DEFAULT 'FIELD_CREW',
	"summary" text,
	"details" text NOT NULL,
	"severity" "report_severity" DEFAULT 'LOW' NOT NULL,
	"insights" jsonb,
	"submitted_at" timestamp with time zone DEFAULT now(),
	"status" varchar(40) DEFAULT 'PENDING'
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"code" varchar(32) NOT NULL,
	"name" varchar(160) NOT NULL,
	"region" varchar(120) NOT NULL,
	"status" "mission_status" DEFAULT 'PLANNED' NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"scheduled_start" timestamp with time zone NOT NULL,
	"scheduled_end" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "missions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"slug" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"email" varchar(160) NOT NULL,
	"display_name" varchar(120) NOT NULL,
	"role" "user_role" DEFAULT 'FIELD_CREW' NOT NULL,
	"phone" varchar(40),
	"created_at" timestamp with time zone DEFAULT now(),
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "field_reports" ADD CONSTRAINT "field_reports_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;