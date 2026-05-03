import { t } from "elysia"
import {
  resolveMigrationProposalFromChangePlan,
} from "@elysian/persistence"

import { AppError } from "../../errors"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { AuditLogWriter } from "../shared/audit-log"
import type {
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
  GeneratorSessionRepository,
} from "./repository"
import {
  type GeneratorSessionServiceOptions,
  createGeneratorSessionService,
} from "./service"

export interface GeneratorSessionModuleOptions
  extends GeneratorSessionServiceOptions {
  auditLogWriter?: AuditLogWriter
  authGuard?: AuthGuard
}

const frontendTargetSchema = t.Union([t.Literal("vue"), t.Literal("react")])
const conflictStrategySchema = t.Union([
  t.Literal("skip"),
  t.Literal("overwrite"),
  t.Literal("overwrite-generated-only"),
  t.Literal("fail"),
])
const reviewDecisionSchema = t.Union([
  t.Literal("approve"),
  t.Literal("reject"),
])

export const createGeneratorSessionModule = (
  repository: GeneratorSessionRepository,
  options: GeneratorSessionModuleOptions = {},
): ServerModule => ({
  name: "generator-session",
  register: (app, context) => {
    const service = createGeneratorSessionService(repository, options)
    const recordAuditBestEffort = async (
      headers: Headers,
      identity: AuthIdentity,
      event: {
        action: string
        details: Record<string, unknown> | null
        sessionId: string
      },
    ) => {
      if (!options.auditLogWriter) {
        return
      }

      try {
        await options.auditLogWriter({
          category: "generator",
          action: event.action,
          actorUserId: identity.user.id,
          details: event.details,
          ip: buildRequestContext(headers).ip,
          requestId: buildRequestContext(headers).requestId,
          result: "success",
          targetId: event.sessionId,
          targetType: "generator-session",
          tenantId: identity.user.tenantId,
          userAgent: buildRequestContext(headers).userAgent,
        })
      } catch (error) {
        context.logger.warn("Generator session audit log write failed", {
          action: event.action,
          targetType: "generator-session",
          targetId: event.sessionId,
          actorUserId: identity.user.id,
          tenantId: identity.user.tenantId,
          error:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : { value: String(error) },
        })
      }
    }

    const authorize = async (
      headers: Headers,
    ): Promise<AuthIdentity | undefined> => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers)
    }

    context.logger.info("Registering generator session module")

    return app
      .get(
        "/studio/generator/sessions",
        async ({ request }) => {
          await authorize(request.headers)

          return {
            items: (await service.listPreviewSessions()).map(toSessionResponse),
          }
        },
        {
          detail: {
            tags: ["generator"],
            summary: "List generator preview sessions",
          },
        },
      )
      .get(
        "/studio/generator/sessions/:id",
        async ({ params, request }) => {
          await authorize(request.headers)
          const session = await service.getPreviewSessionById(params.id)

          if (!session) {
            throw new AppError({
              code: "GENERATOR_SESSION_NOT_FOUND",
              message: "Generator session not found",
              status: 404,
              expose: true,
              details: {
                id: params.id,
              },
            })
          }

          return toSessionDetailResponse(session)
        },
        {
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          detail: {
            tags: ["generator"],
            summary: "Get generator preview session detail",
          },
        },
      )
      .post(
        "/studio/generator/sessions/preview",
        async ({ body, request, set }) => {
          const identity = (await authorize(request.headers)) ?? null
          const session = await service.createPreviewSession({
            actor: identity,
            conflictStrategy: body.conflictStrategy,
            frontendTarget: body.frontendTarget,
            schemaName: body.schemaName,
            targetPreset: body.targetPreset,
          })

          if (identity) {
            await recordAuditBestEffort(request.headers, identity, {
              action: "preview_create",
              details: {
                schemaName: session.schemaName,
                frontendTarget: session.frontendTarget,
                conflictStrategy: session.conflictStrategy,
                targetPreset: session.targetPreset,
                previewFileCount: session.previewFileCount,
                reportPath: session.reportPath,
              },
              sessionId: session.id,
            })
          }

          set.status = 201

          return {
            session: toSessionResponse(session),
            diff: buildDiffSummary(session.report),
            targetDirectoryDiff: buildTargetDirectoryDiff(session.report),
            conflictExplanations: buildConflictExplanations(session.report),
            report: session.report,
            sqlProposal: buildSqlProposal(session),
            sqlProposalHandoff: buildSqlProposalHandoff(session),
          }
        },
        {
          body: t.Object({
            schemaName: t.String({ minLength: 1 }),
            frontendTarget: t.Optional(frontendTargetSchema),
            conflictStrategy: t.Optional(conflictStrategySchema),
            targetPreset: t.Optional(t.Literal("staging")),
          }),
          detail: {
            tags: ["generator"],
            summary: "Create a generator preview session",
          },
        },
      )
      .post(
        "/studio/generator/sessions/:id/review",
        async ({ body, params, request }) => {
          const identity = (await authorize(request.headers)) ?? null
          const session = await service.reviewPreviewSession({
            actor: identity,
            comment: body.comment,
            decision: body.decision,
            id: params.id,
          })

          if (identity) {
            await recordAuditBestEffort(request.headers, identity, {
              action:
                body.decision === "approve" ? "review_approve" : "review_reject",
              details: {
                schemaName: session.schemaName,
                frontendTarget: session.frontendTarget,
                targetPreset: session.targetPreset,
                reviewComment: session.reviewComment,
                reviewStatus: session.status,
              },
              sessionId: session.id,
            })
          }

          return {
            session: toSessionResponse(session),
            diff: buildDiffSummary(session.report),
            targetDirectoryDiff: buildTargetDirectoryDiff(session.report),
            conflictExplanations: buildConflictExplanations(session.report),
            sqlProposal: buildSqlProposal(session),
            sqlProposalHandoff: buildSqlProposalHandoff(session),
          }
        },
        {
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          body: t.Object({
            decision: reviewDecisionSchema,
            comment: t.Optional(t.String()),
          }),
          detail: {
            tags: ["generator"],
            summary: "Review a generator preview session",
          },
        },
      )
      .post(
        "/studio/generator/sessions/:id/confirm",
        async ({ params, request }) => {
          const identity = (await authorize(request.headers)) ?? null
          const sessionBeforeConfirm = await service.getPreviewSessionById(
            params.id,
          )

          if (!sessionBeforeConfirm) {
            throw new AppError({
              code: "GENERATOR_SESSION_NOT_FOUND",
              message: "Generator session not found",
              status: 404,
              expose: true,
              details: {
                id: params.id,
              },
            })
          }

          const session = await service.confirmPreviewSession({
            actor: identity,
            confirmationChecklist:
              buildSqlProposalHandoff(sessionBeforeConfirm).confirmationChecklist,
            id: params.id,
          })

          if (identity) {
            await recordAuditBestEffort(request.headers, identity, {
              action: "review_confirm",
              details: {
                schemaName: session.schemaName,
                frontendTarget: session.frontendTarget,
                targetPreset: session.targetPreset,
                confirmedAt: session.confirmedAt,
              },
              sessionId: session.id,
            })
          }

          return {
            session: toSessionResponse(session),
            sqlProposalHandoff: buildSqlProposalHandoff(session),
          }
        },
        {
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          detail: {
            tags: ["generator"],
            summary: "Confirm a generator preview session checklist",
          },
        },
      )
      .post(
        "/studio/generator/sessions/:id/apply",
        async ({ params, request }) => {
          const identity = (await authorize(request.headers)) ?? null
          const requestContext = buildRequestContext(request.headers)
          const session = await service.applyPreviewSession({
            actor: identity,
            id: params.id,
            requestId: requestContext.requestId,
          })

          if (identity) {
            await recordAuditBestEffort(request.headers, identity, {
              action: "staging_apply",
              details: {
                schemaName: session.schemaName,
                frontendTarget: session.frontendTarget,
                conflictStrategy: session.conflictStrategy,
                targetPreset: session.targetPreset,
                outputDir: session.outputDir,
                reportPath: session.reportPath,
                applyManifestPath: session.applyManifestPath,
                appliedFileCount: session.appliedFileCount,
                skippedFileCount: session.skippedFileCount,
              },
              sessionId: session.id,
            })
          }

          return {
            session: toSessionResponse(session),
            diff: buildDiffSummary(session.report),
            targetDirectoryDiff: buildTargetDirectoryDiff(session.report),
            conflictExplanations: buildConflictExplanations(session.report),
            sqlProposal: buildSqlProposal(session),
            sqlProposalHandoff: buildSqlProposalHandoff(session),
            apply: {
              files: session.applyResult.files,
              evidence: buildApplyEvidence(session),
              manifestPath: session.applyResult.manifestPath,
            },
          }
        },
        {
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          detail: {
            tags: ["generator"],
            summary: "Apply a generator preview session to staging",
          },
        },
      )
  },
})

