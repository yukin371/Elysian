import { deriveBodySchema, settingModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import {
  settingListResponseSchema,
  settingRecordResponseSchema,
} from "./openapi"
import type { SettingRepository } from "./repository"
import { createSettingService } from "./service"

export interface SettingModuleOptions {
  authGuard?: AuthGuard
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

    return app
      .get(
        "/system/settings",
        async ({ query, request }) => {
          await authorize(request.headers, settingPermissions.list)

          return service.list(query)
        },
        {
          query: settingListQuerySchema,
          response: {
            200: settingListResponseSchema,
          },
          detail: {
            tags: ["setting"],
            summary: "List settings",
          },
        },
      )
      .get(
        "/system/settings/export",
        async ({ request, set }) => {
          await authorize(request.headers, settingPermissions.list)

          set.headers["content-type"] = "text/csv; charset=utf-8"
          return service.exportCsv()
        },
        {
          detail: {
            tags: ["setting"],
            summary: "Export settings as CSV",
          },
        },
      )
      .get(
        "/system/settings/:id",
        async ({ params, request }) => {
          await authorize(request.headers, settingPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          response: {
            200: settingRecordResponseSchema,
          },
          detail: {
            tags: ["setting"],
            summary: "Get setting by id",
          },
        },
      )
      .post(
        "/system/settings",
        async ({ body, request, set }) => {
          await authorize(request.headers, settingPermissions.create)
          set.status = 201

          return service.create(body)
        },
        {
          body: settingCreateBodySchema,
          response: {
            201: settingRecordResponseSchema,
          },
          detail: {
            tags: ["setting"],
            summary: "Create setting",
          },
        },
      )
      .put(
        "/system/settings/:id",
        async ({ params, body, request }) => {
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
          },
          detail: {
            tags: ["setting"],
            summary: "Update setting",
          },
        },
      )
  },
})
