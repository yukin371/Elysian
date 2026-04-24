# 2026-04-24 Phase 6B: 企业增强 — 多租户与数据权限

## 阶段结论

`Phase 6B` 聚焦多租户隔离与行级数据权限，拆为 3 个串行子阶段：

```
P6B1 租户模型与查询隔离（RLS）──→ P6B2 数据权限框架（data_scope）──→ P6B3 租户管理与治理
```

## 参考对象

| 框架 | 借鉴点 |
|---|---|
| RuoYi / RuoYi-Plus | 角色表 `data_scope` 5 档模式、`sys_role_dept` 自定义部门关联、部门 `ancestors` 物化路径 |
| pig4cloud / JeecgBoot | 共享数据库 + `tenant_id` 列模式、忽略表白名单、租户上下文 ThreadLocal |
| Supabase | PostgreSQL RLS 策略 + `current_setting()` 会话变量驱动隔离 |
| Laravel Tenancy | Eloquent Global Scope 模式、租户解析中间件 |

## 设计决策

| 决策 | 选择 | 理由 |
|---|---|---|
| 租户隔离策略 | 共享数据库 + `tenant_id` 字段 | 与现有 Drizzle ORM + Bun SQL 架构兼容性最好，保留升级到独立 schema 的路径 |
| 租户过滤机制 | PostgreSQL RLS（`current_setting` 会话变量） | 数据库层强制隔离，现有 30+ persistence helper 零改动 |
| 数据权限模式 | RuoYi `data_scope` 5 档 | 企业后台最成熟的数据权限模式，与现有 `departments` 表结构自然对齐 |
| 数据权限过滤 | 应用层 Drizzle 条件构建器 | RLS 管租户隔离，应用层管数据范围，两层职责分离 |
| 多角色冲突 | 取最宽松（OR 组合） | 与 RuoYi 一致，避免"角色越多权限越小"的反直觉行为 |
| 升级路径 | 保留到独立 schema 的升级能力 | `tenants` 表 + `tenant_id` 前导索引天然支持后续分库 |

## 阶段范围

### 纳入

- 多租户模型（共享数据库 + `tenant_id`）
- 租户隔离（PostgreSQL RLS）
- 行级数据权限（角色级 5 档 data_scope）
- 租户管理 CRUD + 租户初始化脚本
- 租户级配置覆盖
- 升级路径文档

### 不纳入

- 缓存策略（Redis）— 后续独立阶段
- 定时任务 — 后续独立阶段
- 数据导入导出（Excel/CSV）— 后续独立阶段
- 灰度与特性开关 — 后续独立阶段
- 独立数据库 / 独立 schema 隔离 — 仅文档化升级路径

---

## P6B1：租户模型与查询隔离

### 目标

让所有现有模块自动按租户过滤，应用层代码零侵入。

### Schema 变更

#### tenants 表

```sql
CREATE TABLE tenants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       VARCHAR(64) NOT NULL UNIQUE,
  name       VARCHAR(128) NOT NULL,
  status     VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

#### 全表 tenant_id 注入（14 张表）

| 分类 | 表 | 变更 |
|---|---|---|
| 核心实体 | users, roles, permissions, menus, departments | 新增 `tenant_id UUID NOT NULL` + 复合索引 |
| 业务实体 | customers, files, notifications | 新增 `tenant_id UUID NOT NULL` + 复合索引 |
| 系统配置 | dictionary_types, dictionary_items, system_settings | 新增 `tenant_id UUID NOT NULL` + 复合索引 |
| 审计 | audit_logs | 新增 `tenant_id UUID NOT NULL` + 复合索引 |
| 会话 | refresh_sessions | 新增 `tenant_id UUID NOT NULL` + 复合索引 |
| 关联表 | user_roles, role_permissions, role_menus, user_departments | 不加，通过主表 JOIN 过滤 |

复合索引统一为 `(tenant_id, id)`，`tenant_id` 为前导列。

### RLS 策略

```sql
-- 对每张租户隔离表：
ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE <table> FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON <table>
  USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

超级管理员跨租户操作：
- 超级管理员请求时 `RESET app.current_tenant`，tenants 表不启用 FORCE RLS
- 业务表仍强制 RLS，超级管理员也只能在明确 SET 的租户上下文内操作

### Auth 变更

#### JWT payload

```typescript
// 当前
{ sub: string, sid: string, roles: string[], iat: number, exp: number }

// 新增后
{ sub: string, sid: string, tid: string, roles: string[], iat: number, exp: number }
```

`tid` 为用户所属租户 ID，login/refresh 时写入。

#### AuthIdentity

```typescript
interface AuthIdentity {
  user: { id: string; username: string; displayName: string; isSuperAdmin: boolean }
  tenantId: string  // 新增
  roles: string[]
  permissionCodes: string[]
  menus: AuthMenuRecord[]
}
```

### 租户解析中间件

`apps/server/src/modules/auth/tenant.ts`，注册为 Elysia 全局 `onBeforeHandle`：

