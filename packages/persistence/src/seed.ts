import { and, eq, inArray } from "drizzle-orm"

import { updateUserPasswordHash } from "./auth"
import { type DatabaseClient, createDatabaseClient } from "./client"
import {
  dictionaryItems,
  dictionaryTypes,
  menus,
  permissions,
  roleMenus,
  rolePermissions,
  roles,
  userRoles,
  users,
  workflowDefinitions,
} from "./schema"
import {
  type DefaultAuthSeedConfig,
  type DefaultAuthSeedSpec,
  type DefaultSeedCliOptions,
  type TenantBootstrapSeedSpec,
  type TenantInitOptions,
  createDefaultAuthSeedConfig,
  createDefaultAuthSeedSpec,
  createDefaultWorkflowDefinitionSeedSpec,
  createTenantBootstrapSeedSpec,
  throwMissingSeedRelation,
} from "./seed-spec"
import {
  DEFAULT_TENANT_ID,
  getTenantByCode,
  insertTenant,
  resetTenantContext,
  setTenantContext,
} from "./tenant"

interface NormalizedTenantInitOptions {
  tenantCode: string
  tenantName: string
  tenantStatus: "active" | "suspended"
  adminUsername: string
  adminPassword: string
  adminDisplayName: string
}

const defaultSeedCliOptions: DefaultSeedCliOptions = {
  reconcileAdminPassword: false,
}

export {
  createDefaultAuthSeedConfig,
  createDefaultAuthSeedSpec,
  createDefaultWorkflowDefinitionSeedSpec,
  createTenantBootstrapSeedSpec,
}

export type {
  DefaultAuthSeedConfig,
  DefaultAuthSeedSpec,
  DefaultSeedCliOptions,
  TenantBootstrapSeedSpec,
  TenantInitOptions,
}

export const normalizeTenantInitOptions = (
  input: TenantInitOptions,
): NormalizedTenantInitOptions => {
  const tenantCode = input.tenantCode.trim()
  const tenantName = input.tenantName.trim()
  const adminUsername = (input.adminUsername ?? "admin").trim()
  const adminPassword = input.adminPassword.trim()
  const adminDisplayName = (
    input.adminDisplayName ?? "Tenant Administrator"
  ).trim()

  if (!tenantCode) {
    throw new Error("tenantCode is required")
  }

  if (!tenantName) {
    throw new Error("tenantName is required")
  }

  if (!adminUsername) {
    throw new Error("adminUsername is required")
  }

  if (!adminPassword) {
    throw new Error("adminPassword is required")
  }

  if (!adminDisplayName) {
    throw new Error("adminDisplayName is required")
  }

  return {
    tenantCode,
    tenantName,
    tenantStatus: input.tenantStatus ?? "active",
    adminUsername,
    adminPassword,
    adminDisplayName,
  }
}

