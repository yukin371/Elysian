# MODULE

## 模块职责

- `apps/example-vue/src` 负责示例应用入口装配。
- 当前 owner 包含：
  - enterprise shell 入口
  - 登录态恢复与会话页装配
  - 各 workspace composable 的接线
  - 示例应用级导航、权限 gate、工作区切换与展示派生
- 不拥有：
  - server / auth / persistence 业务逻辑
  - shared base / shared utils
  - `packages/*` 的通用协议或预设实现

## 当前边界

- 入口拆分只允许继续下沉到 `apps/example-vue/src/app/*` 或 `apps/example-vue/src/components/workspaces/*`。
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
  - `use-example-navigation.ts`
  - `use-example-workspace-gates.ts`
  - `use-example-query-summary.ts`
  - `use-example-shell-meta.ts`
  - `use-example-workspace-sync.ts`
  - `use-example-session-orchestration.ts`
  - `use-example-shell-binding-types.ts`
  - `use-example-shell-header-bindings.ts`
  - `use-example-shell-workspace-main-bindings.ts`
  - `use-example-shell-workspace-secondary-bindings.ts`
  - `use-example-shell-bindings.ts`（已收口为薄聚合器）
  - `example-page-definitions.ts`
  - `create-example-shell-bindings-options.ts`
  - `i18n/index.ts`（已收口为 locale 聚合器）
  - `i18n/zh-CN*.ts`
  - `i18n/en-US*.ts`
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
3. 继续评估 `use-example-shell-binding-types.ts` 与 `ShellWorkspaceSecondarySwitch.vue` 是否还能在本模块 owner 内进一步收口，避免把入口风险转移到新的本地巨型文件。
4. 如确实因入口装配职责无法继续安全拆分，保留豁免并在本文件持续更新原因与后续计划。
