import { desc, eq } from "drizzle-orm"

import type { DatabaseClient } from "./client"
import {
  generatorPreviewSessions,
  type GeneratorPreviewSessionRow,
} from "./schema"

export interface CreateGeneratorPreviewSessionPersistenceInput {
  id?: string
  tenantId: string
  actorDisplayName?: string | null
  actorUserId?: string | null
  actorUsername?: string | null
  appliedAt?: Date | null
  appliedFileCount?: number | null
  appliedByDisplayName?: string | null
  appliedByUserId?: string | null
  appliedByUsername?: string | null
  applyManifestPath?: string | null
  applyRequestId?: string | null
  conflictStrategy: string
  createdAt: Date
  frontendTarget: string
  hasBlockingConflicts: boolean
  outputDir: string
  previewFileCount: number
  reportPath: string
  schemaName: string
  skippedFileCount?: number | null
  sourceType: string
  sourceValue: string
  status?: string
  targetPreset: string
}

export interface MarkGeneratorPreviewSessionAppliedPersistenceInput {
  appliedAt: Date
  appliedFileCount: number
  appliedByDisplayName: string | null
  appliedByUserId: string | null
  appliedByUsername: string | null
  applyManifestPath: string | null
  applyRequestId: string | null
  skippedFileCount: number
}

export async function insertGeneratorPreviewSession(
  db: DatabaseClient,
  input: CreateGeneratorPreviewSessionPersistenceInput,
): Promise<GeneratorPreviewSessionRow> {
  const [row] = await db
    .insert(generatorPreviewSessions)
    .values({
      id: input.id,
      tenantId: input.tenantId,
      actorDisplayName: input.actorDisplayName ?? null,
      actorUserId: input.actorUserId ?? null,
      actorUsername: input.actorUsername ?? null,
      appliedAt: input.appliedAt ?? null,
      appliedFileCount: input.appliedFileCount ?? null,
      appliedByDisplayName: input.appliedByDisplayName ?? null,
      appliedByUserId: input.appliedByUserId ?? null,
      appliedByUsername: input.appliedByUsername ?? null,
      applyManifestPath: input.applyManifestPath ?? null,
      applyRequestId: input.applyRequestId ?? null,
      conflictStrategy: input.conflictStrategy,
      createdAt: input.createdAt,
      frontendTarget: input.frontendTarget,
      hasBlockingConflicts: input.hasBlockingConflicts,
      outputDir: input.outputDir,
      previewFileCount: input.previewFileCount,
      reportPath: input.reportPath,
      schemaName: input.schemaName,
      skippedFileCount: input.skippedFileCount ?? null,
      sourceType: input.sourceType,
      sourceValue: input.sourceValue,
      status: input.status ?? "ready",
      targetPreset: input.targetPreset,
      updatedAt: input.createdAt,
    })
    .returning()

  if (!row) {
    throw new Error("Generator preview session insert did not return a row")
  }

  return row
}

export async function getGeneratorPreviewSessionById(
  db: DatabaseClient,
  id: string,
) {
  const rows = await db
    .select()
    .from(generatorPreviewSessions)
    .where(eq(generatorPreviewSessions.id, id))
    .limit(1)

  return rows[0] ?? null
}

export async function listGeneratorPreviewSessions(db: DatabaseClient) {
  return db
    .select()
    .from(generatorPreviewSessions)
    .orderBy(
      desc(generatorPreviewSessions.createdAt),
      desc(generatorPreviewSessions.id),
    )
}

export async function markGeneratorPreviewSessionApplied(
  db: DatabaseClient,
  id: string,
  input: MarkGeneratorPreviewSessionAppliedPersistenceInput,
) {
  const [row] = await db
    .update(generatorPreviewSessions)
    .set({
      appliedAt: input.appliedAt,
      appliedFileCount: input.appliedFileCount,
      appliedByDisplayName: input.appliedByDisplayName,
      appliedByUserId: input.appliedByUserId,
      appliedByUsername: input.appliedByUsername,
      applyManifestPath: input.applyManifestPath,
      applyRequestId: input.applyRequestId,
      skippedFileCount: input.skippedFileCount,
      status: "applied",
      updatedAt: input.appliedAt,
    })
    .where(eq(generatorPreviewSessions.id, id))
    .returning()

  return row ?? null
}
