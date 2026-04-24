CREATE TYPE "tenant_status" AS ENUM ('active', 'suspended');

CREATE TABLE "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(128) NOT NULL,
  "status" "tenant_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "tenants" ADD CONSTRAINT "tenants_code_unique" UNIQUE("code");

-- Default tenant for existing data
INSERT INTO "tenants" ("id", "code", "name", "status")
VALUES ('00000000-0000-0000-0000-000000000000', 'default', 'Default Tenant', 'active');
