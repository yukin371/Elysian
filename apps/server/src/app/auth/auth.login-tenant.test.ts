import { describe, expect, it } from "bun:test"
import { DEFAULT_TENANT_ID } from "@elysian/persistence"
import {
  createAuthModule,
  createInMemoryAuthRepository,
  createPasswordHash,
  createTenantContextModule,
  verifyAccessToken,
} from "../../modules"
import {
  createAuthTestFixture,
  createTenantContextRecorder,
  createTestApp,
  loginWithCredentials,
  refreshCookiePrefix,
  refreshWithCookie,
  tenantAdminPassword,
  testAccessTokenSecret,
  testAdminPassword,
  toCookieHeader,
} from "./test-support"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readJsonRecord = async (response: Response) => {
  const body: unknown = await response.json()

  if (!isRecord(body)) {
    throw new Error("Malformed JSON response")
  }

  return body
}

const readString = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (typeof property !== "string") {
    throw new Error(`Expected string field: ${key}`)
  }

  return property
}

const readRecord = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!isRecord(property)) {
    throw new Error(`Expected object field: ${key}`)
  }

  return property
}

const readStringArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (
    !Array.isArray(property) ||
    !property.every((item) => typeof item === "string")
  ) {
    throw new Error(`Expected string array field: ${key}`)
  }

  return property
}

const readRecordArray = (value: Record<string, unknown>, key: string) => {
  const property = value[key]

  if (!Array.isArray(property) || !property.every((item) => isRecord(item))) {
    throw new Error(`Expected object array field: ${key}`)
  }

  return property
}

