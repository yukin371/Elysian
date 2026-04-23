CREATE TYPE "notification_level" AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE "notification_status" AS ENUM ('unread', 'read');

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "recipient_user_id" uuid NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "level" "notification_level" DEFAULT 'info' NOT NULL,
  "status" "notification_status" DEFAULT 'unread' NOT NULL,
  "created_by_user_id" uuid,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_recipient_user_id_users_id_fk"
  FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_created_by_user_id_users_id_fk"
  FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id")
  ON DELETE set null ON UPDATE no action;
