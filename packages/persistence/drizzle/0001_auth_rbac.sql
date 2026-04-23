CREATE TYPE "user_status" AS ENUM ('active', 'disabled');
CREATE TYPE "role_status" AS ENUM ('active', 'disabled');
CREATE TYPE "menu_status" AS ENUM ('active', 'disabled');
CREATE TYPE "menu_type" AS ENUM ('directory', 'menu', 'button');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "username" text NOT NULL,
  "display_name" text NOT NULL,
  "email" text,
  "phone" text,
  "password_hash" text NOT NULL,
  "status" "user_status" DEFAULT 'active' NOT NULL,
  "is_super_admin" boolean DEFAULT false NOT NULL,
  "last_login_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "users_username_unique" UNIQUE("username")
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "status" "role_status" DEFAULT 'active' NOT NULL,
  "is_system" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "roles_code_unique" UNIQUE("code")
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" text NOT NULL,
  "module" text NOT NULL,
  "resource" text NOT NULL,
  "action" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "permissions_code_unique" UNIQUE("code")
);

CREATE TABLE "user_roles" (
  "user_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY("user_id", "role_id")
);

CREATE TABLE "role_permissions" (
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY("role_id", "permission_id")
);

CREATE TABLE "menus" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "parent_id" uuid,
  "type" "menu_type" NOT NULL,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "path" text,
  "component" text,
  "icon" text,
  "sort" integer DEFAULT 0 NOT NULL,
  "is_visible" boolean DEFAULT true NOT NULL,
  "status" "menu_status" DEFAULT 'active' NOT NULL,
  "permission_code" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "menus_code_unique" UNIQUE("code")
);

CREATE TABLE "role_menus" (
  "role_id" uuid NOT NULL,
  "menu_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY("role_id", "menu_id")
);

CREATE TABLE "refresh_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "token_hash" text NOT NULL,
  "user_agent" text,
  "ip" text,
  "expires_at" timestamp with time zone NOT NULL,
  "last_used_at" timestamp with time zone,
  "revoked_at" timestamp with time zone,
  "replaced_by_session_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "refresh_sessions_token_hash_unique" UNIQUE("token_hash")
);

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "user_roles"
  ADD CONSTRAINT "user_roles_role_id_roles_id_fk"
  FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_role_id_roles_id_fk"
  FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "role_permissions"
  ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk"
  FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "menus"
  ADD CONSTRAINT "menus_parent_id_menus_id_fk"
  FOREIGN KEY ("parent_id") REFERENCES "public"."menus"("id")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "menus"
  ADD CONSTRAINT "menus_permission_code_permissions_code_fk"
  FOREIGN KEY ("permission_code") REFERENCES "public"."permissions"("code")
  ON DELETE no action ON UPDATE no action;

ALTER TABLE "role_menus"
  ADD CONSTRAINT "role_menus_role_id_roles_id_fk"
  FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "role_menus"
  ADD CONSTRAINT "role_menus_menu_id_menus_id_fk"
  FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "refresh_sessions"
  ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
  ON DELETE cascade ON UPDATE no action;

ALTER TABLE "refresh_sessions"
  ADD CONSTRAINT "refresh_sessions_replaced_by_session_id_refresh_sessions_id_fk"
  FOREIGN KEY ("replaced_by_session_id") REFERENCES "public"."refresh_sessions"("id")
  ON DELETE no action ON UPDATE no action;
