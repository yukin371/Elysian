CREATE TABLE "files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "original_name" text NOT NULL,
  "storage_key" text NOT NULL,
  "mime_type" text,
  "size" integer NOT NULL,
  "uploader_user_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "files_storage_key_unique" UNIQUE("storage_key")
);

ALTER TABLE "files"
  ADD CONSTRAINT "files_uploader_user_id_users_id_fk"
  FOREIGN KEY ("uploader_user_id") REFERENCES "public"."users"("id")
  ON DELETE set null ON UPDATE no action;
