ALTER TABLE "users"
ADD COLUMN "login_failure_count" smallint NOT NULL DEFAULT 0;

ALTER TABLE "users"
ADD COLUMN "last_login_failed_at" timestamp with time zone;

ALTER TABLE "users"
ADD COLUMN "login_locked_until" timestamp with time zone;