const toSessionResponse = (session: GeneratorPreviewSessionRecord) => ({
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
  applyEvidence: buildApplyEvidence(session),
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
  reviewEvidence: buildReviewEvidence(session),
  confirmedAt: session.confirmedAt,
  confirmedByDisplayName: session.confirmedByDisplayName,
  confirmedByUserId: session.confirmedByUserId,
  confirmedByUsername: session.confirmedByUsername,
  confirmationEvidence: buildConfirmationEvidence(session),
  schemaName: session.schemaName,
  skippedFileCount: session.skippedFileCount,
  sourceType: session.sourceType,
  sourceValue: session.sourceValue,
  status: session.status,
  targetPreset: session.targetPreset,
  tenantId: session.tenantId,
})

const toSessionDetailResponse = (session: GeneratorPreviewSessionDetail) => ({
  ...toSessionResponse(session),
  diffSummary: buildDiffSummary(session.report),
  targetDirectoryDiff: buildTargetDirectoryDiff(session.report),
  conflictExplanations: buildConflictExplanations(session.report),
  report: session.report,
  sqlProposal: buildSqlProposal(session),
  sqlProposalHandoff: buildSqlProposalHandoff(session),
})

const buildApplyEvidence = (session: GeneratorPreviewSessionRecord) => {
  if (session.applyEvidence != null) {
    return session.applyEvidence
  }

  if (
    session.appliedAt === null &&
    session.applyManifestPath === null &&
    session.applyRequestId === null &&
    session.appliedByUserId === null
  ) {
    return null
  }

  return {
    sessionId: session.id,
    reportPath: session.reportPath,
    manifestPath: session.applyManifestPath,
    appliedAt: session.appliedAt,
    actorDisplayName: session.appliedByDisplayName,
    actorUserId: session.appliedByUserId,
    actorUsername: session.appliedByUsername,
    requestId: session.applyRequestId,
  }
}

