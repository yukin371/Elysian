# 2026-04-24 Phase 6B Enterprise Enhancement Design

更新时间：`2026-04-24`

## 当前阶段结论

- `P6B1` 已完成：租户模型、`tenant_id`、RLS、JWT `tid`、tenant context middleware、tenant-aware seed 与基础测试已落地。
- `P6B2` 已完成：数据权限框架已落 `roles.data_scope`、`role_depts`、`departments.ancestors` 与 server 侧数据访问过滤。
- `P6B3` 已推进到 `WP-4` 前置收口：租户管理最小后端闭环、`tenant:init` CLI、tenant-aware setting fallback 与真实 PostgreSQL 集成验证已完成，不在本轮引入额外基础设施 owner。

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

状态：已完成

已完成：

- `packages/persistence` 新增 `bun run tenant:init -- --code <tenant-code> --name <tenant-name> --admin-password <password>`
- CLI 负责创建 tenant 并为该 tenant 幂等补齐角色、权限、菜单、字典和 tenant admin
- tenant admin 固定为 `isSuperAdmin=false`，且不会带出 `system:tenant:*` 权限和 `/system/tenants` 菜单
- 重跑时会复用既有 tenant，并以 additive 方式补齐缺失数据，不覆盖已存在 tenant 记录
- 默认 tenant 明确要求继续走 `bun run db:seed`，不与 `tenant:init` 混用

### WP-3 租户配置回退

目标：支持“租户配置优先，缺失时回退到默认租户配置”。

已完成：

- `packages/persistence` 新增 `getSettingWithTenantFallback(db, key, tenantId)`
- 回退范围被限制为“当前 tenant 或默认 tenant”，避免误读其他租户配置
- `apps/server` 的 in-memory setting repository 已补齐同语义测试覆盖

### WP-4 ADR-0009 多租户升级路径

状态：已完成（决策归档）

当前约束：

- 仅在需要固定长期升级/迁移策略时新增 ADR
- 本轮已归档 [ADR-0009](../decisions/ADR-0009-tenant-upgrade-and-validation-strategy.md)，固定默认租户与非默认租户初始化分离、tenant bootstrap 幂等、真实 PostgreSQL 验证门槛与连接回收要求

## 风险清理

- 命名风险：原 auth tenant middleware 已从 `createTenantModule` 更名为 `createTenantContextModule`，避免与真实租户业务模块重名。
- 越权风险：tenant table 管理查询显式绕过请求级 tenant context，但只在 tenant repository 内部封装，避免跨模块滥用。
- 跨租户读取风险：setting fallback 只允许命中当前 tenant 或 `DEFAULT_TENANT_ID`，不允许读取其他 tenant 的 override。
- 种子风险：`db:seed` 已补 request-scoped tenant context，且 `onConflict` 目标改为 tenant-aware 组合键，避免 RLS 与复合唯一约束错位。
- 写入风险：customer 创建链路已补 `identity.user.tenantId` 透传，避免真实 PostgreSQL 下误写回默认租户。
- 连接风险：`db:seed`、`tenant:init` 与 tenant e2e harness 已补显式数据库连接回收，降低重复执行时的连接耗尽风险。

## 当前验证

- `bun run typecheck`
- `bun test`
- `bun run check`
- `bun run e2e:tenant:full`（本地 Docker PostgreSQL，已验证 tenant init 幂等、super-admin 授权、customer 隔离、RLS 与 `tenant_id` FK）

## 待补验证

- 将 `e2e:tenant:full` 纳入 CI 或阶段门禁
- 更高规模 tenant 样本与回归频率策略

## 下一步

1. 评估 `e2e:tenant:full` 的 CI 化或阶段门禁接入方式。
2. 基于 `ADR-0009` 设计后续多租户迁移/发布 runbook 或 CI 策略。
3. 在更高规模 tenant 样本下继续压实回归频率与执行窗口。
