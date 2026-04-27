import { join } from "node:path"

import {
  DEFAULT_GENERATION_TARGET,
  type FrontendTarget,
  type GenerationTargetPreset,
  type WriteConflictStrategy,
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

export interface GeneratorSessionServiceOptions {
  now?: () => Date
  reportRootDir?: string
  resolveOutputDir?: (targetPreset: GenerationTargetPreset) => string
}

export const createGeneratorSessionService = (
  repository: GeneratorSessionRepository,
  options: GeneratorSessionServiceOptions = {},
) => {
  const now = options.now ?? (() => new Date())
  const resolveOutputDir =
    options.resolveOutputDir ?? resolveTargetPresetOutputDir

  return {
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
