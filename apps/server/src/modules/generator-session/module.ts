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
      session: { id: string; reportPath: string; schemaName: string },
      input: {
        conflictStrategy: string
        frontendTarget: string
        previewFileCount: number
        targetPreset: string
      },
    ) => {
      if (!options.auditLogWriter) {
        return
      }

      try {
        await options.auditLogWriter({
          action: "preview_create",
          actorUserId: identity.user.id,
          details: {
            schemaName: session.schemaName,
            frontendTarget: input.frontendTarget,
            conflictStrategy: input.conflictStrategy,
            targetPreset: input.targetPreset,
            previewFileCount: input.previewFileCount,
            reportPath: session.reportPath,
          },
          ip: buildRequestContext(headers).ip,
          requestId: buildRequestContext(headers).requestId,
          result: "success",
          targetId: session.id,
          targetType: "generator-session",
          tenantId: identity.user.tenantId,
          userAgent: buildRequestContext(headers).userAgent,
        })
      } catch (error) {
        context.logger.warn("Generator session audit log write failed", {
          action: "preview_create",
          targetType: "generator-session",
          targetId: session.id,
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
            await recordAuditBestEffort(request.headers, identity, session, {
              conflictStrategy: session.conflictStrategy,
              frontendTarget: session.frontendTarget,
              previewFileCount: session.previewFileCount,
              targetPreset: session.targetPreset,
            })
          }

          set.status = 201

          return {
            session: {
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
            },
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
  },
})

const buildRequestContext = (headers: Headers) => ({
  requestId: headers.get("x-request-id"),
  userAgent: headers.get("user-agent"),
  ip: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
})
