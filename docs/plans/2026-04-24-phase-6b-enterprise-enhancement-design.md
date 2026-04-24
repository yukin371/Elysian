# 2026-04-24 Phase 6B Enterprise Enhancement Design

更新时间：`2026-04-24`

## 当前阶段结论

- `P6B1` 已完成：租户模型、`tenant_id`、RLS、JWT `tid`、tenant context middleware、tenant-aware seed 与基础测试已落地。
- `P6B2` 已完成：数据权限框架已落 `roles.data_scope`、`role_depts`、`departments.ancestors` 与 server 侧数据访问过滤。
- `P6B3` 已启动：当前先推进“租户管理与治理”的最小后端闭环，不在本轮引入额外基础设施 owner。

## 边界摘要

- 目标模块：
  - `packages/persistence`
  - `apps/server`
  - `packages/schema`
- 现有 owner：
  - `packages/persistence` 持有 tenant CRUD、tenant context SQL、tenant-aware setting fallback
  - `apps/server` 持有 tenant HTTP 模块、super-admin 授权与模块装配
  - `packages/schema` 持有 tenant 模块契约
- 不新增 owner：
  - 不新增第二套 tenant middleware
  - 不新增第二套 setting fallback helper
  - 不把 tenant table 查询散落到 `apps/server`

## P6B3 工作包

### WP-1 租户管理模块

目标：提供最小租户管理后端闭环。

已完成：

- `packages/schema` 新增 `tenantModuleSchema`、`TenantRecord`、`TenantStatus`
- `packages/persistence` 新增 `insertTenant`、`updateTenant`
- `apps/server` 新增 `/system/tenants` 模块：
  - `GET /system/tenants`
  - `GET /system/tenants/:id`
  - `POST /system/tenants`
  - `PUT /system/tenants/:id`
  - `PUT /system/tenants/:id/status`
- 仅允许 `super admin` 执行租户管理，即便具备租户权限码也不能绕过
- 默认 seed 已补 `system:tenant:list/create/update` 与 `/system/tenants` 菜单

### WP-2 tenant:init CLI

状态：待实现

当前约束：

- 仅在明确初始化输入、输出和幂等语义后落地
- 不在本轮绕过既有 `packages/persistence` owner 直接写 SQL 脚本到别处

### WP-3 租户配置回退

目标：支持“租户配置优先，缺失时回退到默认租户配置”。

已完成：

- `packages/persistence` 新增 `getSettingWithTenantFallback(db, key, tenantId)`
- 回退范围被限制为“当前 tenant 或默认 tenant”，避免误读其他租户配置
- `apps/server` 的 in-memory setting repository 已补齐同语义测试覆盖

### WP-4 ADR-0009 多租户升级路径

状态：待实现

当前约束：

- 仅在需要固定长期升级/迁移策略时新增 ADR
- 本轮先记录实现边界，不提前冻结仍在演进中的细节

## 风险清理

- 命名风险：原 auth tenant middleware 已从 `createTenantModule` 更名为 `createTenantContextModule`，避免与真实租户业务模块重名。
- 越权风险：tenant table 管理查询显式绕过请求级 tenant context，但只在 tenant repository 内部封装，避免跨模块滥用。
- 跨租户读取风险：setting fallback 只允许命中当前 tenant 或 `DEFAULT_TENANT_ID`，不允许读取其他 tenant 的 override。

## 当前验证

- `bun run typecheck`
- `bun test`
- `bun run check`

## 待补验证

- 真实 PostgreSQL 下的 RLS 执行验证
- 多 tenant 种子数据下的跨租户隔离验证
- `tenant_id` 外键与约束联调
- `tenant:init` CLI 的输入/幂等/回滚语义

## 下一步

1. 收口并提交当前 `P6B3/WP-1 + WP-3` 实现。
2. 在不新增 owner 的前提下补 `WP-2 tenant:init`。
3. 进入真实 PostgreSQL 下的 RLS / 隔离 / FK 集成验证。
