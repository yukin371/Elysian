import { describe, expect, it } from "bun:test"
import {
  createAuthTestFixture,
  createNotificationSeedRecords,
  createTestApp,
  loginAsAdmin,
} from "./app.operations.test-helpers"
import { errorCodes } from "./errors/registry"
import {
  createInMemoryNotificationRepository,
  createNotificationModule,
} from "./modules"

describe("createServerApp notifications", () => {
  it("publishes notification success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:notification:list",
        "system:notification:create",
        "system:notification:update",
      ],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(createInMemoryNotificationRepository(), {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const response = await app.handle(
      new Request("http://localhost/openapi/json"),
    )

    expect(response.status).toBe(200)
    const payload = (await response.json()) as {
      paths: Record<
        string,
        Record<string, { responses?: Record<string, unknown> }>
      >
    }

    expect(
      payload.paths["/system/notifications"]?.get?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications"]?.get?.responses?.["401"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications"]?.post?.responses?.["201"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications"]?.post?.responses?.["400"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications/{id}"]?.get?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications/{id}"]?.get?.responses?.["404"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications/read"]?.post?.responses?.["200"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications/read"]?.post?.responses?.["404"],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications/{id}/read"]?.post?.responses?.[
        "200"
      ],
    ).toBeDefined()
    expect(
      payload.paths["/system/notifications/{id}/read"]?.post?.responses?.[
        "404"
      ],
    ).toBeDefined()
  })

  it("lists, filters, gets, creates, and marks notifications as read", async () => {
    const fixture = await createAuthTestFixture({
      permissions: [
        "system:notification:list",
        "system:notification:create",
        "system:notification:update",
      ],
      isSuperAdmin: false,
    })
    const notificationRepository = createInMemoryNotificationRepository({
      notifications: createNotificationSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(notificationRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        createNotificationSeedRecords()[1],
        createNotificationSeedRecords()[0],
      ],
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const pagedResponse = await app.handle(
      new Request("http://localhost/system/notifications?page=2&pageSize=1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(pagedResponse.status).toBe(200)
    expect(await pagedResponse.json()).toEqual({
      items: [createNotificationSeedRecords()[0]],
      total: 2,
      page: 2,
      pageSize: 1,
      totalPages: 2,
    })

    const filteredResponse = await app.handle(
      new Request(
        "http://localhost/system/notifications?status=unread&recipientUserId=user_ops_1&title=maintenance&content=22%3A00&level=info",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(filteredResponse.status).toBe(200)
    expect(await filteredResponse.json()).toEqual({
      items: [createNotificationSeedRecords()[0]],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const exportResponse = await app.handle(
      new Request(
        "http://localhost/system/notifications/export?status=unread&recipientUserId=user_ops_1&title=maintenance&content=22%3A00&level=info",
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(exportResponse.status).toBe(200)
    expect(exportResponse.headers.get("content-type")).toContain("text/csv")

    const exportText = await exportResponse.text()
    expect(exportText).toContain(
      "id,recipientUserId,title,content,level,status,createdByUserId,readAt,createdAt",
    )
    expect(exportText).toContain(
      "notification_1,user_ops_1,Platform Maintenance,Platform maintenance starts at 22:00.,info,unread,user_admin_1,,2026-04-21T04:00:00.000Z",
    )
    expect(exportText).not.toContain("notification_2")

    const getResponse = await app.handle(
      new Request("http://localhost/system/notifications/notification_1", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual(createNotificationSeedRecords()[0])

    const createResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId: "user_ops_1",
          title: "New Approval Pending",
          content: "A new approval request is waiting.",
          level: "warning",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdNotification = (await createResponse.json()) as {
      id: string
      recipientUserId: string
      title: string
      content: string
      level: string
      status: string
      createdByUserId?: string
      readAt?: string
      createdAt: string
    }
    expect(createdNotification.id).toEqual(expect.any(String))
    expect(createdNotification.recipientUserId).toBe("user_ops_1")
    expect(createdNotification.title).toBe("New Approval Pending")
    expect(createdNotification.content).toBe(
      "A new approval request is waiting.",
    )
    expect(createdNotification.level).toBe("warning")
    expect(createdNotification.status).toBe("unread")
    expect(createdNotification.createdByUserId).toEqual(expect.any(String))
    expect(createdNotification.readAt).toBeUndefined()
    expect(createdNotification.createdAt).toEqual(expect.any(String))

    const readResponse = await app.handle(
      new Request(
        `http://localhost/system/notifications/${createdNotification.id}/read`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    )

    expect(readResponse.status).toBe(200)
    expect(await readResponse.json()).toEqual({
      ...createdNotification,
      status: "read",
      readAt: expect.any(String),
    })

    const bulkReadResponse = await app.handle(
      new Request("http://localhost/system/notifications/read", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ids: [
            "notification_1",
            "notification_2",
            createdNotification.id,
            "missing_notification",
          ],
        }),
      }),
    )

    expect(bulkReadResponse.status).toBe(200)
    expect(await bulkReadResponse.json()).toEqual({
      items: [
        {
          ...createNotificationSeedRecords()[0],
          status: "read",
          readAt: expect.any(String),
        },
      ],
    })
  })

  it("keeps department-scoped notifications visible after creation", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:notification:list", "system:notification:create"],
      isSuperAdmin: false,
      dataScope: 4,
      userDepartmentIds: ["department_root_1"],
      departments: [
        {
          id: "department_root_1",
          parentId: null,
        },
        {
          id: "department_ops_1",
          parentId: "department_root_1",
        },
      ],
    })
    const notificationRepository = createInMemoryNotificationRepository({
      notifications: [
        {
          id: "notification_visible_ops_1",
          recipientUserId: "user_ops_1",
          title: "Ops Notice",
          content: "Visible to root descendants.",
          level: "info",
          status: "unread",
          createdByUserId: "user_other_1",
          deptId: "department_ops_1",
          createdAt: "2026-04-21T04:00:00.000Z",
        },
        {
          id: "notification_hidden_other_1",
          recipientUserId: "user_ops_1",
          title: "Other Notice",
          content: "Should stay hidden.",
          level: "warning",
          status: "unread",
          createdByUserId: "user_other_2",
          deptId: "department_other_1",
          createdAt: "2026-04-21T05:00:00.000Z",
        },
      ],
      availableUserIds: [fixture.userId, "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(notificationRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const listBeforeCreateResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listBeforeCreateResponse.status).toBe(200)
    expect(await listBeforeCreateResponse.json()).toEqual({
      items: [
        {
          id: "notification_visible_ops_1",
          recipientUserId: "user_ops_1",
          title: "Ops Notice",
          content: "Visible to root descendants.",
          level: "info",
          status: "unread",
          createdByUserId: "user_other_1",
          createdAt: "2026-04-21T04:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const createResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId: "user_ops_1",
          title: "Root Notice",
          content: "Created inside root scope.",
          level: "success",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)
    const createdNotification = (await createResponse.json()) as {
      id: string
      recipientUserId: string
      title: string
      content: string
      level: string
      status: string
      createdByUserId?: string
      createdAt: string
    }

    const listAfterCreateResponse = await app.handle(
      new Request("http://localhost/system/notifications", {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
    )

    expect(listAfterCreateResponse.status).toBe(200)
    const listAfterCreateBody = (await listAfterCreateResponse.json()) as {
      items: Array<{ id: string }>
      total: number
      page: number
      pageSize: number
      totalPages: number
    }
    expect(listAfterCreateBody.items.map((item) => item.id)).toEqual([
      createdNotification.id,
      "notification_visible_ops_1",
    ])
    expect(listAfterCreateBody.total).toBe(2)
    expect(listAfterCreateBody.page).toBe(1)
    expect(listAfterCreateBody.pageSize).toBe(20)
    expect(listAfterCreateBody.totalPages).toBe(1)
  })

  it("rejects invalid notification recipients", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:notification:create"],
      isSuperAdmin: false,
    })
    const notificationRepository = createInMemoryNotificationRepository({
      notifications: createNotificationSeedRecords(),
      availableUserIds: ["user_admin_1", "user_ops_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createNotificationModule(notificationRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/notifications", {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          recipientUserId: "missing_user",
          title: "Missing recipient",
          content: "Should fail",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.NOTIFICATION_RECIPIENT_INVALID,
      message: "Notification recipient does not exist",
      status: 400,
      details: {
        recipientUserId: "missing_user",
      },
    })
  })
})
