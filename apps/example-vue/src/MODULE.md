# MODULE

## 模块职责

- `apps/example-vue/src` 负责示例应用入口装配。
- 当前 owner 包含：
  - enterprise shell 入口
  - 登录态恢复与会话页装配
  - 各 workspace composable 的接线
  - 示例应用级导航装配、权限 gate、工作区切换与展示消费
  - 示例应用本地路由层装配
  - 提交到 `src/modules/*` 的标准 CRUD 前端 surface 生成产物消费与校验
- 不拥有：
  - server / auth / persistence 业务逻辑
  - shared base / shared utils
  - `packages/*` 的通用协议或预设实现

## 当前边界

- 入口拆分只允许继续下沉到 `apps/example-vue/src/app/*`、`apps/example-vue/src/components/layout/*` 或 `apps/example-vue/src/components/workspaces/*`。
- 本地路由判断与 hash 同步优先下沉到 `apps/example-vue/src/router/*`。
- `src/app/use-example-navigation.ts` 优先保留“消费 router 派生结果并绑定 shell 状态”的职责，不再新增 route/path/kind 文案判断。
- workspace 运行时状态注入优先收口在 `components/workspaces/shell/*`；已迁移工作区应由 shell `provide`、Main/Panel `inject`，不要回退为跨层 props 透传。
- 运行时状态只作为 shell 内部态和诊断态存在，不再作为用户可见的平级 `runtime` tab。
- shell descriptor 对标准 CRUD surface 的覆盖关系必须跟随 `workspace-registry/generated/*` 的 artifact 清单校验；新增标准 CRUD 模块后，不允许静默回退到 customer resolver。
- `@elysian/example-vue` 的 `build` 与仓库根 `check` 必须显式经过 `verify:workspace-registry-artifacts`；artifact 漂移不能只靠人工记得执行脚本。
- 标准 CRUD 的生成产物当前落在 `src/modules/*`；这些文件属于 generator 输出面，不在示例应用内手工维护，任何修改都应回到 `packages/generator` 模板或 `scripts/generate-standard-crud-surfaces.ts`。
- shell main / secondary 当前都消费 `src/modules/generated/index.ts` 暴露的生成组件映射；标准 CRUD 的 main/panel 不再保留示例应用本地手写实现。
- generator preview workspace 负责展示和提交两类生成输入：已注册 schema 的边界模式，以及前端 JSON 草稿输入；当前还承接简化 schema 展开、模板快速填充、结构化校验反馈与步骤引导流，但它只做输入装配与预览消费，不拥有 generator 引擎。
- `demohub` workspace 只承载本地页面原型与交互试稿，用来先验证信息架构、表单主流程和反馈文案；它不接真实接口、不改真实模块、不替代正式 workspace owner。
- 任何面向用户流程的页面优化，默认先落到 `demohub` 验证，再迁回真实 workspace；当前 `generator preview` 的起稿、结果判断、apply 前确认三段主流程原型都以 `demohub` 为唯一试稿 owner。
- 若是纯展示块，优先拆成 workspace 组件。
- 若是入口级派生或装配逻辑，优先拆成本地 composable。
- 不为了压行数把职责推到错误 owner。

## 文件体量豁免

- 临时豁免文件：[App.vue](/E:/Github/Elysian/apps/example-vue/src/App.vue)
- 原因：
  - 该文件仍是示例应用唯一入口，当前同时装配 enterprise shell、会话恢复、12+ workspace 的选择同步与运行态切换。
  - 再继续把入口级跨 workspace 编排强行下沉到 shared 层，会破坏 `apps/example-vue` owner 边界。
  - 当前仓库还处在“示例应用内收口”阶段，部分逻辑虽然可继续拆，但仍必须留在本模块本地 owner 内。

## 已完成拆分

- 已从 `App.vue` 下沉：
  - `app-shell-helpers.ts`
  - `create-example-app-shell-bindings-options.ts`
  - `create-example-shell-meta-options.ts`
  - `create-example-session-orchestration-options.ts`
  - `example-auth-errors.ts`
  - `use-example-app-bootstrap.ts`
  - `use-example-navigation.ts`
  - `use-example-workspace-gates.ts`
  - `use-example-runtime-state.ts`
  - `use-example-query-summary.ts`
  - `use-example-shell-meta.ts`
  - `use-example-csv-exports.ts`
  - `use-example-workspace-sync.ts`
  - `use-example-app-shell-orchestration.ts`
  - `workspace-registry/*`
  - `modules/generated/index.ts`
  - `use-example-session-orchestration.ts`
  - `use-example-shell-binding-types.ts`
  - `use-example-shell-header-bindings.ts`
  - `use-example-shell-workspace-main-bindings.ts`
  - `use-example-shell-workspace-secondary-bindings.ts`
  - `use-example-shell-bindings.ts`（已收口为薄聚合器）
  - `use-example-workspaces.ts`
  - `example-page-definitions.ts`
  - `create-example-shell-bindings-options.ts`
  - `i18n/index.ts`（已收口为 locale 聚合器）
  - `i18n/zh-CN*.ts`
  - `i18n/en-US*.ts`
  - `router/example-router.ts`
  - `router/example-workspace-routes.ts`（registry-driven route catalog）
  - `components/auth/AdminLoginPage.vue`
  - `components/layout/ExampleAppStageGate.vue`
  - `components/layout/AdminShellLayout.vue`
  - `ShellWorkspaceHeaderActions.vue`
  - `ShellWorkspaceMainSwitch.vue`
  - `ShellWorkspaceSecondarySwitch.vue`
  - `ShellHeroBanner.vue`
  - `ShellWorkspaceSectionIntro.vue`
  - `ShellWorkspaceSessionCard.vue`
  - 多个 `components/workspaces/*` 展示组件

## 后续拆分路径

1. 继续评估 `App.vue` 中剩余的大体量入口编排是否可按“本地装配组”继续下沉到 `src/app/*`，但不把业务 owner 推向 shared 层。
2. 若 `App.vue` 仍长期显著超限，再拆 shell 里剩余的纯装配块，优先保持 `apps/example-vue` 内部 owner 闭合。
3. 继续评估 `use-example-workspaces.ts` 与 `use-example-shell-binding-types.ts` 是否还能在本模块 owner 内进一步收口，避免把入口风险转移到新的本地巨型文件。
4. 如确实因入口装配职责无法继续安全拆分，保留豁免并在本文件持续更新原因与后续计划。