export const seedDefaultAuthData = async (
  db: DatabaseClient,
  config: Partial<DefaultAuthSeedConfig> = {},
  options: Partial<DefaultSeedCliOptions> = {},
) => {
  const spec = createDefaultAuthSeedSpec(config)
  const tid = DEFAULT_TENANT_ID
  const resolvedOptions = {
    ...defaultSeedCliOptions,
    ...options,
  }

  return withTenantSeedContext(db, tid, async () => {
    await db
      .insert(roles)
      .values(spec.roles.map((role) => ({ ...role, tenantId: tid })))
      .onConflictDoNothing({ target: [roles.tenantId, roles.code] })
    await db
      .insert(permissions)
      .values(
        spec.permissions.map((permission) => ({
          ...permission,
          tenantId: tid,
        })),
      )
      .onConflictDoNothing({
        target: [permissions.tenantId, permissions.code],
      })
    await db
      .insert(menus)
      .values(spec.menus.map((menu) => ({ ...menu, tenantId: tid })))
      .onConflictDoNothing({ target: [menus.tenantId, menus.code] })
    await db
      .insert(dictionaryTypes)
      .values(spec.dictionaryTypes.map((type) => ({ ...type, tenantId: tid })))
      .onConflictDoNothing({
        target: [dictionaryTypes.tenantId, dictionaryTypes.code],
      })
    await db
      .insert(dictionaryItems)
      .values(spec.dictionaryItems.map((item) => ({ ...item, tenantId: tid })))
      .onConflictDoNothing({
        target: [dictionaryItems.typeId, dictionaryItems.value],
      })

    const existingAdmin = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tid),
          eq(users.username, spec.adminUser.username),
        ),
      )
      .limit(1)

    if (!existingAdmin[0]) {
      const adminPasswordHash = await Bun.password.hash(spec.adminUser.password)

      await db.insert(users).values({
        id: spec.adminUser.id,
        tenantId: tid,
        username: spec.adminUser.username,
        displayName: spec.adminUser.displayName,
        passwordHash: adminPasswordHash,
        status: spec.adminUser.status,
        isSuperAdmin: spec.adminUser.isSuperAdmin,
      })
    }

    let reconciledAdminPassword = false

    if (existingAdmin[0] && resolvedOptions.reconcileAdminPassword) {
      const adminPasswordHash = await Bun.password.hash(spec.adminUser.password)
      await updateUserPasswordHash(db, existingAdmin[0].id, adminPasswordHash)
      reconciledAdminPassword = true
    }

    await db
      .insert(userRoles)
      .values(spec.userRoles)
      .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] })
    await db
      .insert(rolePermissions)
      .values(spec.rolePermissions)
      .onConflictDoNothing({
        target: [rolePermissions.roleId, rolePermissions.permissionId],
      })
    await db
      .insert(roleMenus)
      .values(spec.roleMenus)
      .onConflictDoNothing({ target: [roleMenus.roleId, roleMenus.menuId] })

    return {
      adminUsername: spec.adminUser.username,
      insertedAdmin: !existingAdmin[0],
      reconciledAdminPassword,
    }
  })
}

export const initializeTenant = async (
  db: DatabaseClient,
  input: TenantInitOptions,
) => {
  const options = normalizeTenantInitOptions(input)
  const existingTenant = await getTenantByCode(db, options.tenantCode)

  if (
    existingTenant?.id === DEFAULT_TENANT_ID ||
    options.tenantCode === "default"
  ) {
    throw new Error(
      "Default tenant must be initialized with bun run db:seed, not tenant:init",
    )
  }

  const tenant =
    existingTenant ??
    (await insertTenant(db, {
      code: options.tenantCode,
      name: options.tenantName,
      status: options.tenantStatus,
    }))
  const spec = createTenantBootstrapSeedSpec({
    adminUsername: options.adminUsername,
    adminPassword: options.adminPassword,
    adminDisplayName: options.adminDisplayName,
  })
  const seedResult = await seedTenantBootstrapData(db, tenant.id, spec)

  return {
    tenantId: tenant.id,
    tenantCode: tenant.code,
    tenantName: tenant.name,
    tenantStatus: tenant.status,
    createdTenant: !existingTenant,
    insertedAdmin: seedResult.insertedAdmin,
    adminUsername: seedResult.adminUsername,
  }
}

export const runDefaultSeed = async (
  env: Record<string, string | undefined> = process.env,
  options: Partial<DefaultSeedCliOptions> = {},
) => {
  const db = createDatabaseClient(env)
  try {
    const config = createDefaultAuthSeedConfig(env)
    const result = await seedDefaultAuthData(db, config, options)
    const workflowResult = await seedDefaultWorkflowDefinitionData(db)

    console.log(
      `[elysian] default seed complete (admin=${result.adminUsername}, inserted=${result.insertedAdmin}, reconciledPassword=${result.reconciledAdminPassword}, workflowDefinitions=${workflowResult.definitionCount})`,
    )
  } finally {
    await db.$client.end()
  }
}

export const parseDefaultSeedCliArgs = (
  args: string[],
): DefaultSeedCliOptions => ({
  reconcileAdminPassword: args.includes("--reconcile-admin-password"),
})

