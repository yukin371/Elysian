# 2026-04-24 Phase 6B Enterprise Enhancement Design

更新时间：`2026-04-24`

## 当前阶段结论

- `P6B1` 已完成：租户模型、`tenant_id`、RLS、JWT `tid`、tenant context middleware、tenant-aware seed 与基础测试已落地。
- `P6B2` 已完成：数据权限框架已落 `roles.data_scope`、`role_depts`、`departments.ancestors` 与 server 侧数据访问过滤。
- `P6B3` 已推进到 `WP-5`：租户管理最小后端闭环、`tenant:init` CLI、tenant-aware setting fallback、真实 PostgreSQL 集成验证、CI 接入、稳定性观察收尾链路，以及迁移/发布演练 runbook、checklist、样例与 GitHub manual rehearsal 已完成；`feature/dev/main` 三条分支均已完成 `10/10` tenant 滚动观察达标，不在本轮引入额外基础设施 owner。

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

### WP-5 迁移 / 发布演练与责任边界

状态：已完成（演练入口与文档口径已收口）

已完成：

- 已补 [2026-04-24-phase-6b-tenant-migration-release-runbook.md](./2026-04-24-phase-6b-tenant-migration-release-runbook.md)，固定迁移顺序、目标环境输入、回滚路径与责任边界。
- 已补 [release-checklist.md](../release-checklist.md) 的 tenant 发布附加检查、输入映射与 `Tenant 发布 blocker 确认单`。
- 已补 [2026-04-24-phase-6b-tenant-release-rehearsal-sample.md](./2026-04-24-phase-6b-tenant-release-rehearsal-sample.md)，归档本地保守失败样例与 GitHub manual rehearsal 实录。
- 已补 `tenant:release:report`、`tenant:release:gate`、`tenant:release:finalize` 与 `.github/workflows/tenant-release-rehearsal.yml`，用于 rehearsal-only 的执行层自动化。
- GitHub manual rehearsal `24894806843` 已验证 workflow 结构链路稳定，最终只剩目标环境确认与发布后验证相关的 `8` 个真实 blocker。

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
- `bun run e2e:tenant:stability:download`
- `bun run e2e:tenant:stability:collect`
- `bun run e2e:tenant:stability:snapshot`
- `bun run e2e:tenant:stability:evidence`
- `bun run e2e:tenant:upgrade:decision`
- `bun run e2e:tenant:upgrade:gate`
- `bun run e2e:tenant:upgrade:finalize`
- `bun run e2e:tenant:upgrade:finalize:from-downloads`
- `bun run e2e:tenant:upgrade:finalize:from-github`
- `bun run tenant:release:report`
- `bun run tenant:release:gate`
- `bun run tenant:release:finalize`
- `.github/workflows/ci.yml` 已接入 `e2e-tenant` 作业，复用 PostgreSQL service + `bun run e2e:tenant:full`，并在单次 tenant e2e 后生成稳定性快照 artifact

## 待补验证

- 生产环境迁移 / 放量 / 回滚演练
- 升级执行 runbook、回滚路径与冻结阈值后的操作演练
- 真实生产平台、数据库快照编排与自动化回滚责任边界

## 真实观察窗口达标记录

- 样本来源：`workflow_dispatch` / `feature-p6b1-tenant-isolation`
- GitHub runIds：`24886462252`、`24886403317`、`24886352160`、`24886285868`、`24886175279`
- 执行方式：`bun run e2e:tenant:upgrade:finalize:from-github -- --branch feature-p6b1-tenant-isolation --limit 5 --scan-limit 15`
- 结论：
  - `selectedWindowRuns=5`
  - `windowSize=5`
  - `failedRunCount=0`
  - `maxConsecutiveFailedRuns=0`
  - `systemicBlockerDetected=false`
  - `qualifiedForNextStep=true`
  - `recommendation=candidate_for_next_step`
- 当前判断：
  - 真实 tenant artifact 下载、collect、evidence、decision、gate 链路已在 `5/5` 窗口下闭环跑通
  - 当前不存在系统性失败、依赖失败或环境失败信号，可进入下一步升级执行评审

## 主线级滚动观察达标记录

- `dev` 分支：
  - 执行方式：`ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10 bun run e2e:tenant:upgrade:finalize:from-github -- --branch dev --limit 10 --scan-limit 20`
  - GitHub runIds：`24888296758`、`24888362434`、`24888586126`、`24888651338`、`24888706653`、`24888757984`、`24888812971`、`24888870698`、`24888923973`、`24888972790`
  - 结论：
    - `selectedWindowRuns=10`
    - `failedRunCount=0`
    - `maxConsecutiveFailedRuns=0`
    - `systemicBlockerDetected=false`
    - `qualifiedForNextStep=true`
    - `recommendation=candidate_for_next_step`
- `main` 分支：
  - 执行方式：`ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10 bun run e2e:tenant:upgrade:finalize:from-github -- --branch main --limit 10 --scan-limit 20`
  - GitHub runIds：`24889218600`、`24889284909`、`24889342252`、`24889396810`、`24889454355`、`24889506795`、`24889562531`、`24889627339`、`24889689643`、`24889747211`
  - 结论：
    - `selectedWindowRuns=10`
    - `failedRunCount=0`
    - `maxConsecutiveFailedRuns=0`
    - `systemicBlockerDetected=false`
    - `qualifiedForNextStep=true`
    - `recommendation=candidate_for_next_step`

## 下一步

1. 决定是否把已验证的 GitHub `Tenant Release Rehearsal` 固化进发布值班手册，作为默认的 rehearsal 入口。
2. 若继续逼近真实发布评审，只补目标环境数据库角色、备份回滚、`e2e:tenant:full` 与发布后最小验证这 `8` 个真实 blocker。
3. 冻结当前 tenant e2e 与稳定性观察阈值，避免升级执行前策略漂移。
4. 继续维持 `tenant:release:*` 与 GitHub `Tenant Release Rehearsal` 的 rehearsal-only 边界，不把它们写成生产平台命令。

执行手册：
- [2026-04-24-phase-6b-tenant-upgrade-runbook.md](./2026-04-24-phase-6b-tenant-upgrade-runbook.md)

迁移/发布手册：
- [2026-04-24-phase-6b-tenant-migration-release-runbook.md](./2026-04-24-phase-6b-tenant-migration-release-runbook.md)

观察策略：
- [2026-04-24-phase-6b-tenant-scale-observation-strategy.md](./2026-04-24-phase-6b-tenant-scale-observation-strategy.md)

滚动观察记录：
- [2026-04-24-phase-6b-tenant-rolling-window.md](./2026-04-24-phase-6b-tenant-rolling-window.md)
