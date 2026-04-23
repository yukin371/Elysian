import { notificationModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { NotificationRepository } from "./repository"
import { createNotificationService } from "./service"

export interface NotificationModuleOptions {
  authGuard?: AuthGuard
}

const notificationPermissions = {
  list: "system:notification:list",
  get: "system:notification:list",
  create: "system:notification:create",
  update: "system:notification:update",
} as const

const notificationFilterSchema = t.Object({
  recipientUserId: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal("unread"), t.Literal("read")])),
})

export const createNotificationModule = (
  repository: NotificationRepository,
  options: NotificationModuleOptions = {},
): ServerModule => ({
  name: notificationModuleSchema.name,
  register: (app, context) => {
    const service = createNotificationService(repository)
    const authorize = async (headers: Headers, permissionCode: string) => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering notification module", {
      fields: notificationModuleSchema.fields.map((field) => field.key),
    })

    return app
      .get(
        "/system/notifications",
        async ({ query, request }) => {
          await authorize(request.headers, notificationPermissions.list)

          return {
            items: await service.list(query),
          }
        },
        {
          query: notificationFilterSchema,
          detail: {
            tags: ["notification"],
            summary: "List notifications",
          },
        },
      )
      .get(
        "/system/notifications/:id",
        async ({ params, request }) => {
          await authorize(request.headers, notificationPermissions.get)

          return service.getById(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["notification"],
            summary: "Get notification by id",
          },
        },
      )
      .post(
        "/system/notifications",
        async ({ body, request, set }) => {
          const identity = await authorize(
            request.headers,
            notificationPermissions.create,
          )
          set.status = 201

          return service.create({
            ...body,
            createdByUserId: identity?.user.id ?? null,
          })
        },
        {
          body: t.Object({
            recipientUserId: t.String({ minLength: 1 }),
            title: t.String({ minLength: 1 }),
            content: t.String({ minLength: 1 }),
            level: t.Optional(
              t.Union([
                t.Literal("info"),
                t.Literal("success"),
                t.Literal("warning"),
                t.Literal("error"),
              ]),
            ),
          }),
          detail: {
            tags: ["notification"],
            summary: "Create notification",
          },
        },
      )
      .post(
        "/system/notifications/:id/read",
        async ({ params, request }) => {
          await authorize(request.headers, notificationPermissions.update)

          return service.markAsRead(params.id)
        },
        {
          params: t.Object({
            id: t.String(),
          }),
          detail: {
            tags: ["notification"],
            summary: "Mark notification as read",
          },
        },
      )
  },
})
