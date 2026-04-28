# 2026-04-25 Phase 7A Workflow Engine Kickoff

## 决策结论

- 当前主线进入：`Phase 7 / P7A`
- 当前只启动：`P7A Round-1`，先做“可定义、可发起、可查询，并补齐最小审批动作”的工作流闭环；当前工具定位为 agent 自编排辅助工具，不做通用 BPM / agent orchestrator
- 当前不进入：
  - `P7B` 安全合规加固
  - `P7C` 统一消息中心
  - `P7A` 的并行网关、定时器、脚本节点、子流程、消息节点等重能力

## 决策依据

1. `Phase 6B` 已完成：多租户、数据权限、租户治理、`ADR-0009`、CI tenant e2e，以及历史功能分支样本、`dev`、`main` 三段 `10/10` 滚动观察均已收口。
2. `2026-04-25` 已补本地阶段出口复验：`bun run check` 与 `bun run e2e:tenant:full` 通过。
3. [2026-04-24-system-design-v2-prd.md](./2026-04-24-system-design-v2-prd.md) 已将工作流引擎定义为 `Phase 7` 的首个核心交付，但 PRD 范围过宽，不适合直接作为首轮实现边界。
4. 当前仓库仍处于 owner 与工程边界优先的阶段；若直接进入全功能 DAG、消息编排和脚本节点，会同时放大 runtime、安全和运维复杂度。

## 边界摘要

- 目标模块：
  - `packages/schema`
  - `packages/persistence`
  - `apps/server`
- 现有 owner：
  - `packages/schema`：工作流定义契约、节点 schema、流程变量输入契约
  - `packages/persistence`：流程定义、流程实例、流程任务、流程历史的表结构与 query helper
  - `apps/server`：workflow HTTP 模块、鉴权接入、流程执行协调、任务操作入口
- 当前影响面：
  - 新增 workflow 领域模型与最小执行链路
  - 不改既有 tenant/data-scope canonical owner
  - 不把通知、审计、定时任务 owner 混入本轮

## 先复用后新增结论

### 已搜索的现有实现

1. 搜索 `workflow / approval / dag / 流程定义 / 流程实例 / 流程任务`：
   - 结果：仓库当前不存在 workflow 运行时 owner，也不存在可直接复用的流程定义 / 实例 / 任务模型。
2. 搜索 `notifications / system:notification:*`：
   - 结果：现有通知模块 owner 是“站内通知投递与收件箱”，不持有可变任务状态机，不适合作为审批任务 owner。
3. 搜索 `audit_logs / operation-log`：
   - 结果：现有日志 owner 是“不可变审计记录”，不适合作为流程运行态、待办态或任务分派态 owner。

### 为什么不能直接复用

- 通知模块解决的是“消息送达”，不是“任务生命周期管理”。
- 审计日志解决的是“事后追踪”，不是“运行中状态机”。
- 现有 auth / tenant / notification 模块都缺少流程图定义、实例推进、任务转办/委派等工作流核心语义。

### canonical owner 判定

- 流程定义契约：`packages/schema`
- 流程运行态与持久化：`packages/persistence`
- HTTP/API 与执行编排：`apps/server`

### 是否会形成重复 owner

- 不会。
- 当前明确禁止：
  - 不在 `apps/server` 直接保存流程定义 JSON 或拼写 SQL
  - 不在 `packages/persistence` 持有 HTTP 路由与审批业务规则
  - 不在 `notification` / `operation-log` 模块中扩写 workflow runtime 语义

### 需要同步的文档

- `docs/roadmap.md`
- 本 kickoff 文档
- 后续若 workflow 长期边界超出现有 owner 分工，再补 ADR

### 是否需要 ADR

- 当前不需要。
- 理由：本轮仍在既有 `schema / persistence / server` owner 内推进，没有引入新的顶层 package owner 或依赖方向变化。

## P7A Round-1 目标

把 PRD 中的“全功能 DAG 引擎”收敛为一条最小可执行链路，并明确当前是服务于 agent 自编排的轻量工具：

1. 管理员可创建和版本化流程定义
2. 用户可发起流程实例
3. 系统可基于定义推进到审批节点
4. 审批人可查看待办并完成审批
5. 可查询流程实例、当前节点和基础历史

## P7A Round-1 明确纳入

- 流程定义 CRUD 与版本化
- 线性审批链
- 单条件分支节点
- 流程实例发起 / 查询 / 终止
- 审批任务待办 / 已办 / 完成 / 取消（当前不做 claim）
- 租户隔离与基础权限点
- 最小 server 测试与 persistence 测试

