CREATE TYPE "audit_result" AS ENUM ('success', 'failure');

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "category" text NOT NULL,
  "action" text NOT NULL,
  "actor_user_id" uuid,
  "target_type" text,
  "target_id" text,
  "result" "audit_result" NOT NULL,
  "request_id" text,
  "ip" text,
  "user_agent" text,
  "details" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk"
  FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id")
  ON DELETE set null ON UPDATE no action;
