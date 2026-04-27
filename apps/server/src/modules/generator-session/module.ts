import { t } from "elysia"

import { AppError } from "../../errors"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { ServerModule } from "../module"
import type { GeneratorSessionRepository } from "./repository"
import {
  type GeneratorSessionServiceOptions,
  createGeneratorSessionService,
} from "./service"

interface GeneratorSessionAuditEvent {
  action: string
  actorUserId: string
  details: Record<string, unknown> | null
  ip: string | null
  requestId: string | null
  result: "success"
  targetId: string
  targetType: "generator-session"
  tenantId: string
  userAgent: string | null
}

type GeneratorSessionAuditLogWriter = (
  event: GeneratorSessionAuditEvent,
) => Promise<unknown>

export interface GeneratorSessionModuleOptions
  extends GeneratorSessionServiceOptions {
  auditLogWriter?: GeneratorSessionAuditLogWriter
  authGuard?: AuthGuard
}

const frontendTargetSchema = t.Union([t.Literal("vue"), t.Literal("react")])
const conflictStrategySchema = t.Union([
  t.Literal("skip"),
  t.Literal("overwrite"),
  t.Literal("overwrite-generated-only"),
  t.Literal("fail"),
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
            items: await service.listPreviewSessions(),
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

          return session
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
            report: session.report,
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
        "/studio/generator/sessions/:id/apply",
        async ({ params, request }) => {
          const identity = (await authorize(request.headers)) ?? null
          const session = await service.applyPreviewSession({
            id: params.id,
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
                applyManifestPath: session.applyManifestPath,
                appliedFileCount: session.appliedFileCount,
                skippedFileCount: session.skippedFileCount,
              },
              sessionId: session.id,
            })
          }

          return {
            session: toSessionResponse(session),
            apply: {
              files: session.applyResult.files,
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

const toSessionResponse = (
  session: Awaited<
    ReturnType<
      ReturnType<typeof createGeneratorSessionService>["createPreviewSession"]
    >
  >,
) => ({
  id: session.id,
  actorDisplayName: session.actorDisplayName,
  actorUserId: session.actorUserId,
  actorUsername: session.actorUsername,
  appliedAt: session.appliedAt,
  appliedFileCount: session.appliedFileCount,
  applyManifestPath: session.applyManifestPath,
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

const buildRequestContext = (headers: Headers) => ({
  requestId: headers.get("x-request-id"),
  userAgent: headers.get("user-agent"),
  ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
})
