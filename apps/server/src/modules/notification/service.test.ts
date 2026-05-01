import { describe, expect, it } from "bun:test"

import {
  type InMemoryNotificationRepositorySeed,
  createInMemoryNotificationRepository,
} from "./repository"
import { createNotificationService } from "./service"

const createNotificationSeed = (): InMemoryNotificationRepositorySeed => ({
  availableUserIds: ["user_alpha_1", "user_beta_1"],
  notifications: [
    {
      id: "notification_alpha_1",
      recipientUserId: "user_alpha_1",
      title: "Alpha Notice",
      content: "Pending review",
      level: "info",
      status: "unread",
      createdByUserId: "user_admin_1",
      createdAt: "2026-04-24T00:00:00.000Z",
      deptId: "dept_alpha_1",
    },
    {
      id: "notification_alpha_2",
      recipientUserId: "user_alpha_1",
      title: "Alpha Read",
      content: "Already read",
      level: "success",
      status: "read",
      createdByUserId: "user_admin_1",
      readAt: "2026-04-24T01:00:00.000Z",
      createdAt: "2026-04-24T01:00:00.000Z",
      deptId: "dept_alpha_1",
    },
  ],
})

describe("createNotificationService", () => {
  it("trims create payload and defaults creator fields", async () => {
    const service = createNotificationService(
      createInMemoryNotificationRepository(createNotificationSeed()),
    )

    const notification = await service.create({
      recipientUserId: "  user_beta_1  ",
      title: "  Hello  ",
      content: "  World  ",
    })

    expect(notification.recipientUserId).toBe("user_beta_1")
    expect(notification.title).toBe("Hello")
    expect(notification.content).toBe("World")
    expect(notification.status).toBe("unread")
  })

  it("rejects unknown recipients during create", async () => {
    const service = createNotificationService(
      createInMemoryNotificationRepository(createNotificationSeed()),
    )

    await expect(
      service.create({
        recipientUserId: "user_missing_1",
        title: "Hello",
        content: "World",
      }),
    ).rejects.toMatchObject({
      code: "NOTIFICATION_RECIPIENT_INVALID",
      status: 400,
      details: {
        recipientUserId: "user_missing_1",
      },
    })
  })

  it("deduplicates ids when marking many notifications as read", async () => {
    const service = createNotificationService(
      createInMemoryNotificationRepository(createNotificationSeed()),
    )

    const items = await service.markManyAsRead([
      " notification_alpha_1 ",
      "notification_alpha_1",
      "notification_alpha_2",
      "   ",
    ])

    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      id: "notification_alpha_1",
      status: "read",
    })
  })
})
