import { t } from "elysia"

const authMenuSchema = t.Object({
  id: t.String(),
  parentId: t.Nullable(t.String()),
  type: t.Union([
    t.Literal("directory"),
    t.Literal("menu"),
    t.Literal("button"),
  ]),
  code: t.String(),
  name: t.String(),
  path: t.Nullable(t.String()),
  component: t.Nullable(t.String()),
  icon: t.Nullable(t.String()),
  sort: t.Number(),
  isVisible: t.Boolean(),
  status: t.Union([t.Literal("active"), t.Literal("disabled")]),
  permissionCode: t.Nullable(t.String()),
})

const authIdentityUserSchema = t.Object({
  id: t.String(),
  username: t.String(),
  displayName: t.String(),
  isSuperAdmin: t.Boolean(),
  tenantId: t.String(),
})

const dataScopeGrantSchema = t.Object({
  scope: t.Union([
    t.Literal(1),
    t.Literal(2),
    t.Literal(3),
    t.Literal(4),
    t.Literal(5),
  ]),
  customDeptIds: t.Optional(t.Array(t.String())),
})

const dataAccessContextSchema = t.Object({
  userId: t.String(),
  hasAllAccess: t.Boolean(),
  accessibleDeptIds: t.Array(t.String()),
  allowSelf: t.Boolean(),
})

const authSessionSummarySchema = t.Object({
  id: t.String(),
  userAgent: t.Nullable(t.String()),
  ip: t.Nullable(t.String()),
  expiresAt: t.String({
    format: "date-time",
  }),
  lastUsedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  revokedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  replacedBySessionId: t.Nullable(t.String()),
  createdAt: t.String({
    format: "date-time",
  }),
  updatedAt: t.String({
    format: "date-time",
  }),
  isCurrent: t.Boolean(),
})

export const authLoginResponseSchema = t.Object({
  accessToken: t.String(),
  user: authIdentityUserSchema,
  deptIds: t.Array(t.String()),
  dataScopes: t.Array(dataScopeGrantSchema),
  dataAccess: dataAccessContextSchema,
  roles: t.Array(t.String()),
  permissionCodes: t.Array(t.String()),
  menus: t.Array(authMenuSchema),
})

export const authMeResponseSchema = t.Object({
  user: authIdentityUserSchema,
  deptIds: t.Array(t.String()),
  dataScopes: t.Array(dataScopeGrantSchema),
  dataAccess: dataAccessContextSchema,
  roles: t.Array(t.String()),
  permissionCodes: t.Array(t.String()),
  menus: t.Array(authMenuSchema),
})

export const authSessionsResponseSchema = t.Object({
  items: t.Array(authSessionSummarySchema),
})
