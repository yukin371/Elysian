import { readFile } from "node:fs/promises"

import {
  type DatabaseClient,
  getGeneratorPreviewSessionById,
  insertGeneratorPreviewSession,
  listGeneratorPreviewSessions,
  markGeneratorPreviewSessionApplied,
  type GeneratorPreviewSessionRow,
} from "@elysian/persistence"
import type { GenerationPreviewReport } from "@elysian/generator"

export type GeneratorPreviewSessionSourceType = "registered-schema"
export type GeneratorPreviewSessionStatus = "ready" | "applied"

export interface GeneratorPreviewSessionRecord {
  id: string
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  appliedAt: string | null
  appliedFileCount: number | null
  appliedByDisplayName: string | null
  appliedByUserId: string | null
  appliedByUsername: string | null
  applyManifestPath: string | null
  applyRequestId: string | null
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  createdAt: string
  frontendTarget: "vue" | "react"
  hasBlockingConflicts: boolean
  outputDir: string
  previewFileCount: number
  reportPath: string
  schemaName: string
  skippedFileCount: number | null
  sourceType: GeneratorPreviewSessionSourceType
  sourceValue: string
  status: GeneratorPreviewSessionStatus
  targetPreset: "staging"
  tenantId: string | null
}

export interface GeneratorPreviewSessionDetail
  extends GeneratorPreviewSessionRecord {
  report: GenerationPreviewReport
}

export interface CreateGeneratorPreviewSessionInput {
  actorDisplayName?: string | null
  actorUserId?: string | null
  actorUsername?: string | null
  appliedAt?: string | null
  appliedFileCount?: number | null
  appliedByDisplayName?: string | null
  appliedByUserId?: string | null
  appliedByUsername?: string | null
  applyManifestPath?: string | null
  applyRequestId?: string | null
  conflictStrategy: GeneratorPreviewSessionRecord["conflictStrategy"]
  createdAt: string
  frontendTarget: GeneratorPreviewSessionRecord["frontendTarget"]
  hasBlockingConflicts: boolean
  id?: string
  outputDir: string
  previewFileCount: number
  report: GenerationPreviewReport
  reportPath: string
  schemaName: string
  skippedFileCount?: number | null
  sourceType: GeneratorPreviewSessionSourceType
  sourceValue: string
  status?: GeneratorPreviewSessionStatus
  targetPreset: GeneratorPreviewSessionRecord["targetPreset"]
  tenantId?: string | null
}

export interface MarkPreviewSessionAppliedInput {
  appliedAt: string
  appliedFileCount: number
  appliedByDisplayName: string | null
  appliedByUserId: string | null
  appliedByUsername: string | null
  applyManifestPath: string | null
  applyRequestId: string | null
  skippedFileCount: number
}

export interface GeneratorSessionRepository {
  createPreviewSession: (
    input: CreateGeneratorPreviewSessionInput,
  ) => Promise<GeneratorPreviewSessionDetail>
  getPreviewSessionById: (
    id: string,
  ) => Promise<GeneratorPreviewSessionDetail | null>
  listPreviewSessions: () => Promise<GeneratorPreviewSessionRecord[]>
  markPreviewSessionApplied: (
    id: string,
    input: MarkPreviewSessionAppliedInput,
  ) => Promise<GeneratorPreviewSessionDetail | null>
}

export const createGeneratorSessionRepository = (
  db: DatabaseClient,
): GeneratorSessionRepository => ({
  async createPreviewSession(input) {
    if (!input.tenantId) {
      throw new Error(
        "Persistent generator preview sessions require a tenant id",
      )
    }

    const row = await insertGeneratorPreviewSession(db, {
      id: input.id,
      tenantId: input.tenantId,
      actorDisplayName: input.actorDisplayName ?? null,
      actorUserId: input.actorUserId ?? null,
      actorUsername: input.actorUsername ?? null,
      appliedAt: toOptionalDate(input.appliedAt),
      appliedFileCount: input.appliedFileCount ?? null,
      appliedByDisplayName: input.appliedByDisplayName ?? null,
      appliedByUserId: input.appliedByUserId ?? null,
      appliedByUsername: input.appliedByUsername ?? null,
      applyManifestPath: input.applyManifestPath ?? null,
      applyRequestId: input.applyRequestId ?? null,
      conflictStrategy: input.conflictStrategy,
      createdAt: new Date(input.createdAt),
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
    })

    return {
      ...mapPreviewSessionRow(row),
      report: input.report,
    }
  },
  async getPreviewSessionById(id) {
    const row = await getGeneratorPreviewSessionById(db, id)
    if (!row) {
      return null
    }

    return mapPreviewSessionDetailRow(row)
  },
  async listPreviewSessions() {
    const rows = await listGeneratorPreviewSessions(db)
    return rows.map(mapPreviewSessionRow)
  },
  async markPreviewSessionApplied(id, input) {
    const row = await markGeneratorPreviewSessionApplied(db, id, {
      appliedAt: new Date(input.appliedAt),
      appliedFileCount: input.appliedFileCount,
      appliedByDisplayName: input.appliedByDisplayName,
      appliedByUserId: input.appliedByUserId,
      appliedByUsername: input.appliedByUsername,
      applyManifestPath: input.applyManifestPath,
      applyRequestId: input.applyRequestId,
      skippedFileCount: input.skippedFileCount,
    })

    return row ? mapPreviewSessionDetailRow(row) : null
  },
})

