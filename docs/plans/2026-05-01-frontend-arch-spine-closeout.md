# 2026-05-01 Frontend Architecture Spine Closeout

## 结论

`apps/example-vue` 的前端脊柱搭建第一阶段已按修订后边界完成，可归档为历史快照。

本次归档只覆盖：

- workspace 注册表
- 路由 / 导航 / module ready 从注册表推导
- `createCrudWorkspace` 本地工厂
- 已迁移 workspace 的直接回归补强

本次归档不覆盖：

- `provide/inject` 替代 props 透传
- 共享样式下沉
- 前端类型网关 / OpenAPI 自动生成

## 归档边界

### 已完成

1. workspace 注册表已建立并投入运行
   - `apps/example-vue/src/app/workspace-registry/*`
   - 已按 `auth / system / business` 分桶
   - 路由与本地导航已从注册表推导

2. `moduleReady` 已从手写多 ref 收口到注册表驱动映射
   - `createWorkspaceModuleReadyMap`
   - `useExampleWorkspaceGates`

3. 本地 CRUD 工厂已建立并覆盖标准本地 CRUD 工作区
   - `apps/example-vue/src/workspaces/create-crud-workspace.ts`
   - 已迁移：`dictionary / department / post / menu / notification / role / setting / tenant / user`

4. 直接工作区回归已补到足够支撑当前阶段继续演进
   - `create-crud-workspace.test.ts`
   - `use-dictionary-workspace.test.ts`
   - `use-auth-session-workspace.test.ts`
   - 以及此前已补齐的 `setting / post / role / department / menu / tenant / notification / user / customer`

### 按边界排除，不视为未完成

1. `customer workspace`
   - 保持独立实现
   - 原因：当前仍是唯一显著依赖服务端分页 / 排序 / 删除确认的特殊工作区
   - 不为追求统一而强行迁入 CRUD 工厂

2. `operation-log workspace`
   - 保持独立实现
   - 原因：只读查询工作区，不属于当前 CRUD 工厂目标

3. `auth-session / file / workflow / generator-preview`
   - 保持独立实现
   - 原因：动作模型与状态结构不符合标准 CRUD 工厂边界

## 验证

本轮相关切片均按“小片提交 + 每片验证 + git 存档”执行。

### 已执行并通过

- `bun test apps/example-vue/src/workspaces/use-dictionary-workspace.test.ts`
- `bun test apps/example-vue/src/workspaces/use-auth-session-workspace.test.ts`
- `bun run typecheck`
- `bun run build:vue`
- `bun run check`

### 已形成的 git checkpoint

- `16e1a20 test: 补充字典工作区直接回归`
- `ccf19dc test: 补充在线会话工作区直接回归`

## 对原计划的修订说明

原始执行计划把 `customer` 与 `operation-log` 一并写入里程碑 4 的 CRUD 迁移尾项。实际推进后已证明这两个 workspace 不应机械纳入同一目标：

- `customer`：保留独立实现更符合当前 owner 与验证边界
- `operation-log`：只读查询面板，不是标准 CRUD

因此本次归档以“修订后边界完成”为准，而不是按旧表逐项机械打勾。

## 后续主线

前端架构重构的当前活跃项切换为：

1. `M5 / 前端体验升级`
   - `provide/inject`
   - props 透传收敛
   - 共享样式下沉

2. `M6A / 前端类型网关`
   - `lib/platform-api/types.ts`
   - 消费方导入收敛

## 文档同步

- `2026-04-30-architecture-refactor-execution-plan.md`：标记前端脊柱阶段已归档，并把后续焦点切到 `M5 / M6`
- `2026-04-30-frontend-vue-pain-points.md`：补充“第一阶段已完成，本文档转为历史诊断输入”的说明
