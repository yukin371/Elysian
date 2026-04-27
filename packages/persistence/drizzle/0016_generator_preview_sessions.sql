CREATE TABLE "generator_preview_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action,
  "actor_display_name" text,
  "actor_user_id" uuid,
  "actor_username" text,
  "applied_at" timestamp with time zone,
  "applied_file_count" integer,
  "applied_by_display_name" text,
  "applied_by_user_id" uuid,
  "applied_by_username" text,
  "apply_manifest_path" text,
  "apply_request_id" text,
  "conflict_strategy" text NOT NULL,
  "frontend_target" text NOT NULL,
  "has_blocking_conflicts" boolean NOT NULL DEFAULT false,
  "output_dir" text NOT NULL,
  "preview_file_count" integer NOT NULL,
  "report_path" text NOT NULL,
  "schema_name" text NOT NULL,
  "skipped_file_count" integer,
  "source_type" text NOT NULL,
  "source_value" text NOT NULL,
  "status" text NOT NULL DEFAULT 'ready',
  "target_preset" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX "idx_generator_preview_sessions_tenant_created"
  ON "generator_preview_sessions" ("tenant_id", "created_at", "id");

ALTER TABLE "generator_preview_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "generator_preview_sessions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "generator_preview_sessions"
  USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);