1. 从 `AuthIdentity.tenantId` 读取租户 ID
2. 执行 `SET app.current_tenant = '<uuid>'`
3. 超级管理员执行 `RESET app.current_tenant`，用于租户管理场景
4. `onAfterHandle` / `onError` 中统一 `RESET app.current_tenant`

### Migration 策略（3 个文件）

| 文件 | 内容 |
|---|---|
| `0007_tenants.sql` | 创建 `tenants` 表 + 插入默认租户 |
| `0008_tenant_id_columns.sql` | 14 张表加 `tenant_id`（先 NULL → 回填默认租户 → NOT NULL + FK + 索引） |
| `0009_rls_policies.sql` | 14 张表启用 RLS + 创建 tenant_isolation 策略 |

### Seed 变更

- 现有 seed 数据回填默认租户 ID
- 新增权限点：`system:tenant:list` / `system:tenant:create` / `system:tenant:update`

### WBS

| WP | 目标 | 输出物 | 验证方式 |
|---|---|---|---|
| WP-1 | 租户表与 migration | `tenants` 表、14 张表 `tenant_id` 列、复合索引、回填默认租户 | `bun run db:migrate` + 数据完整性验证 |
| WP-2 | RLS 策略 | 14 张表的 RLS policy | SET 不同 `app.current_tenant`，验证只返回对应租户数据 |
| WP-3 | Auth 集成 | JWT `tid` claim、`AuthIdentity.tenantId`、租户解析中间件、超级管理员跨租户能力 | `bun run test`（auth 相关测试更新） |
| WP-4 | Seed 与现有测试适配 | 租户感知 seed、现有测试全部通过 | `bun run test` + `bun run check` |
| WP-5 | 租户隔离回归验证 | 新增租户隔离 e2e 测试 | `bun run e2e:smoke` |

### Entry Gate

- P6A 完成 ✅
- P5A 完成 ✅
- 现有 CI 全绿 ✅

### Exit Gate

- [ ] 14 张表均含 `tenant_id` NOT NULL + 索引
- [ ] RLS 策略生效，SET 不同 `app.current_tenant` 只返回对应数据
- [ ] JWT 含 `tid`，AuthIdentity 含 `tenantId`
- [ ] 超级管理员可跨租户操作（tenants 表）
- [ ] 现有测试全部通过（`bun run test`）
- [ ] `bun run check` 通过
- [ ] `bun run e2e:smoke` 通过
- [ ] roadmap + PROJECT_PROFILE 同步完成

### 风险

| 风险 | 影响 | 缓解 |
|---|---|---|
| RLS 导致查询性能下降 | 全表扫描变索引扫描 | 复合索引（`tenant_id` 前导列）覆盖 |
| 超级管理员绕过方案不安全 | 租户管理越权 | 超级管理员跨租户操作仅限 tenants 表，业务表仍强制 RLS |
| 现有测试因 RLS 失败 | CI 红灯 | 测试统一在默认租户上下文中运行，migration 回填保证数据一致 |

---

## P6B2：数据权限框架

### 目标

在 P6B1 租户隔离基础上，实现角色级行级数据权限（全部 / 自定义 / 本部门 / 本部门及下级 / 仅本人）。

### 参考

RuoYi `data_scope` 模式：角色表 `data_scope` 字段 + `sys_role_dept` 自定义关联 + 部门 `ancestors` 物化路径。

### Schema 变更

#### 角色表

```sql
ALTER TABLE roles ADD COLUMN data_scope SMALLINT NOT NULL DEFAULT 1;
-- 1 = 全部数据
-- 2 = 自定义（见 role_depts 关联表）
-- 3 = 本部门
-- 4 = 本部门及下级
-- 5 = 仅本人
```

#### 自定义部门关联表

```sql
CREATE TABLE role_depts (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  dept_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, dept_id)
);
```

#### 部门表物化路径

```sql
ALTER TABLE departments ADD COLUMN ancestors TEXT NOT NULL DEFAULT '';
-- 示例：根部门 ''，子部门 'uuid1'，孙部门 'uuid1,uuid2'
```

部门 CRUD 操作时自动维护 `ancestors`。

#### 业务表新增 dept_id / creator_id

| 表 | 变更 |
|---|---|
| `customers` | 新增 `dept_id UUID` + `creator_id UUID` |
| `files` | 新增 `dept_id UUID`（`uploader_user_id` 已有） |
| `notifications` | 新增 `dept_id UUID`（`created_by_user_id` 已有） |

系统表（roles / permissions / menus / dictionary_types / dictionary_items / system_settings）不加，它们是租户级配置。

### 数据权限过滤机制

RLS 处理租户隔离，数据权限在应用层处理。

#### 新增 `packages/persistence/src/data-scope.ts`

Drizzle 查询条件构建器：

