import { join } from "node:path"

import {
  type AppliedGenerationPreviewReport,
  DEFAULT_GENERATION_TARGET,
  type FrontendTarget,
  type GenerationTargetPreset,
  type PreviewReportApplyError,
  type WriteConflictStrategy,
  applyGenerationPreviewReport,
  buildGenerationPreviewReport,
  getRegisteredSchema,
  resolveTargetPresetOutputDir,
  writeGenerationPreviewReport,
} from "@elysian/generator"

import { AppError } from "../../errors"
import type { AuthIdentity } from "../auth"
import type {
  GeneratorPreviewSessionDetail,
  GeneratorSessionRepository,
} from "./repository"

interface CreateGeneratorPreviewSessionInput {
  actor: AuthIdentity | null
  conflictStrategy?: WriteConflictStrategy
  frontendTarget?: FrontendTarget
  schemaName: string
  targetPreset?: GenerationTargetPreset
}

interface ApplyGeneratorPreviewSessionInput {
  id: string
}

export interface GeneratorSessionServiceOptions {
  now?: () => Date
  reportRootDir?: string
  resolveOutputDir?: (targetPreset: GenerationTargetPreset) => string
}

const isPreviewApplyError = (
  error: unknown,
): error is PreviewReportApplyError =>
  typeof error === "object" &&
  error !== null &&
  "name" in error &&
  error.name === "PreviewReportApplyError" &&
  "code" in error &&
  typeof error.code === "string"

const toApplyConflictError = (
  session: GeneratorPreviewSessionDetail,
  error: PreviewReportApplyError,
): AppError => {
  if (error.code === "PREVIEW_REPORT_STALE") {
    return new AppError({
      code: "GENERATOR_SESSION_STALE",
      message: "Generator preview session is stale",
      status: 409,
      expose: true,
      details: {
        id: session.id,
        outputDir: session.outputDir,
        reason: error.message,
      },
    })
  }

  return new AppError({
    code: "GENERATOR_SESSION_APPLY_CONFLICT",
    message: "Generator preview session cannot be applied",
    status: 409,
    expose: true,
    details: {
      id: session.id,
      outputDir: session.outputDir,
      reason: error.message,
    },
  })
}

export const createGeneratorSessionService = (
  repository: GeneratorSessionRepository,
  options: GeneratorSessionServiceOptions = {},
) => {
  const now = options.now ?? (() => new Date())
  const resolveOutputDir =
    options.resolveOutputDir ?? resolveTargetPresetOutputDir

  return {
    async applyPreviewSession(
      input: ApplyGeneratorPreviewSessionInput,
    ): Promise<
      GeneratorPreviewSessionDetail & {
        applyResult: AppliedGenerationPreviewReport
      }
    > {
      const session = await repository.getPreviewSessionById(input.id)
      if (!session) {
        throw new AppError({
          code: "GENERATOR_SESSION_NOT_FOUND",
          message: "Generator session not found",
          status: 404,
          expose: true,
          details: {
            id: input.id,
          },
        })
      }

      if (session.status !== "ready") {
        throw new AppError({
          code: "GENERATOR_SESSION_NOT_READY",
          message: "Generator session is not ready for apply",
          status: 409,
          expose: true,
          details: {
            id: session.id,
            status: session.status,
          },
        })
      }

      if (session.hasBlockingConflicts) {
        throw new AppError({
          code: "GENERATOR_SESSION_BLOCKING_CONFLICTS",
          message: "Generator session still has blocking conflicts",
          status: 409,
          expose: true,
          details: {
            id: session.id,
            conflictStrategy: session.conflictStrategy,
          },
        })
      }

      let applyResult: AppliedGenerationPreviewReport

      try {
        applyResult = await applyGenerationPreviewReport(session.report)
      } catch (error) {
        if (isPreviewApplyError(error)) {
          throw toApplyConflictError(session, error)
        }

        throw error
      }

      const appliedAt = now().toISOString()
      const appliedFileCount = applyResult.files.filter(
        (file) => file.written,
      ).length
      const skippedFileCount = applyResult.files.length - appliedFileCount
      const updatedSession = await repository.markPreviewSessionApplied(
        session.id,
        {
          appliedAt,
          appliedFileCount,
          applyManifestPath: applyResult.manifestPath,
          skippedFileCount,
        },
      )

      if (!updatedSession) {
        throw new AppError({
          code: "GENERATOR_SESSION_NOT_FOUND",
          message: "Generator session not found",
          status: 404,
          expose: true,
          details: {
            id: session.id,
          },
        })
      }

      return {
        ...updatedSession,
        applyResult,
      }
    },
    async createPreviewSession(
      input: CreateGeneratorPreviewSessionInput,
    ): Promise<GeneratorPreviewSessionDetail> {
      const schema = getRegisteredSchema(input.schemaName)
      if (!schema) {
        throw new AppError({
          code: "GENERATOR_SCHEMA_NOT_FOUND",
          message: "Generator schema not found",
          status: 404,
          expose: true,
          details: {
            schemaName: input.schemaName,
          },
        })
      }

      const targetPreset = input.targetPreset ?? DEFAULT_GENERATION_TARGET
      const frontendTarget = input.frontendTarget ?? "vue"
      const conflictStrategy = input.conflictStrategy ?? "fail"
      const outputDir = resolveOutputDir(targetPreset)
      const createdAt = now().toISOString()
      const sessionId = crypto.randomUUID()
      const reportRootDir =
        options.reportRootDir ??
        join(outputDir, "reports", "generator-sessions")
      const reportPath = join(reportRootDir, `${sessionId}.preview.json`)
      const report = await buildGenerationPreviewReport(schema, {
        outputDir,
        frontendTarget,
        conflictStrategy,
        targetPreset,
      })

      await writeGenerationPreviewReport(reportPath, report)

      return repository.createPreviewSession({
        id: sessionId,
        actorDisplayName: input.actor?.user.displayName ?? null,
        actorUserId: input.actor?.user.id ?? null,
        actorUsername: input.actor?.user.username ?? null,
        conflictStrategy,
        createdAt,
        frontendTarget,
        hasBlockingConflicts: report.files.some(
          (file) => file.plannedAction === "block",
        ),
        outputDir,
        previewFileCount: report.files.length,
        report,
        reportPath,
        schemaName: schema.name,
        sourceType: "registered-schema",
        sourceValue: schema.name,
        targetPreset,
        tenantId: input.actor?.user.tenantId ?? null,
      })
    },
    getPreviewSessionById: (id: string) => repository.getPreviewSessionById(id),
    listPreviewSessions: () => repository.listPreviewSessions(),
  }
}
