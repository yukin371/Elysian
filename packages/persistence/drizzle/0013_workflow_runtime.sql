CREATE TYPE "workflow_instance_status" AS ENUM ('running', 'completed', 'terminated');
CREATE TYPE "workflow_task_status" AS ENUM ('todo', 'completed', 'cancelled');

CREATE TABLE "workflow_instances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action,
  "definition_id" uuid NOT NULL REFERENCES "public"."workflow_definitions"("id") ON DELETE restrict ON UPDATE no action,
  "definition_key" text NOT NULL,
  "definition_name" text NOT NULL,
  "definition_version" integer NOT NULL,
  "status" "workflow_instance_status" DEFAULT 'running' NOT NULL,
  "current_node_id" text,
  "variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "started_by_user_id" uuid,
  "started_at" timestamp with time zone DEFAULT now() NOT NULL,
  "completed_at" timestamp with time zone,
  "terminated_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "workflow_tasks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action,
  "instance_id" uuid NOT NULL REFERENCES "public"."workflow_instances"("id") ON DELETE cascade ON UPDATE no action,
  "definition_id" uuid NOT NULL REFERENCES "public"."workflow_definitions"("id") ON DELETE restrict ON UPDATE no action,
  "node_id" text NOT NULL,
  "node_name" text NOT NULL,
  "assignee" text NOT NULL,
  "status" "workflow_task_status" DEFAULT 'todo' NOT NULL,
  "variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "completed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "idx_workflow_instances_tenant_created_at" ON "workflow_instances" ("tenant_id", "created_at");
CREATE INDEX "idx_workflow_tasks_tenant_status_created_at" ON "workflow_tasks" ("tenant_id", "status", "created_at");
CREATE INDEX "idx_workflow_tasks_instance_status" ON "workflow_tasks" ("instance_id", "status");

ALTER TABLE "workflow_instances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_instances" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "workflow_instances" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

ALTER TABLE "workflow_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workflow_tasks" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "workflow_tasks" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);
