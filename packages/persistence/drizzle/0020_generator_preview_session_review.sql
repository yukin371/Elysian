ALTER TABLE "generator_preview_sessions"
  ADD COLUMN "review_comment" text,
  ADD COLUMN "reviewed_at" timestamp with time zone,
  ADD COLUMN "reviewed_by_display_name" text,
  ADD COLUMN "reviewed_by_user_id" uuid,
  ADD COLUMN "reviewed_by_username" text;

ALTER TABLE "generator_preview_sessions"
  ALTER COLUMN "status" SET DEFAULT 'pending_review';
