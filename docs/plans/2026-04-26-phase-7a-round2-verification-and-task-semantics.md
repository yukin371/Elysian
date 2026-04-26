# 2026-04-26 Phase 7A Round-2 Verification And Task Semantics

更新时间：`2026-04-26`

## 目标

在不切换到 `P7B` 或 `P7C` 的前提下，收敛 `P7A Round-1` 的下一步工作，避免：

- 把 `Round-1` 的“最小闭环已落地”误写成“workflow 已可按通用 BPM 范式继续横向扩张”
- 在 `claim / transfer / delegate` 等更复杂任务语义未定前继续铺实现，导致权限边界和 owner 漂移
- server 侧测试完整、persistence 侧验证偏弱时继续叠加 runtime 复杂度
- 过早把通知中心、脚本节点、调度器或前端设计器拉入当前主线

## 当前阶段结论

- `P7A Round-1` 的最小 workflow 闭环已落地：
  - definition CRUD 与版本化
  - instance 发起 / 查询 / 详情 / 取消
  - todo / done / complete / history
  - 最小条件分支
- `2026-04-26` 本地自动化回归已通过，详见 [2026-04-26-round-regression-closeout.md](./2026-04-26-round-regression-closeout.md)。
- 截至 `2026-04-26`，`Round-2` exit gate 已满足，可按“验证补齐 + 最小 `claim`”作为当前阶段结果收口。
- 当前主线不应直接切入：
  - `P7B` 安全合规加固
  - `P7C` 统一消息中心
  - `P7A` 并行网关 / 定时器 / 脚本节点 / 子流程 / 前端设计器
- 当前更合理的下一步已推进到：先补 workflow 验证闭环，再以 `claim` 作为 Round-2 唯一新增任务动作收口，不默认进入 `transfer / delegate`。

## 边界摘要

- 目标模块：
  - `packages/schema`
  - `packages/persistence`
  - `apps/server`
- 现有 owner：
  - `packages/schema`：workflow contract、条件表达式白名单、任务结果与状态枚举
  - `packages/persistence`：workflow definitions / instances / tasks 表结构与 query helper
  - `apps/server`：workflow HTTP 模块、鉴权接入、运行态推进与任务操作
- 影响面：
  - workflow repository 测试补强
  - workflow 真实运行态 smoke / e2e 验证
  - `claim` 语义与权限边界设计
  - 不扩到消息投递、调度器、脚本执行器或前端设计器
- 计划改动：
  - 先补 `packages/persistence` 与 workflow runtime 的验证短板
  - 在验证补齐后，再决定是否落 `claim`
  - `transfer / delegate` 只做可行性评估，不默认进入实现
- 验证方式：
  - workflow persistence 定向测试
  - server workflow 合约测试
  - workflow 真实执行路径 smoke
- 需要同步的文档：
  - `docs/roadmap.md`
  - 本计划文档
  - 若权限模型或 owner 变化，再补 `ARCHITECTURE_GUARDRAILS` 或 ADR

## 先复用后新增结论

### 已搜索的现有实现

1. workflow 当前实现：
   - `packages/schema/src/workflow.ts`
   - `packages/persistence/src/workflow.ts`
   - `apps/server/src/modules/workflow/*`
2. workflow 当前测试：
   - `apps/server/src/app.test.ts` 已覆盖 definition / instance / task / 条件分支 / tenant 隔离 / 403
   - `packages/persistence` 当前已补独立 workflow repository 测试，覆盖 definition 版本唯一性、next version 计算、todo/done 查询边界、实例任务排序与取消语义
3. 相关现有 owner：
   - `notification`：站内通知与收件箱
   - `operation-log` / `audit_logs`：不可变审计记录
   - `auth`：权限校验与 identity

### 为什么不能直接复用为下一步主线

- `notification` owner 解决的是消息送达，不持有审批任务状态机。
- `audit_logs` owner 解决的是事后追踪，不持有运行中待办、认领和任务转移语义。
- `apps/server/src/app.test.ts` 已较完整，但不能替代 `packages/persistence` 对 workflow repository 的独立验证。
- `claim` 若直接落到当前 `task:list` 或 `task:complete` 权限下，后续很可能与 auth owner 产生模糊边界，因此需要先设计再实现。

