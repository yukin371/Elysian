# 2026-04-28 架构债务审查报告

更新时间：`2026-04-28`

## 背景

- 本报告用于固化当前仓库的阶段性架构债务观察结果。
- 目标不是追求“代码更优雅”，而是按仓库现有约束检查边界稳定性、owner 清晰度、文件体量、命名准确性与重复装配风险。
- 审查基线来源：
  - `docs/PROJECT_PROFILE.md`
  - `docs/roadmap.md`
  - `docs/ARCHITECTURE_GUARDRAILS.md`
  - `docs/DEVELOPMENT_PRINCIPLES.md`
  - 各目标模块 `MODULE.md`

## 审查范围

- `apps/server`
- `apps/example-vue`
- `apps/example-uniapp`
- `packages/schema`
- `packages/persistence`
- `packages/frontend-vue`
- `packages/frontend-react`
- `packages/ui-core`
- `packages/ui-enterprise-vue`
- `scripts`

本次为静态结构审查，不等价于运行时故障排查，也不等价于完整功能验证。

## 审查方法

1. 先对照边界文档确认当前阶段允许范围、canonical owner 与禁止事项。
2. 扫描大文件、目录结构、模块入口与导出面。
3. 重点抽查可疑汇流点：
   - 前端入口与 workspace 装配
   - persistence owner 下的大型关系型访问文件
   - smoke / app 合约测试等验证汇流点
4. 只把对边界、owner、扩展成本有明确影响的问题计入债务，不把初始化阶段的正常空白误判为缺陷。

## 总体结论

- 仓库的大边界总体仍然成立，未发现明显违背 `apps/* -> packages/*` 依赖方向的系统性错误。
- 当前主要债务不在“是否缺少终态能力”，而在以下几类结构性风险：
  - 单文件汇流点过大
  - 包级 public API 被绕过
  - 命名已经不能反映真实 owner
  - 相同装配决策在多个入口重复维护
  - 适配层开始泄露具体业务样例

## 主要发现

### 1. 高风险：`apps/example-vue` 直接深引 `packages/schema/src/*`

- 位置：
  - `apps/example-vue/src/App.vue`
- 现象：
  - 当前通过 `../../../packages/schema/src/department`
  - `../../../packages/schema/src/dictionary`
  - `../../../packages/schema/src/menu`
  - `../../../packages/schema/src/notification`
  - `../../../packages/schema/src/operation-log`
  - `../../../packages/schema/src/post`
  - `../../../packages/schema/src/role`
  - `../../../packages/schema/src/setting`
  - `../../../packages/schema/src/tenant`
  - `../../../packages/schema/src/user`
    直接消费 package 内部文件，而不是通过 `@elysian/schema` 的导出面消费。
- 风险：
  - `apps/example-vue` 开始依赖 `packages/schema` 的内部目录结构，而不是依赖稳定契约。
  - `packages/schema` 后续即使只做内部整理，也会外溢为应用层破坏性改动。
  - 这会削弱 `packages/schema` 作为 canonical contract owner 的边界意义。
- 判断：
  - 这是明确的架构债务，不是单纯风格问题。
- 建议：
  - 优先补齐 `@elysian/schema` 对相关 module schema 的统一导出。
  - 应用层只经 package public API 消费契约，不再深引 `src/*`。

### 2. 高风险：`apps/example-vue/src/lib/platform-api.ts` 成为前端 API 总汇流点

- 位置：
  - `apps/example-vue/src/lib/platform-api.ts`
- 现象：
  - 单文件同时承载：
    - DTO / response type
    - access token 内存状态
    - 通用 `requestJson` / `requestBlob`
    - 401 刷新重试
    - 错误映射
    - 用户、角色、菜单、租户、文件、通知、字典、workflow、generator session 等多模块 HTTP 调用
- 风险：
  - 任一系统模块协议变动都会集中冲击该文件。
  - 示例应用的 API owner 不再按模块清晰收口，review 和回滚成本持续上升。
  - 一旦后续引入第二前端面或更细粒度页面，复用与拆分成本会进一步增大。
- 判断：
  - 这是当前前端侧最明显的结构债务之一。
- 建议：
  - 保留本地 owner 在 `apps/example-vue/src/lib` 内部。
  - 先拆为“薄 transport + 按模块 client”，例如 `auth`、`users`、`roles`、`menus`、`files`、`workflow`、`generator-preview`。
  - 避免为拆分而新建无边界 `shared/api` 桶目录。

### 3. 高风险：`packages/persistence/src/auth.ts` 与 `schema/auth.ts` 命名失真且边界过宽

- 位置：
  - `packages/persistence/src/auth.ts`
  - `packages/persistence/src/schema/auth.ts`
- 现象：
  - 文件名是 `auth`，但实际承载了：
    - users
    - roles
    - permissions
    - menus
    - departments
    - posts
    - refresh sessions
    - audit logs
    - data scope 关联
  - 同时文件体量已明显膨胀。
- 风险：
  - 文件名已经无法表达真实 owner，降低理解和检索效率。
  - 后续再补系统模块时，极易继续“顺手堆进 auth”，形成错误的收纳中心。
  - 审查者会把“认证”和“系统基础数据”混看，难以及时识别职责越界。
- 判断：
  - 当前 package owner 仍然正确，问题在 package 内部文件边界和命名，而不是 package 级 owner 选错。
- 建议：
  - 在 `packages/persistence` 内部做受控拆分。
  - 优先按真实关系域拆为如 `user`、`role`、`menu`、`department`、`post`、`session`、`audit-log` 等文件。
  - 拆分保持在原 package owner 内完成，不新增第二套 persistence owner。

### 4. 中风险：`packages/frontend-vue` 开始泄露具体业务样例

- 位置：
  - `packages/frontend-vue/src/index.ts`
