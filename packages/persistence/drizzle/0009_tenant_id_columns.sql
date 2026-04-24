-- Step 1: Add nullable tenant_id column to all tenant-scoped tables
ALTER TABLE "users" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "roles" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "permissions" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "menus" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "departments" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "customers" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "files" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "notifications" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "dictionary_types" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "dictionary_items" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "system_settings" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "audit_logs" ADD COLUMN "tenant_id" uuid;
ALTER TABLE "refresh_sessions" ADD COLUMN "tenant_id" uuid;

-- Step 2: Backfill with default tenant
UPDATE "users" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "roles" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "permissions" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "menus" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "departments" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "customers" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "files" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "notifications" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "dictionary_types" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "dictionary_items" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "system_settings" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "audit_logs" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;
UPDATE "refresh_sessions" SET "tenant_id" = '00000000-0000-0000-0000-000000000000' WHERE "tenant_id" IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE "users" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "roles" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "permissions" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "menus" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "departments" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "customers" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "files" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "notifications" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "dictionary_types" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "dictionary_items" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "system_settings" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "audit_logs" ALTER COLUMN "tenant_id" SET NOT NULL;
ALTER TABLE "refresh_sessions" ALTER COLUMN "tenant_id" SET NOT NULL;

-- Step 3.1: Rebuild tenant-aware unique constraints
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";
ALTER TABLE "roles" DROP CONSTRAINT "roles_code_unique";
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_code_unique";
ALTER TABLE "menus" DROP CONSTRAINT "menus_code_unique";
ALTER TABLE "menus" DROP CONSTRAINT "menus_permission_code_permissions_code_fk";
ALTER TABLE "departments" DROP CONSTRAINT "departments_code_unique";
ALTER TABLE "dictionary_types" DROP CONSTRAINT "dictionary_types_code_unique";
ALTER TABLE "system_settings" DROP CONSTRAINT "system_settings_key_unique";

ALTER TABLE "users" ADD CONSTRAINT "users_tenant_username_unique" UNIQUE ("tenant_id", "username");
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_code_unique" UNIQUE ("tenant_id", "code");
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_tenant_code_unique" UNIQUE ("tenant_id", "code");
ALTER TABLE "menus" ADD CONSTRAINT "menus_tenant_code_unique" UNIQUE ("tenant_id", "code");
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_code_unique" UNIQUE ("tenant_id", "code");
ALTER TABLE "dictionary_types" ADD CONSTRAINT "dictionary_types_tenant_code_unique" UNIQUE ("tenant_id", "code");
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_tenant_key_unique" UNIQUE ("tenant_id", "key");

-- Step 4: Foreign keys
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "menus" ADD CONSTRAINT "menus_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "menus" ADD CONSTRAINT "menus_tenant_id_permission_code_permissions_tenant_code_fk" FOREIGN KEY ("tenant_id", "permission_code") REFERENCES "public"."permissions"("tenant_id", "code") ON DELETE no action ON UPDATE no action;
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "files" ADD CONSTRAINT "files_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "dictionary_types" ADD CONSTRAINT "dictionary_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "dictionary_items" ADD CONSTRAINT "dictionary_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE restrict ON UPDATE no action;

-- Step 5: Composite indexes (tenant_id leading column)
CREATE INDEX "idx_users_tenant" ON "users" ("tenant_id", "id");
CREATE INDEX "idx_roles_tenant" ON "roles" ("tenant_id", "id");
CREATE INDEX "idx_permissions_tenant" ON "permissions" ("tenant_id", "id");
CREATE INDEX "idx_menus_tenant" ON "menus" ("tenant_id", "id");
CREATE INDEX "idx_departments_tenant" ON "departments" ("tenant_id", "id");
CREATE INDEX "idx_customers_tenant" ON "customers" ("tenant_id", "id");
CREATE INDEX "idx_files_tenant" ON "files" ("tenant_id", "id");
CREATE INDEX "idx_notifications_tenant" ON "notifications" ("tenant_id", "id");
CREATE INDEX "idx_dictionary_types_tenant" ON "dictionary_types" ("tenant_id", "id");
CREATE INDEX "idx_dictionary_items_tenant" ON "dictionary_items" ("tenant_id", "id");
CREATE INDEX "idx_system_settings_tenant" ON "system_settings" ("tenant_id", "id");
CREATE INDEX "idx_audit_logs_tenant" ON "audit_logs" ("tenant_id", "id");
CREATE INDEX "idx_refresh_sessions_tenant" ON "refresh_sessions" ("tenant_id", "id");
