# 2026-04-22 Phase 6A Round-2 Baseline Hardening

## 背景

- `Phase 6A` 首轮（容器化、smoke、最小观测/安全）已完成。
- `Phase 4` 收口已完成，当前主线可回到生产基线稳态能力。
- 现有 `/metrics` 已支持 JSON 快照与 Prometheus exposition 基线，但观测与 CI 稳定性仍需第二轮收敛。

## 目标

在不引入重型基础设施和不改变既有 owner 的前提下，完成 `Phase 6A` 第二轮风险收敛：

- 指标标准化从“可查看”推进到“可被标准采集”
- 远端 CI smoke 稳定性从“可运行”推进到“可评估”
- 分布式限流仅做可执行评估，不提前落地 Redis/网关级重构

## 范围

### In Scope

- 观测：补齐 Prometheus 指标最小契约（已落 `/metrics/prometheus`）
- CI：沉淀 smoke 稳定性观察口径（失败分层、重跑策略、趋势观测）
- 限流：产出分布式限流评估结论与可执行切换条件

### Out of Scope

- Redis 生产集群接入
- API 网关替换
- 多租户与行级数据权限
- 复杂告警平台接入

## Work Packages

### WP-4 指标标准化收敛

- 交付：
  - `/metrics/prometheus` 指标端点（已完成）
  - 指标命名与类型约束清单（process 级最小集）
- 验证：
  - server 合约测试覆盖内容类型和关键指标行

### WP-5 CI smoke 稳定性观察

- 交付：
  - CI smoke 失败原因分层（环境/依赖/用例）
  - 重跑与失败归档策略草案（先文档后自动化）
- 验证：
  - 至少一次基于真实 CI 结果的分类复盘样例

### WP-6 分布式限流评估

- 交付：
  - 限流演进决策草案：保持单实例内存限流 vs 引入集中式存储
  - 触发切换阈值（流量、实例数、误封率）建议
- 验证：
  - 形成可落地的“进入实现”前置条件，不直接编码重型能力

## 风险与约束

- 不把评估结论写成“已实现事实”。
- 不在 `packages/persistence` 挂载运行时限流逻辑。
- 不新增跨层 shared util owner，保持 `apps/server` 的运行时 owner 边界。

## 收尾标准

- `roadmap` 明确 `Phase 6A` 第二轮活跃工作包。
- Prometheus 指标端点与测试已入主干（已达成）。
- CI 稳定性观察与限流评估形成下一步可执行任务单。
