CREATE TYPE "department_status" AS ENUM ('active', 'disabled');

CREATE TABLE "departments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" uuid,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "sort" integer DEFAULT 0 NOT NULL,
  "status" "department_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "departments_code_unique" UNIQUE("code")
);

CREATE TABLE "user_departments" (
  "user_id" uuid NOT NULL,
  "department_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY("user_id", "department_id")
);

ALTER TABLE "departments"
  ADD CONSTRAINT "departments_parent_id_departments_id_fk"
  FOREIGN KEY ("parent_id") REFERENCES "public"."departments"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "user_departments"
  ADD CONSTRAINT "user_departments_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "user_departments"
  ADD CONSTRAINT "user_departments_department_id_departments_id_fk"
  FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id")
  ON DELETE cascade ON UPDATE no action;
