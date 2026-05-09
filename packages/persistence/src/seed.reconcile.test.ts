import { describe, expect, it } from "bun:test"
import { PGlite } from "@electric-sql/pglite"
import { and, eq, inArray } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"

import type { DatabaseClient } from "./client"
import { menus, permissions } from "./schema"
import { seedDefaultAuthData } from "./seed"
import { DEFAULT_TENANT_ID } from "./tenant"

type PgliteTestDatabaseClient = ReturnType<
  typeof drizzle<Record<string, never>>
>

describe("seed label reconciliation", () => {
  it("reconciles existing setting permission and menu labels when explicitly requested", async () => {
    await withSeedReconcileTestDb(async ({ client, db }) => {
      await client.exec(`
        insert into permissions (
          id, tenant_id, code, module, resource, action, name, description
        ) values
          ('perm-setting-list-old', '${DEFAULT_TENANT_ID}', 'system:setting:list', 'system', 'setting', 'list', 'List system settings', 'View system settings'),
          ('perm-setting-create-old', '${DEFAULT_TENANT_ID}', 'system:setting:create', 'system', 'setting', 'create', 'Create system settings', 'Create system settings'),
          ('perm-setting-update-old', '${DEFAULT_TENANT_ID}', 'system:setting:update', 'system', 'setting', 'update', 'Update system settings', 'Update system settings');

        insert into menus (
          id, tenant_id, parent_id, type, code, name, path, component, icon, sort, is_visible, status, permission_code
        ) values (
          'menu-setting-old',
          '${DEFAULT_TENANT_ID}',
          null,
          'menu',
          'system-settings',
          'Settings',
          '/system/settings',
          'system/settings/index',
          'tool',
          17,
          true,
          'active',
          'system:setting:list'
        );
      `)

      await seedDefaultAuthData(
        db,
        {},
        {
          reconcileSeedLabels: true,
        },
      )

      const settingPermissions = await db
        .select({
          code: permissions.code,
          name: permissions.name,
          description: permissions.description,
        })
        .from(permissions)
        .where(
          and(
            eq(permissions.tenantId, DEFAULT_TENANT_ID),
            inArray(permissions.code, [
              "system:setting:list",
              "system:setting:create",
              "system:setting:update",
            ]),
          ),
        )
        .orderBy(permissions.code)
      const [menuEntry] = await db
        .select({
          name: menus.name,
        })
        .from(menus)
        .where(
          and(
            eq(menus.tenantId, DEFAULT_TENANT_ID),
            eq(menus.code, "system-settings"),
          ),
        )

      expect(settingPermissions).toEqual(
        expect.arrayContaining([
          {
            code: "system:setting:list",
            name: "List config entries",
            description: "View configuration entries",
          },
          {
            code: "system:setting:create",
            name: "Create config entries",
            description: "Create configuration entries",
          },
          {
            code: "system:setting:update",
            name: "Update config entries",
            description: "Update configuration entries",
          },
        ]),
      )
      expect(menuEntry).toEqual({
        name: "Config Entries",
      })
    })
  }, 15000)
})

async function createSeedReconcileTestDb() {
  const client = new PGlite()
  await client.exec(seedReconcileTestSchemaSql)
  const db = createPgliteTestDatabaseClient(client)

  await client.exec(`
    insert into tenants (id, code, name, status)
    values ('${DEFAULT_TENANT_ID}', 'default', 'Default Tenant', 'active');
  `)

  return { client, db }
}

function createPgliteTestDatabaseClient(client: PGlite): DatabaseClient {
  const db: PgliteTestDatabaseClient = drizzle<Record<string, never>>(client)
  return db as PgliteTestDatabaseClient & DatabaseClient
}

async function withSeedReconcileTestDb(
  run: (
    context: Awaited<ReturnType<typeof createSeedReconcileTestDb>>,
  ) => Promise<void>,
) {
  const context = await createSeedReconcileTestDb()

  try {
    await run(context)
  } finally {
    await context.client.close()
  }
}

const seedReconcileTestSchemaSql = `
create table tenants (
  id text primary key,
  code text not null unique,
  name text not null,
  status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table roles (
  id text primary key,
  tenant_id text not null,
  code text not null,
  name text not null,
  description text,
  status text not null default 'active',
  is_system boolean not null default false,
  data_scope smallint not null default 1,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, code)
);

create table permissions (
  id text primary key,
  tenant_id text not null,
  code text not null,
  module text not null,
  resource text not null,
  action text not null,
  name text not null,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, code)
);

create table menus (
  id text primary key,
  tenant_id text not null,
  parent_id text,
  type text not null,
  code text not null,
  name text not null,
  path text,
  component text,
  icon text,
  sort integer not null default 0,
  is_visible boolean not null default true,
  status text not null default 'active',
  permission_code text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, code)
);

create table departments (
  id text primary key,
  tenant_id text not null,
  parent_id text,
  code text not null,
  name text not null,
  ancestors text not null default '',
  sort integer not null default 0,
  status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, code)
);

create table posts (
  id text primary key,
  tenant_id text not null,
  code text not null,
  name text not null,
  sort integer not null default 0,
  status text not null default 'active',
  remark text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, code)
);

create table dictionary_types (
  id text primary key,
  tenant_id text not null,
  code text not null,
  name text not null,
  description text,
  status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, code)
);

create table dictionary_items (
  id text primary key,
  tenant_id text not null,
  type_id text not null,
  value text not null,
  label text not null,
  sort integer not null default 0,
  is_default boolean not null default false,
  status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (type_id, value)
);

create table users (
  id text primary key,
  tenant_id text not null,
  username text not null,
  display_name text not null,
  email text,
  phone text,
  password_hash text not null,
  status text not null default 'active',
  is_super_admin boolean not null default false,
  login_failure_count smallint not null default 0,
  last_login_failed_at timestamp with time zone,
  login_locked_until timestamp with time zone,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (tenant_id, username)
);

create table user_roles (
  user_id text not null,
  role_id text not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, role_id)
);

create table role_permissions (
  role_id text not null,
  permission_id text not null,
  created_at timestamp with time zone not null default now(),
  unique (role_id, permission_id)
);

create table role_menus (
  role_id text not null,
  menu_id text not null,
  created_at timestamp with time zone not null default now(),
  unique (role_id, menu_id)
);
`
