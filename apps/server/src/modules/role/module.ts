import { roleModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { RoleRepository } from "./repository"
import { createRoleService } from "./service"

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

const rolePermissions = {
  list: "system:role:list",
  get: "system:role:list",
  create: "system:role:create",
  update: "system:role:update",
} as const

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

    return app
      .get(
        "/system/roles",
        async ({ request }) => {
          await authorize(request.headers, rolePermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          detail: {
            tags: ["role"],
            summary: "List roles",
          },
        },
      )
      .get(
        "/system/roles/:id",
        async ({ params, request }) => {
          await authorize(request.headers, rolePermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["role"],
            summary: "Get role by id",
          },
        },
      )
      .post(
        "/system/roles",
        async ({ body, request, set }) => {
          await authorize(request.headers, rolePermissions.create)
          set.status = 201

          return service.create(body)
        },
        {
          body: t.Object({
            code: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            description: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            isSystem: t.Optional(t.Boolean()),
            dataScope: t.Optional(roleDataScopeSchema),
            permissionCodes: t.Optional(t.Array(t.String({ minLength: 1 }))),
            userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
            deptIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
          }),
          detail: {
            tags: ["role"],
            summary: "Create role",
          },
        },
      )
      .put(
        "/system/roles/:id",
        async ({ params, body, request }) => {
          await authorize(request.headers, rolePermissions.update)

          return service.update(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            code: t.Optional(t.String({ minLength: 1 })),
            name: t.Optional(t.String({ minLength: 1 })),
            description: t.Optional(t.String()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            isSystem: t.Optional(t.Boolean()),
            dataScope: t.Optional(roleDataScopeSchema),
            permissionCodes: t.Optional(t.Array(t.String({ minLength: 1 }))),
            userIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
            deptIds: t.Optional(t.Array(t.String({ minLength: 1 }))),
          }),
          detail: {
            tags: ["role"],
            summary: "Update role",
          },
        },
      )
  },
})
