import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"
import { createInMemoryMenuRepository, createMenuModule } from "../../modules"
import {
  createAuthTestFixture,
  createAuthorizedHeaders,
  createMenuSeedRecords,
  createTestApp,
  loginAsAdmin,
  testAdminPassword,
} from "./test-support"

describe("createServerApp system menu access", () => {
  it("publishes menu success responses in the openapi spec", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:list"],
      isSuperAdmin: false,
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(createInMemoryMenuRepository(), {
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

    expect(payload.paths["/system/menus"]?.get?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/system/menus"]?.get?.responses?.["401"]).toBeDefined()
    expect(payload.paths["/system/menus"]?.post?.responses?.["201"]).toBeDefined()
    expect(payload.paths["/system/menus"]?.post?.responses?.["400"]).toBeDefined()
    expect(payload.paths["/system/menus/{id}"]?.get?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/system/menus/{id}"]?.put?.responses?.["200"]).toBeDefined()
    expect(payload.paths["/system/menus/{id}"]?.put?.responses?.["404"]).toBeDefined()
  })

  it("lists and gets system menus when the access token has menu-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:list"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:menu:list",
        "system:menu:update",
      ],
      availableRoleIds: ["role_admin_1", "role_operator_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const listResponse = await app.handle(
      new Request("http://localhost/system/menus", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(listResponse.status).toBe(200)
    expect(await listResponse.json()).toEqual({
      items: [
        {
          id: "menu_system_root_1",
          parentId: null,
          type: "directory",
          code: "system-root",
          name: "System",
          path: "/system",
          component: null,
          icon: "settings",
          sort: 10,
          isVisible: true,
          status: "active",
          permissionCode: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "menu_system_users_1",
          parentId: "menu_system_root_1",
          type: "menu",
          code: "system-users",
          name: "Users",
          path: "/system/users",
          component: "system/users/index",
          icon: "users",
          sort: 11,
          isVisible: true,
          status: "active",
          permissionCode: "system:user:list",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
        {
          id: "menu_system_roles_1",
          parentId: "menu_system_root_1",
          type: "menu",
          code: "system-roles",
          name: "Roles",
          path: "/system/roles",
          component: "system/roles/index",
          icon: "shield",
          sort: 12,
          isVisible: true,
          status: "active",
          permissionCode: "system:role:list",
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
    })

    const getResponse = await app.handle(
      new Request("http://localhost/system/menus/menu_system_users_1", {
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
        },
      }),
    )

    expect(getResponse.status).toBe(200)
    expect(await getResponse.json()).toEqual({
      id: "menu_system_users_1",
      parentId: "menu_system_root_1",
      type: "menu",
      code: "system-users",
      name: "Users",
      path: "/system/users",
      component: "system/users/index",
      icon: "users",
      sort: 11,
      isVisible: true,
      status: "active",
      permissionCode: "system:user:list",
      roleIds: ["role_admin_1"],
      createdAt: "2026-04-21T00:00:00.000Z",
      updatedAt: "2026-04-21T00:00:00.000Z",
    })
  })

  it("exports system menus as csv when the access token has menu-list permission", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:list"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: ["system:user:list", "system:role:list"],
      availableRoleIds: ["role_admin_1", "role_operator_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const accessToken = await loginAsAdmin(app)

    const response = await app.handle(
      new Request("http://localhost/system/menus/export", {
        headers: createAuthorizedHeaders(accessToken),
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toContain("text/csv")

    const text = await response.text()
    expect(text).toContain(
      "id,parentId,type,code,name,path,component,icon,sort,isVisible,status,permissionCode,createdAt,updatedAt",
    )
    expect(text).toContain(
      "menu_system_root_1,,directory,system-root,System,/system,,settings,10,true,active,,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
    expect(text).toContain(
      "menu_system_users_1,menu_system_root_1,menu,system-users,Users,/system/users,system/users/index,users,11,true,active,system:user:list,2026-04-21T00:00:00.000Z,2026-04-21T00:00:00.000Z",
    )
  })

  it("creates and updates menus with parent, permission, and role bindings", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:list", "system:menu:update"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: [
        "system:user:list",
        "system:role:list",
        "system:menu:list",
        "system:menu:update",
        "customer:customer:list",
      ],
      availableRoleIds: ["role_admin_1", "role_operator_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const createResponse = await app.handle(
      new Request("http://localhost/system/menus", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "menu_system_root_1",
          type: "menu",
          code: "system-menus",
          name: "Menus",
          path: "/system/menus",
          component: "system/menus/index",
          icon: "menu",
          sort: 13,
          permissionCode: "system:menu:list",
          roleIds: ["role_admin_1"],
        }),
      }),
    )

    expect(createResponse.status).toBe(201)

    const createdMenu = (await createResponse.json()) as {
      id: string
      parentId: string | null
      type: string
      code: string
      name: string
      path: string | null
      component: string | null
      icon: string | null
      sort: number
      isVisible: boolean
      status: string
      permissionCode: string | null
      roleIds: string[]
      createdAt: string
      updatedAt: string
    }

    expect(createdMenu).toEqual({
      id: expect.any(String),
      parentId: "menu_system_root_1",
      type: "menu",
      code: "system-menus",
      name: "Menus",
      path: "/system/menus",
      component: "system/menus/index",
      icon: "menu",
      sort: 13,
      isVisible: true,
      status: "active",
      permissionCode: "system:menu:list",
      roleIds: ["role_admin_1"],
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    const updateResponse = await app.handle(
      new Request(`http://localhost/system/menus/${createdMenu.id}`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Menu Registry",
          isVisible: false,
          roleIds: ["role_admin_1", "role_operator_1"],
        }),
      }),
    )

    expect(updateResponse.status).toBe(200)
    expect(await updateResponse.json()).toEqual({
      ...createdMenu,
      name: "Menu Registry",
      isVisible: false,
      roleIds: ["role_admin_1", "role_operator_1"],
      updatedAt: expect.any(String),
    })
  })

  it("rejects invalid menu relations", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:update"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: ["system:menu:list"],
      availableRoleIds: ["role_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }

    const response = await app.handle(
      new Request("http://localhost/system/menus", {
        method: "POST",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "missing-parent",
          type: "menu",
          code: "bad-menu",
          name: "Bad Menu",
          permissionCode: "system:menu:update",
          roleIds: ["role_unknown_1"],
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.MENU_PARENT_INVALID,
      message: "Menu parent does not exist",
      status: 400,
      details: {
        parentId: "missing-parent",
      },
    })
  })

  it("rejects menu parent cycles", async () => {
    const fixture = await createAuthTestFixture({
      permissions: ["system:menu:update"],
      isSuperAdmin: false,
    })
    const menuRepository = createInMemoryMenuRepository({
      menus: createMenuSeedRecords(),
      availablePermissionCodes: ["system:menu:update"],
      availableRoleIds: ["role_admin_1"],
    })
    const app = createTestApp({
      modules: [
        fixture.authModule,
        createMenuModule(menuRepository, {
          authGuard: fixture.authGuard,
        }),
      ],
    })
    const loginResponse = await app.handle(
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
    const loginBody = (await loginResponse.json()) as {
      accessToken: string
    }
    const response = await app.handle(
      new Request("http://localhost/system/menus/menu_system_root_1", {
        method: "PUT",
        headers: {
          authorization: `Bearer ${loginBody.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          parentId: "menu_system_users_1",
        }),
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      code: errorCodes.MENU_PARENT_INVALID,
      message: "Menu parent would create a cycle",
      status: 400,
      details: {
        id: "menu_system_root_1",
        parentId: "menu_system_users_1",
      },
    })
  })
})
