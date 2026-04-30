# 后端架构痛点与改进方案

> 记录日期：2026-04-30
> 触发场景：整体架构梳理，覆盖 persistence 查询层、模块注册、schema 契约、跨模块耦合、测试分层、错误码治理等方面

---

## 痛点 1：部门后代查询使用应用层内存过滤

### 现状

`packages/persistence/src/data-scope.ts` 的 `listDescendantDepartmentIds` 将全部部门拉到内存，用 JS 拆分 `ancestors` 字段做字符串匹配过滤：

```ts
const rows = await db.select({ id, ancestors }).from(departments)
return rows.filter((row) => {
  const ancestorIds = row.ancestors.split(",").map(...)
  return normalizedDeptIds.some((deptId) => ancestorIds.includes(deptId))
})
```

### 问题

- 部门数量增长后全表扫描 + 内存过滤，性能不可控
- 字符串 `split` + `includes` 匹配存在误判风险（如 ID 前缀重叠）
- 每次数据范围校验都要走一遍全表查询

### 解决方案

**方案 A：递归 CTE（推荐短期）**

在迁移中新建 SQL 函数，查询时直接调用：

```sql
CREATE OR REPLACE FUNCTION get_descendant_dept_ids(root_ids uuid[])
RETURNS SETOF uuid AS $$
  WITH RECURSIVE descendants AS (
    SELECT id FROM departments WHERE id = ANY(root_ids)
    UNION
    SELECT d.id FROM departments d
    INNER JOIN descendants desc ON position(desc.id::text IN d.ancestors) > 0
  )
  SELECT id FROM descendants
$$ LANGUAGE sql STABLE;
```

persistence 层改为：

```ts
const rows = await db.execute(
  sql`SELECT id FROM get_descendant_dept_ids(${sql.array(deptIds, uuidType)})`
)
```

**方案 B：ltree 路径列（推荐中长期）**

在 departments 表加 `path ltree` 列，用 `WHERE path <@ 'root.dept1'` 查询子树，索引友好，性能稳定。

### 影响面

- `packages/persistence/src/data-scope.ts`
- `packages/persistence/drizzle/` 新增迁移文件
- 不影响 service 和 module 层，仅 repository 内部重构

---

## 痛点 2：多查询 + 内存组装代替单条 SQL

### 现状

`packages/persistence/src/auth.ts` 的 `listDataScopesForUser` 先查 userRoles + roles join，再根据结果查 roleDepts，最后在 JS 里用 Map 拼装：

```ts
const rows = await db.select(...).from(userRoles).innerJoin(roles, ...)
// 过滤出 dataScope === 2 的 roleId
const customDeptRows = await db.select(...).from(roleDepts).where(inArray(roleDepts.roleId, customScopeRoleIds))
// Map 手动拼装
```

### 问题

- 两次数据库往返，无法利用数据库的 join 能力一次完成
- JS 层的 Map 拼装逻辑容易遗漏边界情况（如空数组、重复 ID）
- 类似模式在多个 repository 中重复出现

### 解决方案

用子查询或 left join 合并为一条查询：

```ts
const rows = await db
  .select({
    roleId: roles.id,
    dataScope: roles.dataScope,
    customDeptIds: sql<string[]>`
      CASE WHEN ${roles.dataScope} = 2 THEN (
        SELECT coalesce(array_agg(${roleDepts.deptId}), '{}')
        FROM ${roleDepts}
        WHERE ${roleDepts.roleId} = ${roles.id}
      ) ELSE '{}' END
    `,
  })
  .from(userRoles)
  .innerJoin(roles, eq(userRoles.roleId, roles.id))
  .where(and(eq(userRoles.userId, userId), eq(roles.status, "active")))
```

### 影响面

- `packages/persistence/src/auth.ts`
- 不影响上层调用方，返回结构不变

---

## 痛点 3：分页 + 动态条件模式未收敛

### 现状

每个 repository 都独立实现了分页参数归一化、条件拼接、count + data 双查询：

- `customer.ts`：`normalizeCustomerListQuery` + `buildCustomerWhereCondition`
- `dictionary.ts`：独立实现一套类似逻辑
- `menu.ts`、`role.ts`、`notification.ts` 等各自重复

### 问题

- 分页归一化逻辑（page 下限、pageSize 上限、totalPages 计算）几乎完全相同
- 新增一个模块就需要复制一份分页样板代码
- 容易出现归一化规则不一致（某个模块忘了 clamp pageSize 上限）

