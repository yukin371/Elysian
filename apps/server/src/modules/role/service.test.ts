import { describe, expect, it } from "bun:test"
import { errorCodes } from "../../errors/registry"

import { createInMemoryRoleRepository } from "./repository"
import { createRoleService } from "./service"

const createSeedRoles = () => [
  {
    id: "role_admin_1",
    code: "admin",
    name: "Admin",
    description: "System role",
    status: "active" as const,
    isSystem: true,
    dataScope: 1 as const,
    permissionCodes: ["system:user:list"],
    userIds: ["user_admin_1"],
    deptIds: ["dept_root_1"],
    createdAt: "2026-04-24T00:00:00.000Z",
    updatedAt: "2026-04-24T00:00:00.000Z",
  },
]

describe("createRoleService", () => {
  it("trims create payload and normalizes relation arrays", async () => {
    const service = createRoleService(
      createInMemoryRoleRepository({
        roles: createSeedRoles(),
        availablePermissionCodes: ["system:user:list", "system:role:list"],
        availableUserIds: ["user_admin_1", "user_alpha_1"],
        availableDepartmentIds: ["dept_root_1", "dept_alpha_1"],
      }),
    )

    const role = await service.create({
      code: "  role-alpha  ",
      name: "  Role Alpha  ",
      permissionCodes: [
        "system:role:list",
        "system:role:list",
        "system:user:list",
      ],
      userIds: ["user_alpha_1", "user_alpha_1"],
      deptIds: ["dept_alpha_1", "dept_alpha_1"],
    })

    expect(role.code).toBe("role-alpha")
    expect(role.name).toBe("Role Alpha")
    expect(role.permissionCodes).toEqual([
      "system:role:list",
      "system:user:list",
    ])
    expect(role.userIds).toEqual(["user_alpha_1"])
    expect(role.deptIds).toEqual(["dept_alpha_1"])
  })

  it("rejects unknown permission codes during create", async () => {
    const service = createRoleService(
      createInMemoryRoleRepository({
        availablePermissionCodes: ["system:user:list"],
      }),
    )

    await expect(
      service.create({
        code: "role-alpha",
        name: "Role Alpha",
        permissionCodes: ["system:role:list"],
      }),
    ).rejects.toMatchObject({
      code: errorCodes.ROLE_PERMISSION_CODES_INVALID,
      status: 400,
      details: {
        permissionCodes: ["system:role:list"],
      },
    })
  })

  it("rejects system role code changes during update", async () => {
    const service = createRoleService(
      createInMemoryRoleRepository({
        roles: createSeedRoles(),
      }),
    )

    await expect(
      service.update("role_admin_1", {
        code: "admin-renamed",
      }),
    ).rejects.toMatchObject({
      code: errorCodes.ROLE_SYSTEM_IMMUTABLE,
      status: 409,
      details: {
        id: "role_admin_1",
        code: "admin",
      },
    })
  })
})
