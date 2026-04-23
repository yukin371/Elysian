# 2026-04-22 Phase 6A Production Baseline Kickoff

## 背景

- `Phase 2`、`Phase 3` 已完成。
- `Phase 4` 已完成预验证，但尚未进入“生成链路完全成熟”状态。
- 当前主要工程风险集中在：部署基线、E2E 回归、可观测性与最小安全收敛不足。

## 目标

在不引入重型基础设施和不改变既有 canonical owner 的前提下，建立可持续的生产基线准备能力，减少后续阶段的累计风险。

## 范围

仅覆盖 `Phase 6A` 的“生产基线准备”，不进入 `Phase 6B` 企业增强范围：

- 容器化启动与环境模板
- 关键流程 E2E 冒烟
- 健康检查与指标暴露最小集
- 最小安全基线（配置与验证）

不在本轮范围：

- 多租户模型
- 行级数据权限
- Redis 与复杂缓存体系
- 定时任务平台化
- 灰度发布系统

## Work Packages

### WP-1 容器化与环境基线

- 交付：
  - server + PostgreSQL 的本地容器化启动方案
  - `.env` 模板补齐生产相关最小必填项说明
- 验证：
  - 新环境下可通过单条命令启动并完成 health 检查

### WP-2 E2E 冒烟链路

- 交付：
  - 登录、鉴权、customer CRUD 的最小 E2E 用例
  - E2E 在 CI 中可执行（允许先以 smoke job 形态接入）
- 验证：
  - E2E 可稳定通过，且失败信息可用于快速定位

### WP-3 可观测与安全基线

- 交付：
  - 健康检查与最小指标暴露约定
  - CORS、Rate Limit、关键安全配置说明与默认策略
- 验证：
  - 能在本地与 CI 环境验证健康检查与关键安全配置生效

## 风险与约束

- 不新增跨层 shared util owner，避免基础能力重复 owner。
- 不在 `packages/persistence` 引入运行时安全策略逻辑。
- 不把生产强化需求写成“已实现事实”，所有条目以“计划交付”描述。

## 收尾标准

- `roadmap` 从“Next Stage Evaluation”切换为 `Phase 6A` 进行中。
- 至少 1 条容器化启动链路、1 组 E2E smoke、1 组观测/安全基线验证落地并可复跑。
- 形成下一轮可执行任务清单，并明确不在范围项。

## 执行结果（2026-04-22）

- `WP-1` 已完成：
  - 已新增仓库根 `docker-compose.yml`，并提供 `stack:up/down/reset` 命令。
  - `.env.example` 与 README 已同步容器化启动前置配置。
- `WP-2` 已完成：
  - 已新增 `scripts/e2e-smoke.ts`，覆盖登录 + customer CRUD 冒烟。
  - 已提供 `e2e:smoke:full` 统一入口（`migrate + seed + smoke`），并在 CI `e2e-smoke` job 复用。
- `WP-3` 已完成：
  - 已新增 `/metrics` 最小指标快照接口。
  - 已新增可配置 CORS 白名单与内存限流策略（生产环境默认启用限流）。
- 验证状态：
  - `bun run check` 通过。
  - `bun run build:vue` 通过。
  - `bun run e2e:smoke:full` 本地可复跑通过。