### 解决方案

在 persistence 包内新增通用分页工具：

```ts
// packages/persistence/src/query-utils.ts

export interface PaginationInput {
  page?: number
  pageSize?: number
}

export interface PaginationResult {
  offset: number
  limit: number
  page: number
  pageSize: number
}

export const normalizePagination = (input?: PaginationInput): PaginationResult => {
  const page = Math.max(1, Math.trunc(input?.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.trunc(input?.pageSize ?? 20)))
  return { offset: (page - 1) * pageSize, limit: pageSize, page, pageSize }
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const buildPaginatedResult = <T>(
  items: T[],
  total: number,
  pagination: PaginationResult,
): PaginatedResult<T> => ({
  items,
  total,
  page: Math.min(pagination.page, total === 0 ? 1 : Math.max(1, Math.ceil(total / pagination.pageSize))),
  pageSize: pagination.pageSize,
  totalPages: total === 0 ? 1 : Math.max(1, Math.ceil(total / pagination.pageSize)),
})
```

各 repository 改为调用工具函数，只保留业务特有的条件拼接逻辑。

### 影响面

- 新增 `packages/persistence/src/query-utils.ts`
- 逐个重构现有 repository（非一次性，按迭代节奏推进）
- 上层 service/module 接口不变

---

## 痛点 4：Drizzle ORM 表达力边界

### 现状

部分查询需要嵌入原生 SQL 片段：

```ts
sql<number>`coalesce(max(${workflowDefinitions.version}), 0) + 1`
```

窗口函数、递归 CTE、复杂聚合等场景，链式 API 无法表达。

### 问题

- 嵌入 `sql` 模板后丢失字段级类型推导
- 团队需要在"用 ORM 绕路"和"直接写 SQL"之间反复权衡，增加心智负担

### 解决方案

不试图消除这个问题，而是明确边界约定：

1. **简单 CRUD、单表查询、常规 join** → 用 Drizzle 链式 API
2. **聚合、窗口函数、递归 CTE** → 用 `sql` 模板，结果类型手动标注
3. **跨模块复用的复杂查询** → 抽成数据库视图或 SQL 函数，persistence 层只做薄调用

在迁移文件中管理视图和函数定义，确保可追溯、可重复执行。

### 影响面

- 开发规范层面，不需要代码改动
- 后续新增复杂查询时按此约定执行

---

---

## 痛点 5：ModuleSchema 与路由校验是两套独立真相源

### 现状

`packages/schema` 定义了字段结构（key、kind、required、options），但手写模块的 module 层用 Elysia 的 `t.Object` 重新声明了一遍校验：

```ts
// schema 定义
{ key: "name", label: "Name", kind: "string", required: true }
{ key: "status", label: "Status", kind: "enum", required: true, options: [...] }

// module 层又写一遍
body: t.Object({
  name: t.String({ minLength: 1 }),
  status: t.Optional(t.Union([t.Literal("active"), t.Literal("inactive")])),
})
```

generator 生成的代码能从 schema 推导，但手写模块（auth、role、menu、department 等）全靠人工同步。

### 问题

- 改字段时必须改 schema + module 两处，漏改会导致校验与声明不一致
- 违反项目核心原则"前后端契约单一来源"
- 新增手写模块时需要人工对照 schema 逐字段翻译校验规则

### 决策：方案 B — Schema 保留基础类型，推导默认校验，module 层可覆盖

#### 立即执行

1. ModuleSchema 保留基础长度/范围字段：

```ts
export interface ModuleField {
  key: string
  label: string
  kind: ModuleFieldKind
  required?: boolean
  searchable?: boolean
  options?: ModuleFieldOption[]
  dictionaryTypeCode?: string
  // 新增基础约束（只放长度和范围，不放跨字段联动等复杂规则）
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
}
```

2. 新增 `deriveBodySchema` 工具函数，从 ModuleSchema 推导默认 Elysia 校验：

```ts
// packages/schema/src/elysia-bridge.ts
import { t } from "elysia"

export const deriveBodySchema = (
  fields: ModuleField[],
  mode: "create" | "update",
) => {
  const inputFields = mode === "update"
    ? fields.filter(f => f.key !== "id")
    : fields.filter(f => !SYSTEM_FIELD_KEYS.has(f.key))

  return t.Object(Object.fromEntries(
    inputFields.map(f => [f.key, fieldToTypeSchema(f)])
  ))
}

const fieldToTypeSchema = (field: ModuleField) => {
  const base = deriveBaseType(field)
  return field.required ? base : t.Optional(base)
}

const deriveBaseType = (field: ModuleField) => {
  const v = field.validation
  switch (field.kind) {
    case "string":
      return t.String({ minLength: v?.minLength ?? 1, maxLength: v?.maxLength })
    case "number":
      return t.Number({ minimum: v?.min, maximum: v?.max })
    case "boolean":
      return t.Boolean()
    case "enum":
      return t.Union((field.options ?? []).map(o => t.Literal(o.value)))
    case "datetime":
      return t.String()
    default:
      return t.String()
  }
}
```

