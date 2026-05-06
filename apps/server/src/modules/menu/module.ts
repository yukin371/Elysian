import { deriveBodySchema, menuModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  menuDetailResponseSchema,
  menuListResponseSchema,
  menuRecordResponseSchema,
} from "./openapi"
import type { MenuRepository } from "./repository"
import {
  type CreateMenuPayload,
  type UpdateMenuPayload,
  createMenuService,
} from "./service"

export interface MenuModuleOptions {
  authGuard?: AuthGuard
}

interface MenuRouteRegistrar {
  get: (...args: readonly unknown[]) => MenuRouteRegistrar
  post: (...args: readonly unknown[]) => MenuRouteRegistrar
  put: (...args: readonly unknown[]) => MenuRouteRegistrar
}

interface MenuRouteParams {
  id: string
}

interface MenuRouteSet {
  headers: Record<string, string>
  status: number
}

const menuPermissions = {
  list: "system:menu:list",
  get: "system:menu:list",
  create: "system:menu:create",
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

    let menuApp = app as unknown as MenuRouteRegistrar

    menuApp = menuApp.get(
      "/system/menus",
      async ({ request }: { request: Request }) => {
        await authorize(request.headers, menuPermissions.list)

        return {
          items: await service.list(),
        }
      },
      {
        response: {
          200: menuListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["menu"],
          summary: "List menus",
        },
      },
    )

    menuApp = menuApp.get(
      "/system/menus/export",
      async ({ request, set }: { request: Request; set: MenuRouteSet }) => {
        await authorize(request.headers, menuPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["menu"],
          summary: "Export menus as CSV",
        },
      },
    )

    menuApp = menuApp.get(
      "/system/menus/:id",
      async ({
        params,
        request,
      }: {
        params: MenuRouteParams
        request: Request
      }) => {
        await authorize(request.headers, menuPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: menuDetailResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["menu"],
          summary: "Get menu by id",
        },
      },
    )

    menuApp = menuApp.post(
      "/system/menus",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateMenuPayload
        request: Request
        set: MenuRouteSet
      }) => {
        await authorize(request.headers, menuPermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: menuCreateBodySchema,
        response: {
          201: menuDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["menu"],
          summary: "Create menu",
        },
      },
    )

    menuApp = menuApp.put(
      "/system/menus/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: MenuRouteParams
        body: UpdateMenuPayload
        request: Request
      }) => {
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
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["menu"],
          summary: "Update menu",
        },
      },
    )

    return menuApp as unknown as AnyServerApp
  },
})
