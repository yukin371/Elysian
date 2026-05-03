ALTER TABLE "generator_preview_sessions"
  ADD COLUMN "review_evidence" jsonb,
  ADD COLUMN "apply_evidence" jsonb;
