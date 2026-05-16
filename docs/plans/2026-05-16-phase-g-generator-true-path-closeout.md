# 2026-05-16 Phase G：Generator 真链路收口

更新时间：`2026-05-16`

## 目的

本文件只记录 `Phase G` 在当前仓库内已经落下的真实变化、边界与验证，不重复 go-live 收口语义，也不把导入链路写成已完成事实。

## 边界摘要

目标模块：
- `apps/example-vue`
- `apps/server`
- `packages/persistence`
- `packages/generator`

现有 owner：
- `apps/example-vue`：真实 `generator preview` workspace、`demohub` 原型、输入装配、状态展示、主动作组织、证据视图
- `apps/server`：`generator-session` 的 `preview / review / confirm / apply` 编排
- `packages/persistence`：review-only SQL proposal snapshot 与 handoff artifact canonical owner
- `packages/generator`：schema -> preview/report/apply artifact，不接 UI 运行时

影响面：
- `generator preview` 正式工作区
- `demohub` Generator 原型
- `generator-session` DTO / OpenAPI / 生命周期验证
- SQL proposal snapshot 的确认与恢复展示

验证方式：
- `bun test apps/example-vue/src/components/workspaces/generator/generator-preview-confirmation-evidence.test.ts apps/example-vue/src/components/workspaces/generator/use-generator-preview-workspace-main-state.test.ts apps/example-vue/src/workspaces/use-generator-preview-workspace.actions.test.ts apps/example-vue/src/workspaces/use-generator-preview-workspace.selection.test.ts`
- `bun test apps/server/src/modules/generator-session/module.lifecycle.test.ts apps/server/src/modules/generator-session/module.guards.test.ts apps/server/src/modules/generator-session/module.detail.test.ts`
- `bun run e2e:generator:studio`
- `bun run build:vue`

需要同步的文档：
- `docs/roadmap.md`
- `apps/example-vue/src/MODULE.md`

## 已完成收口

### G1. Demohub 原型冻结

- `demohub` 的 `Generator Start / Generator Review / Apply Checklist` 三段原型继续保留为试稿 owner。
- 起稿原型已去掉“高级 JSON 作为并列主入口”的表达，首屏只保留模板和复制结构两类开始方式。
- 原型检查项已明确：高级 JSON 只留在高级区，不再作为首屏主动作竞争项。

### G2. 正式 workspace 迁回与 UI 契约收口

- 真实 `generator preview` workspace 已稳定承接三段结构：
  - 顶部固定 `新建生成`
  - 下方固定 `最近结果`
  - 文件级区域固定 `生成结果`
- 起稿主模式已收口为：
  - `从空白模板开始`
  - `复制现有模块结构`
- `Schema JSON` 仍可编辑，但只通过高级区展开，不再作为首屏主入口。
- 已删除旧的页面级 step indicator，避免回退到“抽象步骤条驱动”的旧方案。
- shell descriptor 已补齐真实 workspace 所需的 `blockerReasons / recoveryStatus / driftStatus` 透传。

### G3. Review / Confirm / Apply 证据强化

- `generator-session` OpenAPI 与响应结构已显式补出：
  - `blockerReasons`
  - `confirmationEvidence`
  - `applyEvidence`
  - `recoveryStatus`
  - `driftStatus`
- `apps/example-vue` 已把 blocker / recovery 做成本地化展示，不再直接把 server 的英文原因文案暴露给中文主界面。
- `confirmationEvidence` 的前端类型、摘要逻辑和测试已收口；空 checklist 不再误报为“已记录确认凭据”。
- 生命周期测试已固定以下状态信号：
  - preview 后默认 `review-required`
  - review 通过后默认 `confirmation-required`
  - confirm / apply 后 blocker 清空
  - `recoveryStatus` 与 `driftStatus` 的基础返回 shape 稳定可回归

### G4. 真链路验收与文档收口

- 当前仓库内已通过的最小真链路验证覆盖：
  - preview 成功 / 失败
  - review -> confirm -> apply 状态迁移
  - apply 冲突、stale、rejected、confirmation required 等阻断路径
  - SQL proposal snapshot 的读取、缺失重建、损坏重建
  - 真实 workspace 的前端编译与 generator 相关交互测试
- `scripts/e2e-generator-studio-guided-flow-smoke.ts` 已从步骤映射 smoke 收口为真实 workspace 验收：
  - happy path 覆盖 `start -> preview -> review -> confirm -> apply`
  - blocked path 覆盖 apply 阻断后的 detail refresh 与 blocker evidence 回看

## 阶段内保留边界

- confirm 不等于 migration 完成
- apply 只到 staging
- SQL preview / proposal 仍然是 review-only
- 正式 migration 仍留在 `packages/persistence` 人工接入路径
- `demohub` 不是主流程必经页，只保留为后续原型试稿 owner
- 导入链路只保留边界备注，不进入本阶段完成定义

## 当前非目标

- 不新增第二套 starter
- 不新增跨层 shared owner
- 不把前端运行时职责迁进 `packages/generator`
- 不引入导入 DSL / 导入平台接口实现
- 不恢复页面级 step bar 或新的“阶段条”心智
