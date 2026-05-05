import { deriveBodySchema, roleModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import { roleDetailResponseSchema, roleListResponseSchema } from "./openapi"
import type { RoleRepository } from "./repository"
import {
  type CreateRolePayload,
  type UpdateRolePayload,
  createRoleService,
} from "./service"

const roleDataScopeSchema = t.Union([
  t.Literal(1),
  t.Literal(2),
  t.Literal(3),
  t.Literal(4),
  t.Literal(5),
])

export interface RoleModuleOptions {
  authGuard?: AuthGuard
}

interface RoleRouteRegistrar {
  get: (...args: readonly unknown[]) => RoleRouteRegistrar
  post: (...args: readonly unknown[]) => RoleRouteRegistrar
  put: (...args: readonly unknown[]) => RoleRouteRegistrar
}

interface RoleRouteParams {
  id: string
}

interface RoleRouteQuery {
  page?: number
  pageSize?: number
}

interface RoleRouteSet {
  headers: Record<string, string>
  status: number
}

const roleListQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
})

const rolePermissions = {
  list: "system:role:list",
  get: "system:role:list",
  create: "system:role:create",
  update: "system:role:update",
} as const

const roleCreateBodySchema = deriveBodySchema(roleModuleSchema, {
  mode: "create",
  overrides: {
    dataScope: t.Optional(roleDataScopeSchema),
    deptIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
    isSystem: t.Optional(t.Boolean()),
    permissionCodes: t.Optional(t.Array(t.String({ minLength: 1 }))),
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
    userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
  },
})

const roleUpdateBodySchema = deriveBodySchema(roleModuleSchema, {
  mode: "update",
  overrides: {
    dataScope: t.Optional(roleDataScopeSchema),
    deptIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
    permissionCodes: t.Optional(t.Array(t.String({ minLength: 1 }))),
    userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
  },
})

export const createRoleModule = (
  repository: RoleRepository,
  options: RoleModuleOptions = {},
): ServerModule => ({
  name: roleModuleSchema.name,
  register: (app, context) => {
    const service = createRoleService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering role module", {
      fields: roleModuleSchema.fields.map((field) => field.key),
    })

    let roleApp = app as unknown as RoleRouteRegistrar

    roleApp = roleApp.get(
      "/system/roles",
      async ({
        query,
        request,
      }: {
        query: RoleRouteQuery
        request: Request
      }) => {
        await authorize(request.headers, rolePermissions.list)

        return service.list(query)
      },
      {
        query: roleListQuerySchema,
        response: {
          200: roleListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["role"],
          summary: "List roles",
        },
      },
    )

    roleApp = roleApp.get(
      "/system/roles/export",
      async ({ request, set }: { request: Request; set: RoleRouteSet }) => {
        await authorize(request.headers, rolePermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["role"],
          summary: "Export roles as CSV",
        },
      },
    )

    roleApp = roleApp.get(
      "/system/roles/:id",
      async ({
        params,
        request,
      }: {
        params: RoleRouteParams
        request: Request
      }) => {
        await authorize(request.headers, rolePermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: roleDetailResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["role"],
          summary: "Get role by id",
        },
      },
    )

    roleApp = roleApp.post(
      "/system/roles",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateRolePayload
        request: Request
        set: RoleRouteSet
      }) => {
        await authorize(request.headers, rolePermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: roleCreateBodySchema,
        response: {
          201: roleDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["role"],
          summary: "Create role",
        },
      },
    )

    roleApp = roleApp.put(
      "/system/roles/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: RoleRouteParams
        body: UpdateRolePayload
        request: Request
      }) => {
        await authorize(request.headers, rolePermissions.update)

        return service.update(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: roleUpdateBodySchema,
        response: {
          200: roleDetailResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["role"],
          summary: "Update role",
        },
      },
    )

    return roleApp as unknown as AnyServerApp
  },
})