3. module 层使用方式：

```ts
// 默认推导，80% 场景够用
body: deriveBodySchema(roleModuleSchema.fields, "create")

// 需要额外约束时，覆盖特定字段
const base = deriveBodySchema(roleModuleSchema.fields, "create")
body: t.Object({
  ...base.properties,
  code: t.String({ minLength: 1, maxLength: 50, pattern: "^[a-z][a-z0-9_]*$" }),
})
```

#### 短期（模块数 20+）

抽取校验工具库，统一复杂校验模式（如跨字段联动、条件必填）。

#### 远期

无变化，方案可持续。

### 影响面

- `packages/schema/src/index.ts` — ModuleField 新增 `validation` 可选字段
- 新增 `packages/schema/src/elysia-bridge.ts`
- 逐个重构手写模块，渐进式替换
- generator 已有的推导逻辑可复用，不冲突

---

## 痛点 6：跨模块耦合通过闭包传递，没有显式边界

### 现状

`index.ts` 中 generator-session 和 workflow 模块通过闭包引用 authRepository：

```ts
modules.push(createGeneratorSessionModule(generatorSessionRepository, {
  auditLogWriter: (event) => authRepository.createAuditLog({
    category: "generator",
    ...event,
  }),
}))
```

模块代码本身看不出依赖了谁，只有去 `index.ts` 的组装代码才能发现隐式依赖。

### 问题

- 模块间依赖关系隐性化，阅读单个模块无法判断其完整依赖
- 随模块增多，`index.ts` 中的闭包 wiring 越来越复杂
- 如果 audit log 的写入方式变化，每个引用点都要改

### 决策：立即 方案 B（显式接口注入） → 短期 审计日志独立模块 → 远期 事件总线

#### 立即执行：显式接口注入，契约放中立位置

1. 定义显式接口，放在模块间中立位置：

```ts
// apps/server/src/modules/shared/audit-log.ts
export interface AuditLogEvent {
  category: string
  action: string
  actorUserId?: string
  details?: Record<string, unknown>
  targetId?: string
  targetType?: string
  tenantId?: string
  ip?: string | null
  userAgent?: string | null
  requestId?: string | null
}

export interface AuditLogWriter {
  write: (event: AuditLogEvent) => Promise<unknown>
}
```

2. auth 模块提供实现：

```ts
// modules/auth/index.ts
export const createAuthAuditLogWriter = (repo: AuthRepository): AuditLogWriter => ({
  write: (event) => repo.createAuditLog(event),
})
```

3. index.ts 注入变为显式：

```ts
const auditWriter = createAuthAuditLogWriter(authRepository)

modules.push(createGeneratorSessionModule(generatorSessionRepository, { authGuard, auditWriter }))
modules.push(createWorkflowModule(workflowDefinitionRepository, { authGuard, auditWriter }))
```

依赖关系从"闭包隐式引用"变为"接口显式声明"，阅读模块代码即可知道它需要 `AuditLogWriter`。

#### 短期（模块数 20+）：审计日志独立为 operation-log 模块

- 从 authRepository 中拆出 audit log 相关的表、repository、service
- 新建独立的 `modules/operation-log` 模块
- 其他模块依赖 `AuditLogWriter` 接口，不再感知 auth 模块
- auth 模块本身也改为通过 `AuditLogWriter` 写审计日志

#### 远期（消费者超过 3 个且动态增加）：引入事件总线

- 新增 `apps/server/src/events.ts`
- 模块通过 `eventBus.emit` 发送事件，消费者通过 `eventBus.on` 监听
- 完全解耦，新增消费者零改动

### 影响面

- 新增 `apps/server/src/modules/shared/audit-log.ts`
- auth 模块导出 `createAuthAuditLogWriter`
- generator-session、workflow 的 `auditLogWriter` 参数类型从匿名闭包改为 `AuditLogWriter`
- `index.ts` 闭包替换为显式注入

