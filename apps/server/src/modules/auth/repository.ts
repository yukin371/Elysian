import {
  type AuditLogResult,
  type AuditLogRow,
  type DatabaseClient,
  type MenuRow,
  type RefreshSessionRow,
  type UserRow,
  getRefreshSessionByTokenHash,
  getUserById,
  getUserByUsername,
  insertAuditLog,
  insertRefreshSession,
  listAuditLogs,
  listMenusForUser,
  listPermissionCodesForUser,
  listRoleCodesForUser,
  revokeRefreshSession,
  touchRefreshSession,
  updateUserLastLoginAt,
} from "@elysian/persistence"

export type AuthUserStatus = "active" | "disabled"
export type AuthRoleStatus = "active" | "disabled"
export type AuthMenuStatus = "active" | "disabled"
export type AuthMenuType = "directory" | "menu" | "button"

export interface AuthUserRecord {
  id: string
  username: string
  displayName: string
  email?: string
  phone?: string
  passwordHash: string
  status: AuthUserStatus
  isSuperAdmin: boolean
  tenantId: string
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthRoleRecord {
  id: string
  code: string
  name: string
  status: AuthRoleStatus
}

export interface AuthPermissionRecord {
  id: string
  code: string
  module: string
  resource: string
  action: string
  name: string
}

export interface AuthMenuRecord {
  id: string
  parentId: string | null
  type: AuthMenuType
  code: string
  name: string
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  isVisible: boolean
  status: AuthMenuStatus
  permissionCode: string | null
}

export interface RefreshSessionRecord {
  id: string
  userId: string
  tokenHash: string
  userAgent: string | null
  ip: string | null
  expiresAt: string
  lastUsedAt: string | null
  revokedAt: string | null
  replacedBySessionId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRefreshSessionInput {
  id?: string
  userId: string
  tokenHash: string
  userAgent?: string | null
  ip?: string | null
  expiresAt: string
}

export interface AuthAuditLogRecord {
  id: string
  category: string
  action: string
  actorUserId: string | null
  targetType: string | null
  targetId: string | null
  result: AuditLogResult
  requestId: string | null
  ip: string | null
  userAgent: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

export interface CreateAuthAuditLogInput {
  id?: string
  category: string
  action: string
  actorUserId?: string | null
  targetType?: string | null
  targetId?: string | null
  result: AuditLogResult
  requestId?: string | null
  ip?: string | null
  userAgent?: string | null
  details?: Record<string, unknown> | null
  createdAt?: string
}

export interface AuthRepository {
  findUserByUsername: (username: string) => Promise<AuthUserRecord | null>
  getUserById: (id: string) => Promise<AuthUserRecord | null>
  updateLastLoginAt: (userId: string, timestamp: string) => Promise<void>
  listRoleCodesForUser: (userId: string) => Promise<string[]>
  listPermissionCodesForUser: (userId: string) => Promise<string[]>
  listMenusForUser: (userId: string) => Promise<AuthMenuRecord[]>
  createRefreshSession: (
    input: CreateRefreshSessionInput,
  ) => Promise<RefreshSessionRecord>
  getRefreshSessionByTokenHash: (
    tokenHash: string,
  ) => Promise<RefreshSessionRecord | null>
  revokeRefreshSession: (
    sessionId: string,
    replacedBySessionId?: string | null,
  ) => Promise<void>
  touchRefreshSession: (sessionId: string, timestamp: string) => Promise<void>
  createAuditLog: (
    input: CreateAuthAuditLogInput,
  ) => Promise<AuthAuditLogRecord>
  listAuditLogs: (actorUserId?: string) => Promise<AuthAuditLogRecord[]>
}

interface UserRoleAssignment {
  userId: string
  roleId: string
}

interface RolePermissionAssignment {
  roleId: string
  permissionId: string
}

interface RoleMenuAssignment {
  roleId: string
  menuId: string
}

export interface InMemoryAuthRepositorySeed {
  users?: AuthUserRecord[]
  roles?: AuthRoleRecord[]
  permissions?: AuthPermissionRecord[]
  menus?: AuthMenuRecord[]
  userRoles?: UserRoleAssignment[]
  rolePermissions?: RolePermissionAssignment[]
  roleMenus?: RoleMenuAssignment[]
  refreshSessions?: RefreshSessionRecord[]
  auditLogs?: AuthAuditLogRecord[]
}

export const createAuthRepository = (db: DatabaseClient): AuthRepository => ({
  async findUserByUsername(username) {
    const row = await getUserByUsername(db, username)
    return row ? mapUserRow(row) : null
  },
  async getUserById(id) {
    const row = await getUserById(db, id)
    return row ? mapUserRow(row) : null
  },
  async updateLastLoginAt(userId, timestamp) {
    await updateUserLastLoginAt(db, userId, new Date(timestamp))
  },
  listRoleCodesForUser: (userId) => listRoleCodesForUser(db, userId),
  listPermissionCodesForUser: (userId) =>
    listPermissionCodesForUser(db, userId),
  async listMenusForUser(userId) {
    const rows = await listMenusForUser(db, userId)
    return rows.map(mapMenuRow)
  },
  async createRefreshSession(input) {
    const row = await insertRefreshSession(db, {
      ...input,
      expiresAt: new Date(input.expiresAt),
    })
    return mapRefreshSessionRow(row)
  },
  async getRefreshSessionByTokenHash(tokenHash) {
    const row = await getRefreshSessionByTokenHash(db, tokenHash)
    return row ? mapRefreshSessionRow(row) : null
  },
  async revokeRefreshSession(sessionId, replacedBySessionId = null) {
    await revokeRefreshSession(db, sessionId, new Date(), replacedBySessionId)
  },
  async touchRefreshSession(sessionId, timestamp) {
    await touchRefreshSession(db, sessionId, new Date(timestamp))
  },
  async createAuditLog(input) {
    const row = await insertAuditLog(db, {
      id: input.id,
      category: input.category,
      action: input.action,
      actorUserId: input.actorUserId,
      targetType: input.targetType,
      targetId: input.targetId,
      result: input.result,
      requestId: input.requestId,
      ip: input.ip,
      userAgent: input.userAgent,
      details: input.details,
      ...(input.createdAt ? { createdAt: new Date(input.createdAt) } : {}),
    })

    return mapAuditLogRow(row)
  },
  async listAuditLogs(actorUserId) {
    const rows = await listAuditLogs(db, actorUserId)
    return rows.map(mapAuditLogRow)
  },
})

export const createInMemoryAuthRepository = (
  seed: InMemoryAuthRepositorySeed = {},
): AuthRepository => {
  const users = new Map((seed.users ?? []).map((user) => [user.id, user]))
  const roles = new Map((seed.roles ?? []).map((role) => [role.id, role]))
  const permissions = new Map(
    (seed.permissions ?? []).map((permission) => [permission.id, permission]),
  )
  const menus = new Map((seed.menus ?? []).map((menu) => [menu.id, menu]))
  const refreshSessions = new Map(
    (seed.refreshSessions ?? []).map((session) => [session.id, session]),
  )
  const auditLogs = [...(seed.auditLogs ?? [])]
  const userRoles = [...(seed.userRoles ?? [])]
  const rolePermissions = [...(seed.rolePermissions ?? [])]
  const roleMenus = [...(seed.roleMenus ?? [])]

  return {
    async findUserByUsername(username) {
      return (
        [...users.values()].find((user) => user.username === username) ?? null
      )
    },
    async getUserById(id) {
      return users.get(id) ?? null
    },
    async updateLastLoginAt(userId, timestamp) {
      const existing = users.get(userId)
      if (!existing) {
        return
      }

      users.set(userId, {
        ...existing,
        lastLoginAt: timestamp,
        updatedAt: timestamp,
      })
    },
    async listRoleCodesForUser(userId) {
      const roleIds = userRoles
        .filter((assignment) => assignment.userId === userId)
        .map((assignment) => assignment.roleId)

      return roleIds
        .map((roleId) => roles.get(roleId))
        .filter(
          (role): role is AuthRoleRecord =>
            role !== undefined && role.status === "active",
        )
        .map((role) => role.code)
        .sort()
    },
    async listPermissionCodesForUser(userId) {
      const roleIds = userRoles
        .filter((assignment) => assignment.userId === userId)
        .map((assignment) => assignment.roleId)
      const permissionIds = rolePermissions
        .filter((assignment) => roleIds.includes(assignment.roleId))
        .map((assignment) => assignment.permissionId)

      return [...new Set(permissionIds)]
        .map((permissionId) => permissions.get(permissionId))
        .filter((permission): permission is AuthPermissionRecord =>
          Boolean(permission),
        )
        .map((permission) => permission.code)
        .sort()
    },
    async listMenusForUser(userId) {
      const roleIds = userRoles
        .filter((assignment) => assignment.userId === userId)
        .map((assignment) => assignment.roleId)
      const menuIds = roleMenus
        .filter((assignment) => roleIds.includes(assignment.roleId))
        .map((assignment) => assignment.menuId)

      return [...new Set(menuIds)]
        .map((menuId) => menus.get(menuId))
        .filter(
          (menu): menu is AuthMenuRecord =>
            menu !== undefined && menu.status === "active",
        )
        .sort((left, right) => left.sort - right.sort)
    },
    async createRefreshSession(input) {
      const now = new Date().toISOString()
      const session: RefreshSessionRecord = {
        id: input.id ?? crypto.randomUUID(),
        userId: input.userId,
        tokenHash: input.tokenHash,
        userAgent: input.userAgent ?? null,
        ip: input.ip ?? null,
        expiresAt: input.expiresAt,
        lastUsedAt: null,
        revokedAt: null,
        replacedBySessionId: null,
        createdAt: now,
        updatedAt: now,
      }

      refreshSessions.set(session.id, session)
      return session
    },
    async getRefreshSessionByTokenHash(tokenHash) {
      return (
        [...refreshSessions.values()].find(
          (session) => session.tokenHash === tokenHash,
        ) ?? null
      )
    },
    async revokeRefreshSession(sessionId, replacedBySessionId = null) {
      const existing = refreshSessions.get(sessionId)
      if (!existing) {
        return
      }

      const now = new Date().toISOString()
      refreshSessions.set(sessionId, {
        ...existing,
        revokedAt: now,
        replacedBySessionId,
        updatedAt: now,
      })
    },
    async touchRefreshSession(sessionId, timestamp) {
      const existing = refreshSessions.get(sessionId)
      if (!existing) {
        return
      }

      refreshSessions.set(sessionId, {
        ...existing,
        lastUsedAt: timestamp,
        updatedAt: timestamp,
      })
    },
    async createAuditLog(input) {
      const auditLog: AuthAuditLogRecord = {
        id: input.id ?? crypto.randomUUID(),
        category: input.category,
        action: input.action,
        actorUserId: input.actorUserId ?? null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        result: input.result,
        requestId: input.requestId ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        details: input.details ?? null,
        createdAt: input.createdAt ?? new Date().toISOString(),
      }

      auditLogs.unshift(auditLog)
      return auditLog
    },
    async listAuditLogs(actorUserId) {
      if (!actorUserId) {
        return [...auditLogs]
      }

      return auditLogs.filter(
        (auditLog) => auditLog.actorUserId === actorUserId,
      )
    },
  }
}

const mapUserRow = (row: UserRow): AuthUserRecord => ({
  id: row.id,
  username: row.username,
  displayName: row.displayName,
  email: row.email ?? undefined,
  phone: row.phone ?? undefined,
  passwordHash: row.passwordHash,
  status: row.status,
  isSuperAdmin: row.isSuperAdmin,
  tenantId: row.tenantId,
  lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapMenuRow = (row: MenuRow): AuthMenuRecord => ({
  id: row.id,
  parentId: row.parentId ?? null,
  type: row.type,
  code: row.code,
  name: row.name,
  path: row.path ?? null,
  component: row.component ?? null,
  icon: row.icon ?? null,
  sort: row.sort,
  isVisible: row.isVisible,
  status: row.status,
  permissionCode: row.permissionCode ?? null,
})

const mapRefreshSessionRow = (
  row: RefreshSessionRow,
): RefreshSessionRecord => ({
  id: row.id,
  userId: row.userId,
  tokenHash: row.tokenHash,
  userAgent: row.userAgent ?? null,
  ip: row.ip ?? null,
  expiresAt: row.expiresAt.toISOString(),
  lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
  revokedAt: row.revokedAt?.toISOString() ?? null,
  replacedBySessionId: row.replacedBySessionId ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
})

const mapAuditLogRow = (row: AuditLogRow): AuthAuditLogRecord => ({
  id: row.id,
  category: row.category,
  action: row.action,
  actorUserId: row.actorUserId ?? null,
  targetType: row.targetType ?? null,
  targetId: row.targetId ?? null,
  result: row.result,
  requestId: row.requestId ?? null,
  ip: row.ip ?? null,
  userAgent: row.userAgent ?? null,
  details: row.details ?? null,
  createdAt: row.createdAt.toISOString(),
})