### canonical owner 判定

- workflow contract：`packages/schema`
- workflow persistence：`packages/persistence`
- workflow runtime / authorization：`apps/server`

### 是否会形成重复 owner

- 当前计划内不应形成重复 owner。
- 明确禁止：
  - 不在 `notification` 中落任务状态迁移
  - 不在 `operation-log` 中落 workflow 历史真源
  - 不在 `apps/server` 中绕过 persistence 自写 workflow SQL

### 是否需要 ADR

- 当前默认不需要。
- 仅当以下任一条件出现时再补：
  - 需要把 `workflow:task:*` 继续细拆为新的长期权限层次
  - 需要引入新的基础设施 owner，如队列、调度器、脚本执行沙箱
  - 需要把 workflow runtime 边界从 `schema / persistence / server` 外扩

## Round-2 范围

### 纳入

- workflow persistence 测试补强
- workflow runtime 真实执行路径验证补强
- `claim` 语义设计与实现评估
- `claim` 是否需要独立权限点的边界判定

### 暂不纳入

- `transfer / delegate` 正式实现
- 并行网关
- 定时器 / SLA / 自动升级
- 脚本节点 / 外部回调
- 动态候选审批人求值引擎
- 与消息中心自动联动
- workflow 前端工作台或设计器

## Round-2 工作包

### WP-1 验证补强：persistence

目标：补齐 `packages/persistence` 对 workflow repository 的独立验证，避免所有正确性都堆在 server 合约测试里。

当前进展：

- 已推进：`packages/persistence/src/workflow.test.ts` 已落 `PGlite` 驱动的 repository 测试底座。
- 已覆盖：
  - definition 同租户版本唯一性
  - `getNextWorkflowDefinitionVersion()` 的 key 级 version 推进
  - todo / done 查询边界与排序
  - instance task 列表与 todo 列表排序
  - `cancelWorkflowInstanceTodoTasks()` 的实例级取消语义
- 当前未在该测试层宣称完成：
  - tenant RLS 真正生效的数据库级隔离

说明：

- 当前 `PGlite` 底座用于覆盖 workflow repository 的真实 SQL 与约束语义。
- tenant RLS 继续由 `apps/server/src/app.test.ts` 的集成覆盖与真实 PostgreSQL E2E 兜底，不把 `PGlite` 结果误写成已验证 RLS。

建议交付：

- workflow definition 版本唯一性测试
- workflow definition 按 tenant 隔离测试
- workflow instance 查询按 tenant 隔离测试
- workflow todo / done 查询边界测试
- workflow cancel 后 todo 清理测试

出口：

- `packages/persistence` 具备独立 workflow repository 测试，不再只依赖 server 端集成覆盖

### WP-2 验证补强：runtime smoke

目标：固定 workflow 从“定义 -> 发起 -> 审批 -> 历史”的真实执行路径，作为后续任务语义扩展的回归底座。

当前进展：

- 已推进：workflow smoke 已并入既有 `scripts/e2e-smoke.ts`，未新增第二套 runner。
- 已覆盖：
  - definition 动态创建
  - 线性 `approved` / `rejected`
  - 最小 `claim`（`role:admin -> user:<userId> -> complete`）
  - 显式 instance cancel
  - 条件分支命中 finance 审批
  - `default` 分支直接结束
  - manager / finance todo 与 manager done 列表
  - instance list 包含 `completed / terminated` 结果
  - workflow 审计日志中的 `claim / complete / cancel` 关键明细
- 已补：
  - 高位随机端口，避免复用 `.env` 内的固定端口
  - Windows 下基于端口释放的 server 清理，降低 smoke 重跑时误连旧进程的风险
- 已验证：`2026-04-26` 基于临时 PostgreSQL 数据库执行 `bun run db:migrate`、`bun run db:seed`、`bun run e2e:smoke`，含 `claim` 在内的 workflow smoke 通过

出口：

- workflow 最小运行态可作为固定回归入口重复执行

### WP-3 任务语义：claim