const buildConfirmationEvidence = (
  session: GeneratorPreviewSessionRecord,
) => {
  if (session.confirmationEvidence != null) {
    return session.confirmationEvidence
  }

  return null
}

const buildReviewEvidence = (session: GeneratorPreviewSessionRecord) => {
  if (session.reviewEvidence != null) {
    return session.reviewEvidence
  }

  if (
    session.reviewedAt === null &&
    session.reviewedByUserId === null &&
    session.reviewComment === null
  ) {
    return null
  }

  return {
    sessionId: session.id,
    reportPath: session.reportPath,
    reviewedAt: session.reviewedAt,
    actorDisplayName: session.reviewedByDisplayName,
    actorUserId: session.reviewedByUserId,
    actorUsername: session.reviewedByUsername,
    comment: session.reviewComment,
    decision: session.status === "rejected" ? "reject" : "approve",
  }
}

const buildDiffSummary = (report: GeneratorPreviewSessionDetail["report"]) => {
  const createCount = report.files.filter(
    (file) => file.plannedAction === "create",
  ).length
  const overwriteCount = report.files.filter(
    (file) => file.plannedAction === "overwrite",
  ).length
  const skipCount = report.files.filter(
    (file) => file.plannedAction === "skip",
  ).length
  const blockCount = report.files.filter(
    (file) => file.plannedAction === "block",
  ).length
  const changedFileCount = report.files.filter((file) => file.hasChanges).length

  return {
    totalFileCount: report.files.length,
    changedFileCount,
    unchangedFileCount: report.files.length - changedFileCount,
    actionCounts: {
      create: createCount,
      overwrite: overwriteCount,
      skip: skipCount,
      block: blockCount,
    },
  }
}

