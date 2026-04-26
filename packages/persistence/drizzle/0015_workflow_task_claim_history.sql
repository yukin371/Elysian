ALTER TABLE "workflow_tasks"
ADD COLUMN "claim_source_assignee" text,
ADD COLUMN "claimed_by_user_id" uuid,
ADD COLUMN "claimed_at" timestamptz;
