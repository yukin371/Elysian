import { constants } from "node:fs"
import { access, readFile } from "node:fs/promises"

import type { GenerationPreviewReport } from "@elysian/generator"
import {
  type DatabaseClient,
  type GeneratorPreviewSessionRow,
  getGeneratorPreviewSessionById,
  insertGeneratorPreviewSession,
  listGeneratorPreviewSessions,
  markGeneratorPreviewSessionApplied,
  markGeneratorPreviewSessionConfirmed,
  markGeneratorPreviewSessionReviewed,
} from "@elysian/persistence"

import { AppError } from "../../errors"

export type GeneratorPreviewSessionSourceType =
  | "registered-schema"
  | "manual-schema-json"
export type GeneratorPreviewSessionStatus =
  | "pending_review"
  | "ready"
  | "rejected"
  | "applied"

const generatorPreviewSessionConflictStrategies = [
  "skip",
  "overwrite",
  "overwrite-generated-only",
  "fail",
] as const satisfies readonly GeneratorPreviewSessionRecord["conflictStrategy"][]

const generatorPreviewSessionFrontendTargets = [
  "vue",
  "react",
] as const satisfies readonly GeneratorPreviewSessionRecord["frontendTarget"][]
const generatorPreviewSessionSourceTypes = [
  "registered-schema",
  "manual-schema-json",
] as const satisfies readonly GeneratorPreviewSessionSourceType[]
const generatorPreviewSessionStatuses = [
  "pending_review",
  "ready",
  "rejected",
  "applied",
] as const satisfies readonly GeneratorPreviewSessionStatus[]
const generatorPreviewSessionTargetPresets = [
  "staging",
  "module",
  // Legacy sessions created before the staging-only preset was enforced.
  "default",
] as const satisfies readonly GeneratorPreviewSessionRecord["targetPreset"][]

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
  applyEvidence: Record<string, unknown> | null
  confirmationEvidence: Record<string, unknown> | null
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  createdAt: string
  frontendTarget: "vue" | "react"
  hasBlockingConflicts: boolean
  outputDir: string
  previewFileCount: number
  reportPath: string
  reviewComment: string | null
  reviewedAt: string | null
  reviewedByDisplayName: string | null
  reviewedByUserId: string | null
  reviewedByUsername: string | null
  reviewEvidence: Record<string, unknown> | null
  confirmedAt: string | null
  confirmedByDisplayName: string | null
  confirmedByUserId: string | null
  confirmedByUsername: string | null
  schemaName: string
  skippedFileCount: number | null
  sourceType: GeneratorPreviewSessionSourceType
  sourceValue: string
  status: GeneratorPreviewSessionStatus
  targetPreset: "staging" | "module" | "default"
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
  applyEvidence?: Record<string, unknown> | null
  conflictStrategy: GeneratorPreviewSessionRecord["conflictStrategy"]
  createdAt: string
  frontendTarget: GeneratorPreviewSessionRecord["frontendTarget"]
  hasBlockingConflicts: boolean
  id?: string
  outputDir: string
  previewFileCount: number
  report: GenerationPreviewReport
  reportPath: string
  reviewComment?: string | null
  reviewedAt?: string | null
  reviewedByDisplayName?: string | null
  reviewedByUserId?: string | null
  reviewedByUsername?: string | null
  reviewEvidence?: Record<string, unknown> | null
  confirmedAt?: string | null
  confirmedByDisplayName?: string | null
  confirmedByUserId?: string | null
  confirmedByUsername?: string | null
  confirmationEvidence?: Record<string, unknown> | null
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
  applyEvidence: Record<string, unknown> | null
  skippedFileCount: number
}

const resolvePreviewSessionLiteral = <T extends string>(
  field: string,
  value: string,
  allowedValues: readonly T[],
): T => {
  for (const allowedValue of allowedValues) {
    if (value === allowedValue) {
      return allowedValue
    }
  }

  throw new AppError({
    code: "INTERNAL_ERROR",
    message: "Generator preview session row is invalid",
    status: 500,
    expose: false,
    details: {
      field,
      value,
    },
  })
}