## P7A Round-1 明确不纳入

- 并行网关
- 定时器节点
- 脚本节点与沙箱执行
- 子流程
- 与消息中心的自动联动
- 通用业务表单设计器
- 前端流程设计器
- 独立调度器、队列系统或 Redis 基础设施

## 首轮实现切片

### Slice-1 定义与发起

- 目标：
  固定 workflow definition contract、数据库表与创建/查询/发起接口。
- 出口：
  一个租户内可创建 `expense-approval` 这类流程定义，并发起实例。

### Slice-2 审批任务闭环

- 目标：
  打通审批节点任务生成、待办查询、通过/驳回与实例取消。
- 出口：
  单条线性审批链可跑通，实例状态可从 `running` 进入 `completed / terminated`。

### Slice-3 条件分支与历史

- 目标：
  补最小条件路由、实例轨迹与基础审计投影。
- 出口：
  同一流程定义可根据变量进入不同审批分支，并可查询简化历史。

## Round-1 WBS

### WP-1 流程定义模型

- 输出物：
  - workflow definition schema 草案
  - `workflow_definitions` 表与最小 repository helper
  - 定义 CRUD API 与版本化语义
- 验证：
  - server 合约测试
  - persistence 测试

### WP-2 实例与任务运行态

- 输出物：
  - `workflow_instances` / `workflow_tasks` 表
  - 最小状态机与节点推进器
  - 发起实例、查询实例、待办列表 API
- 验证：
  - 单条线性审批链可在测试中跑通

### WP-3 审批操作与历史

- 输出物：
  - 完成 / 驳回 / 终止接口
  - 最小历史记录读取模型
  - 当前权限复用策略说明
- 验证：
  - `bun run test`
  - 审批通过/驳回双路径测试通过

## 当前进展（`2026-04-26`）

- `WP-1` 已落地：definition contract、节点类型白名单、定义 CRUD 与版本化已打通。
- `WP-2` 已落地：instance/task schema、实例发起、实例列表/详情、todo 列表与 tenant 隔离已打通。
- `WP-3` 已落地最小闭环：done 列表、`approved / rejected` 完成、实例取消、实例历史任务读取已打通。
- `WP-3` 后续收口已补：`claim` 已在 `Round-2` 作为唯一新增任务动作落地，并补独立权限点、最小所有权历史与审计证据。
- `WP-4` 已落地最小条件分支：当前支持基于实例变量的白名单比较表达式与唯一 `default` 分支；命中后可进入 approval 或 end。
- workflow 权限已完成最小拆分：
  - `workflow:definition:list/create/update`
  - `workflow:instance:list/start/cancel`
  - `workflow:task:list/claim/complete`
- 当前仍刻意暂缓：
  - `transfer / delegate`
  - 更复杂条件语义与脚本节点
- 当前权限策略：
  - 已不再复用 definition 权限承载 runtime 操作，并已在 task 组内下钻到 `claim / complete`；当前仍不继续扩到 `transfer / delegate`。

### WP-4 条件分支最小闭环

- 输出物：
  - 条件节点语义
  - 变量注入与表达式判定最小约束
  - 分支结果查询能力
- 验证：
  - 至少 1 条条件分支流程通过测试

## 风险与约束

- 不把“流程任务”直接塞进通知模块，避免 runtime owner 漂移。
- 不把 workflow 运行时写成通用脚本平台，避免提前引入安全负担。
- 不把当前工具扩写成通用 agent orchestrator；复杂编排能力继续依赖 agent 本身而非平台 runtime。
- 不在首轮实现前绑定前端设计器；先固定 server 与 schema 契约。
- 不在本轮引入新的基础设施依赖（Redis、消息队列、独立调度器）。

## 阶段验收标准

1. 流程定义可创建、可查询、可版本化。
2. 流程实例可发起、可查询、可终止。
3. 线性审批链可跑通。
4. 单条件分支可跑通。
5. 流程定义、实例、任务均受 tenant 隔离约束。
6. 不新增重复 owner，不把通知/审计模块改造成 workflow runtime。

## 暂缓事项

- 工作流前端设计器
- 定时器与超时自动处理
- 脚本节点与外部回调
- 消息中心联动
- 更复杂的数据权限到“候选审批人动态求值”的全量落地

## 文档同步要求

- `roadmap.md`：同步当前主线与计划文档入口
- 后续若 workflow 运行时需要引入新的 owner 或基础设施，再补 ADR
