CREATE TYPE "dictionary_status" AS ENUM ('active', 'disabled');

CREATE TABLE "dictionary_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" "dictionary_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "dictionary_types_code_unique" UNIQUE("code")
);

CREATE TABLE "dictionary_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type_id" uuid NOT NULL,
  "value" text NOT NULL,
  "label" text NOT NULL,
  "sort" integer DEFAULT 0 NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "status" "dictionary_status" DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "dictionary_items_type_value_unique" UNIQUE("type_id", "value")
);

ALTER TABLE "dictionary_items"
  ADD CONSTRAINT "dictionary_items_type_id_dictionary_types_id_fk"
  FOREIGN KEY ("type_id") REFERENCES "public"."dictionary_types"("id")
  ON DELETE cascade ON UPDATE no action;
