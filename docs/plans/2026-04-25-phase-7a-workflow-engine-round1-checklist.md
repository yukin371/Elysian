# 2026-04-25 Phase 7A Workflow Engine Round-1 Checklist

## 目的

把 `P7A Round-1` 收敛为可执行的首轮清单，避免：

- 直接按 PRD 一次性铺开全功能 DAG
- 在流程定义、实例、任务、通知、审计之间出现 owner 漂移
- 在实现前缺少最小入口 / 出口与阻断规则

## 当前口径

- 当前主线：`Phase 7 / P7A`
- 当前范围：workflow engine 的最小闭环，且当前定位为 agent 自编排辅助工具，不扩成通用 BPM / agent orchestrator
- 当前不纳入：
  - `P7B` 安全合规
  - `P7C` 统一消息中心
  - 并行网关 / 定时器 / 脚本节点 / 子流程 / 前端设计器

## Entry Gate

开始实现 `P7A Round-1` 前，应确认：

- [x] `Phase 6B` 已完成并归档
- [x] `bun run check` 通过
- [x] `bun run e2e:tenant:full` 通过
- [x] workflow canonical owner 已明确：`schema / persistence / server`
- [x] 已确认通知与审计模块不能直接复用为 workflow runtime
- [x] `workflow` 相关 schema 命名与当前权限复用策略已完成评审（暂不新增 runtime 权限前缀）

## WP-1 Checklist：流程定义模型

### 目标

固定流程定义的 contract、版本语义与最小 CRUD。

### 交付清单

- [x] `packages/schema` 增加 workflow definition contract
- [x] 定义节点类型白名单与 Round-1 支持矩阵
- [x] `packages/persistence` 增加 `workflow_definitions` schema 与 migration
- [x] `packages/persistence` 增加 definition list/get/create/update helper
- [x] `apps/server` 增加 definition CRUD API
- [x] 补定义版本化规则：更新即创建新版本，而不是原地覆盖

### 验证

- [x] definition create/list/get/update server 测试通过
- [ ] persistence 版本唯一性测试通过
- [ ] tenant 隔离测试通过

### 阻断项

- [ ] 若 definition contract 与既有 schema owner 冲突，先停下回收契约，不继续铺 API
- [ ] 若版本语义未明确，不允许进入实例运行态实现

## WP-2 Checklist：实例与任务运行态

### 目标

让流程可被发起，并生成最小审批任务。

### 交付清单

- [x] `workflow_instances` schema 与 migration
- [x] `workflow_tasks` schema 与 migration
- [x] 实例启动器：从开始节点推进到首个审批节点
- [x] 最小状态机：`running / completed / terminated`
- [x] 待办查询 API
- [x] 实例详情 API（含当前节点）

### 验证

- [x] 单条线性审批链测试通过
- [x] 发起实例后能生成待办任务
- [x] 非同租户实例不可见

### 阻断项

- [ ] 若实例状态机仍依赖 notification 或 audit_log 才能表达，不允许继续推进
- [ ] 若任务分派语义未明确，不进入 claim；complete 仅保留当前 assignee 直完结模型

## WP-3 Checklist：审批操作与历史

### 目标

打通审批动作闭环，并保留最小历史查询；当前不进入 claim 语义。

### 交付清单

- [ ] claim 接口（当前简化范围暂不实现）
- [x] complete 接口（approved / rejected）
- [x] cancel 接口
- [x] done 列表 API
- [x] 实例历史读取模型
- [x] 最小 workflow 权限点与 seed

### 验证

- [x] approve 路径测试通过
- [x] reject 路径测试通过
- [x] 权限不足时返回 403

### 阻断项

- [ ] 若任务操作语义与 auth/data-scope 冲突，先明确 server owner 内的授权边界

## WP-4 Checklist：条件分支最小闭环

### 目标

在不引入脚本沙箱的前提下补最小条件节点能力。

### 交付清单

- [x] 条件节点 contract
- [x] 变量注入边界
- [x] 条件表达式最小求值约束
- [x] 条件分支实例查询结果

### 验证

- [x] 至少 1 条条件分支流程测试通过
- [x] 默认分支语义明确
- [x] 非法表达式能被阻断

### 阻断项

- [ ] 若表达式求值需要引入通用脚本执行器，本轮停止在条件白名单实现，不扩到脚本节点

## 非目标检查

以下项在 Round-1 一律不做：

- [ ] 并行网关
- [ ] 定时器超时自动处理
- [ ] 脚本节点
- [ ] 子流程
- [ ] 通用 agent 编排平台能力
- [ ] 与消息中心自动联动
- [ ] 前端流程设计器
- [ ] Redis / MQ / 独立调度器

## Exit Gate

完成 `P7A Round-1` 时，应满足：

- [x] workflow definition 可创建、可查询、可版本化
- [x] workflow instance 可发起、可查询、可终止
- [x] 线性审批链可跑通
- [x] 单条件分支可跑通
- [x] workflow 数据受 tenant 隔离
- [ ] `bun run check` 通过
- [x] 新增 workflow 相关测试通过

## 文档同步

- [x] `roadmap.md` 已挂计划文档入口
- [x] `PROJECT_PROFILE.md` 仅在新增实现事实时再同步
- [ ] 若 owner、依赖方向或基础设施前提发生变化，再补 `ARCHITECTURE_GUARDRAILS` 或 ADR