---

## 痛点 7：手动 DI 组装入口持续膨胀

### 现状

`apps/server/src/index.ts` 已 197 行，每新增一个模块需要 4 步：

```
1. import createXxxModule
2. createXxxRepository(db)
3. createXxxModule(repository, { authGuard })
4. modules.push(...)
```

15 个模块 = 60+ 行纯样板代码。

### 问题

- 无逻辑价值的重复代码占比越来越高
- 每次新增模块都要改同一个文件，合并冲突风险高
- 模块之间的依赖顺序全靠人工排列（如 tenant 必须在 auth 之前注册）

### 决策：立即 方案 B（分桶 compose） → 短期 细分 compose 文件 → 远期 注册器自动拓扑

#### 立即执行：按领域分桶组装

把 `index.ts` 拆成多个 compose 文件，每个文件负责一个领域的模块组装：

```ts
// modules/compose-auth.ts
export const composeAuthModules = (
  db: DatabaseClient,
  authGuard: AuthGuard,
  options: { accessTokenSecret: string; secureCookies: boolean },
) => {
  const authRepo = createAuthRepository(db)
  const userRepo = createUserRepository(db)
  const roleRepo = createRoleRepository(db)
  const postRepo = createPostRepository(db)
  const auditWriter = createAuthAuditLogWriter(authRepo)

  return {
    modules: [
      createTenantContextModule(db, options),
      createAuthModule(authRepo, options),
      createUserModule(userRepo, { authGuard }),
      createRoleModule(roleRepo, { authGuard }),
      createPostModule(postRepo, { authGuard }),
    ],
    auditWriter,
    authRepository: authRepo,
  }
}
```

```ts
// modules/compose-system.ts
export const composeSystemModules = (
  db: DatabaseClient,
  authGuard: AuthGuard,
) => {
  const dictRepo = createDictionaryRepository(db)
  const menuRepo = createMenuRepository(db)
  const deptRepo = createDepartmentRepository(db)
  const settingRepo = createSettingRepository(db)

  return [
    createDictionaryModule(dictRepo, { authGuard }),
    createMenuModule(menuRepo, { authGuard }),
    createDepartmentModule(deptRepo, { authGuard }),
    createSettingModule(settingRepo, { authGuard }),
  ]
}
```

```ts
// modules/compose-business.ts
export const composeBusinessModules = (
  db: DatabaseClient,
  authGuard: AuthGuard,
  auditWriter: AuditLogWriter,
) => {
  const customerRepo = createCustomerRepository(db)
  const fileRepo = createFileRepository(db)
  const notificationRepo = createNotificationRepository(db)
  const workflowRepo = createWorkflowDefinitionRepository(db)
  const generatorRepo = createGeneratorSessionRepository(db)

  return [
    createCustomerModule(customerRepo, { authGuard }),
    createFileModule(fileRepo, createLocalFileStorage(), { authGuard }),
    createNotificationModule(notificationRepo, { authGuard }),
    createWorkflowModule(workflowRepo, { authGuard, auditWriter }),
    createGeneratorSessionModule(generatorRepo, { authGuard, auditWriter }),
    createOperationLogModule(createOperationLogRepository(db), { authGuard }),
    createTenantModule(createTenantRepository(db), { authGuard }),
  ]
}
```

```ts
// index.ts — 简化为 ~30 行
const db = createDatabaseClient()
const authModules = composeAuthModules(db, authGuard, { accessTokenSecret, secureCookies })
const systemModules = composeSystemModules(db, authGuard)
const businessModules = composeBusinessModules(db, authGuard, authModules.auditWriter)

const app = createServerApp({
  config,
  logger,
  modules: [systemModule, ...authModules.modules, ...systemModules, ...businessModules],
})
```

#### 短期（模块数 20+）

领域桶内如果单文件过大，继续细分 compose 文件。例如 `compose-auth.ts` 拆成 `compose-auth-identity.ts`（auth + user + session）和 `compose-auth-rbac.ts`（role + permission + post）。

#### 远期（模块数 30+）

引入注册器自动拓扑排序：

```ts
const registry = createModuleRegistry([
  systemModuleDefinition,
  authModuleDefinition,
  roleModuleDefinition,
  ...businessModuleDefinitions,
])
const modules = registry.resolve({ db, config, logger, authGuard, auditWriter })
```

### 影响面

- 新增 `apps/server/src/modules/compose-auth.ts`、`compose-system.ts`、`compose-business.ts`
- `index.ts` 从 197 行简化到 ~30 行
- 现有模块代码不需要任何改动

