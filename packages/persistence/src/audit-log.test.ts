import { describe, expect, it } from "bun:test"

import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"

import { insertAuditLog, listAuditLogsByFilter } from "./audit-log"
import type { DatabaseClient } from "./client"

const tenantId = "00000000-0000-0000-0000-000000000001"
type PgliteTestDatabaseClient = ReturnType<
  typeof drizzle<Record<string, never>>
>

describe("audit log persistence", () => {
  it("filters operation logs with partial string matches across daily-use fields", async () => {
    await withAuditLogTestDb(async ({ db }) => {
      await insertAuditLog(db, {
        tenantId,
        category: "auth",
        action: "login",
        actorUserId: null,
        targetType: "session",
        targetId: "session-login-1",
        result: "failure",
        requestId: "req-login-failure-1",
        ip: "127.0.0.10",
        userAgent: "browser-login-agent",
        details: {
          reason: "invalid_password",
        },
        createdAt: new Date("2026-05-05T01:00:00.000Z"),
      })
      await insertAuditLog(db, {
        tenantId,
        category: "workflow",
        action: "task_claim",
        actorUserId: null,
        targetType: "workflow_task",
        targetId: "task-expense-1",
        result: "success",
        requestId: "req-workflow-claim-1",
        ip: "127.0.0.20",
        userAgent: "workflow-agent",
        details: null,
        createdAt: new Date("2026-05-05T02:00:00.000Z"),
      })

      const requestScoped = await listAuditLogsByFilter(db, {
        category: "work",
        targetType: "workflow",
        targetId: "expense",
        requestId: "claim",
        ip: "127.0.0.2",
        userAgent: "workflow",
      })

      expect(requestScoped.items).toHaveLength(1)
      expect(requestScoped.items[0]?.action).toBe("task_claim")

      const failedLogin = await listAuditLogsByFilter(db, {
        action: "log",
        detailsReason: "invalid_password",
        requestId: "failure",
        userAgent: "login",
      })

      expect(failedLogin.items).toHaveLength(1)
      expect(failedLogin.items[0]?.category).toBe("auth")
    })
  })
})

async function createAuditLogTestDb() {
  const client = new PGlite()

  await client.exec(auditLogTestSchemaSql)

  const db = createPgliteTestDatabaseClient(client)

  await client.exec(
    `insert into tenants (id, code, name) values ('${tenantId}', 'tenant-alpha', 'Tenant Alpha')`,
  )

  return { client, db }
}

function createPgliteTestDatabaseClient(client: PGlite): DatabaseClient {
  const db: PgliteTestDatabaseClient = drizzle<Record<string, never>>(client)
  return db as PgliteTestDatabaseClient & DatabaseClient
}

async function withAuditLogTestDb(
  run: (
    context: Awaited<ReturnType<typeof createAuditLogTestDb>>,
  ) => Promise<void>,
) {
  const context = await createAuditLogTestDb()

  try {
    await run(context)
  } finally {
    await context.client.close()
  }
}

const auditLogTestSchemaSql = `
create function gen_random_uuid() returns uuid language sql as $$
  select (
    substr(md5(random()::text || clock_timestamp()::text), 1, 8) || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 4) || '-' ||
    '4' || substr(md5(random()::text || clock_timestamp()::text), 1, 3) || '-' ||
    substr('89ab', floor(random() * 4 + 1)::int, 1) || substr(md5(random()::text || clock_timestamp()::text), 1, 3) || '-' ||
    substr(md5(random()::text || clock_timestamp()::text), 1, 12)
  )::uuid;
$$;

create type tenant_status as enum ('active', 'suspended');
create type user_status as enum ('active', 'disabled');
create type audit_result as enum ('success', 'failure');

create table tenants (
  id uuid primary key default gen_random_uuid() not null,
  code text not null unique,
  name text not null,
  status tenant_status not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid() not null,
  tenant_id uuid not null references tenants(id) on delete restrict,
  username text not null,
  display_name text not null,
  password_hash text not null,
  status user_status not null default 'active',
  is_super_admin boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid() not null,
  tenant_id uuid not null references tenants(id) on delete restrict,
  category text not null,
  action text not null,
  actor_user_id uuid references users(id) on delete set null,
  target_type text,
  target_id text,
  result audit_result not null,
  request_id text,
  ip text,
  user_agent text,
  details jsonb,
  created_at timestamp with time zone not null default now()
);
`
