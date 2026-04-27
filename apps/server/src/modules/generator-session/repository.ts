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
