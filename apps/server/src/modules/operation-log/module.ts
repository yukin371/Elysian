import { operationLogModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { OperationLogRepository } from "./repository"
import { createOperationLogService } from "./service"

export interface OperationLogModuleOptions {
  authGuard?: AuthGuard
}

const operationLogPermissions = {
  list: "system:operation-log:list",
  get: "system:operation-log:list",
  export: "system:operation-log:export",
} as const

const operationLogFilterSchema = t.Object({
  category: t.Optional(t.String()),
  action: t.Optional(t.String()),
  actorUserId: t.Optional(t.String()),
  result: t.Optional(t.Union([t.Literal("success"), t.Literal("failure")])),
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

    return app
      .get(
        "/system/operation-logs",
        async ({ query, request }) => {
          await authorize(request.headers, operationLogPermissions.list)

          return {
            items: await service.list(query),
          }
        },
        {
          query: operationLogFilterSchema,
          detail: {
            tags: ["operation-log"],
            summary: "List operation logs",
          },
        },
      )
      .get(
        "/system/operation-logs/export",
        async ({ query, request, set }) => {
          await authorize(request.headers, operationLogPermissions.export)

          set.headers["content-type"] = "text/csv; charset=utf-8"
          return service.exportCsv(query)
        },
        {
          query: operationLogFilterSchema,
          detail: {
            tags: ["operation-log"],
            summary: "Export operation logs as CSV",
          },
        },
      )
      .get(
        "/system/operation-logs/:id",
        async ({ params, request }) => {
          await authorize(request.headers, operationLogPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["operation-log"],
            summary: "Get operation log by id",
          },
        },
      )
  },
})