const seedTenantBootstrapData = async (
  db: DatabaseClient,
  tenantId: string,
  spec: TenantBootstrapSeedSpec,
) =>
  withTenantSeedContext(db, tenantId, async () => {
    await db
      .insert(roles)
      .values(spec.roles.map((role) => ({ ...role, tenantId })))
      .onConflictDoNothing({ target: [roles.tenantId, roles.code] })
    await db
      .insert(permissions)
      .values(
        spec.permissions.map((permission) => ({
          ...permission,
          tenantId,
        })),
      )
      .onConflictDoNothing({
        target: [permissions.tenantId, permissions.code],
      })
    await insertTenantBootstrapMenus(db, tenantId, spec.menus)
    await db
      .insert(dictionaryTypes)
      .values(spec.dictionaryTypes.map((type) => ({ ...type, tenantId })))
      .onConflictDoNothing({
        target: [dictionaryTypes.tenantId, dictionaryTypes.code],
      })

    const dictionaryTypeRows =
      spec.dictionaryTypes.length === 0
        ? []
        : await db
            .select({
              id: dictionaryTypes.id,
              code: dictionaryTypes.code,
            })
            .from(dictionaryTypes)
            .where(
              and(
                eq(dictionaryTypes.tenantId, tenantId),
                inArray(
                  dictionaryTypes.code,
                  spec.dictionaryTypes.map((type) => type.code),
                ),
              ),
            )
    const dictionaryTypeIdByCode = new Map(
      dictionaryTypeRows.map((row) => [row.code, row.id]),
    )

    for (const item of spec.dictionaryItems) {
      const typeId =
        dictionaryTypeIdByCode.get(item.typeCode) ??
        throwMissingSeedRelation("dictionary type code", item.typeCode)

      await db
        .insert(dictionaryItems)
        .values({
          typeId,
          value: item.value,
          label: item.label,
          sort: item.sort,
          isDefault: item.isDefault,
          status: item.status,
          tenantId,
        })
        .onConflictDoNothing({
          target: [dictionaryItems.typeId, dictionaryItems.value],
        })
    }

    const existingAdmin = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.username, spec.adminUser.username),
        ),
      )
      .limit(1)

    if (!existingAdmin[0]) {
      const adminPasswordHash = await Bun.password.hash(spec.adminUser.password)

      await db.insert(users).values({
        tenantId,
        username: spec.adminUser.username,
        displayName: spec.adminUser.displayName,
        passwordHash: adminPasswordHash,
        status: spec.adminUser.status,
        isSuperAdmin: spec.adminUser.isSuperAdmin,
      })
    }

    const roleRows =
      spec.roles.length === 0
        ? []
        : await db
            .select({
              id: roles.id,
              code: roles.code,
            })
            .from(roles)
            .where(
              and(
                eq(roles.tenantId, tenantId),
                inArray(
                  roles.code,
                  spec.roles.map((role) => role.code),
                ),
              ),
            )
    const permissionRows =
      spec.permissions.length === 0
        ? []
        : await db
            .select({
              id: permissions.id,
              code: permissions.code,
            })
            .from(permissions)
            .where(
              and(
                eq(permissions.tenantId, tenantId),
                inArray(
                  permissions.code,
                  spec.permissions.map((permission) => permission.code),
                ),
              ),
            )
    const menuRows =
      spec.menus.length === 0
        ? []
        : await db
            .select({
              id: menus.id,
              code: menus.code,
            })
            .from(menus)
            .where(
              and(
                eq(menus.tenantId, tenantId),
                inArray(
                  menus.code,
                  spec.menus.map((menu) => menu.code),
                ),
              ),
            )
    const adminRows = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(
        and(
          eq(users.tenantId, tenantId),
          eq(users.username, spec.adminUser.username),
        ),
      )
      .limit(1)
    const adminUserId =
      adminRows[0]?.id ??
      throwMissingSeedRelation("admin user", spec.adminUser.username)
    const roleIdByCode = new Map(roleRows.map((row) => [row.code, row.id]))
    const permissionIdByCode = new Map(
      permissionRows.map((row) => [row.code, row.id]),
    )
    const menuIdByCode = new Map(menuRows.map((row) => [row.code, row.id]))

    await db
      .insert(userRoles)
      .values(
        spec.userRoles.map((assignment) => ({
          userId: adminUserId,
          roleId:
            roleIdByCode.get(assignment.roleCode) ??
            throwMissingSeedRelation("role code", assignment.roleCode),
        })),
      )
      .onConflictDoNothing({ target: [userRoles.userId, userRoles.roleId] })
    await db
      .insert(rolePermissions)
      .values(
        spec.rolePermissions.map((assignment) => ({
          roleId:
            roleIdByCode.get(assignment.roleCode) ??
            throwMissingSeedRelation("role code", assignment.roleCode),
          permissionId:
            permissionIdByCode.get(assignment.permissionCode) ??
            throwMissingSeedRelation(
              "permission code",
              assignment.permissionCode,
            ),
        })),
      )
      .onConflictDoNothing({
        target: [rolePermissions.roleId, rolePermissions.permissionId],
      })
    await db
      .insert(roleMenus)
      .values(
        spec.roleMenus.map((assignment) => ({
          roleId:
            roleIdByCode.get(assignment.roleCode) ??
            throwMissingSeedRelation("role code", assignment.roleCode),
          menuId:
            menuIdByCode.get(assignment.menuCode) ??
            throwMissingSeedRelation("menu code", assignment.menuCode),
        })),
      )
      .onConflictDoNothing({ target: [roleMenus.roleId, roleMenus.menuId] })

    return {
      adminUsername: spec.adminUser.username,
      insertedAdmin: !existingAdmin[0],
    }
  })

