import type { DataAccessContext } from "@elysian/persistence"
import { AppError } from "../../errors"
import type {
  CreateNotificationInput,
  ListNotificationsInput,
  NotificationRepository,
} from "./repository"

export interface CreateNotificationPayload
  extends Omit<
    CreateNotificationInput,
    "recipientUserId" | "title" | "content"
  > {
  recipientUserId: string
  title: string
  content: string
}

export interface ListNotificationsPayload extends ListNotificationsInput {}

export const createNotificationService = (
  repository: NotificationRepository,
) => ({
  list: (filter?: ListNotificationsPayload, dataAccess?: DataAccessContext) =>
    repository.list(filter, dataAccess),
  async getById(id: string, dataAccess?: DataAccessContext) {
    const notification = await repository.getById(id, dataAccess)

    if (!notification) {
      throw new AppError({
        code: "NOTIFICATION_NOT_FOUND",
        message: "Notification not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return notification
  },
  async create(input: CreateNotificationPayload) {
    const recipientUserId = input.recipientUserId.trim()
    const title = input.title.trim()
    const content = input.content.trim()

    if (recipientUserId.length === 0) {
      throw new AppError({
        code: "NOTIFICATION_RECIPIENT_REQUIRED",
        message: "Notification recipient is required",
        status: 400,
        expose: true,
      })
    }

    if (title.length === 0) {
      throw new AppError({
        code: "NOTIFICATION_TITLE_REQUIRED",
        message: "Notification title is required",
        status: 400,
        expose: true,
      })
    }

    if (content.length === 0) {
      throw new AppError({
        code: "NOTIFICATION_CONTENT_REQUIRED",
        message: "Notification content is required",
        status: 400,
        expose: true,
      })
    }

    if (!(await repository.recipientExists(recipientUserId))) {
      throw new AppError({
        code: "NOTIFICATION_RECIPIENT_INVALID",
        message: "Notification recipient does not exist",
        status: 400,
        expose: true,
        details: { recipientUserId },
      })
    }

    return repository.create({
      recipientUserId,
      title,
      content,
      level: input.level,
      createdByUserId: input.createdByUserId ?? null,
      deptId: input.deptId ?? null,
    })
  },
  async markAsRead(id: string, dataAccess?: DataAccessContext) {
    const current = await repository.getById(id, dataAccess)

    if (!current) {
      throw new AppError({
        code: "NOTIFICATION_NOT_FOUND",
        message: "Notification not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    if (current.status === "read") {
      return current
    }

    const updated = await repository.markAsRead(id, dataAccess)

    if (!updated) {
      throw new AppError({
        code: "NOTIFICATION_NOT_FOUND",
        message: "Notification not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return updated
  },
})

export type NotificationService = ReturnType<typeof createNotificationService>
