import { userModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { UserRepository } from "./repository"
import { createUserService } from "./service"

export interface UserModuleOptions {
  authGuard?: AuthGuard
}

const userPermissions = {
  list: "system:user:list",
  get: "system:user:list",
  create: "system:user:create",
  update: "system:user:update",
  resetPassword: "system:user:reset-password",
} as const

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
        async ({ request }) => {
          await authorize(request.headers, userPermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          detail: {
            tags: ["user"],
            summary: "List users",
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
          body: t.Object({
            username: t.String({ minLength: 1 }),
            displayName: t.String({ minLength: 1 }),
            email: t.Optional(t.String({ minLength: 1 })),
            phone: t.Optional(t.String({ minLength: 1 })),
            password: t.String({ minLength: 1 }),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            isSuperAdmin: t.Optional(t.Boolean()),
          }),
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
          body: t.Object({
            username: t.Optional(t.String({ minLength: 1 })),
            displayName: t.Optional(t.String({ minLength: 1 })),
            email: t.Optional(t.String({ minLength: 1 })),
            phone: t.Optional(t.String({ minLength: 1 })),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            isSuperAdmin: t.Optional(t.Boolean()),
          }),
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
