import { describe, expect, it } from "bun:test"
import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  createAuthGuard,
  createAuthModule,
  createGeneratorSessionModule,
  createInMemoryAuthRepository,
  createInMemoryGeneratorSessionRepository,
  createPasswordHash,
} from ".."
import { createServerApp, type CreateServerAppOptions } from "../../app"
import { createServerConfig } from "../../config"
import type { ServerLogger } from "../../logging"

const silentLogger: ServerLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
}

const testAccessTokenSecret = ["test", "access", "secret"].join("-")
const testAdminPassword = ["admin", "123"].join("")

const createTestApp = (
  modules: NonNullable<CreateServerAppOptions["modules"]>,
) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
    }),
    logger: silentLogger,
    modules,
  })

const loginAsAdmin = async (app: ReturnType<typeof createTestApp>) => {
  const response = await app.handle(
    new Request("http://localhost/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: testAdminPassword,
      }),
    }),
  )
  const body = (await response.json()) as {
    accessToken: string
  }

  return body.accessToken
}

const createAuthorizedHeaders = (
  accessToken: string,
  extraHeaders: Record<string, string> = {},
) => ({
  authorization: `Bearer ${accessToken}`,
  ...extraHeaders,
})

const createAuthFixture = async () => {
  const adminRoleId = crypto.randomUUID()
  const userId = crypto.randomUUID()
  const userMenuId = crypto.randomUUID()
  const passwordHash = await createPasswordHash(testAdminPassword)
  const permission = {
    id: crypto.randomUUID(),
    code: "system:user:list",
    module: "system",
    resource: "user",
    action: "list",
    name: "system:user:list",
  }
  const repository = createInMemoryAuthRepository({
    users: [
      {
        id: userId,
        username: "admin",
        displayName: "Admin",
        email: "admin@example.com",
        phone: "13800000000",
        passwordHash,
        status: "active",
        isSuperAdmin: true,
        tenantId: "tenant-default",
        lastLoginAt: null,
        createdAt: "2026-04-20T00:00:00.000Z",
        updatedAt: "2026-04-20T00:00:00.000Z",
      },
    ],
    roles: [
      {
        id: adminRoleId,
        code: "admin",
        name: "Admin",
        status: "active",
        dataScope: 1,
      },
    ],
    permissions: [permission],
    menus: [
      {
        id: userMenuId,
        parentId: null,
        type: "menu",
        code: "system-user",
        name: "Users",
        path: "/system/users",
        component: "system/users/index",
        icon: "user",
        sort: 1,
        isVisible: true,
        status: "active",
        permissionCode: permission.code,
      },
    ],
    userRoles: [
      {
        userId,
        roleId: adminRoleId,
      },
    ],
    rolePermissions: [
      {
        roleId: adminRoleId,
        permissionId: permission.id,
      },
    ],
    roleMenus: [
      {
        roleId: adminRoleId,
        menuId: userMenuId,
      },
    ],
  })

  return {
    repository,
    userId,
    authGuard: createAuthGuard(repository, {
      accessTokenSecret: testAccessTokenSecret,
    }),
    authModule: createAuthModule(repository, {
      accessTokenSecret: testAccessTokenSecret,
    }),
  }
}

describe("generator session module", () => {
  it("creates, lists, and gets generator preview sessions", async () => {
    const fixture = await createAuthFixture()
    const repository = createInMemoryGeneratorSessionRepository()
    const outputDir = await mkdtemp(
      join(tmpdir(), "elysian-generator-session-output-"),
    )
    const reportRootDir = await mkdtemp(
      join(tmpdir(), "elysian-generator-session-report-"),
    )
    const app = createTestApp([
      fixture.authModule,
      createGeneratorSessionModule(repository, {
        authGuard: fixture.authGuard,
        reportRootDir,
        resolveOutputDir: () => outputDir,
        auditLogWriter: (event) =>
          fixture.repository.createAuditLog({
            category: "generator",
            ...event,
          }),
      }),
    ])
    const accessToken = await loginAsAdmin(app)

    const createResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          ...createAuthorizedHeaders(accessToken, {
            "content-type": "application/json",
            "user-agent": "generator-session-test-agent",
            "x-request-id": "req-generator-session-1",
          }),
        },
        body: JSON.stringify({
          schemaName: "customer",
          frontendTarget: "vue",
          conflictStrategy: "fail",
          targetPreset: "staging",
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createBody = (await createResponse.json()) as {
      session: {
        id: string
        actorUserId: string
        actorUsername: string
        previewFileCount: number
        reportPath: string
        schemaName: string
        sourceType: string
      }
      report: {
        schemaName: string
        sqlPreview: {
          tableName: string
        }
      }
    }

    expect(createBody.session.schemaName).toBe("customer")
    expect(createBody.session.sourceType).toBe("registered-schema")
    expect(createBody.session.actorUsername).toBe("admin")
    expect(createBody.session.previewFileCount).toBe(5)
    expect(createBody.report.schemaName).toBe("customer")
    expect(createBody.report.sqlPreview.tableName).toBe("customer")

    const reportContents = await readFile(createBody.session.reportPath, "utf8")
    expect(reportContents).toContain('"schemaName": "customer"')

    const listResponse = await app.handle(
      new Request("http://localhost/studio/generator/sessions", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )
    expect(listResponse.status).toBe(200)

    const listBody = (await listResponse.json()) as {
      items: Array<{ id: string; schemaName: string }>
    }
    expect(listBody.items).toHaveLength(1)
    expect(listBody.items[0]).toMatchObject({
      id: createBody.session.id,
      schemaName: "customer",
    })

    const detailResponse = await app.handle(
      new Request(
        `http://localhost/studio/generator/sessions/${createBody.session.id}`,
        {
          headers: createAuthorizedHeaders(accessToken),
        },
      ),
    )
    expect(detailResponse.status).toBe(200)

    const detailBody = (await detailResponse.json()) as {
      id: string
      report: {
        schemaName: string
      }
    }
    expect(detailBody).toMatchObject({
      id: createBody.session.id,
      report: {
        schemaName: "customer",
      },
    })

    const auditLog = (await fixture.repository.listAuditLogs()).find(
      (entry) => entry.action === "preview_create",
    )
    expect(auditLog).toMatchObject({
      category: "generator",
      action: "preview_create",
      actorUserId: createBody.session.actorUserId,
      targetType: "generator-session",
      targetId: createBody.session.id,
      requestId: "req-generator-session-1",
      userAgent: "generator-session-test-agent",
      result: "success",
    })
  })

  it("requires authentication for generator preview sessions when auth guard is configured", async () => {
    const fixture = await createAuthFixture()
    const repository = createInMemoryGeneratorSessionRepository()
    const app = createTestApp([
      fixture.authModule,
      createGeneratorSessionModule(repository, {
        authGuard: fixture.authGuard,
      }),
    ])

    const response = await app.handle(
      new Request("http://localhost/studio/generator/sessions/preview", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          schemaName: "customer",
        }),
      }),
    )

    expect(response.status).toBe(401)
  })
})
