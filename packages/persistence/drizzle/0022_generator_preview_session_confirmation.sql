ALTER TABLE "generator_preview_sessions"
  ADD COLUMN "confirmed_at" timestamp with time zone,
  ADD COLUMN "confirmed_by_display_name" text,
  ADD COLUMN "confirmed_by_user_id" uuid,
  ADD COLUMN "confirmed_by_username" text,
  ADD COLUMN "confirmation_evidence" jsonb;