---

## 痛点 8：测试只有集成层，缺少单元层

### 现状

- `app/` 目录下的测试启动完整 server + 数据库，通过 HTTP 请求验证
- service 和 repository 没有独立的单元测试
- persistence 包有少量单元测试（`drizzle-migrations.test.ts`、`migration-proposal.test.ts`），但不覆盖业务逻辑

### 问题

- service 层业务逻辑测试依赖数据库，失败时无法区分是逻辑错还是数据问题
- 测试速度慢，每次都要跑完整 server 启动 + DB 迁移
- 无法对单个 service 函数做边界测试（如空输入、异常分支）

### 解决方案

**方向：service 层引入 mock repository 的单元测试**

```ts
// modules/role/service.test.ts
const mockRepository: RoleRepository = {
  list: async () => [...],
  getById: async () => null,
  create: async () => ({ id: "1", ... }),
  ...
}

const service = createRoleService(mockRepository)

test("getById throws NOT_FOUND when repository returns null", async () => {
  await expect(service.getById("nonexistent")).rejects.toThrow("ROLE_NOT_FOUND")
})
```

repository 的接口已经是 TypeScript interface（如 `RoleRepository`），天然适合 mock。

### 影响面

- 每个 service 新增 `service.test.ts`
- 不需要改动现有集成测试，单元测试是增量补充
- persistence 层的单元测试可以 mock DatabaseClient 或用 SQLite 内存库

### 待讨论

- mock 是手写还是用工具（如 `vitest` 的 `vi.fn()`）？当前项目没有引入 mock 库
- repository 层是否值得单独测试？还是只通过集成测试覆盖？

---

## 痛点 9：错误码缺乏命名空间治理

### 现状

错误码是自由字符串，靠人工保证不重复：

```ts
"CUSTOMER_NOT_FOUND"           // customer 模块
"AUTH_INVALID_CREDENTIALS"     // auth 模块
"GENERATOR_SESSION_STALE"      // generator-session 模块
"RATE_LIMIT_EXCEEDED"          // 全局中间件
"ROUTE_NOT_FOUND"              // 全局中间件
```

### 问题

- 没有统一注册机制，模块间可能冲突
- 前端无法通过枚举做统一错误处理
- 无法全局搜索某个错误码的所有使用点

### 决策：4 位数字编码 + 集中注册表

#### 编码规则

- `0` = 成功
- `1xxx` = auth / 身份模块
- `2xxx` = 业务模块（customer 等）
- `3xxx` = 系统管理模块（role / menu / dictionary / department / setting / post / user / tenant）
- `4xxx` = 工作流 / 生成器模块
- `5xxx-8xxx` = 预留
- `9xxx` = 全局 / 基础设施错误
- 前端可通过 `Math.floor(code / 1000)` 快速判断模块域

#### AppError 改造

`code` 字段从 `string` 改为 `number`，`message` 保留人类可读文案：

```ts
// errors.ts
export class AppError extends Error {
  readonly code: number        // 业务错误码
  readonly status: number      // HTTP 状态码（保留）
  readonly expose: boolean
  readonly details?: Record<string, unknown>
}
```

响应结构对齐为：

```ts
export interface ApiResponse<T = unknown> {
  code: number     // 0=成功, 非0=业务错误码
  message: string
  data?: T
  details?: Record<string, unknown>
}
```

前端判断统一为 `if (response.code === 0)` 走成功路径。

#### 注册表

