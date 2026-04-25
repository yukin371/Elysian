# ADR-0010 Vue 企业预设迁移至 TDesign

状态：`accepted`

日期：`2026-04-25`

## 背景

`Vue Enterprise` 预设最初基于 `Arco Design Vue` 落地，相关历史事实如下：

- `packages/ui-enterprise-vue` 已存在并作为 Vue 企业预设 owner
- `apps/example-vue` 已消费 `ElyShell`、`ElyTable`、`ElyQueryBar`、`ElyForm`、`ElyCrudWorkspace` 等企业组件
- `ADR-0008` 曾是已接受的基线决策

但近期选型复核后，原先支撑 `Arco` 的若干判断已经变弱：

- `Arco Design Vue` 的维护节奏相较此前明显放缓
- 对双前端长期路线而言，`TDesign` 在 `Vue` 与 `React` 两侧的同步设计系统叙事更直接
- 当前仓库对第三方组件库的耦合已基本收敛在 `packages/ui-enterprise-vue`，具备后续分阶段替换的工程边界

自 `2026-04-25` 起，仓库已完成本轮 `Arco -> TDesign Vue Next` 迁移收口：

- `packages/ui-enterprise-vue` 已移除 `Arco` runtime 依赖并切换到 `TDesign Vue Next`
- `apps/example-vue` 已完成企业预设示例页适配
- 示例默认语言已切到 `zh-CN`，并保留 `en-US` 回退
- 组件映射与布局问题已按当前最小企业预设闭环完成修正

因此本 ADR 不再是“未来方向提案”，而是对已接受并已实施决策的归档。

## 决策提案

### 1. Vue 企业预设底座切换为 `TDesign Vue Next`

- `packages/ui-enterprise-vue` 的官方组件库底座正式切换为 `TDesign Vue Next`
- `packages/ui-enterprise-vue` 继续作为 canonical owner，不新增第二个企业预设 owner
- `ui-core` 协议层保持中立，不把 `TDesign` 语义反向渗透到协议层
- `ADR-0008` 作为历史基线保留，但当前状态改为被本 ADR 替代

### 2. React 企业预设后续优先与 `TDesign React` 对齐

- `packages/frontend-react` 仍不在本轮直接实现
- 但后续若启动 React 企业预设，应优先按 `TDesign` 对齐视觉系统与交互范式
- 不要求 Vue/React 完全共享实现，只要求共享设计系统方向与页面协议

## 选择理由

### 选择 `TDesign`

- 当前问题是“替换 `Arco` 后谁更适合作为下一阶段 Vue 企业预设”，而不是泛化地比较所有 UI 生态
- `TDesign` 在 `Vue` 与 `React` 上都提供同一设计系统下的官方实现，更贴近 `Elysian` 的双前端长期目标
- 对企业管理台常见的布局、表格、表单、筛选和状态展示场景，`TDesign` 的组件覆盖足够直接
- 当前仓库已经通过 `ui-core -> ui-enterprise-vue` 做了一层协议隔离，切换成本主要集中在预设映射层，而非全仓页面协议

### 不选择 `Ant Design Vue`

- `Ant Design` 在 React 生态、社区体量和第三方资料上仍然更强
- 但当前问题更偏向“Vue 企业预设维护与双栈设计系统一致性”
- 在这个问题域里，`Ant Design Vue` 并没有比 `TDesign` 更明显的工程优势

## 实施约束

- 不新增第二套 `ui-core` 协议
- 不在 `packages/frontend-vue` 和 `packages/ui-enterprise-vue` 之间重复放置 UI 组件实现
- 不在迁移早期同步改造 `generator` 页面协议，先保证预设映射兼容
- 不在同一轮同时做组件库替换、页面重设计和 React 首版落地
- 当前轮次已按“最小可用企业预设”完成切换，不额外扩展为全新视觉系统重做

## 文档与后续动作

- 实施草案归档见 [2026-04-25-vue-enterprise-preset-tdesign-migration-draft.md](../plans/2026-04-25-vue-enterprise-preset-tdesign-migration-draft.md)
- 组件映射与回归清单见 [2026-04-25-vue-enterprise-preset-tdesign-mapping-checklist.md](../plans/2026-04-25-vue-enterprise-preset-tdesign-mapping-checklist.md)
- 已同步 `docs/PROJECT_PROFILE.md` 与 `docs/roadmap.md`