export const createInMemoryGeneratorSessionRepository =
  (): GeneratorSessionRepository => {
    const sessions = new Map<string, GeneratorPreviewSessionDetail>()

    return {
      async createPreviewSession(input) {
        const session: GeneratorPreviewSessionDetail = {
          id: input.id ?? crypto.randomUUID(),
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
          report: input.report,
          reportPath: input.reportPath,
          schemaName: input.schemaName,
          skippedFileCount: input.skippedFileCount ?? null,
          sourceType: input.sourceType,
          sourceValue: input.sourceValue,
          status: input.status ?? "ready",
          targetPreset: input.targetPreset,
          tenantId: input.tenantId ?? null,
        }

        sessions.set(session.id, session)
        return session
      },
      async getPreviewSessionById(id) {
        return sessions.get(id) ?? null
      },
      async listPreviewSessions() {
        return [...sessions.values()]
          .map((session) => toPreviewSessionRecord(session))
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      },
      async markPreviewSessionApplied(id, input) {
        const current = sessions.get(id)
        if (!current) {
          return null
        }

        const updated: GeneratorPreviewSessionDetail = {
          ...current,
          appliedAt: input.appliedAt,
          appliedFileCount: input.appliedFileCount,
          appliedByDisplayName: input.appliedByDisplayName,
          appliedByUserId: input.appliedByUserId,
          appliedByUsername: input.appliedByUsername,
          applyManifestPath: input.applyManifestPath,
          applyRequestId: input.applyRequestId,
          skippedFileCount: input.skippedFileCount,
          status: "applied",
        }

        sessions.set(id, updated)
        return updated
      },
    }
  }

const toPreviewSessionRecord = (
  session: GeneratorPreviewSessionDetail,
): GeneratorPreviewSessionRecord => ({
  id: session.id,
  actorDisplayName: session.actorDisplayName,
  actorUserId: session.actorUserId,
  actorUsername: session.actorUsername,
  appliedAt: session.appliedAt,
  appliedFileCount: session.appliedFileCount,
  appliedByDisplayName: session.appliedByDisplayName,
  appliedByUserId: session.appliedByUserId,
  appliedByUsername: session.appliedByUsername,
  applyManifestPath: session.applyManifestPath,
  applyRequestId: session.applyRequestId,
  conflictStrategy: session.conflictStrategy,
  createdAt: session.createdAt,
  frontendTarget: session.frontendTarget,
  hasBlockingConflicts: session.hasBlockingConflicts,
  outputDir: session.outputDir,
  previewFileCount: session.previewFileCount,
  reportPath: session.reportPath,
  schemaName: session.schemaName,
  skippedFileCount: session.skippedFileCount,
  sourceType: session.sourceType,
  sourceValue: session.sourceValue,
  status: session.status,
  targetPreset: session.targetPreset,
  tenantId: session.tenantId,
})

const mapPreviewSessionRow = (
  row: GeneratorPreviewSessionRow,
): GeneratorPreviewSessionRecord => ({
  id: row.id,
  actorDisplayName: row.actorDisplayName,
  actorUserId: row.actorUserId,
  actorUsername: row.actorUsername,
  appliedAt: row.appliedAt?.toISOString() ?? null,
  appliedFileCount: row.appliedFileCount,
  appliedByDisplayName: row.appliedByDisplayName,
  appliedByUserId: row.appliedByUserId,
  appliedByUsername: row.appliedByUsername,
  applyManifestPath: row.applyManifestPath,
  applyRequestId: row.applyRequestId,
  conflictStrategy: row.conflictStrategy as GeneratorPreviewSessionRecord["conflictStrategy"],
  createdAt: row.createdAt.toISOString(),
  frontendTarget: row.frontendTarget as GeneratorPreviewSessionRecord["frontendTarget"],
  hasBlockingConflicts: row.hasBlockingConflicts,
  outputDir: row.outputDir,
  previewFileCount: row.previewFileCount,
  reportPath: row.reportPath,
  schemaName: row.schemaName,
  skippedFileCount: row.skippedFileCount,
  sourceType: row.sourceType as GeneratorPreviewSessionSourceType,
  sourceValue: row.sourceValue,
  status: row.status as GeneratorPreviewSessionStatus,
  targetPreset: row.targetPreset as GeneratorPreviewSessionRecord["targetPreset"],
  tenantId: row.tenantId,
})

const mapPreviewSessionDetailRow = async (
  row: GeneratorPreviewSessionRow,
): Promise<GeneratorPreviewSessionDetail> => ({
  ...mapPreviewSessionRow(row),
  report: await readPreviewReport(row.reportPath),
})

const readPreviewReport = async (
  reportPath: string,
): Promise<GenerationPreviewReport> =>
  JSON.parse(await readFile(reportPath, "utf8")) as GenerationPreviewReport

const toOptionalDate = (value?: string | null) =>
  value ? new Date(value) : null
