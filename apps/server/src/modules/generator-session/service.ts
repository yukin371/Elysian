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
import { resolveMigrationProposalFromChangePlan } from "@elysian/persistence"
import { type DatabaseChangePlanLike } from "@elysian/persistence"

import { mkdir, writeFile } from "node:fs/promises"

import { AppError } from "../../errors"
import type { AuthIdentity } from "../auth"
import type {
  GeneratorPreviewSessionDetail,
  GeneratorSessionRepository,
} from "./repository"

export interface MigrationProposalSnapshot {
  generatedAt: string
  migrationProposalResolution: ReturnType<
    typeof resolveMigrationProposalFromChangePlan
  >
  reportPath: string
  schemaName: string
  sessionId: string
  snapshotPath: string
}

interface BuildMigrationProposalSnapshotInput {
  databaseChangePlan: DatabaseChangePlanLike
  generatedAt: string
  reportPath: string
  schemaName: string
  sessionId: string
}

interface CreateGeneratorPreviewSessionInput {
  actor: AuthIdentity | null
  conflictStrategy?: WriteConflictStrategy
  frontendTarget?: FrontendTarget
  schemaName: string
  targetPreset?: GenerationTargetPreset
}

interface ApplyGeneratorPreviewSessionInput {
  actor: AuthIdentity | null
  id: string
  requestId: string | null
}

interface ReviewGeneratorPreviewSessionInput {
  actor: AuthIdentity | null
  comment?: string
  decision: "approve" | "reject"
  id: string
}

interface ConfirmGeneratorPreviewSessionInput {
  actor: AuthIdentity | null
  confirmationChecklist: string[]
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

export const buildMigrationProposalSnapshot = (
  input: BuildMigrationProposalSnapshotInput,
): MigrationProposalSnapshot => {
  const snapshotPath = input.reportPath.replace(
    /\.preview\.json$/,
    ".migration-proposal.json",
  )

  return {
    generatedAt: input.generatedAt,
    migrationProposalResolution: resolveMigrationProposalFromChangePlan(
      input.databaseChangePlan,
    ),
    reportPath: input.reportPath,
    schemaName: input.schemaName,
    sessionId: input.sessionId,
    snapshotPath,
  }
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
        if (session.status === "pending_review") {
          throw new AppError({
            code: "GENERATOR_SESSION_REVIEW_REQUIRED",
            message: "Generator session must be approved before apply",
            status: 409,
            expose: true,
            details: {
              id: session.id,
              status: session.status,
            },
          })
        }

        if (session.status === "rejected") {
          throw new AppError({
            code: "GENERATOR_SESSION_REJECTED",
            message: "Generator session has been rejected",
            status: 409,
            expose: true,
            details: {
              id: session.id,
              status: session.status,
            },
          })
        }

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

      if (session.confirmedAt === null) {
        throw new AppError({
          code: "GENERATOR_SESSION_CONFIRMATION_REQUIRED",
          message: "Generator session must be confirmed before apply",
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
      const applyEvidence = {
        sessionId: session.id,
        reportPath: session.reportPath,
        manifestPath: applyResult.manifestPath,
        appliedAt,
        actorDisplayName: input.actor?.user.displayName ?? null,
        actorUserId: input.actor?.user.id ?? null,
        actorUsername: input.actor?.user.username ?? null,
        requestId: input.requestId,
      }
      const updatedSession = await repository.markPreviewSessionApplied(
        session.id,
        {
          appliedAt,
          appliedFileCount,
          appliedByDisplayName: input.actor?.user.displayName ?? null,
          appliedByUserId: input.actor?.user.id ?? null,
          appliedByUsername: input.actor?.user.username ?? null,
          applyManifestPath: applyResult.manifestPath,
          applyRequestId: input.requestId,
          applyEvidence,
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
      const migrationProposalSnapshot = buildMigrationProposalSnapshot({
        databaseChangePlan: report.databaseChangePlan,
        generatedAt: createdAt,
        reportPath,
        schemaName: schema.name,
        sessionId,
      })

      await mkdir(reportRootDir, { recursive: true })
      await writeGenerationPreviewReport(reportPath, report)
      await writeFile(
        migrationProposalSnapshot.snapshotPath,
        `${JSON.stringify(migrationProposalSnapshot, null, 2)}\n`,
        "utf8",
      )

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
        status: "pending_review",
        targetPreset,
        tenantId: input.actor?.user.tenantId ?? null,
      })
    },
    getPreviewSessionById: (id: string) => repository.getPreviewSessionById(id),
    listPreviewSessions: () => repository.listPreviewSessions(),
    async reviewPreviewSession(
      input: ReviewGeneratorPreviewSessionInput,
    ): Promise<GeneratorPreviewSessionDetail> {
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

      if (session.status !== "pending_review") {
        throw new AppError({
          code: "GENERATOR_SESSION_REVIEW_NOT_PENDING",
          message: "Generator session is not pending review",
          status: 409,
          expose: true,
          details: {
            id: session.id,
            status: session.status,
          },
        })
      }

      const reviewedAt = now().toISOString()
      const reviewEvidence = {
        sessionId: session.id,
        reportPath: session.reportPath,
        reviewedAt,
        actorDisplayName: input.actor?.user.displayName ?? null,
        actorUserId: input.actor?.user.id ?? null,
        actorUsername: input.actor?.user.username ?? null,
        comment: input.comment?.trim() || null,
        decision: input.decision,
      }
      const reviewedSession = await repository.markPreviewSessionReviewed(
        session.id,
        {
          reviewComment: reviewEvidence.comment,
          reviewEvidence,
          reviewedAt,
          reviewedByDisplayName: input.actor?.user.displayName ?? null,
          reviewedByUserId: input.actor?.user.id ?? null,
          reviewedByUsername: input.actor?.user.username ?? null,
          status: input.decision === "approve" ? "ready" : "rejected",
        },
      )

      if (!reviewedSession) {
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

      return reviewedSession
    },
    async confirmPreviewSession(
      input: ConfirmGeneratorPreviewSessionInput,
    ): Promise<GeneratorPreviewSessionDetail> {
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
          code: "GENERATOR_SESSION_CONFIRMATION_NOT_READY",
          message: "Generator session is not ready for confirmation",
          status: 409,
          expose: true,
          details: {
            id: session.id,
            status: session.status,
          },
        })
      }

      if (session.confirmedAt !== null) {
        return session
      }

      const confirmedAt = now().toISOString()
      const confirmationEvidence = {
        sessionId: session.id,
        reportPath: session.reportPath,
        confirmedAt,
        actorDisplayName: input.actor?.user.displayName ?? null,
        actorUserId: input.actor?.user.id ?? null,
        actorUsername: input.actor?.user.username ?? null,
        checklist: input.confirmationChecklist,
      }
      const confirmedSession = await repository.markPreviewSessionConfirmed(
        session.id,
        {
          confirmedAt,
          confirmedByDisplayName: input.actor?.user.displayName ?? null,
          confirmedByUserId: input.actor?.user.id ?? null,
          confirmedByUsername: input.actor?.user.username ?? null,
          confirmationEvidence,
        },
      )

      if (!confirmedSession) {
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

      return confirmedSession
    },
  }
}
