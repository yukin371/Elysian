CREATE TYPE "workflow_definition_status" AS ENUM ('active', 'disabled');

CREATE TABLE "workflow_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action,
  "key" text NOT NULL,
  "name" text NOT NULL,
  "version" integer NOT NULL,
  "status" "workflow_definition_status" DEFAULT 'active' NOT NULL,
  "definition" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "workflow_definitions_tenant_key_version_unique" UNIQUE("tenant_id", "key", "version")
);

CREATE INDEX "idx_workflow_definitions_tenant_key" ON "workflow_definitions" ("tenant_id", "key", "version");

ALTER TABLE "workflow_definitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_definitions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "workflow_definitions" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);
