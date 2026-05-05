import { deriveBodySchema, postModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import { postListResponseSchema, postRecordResponseSchema } from "./openapi"
import type { PostRepository } from "./repository"
import {
  type CreatePostPayload,
  type UpdatePostPayload,
  createPostService,
} from "./service"

export interface PostModuleOptions {
  authGuard?: AuthGuard
}

interface PostRouteRegistrar {
  get: (...args: readonly unknown[]) => PostRouteRegistrar
  post: (...args: readonly unknown[]) => PostRouteRegistrar
  put: (...args: readonly unknown[]) => PostRouteRegistrar
}

interface PostRouteParams {
  id: string
}

interface PostRouteSet {
  headers: Record<string, string>
  status: number
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

    let postApp = app as unknown as PostRouteRegistrar

    postApp = postApp.get(
      "/system/posts",
      async ({ request }: { request: Request }) => {
        await authorize(request.headers, postPermissions.list)

        return {
          items: await service.list(),
        }
      },
      {
        response: {
          200: postListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["post"],
          summary: "List posts",
        },
      },
    )

    postApp = postApp.get(
      "/system/posts/export",
      async ({ request, set }: { request: Request; set: PostRouteSet }) => {
        await authorize(request.headers, postPermissions.list)

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv()
      },
      {
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["post"],
          summary: "Export posts as CSV",
        },
      },
    )

    postApp = postApp.get(
      "/system/posts/:id",
      async ({
        params,
        request,
      }: {
        params: PostRouteParams
        request: Request
      }) => {
        await authorize(request.headers, postPermissions.get)

        return service.getById(params.id)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: postRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["post"],
          summary: "Get post by id",
        },
      },
    )

    postApp = postApp.post(
      "/system/posts",
      async ({
        body,
        request,
        set,
      }: {
        body: CreatePostPayload
        request: Request
        set: PostRouteSet
      }) => {
        await authorize(request.headers, postPermissions.create)
        set.status = 201

        return service.create(body)
      },
      {
        body: postCreateBodySchema,
        response: {
          201: postRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 409),
        },
        detail: {
          tags: ["post"],
          summary: "Create post",
        },
      },
    )

    postApp = postApp.put(
      "/system/posts/:id",
      async ({
        params,
        body,
        request,
      }: {
        params: PostRouteParams
        body: UpdatePostPayload
        request: Request
      }) => {
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
          ...createErrorResponses(400, 401, 403, 404, 409),
        },
        detail: {
          tags: ["post"],
          summary: "Update post",
        },
      },
    )

    return postApp as unknown as AnyServerApp
  },
})