```ts
// errors/registry.ts
export const errorCodes = {
  // 全局：9xxx
  SUCCESS: 0,
  INTERNAL_ERROR: 9001,
  RATE_LIMIT_EXCEEDED: 9002,
  ROUTE_NOT_FOUND: 9003,
  MODULE_REGISTRATION_FAILED: 9004,

  // auth 模块：1xxx
  AUTH_INVALID_CREDENTIALS: 1001,
  AUTH_TOKEN_EXPIRED: 1002,
  AUTH_ACCOUNT_LOCKED: 1003,
  AUTH_SESSION_NOT_FOUND: 1004,
  AUTH_REFRESH_TOKEN_INVALID: 1005,
  AUTH_ACCESS_DENIED: 1006,

  // customer 模块：2xxx
  CUSTOMER_NOT_FOUND: 2001,
  CUSTOMER_NAME_REQUIRED: 2002,

  // generator-session 模块：4xxx
  GENERATOR_SESSION_NOT_FOUND: 4001,
  GENERATOR_SESSION_NOT_READY: 4002,
  GENERATOR_SESSION_BLOCKING_CONFLICTS: 4003,
  GENERATOR_SESSION_STALE: 4004,
  GENERATOR_SESSION_APPLY_CONFLICT: 4005,
  GENERATOR_SCHEMA_NOT_FOUND: 4006,

  // workflow 模块：4100+
  WORKFLOW_DEFINITION_NOT_FOUND: 4101,
  WORKFLOW_INVALID_TRANSITION: 4102,

  // system 模块：3xxx（按段分配）
  ROLE_NOT_FOUND: 3001,
  ROLE_CODE_CONFLICT: 3002,
  MENU_NOT_FOUND: 3003,
  MENU_CODE_CONFLICT: 3004,
  DICTIONARY_TYPE_NOT_FOUND: 3005,
  DICTIONARY_TYPE_CODE_CONFLICT: 3006,
  DEPARTMENT_NOT_FOUND: 3007,
  DEPARTMENT_CODE_CONFLICT: 3008,
  SETTING_NOT_FOUND: 3009,
  SETTING_KEY_CONFLICT: 3010,
  POST_NOT_FOUND: 3011,
  POST_CODE_CONFLICT: 3012,
  USER_NOT_FOUND: 3013,
  USER_USERNAME_CONFLICT: 3014,
  TENANT_NOT_FOUND: 3015,
  TENANT_CODE_CONFLICT: 3016,
  FILE_NOT_FOUND: 3017,
  NOTIFICATION_NOT_FOUND: 3018,
  OPERATION_LOG_NOT_FOUND: 3019,
} as const

export type ErrorCode = typeof errorCodes[keyof typeof errorCodes]
```

模块内使用：

```ts
throw new AppError({
  code: errorCodes.CUSTOMER_NOT_FOUND,
  message: "Customer not found",
  status: 404,
  expose: true,
  details: { id },
})
```

#### 前端消费

```ts
// 前端统一错误处理
if (response.code === 0) {
  return response.data
}

const moduleDomain = Math.floor(response.code / 1000)
if (moduleDomain === 1) {
  // auth 模块错误 → 跳转登录
} else if (response.code === 9002) {
  // 限流 → 提示稍后重试
}
```

后续可从注册表自动生成前端错误码枚举，保持前后端同步。

### 影响面

- `apps/server/src/errors.ts` — `code` 字段从 `string` 改为 `number`
- 新增 `apps/server/src/errors/registry.ts`
- 所有模块的 `AppError` 调用替换硬编码字符串为 `errorCodes.xxx`
- 响应序列化改为 `{ code, message, data?, details? }` 结构
- 前端 `lib/platform-api/core.ts` 的响应解析适配新结构
- 现有集成测试的断言从字符串匹配改为数字匹配

---

## 优先级总表

| 痛点 | 类别 | 决策 | 建议时机 |
|------|------|------|---------|
| 痛点 1：部门后代查询 | 查询层 | 递归 CTE 短期落地 | 下一个迭代 |
| 痛点 2：多查询拼装 | 查询层 | 子查询合并 | 同步处理 |
| 痛点 3：分页模式收敛 | 查询层 | 通用分页工具函数 | 新增模块前 |
| 痛点 4：ORM 边界 | 查询层 | 明确约定，无需代码改动 | 立即生效 |
| 痛点 5：schema 与校验双源 | 契约层 | 立即：方案 B（推导+覆盖）；短期：校验工具库；远期：无变化 | 立即启动 |
| 痛点 6：跨模块耦合 | 架构层 | 立即：显式接口注入；短期：审计日志独立模块；远期：事件总线（消费者 3+） | 立即启动 |
| 痛点 7：DI 组装膨胀 | 架构层 | 立即：分桶 compose；短期：细分 compose 文件；远期：注册器自动拓扑 | 立即启动 |
| 痛点 8：测试分层缺失 | 质量保障 | service 层 mock repository 单元测试 | 日常迭代逐步补 |
| 痛点 9：错误码治理 | 规范层 | 4 位数字编码 + 集中注册表 + ApiResponse 统一结构 | 日常迭代逐步补 |

---

## 原则

- 不引入额外抽象层，只在现有包内收敛
- 每个改动保持上层接口不变，仅重构内部实现
- 按"先修性能隐患，再收敛重复，再补契约/架构，最后补规范"的顺序推进
- 每个痛点独立可交付，不需要一次性全部解决
