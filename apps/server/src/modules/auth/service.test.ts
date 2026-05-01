import { describe, expect, it } from "bun:test"

import { createPasswordHash } from "./password"
import {
  type InMemoryAuthRepositorySeed,
  createInMemoryAuthRepository,
} from "./repository"
import { createAuthService } from "./service"

const ACCESS_TOKEN_SECRET = ["test", "access", "secret"].join("-")
const ADMIN_PASSWORD_SEGMENTS = ["admin", "123"] as const

const createAuthServiceFixture = async () => {
  const password = ADMIN_PASSWORD_SEGMENTS.join("-")
  const passwordHash = await createPasswordHash(password)
  const seed: InMemoryAuthRepositorySeed = {
    users: [
      {
        id: "user_admin_1",
        username: "admin",
        displayName: "Admin User",
        passwordHash,
        status: "active",
        isSuperAdmin: false,
        tenantId: "tenant_default_1",
        lastLoginAt: null,
        createdAt: "2026-05-02T00:00:00.000Z",
        updatedAt: "2026-05-02T00:00:00.000Z",
      },
    ],
    roles: [
      {
        id: "role_admin_1",
        code: "admin",
        name: "Administrator",
        status: "active",
        dataScope: 1,
      },
    ],
    permissions: [
      {
        id: "permission_dashboard_1",
        code: "system:dashboard:view",
        module: "system",
        resource: "dashboard",
        action: "view",
        name: "View dashboard",
      },
    ],
    menus: [
      {
        id: "menu_dashboard_1",
        parentId: null,
        type: "menu",
        code: "dashboard",
        name: "Dashboard",
        path: "/dashboard",
        component: "DashboardPage",
        icon: "dashboard",
        sort: 1,
        isVisible: true,
        status: "active",
        permissionCode: "system:dashboard:view",
      },
    ],
    userRoles: [
      {
        userId: "user_admin_1",
        roleId: "role_admin_1",
      },
    ],
    rolePermissions: [
      {
        roleId: "role_admin_1",
        permissionId: "permission_dashboard_1",
      },
    ],
    roleMenus: [
      {
        roleId: "role_admin_1",
        menuId: "menu_dashboard_1",
      },
    ],
  }
  const repository = createInMemoryAuthRepository(seed)
  const service = createAuthService(repository, {
    accessTokenSecret: ACCESS_TOKEN_SECRET,
  })

  return {
    password,
    repository,
    service,
  }
}

describe("createAuthService", () => {
  it("logs in and exposes the current refresh session", async () => {
    const fixture = await createAuthServiceFixture()

    const response = await fixture.service.login("admin", fixture.password, {
      ip: "127.0.0.1",
      requestId: "req-login-1",
      userAgent: "auth-service-test-agent",
    })
    const sessions = await fixture.service.listSessions(response.accessToken)

    expect(response.user).toEqual({
      id: "user_admin_1",
      username: "admin",
      displayName: "Admin User",
      isSuperAdmin: false,
      tenantId: "tenant_default_1",
    })
    expect(response.roles).toEqual(["admin"])
    expect(response.permissionCodes).toEqual(["system:dashboard:view"])
    expect(response.menus).toHaveLength(1)
    expect(sessions.items).toHaveLength(1)
    expect(sessions.items[0]).toMatchObject({
      isCurrent: true,
      ip: "127.0.0.1",
      revokedAt: null,
      userAgent: "auth-service-test-agent",
    })
  })

  it("rotates refresh sessions and marks the previous session revoked", async () => {
    const fixture = await createAuthServiceFixture()

    const loginResponse = await fixture.service.login("admin", fixture.password)
    const refreshResponse = await fixture.service.refresh(
      loginResponse.refreshToken,
      {
        ip: "127.0.0.2",
        requestId: "req-refresh-1",
        userAgent: "auth-service-refresh-agent",
      },
    )
    const sessions = await fixture.service.listSessions(
      refreshResponse.accessToken,
    )

    expect(refreshResponse.refreshToken).not.toBe(loginResponse.refreshToken)
    expect(sessions.items).toHaveLength(2)
    const currentSession = sessions.items.find((session) => session.isCurrent)
    const previousSession = sessions.items.find((session) => !session.isCurrent)

    expect(currentSession).toBeDefined()
    expect(previousSession).toBeDefined()
    expect(currentSession).toMatchObject({
      isCurrent: true,
      ip: "127.0.0.2",
      revokedAt: null,
      userAgent: "auth-service-refresh-agent",
    })
    expect(previousSession).toMatchObject({
      isCurrent: false,
      replacedBySessionId: currentSession?.id,
    })
    expect(previousSession?.revokedAt).not.toBeNull()
  })

  it("revokes refresh sessions on logout", async () => {
    const fixture = await createAuthServiceFixture()

    const response = await fixture.service.login("admin", fixture.password)

    await fixture.service.logout(response.refreshToken, {
      requestId: "req-logout-1",
    })

    const sessions = await fixture.service.listSessions(response.accessToken)

    expect(sessions.items).toHaveLength(1)
    expect(sessions.items[0]).toMatchObject({
      isCurrent: true,
    })
    expect(sessions.items[0]?.revokedAt).not.toBeNull()
  })
})
