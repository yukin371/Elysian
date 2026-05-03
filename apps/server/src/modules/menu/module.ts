import { deriveBodySchema, menuModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import {
  menuDetailResponseSchema,
  menuListResponseSchema,
  menuRecordResponseSchema,
} from "./openapi"
import type { MenuRepository } from "./repository"
import { createMenuService } from "./service"

export interface MenuModuleOptions {
  authGuard?: AuthGuard
}

const menuPermissions = {
  list: "system:menu:list",
  get: "system:menu:list",
  create: "system:menu:update",
  update: "system:menu:update",
} as const

const menuTypeSchema = t.Union([
  t.Literal("directory"),
  t.Literal("menu"),
  t.Literal("button"),
])

const menuCreateBodySchema = deriveBodySchema(menuModuleSchema, {
  mode: "create",
  overrides: {
    component: t.Optional(t.Nullable(t.String())),
    icon: t.Optional(t.Nullable(t.String())),
    isVisible: t.Optional(t.Boolean()),
    parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
    path: t.Optional(t.Nullable(t.String())),
    permissionCode: t.Optional(t.Nullable(t.String())),
    roleIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
    sort: t.Optional(t.Number()),
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
    type: menuTypeSchema,
  },
})

const menuUpdateBodySchema = deriveBodySchema(menuModuleSchema, {
  mode: "update",
  overrides: {
    component: t.Optional(t.Nullable(t.String())),
    icon: t.Optional(t.Nullable(t.String())),
    parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
    path: t.Optional(t.Nullable(t.String())),
    permissionCode: t.Optional(t.Nullable(t.String())),
    roleIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
    type: t.Optional(menuTypeSchema),
  },
})

export const createMenuModule = (
  repository: MenuRepository,
  options: MenuModuleOptions = {},
): ServerModule => ({
  name: menuModuleSchema.name,
  register: (app, context) => {
    const service = createMenuService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering menu module", {
      fields: menuModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/system/menus",
        async ({ request }) => {
          await authorize(request.headers, menuPermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          response: {
            200: menuListResponseSchema,
          },
          detail: {
            tags: ["menu"],
            summary: "List menus",
          },
        },
      )
      .get(
        "/system/menus/export",
        async ({ request, set }) => {
          await authorize(request.headers, menuPermissions.list)

          set.headers["content-type"] = "text/csv; charset=utf-8"
          return service.exportCsv()
        },
        {
          detail: {
            tags: ["menu"],
            summary: "Export menus as CSV",
          },
        },
      )
      .get(
        "/system/menus/:id",
        async ({ params, request }) => {
          await authorize(request.headers, menuPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          response: {
            200: menuDetailResponseSchema,
          },
          detail: {
            tags: ["menu"],
            summary: "Get menu by id",
          },
        },
      )
      .post(
        "/system/menus",
        async ({ body, request, set }) => {
          await authorize(request.headers, menuPermissions.create)
          set.status = 201

          return service.create(body)
        },
        {
          body: menuCreateBodySchema,
          response: {
            201: menuDetailResponseSchema,
          },
          detail: {
            tags: ["menu"],
            summary: "Create menu",
          },
        },
      )
      .put(
        "/system/menus/:id",
        async ({ params, body, request }) => {
          await authorize(request.headers, menuPermissions.update)

          return service.update(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: menuUpdateBodySchema,
          response: {
            200: menuDetailResponseSchema,
          },
          detail: {
            tags: ["menu"],
            summary: "Update menu",
          },
        },
      )
  },
})
