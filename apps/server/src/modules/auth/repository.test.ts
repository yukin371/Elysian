import { describe, expect, it } from "bun:test"

import { createInMemoryAuthRepository } from "./repository"

describe("createInMemoryAuthRepository data scope profile", () => {
  it("returns all access for scope 1", async () => {
    const repository = createInMemoryAuthRepository({
      roles: [
        {
          id: "role_all_1",
          code: "all",
          name: "All Access",
          status: "active",
          dataScope: 1,
        },
      ],
      userRoles: [
        {
          userId: "user_scope_all_1",
          roleId: "role_all_1",
        },
      ],
    })

    const profile =
      await repository.getDataScopeProfileForUser("user_scope_all_1")

    expect(profile.deptIds).toEqual([])
    expect(profile.dataAccess).toEqual({
      userId: "user_scope_all_1",
      hasAllAccess: true,
      accessibleDeptIds: [],
      allowSelf: false,
    })
  })

  it("merges custom, descendant, and self scopes with widest access", async () => {
    const repository = createInMemoryAuthRepository({
      roles: [
        {
          id: "role_custom_1",
          code: "custom",
          name: "Custom Scope",
          status: "active",
          dataScope: 2,
        },
        {
          id: "role_descendant_1",
          code: "descendant",
          name: "Descendant Scope",
          status: "active",
          dataScope: 4,
        },
        {
          id: "role_self_1",
          code: "self",
          name: "Self Scope",
          status: "active",
          dataScope: 5,
        },
      ],
      userRoles: [
        {
          userId: "user_scope_mix_1",
          roleId: "role_custom_1",
        },
        {
          userId: "user_scope_mix_1",
          roleId: "role_descendant_1",
        },
        {
          userId: "user_scope_mix_1",
          roleId: "role_self_1",
        },
      ],
      userDepartments: [
        {
          userId: "user_scope_mix_1",
          departmentId: "department_root_1",
        },
      ],
      roleDepts: [
        {
          roleId: "role_custom_1",
          deptId: "department_custom_1",
        },
      ],
      departments: [
        {
          id: "department_root_1",
          parentId: null,
        },
        {
          id: "department_ops_1",
          parentId: "department_root_1",
        },
        {
          id: "department_ops_sub_1",
          parentId: "department_ops_1",
        },
        {
          id: "department_custom_1",
          parentId: null,
        },
      ],
    })

    const profile =
      await repository.getDataScopeProfileForUser("user_scope_mix_1")

    expect(profile.deptIds).toEqual(["department_root_1"])
    expect(profile.dataAccess).toEqual({
      userId: "user_scope_mix_1",
      hasAllAccess: false,
      accessibleDeptIds: [
        "department_custom_1",
        "department_ops_1",
        "department_ops_sub_1",
        "department_root_1",
      ],
      allowSelf: true,
    })
  })
})

describe("createInMemoryAuthRepository login security state", () => {
  it("tracks failed attempts and clears them after a successful login", async () => {
    const repository = createInMemoryAuthRepository({
      users: [
        {
          id: "user_login_state_1",
          username: "admin",
          displayName: "Administrator",
          passwordHash: "hash",
          status: "active",
          isSuperAdmin: true,
          tenantId: "tenant-default",
          lastLoginAt: null,
          createdAt: "2026-04-21T00:00:00.000Z",
          updatedAt: "2026-04-21T00:00:00.000Z",
        },
      ],
    })

    await repository.updateLoginFailureState(
      "user_login_state_1",
      {
        loginFailureCount: 2,
        lastLoginFailedAt: "2026-04-21T08:00:00.000Z",
        loginLockedUntil: "2026-04-21T08:15:00.000Z",
      },
      "2026-04-21T08:00:00.000Z",
    )

    const lockedUser = await repository.getUserById("user_login_state_1")
    expect(lockedUser).toMatchObject({
      loginFailureCount: 2,
      lastLoginFailedAt: "2026-04-21T08:00:00.000Z",
      loginLockedUntil: "2026-04-21T08:15:00.000Z",
    })

    await repository.recordSuccessfulLogin(
      "user_login_state_1",
      "2026-04-21T08:16:00.000Z",
    )

    const unlockedUser = await repository.getUserById("user_login_state_1")
    expect(unlockedUser).toMatchObject({
      loginFailureCount: 0,
      lastLoginFailedAt: null,
      loginLockedUntil: null,
      lastLoginAt: "2026-04-21T08:16:00.000Z",
      updatedAt: "2026-04-21T08:16:00.000Z",
    })
  })
})