describe("createServerApp auth login and tenant context", () => {
  it("logs in and returns the current auth context", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    expect(loginResponse.status).toBe(200)

    const loginBody = await readJsonRecord(loginResponse)
    const loginAccessToken = readString(loginBody, "accessToken")
    const loginUser = readRecord(loginBody, "user")
    const loginRoles = readStringArray(loginBody, "roles")
    const permissionCodes = readStringArray(loginBody, "permissionCodes")
    const menus = readRecordArray(loginBody, "menus")
    const setCookie = loginResponse.headers.get("set-cookie")

    expect(readString(loginUser, "username")).toBe("admin")
    expect(readString(loginUser, "tenantId")).toBe(DEFAULT_TENANT_ID)
    expect(loginRoles).toEqual(["admin"])
    expect(permissionCodes).toEqual(["system:user:list"])
    expect(menus.map((menu) => readString(menu, "code"))).toEqual([
      "system-user",
    ])
    expect(typeof loginAccessToken).toBe("string")
    expect(setCookie).toContain(refreshCookiePrefix)

    const meResponse = await app.handle(
      new Request("http://localhost/auth/me", {
        headers: {
          authorization: `Bearer ${loginAccessToken}`,
        },
      }),
    )

    expect(meResponse.status).toBe(200)
    expect(await meResponse.json()).toEqual({
      user: {
        id: expect.any(String),
        username: "admin",
        displayName: "Administrator",
        isSuperAdmin: true,
        tenantId: DEFAULT_TENANT_ID,
      },
      deptIds: [],
      dataScopes: [
        {
          scope: 1,
        },
      ],
      dataAccess: {
        userId: expect.any(String),
        hasAllAccess: true,
        accessibleDeptIds: [],
        allowSelf: false,
      },
      roles: ["admin"],
      permissionCodes: ["system:user:list"],
      menus: [
        {
          id: expect.any(String),
          parentId: null,
          type: "menu",
          code: "system-user",
          name: "User Management",
          path: "/system/users",
          component: "system/users/index",
          icon: "users",
          sort: 10,
          isVisible: true,
          status: "active",
          permissionCode: "system:user:list",
        },
      ],
    })
  })

  it("includes tid in the JWT access token after login", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    const loginBody = await readJsonRecord(loginResponse)
    const payload = await verifyAccessToken(
      readString(loginBody, "accessToken"),
      testAccessTokenSecret,
    )
    expect(payload.tid).toBe(DEFAULT_TENANT_ID)
  })

  it("includes tid in the JWT access token after refresh", async () => {
    const fixture = await createAuthTestFixture()
    const app = createTestApp({
      modules: [fixture.authModule],
    })
    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    const refreshResponse = await refreshWithCookie(
      app,
      toCookieHeader(loginResponse.headers.get("set-cookie")),
    )

    expect(refreshResponse.status).toBe(200)
    const refreshBody = await readJsonRecord(refreshResponse)
    const payload = await verifyAccessToken(
      readString(refreshBody, "accessToken"),
      testAccessTokenSecret,
    )
    expect(payload.tid).toBe(DEFAULT_TENANT_ID)
  })

  it("supports non-default tenant login and refresh with tenant-scoped context", async () => {
    const tenantId = "11111111-1111-4111-8111-111111111111"
    const tenantCode = "tenant-alpha"
    const tenantContext = createTenantContextRecorder()
    const fixture = await createAuthTestFixture({
      tenantId,
      isSuperAdmin: false,
      tenantContextDb: tenantContext.db,
      resolveTenantIdByCode: async (code) =>
        code === tenantCode ? tenantId : null,
    })
    const app = createTestApp({
      modules: [
        createTenantContextModule(tenantContext.db, {
          accessTokenSecret: testAccessTokenSecret,
        }),
        fixture.authModule,
      ],
    })
    const loginResponse = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: testAdminPassword,
          tenantCode,
        }),
      }),
    )

    expect(loginResponse.status).toBe(200)
    const loginBody = await readJsonRecord(loginResponse)
    const loginUser = readRecord(loginBody, "user")
    expect(readString(loginUser, "tenantId")).toBe(tenantId)
    const loginPayload = await verifyAccessToken(
      readString(loginBody, "accessToken"),
      testAccessTokenSecret,
    )
    expect(loginPayload.tid).toBe(tenantId)

    const setCookie = loginResponse.headers.get("set-cookie")
    expect(setCookie).not.toBeNull()
    expect(setCookie).toContain(`${refreshCookiePrefix}${tenantId}.`)

    const refreshResponse = await refreshWithCookie(
      app,
      toCookieHeader(setCookie),
    )

    expect(refreshResponse.status).toBe(200)
    const refreshBody = await readJsonRecord(refreshResponse)
    const refreshUser = readRecord(refreshBody, "user")
    expect(readString(refreshUser, "tenantId")).toBe(tenantId)
    const refreshPayload = await verifyAccessToken(
      readString(refreshBody, "accessToken"),
      testAccessTokenSecret,
    )
    expect(refreshPayload.tid).toBe(tenantId)
    expect(tenantContext.statements).toContain(
      `SET app.current_tenant = '${tenantId}'`,
    )
  })

  it("uses default tenant context for login when tenant context db is enabled", async () => {
    const tenantContext = createTenantContextRecorder()
    const fixture = await createAuthTestFixture({
      tenantContextDb: tenantContext.db,
    })
    const app = createTestApp({
      modules: [
        createTenantContextModule(tenantContext.db, {
          accessTokenSecret: testAccessTokenSecret,
        }),
        fixture.authModule,
      ],
    })

    const loginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    expect(loginResponse.status).toBe(200)
    expect(tenantContext.statements).toContain(
      `SET app.current_tenant = '${DEFAULT_TENANT_ID}'`,
    )
  })

  it("keeps login scoped to the requested tenant when duplicate usernames exist across tenants", async () => {
    const tenantAlphaId = "11111111-1111-4111-8111-111111111111"
    const tenantAlphaCode = "tenant-alpha"
    const tenantContext = createTenantContextRecorder()
    const defaultPasswordHash = await createPasswordHash(testAdminPassword)
    const tenantPasswordHash = await createPasswordHash(tenantAdminPassword)
    const repository = createInMemoryAuthRepository({
      users: [
        {
          id: "user_default_admin",
          username: "admin",
          displayName: "Default Administrator",
          passwordHash: defaultPasswordHash,
          status: "active",
          isSuperAdmin: true,
          tenantId: DEFAULT_TENANT_ID,
          lastLoginAt: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "user_tenant_admin",
          username: "admin",
          displayName: "Tenant Administrator",
          passwordHash: tenantPasswordHash,
          status: "active",
          isSuperAdmin: false,
          tenantId: tenantAlphaId,
          lastLoginAt: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
      roles: [
        {
          id: "role_default_admin",
          code: "admin",
          name: "Admin",
          status: "active",
          dataScope: 1,
        },
      ],
      userRoles: [
        {
          userId: "user_default_admin",
          roleId: "role_default_admin",
        },
        {
          userId: "user_tenant_admin",
          roleId: "role_default_admin",
        },
      ],
    })
    const app = createTestApp({
      modules: [
        createTenantContextModule(tenantContext.db, {
          accessTokenSecret: testAccessTokenSecret,
        }),
        createAuthModule(repository, {
          accessTokenSecret: testAccessTokenSecret,
          refreshCookieName: "elysian_refresh_token",
          tenantContextDb: tenantContext.db,
          resolveTenantIdByCode: async (code) =>
            code === tenantAlphaCode ? tenantAlphaId : null,
        }),
      ],
    })

    const defaultLoginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: testAdminPassword,
    })
    expect(defaultLoginResponse.status).toBe(200)
    const defaultLoginBody = await readJsonRecord(defaultLoginResponse)
    expect(readRecord(defaultLoginBody, "user")).toMatchObject({
      id: "user_default_admin",
      tenantId: DEFAULT_TENANT_ID,
    })

    const tenantLoginResponse = await loginWithCredentials(app, {
      username: "admin",
      password: tenantAdminPassword,
      tenantCode: tenantAlphaCode,
    })
    expect(tenantLoginResponse.status).toBe(200)
    const tenantLoginBody = await readJsonRecord(tenantLoginResponse)
    expect(readRecord(tenantLoginBody, "user")).toMatchObject({
      id: "user_tenant_admin",
      tenantId: tenantAlphaId,
    })
  })
})
