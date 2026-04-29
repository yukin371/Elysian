import type { workflowDefinitions } from "./schema"
import { defaultAuthSeedRelations } from "./seed-auth-relations"
import {
  defaultAuthSeedBlueprint,
  defaultAuthSeedConfig,
  defaultAuthSeedIds,
  defaultWorkflowSeedIds,
} from "./seed-auth-static"

export interface DefaultAuthSeedConfig {
  adminUsername: string
  adminPassword: string
  adminDisplayName: string
}

export interface DefaultSeedCliOptions {
  reconcileAdminPassword: boolean
}

const defaultAdminPassword = ["admin", "123"].join("")
const PRODUCTION_ENVS = new Set(["production"])

export interface DefaultAuthSeedSpec {
  roles: Array<{
    id: string
    code: string
    name: string
    description: string
    status: "active" | "disabled"
    isSystem: boolean
  }>
  permissions: Array<{
    id: string
    code: string
    module: string
    resource: string
    action: string
    name: string
    description: string
  }>
  menus: Array<{
    id: string
    parentId: string | null
    type: "directory" | "menu" | "button"
    code: string
    name: string
    path: string | null
    component: string | null
    icon: string | null
    sort: number
    isVisible: boolean
    status: "active" | "disabled"
    permissionCode: string | null
  }>
  dictionaryTypes: Array<{
    id: string
    code: string
    name: string
    description: string | null
    status: "active" | "disabled"
  }>
  dictionaryItems: Array<{
    id: string
    typeId: string
    value: string
    label: string
    sort: number
    isDefault: boolean
    status: "active" | "disabled"
  }>
  adminUser: {
    id: string
    username: string
    displayName: string
    password: string
    status: "active" | "disabled"
    isSuperAdmin: boolean
  }
  userRoles: Array<{
    userId: string
    roleId: string
  }>
  rolePermissions: Array<{
    roleId: string
    permissionId: string
  }>
  roleMenus: Array<{
    roleId: string
    menuId: string
  }>
}

type DefaultWorkflowDefinitionSeed = Omit<
  Pick<
    typeof workflowDefinitions.$inferInsert,
    "id" | "key" | "name" | "version" | "status" | "definition"
  >,
  "status"
> & {
  status: NonNullable<(typeof workflowDefinitions.$inferInsert)["status"]>
}

type DefaultRoleSeed = DefaultAuthSeedSpec["roles"][number]
type DefaultPermissionSeed = DefaultAuthSeedSpec["permissions"][number]
type DefaultMenuSeed = DefaultAuthSeedSpec["menus"][number]
type DefaultDictionaryTypeSeed = DefaultAuthSeedSpec["dictionaryTypes"][number]
type DefaultDictionaryItemSeed = DefaultAuthSeedSpec["dictionaryItems"][number]

export interface TenantBootstrapSeedSpec {
  roles: Array<Omit<DefaultRoleSeed, "id">>
  permissions: Array<Omit<DefaultPermissionSeed, "id">>
  menus: Array<
    Omit<DefaultMenuSeed, "id" | "parentId"> & { parentCode: string | null }
  >
  dictionaryTypes: Array<Omit<DefaultDictionaryTypeSeed, "id">>
  dictionaryItems: Array<
    Omit<DefaultDictionaryItemSeed, "id" | "typeId"> & { typeCode: string }
  >
  adminUser: Omit<DefaultAuthSeedSpec["adminUser"], "id" | "isSuperAdmin"> & {
    isSuperAdmin: boolean
  }
  userRoles: Array<{
    username: string
    roleCode: string
  }>
  rolePermissions: Array<{
    roleCode: string
    permissionCode: string
  }>
  roleMenus: Array<{
    roleCode: string
    menuCode: string
  }>
}

export interface TenantInitOptions {
  tenantCode: string
  tenantName: string
  tenantStatus?: "active" | "suspended"
  adminUsername?: string
  adminPassword: string
  adminDisplayName?: string
}

const cloneEntries = <T extends Record<string, unknown>>(entries: T[]): T[] =>
  entries.map((entry) => ({ ...entry }))

export const createDefaultAuthSeedConfig = (
  env: Record<string, string | undefined> = process.env,
): DefaultAuthSeedConfig => {
  const resolved = {
    adminUsername:
      env.ELYSIAN_ADMIN_USERNAME ?? defaultAuthSeedConfig.adminUsername,
    adminPassword:
      env.ELYSIAN_ADMIN_PASSWORD ?? defaultAuthSeedConfig.adminPassword,
    adminDisplayName:
      env.ELYSIAN_ADMIN_DISPLAY_NAME ?? defaultAuthSeedConfig.adminDisplayName,
  }
  const appEnv = (env.APP_ENV ?? env.NODE_ENV ?? "development").trim()

  if (
    PRODUCTION_ENVS.has(appEnv) &&
    resolved.adminPassword === defaultAdminPassword
  ) {
    throw new Error(
      "ELYSIAN_ADMIN_PASSWORD must be explicitly set in production before running the default auth seed",
    )
  }

  return resolved
}

export const createDefaultAuthSeedSpec = (
  config: Partial<DefaultAuthSeedConfig> = {},
): DefaultAuthSeedSpec => {
  const resolved = {
    ...defaultAuthSeedConfig,
    ...config,
  }

  return {
    roles: cloneEntries(defaultAuthSeedBlueprint.roles),
    permissions: cloneEntries(defaultAuthSeedBlueprint.permissions),
    menus: cloneEntries(defaultAuthSeedBlueprint.menus),
    dictionaryTypes: cloneEntries(defaultAuthSeedBlueprint.dictionaryTypes),
    dictionaryItems: cloneEntries(defaultAuthSeedBlueprint.dictionaryItems),
    adminUser: {
      id: defaultAuthSeedIds.users.admin,
      username: resolved.adminUsername,
      displayName: resolved.adminDisplayName,
      password: resolved.adminPassword,
      status: "active",
      isSuperAdmin: true,
    },
    userRoles: cloneEntries(defaultAuthSeedRelations.userRoles),
    rolePermissions: cloneEntries(defaultAuthSeedRelations.rolePermissions),
    roleMenus: cloneEntries(defaultAuthSeedRelations.roleMenus),
  }
}

