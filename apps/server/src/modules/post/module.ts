import { postModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
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
          detail: {
            tags: ["post"],
            summary: "List posts",
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
          body: t.Object({
            code: t.String({ minLength: 1 }),
            name: t.String({ minLength: 1 }),
            sort: t.Optional(t.Number()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            remark: t.Optional(t.String()),
          }),
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
          body: t.Object({
            code: t.Optional(t.String({ minLength: 1 })),
            name: t.Optional(t.String({ minLength: 1 })),
            sort: t.Optional(t.Number()),
            status: t.Optional(
              t.Union([t.Literal("active"), t.Literal("disabled")]),
            ),
            remark: t.Optional(t.String()),
          }),
          detail: {
            tags: ["post"],
            summary: "Update post",
          },
        },
      )
  },
})
