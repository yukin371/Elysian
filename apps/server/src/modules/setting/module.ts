import { deriveBodySchema, settingModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  settingListResponseSchema,
  settingRecordResponseSchema,
} from "./openapi"
import type { SettingRepository } from "./repository"
import {
  type CreateSettingPayload,
  type UpdateSettingPayload,
  createSettingService,
} from "./service"

export interface SettingModuleOptions {
  authGuard?: AuthGuard
}

interface SettingRouteRegistrar {
  get: (...args: readonly unknown[]) => SettingRouteRegistrar
  post: (...args: readonly unknown[]) => SettingRouteRegistrar
  put: (...args: readonly unknown[]) => SettingRouteRegistrar
}

interface SettingRouteParams {
  id: string
}

interface SettingRouteQuery {
  page?: number
  pageSize?: number
}

interface SettingRouteSet {
  headers: Record<string, string>
  status: number
}

const settingListQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
})

const settingPermissions = {
  list: "system:setting:list",
  get: "system:setting:list",
  create: "system:setting:create",
  update: "system:setting:update",
} as const

const settingCreateBodySchema = deriveBodySchema(settingModuleSchema, {
  mode: "create",
  overrides: {
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
  },
})

const settingUpdateBodySchema = deriveBodySchema(settingModuleSchema, {
  mode: "update",
})

export const createSettingModule = (
  repository: SettingRepository,
  options: SettingModuleOptions = {},
): ServerModule => ({
  name: settingModuleSchema.name,
  register: (app, context) => {
    const service = createSettingService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering setting module", {
      fields: settingModuleSchema.fields.map((field) => field.key),
    })

    let settingApp = app as unknown as SettingRouteRegistrar

    settingApp = settingApp.get(
      "/system/settings",
      async ({
        query,
        request,
      }: {
        query: SettingRouteQuery
        request: Request
      }) => {
        await authorize(request.headers, settingPermissions.list)

        return service.list(query)
      },
      {
        query: settingListQuerySchema,
        response: {
          200: settingListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["setting"],
          summary: "List config entries",
        },
      },
    )

    settingApp = settingApp.get(
      "/system/settings/export",
      async ({ request, set }: { request: Request; set: SettingRouteSet }) => {
        await authorize(request.headers, settingPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["setting"],
          summary: "Export config entries as CSV",
        },
      },
    )

    settingApp = settingApp.get(
      "/system/settings/:id",
      async ({
        params,
        request,
      }: {
        params: SettingRouteParams
        request: Request
      }) => {
        await authorize(request.headers, settingPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: settingRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["setting"],
          summary: "Get config entry by id",
        },
      },
    )

    settingApp = settingApp.post(
      "/system/settings",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateSettingPayload
        request: Request
        set: SettingRouteSet
      }) => {
        await authorize(request.headers, settingPermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: settingCreateBodySchema,
        response: {
          201: settingRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["setting"],
          summary: "Create config entry",
        },
      },
    )

    settingApp = settingApp.put(
      "/system/settings/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: SettingRouteParams
        body: UpdateSettingPayload
        request: Request
      }) => {
        await authorize(request.headers, settingPermissions.update)

        return service.update(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: settingUpdateBodySchema,
        response: {
          200: settingRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["setting"],
          summary: "Update config entry",
        },
      },
    )

    return settingApp as unknown as AnyServerApp
  },
})
