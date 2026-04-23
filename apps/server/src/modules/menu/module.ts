import { menuModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
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
          detail: {
            tags: ["menu"],
            summary: "List menus",
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
          body: t.Object({
            parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
            type: t.Union([
              t.Literal("directory"),
              t.Literal("menu"),
              t.Literal("button"),
            ]),
            code: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            path: t.Optional(t.Nullable(t.String())),
            component: t.Optional(t.Nullable(t.String())),
            icon: t.Optional(t.Nullable(t.String())),
            sort: t.Optional(t.Number()),
            isVisible: t.Optional(t.Boolean()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            permissionCode: t.Optional(t.Nullable(t.String())),
            roleIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
          }),
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
          body: t.Object({
            parentId: t.Optional(t.Nullable(t.String({ minLength: 1 }))),
            type: t.Optional(
              t.Union([
                t.Literal("directory"),
                t.Literal("menu"),
                t.Literal("button"),
              ]),
            ),
            code: t.Optional(t.String({ minLength: 1 })),
            name: t.Optional(t.String({ minLength: 1 })),
            path: t.Optional(t.Nullable(t.String())),
            component: t.Optional(t.Nullable(t.String())),
            icon: t.Optional(t.Nullable(t.String())),
            sort: t.Optional(t.Number()),
            isVisible: t.Optional(t.Boolean()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            permissionCode: t.Optional(t.Nullable(t.String())),
            roleIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
          }),
          detail: {
            tags: ["menu"],
            summary: "Update menu",
          },
        },
      )
  },
})
