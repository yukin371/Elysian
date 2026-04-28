# 2026-04-24 Phase 6B Tenant Upgrade Runbook

## 目的

把 `candidate_for_next_step` 的 tenant 稳定性结论落成统一执行口径，避免：

- 把 `5/5` 观察窗口误读成“无需继续约束”
- 在升级执行前临时修改 tenant e2e 阈值或命令口径
- 代码、CI、文档各自推进，导致升级条件与回滚动作漂移

## 适用范围

适用于触及以下任一项后的阶段升级评审：

- `tenant_id` schema / migration
- PostgreSQL RLS policy
- tenant context SQL
- `db:seed` / `tenant:init`
- 租户感知写路径
- super-admin 跨租户管理边界

## 当前基线

- 最低真实门槛仍是同一实现头的 `5/5`
- 首个达标窗口：
  - 分支：已归档的历史功能分支样本
  - 观察窗口实现头：`154e3439bdcb8bb76967d773fa4cf727a9766124`
  - 观察窗口 runIds：`24886462252`、`24886403317`、`24886352160`、`24886285868`、`24886175279`
- 当前主线状态：
  - `dev` 最近 `10` 次 tenant artifact 已达标
  - `main` 最近 `10` 次 tenant artifact 已达标
- evidence 共识结论：
  - `failedRunCount=0`
  - `maxConsecutiveFailedRuns=0`
  - `dependencyFailureCount=0`
  - `environmentFailureCount=0`
  - `systemicBlockerDetected=false`
  - `qualifiedForNextStep=true`
  - `recommendation=candidate_for_next_step`

## 冻结项

升级执行评审前，不应修改以下口径；若必须修改，应先回到观察阶段并重建窗口：

- tenant 基线命令：
  - `bun run e2e:tenant:full`
- GitHub 收尾命令：
  - `bun run e2e:tenant:upgrade:finalize:from-github -- --branch <branch> --limit 5 --scan-limit 15`
- 观察窗口阈值：
  - `windowSize=5`
  - `failedRunCount=0`
  - `maxConsecutiveFailedRuns=0`
  - `systemicBlockerDetected=false`
- artifact 口径：
  - `e2e-tenant-report`
  - `e2e-tenant-stability-snapshot.json`

## 执行步骤

### 1. 锁定评审输入

- 保存以下文件或链接，作为本轮升级评审输入：
  - `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
  - `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`
  - `artifacts/downloads/tenant/e2e-tenant-stability-download-report.json`
- 若待评审 head 已不等于观察窗口 head，先重新积累同一 head 的 `5/5` 样本，不直接继承旧窗口。

### 2. 做升级评审

- `packages/persistence` owner 确认：
  - `tenant_id`、RLS、tenant context SQL、`db:seed`、`tenant:init` 无新增未验证分支
- `apps/server` owner 确认：
  - `identity.user.tenantId` 透传、super-admin 边界、tenant 管理接口权限无漂移
- 文档 owner 确认：
  - roadmap、阶段计划、runbook 与 evidence 口径一致

### 3. 决定是否进入下一阶段

满足以下条件，才允许把多租户能力视为“可进入下一阶段升级执行”：

1. 当前 head 与观察窗口 head 一致，或已对新 head 重建 `5/5` 窗口。
2. `candidate_for_next_step` 结论仍成立。
3. `bun run check` 与 `bun run e2e:tenant:full` 未出现新增失败。
4. 回滚路径已明确写入当前 PR 或阶段记录。

### 4. 放大样本策略

- 若只是文档或无租户语义影响的改动，不要求重建窗口。
- 若改动触及本 runbook 的适用范围，至少对最新 head 再执行一次 `5/5` GitHub 观察窗口。
- 若后续把 `e2e-tenant` 提升为更强门禁，先保留当前 `5/5` 口径作为最低真实基线，不直接覆盖。

## 回滚路径

出现以下任一情况，立即退出升级执行评审，回到 `continue_observation`：

- 最新窗口出现失败运行
- `systemicBlockerDetected=true`
- 观察窗口与待评审 head 不一致
- 评审过程中发现新增未验证的 tenant schema / RLS / context 变更

回滚动作：

1. 停止推进“进入下一阶段”结论，不把当前分支状态升级为更高阶段基线。
2. 重新执行 `bun run e2e:tenant:upgrade:finalize:from-github` 生成最新 evidence / decision。
3. 若失败来自代码回归，先修复再重建观察窗口；若失败来自环境或依赖，先排除噪音后再补样本。

## 非目标

- 本 runbook 不是生产租户数据迁移手册。
- 本 runbook 不引入新的 package、脚本 owner 或第二套 tenant 验证策略。
- 长期边界仍以 [ADR-0009](../decisions/ADR-0009-tenant-upgrade-and-validation-strategy.md) 为准。