const buildTargetDirectoryDiff = (
  report: GeneratorPreviewSessionDetail["report"],
) => {
  const directoryMap = new Map<
    string,
    {
      actionCounts: {
        block: number
        create: number
        overwrite: number
        skip: number
      }
      changedFileCount: number
      fileCount: number
    }
  >()

  for (const file of report.files) {
    const normalizedPath = file.path.replaceAll("\\", "/")
    const directory = normalizedPath.includes("/")
      ? normalizedPath.slice(0, normalizedPath.lastIndexOf("/"))
      : "."
    const current = directoryMap.get(directory) ?? {
      actionCounts: {
        block: 0,
        create: 0,
        overwrite: 0,
        skip: 0,
      },
      changedFileCount: 0,
      fileCount: 0,
    }

    current.fileCount += 1
    if (file.hasChanges) {
      current.changedFileCount += 1
    }
    if (file.plannedAction in current.actionCounts) {
      current.actionCounts[file.plannedAction] += 1
    }

    directoryMap.set(directory, current)
  }

  return [...directoryMap.entries()]
    .map(([directory, summary]) => ({
      directory,
      fileCount: summary.fileCount,
      changedFileCount: summary.changedFileCount,
      actionCounts: summary.actionCounts,
    }))
    .sort((left, right) => left.directory.localeCompare(right.directory))
}

const buildConflictExplanations = (
  report: GeneratorPreviewSessionDetail["report"],
) =>
  report.files
    .filter((file) => file.plannedAction === "block" || file.reason.length > 0)
    .map((file) => ({
      path: file.path,
      plannedAction: file.plannedAction,
      plannedReason: file.plannedReason,
      reason: file.reason,
      mergeStrategy: file.mergeStrategy,
    }))

const resolveSqlProposal = (session: GeneratorPreviewSessionDetail) =>
  resolveMigrationProposalFromChangePlan(session.report.databaseChangePlan)

const buildSqlProposal = (session: GeneratorPreviewSessionDetail) => {
  return resolveSqlProposal(session).proposal
}

const buildSqlProposalConfirmationChecklist = (
  sqlProposalResolution: ReturnType<typeof resolveSqlProposal>,
) => {
  return [
    sqlProposalResolution.proposal === null
      ? "Resolve the unsupported SQL proposal reason before changing persistence files."
      : "Review the SQL draft and Drizzle snippet before changing persistence files.",
    "Review the target-directory diff and conflict explanations before approving.",
    "Confirm the canonical owner and target paths match the intended persistence scope.",
    "Run db:generate and db:migrate only after manual sign-off.",
  ]
}

const buildSqlProposalHandoff = (session: GeneratorPreviewSessionDetail) => {
  const sqlProposalResolution = resolveSqlProposal(session)

  return {
    proposalStatus:
      sqlProposalResolution.proposal === null ? "unsupported" : "ready",
    reviewMode: "manual",
    canonicalMigrationOwner: "packages/persistence",
    targetPaths: {
      drizzleDir: "packages/persistence/drizzle",
      schemaDir: "packages/persistence/src/schema",
      schemaIndexFile: "packages/persistence/src/schema/index.ts",
      persistenceIndexFile: "packages/persistence/src/index.ts",
    },
    steps: [
      "Review the SQL draft, Drizzle snippet, and proposal risks before changing persistence files.",
      "Apply the chosen table shape under packages/persistence/src/schema and export it from the schema indexes if needed.",
      "Enter the formal Drizzle migration flow manually under packages/persistence/drizzle instead of treating this preview as an executed migration.",
      "Review the committed SQL/journal changes before running migrations against a target database.",
      "Run migration and verification commands before treating the schema change as accepted.",
    ],
    suggestedCommands: [
      "bun run db:generate",
      "bun run db:migrate",
      "bun test packages/persistence/src/migration-proposal.test.ts",
    ],
    confirmationChecklist:
      buildSqlProposalConfirmationChecklist(sqlProposalResolution),
    unsupportedReason: sqlProposalResolution.unsupportedReason,
    sourceSchemaName: session.schemaName,
  }
}

const buildRequestContext = (headers: Headers) => ({
  requestId: headers.get("x-request-id"),
  userAgent: headers.get("user-agent"),
  ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
})
