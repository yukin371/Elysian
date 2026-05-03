import { deriveBodySchema, postModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import { postListResponseSchema, postRecordResponseSchema } from "./openapi"
import type { PostRepository } from "./repository"
import { createPostService } from "./service"

export interface PostModuleOptions {
  authGuard?: AuthGuard
}

const postPermissions = {
  list: "system:post:list",
  get: "system:post:list",
  create: "system:post:create",
  update: "system:post:update",
} as const

const postCreateBodySchema = deriveBodySchema(postModuleSchema, {
  mode: "create",
  overrides: {
    sort: t.Optional(t.Number()),
    status: t.Optional(t.Union([t.Literal("active"), t.Literal("disabled")])),
  },
})

const postUpdateBodySchema = deriveBodySchema(postModuleSchema, {
  mode: "update",
})

export const createPostModule = (
  repository: PostRepository,
  options: PostModuleOptions = {},
): ServerModule => ({
  name: postModuleSchema.name,
  register: (app, context) => {
    const service = createPostService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return
      }

      await options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering post module", {
      fields: postModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/system/posts",
        async ({ request }) => {
          await authorize(request.headers, postPermissions.list)

          return {
            items: await service.list(),
          }
        },
        {
          response: {
            200: postListResponseSchema,
          },
          detail: {
            tags: ["post"],
            summary: "List posts",
          },
        },
      )
      .get(
        "/system/posts/export",
        async ({ request, set }) => {
          await authorize(request.headers, postPermissions.list)

          set.headers["content-type"] = "text/csv; charset=utf-8"
          return service.exportCsv()
        },
        {
          detail: {
            tags: ["post"],
            summary: "Export posts as CSV",
          },
        },
      )
      .get(
        "/system/posts/:id",
        async ({ params, request }) => {
          await authorize(request.headers, postPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          response: {
            200: postRecordResponseSchema,
          },
          detail: {
            tags: ["post"],
            summary: "Get post by id",
          },
        },
      )
      .post(
        "/system/posts",
        async ({ body, request, set }) => {
          await authorize(request.headers, postPermissions.create)
          set.status = 201

          return service.create(body)
        },
        {
          body: postCreateBodySchema,
          response: {
            201: postRecordResponseSchema,
          },
          detail: {
            tags: ["post"],
            summary: "Create post",
          },
        },
      )
      .put(
        "/system/posts/:id",
        async ({ params, body, request }) => {
          await authorize(request.headers, postPermissions.update)

          return service.update(params.id, body)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          body: postUpdateBodySchema,
          response: {
            200: postRecordResponseSchema,
          },
          detail: {
            tags: ["post"],
            summary: "Update post",
          },
        },
      )
  },
})
