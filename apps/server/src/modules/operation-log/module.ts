import { operationLogModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  operationLogListResponseSchema,
  operationLogRecordResponseSchema,
} from "./openapi"
import type { OperationLogRepository } from "./repository"
import {
  type ListOperationLogsPayload,
  createOperationLogService,
} from "./service"

export interface OperationLogModuleOptions {
  authGuard?: AuthGuard
}

interface OperationLogRouteRegistrar {
  get: (...args: readonly unknown[]) => OperationLogRouteRegistrar
}

interface OperationLogRouteParams {
  id: string
}

interface OperationLogRouteQuery extends ListOperationLogsPayload {}

interface OperationLogRouteSet {
  headers: Record<string, string>
}

const operationLogPermissions = {
  list: "system:operation-log:list",
  get: "system:operation-log:list",
  export: "system:operation-log:export",
} as const

const operationLogFilterSchema = t.Object({
  category: t.Optional(t.String()),
  action: t.Optional(t.String()),
  authEventType: t.Optional(
    t.Union([
      t.Literal("login"),
      t.Literal("logout"),
      t.Literal("refresh"),
      t.Literal("session_revoke"),
    ]),
  ),
  authFailureReason: t.Optional(t.String()),
  actorUserId: t.Optional(t.String()),
  targetType: t.Optional(t.String()),
  targetId: t.Optional(t.String()),
  requestId: t.Optional(t.String()),
  ip: t.Optional(t.String()),
  userAgent: t.Optional(t.String()),
  result: t.Optional(t.Union([t.Literal("success"), t.Literal("failure")])),
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
})

export const createOperationLogModule = (
  repository: OperationLogRepository,
  options: OperationLogModuleOptions = {},
): ServerModule => ({
  name: operationLogModuleSchema.name,
  register: (app, context) => {
    const service = createOperationLogService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering operation log module", {
      fields: operationLogModuleSchema.fields.map((field) => field.key),
    })

    let operationLogApp = app as unknown as OperationLogRouteRegistrar

    operationLogApp = operationLogApp.get(
      "/system/operation-logs",
      async ({
        query,
        request,
      }: {
        query: OperationLogRouteQuery
        request: Request
      }) => {
        await authorize(request.headers, operationLogPermissions.list)

        return service.list(query)
      },
      {
        query: operationLogFilterSchema,
        response: {
          200: operationLogListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["operation-log"],
          summary: "List operation logs",
        },
      },
    )

    operationLogApp = operationLogApp.get(
      "/system/operation-logs/export",
      async ({
        query,
        request,
        set,
      }: {
        query: OperationLogRouteQuery
        request: Request
        set: OperationLogRouteSet
      }) => {
        await authorize(request.headers, operationLogPermissions.export)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv(query)
      },
      {
        query: operationLogFilterSchema,
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["operation-log"],
          summary: "Export operation logs as CSV",
        },
      },
    )

    operationLogApp = operationLogApp.get(
      "/system/operation-logs/:id",
      async ({
        params,
        request,
      }: {
        params: OperationLogRouteParams
        request: Request
      }) => {
        await authorize(request.headers, operationLogPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: operationLogRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["operation-log"],
          summary: "Get operation log by id",
        },
      },
    )

    return operationLogApp as unknown as AnyServerApp
  },
})