export const createDefaultWorkflowDefinitionSeedSpec =
  (): DefaultWorkflowDefinitionSeed[] => [
    {
      id: defaultWorkflowSeedIds.expenseApprovalV1,
      key: "expense-approval",
      name: "Expense Approval",
      version: 1,
      status: "active",
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "approved" },
        ],
      },
    },
    {
      id: defaultWorkflowSeedIds.expenseApprovalV2,
      key: "expense-approval",
      name: "Expense Approval",
      version: 2,
      status: "active",
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          {
            id: "finance-review",
            type: "approval",
            name: "Finance Review",
            assignee: "role:finance",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "finance-review" },
          { from: "finance-review", to: "approved" },
        ],
      },
    },
    {
      id: defaultWorkflowSeedIds.expenseApprovalConditionV1,
      key: "expense-approval-condition",
      name: "Expense Approval Condition",
      version: 1,
      status: "active",
      definition: {
        nodes: [
          { id: "start", type: "start", name: "Start" },
          {
            id: "manager-review",
            type: "approval",
            name: "Manager Review",
            assignee: "role:manager",
          },
          {
            id: "amount-check",
            type: "condition",
            name: "Amount Check",
            conditions: [
              {
                expression: "${amount > 5000}",
                target: "finance-review",
              },
              {
                expression: "default",
                target: "approved",
              },
            ],
          },
          {
            id: "finance-review",
            type: "approval",
            name: "Finance Review",
            assignee: "role:finance",
          },
          { id: "approved", type: "end", name: "Approved" },
        ],
        edges: [
          { from: "start", to: "manager-review" },
          { from: "manager-review", to: "amount-check" },
          { from: "amount-check", to: "finance-review" },
          { from: "amount-check", to: "approved" },
          { from: "finance-review", to: "approved" },
        ],
      },
    },
  ]

export const createTenantBootstrapSeedSpec = (
  config: Partial<DefaultAuthSeedConfig> = {},
): TenantBootstrapSeedSpec => {
  const base = createDefaultAuthSeedSpec(config)
  const roleCodeById = new Map(base.roles.map((role) => [role.id, role.code]))
  const permissionCodeById = new Map(
    base.permissions.map((permission) => [permission.id, permission.code]),
  )
  const menuCodeById = new Map(base.menus.map((menu) => [menu.id, menu.code]))
  const dictionaryTypeCodeById = new Map(
    base.dictionaryTypes.map((type) => [type.id, type.code]),
  )
  const permissions = base.permissions
    .filter((permission) => !permission.code.startsWith("system:tenant:"))
    .map(({ id: _id, ...permission }) => permission)
  const permissionCodes = new Set(
    permissions.map((permission) => permission.code),
  )
  const menus = base.menus
    .filter((menu) => menu.code !== "system-tenants")
    .map(({ id: _id, parentId, ...menu }) => ({
      ...menu,
      parentCode: parentId ? (menuCodeById.get(parentId) ?? null) : null,
    }))
    .filter(
      (menu) =>
        menu.permissionCode === null ||
        permissionCodes.has(menu.permissionCode),
    )
  const menuCodes = new Set(menus.map((menu) => menu.code))

  return {
    roles: base.roles.map(({ id: _id, ...role }) => role),
    permissions,
    menus,
    dictionaryTypes: base.dictionaryTypes.map(({ id: _id, ...type }) => type),
    dictionaryItems: base.dictionaryItems.map(
      ({ id: _id, typeId, ...item }) => ({
        ...item,
        typeCode:
          dictionaryTypeCodeById.get(typeId) ??
          throwMissingSeedRelation("dictionary type", typeId),
      }),
    ),
    adminUser: {
      username: base.adminUser.username,
      displayName: base.adminUser.displayName,
      password: base.adminUser.password,
      status: base.adminUser.status,
      isSuperAdmin: false,
    },
    userRoles: base.userRoles.map((assignment) => ({
      username: base.adminUser.username,
      roleCode:
        roleCodeById.get(assignment.roleId) ??
        throwMissingSeedRelation("role", assignment.roleId),
    })),
    rolePermissions: base.rolePermissions
      .map((assignment) => ({
        roleCode:
          roleCodeById.get(assignment.roleId) ??
          throwMissingSeedRelation("role", assignment.roleId),
        permissionCode:
          permissionCodeById.get(assignment.permissionId) ??
          throwMissingSeedRelation("permission", assignment.permissionId),
      }))
      .filter((assignment) => permissionCodes.has(assignment.permissionCode)),
    roleMenus: base.roleMenus
      .map((assignment) => ({
        roleCode:
          roleCodeById.get(assignment.roleId) ??
          throwMissingSeedRelation("role", assignment.roleId),
        menuCode:
          menuCodeById.get(assignment.menuId) ??
          throwMissingSeedRelation("menu", assignment.menuId),
      }))
      .filter((assignment) => menuCodes.has(assignment.menuCode)),
  }
}

export const throwMissingSeedRelation = (
  type: string,
  value: string,
): never => {
  throw new Error(`Missing seed relation for ${type}: ${value}`)
}
