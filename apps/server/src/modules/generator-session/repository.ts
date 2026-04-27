import type { GenerationPreviewReport } from "@elysian/generator"

export type GeneratorPreviewSessionSourceType = "registered-schema"
export type GeneratorPreviewSessionStatus = "ready"

export interface GeneratorPreviewSessionRecord {
  id: string
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  conflictStrategy: "skip" | "overwrite" | "overwrite-generated-only" | "fail"
  createdAt: string
  frontendTarget: "vue" | "react"
  hasBlockingConflicts: boolean
  outputDir: string
  previewFileCount: number
  reportPath: string
  schemaName: string
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
  sourceType: GeneratorPreviewSessionSourceType
  sourceValue: string
  status?: GeneratorPreviewSessionStatus
  targetPreset: GeneratorPreviewSessionRecord["targetPreset"]
  tenantId?: string | null
}

export interface GeneratorSessionRepository {
  createPreviewSession: (
    input: CreateGeneratorPreviewSessionInput,
  ) => Promise<GeneratorPreviewSessionDetail>
  getPreviewSessionById: (
    id: string,
  ) => Promise<GeneratorPreviewSessionDetail | null>
  listPreviewSessions: () => Promise<GeneratorPreviewSessionRecord[]>
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
          conflictStrategy: input.conflictStrategy,
          createdAt: input.createdAt,
          frontendTarget: input.frontendTarget,
          hasBlockingConflicts: input.hasBlockingConflicts,
          outputDir: input.outputDir,
          previewFileCount: input.previewFileCount,
          report: input.report,
          reportPath: input.reportPath,
          schemaName: input.schemaName,
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
    }
  }

const toPreviewSessionRecord = (
  session: GeneratorPreviewSessionDetail,
): GeneratorPreviewSessionRecord => ({
  id: session.id,
  actorDisplayName: session.actorDisplayName,
  actorUserId: session.actorUserId,
  actorUsername: session.actorUsername,
  conflictStrategy: session.conflictStrategy,
  createdAt: session.createdAt,
  frontendTarget: session.frontendTarget,
  hasBlockingConflicts: session.hasBlockingConflicts,
  outputDir: session.outputDir,
  previewFileCount: session.previewFileCount,
  reportPath: session.reportPath,
  schemaName: session.schemaName,
  sourceType: session.sourceType,
  sourceValue: session.sourceValue,
  status: session.status,
  targetPreset: session.targetPreset,
  tenantId: session.tenantId,
})