- 现象：
  - 适配层除了提供通用 `buildVueCustomCrudPage` 外，还直接导出 `customerWorkspacePageDefinition`。
- 风险：
  - “框架适配层”与“业务示例页定义”开始混杂。
  - 若继续沿这个方向扩展，`frontend-vue` 很容易从 preset/adaptor 变成业务样例容器。
  - 不利于后续维持与 `frontend-react` 的平行边界。
- 判断：
  - 目前影响面不大，但已经出现边界漂移信号。
- 建议：
  - 适配层保留中性 builder、权限工具、locale runtime 等通用能力。
  - 具体业务 page definition 回收到 `apps/example-vue` 本地 owner。

### 5. 中风险：`apps/example-vue` shell 装配依赖多个硬编码汇流点

- 位置：
  - `apps/example-vue/src/App.vue`
  - `apps/example-vue/src/components/workspaces/shell/ShellWorkspaceMainSwitch.vue`
  - `apps/example-vue/src/components/workspaces/shell/ShellWorkspaceSecondarySwitch.vue`
- 现象：
  - `App.vue` 统一创建大量 page definition，并依次接入多个 workspace hook。
  - 主区与侧栏各自维护一套按 `workspace kind` 分发的硬编码 switch。
  - 新增一个 workspace，通常需要同步修改：
    - `App.vue`
    - `ShellWorkspaceMainSwitch.vue`
    - `ShellWorkspaceSecondarySwitch.vue`
- 风险：
  - 扩展一个模块的改动面固定偏大。
  - 很容易出现主区和侧栏漏改、错改、行为漂移。
  - 入口虽然已做过拆分，但仍停留在“多个大文件互相分摊复杂度”的状态。
- 判断：
  - 这类债务已经被 `apps/example-vue/src/MODULE.md` 部分承认，说明问题已被感知，但尚未真正收口。
- 建议：
  - 保持 owner 在 `apps/example-vue` 内。
  - 进一步收敛为本地 registry / descriptor 驱动的 workspace 装配，减少三处同步改动。
  - 不要为减少重复而把示例应用装配推到 `packages/*`。

### 6. 中风险：验证层存在明显单文件汇流

- 位置：
  - `scripts/e2e-smoke.ts`
  - `apps/server/src/app.test.ts`
- 现象：
  - `e2e-smoke.ts` 同时承担 server 启停、依赖等待、流程编排、失败分类、报告落盘。
  - `app.test.ts` 体量远超正常 review 规模，承担大量 server 合约场景。
- 风险：
  - 测试失败时定位成本高。
  - 单个文件修改很容易引入无关回归。
  - 长期会反过来抬高实现层改动成本，因为验证层越来越难维护。
- 判断：
  - 当前仍可运行，但已进入需要计划性治理的状态。
- 建议：
  - `e2e-smoke.ts` 按“环境管理 / 业务 smoke case / 报告输出”拆本地文件。
  - `app.test.ts` 按模块或按主题拆测试文件，避免继续增长。

## 次级观察

### 1. 文件体量接近或超过默认阈值的点较多

当前扫描中较突出的文件包括：

- `apps/example-vue/src/App.vue`
- `apps/example-vue/src/lib/platform-api.ts`
- `packages/persistence/src/auth.ts`
- `scripts/e2e-smoke.ts`
- `apps/server/src/modules/workflow/service.ts`
- `apps/example-vue/src/components/workspaces/shell/ShellWorkspaceSecondarySwitch.vue`
- `apps/example-vue/src/components/workspaces/shell/ShellWorkspaceMainSwitch.vue`

这些文件并不全部都应立刻拆，但都已经进入“继续扩写前必须先评估受控拆分”的区间。

### 2. `packages/frontend-react` 当前仍是占位状态

- 现状本身不算债务，因为 roadmap 明确当前前端第一优先级仍是 Vue。
- 但后续若继续在 `frontend-vue` 中沉淀业务特有行为，而 `frontend-react` 长期只保留占位壳，则会放大双适配层边界失衡风险。

## 本轮未判定为问题的项

以下内容本轮不判定为架构债务：

- 当前仓库尚未完成的终态平台能力
- `apps/server` 依赖 `packages/persistence`、`packages/schema` 的基本方向
- `apps/example-uniapp` 仍处于骨架期的事实
- 当前以 `docs/plans/*.md` 承接阶段性设计与收口文档的方式

原因：

- 这些内容与当前 roadmap 和 guardrails 一致，属于阶段性现状，而不是明显偏离。

## 优先治理顺序

建议按以下顺序处理：

1. 消除 `apps/example-vue` 对 `packages/schema/src/*` 的深引。
2. 在 `apps/example-vue` 内部拆分 `platform-api.ts`。
3. 在 `packages/persistence` 内部按真实关系域拆解 `auth.ts` / `schema/auth.ts`。
4. 把 `apps/example-vue` 的 workspace 装配收敛为本地 registry/descriptor 机制。
5. 逐步拆分 smoke 与 server 合约测试汇流文件。

## 治理约束

后续治理时应继续遵守：

- 不新增新的 shared utils 桶目录
- 不为了压文件体量把职责推到错误 owner
- 不把 `apps/example-vue` 的本地装配问题转移到 `packages/*`
- 不把本次审查结论直接写成“仓库已完成”的事实，只有真实收口后再同步 `PROJECT_PROFILE` / `roadmap`

## 结果摘要

- 已识别的主要架构债务：6 项
  - 高风险 3 项
  - 中风险 3 项
- 当前最需要优先处理的不是新增功能，而是收敛前端入口和 persistence 内部的边界清晰度。
- 仓库整体边界没有系统性失守，但局部汇流点已经开始影响可审查性、可维护性和后续扩展成本。