目标：在不引入 `transfer / delegate` 的前提下，评估并固定 `claim` 是否应成为 Round-2 唯一新增任务动作。

当前进展：

- 已推进：`claim` 已作为 Round-2 唯一新增任务动作落地，新增 `POST /workflow/tasks/:id/claim` 与独立 `workflow:task:claim` 权限点。
- 当前语义：
  - todo task 可被认领为当前用户，认领后 `assignee` 收敛为 `user:<userId>`
  - 若原 assignee 为 `role:<code>`，则要求当前用户命中对应 role code，super-admin 仍可兜底
  - 已认领 task 仅允许认领用户完成
  - `done / history` 当前保留 claim 后的 `assignee`，并在原任务记录内最小保留 `claimSourceAssignee / claimedByUserId / claimedAt`
- 未扩面：
  - 未新增独立 candidate owner、任务转移历史表或第二套 workflow history owner
  - 未引入 `transfer / delegate`
  - 未把 claim 语义扩到通知中心或前端工作台

已验证：

- `apps/server/src/app.test.ts` 已覆盖 claim 成功、认领后仅 claimer 可完成、缺少 `workflow:task:claim` 权限时的 403
- `packages/persistence/src/workflow.test.ts` 已覆盖 todo task assignee 更新后仍保持正确的 todo/done 查询边界

### WP-4 后续评估占位：transfer / delegate

状态：仅保留为评估占位，不进入本轮默认交付。

阻断原因：

- 需要先固定 `claim` 与任务所有权模型
- 需要先判断是否新增长期权限点
- 需要先明确是否与未来通知中心联动

## Entry Gate

开始 `Round-2` 前，应确认：

- [x] `P7A Round-1` 最小闭环已落地
- [x] `bun run check` 已在 `2026-04-26` 回归通过
- [x] workflow 当前 canonical owner 仍清晰为 `schema / persistence / server`
- [x] 当前主线仍保持“agent 自编排辅助工具”定位
- [x] 已确定 workflow persistence 测试写入位置与命名方式
- [x] 已确定 workflow smoke 是并入既有 `e2e:smoke` 还是独立入口

## Exit Gate

完成 `Round-2` 时，应满足：

- [x] workflow persistence 独立测试已补齐核心边界
- [x] workflow 真实运行态 smoke 已固定
- [x] `claim` 是否实现已有明确结论
- [x] 若实现 `claim`，其权限边界、seed 与测试已同步
- [x] 未把 `transfer / delegate`、通知中心或脚本节点误纳入当前主线
- [x] `bun run check` 通过
- [x] 相关定向测试通过

## 风险与阻断

- 若 `claim` 需要重写当前 assignee / candidate 语义，则先停下，不与 `transfer / delegate` 并行推进。
- 若 workflow smoke 需要引入新的基础设施或大规模前端展示层，先退回最小 server/runtime 路径，不扩大主线。
- 若 persistence 测试补齐后暴露当前 repository API 边界不稳定，应先回收 persistence owner 设计，不急于补新动作。

## 收口结论

1. `packages/persistence` 的 workflow repository 独立测试已补到当前最小主线所需边界。
2. workflow runtime smoke 已固定为可重复执行的真实执行路径回归入口。
3. `claim` 已作为 Round-2 唯一新增任务动作收口，权限、seed、server 测试、persistence 查询边界与最小认领历史字段已同步。
4. `transfer / delegate` 继续保留在评估占位，不进入本轮默认交付。

## 下一步建议

1. 保留本轮收口结论，不把 `Round-2` 的验证完成误写成 workflow 可以继续横向扩张的信号。
2. 若继续推进 workflow，优先只评估任务所有权历史、审计证据与权限边界是否还需补强。
3. 在未形成新的明确阶段计划前，不扩到通知中心联动、调度器、脚本节点或前端设计器。

## 文档同步要求

- `roadmap.md`：同步 `Round-2` 已收口，而非继续停留在规划态
- `PROJECT_PROFILE.md`：仅在新增实现事实后再同步
- `ARCHITECTURE_GUARDRAILS.md`：仅在 owner / 依赖方向变化后再同步
- ADR：仅在权限层次或基础设施边界成为长期决策时新增
