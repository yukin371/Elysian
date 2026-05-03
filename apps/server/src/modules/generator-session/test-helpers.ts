import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import {
  buildMigrationProposalSnapshot,
  writeMigrationProposalSnapshot,
} from "@elysian/persistence"
import {
  createAuthGuard,
  createAuthModule,
  createGeneratorSessionModule,
  createInMemoryAuthRepository,
  createInMemoryGeneratorSessionRepository,
  createPasswordHash,
} from ".."
import { type CreateServerAppOptions, createServerApp } from "../../app"
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

type GeneratorSessionModuleOptions = NonNullable<
  Parameters<typeof createGeneratorSessionModule>[1]
>

export const createTestApp = (
  modules: NonNullable<CreateServerAppOptions["modules"]>,
) =>
  createServerApp({
    config: createServerConfig({
      env: "test",
    }),
    logger: silentLogger,
    modules,
  })

export const loginAsAdmin = async (app: ReturnType<typeof createTestApp>) => {
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

export const createAuthorizedHeaders = (
  accessToken: string,
  extraHeaders: Record<string, string> = {},
) => ({
  authorization: `Bearer ${accessToken}`,
  ...extraHeaders,
})

export const writeMigrationProposalSnapshotFixture = async (
  reportPath: string,
  schemaName: string,
  sessionId: string,
  databaseChangePlan: Parameters<
    typeof buildMigrationProposalSnapshot
  >[0]["databaseChangePlan"],
) => {
  await writeMigrationProposalSnapshot(
    buildMigrationProposalSnapshot({
      databaseChangePlan,
      generatedAt: "2026-04-20T00:00:00.000Z",
      reportPath,
      schemaName,
      sessionId,
    }),
  )
}

export const createAuthFixture = async () => {
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

export const createGeneratorSessionAuthenticatedContext = async (
  options: Pick<GeneratorSessionModuleOptions, "auditLogWriter"> = {},
) => {
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
      auditLogWriter: options.auditLogWriter,
    }),
  ])
  const accessToken = await loginAsAdmin(app)

  return {
    fixture,
    repository,
    outputDir,
    reportRootDir,
    app,
    accessToken,
  }
}
