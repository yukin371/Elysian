import { settingModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { SettingRepository } from "./repository"
import { createSettingService } from "./service"

export interface SettingModuleOptions {
  authGuard?: AuthGuard
}

const settingPermissions = {
  list: "system:setting:list",
  get: "system:setting:list",
  create: "system:setting:create",
  update: "system:setting:update",
} as const

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
        async ({ request }) => {
          await authorize(request.headers, settingPermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          detail: {
            tags: ["setting"],
            summary: "List settings",
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
          body: t.Object({
            key: t.String({ minLength: 1 }),
            value: t.String({ minLength: 1 }),
            description: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
          }),
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
          body: t.Object({
            key: t.Optional(t.String({ minLength: 1 })),
            value: t.Optional(t.String({ minLength: 1 })),
            description: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
          }),
          detail: {
            tags: ["setting"],
            summary: "Update setting",
          },
        },
      )
  },
})