```typescript
function buildDataScopeFilter(opts: {
  db: BunDatabase
  userId: string
  deptIds: string[]
  roleDataScopes: { scope: number; customDeptIds?: string[] }[]
  deptAlias: string
  creatorAlias?: string
}): Promise<SQL | undefined>
```

#### 各档过滤逻辑

| data_scope | 生成条件 |
|---|---|
| 1 全部 | 无过滤 |
| 2 自定义 | `dept_id IN (自定义部门列表)` |
| 3 本部门 | `dept_id IN (用户部门列表)` |
| 4 本部门及下级 | `dept_id IN (用户部门 + ancestors 包含用户部门的所有部门)` |
| 5 仅本人 | `creator_id = userId` |

#### 多角色取最宽松

用户有多个角色时，用 OR 组合各角色的条件。

### Auth 集成

`AuthIdentity` 新增数据权限上下文：

```typescript
interface AuthIdentity {
  // ... 现有字段
  tenantId: string
  dataScopes: { scope: number; customDeptIds?: string[] }[]  // 新增
  deptIds: string[]  // 新增：用户所属部门
}
```

### WBS

| WP | 目标 | 输出物 |
|---|---|---|
| WP-1 | Schema 变更 | `roles.data_scope`、`role_depts`、`departments.ancestors`、业务表 `dept_id`/`creator_id` |
| WP-2 | 数据权限构建器 | `data-scope.ts` 查询条件构建器 + 部门树查询 utility |
| WP-3 | Auth 集成 | `AuthIdentity` 新增 `dataScopes` / `deptIds`，guard 层暴露数据权限上下文 |
| WP-4 | 模块接入验证 | customer / notification / file 三个模块接入数据权限过滤 |
| WP-5 | Seed 与测试 | 角色数据范围 seed、多角色数据权限测试、部门树查询测试 |

### Exit Gate

- [ ] 5 档数据范围均可通过测试验证
- [ ] 多角色取最宽松行为正确
- [ ] 现有测试全部通过
- [ ] `bun run check` 通过

---

## P6B3：租户管理与治理

### 目标

提供租户生命周期管理能力，使平台可以从单租户开发模式进入多租户运营模式。

### 租户管理模块

`apps/server/src/modules/tenant/`，标准模块结构：

| 接口 | 说明 |
|---|---|
| `GET /system/tenants` | 租户列表（仅超级管理员） |
| `GET /system/tenants/:id` | 租户详情 |
| `POST /system/tenants` | 创建租户 |
| `PUT /system/tenants/:id` | 更新租户 |
| `PUT /system/tenants/:id/status` | 启用/停用租户 |

### 租户级配置覆盖

`system_settings` 已有 `tenant_id`，支持按租户覆盖平台默认配置：

- 全局默认值写在默认租户的 `system_settings` 中
- 各租户可覆盖特定 key
- 新增 `getSettingWithTenantFallback` helper：优先取租户级，fallback 到默认租户

### 租户初始化脚本

新增 `bun run tenant:init`，一键完成：

1. 创建租户记录
2. 生成租户级角色 + 管理员用户
3. 复制默认菜单树到租户
4. 复制默认字典 + 系统配置到租户
5. 输出管理员登录凭证

### 升级路径文档

`docs/decisions/ADR-0009-multi-tenant-upgrade-path.md`：

- 当前模式：共享数据库 + `tenant_id` + RLS
- 升级触发条件：租户数量超单库瓶颈 / 合规要求物理隔离
- 升级步骤：migration 脚本 + 连接池路由变更 + RLS 切换到 schema-level
- 回滚路径

### WBS

| WP | 目标 | 输出物 |
|---|---|---|
| WP-1 | 租户 CRUD 模块 | 租户管理 API + 权限控制（仅超级管理员） |
| WP-2 | 租户初始化脚本 | `tenant:init` CLI + 租户级 seed 模板 |
| WP-3 | 租户级配置覆盖 | `getSettingWithTenantFallback` + 租户配置优先级测试 |
| WP-4 | 升级路径文档 | `ADR-0009` 多租户升级路径 |

### Exit Gate

- [ ] 超级管理员可创建/管理租户
- [ ] `tenant:init` 可一键初始化新租户（角色 + 管理员 + 菜单 + 字典 + 配置）
- [ ] 租户级配置可覆盖全局默认
- [ ] 升级路径文档已归档
- [ ] `bun run test` + `bun run check` 通过

---

## 依赖关系

```
P6B1 租户模型与查询隔离（RLS）
  │
  ├──→ P6B2 数据权限框架（data_scope）
  │       │
  │       └──→ P6B3 租户管理与治理
  │
  └──→ P6B3 依赖 P6B1（租户 CRUD 建立在 RLS 之上）
```

严格串行：P6B1 → P6B2 → P6B3。

## 文档同步要求

- `roadmap.md`：新增 Phase 6B track
- `PROJECT_PROFILE.md`：同步当前阶段
- `06-phased-implementation-plan.md`：更新 Phase 6B 子阶段拆分
- P6B3 完成后补充 `ADR-0009`
