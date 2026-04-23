# 2026-04-22 Phase 6A WP-5 Smoke Triage Runbook

## 目的

统一 `e2e-smoke` 失败处置口径，基于 `e2e-smoke-report.json` 与 `e2e-smoke-diagnosis.json` 快速判断：

- 失败属于哪一类
- 是否建议先重试
- 首轮排查应优先做什么

## 输入

- `e2e-smoke-report.json`
  - `status`
  - `lastStage`
  - `failureCategory`
  - `failureMessage`
- `e2e-smoke-diagnosis.json`
  - `conclusion`
  - `retryRecommendation`
  - `recommendedActions`

## 处置矩阵

### environment

- shouldRetry: `false`
- 原因：配置错误通常不会因重试自愈。
- 首轮动作：
  - 校验 `DATABASE_URL` / `ACCESS_TOKEN_SECRET` / `ELYSIAN_ADMIN_*`。
  - 校验 CI 环境变量与 secret 绑定是否漂移。

### dependency

- shouldRetry: `true`
- 原因：服务就绪/网络抖动具备瞬时失败特征。
- 首轮动作：
  - 检查 PostgreSQL health 状态与启动耗时。
  - 检查 migrate/seed 是否完成后再开始 smoke 请求。
  - 若首次失败且推荐重试为 `true`，先执行一次重试；连续失败再升级人工介入。

### test_case

- shouldRetry: `false`
- 原因：通常是合约或业务行为回归，不应靠重试掩盖。
- 首轮动作：
  - 依据 `lastStage` 定位模块（`auth_*` 或 `customer_*`）。
  - 本地复跑同配置 smoke，复现并定位接口行为差异。

## 升级条件

满足任一条件升级为“需工程修复”：

1. 同一 `lastStage` 连续两次失败。
2. 单周内 `test_case` 类失败达到 2 次。
3. `environment` 问题影响主干分支连续构建。

## 与当前实现对齐

- CI `e2e-smoke` 已接入：
  - `bun run e2e:smoke:full`
  - `bun run e2e:smoke:diagnose`
  - Step Summary + artifact 归档
- 诊断脚本中的 `retryRecommendation` 与本 runbook 为同一口径来源；后续若调整策略需同步二者。
