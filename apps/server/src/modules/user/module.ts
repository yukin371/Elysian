import { deriveBodySchema, userModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import { userListResponseSchema, userRecordResponseSchema } from "./openapi"
import type { UserRepository } from "./repository"
import {
  type CreateUserPayload,
  type UpdateUserPayload,
  createUserService,
} from "./service"

export interface UserModuleOptions {
  authGuard?: AuthGuard
}

interface UserRouteRegistrar {
  get: (...args: readonly unknown[]) => UserRouteRegistrar
  post: (...args: readonly unknown[]) => UserRouteRegistrar
  put: (...args: readonly unknown[]) => UserRouteRegistrar
}

interface UserRouteParams {
  id: string
}

interface UserRouteQuery {
  page?: number
  pageSize?: number
}

interface UserRouteSet {
  headers: Record<string, string>
  status: number
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

    let userApp = app as unknown as UserRouteRegistrar

    userApp = userApp.get(
      "/system/users",
      async ({
        query,
        request,
      }: {
        query: UserRouteQuery
        request: Request
      }) => {
        await authorize(request.headers, userPermissions.list)

        return service.list(query)
      },
      {
        query: userListQuerySchema,
        response: {
          200: userListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["user"],
          summary: "List users",
        },
      },
    )

    userApp = userApp.get(
      "/system/users/export",
      async ({ request, set }: { request: Request; set: UserRouteSet }) => {
        await authorize(request.headers, userPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["user"],
          summary: "Export users as CSV",
        },
      },
    )

    userApp = userApp.get(
      "/system/users/:id",
      async ({
        params,
        request,
      }: {
        params: UserRouteParams
        request: Request
      }) => {
        await authorize(request.headers, userPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: userRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["user"],
          summary: "Get user by id",
        },
      },
    )

    userApp = userApp.post(
      "/system/users",
      async ({
        body,
        request,
        set,
      }: {
        body: CreateUserPayload
        request: Request
        set: UserRouteSet
      }) => {
        await authorize(request.headers, userPermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: userCreateBodySchema,
        response: {
          201: userRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["user"],
          summary: "Create user",
        },
      },
    )

    userApp = userApp.put(
      "/system/users/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: UserRouteParams
        body: UpdateUserPayload
        request: Request
      }) => {
        await authorize(request.headers, userPermissions.update)

        return service.update(params.id, body)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        body: userUpdateBodySchema,
        response: {
          200: userRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["user"],
          summary: "Update user",
        },
      },
    )

    userApp = userApp.post(
      "/system/users/:id/reset-password",
      async ({
        params,
        body,
        request,
        set,
      }: {
        params: UserRouteParams
        body: { password: string }
        request: Request
        set: UserRouteSet
      }) => {
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
        response: {
          204: t.Void(),
          ...createErrorResponses(400, 401, 403, 404),
        },
        detail: {
          tags: ["user"],
          summary: "Reset user password",
        },
      },
    )

    return userApp as unknown as AnyServerApp
  },
})
