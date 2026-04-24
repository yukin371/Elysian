-- Enable RLS and create tenant isolation policies on all tenant-scoped tables.
-- Uses session variable "app.current_tenant" set by application middleware.

-- users
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "users" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- roles
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "roles" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- permissions
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "permissions" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- menus
ALTER TABLE "menus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "menus" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "menus" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- departments
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "departments" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "departments" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- customers
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "customers" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- files
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "files" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- notifications
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "notifications" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- dictionary_types
ALTER TABLE "dictionary_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dictionary_types" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "dictionary_types" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- dictionary_items
ALTER TABLE "dictionary_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dictionary_items" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "dictionary_items" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- system_settings
ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_settings" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "system_settings" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- audit_logs
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "audit_logs" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- refresh_sessions
ALTER TABLE "refresh_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refresh_sessions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "refresh_sessions" USING ("tenant_id" = current_setting('app.current_tenant', true)::uuid);

-- tenants table: NOT force RLS so super-admin can list all tenants.
-- Super-admin sets app.current_tenant to empty string to bypass.
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation" ON "tenants" USING (
  current_setting('app.current_tenant', true) IS NULL
  OR NULLIF(current_setting('app.current_tenant', true), '') IS NULL
  OR "id" = NULLIF(current_setting('app.current_tenant', true), '')::uuid
);
