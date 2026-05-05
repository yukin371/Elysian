import { deriveBodySchema, notificationModuleSchema } from "@elysian/schema"
import { t } from "elysia"

import { createErrorResponses } from "../../openapi"
import type { AuthGuard, AuthIdentity } from "../auth"
import type { AnyServerApp, ServerModule } from "../module"
import {
  notificationBulkReadResponseSchema,
  notificationListResponseSchema,
  notificationRecordResponseSchema,
} from "./openapi"
import type { NotificationRepository } from "./repository"
import {
  type CreateNotificationPayload,
  type ListNotificationsPayload,
  createNotificationService,
} from "./service"

export interface NotificationModuleOptions {
  authGuard?: AuthGuard
}

interface NotificationRouteRegistrar {
  get: (...args: readonly unknown[]) => NotificationRouteRegistrar
  post: (...args: readonly unknown[]) => NotificationRouteRegistrar
}

interface NotificationRouteParams {
  id: string
}

interface NotificationRouteQuery extends ListNotificationsPayload {}

interface NotificationRouteSet {
  headers: Record<string, string>
  status: number
}

const notificationPermissions = {
  list: "system:notification:list",
  get: "system:notification:list",
  create: "system:notification:create",
  update: "system:notification:update",
} as const

const notificationFilterSchema = t.Object({
  recipientUserId: t.Optional(t.String()),
  title: t.Optional(t.String()),
  content: t.Optional(t.String()),
  page: t.Optional(t.Numeric()),
  pageSize: t.Optional(t.Numeric()),
  level: t.Optional(
    t.Union([
      t.Literal("info"),
      t.Literal("success"),
      t.Literal("warning"),
      t.Literal("error"),
    ]),
  ),
  status: t.Optional(t.Union([t.Literal("unread"), t.Literal("read")])),
})

const notificationCreateBodySchema = deriveBodySchema(
  notificationModuleSchema,
  {
    mode: "create",
    exclude: ["createdByUserId", "readAt", "status"],
    overrides: {
      level: t.Optional(
        t.Union([
          t.Literal("info"),
          t.Literal("success"),
          t.Literal("warning"),
          t.Literal("error"),
        ]),
      ),
    },
  },
)

export const createNotificationModule = (
  repository: NotificationRepository,
  options: NotificationModuleOptions = {},
): ServerModule => ({
  name: notificationModuleSchema.name,
  register: (app, context) => {
    const service = createNotificationService(repository)
    const authorize = async (
      headers: Headers,
      permissionCode: string,
    ): Promise<AuthIdentity | undefined> => {
      if (!options.authGuard) {
        return undefined
      }

      return options.authGuard.authorize(headers, permissionCode)
    }

    context.logger.info("Registering notification module", {
      fields: notificationModuleSchema.fields.map((field) => field.key),
    })

    let notificationApp = app as unknown as NotificationRouteRegistrar

    notificationApp = notificationApp.get(
      "/system/notifications",
      async ({
        query,
        request,
      }: {
        query: NotificationRouteQuery
        request: Request
      }) => {
        const identity = await authorize(
          request.headers,
          notificationPermissions.list,
        )

        return service.list(query, identity?.dataAccess)
      },
      {
        query: notificationFilterSchema,
        response: {
          200: notificationListResponseSchema,
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["notification"],
          summary: "List notifications",
        },
      },
    )

    notificationApp = notificationApp.get(
      "/system/notifications/export",
      async ({
        query,
        request,
        set,
      }: {
        query: NotificationRouteQuery
        request: Request
        set: NotificationRouteSet
      }) => {
        const identity = await authorize(
          request.headers,
          notificationPermissions.list,
        )

        set.headers["content-type"] = "text/csv; charset=utf-8"
        return service.exportCsv(query, identity?.dataAccess)
      },
      {
        query: notificationFilterSchema,
        response: {
          ...createErrorResponses(401, 403),
        },
        detail: {
          tags: ["notification"],
          summary: "Export notifications as CSV",
        },
      },
    )

    notificationApp = notificationApp.get(
      "/system/notifications/:id",
      async ({
        params,
        request,
      }: {
        params: NotificationRouteParams
        request: Request
      }) => {
        const identity = await authorize(
          request.headers,
          notificationPermissions.get,
        )

        return service.getById(params.id, identity?.dataAccess)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: notificationRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["notification"],
          summary: "Get notification by id",
        },
      },
    )

    notificationApp = notificationApp.post(
      "/system/notifications",
      async ({
        body,
        request,
        set,
      }: {
        body: Omit<CreateNotificationPayload, "createdByUserId" | "deptId">
        request: Request
        set: NotificationRouteSet
      }) => {
        const identity = await authorize(
          request.headers,
          notificationPermissions.create,
        )
        set.status = 201

        return service.create({
          ...body,
          createdByUserId: identity?.user.id ?? null,
          deptId: identity?.deptIds[0] ?? null,
        })
      },
      {
        body: notificationCreateBodySchema,
        response: {
          201: notificationRecordResponseSchema,
          ...createErrorResponses(400, 401, 403, 404),
        },
        detail: {
          tags: ["notification"],
          summary: "Create notification",
        },
      },
    )

    notificationApp = notificationApp.post(
      "/system/notifications/read",
      async ({
        body,
        request,
      }: {
        body: { ids: string[] }
        request: Request
      }) => {
        const identity = await authorize(
          request.headers,
          notificationPermissions.update,
        )

        return {
          items: await service.markManyAsRead(body.ids, identity?.dataAccess),
        }
      },
      {
        body: t.Object({
          ids: t.Array(t.String()),
        }),
        response: {
          200: notificationBulkReadResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["notification"],
          summary: "Mark notifications as read",
        },
      },
    )

    notificationApp = notificationApp.post(
      "/system/notifications/:id/read",
      async ({
        params,
        request,
      }: {
        params: NotificationRouteParams
        request: Request
      }) => {
        const identity = await authorize(
          request.headers,
          notificationPermissions.update,
        )

        return service.markAsRead(params.id, identity?.dataAccess)
      },
      {
        params: t.Object({
          id: t.String(),
        }),
        response: {
          200: notificationRecordResponseSchema,
          ...createErrorResponses(401, 403, 404),
        },
        detail: {
          tags: ["notification"],
          summary: "Mark notification as read",
        },
      },
    )

    return notificationApp as unknown as AnyServerApp
  },
})