export interface MarkPreviewSessionReviewedInput {
  reviewComment: string | null
  reviewedAt: string
  reviewedByDisplayName: string | null
  reviewedByUserId: string | null
  reviewedByUsername: string | null
  reviewEvidence: Record<string, unknown> | null
  status: "ready" | "rejected"
}

export interface MarkPreviewSessionConfirmedInput {
  confirmedAt: string
  confirmedByDisplayName: string | null
  confirmedByUserId: string | null
  confirmedByUsername: string | null
  confirmationEvidence: Record<string, unknown> | null
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
  markPreviewSessionReviewed: (
    id: string,
    input: MarkPreviewSessionReviewedInput,
  ) => Promise<GeneratorPreviewSessionDetail | null>
  markPreviewSessionConfirmed: (
    id: string,
    input: MarkPreviewSessionConfirmedInput,
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
      applyEvidence: input.applyEvidence ?? null,
      confirmationEvidence: input.confirmationEvidence ?? null,
      conflictStrategy: input.conflictStrategy,
      createdAt: new Date(input.createdAt),
      frontendTarget: input.frontendTarget,
      hasBlockingConflicts: input.hasBlockingConflicts,
      outputDir: input.outputDir,
      previewFileCount: input.previewFileCount,
      reportPath: input.reportPath,
      reviewComment: input.reviewComment ?? null,
      reviewedAt: toOptionalDate(input.reviewedAt),
      reviewedByDisplayName: input.reviewedByDisplayName ?? null,
      reviewedByUserId: input.reviewedByUserId ?? null,
      reviewedByUsername: input.reviewedByUsername ?? null,
      reviewEvidence: input.reviewEvidence ?? null,
      confirmedAt: toOptionalDate(input.confirmedAt),
      confirmedByDisplayName: input.confirmedByDisplayName ?? null,
      confirmedByUserId: input.confirmedByUserId ?? null,
      confirmedByUsername: input.confirmedByUsername ?? null,
      schemaName: input.schemaName,
      skippedFileCount: input.skippedFileCount ?? null,
      sourceType: input.sourceType,
      sourceValue: input.sourceValue,
      status: input.status ?? "pending_review",
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

    try {
      return await mapPreviewSessionDetailRow(row)
    } catch (error) {
      if (isMissingPreviewReportError(error)) {
        return null
      }

      throw error
    }
  },
  async listPreviewSessions() {
    const rows = await listGeneratorPreviewSessions(db)
    const sessions = await Promise.all(
      rows.map(async (row) => {
        if (!(await hasPreviewReportFile(row.reportPath))) {
          return null
        }

        return mapPreviewSessionRow(row)
      }),
    )

    return sessions.filter(
      (session): session is GeneratorPreviewSessionRecord => session !== null,
    )
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
      applyEvidence: input.applyEvidence,
      skippedFileCount: input.skippedFileCount,
    })

    return row ? mapPreviewSessionDetailRow(row) : null
  },
  async markPreviewSessionReviewed(id, input) {
    const row = await markGeneratorPreviewSessionReviewed(db, id, {
      reviewComment: input.reviewComment,
      reviewedAt: new Date(input.reviewedAt),
      reviewedByDisplayName: input.reviewedByDisplayName,
      reviewedByUserId: input.reviewedByUserId,
      reviewedByUsername: input.reviewedByUsername,
      reviewEvidence: input.reviewEvidence,
      status: input.status,
    })

    return row ? mapPreviewSessionDetailRow(row) : null
  },
  async markPreviewSessionConfirmed(id, input) {
    const row = await markGeneratorPreviewSessionConfirmed(db, id, {
      confirmedAt: new Date(input.confirmedAt),
      confirmedByDisplayName: input.confirmedByDisplayName,
      confirmedByUserId: input.confirmedByUserId,
      confirmedByUsername: input.confirmedByUsername,
      confirmationEvidence: input.confirmationEvidence,
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
          applyEvidence: input.applyEvidence ?? null,
          conflictStrategy: input.conflictStrategy,
          createdAt: input.createdAt,
          frontendTarget: input.frontendTarget,
          hasBlockingConflicts: input.hasBlockingConflicts,
          outputDir: input.outputDir,
          previewFileCount: input.previewFileCount,
          report: input.report,
          reportPath: input.reportPath,
          reviewComment: input.reviewComment ?? null,
          reviewedAt: input.reviewedAt ?? null,
          reviewedByDisplayName: input.reviewedByDisplayName ?? null,
          reviewedByUserId: input.reviewedByUserId ?? null,
          reviewedByUsername: input.reviewedByUsername ?? null,
          reviewEvidence: input.reviewEvidence ?? null,
          confirmedAt: input.confirmedAt ?? null,
          confirmedByDisplayName: input.confirmedByDisplayName ?? null,
          confirmedByUserId: input.confirmedByUserId ?? null,
          confirmedByUsername: input.confirmedByUsername ?? null,
          confirmationEvidence: input.confirmationEvidence ?? null,
          schemaName: input.schemaName,
          skippedFileCount: input.skippedFileCount ?? null,
          sourceType: input.sourceType,
          sourceValue: input.sourceValue,
          status: input.status ?? "pending_review",
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
      async markPreviewSessionReviewed(id, input) {
        const current = sessions.get(id)
        if (!current) {
          return null
        }

        const updated: GeneratorPreviewSessionDetail = {
          ...current,
          reviewComment: input.reviewComment,
          reviewedAt: input.reviewedAt,
          reviewedByDisplayName: input.reviewedByDisplayName,
          reviewedByUserId: input.reviewedByUserId,
          reviewedByUsername: input.reviewedByUsername,
          status: input.status,
        }

        sessions.set(id, updated)
        return updated
      },
      async markPreviewSessionConfirmed(id, input) {
        const current = sessions.get(id)
        if (!current) {
          return null
        }

        const updated: GeneratorPreviewSessionDetail = {
          ...current,
          confirmedAt: input.confirmedAt,
          confirmedByDisplayName: input.confirmedByDisplayName,
          confirmedByUserId: input.confirmedByUserId,
          confirmedByUsername: input.confirmedByUsername,
          confirmationEvidence: input.confirmationEvidence,
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
  applyEvidence: session.applyEvidence ?? null,
  conflictStrategy: session.conflictStrategy,
  createdAt: session.createdAt,
  frontendTarget: session.frontendTarget,
  hasBlockingConflicts: session.hasBlockingConflicts,
  outputDir: session.outputDir,
  previewFileCount: session.previewFileCount,
  reportPath: session.reportPath,
  reviewComment: session.reviewComment,
  reviewedAt: session.reviewedAt,
  reviewedByDisplayName: session.reviewedByDisplayName,
  reviewedByUserId: session.reviewedByUserId,
  reviewedByUsername: session.reviewedByUsername,
  reviewEvidence: session.reviewEvidence ?? null,
  confirmedAt: session.confirmedAt,
  confirmedByDisplayName: session.confirmedByDisplayName,
  confirmedByUserId: session.confirmedByUserId,
  confirmedByUsername: session.confirmedByUsername,
  confirmationEvidence: session.confirmationEvidence ?? null,
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
  applyEvidence: row.applyEvidence ?? null,
  conflictStrategy: resolvePreviewSessionLiteral(
    "conflictStrategy",
    row.conflictStrategy,
    generatorPreviewSessionConflictStrategies,
  ),
  createdAt: row.createdAt.toISOString(),
  frontendTarget: resolvePreviewSessionLiteral(
    "frontendTarget",
    row.frontendTarget,
    generatorPreviewSessionFrontendTargets,
  ),
  hasBlockingConflicts: row.hasBlockingConflicts,
  outputDir: row.outputDir,
  previewFileCount: row.previewFileCount,
  reportPath: row.reportPath,
  reviewComment: row.reviewComment,
  reviewedAt: row.reviewedAt?.toISOString() ?? null,
  reviewedByDisplayName: row.reviewedByDisplayName,
  reviewedByUserId: row.reviewedByUserId,
  reviewedByUsername: row.reviewedByUsername,
  reviewEvidence: row.reviewEvidence ?? null,
  confirmedAt: row.confirmedAt?.toISOString() ?? null,
  confirmedByDisplayName: row.confirmedByDisplayName,
  confirmedByUserId: row.confirmedByUserId,
  confirmedByUsername: row.confirmedByUsername,
  confirmationEvidence: row.confirmationEvidence ?? null,
  schemaName: row.schemaName,
  skippedFileCount: row.skippedFileCount,
  sourceType: resolvePreviewSessionLiteral(
    "sourceType",
    row.sourceType,
    generatorPreviewSessionSourceTypes,
  ),
  sourceValue: row.sourceValue,
  status: resolvePreviewSessionLiteral(
    "status",
    row.status,
    generatorPreviewSessionStatuses,
  ),
  targetPreset: resolvePreviewSessionLiteral(
    "targetPreset",
    row.targetPreset,
    generatorPreviewSessionTargetPresets,
  ),
  tenantId: row.tenantId,
})

const mapPreviewSessionDetailRow = async (
  row: GeneratorPreviewSessionRow,
): Promise<GeneratorPreviewSessionDetail> => ({
  ...mapPreviewSessionRow(row),
  report: await readPreviewReport(row.reportPath),
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

export const isMissingPreviewReportError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return (
      error.codeKey === "GENERATOR_SESSION_REPORT_READ_FAILED" &&
      typeof error.details?.reason === "string" &&
      error.details.reason.includes("ENOENT")
    )
  }

  return (
    isRecord(error) && error.code === "ENOENT" && typeof error.path === "string"
  )
}

const hasPreviewReportFile = async (reportPath: string): Promise<boolean> => {
  try {
    await access(reportPath, constants.F_OK)
    return true
  } catch (error) {
    if (isMissingPreviewReportError(error)) {
      return false
    }

    throw error
  }
}

const isSqlPreview = (value: unknown) =>
  isRecord(value) &&
  typeof value.dialect === "string" &&
  typeof value.tableName === "string" &&
  typeof value.contents === "string"

const isPreviewReport = (value: unknown): value is GenerationPreviewReport => {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.schemaName === "string" &&
    typeof value.generatedAt === "string" &&
    typeof value.outputDir === "string" &&
    typeof value.frontendTarget === "string" &&
    typeof value.targetPreset === "string" &&
    typeof value.conflictStrategy === "string" &&
    Array.isArray(value.files) &&
    isRecord(value.databaseChangePlan) &&
    isSqlPreview(value.sqlPreview)
  )
}

const readPreviewReport = async (
  reportPath: string,
): Promise<GenerationPreviewReport> => {
  try {
    const report: unknown = JSON.parse(await readFile(reportPath, "utf8"))

    if (!isPreviewReport(report)) {
      throw new Error("Malformed generator preview report payload")
    }

    return report
  } catch (error) {
    throw new AppError({
      code: "GENERATOR_SESSION_REPORT_READ_FAILED",
      message: "Generator session report read failed",
      status: 500,
      expose: true,
      details: {
        reportPath,
        reason: error instanceof Error ? error.message : String(error),
      },
      cause: error,
    })
  }
}

const toOptionalDate = (value?: string | null) =>
  value ? new Date(value) : null
