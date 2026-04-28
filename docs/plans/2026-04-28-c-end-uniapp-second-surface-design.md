# 2026-04-28 C 端第二界面：uniapp 设计草案

## 目标

- 明确 `uniapp` 作为仓库未来第二个 C 端界面的定位。
- 固定当前优先级：`Vue` 为第一优先级，`uniapp` 为第二优先级。
- 在不新增实现 owner 的前提下，先收口边界、复用路径与后续验证门槛。

## 当前结论

- 当前第一优先级 C 端界面仍是 `Vue`。
- `uniapp` 进入设计储备，作为第二优先级 C 端界面方案。
- 本轮只开设计文档，不新增 `apps/*`、`packages/*`、shared helper 或运行时基础设施。
- `uniapp` 不改变当前 `apps/example-vue` 的主线验证职责。

## 为什么现在只做设计，不先开工

- 当前仓库已存在真实前端主线的是 `apps/example-vue`，其 owner 与验证链路已经明确。
- `uniapp` 相关 canonical owner 尚未在长期文档中稳定，直接开工会把“方向”误写成“已实现事实”。
- 当前主线仍是后台基础能力收口与 `Vue` 示例应用完善，不适合并行铺开第二条前端运行时主线。

## 定位

### 1. 产品定位

- `Vue` 负责优先验证 Web 端企业后台与平台能力闭环。
- `uniapp` 负责补“第二个 C 端交付面”的设计准备，优先面向移动端/多端分发场景。
- `uniapp` 当前不是新的平台 owner，也不是当前阶段的主交付界面。

### 2. 架构定位

- 服务端契约仍以 `apps/server` 输出的 API / schema 为唯一来源。
- 若未来启动 `uniapp`，其 HTTP client、错误映射、登录态管理、页面装配均应由 `uniapp` 自己的前端 owner 承担。
- 不允许把 `uniapp` 需求反向沉淀为新的跨前端 shared 桶文件。

## 优先级排序

1. 第一优先级：`Vue`
   用于继续承接当前企业后台、系统模块工作区与平台能力验证。
2. 第二优先级：`uniapp`
   用于在 `Vue` 主线稳定后，补第二个 C 端交付面。
3. 非当前主线：`React`
   仍保留为可选适配方向，但不作为当前 C 端第二优先级实施对象。

## 边界约束

### 当前允许

- 在 `docs/plans` 中记录 `uniapp` 的设计定位、复用策略与启动门槛。
- 在路线图和项目画像中最小同步“`Vue` 第一、`uniapp` 第二”的当前决策。

### 当前不允许

- 不提前创建 `packages/frontend-uniapp` 或 `apps/example-uniapp`。
- 不提前抽取面向 `Vue + uniapp` 的 shared UI / shared state / shared adapter。
- 不为了未来多端统一而修改 `apps/server`、`packages/schema`、`packages/ui-core` 的 owner。
- 不把多端分发、消息推送、原生能力桥接写成当前已具备能力。

## 复用原则

### 可复用

- `apps/server` 暴露的 API 契约。
- `packages/schema` 中已经稳定的 schema / DTO 约束。
- `packages/ui-core` 中不携带框架绑定语义的 UI 协议。

### 不直接复用

- `packages/ui-enterprise-vue` 的组件实现。
- `packages/frontend-vue` 的 Vue 运行时封装。
- `apps/example-vue` 的应用装配、页面结构与企业后台交互壳层。

说明：

`uniapp` 若启动，只能复用契约层和无框架语义协议，不能把 Vue 预设实现视为“天然跨端可复用”。

## 候选落地路径

### Phase A: 仅设计

- 保持当前状态，只在文档中固定优先级与边界。
- 不新增代码目录。

### Phase B: 启动前门槛确认

满足以下条件后，才允许进入最小实现：

1. `Vue` 主线至少完成当前后台基础能力收口，不再处于高频结构波动期。
2. 已明确 `uniapp` 的 canonical owner 和目录边界。
3. 已明确首个验证场景，避免一上来做完整多模块端。
4. 已明确最小验证命令或人工验收路径。

### Phase C: 最小实现候选

若后续启动，优先考虑：

- 新建独立应用 owner，例如 `apps/example-uniapp`。
- 如确有必要，再补独立适配层 owner，例如 `packages/frontend-uniapp`。
- 首轮仅验证登录、会话恢复、单工作区列表/详情或单一 C 端闭环，不并发铺开完整后台能力。

## 首轮建议验证范围

- 登录态接入是否可复用现有服务端 auth contract。
- 基础 API 请求、错误处理与租户/身份语义是否可在 `uniapp` 环境下稳定承接。
- 单一高频 C 端页面能否形成最小闭环。

## 风险

### 架构风险

- 若过早把 `uniapp` 拉进实现主线，会分散当前 `Vue` 与后台基础能力收口节奏。
- 若为了多端统一过早抽 shared，会制造错误 owner 和难验证的中间层。

### 重复实现风险

- `uniapp` 若直接复制 `apps/example-vue` 的页面装配与组件实现，容易形成重复 owner。
- `uniapp` 若复用 Vue 组件层而非契约层，会导致框架边界失真。

## 回滚路径

- 当前阶段只有文档决策，无代码 owner 变更。
- 若后续优先级变化，只需回收路线图和设计文档表述，不涉及运行时代码回滚。

## 文档同步要求

- 当前已同步：`docs/roadmap.md`、`docs/PROJECT_PROFILE.md`
- 当前不需要同步：`docs/ARCHITECTURE_GUARDRAILS.md`

原因：

本轮只固定优先级与设计方向，尚未正式新增 `uniapp` package / app owner，也未改变依赖方向。

## 结论

当前决策应收口为：

- `Vue` 继续作为第一优先级 C 端界面与主线验证前端。
- `uniapp` 作为第二优先级 C 端界面进入设计储备。
- 先定边界和启动门槛，再决定是否进入实现，不提前创建跨端共享抽象。
