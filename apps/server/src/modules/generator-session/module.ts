import { rename as renameFile } from "node:fs/promises"
import {
  type MigrationProposalSnapshot,
  buildMigrationProposalSnapshot,
  readMigrationProposalSnapshot,
  resolveMigrationProposalFromChangePlan,
  resolveMigrationProposalSnapshotPath,
  writeMigrationProposalSnapshot,
} from "@elysian/persistence"
import { expandSimplifiedSchema } from "@elysian/schema"
import { t } from "elysia"

import { AppError } from "../../errors"
import { createErrorResponses } from "../../openapi"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { AuditLogWriter } from "../shared/audit-log"
import {
  generatorSchemaValidationResponseSchema,
  generatorSessionApplyResponseSchema,
  generatorSessionConfirmResponseSchema,
  generatorSessionDetailResponseSchema,
  generatorSessionListResponseSchema,
  generatorSessionPreviewResponseSchema,
} from "./openapi"
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
const generatorPreviewSourceTypeSchema = t.Union([
  t.Literal("registered-schema"),
  t.Literal("manual-schema-json"),
])
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
      .post(
        "/studio/generator/validate-schema",
        async ({ body }) => {
          try {
            return {
              valid: true as const,
              expandedSchema: expandSimplifiedSchema(body.schema),
            }
          } catch (error) {
            const formattedMessage =
              error instanceof Error
                ? error.message
                : "Schema validation failed."

            return {
              valid: false as const,
              issues: [
                {
                  path: "$",
                  message: formattedMessage,
                },
              ],
              formattedMessage,
            }
          }
        },
        {
          body: t.Object({
            schema: t.Unknown(),
          }),
          response: {
            200: generatorSchemaValidationResponseSchema,
            ...createErrorResponses(400),
          },
          detail: {
            tags: ["generator"],
            summary: "Validate and expand generator schema input",
          },
        },
      )
      .get(
        "/studio/generator/sessions",
        async ({ request }) => {
          await authorize(request.headers)

          return {
            items: (await service.listPreviewSessions()).map(toSessionResponse),
          }
        },
        {
          response: {
            200: generatorSessionListResponseSchema,
            ...createErrorResponses(401, 403),
          },
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

          return await toSessionDetailResponse(session)
        },
        {
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          response: {
            200: generatorSessionDetailResponseSchema,
            ...createErrorResponses(401, 403, 404, 500),
          },
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
            sourceType: body.sourceType,
            sourceValue: body.sourceValue,
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
            sqlProposalHandoff: await buildSqlProposalHandoff(session),
          }
        },
        {
          body: t.Object({
            schemaName: t.String({ minLength: 1 }),
            frontendTarget: t.Optional(frontendTargetSchema),
            conflictStrategy: t.Optional(conflictStrategySchema),
            sourceType: t.Optional(generatorPreviewSourceTypeSchema),
            sourceValue: t.Optional(t.String()),
            targetPreset: t.Optional(
              t.Union([t.Literal("staging"), t.Literal("module")]),
            ),
          }),
          response: {
            201: generatorSessionPreviewResponseSchema,
            ...createErrorResponses(400, 401, 403, 404, 409, 500),
          },
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
                body.decision === "approve"
                  ? "review_approve"
                  : "review_reject",
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
            sqlProposalHandoff: await buildSqlProposalHandoff(session),
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
          response: {
            200: generatorSessionPreviewResponseSchema,
            ...createErrorResponses(401, 403, 404, 409, 500),
          },
          detail: {
            tags: ["generator"],
            summary: "Review a generator preview session",
          },
        },
      )
      .post(
        "/studio/generator/sessions/:id/confirm",
        async ({ body, params, request }) => {
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

          const sqlProposalHandoff =
            await buildSqlProposalHandoff(sessionBeforeConfirm)
          if (sqlProposalHandoff.proposalStatus !== "ready") {
            throw new AppError({
              code: "GENERATOR_SESSION_SQL_PROPOSAL_NOT_READY",
              message:
                "Generator session SQL proposal is not ready for confirmation",
              status: 409,
              expose: true,
              details: {
                id: sessionBeforeConfirm.id,
                proposalStatus: sqlProposalHandoff.proposalStatus,
                unsupportedReason: sqlProposalHandoff.unsupportedReason,
              },
            })
          }

          const expectedRecoveryStatus =
            sqlProposalHandoff.migrationProposalSnapshotRecovery?.status ??
            "none"
          if (
            body.displayedSnapshotPath !==
              sqlProposalHandoff.migrationProposalSnapshotPath ||
            body.displayedRecoveryStatus !== expectedRecoveryStatus
          ) {
            throw new AppError({
              code: "GENERATOR_SESSION_CONFIRMATION_HANDOFF_MISMATCH",
              message:
                "Generator session confirmation does not match the displayed SQL handoff",
              status: 409,
              expose: true,
              details: {
                displayedRecoveryStatus: body.displayedRecoveryStatus,
                displayedSnapshotPath: body.displayedSnapshotPath,
                expectedRecoveryStatus,
                expectedSnapshotPath:
                  sqlProposalHandoff.migrationProposalSnapshotPath,
                id: sessionBeforeConfirm.id,
              },
            })
          }

          const session = await service.confirmPreviewSession({
            archivedSnapshotPath:
              sqlProposalHandoff.migrationProposalSnapshotRecovery
                ?.archivedSnapshotPath ?? null,
            actor: identity,
            confirmationChecklist: sqlProposalHandoff.confirmationChecklist,
            id: params.id,
            recoveryStatus:
              sqlProposalHandoff.migrationProposalSnapshotRecovery?.status ??
              "none",
            snapshotPath: sqlProposalHandoff.migrationProposalSnapshotPath,
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
            sqlProposalHandoff: await buildSqlProposalHandoff(session),
          }
        },
        {
          body: t.Object({
            displayedRecoveryStatus: t.Union([
              t.Literal("none"),
              t.Literal("rebuilt-from-corrupt"),
              t.Literal("rebuilt-from-missing"),
            ]),
            displayedSnapshotPath: t.String({ minLength: 1 }),
          }),
          params: t.Object({
            id: t.String({ minLength: 1 }),
          }),
          response: {
            200: generatorSessionConfirmResponseSchema,
            ...createErrorResponses(401, 403, 404, 409, 500),
          },
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
            sqlProposalHandoff: await buildSqlProposalHandoff(session),
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
          response: {
            200: generatorSessionApplyResponseSchema,
            ...createErrorResponses(401, 403, 404, 409, 500),
          },
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
  blockerReasons: buildBlockerReasons(session),
  recoveryStatus: buildRecoveryStatus(session),
  driftStatus: "clean",
  schemaName: session.schemaName,
  skippedFileCount: session.skippedFileCount,
  sourceType: session.sourceType,
  sourceValue: session.sourceValue,
  status: session.status,
  targetPreset: session.targetPreset,
  tenantId: session.tenantId,
})

const toSessionDetailResponse = async (
  session: GeneratorPreviewSessionDetail,
) => ({
  ...toSessionResponse(session),
  diffSummary: buildDiffSummary(session.report),
  targetDirectoryDiff: buildTargetDirectoryDiff(session.report),
  conflictExplanations: buildConflictExplanations(session.report),
  report: session.report,
  sqlProposal: buildSqlProposal(session),
  sqlProposalHandoff: await buildSqlProposalHandoff(session),
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

const buildConfirmationEvidence = (session: GeneratorPreviewSessionRecord) => {
  if (session.confirmationEvidence != null) {
    return session.confirmationEvidence
  }

  return null
}

const buildRecoveryStatus = (session: GeneratorPreviewSessionRecord) => {
  const confirmationEvidence = buildConfirmationEvidence(session)
  const recoveryStatus = confirmationEvidence?.recoveryStatus

  if (
    recoveryStatus === "rebuilt-from-corrupt" ||
    recoveryStatus === "rebuilt-from-missing"
  ) {
    return recoveryStatus
  }

  return "none"
}

const buildBlockerReasons = (session: GeneratorPreviewSessionRecord) => {
  const reasons: Array<{
    code:
      | "review-required"
      | "rejected"
      | "blocking-conflicts"
      | "confirmation-required"
    message: string
    stage: "review" | "confirm" | "apply"
  }> = []

  if (session.status === "pending_review") {
    reasons.push({
      code: "review-required",
      message: "Review the current result before confirm or apply.",
      stage: "review",
    })
  }

  if (session.status === "rejected") {
    reasons.push({
      code: "rejected",
      message: "Resolve the rejected result before continuing.",
      stage: "review",
    })
  }

  if (session.hasBlockingConflicts) {
    reasons.push({
      code: "blocking-conflicts",
      message: "Blocking files still need manual review before apply.",
      stage: "apply",
    })
  }

  if (
    session.status === "ready" &&
    session.confirmedAt === null &&
    !session.hasBlockingConflicts
  ) {
    reasons.push({
      code: "confirmation-required",
      message: "Confirm the SQL handoff checklist before apply.",
      stage: "confirm",
    })
  }

  return reasons
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
  migrationProposalSnapshot: MigrationProposalSnapshot,
) => {
  const { migrationProposalResolution } = migrationProposalSnapshot

  return [
    migrationProposalResolution.proposal === null
      ? `Resolve the unsupported SQL proposal reason before changing persistence files: ${migrationProposalResolution.unsupportedReason ?? "unknown"}`
      : `Review the SQL draft and Drizzle snippet in ${migrationProposalSnapshot.snapshotPath} before changing persistence files.`,
    `Verify the migration proposal snapshot at ${migrationProposalSnapshot.snapshotPath} was generated from ${migrationProposalSnapshot.reportPath} at ${migrationProposalSnapshot.generatedAt}.`,
    "Confirm the canonical owner and target paths match the intended persistence scope.",
    "Run db:generate and db:migrate only after manual sign-off.",
  ]
}

const hasErrorCode = (
  value: unknown,
): value is Error & {
  code?: string
} => value instanceof Error && "code" in value

const buildSqlProposalHandoff = async (
  session: GeneratorPreviewSessionDetail,
) => {
  const snapshotPath = resolveMigrationProposalSnapshotPath(session.reportPath)
  let migrationProposalSnapshot: MigrationProposalSnapshot
  let migrationProposalSnapshotRecovery: {
    archivedSnapshotPath: string | null
    status: "none" | "rebuilt-from-corrupt" | "rebuilt-from-missing"
  } | null = {
    archivedSnapshotPath: null,
    status: "none",
  }

  try {
    migrationProposalSnapshot =
      await readMigrationProposalSnapshot(snapshotPath)
  } catch (error) {
    const isMissingSnapshot = hasErrorCode(error) && error.code === "ENOENT"

    if (isMissingSnapshot) {
      migrationProposalSnapshotRecovery = {
        archivedSnapshotPath: null,
        status: "rebuilt-from-missing",
      }
    } else {
      const archivedSnapshotPath = snapshotPath.replace(
        /\.json$/,
        `.corrupt-${crypto.randomUUID()}.json`,
      )

      await renameFile(snapshotPath, archivedSnapshotPath)
      migrationProposalSnapshotRecovery = {
        archivedSnapshotPath,
        status: "rebuilt-from-corrupt",
      }
    }

    migrationProposalSnapshot = buildMigrationProposalSnapshot({
      databaseChangePlan: session.report.databaseChangePlan,
      generatedAt: session.createdAt,
      reportPath: session.reportPath,
      schemaName: session.schemaName,
      sessionId: session.id,
    })

    try {
      await writeMigrationProposalSnapshot(migrationProposalSnapshot)
    } catch (writeError) {
      throw writeError instanceof Error ? writeError : error
    }
  }

  const sqlProposalResolution =
    migrationProposalSnapshot.migrationProposalResolution

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
    confirmationChecklist: buildSqlProposalConfirmationChecklist(
      migrationProposalSnapshot,
    ),
    unsupportedReason: sqlProposalResolution.unsupportedReason,
    migrationProposalSnapshotRecovery,
    sourceSchemaName: session.schemaName,
    migrationProposalSnapshot,
    migrationProposalSnapshotPath: migrationProposalSnapshot.snapshotPath,
  }
}

const buildRequestContext = (headers: Headers) => ({
  requestId: headers.get("x-request-id"),
  userAgent: headers.get("user-agent"),
  ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
})
