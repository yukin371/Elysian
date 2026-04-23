# 2026-04-23 阶段分界线与任务分解执行基线

## 目的

为后续推进提供统一执行模板：每个阶段都必须有明确入口、出口、任务分解、验证命令与风险门禁，避免“阶段名存在但执行边界模糊”。

## 统一模板（适用于所有 Phase/Subphase）

### A. 阶段入口条件（Entry Gate）

- 依赖阶段已达到出口标准（不是“基本可用”）
- 当前阶段 owner 与依赖方向不冲突（符合 `ARCHITECTURE_GUARDRAILS`）
- 本阶段验证命令可在本地或 CI 执行

### B. 任务分解（WBS）

每个阶段拆为 3 到 6 个 `Work Package`，每个 WP 必须包含：

- `目标`
- `输出物`
- `验证方式`
- `风险与回滚`

### C. 阶段出口条件（Exit Gate）

- 所有 WP 都达到“输出物 + 验证方式”标准
- 文档同步完成（`roadmap` + `PROJECT_PROFILE` + 必要 plans/ADR）
- 无阻断级残留风险，且有明确下一阶段入口条件

## 当前执行对象：Phase 6A Round-2

### 阶段边界

- Entry Gate：`Phase 4` 收口完成、`Phase 6A` 首轮完成
- Exit Gate（本轮定义）：
  - smoke 回归链路具备可诊断、可重试、可门禁、可追溯
  - Prometheus 指标达到“进程级最小可观测集”
  - 分布式限流评估门槛文档化，避免提前引入重型基础设施

### WBS 拆解

#### WP-4 指标标准化

- 目标：让 `/metrics/prometheus` 与 `/metrics` 具备统一进程级观测口径
- 输出物：
  - `process_uptime_seconds`
  - `process_start_time_seconds`
  - `process_cpu_user_seconds_total`
  - `process_cpu_system_seconds_total`
  - `process_memory_*`
- 验证：
  - `bun test apps/server/src/app.test.ts`
  - `bun run check`
- 回滚：
  - 单提交回滚指标项与测试断言

#### WP-5 smoke 稳定性观察与门禁

- 目标：让 CI smoke 从“可运行”升级为“可判定、可复盘”
- 输出物：
  - `e2e-smoke-report.json`（attempt 级）
  - `e2e-smoke-diagnosis.json`（分类 + 建议 + retryRecommendation）
  - `e2e-smoke-reports-index.json`（finalStatus/recoveredByRetry）
  - `e2e-smoke-reports-gate.json`（策略门禁结论）
  - CI Step Summary + outputs
- 验证：
  - `bun test scripts/e2e-smoke-report-diagnose.test.ts`
  - `bun test scripts/e2e-smoke-reports-index.test.ts`
  - `bun test scripts/e2e-smoke-reports-gate.test.ts`
  - `bun run check`
- 回滚：
  - 可按脚本粒度回退（diagnose/index/gate 独立）

#### WP-6 分布式限流评估

- 目标：明确“何时必须从内存限流切到分布式限流”
- 输出物：
  - 评估门槛与切换条件文档
  - 保持现状约束与回滚路径
- 验证：
  - 文档评审通过
  - 与 CI/运行时信号（限流头、smoke 结果）对齐
- 回滚：
  - 评估结论可修订，不影响当前运行逻辑

## 下一阶段候选切换规则

满足以下全部条件才进入下一主线（`Phase 6B` 或 `Phase 5`）：

1. `Phase 6A Round-2` 的 WP-4/5/6 均达到出口标准。
2. 最近连续若干次 CI（建议 5 次）无系统性 smoke 阻断。
3. 已形成下一阶段入口文档与首轮 WBS（至少 3 个 WP）。

## 执行约束

- 不跨越阶段入口直接实现下一阶段功能。
- 不把评估文档写成“已实现事实”。
- 未过 Exit Gate 不宣布阶段完成。
