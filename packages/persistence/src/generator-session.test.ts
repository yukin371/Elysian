import { describe, expect, it } from "bun:test"
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"

import type { DatabaseClient } from "./client"
import {
  getGeneratorPreviewSessionById,
  insertGeneratorPreviewSession,
  listGeneratorPreviewSessions,
  markGeneratorPreviewSessionApplied,
} from "./generator-session"
import { insertTenant } from "./tenant"

const tenantAlphaId = "00000000-0000-0000-0000-000000000001"
const tenantBetaId = "00000000-0000-0000-0000-000000000002"

describe("generator preview session persistence", () => {
  it("persists preview metadata and lists newest sessions first", async () => {
    await withGeneratorSessionTestDb(async ({ db, client }) => {
      const older = await insertGeneratorPreviewSession(db, {
        id: "11111111-1111-4111-8111-111111111111",
        tenantId: tenantAlphaId,
        actorDisplayName: "Alpha Admin",
        actorUserId: "22222222-2222-4222-8222-222222222222",
        actorUsername: "alpha-admin",
        conflictStrategy: "fail",
        createdAt: new Date("2026-04-27T09:00:00.000Z"),
        frontendTarget: "vue",
        hasBlockingConflicts: true,
        outputDir: "E:/generated",
        previewFileCount: 2,
        reportPath: "E:/generated/reports/older.preview.json",
        schemaName: "customer",
        sourceType: "registered-schema",
        sourceValue: "customer",
        targetPreset: "staging",
      })
      const newer = await insertGeneratorPreviewSession(db, {
        id: "33333333-3333-4333-8333-333333333333",
        tenantId: tenantBetaId,
        actorDisplayName: "Beta Admin",
        actorUserId: "44444444-4444-4444-8444-444444444444",
        actorUsername: "beta-admin",
        conflictStrategy: "overwrite-generated-only",
        createdAt: new Date("2026-04-27T10:00:00.000Z"),
        frontendTarget: "react",
        hasBlockingConflicts: false,
        outputDir: "E:/generated-beta",
        previewFileCount: 4,
        reportPath: "E:/generated/reports/newer.preview.json",
        schemaName: "notification",
        sourceType: "registered-schema",
        sourceValue: "notification",
        targetPreset: "staging",
      })

      await setSessionCreatedAt(
        client,
        older.id,
        "2026-04-27T09:00:00.000Z",
      )
      await setSessionCreatedAt(
        client,
        newer.id,
        "2026-04-27T10:00:00.000Z",
      )

      const rows = await listGeneratorPreviewSessions(db)

      expect(rows.map((row) => row.id)).toEqual([newer.id, older.id])
      expect(rows[0]?.reportPath).toBe("E:/generated/reports/newer.preview.json")
      expect(rows[1]?.hasBlockingConflicts).toBe(true)
    })
  })

  it("updates apply evidence on the existing preview session", async () => {
    await withGeneratorSessionTestDb(async ({ db }) => {
      const created = await insertGeneratorPreviewSession(db, {
        id: "55555555-5555-4555-8555-555555555555",
        tenantId: tenantAlphaId,
        actorDisplayName: "Alpha Admin",
        actorUserId: "66666666-6666-4666-8666-666666666666",
        actorUsername: "alpha-admin",
        conflictStrategy: "fail",
        createdAt: new Date("2026-04-27T09:30:00.000Z"),
        frontendTarget: "vue",
        hasBlockingConflicts: false,
        outputDir: "E:/generated",
        previewFileCount: 3,
        reportPath: "E:/generated/reports/apply.preview.json",
        schemaName: "customer",
        sourceType: "registered-schema",
        sourceValue: "customer",
        targetPreset: "staging",
      })

      const updated = await markGeneratorPreviewSessionApplied(db, created.id, {
        appliedAt: new Date("2026-04-27T10:15:00.000Z"),
        appliedFileCount: 2,
        appliedByDisplayName: "Alpha Admin",
        appliedByUserId: "66666666-6666-4666-8666-666666666666",
        appliedByUsername: "alpha-admin",
        applyManifestPath: "E:/generated/manifest.json",
        applyRequestId: "req-generator-session-apply-1",
        skippedFileCount: 1,
      })

      expect(updated?.status).toBe("applied")
      expect(updated?.applyManifestPath).toBe("E:/generated/manifest.json")
      expect(updated?.appliedFileCount).toBe(2)
      expect(updated?.skippedFileCount).toBe(1)

      const persisted = await getGeneratorPreviewSessionById(db, created.id)
      expect(persisted?.appliedAt?.toISOString()).toBe("2026-04-27T10:15:00.000Z")
      expect(persisted?.applyRequestId).toBe("req-generator-session-apply-1")
      expect(persisted?.status).toBe("applied")
    })
  })
})

async function withGeneratorSessionTestDb(
  run: (
    context: Awaited<ReturnType<typeof createGeneratorSessionTestDb>>,
  ) => Promise<void>,
) {
  const context = await createGeneratorSessionTestDb()

  try {
    await run(context)
  } finally {
    await context.client.close()
  }
}

async function createGeneratorSessionTestDb() {
  const client = new PGlite()
  await client.exec(generatorSessionTestSchemaSql)
  const db = drizzle(client) as unknown as DatabaseClient

  await insertTenant(db, {
    id: tenantAlphaId,
    code: "tenant-alpha",
    name: "Tenant Alpha",
  })
  await insertTenant(db, {
    id: tenantBetaId,
    code: "tenant-beta",
    name: "Tenant Beta",
  })

  return { client, db }
}

async function setSessionCreatedAt(
  client: PGlite,
  sessionId: string,
  createdAtIso: string,
) {
  await client.exec(
    `update generator_preview_sessions set created_at = '${createdAtIso}'::timestamptz where id = '${sessionId}'`,
  )
}

const generatorSessionTestSchemaSql = `
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

create table tenants (
  id uuid primary key default gen_random_uuid() not null,
  code text not null unique,
  name text not null,
  status tenant_status not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table generator_preview_sessions (
  id uuid primary key default gen_random_uuid() not null,
  tenant_id uuid not null references tenants(id) on delete restrict,
  actor_display_name text,
  actor_user_id uuid,
  actor_username text,
  applied_at timestamp with time zone,
  applied_file_count integer,
  applied_by_display_name text,
  applied_by_user_id uuid,
  applied_by_username text,
  apply_manifest_path text,
  apply_request_id text,
  conflict_strategy text not null,
  frontend_target text not null,
  has_blocking_conflicts boolean not null default false,
  output_dir text not null,
  preview_file_count integer not null,
  report_path text not null,
  schema_name text not null,
  skipped_file_count integer,
  source_type text not null,
  source_value text not null,
  status text not null default 'ready',
  target_preset text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
`