const seedDefaultWorkflowDefinitionData = async (
  db: DatabaseClient,
  tenantId = DEFAULT_TENANT_ID,
) => {
  const definitions = createDefaultWorkflowDefinitionSeedSpec()

  return withTenantSeedContext(db, tenantId, async () => {
    await db
      .insert(workflowDefinitions)
      .values(definitions.map((definition) => ({ ...definition, tenantId })))
      .onConflictDoNothing({
        target: [
          workflowDefinitions.tenantId,
          workflowDefinitions.key,
          workflowDefinitions.version,
        ],
      })

    return {
      definitionCount: definitions.length,
    }
  })
}

const insertTenantBootstrapMenus = async (
  db: DatabaseClient,
  tenantId: string,
  menuSpecs: TenantBootstrapSeedSpec["menus"],
) => {
  const pending = [...menuSpecs]
  const resolvedMenuIds = new Map<string, string>()

  while (pending.length > 0) {
    let progressed = false

    for (let index = 0; index < pending.length; ) {
      const current = pending[index]
      if (!current) {
        index += 1
        continue
      }
      const parentId = current.parentCode
        ? (resolvedMenuIds.get(current.parentCode) ??
          (await resolveTenantMenuIdByCode(db, tenantId, current.parentCode)))
        : null

      if (current.parentCode && !parentId) {
        index += 1
        continue
      }

      await db
        .insert(menus)
        .values({
          parentId,
          type: current.type,
          code: current.code,
          name: current.name,
          path: current.path,
          component: current.component,
          icon: current.icon,
          sort: current.sort,
          isVisible: current.isVisible,
          status: current.status,
          permissionCode: current.permissionCode,
          tenantId,
        })
        .onConflictDoNothing({ target: [menus.tenantId, menus.code] })

      const menuId =
        (await resolveTenantMenuIdByCode(db, tenantId, current.code)) ??
        throwMissingSeedRelation("menu code", current.code)
      resolvedMenuIds.set(current.code, menuId)
      pending.splice(index, 1)
      progressed = true
    }

    if (!progressed) {
      throw new Error(
        `Unable to resolve tenant bootstrap menu parent chain: ${pending
          .map((menu) => menu.code)
          .join(", ")}`,
      )
    }
  }
}

const resolveTenantMenuIdByCode = async (
  db: DatabaseClient,
  tenantId: string,
  code: string,
): Promise<string | null> => {
  const [row] = await db
    .select({
      id: menus.id,
    })
    .from(menus)
    .where(and(eq(menus.tenantId, tenantId), eq(menus.code, code)))
    .limit(1)

  return row?.id ?? null
}

const withTenantSeedContext = async <T>(
  db: DatabaseClient,
  tenantId: string,
  action: () => Promise<T>,
) => {
  await setTenantContext(db, tenantId)

  try {
    return await action()
  } finally {
    await resetTenantContext(db)
  }
}

if (import.meta.main) {
  await runDefaultSeed(
    process.env,
    parseDefaultSeedCliArgs(process.argv.slice(2)),
  )
}
