import { deriveBodySchema, userModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { UserRepository } from "./repository"
import { createUserService } from "./service"

export interface UserModuleOptions {
  authGuard?: AuthGuard
}

const userListQuerySchema = t.Object({
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
})

const userPermissions = {
  list: "system:user:list",
  get: "system:user:list",
  create: "system:user:create",
  update: "system:user:update",
  resetPassword: "system:user:reset-password",
} as const

const userCreateBodySchema = deriveBodySchema(userModuleSchema, {
  mode: "create",
  exclude: ["lastLoginAt"],
  overrides: {
    isSuperAdmin: t.Optional(t.Boolean()),
    password: t.String({ minLength: 1 }),
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
  },
})

const userUpdateBodySchema = deriveBodySchema(userModuleSchema, {
  mode: "update",
  exclude: ["lastLoginAt"],
})

export const createUserModule = (
  repository: UserRepository,
  options: UserModuleOptions = {},
): ServerModule => ({
  name: userModuleSchema.name,
  register: (app, context) => {
    const service = createUserService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering user module", {
      fields: userModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/system/users",
        async ({ query, request }) => {
          await authorize(request.headers, userPermissions.list)

          return service.list(query)
        },
        {
          query: userListQuerySchema,
          detail: {
            tags: ["user"],
            summary: "List users",
          },
        },
      )
      .get(
        "/system/users/export",
        async ({ request, set }) => {
          await authorize(request.headers, userPermissions.list)

          set.headers["content-type"] = "text/csv; charset=utf-8"
          return service.exportCsv()
        },
        {
          detail: {
            tags: ["user"],
            summary: "Export users as CSV",
          },
        },
      )
      .get(
        "/system/users/:id",
        async ({ params, request }) => {
          await authorize(request.headers, userPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["user"],
            summary: "Get user by id",
          },
        },
      )
      .post(
        "/system/users",
        async ({ body, request, set }) => {
          await authorize(request.headers, userPermissions.create)
          set.status = 201

          return service.create(body)
        },
        {
          body: userCreateBodySchema,
          detail: {
            tags: ["user"],
            summary: "Create user",
          },
        },
      )
      .put(
        "/system/users/:id",
        async ({ params, body, request }) => {
          await authorize(request.headers, userPermissions.update)

          return service.update(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: userUpdateBodySchema,
          detail: {
            tags: ["user"],
            summary: "Update user",
          },
        },
      )
      .post(
        "/system/users/:id/reset-password",
        async ({ params, body, request, set }) => {
          await authorize(request.headers, userPermissions.resetPassword)

          await service.resetPassword(params.id, body.password)
          set.status = 204
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: t.Object({
            password: t.String({ minLength: 1 }),
          }),
          detail: {
            tags: ["user"],
            summary: "Reset user password",
          },
        },
      )
  },
})
