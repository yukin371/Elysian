# 2026-04-25 Vue Enterprise Preset TDesign Migration Draft

更新时间：`2026-04-25`

## 目标

本文件最初用于 `packages/ui-enterprise-vue` 从 `Arco Design Vue` 迁移到 `TDesign Vue Next` 的前置实施草案。当前迁移已完成，本文件保留为实施记录与回归参考。

## 当前结论

- `packages/ui-enterprise-vue` 已完成 `TDesign Vue Next` 切换
- `apps/example-vue` 已完成示例页、构建切片与 i18n 基线适配
- 本文档保留实施前边界与阶段设计，作为已完成迁移的背景记录
- 当前收尾重点转为回归验证、文档一致性与后续体验增量

## 边界摘要

- 目标模块：
  - `packages/ui-enterprise-vue`
  - `apps/example-vue`
  - `docs/decisions`
  - `docs/plans`
- 现有 owner：
  - `packages/ui-enterprise-vue` 持有 Vue 企业预设组件实现
  - `packages/frontend-vue` 持有 Vue 侧 API/权限适配，不持有企业组件底座
  - `packages/ui-core` 持有中立页面协议
- 影响面：
  - 企业布局、菜单、表格、表单、筛选、详情页等组件映射
  - `apps/example-vue` 的演示与构建切片
  - `ADR-0008` 与后续选型决策记录
- 不新增 owner：
  - 不新增 `ui-enterprise-vue-tdesign`
  - 不新增第二套 `ui-core` 页面协议
  - 不把第三方组件库语义下沉到 `ui-core`

## 非目标

- 不在本轮把 `Arco` 全量替换为 `TDesign`
- 不在同一轮启动 React 企业预设实现
- 不借迁移机会重做页面协议、业务字段模型或 generator contract
- 不把视觉重设计和组件库替换混成同一个交付包

## 迁移动因

### 为什么当时先写草案

- 当前仓库已经有已落地的 `Arco` 实现，不能继续用口头共识替代边界文件
- 迁移涉及长期设计系统方向，需要先固化为计划与提案
- 当前 `ui-core -> ui-enterprise-vue -> apps/example-vue` 的边界清晰，适合先做迁移切面盘点

### 为什么目标是 `TDesign`

- 更贴近未来 Vue/React 双栈共用设计系统的路线
- 企业后台常见能力映射完整，适合作为标准化企业预设底座
- 相比 `Ant Design Vue`，更符合这次“替换 Arco”的问题定义，而不是泛化追求生态最大值

## 当前耦合面

已确认的 `Arco` 直接耦合集中在以下位置：

- `packages/ui-enterprise-vue/package.json`
- `packages/ui-enterprise-vue/src/components/ElyShell.vue`
- `packages/ui-enterprise-vue/src/components/ElyNavNodes.vue`
- `packages/ui-enterprise-vue/src/components/ElyTable.vue`
- `packages/ui-enterprise-vue/src/components/ElyQueryBar.vue`
- `packages/ui-enterprise-vue/src/components/ElyForm.vue`
- `packages/ui-enterprise-vue/src/components/ElyCrudWorkspace.vue`
- `packages/ui-enterprise-vue/src/components/ElyPreviewSkeleton.vue`
- `packages/ui-enterprise-vue/src/index.ts`
- `apps/example-vue/vite.config.ts`
- `apps/example-vue/src/App.vue`

结论：

- 迁移主要是 `ui-enterprise-vue` owner 内的组件映射调整
- `ui-core` 和服务端 owner 暂不需要随迁移改结构

## 分阶段实施记录

### Phase A 文档与 POC

目标：确定是否进入真正实施。

输出物：

- 迁移 ADR 结论
- 组件映射清单
- 最小 POC：`ElyShell`、`ElyTable`、`ElyForm`

验收：

- `apps/example-vue` 能以最小改动跑通企业工作区主路径
- 能证明 `TDesign` 不会迫使 `ui-core` 改协议

### Phase B 预设层替换

目标：替换预设层的第三方组件依赖。

范围：

- `packages/ui-enterprise-vue` 内组件
- `apps/example-vue` 中与组件库强耦合的展示文案/样式引用

约束：

- 同一轮不重做 UX 信息架构
- 保持 `Ely*` 组件对外 contract 不变，优先做内部实现替换

### Phase C 稳定性与生成器回归

目标：确认生成页协议、示例应用和构建输出未回归。

范围：

- `useElyCrudPage`
- `apps/example-vue`
- `build:vue`
- 基础 smoke / 手工验收

## 建议验证方式

最小验证：

- `bun run typecheck`
- `bun run test`
- `bun run build:vue`

建议补充：

- `apps/example-vue` 运行态人工检查：
  - shell 导航
  - query / reset
  - table action
  - form create / edit / readonly detail

## 风险与控制

### 架构风险

- 若迁移时顺手改协议，会破坏 `ui-core` 的中立边界
- 若在 `Phase 6B` 发布收尾前并行推进，会把生产基线问题和体验层问题混在一起

### 实施风险

- 表单、表格、菜单的交互默认值在两套组件库之间存在差异
- 现有样式里有 Arco 专属 class / color / CSS import，必须清单化清理

### 回滚路径

- 在正式切换前保留 `Arco` 分支基线
- 先保持 `Ely*` 对外 API 稳定，必要时只回滚内部实现
- 在 `Phase B` 结束前，不同步修改 `ui-core` 和 `generator`

## 需要同步的文档

- `docs/roadmap.md`
- `docs/decisions/ADR-0008-vue-enterprise-preset-selection.md`
- `docs/decisions/ADR-0010-vue-enterprise-preset-tdesign-migration.md`
- `docs/PROJECT_PROFILE.md`：
  - 仅在真正实施后再改技术栈事实

## 当前后续项

1. 继续按已落地 `TDesign` 预设补充局部体验与测试，不再回到组件库选型讨论。
2. 若后续进入更深层 UI 优化，优先限制在 `ui-enterprise-vue` owner 内，不反向改协议层。
3. 与 `Phase 9` 的 i18n/主题长期规划保持解耦，当前仅维持示例级多语言基线。
