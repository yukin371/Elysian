CREATE TYPE "setting_status" AS ENUM ('active', 'disabled');

CREATE TABLE "system_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL,
  "value" text NOT NULL,
  "description" text,
  "status" "setting_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
