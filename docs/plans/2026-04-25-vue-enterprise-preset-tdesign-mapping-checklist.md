# 2026-04-25 Vue Enterprise Preset TDesign Mapping Checklist

更新时间：`2026-04-25`

## 用途

该清单最初用于 `Arco -> TDesign` 迁移实施前的盘点与验收。当前仓库已完成本轮迁移收口，本文档保留为回归清单与后续体验优化参考。

## 当前 owner 与约束

- canonical owner：`packages/ui-enterprise-vue`
- 协议来源：`packages/ui-core`
- 示例承载：`apps/example-vue`
- 不允许事项：
  - 不新增第二套企业预设 owner
  - 不修改 `ui-core` 以迎合某个组件库
  - 不把示例应用里的临时适配写回协议层

## 组件映射清单

### 1. Shell / Navigation

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyShell.vue`
- 当前 Arco 依赖：
  - `Layout`
  - `LayoutHeader`
  - `LayoutContent`
  - `LayoutSider`
  - `Menu`
  - `Card`
  - `Avatar`
  - `Space`
- 迁移目标：
  - `t-layout`
  - `t-aside`
  - `t-header`
  - `t-content`
  - `t-menu`
  - `t-card`
  - `t-avatar`
  - `t-space`
- 验收点：
  - 侧边导航展开/选中行为可用
  - 顶栏统计、用户区和 tabs 区域不丢结构
  - `presetLabel`、`environment`、`status` 等文案仍按既有 contract 展示

### 2. Recursive Nav Nodes

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyNavNodes.vue`
- 当前 Arco 依赖：
  - `MenuItem`
  - `SubMenu`
- 迁移目标：
  - `t-menu-item`
  - `t-submenu`
- 验收点：
  - `directory` 与叶子菜单递归渲染正确
  - `button` 类型节点仍被过滤

### 3. Data Table

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyTable.vue`
- 当前 Arco 依赖：
  - `Table`
  - `TableColumn`
  - `Button`
  - `Space`
  - `Tag`
- 迁移目标：
  - `t-table`
  - `t-button`
  - `t-space`
  - `t-tag`
- 风险点：
  - 列定义方式和 slot API 不同
  - 行点击与操作按钮点击冒泡需要重新验证
  - 状态列颜色映射不能继续硬编码 `arcoblue`
- 验收点：
  - 列渲染正确
  - `row-click` 与 `action` 事件行为一致
  - `status` 标签、固定操作列、loading 态正常

### 4. Query Bar

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyQueryBar.vue`
- 当前 Arco 依赖：
  - `Form`
  - `FormItem`
  - `Input`
  - `Select`
  - `Option`
  - `DatePicker`
  - `Button`
  - `Space`
- 迁移目标：
  - `t-form`
  - `t-form-item`
  - `t-input`
  - `t-select`
  - `t-option`
  - `t-date-range-picker` 或等价日期范围组件
  - `t-button`
  - `t-space`
- 验收点：
  - `text` / `select` / `date-range` / `status` 四类字段可用
  - `search` / `reset` 事件语义不变
  - 表单内联布局不影响当前工作区排版

### 5. Form / Detail

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyForm.vue`
- 当前 Arco 依赖：
  - `Form`
  - `FormItem`
  - `Input`
  - `InputNumber`
  - `Select`
  - `Option`
  - `DatePicker`
  - `Switch`
  - `Button`
  - `Space`
- 迁移目标：
  - `t-form`
  - `t-form-item`
  - `t-input`
  - `t-input-number`
  - `t-select`
  - `t-option`
  - `t-date-picker`
  - `t-switch`
  - `t-button`
  - `t-space`
- 风险点：
  - `v-model` 值类型、日期格式和 switch 布尔值默认语义可能不同
  - 只读态格式化不可被组件库替代逻辑破坏
- 验收点：
  - `text` / `textarea` / `number` / `switch` / `select` / `date` / `datetime` 全部可用
  - create / edit / readonly detail 三种模式不回归

### 6. CRUD Workspace

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyCrudWorkspace.vue`
- 当前 Arco 依赖：
  - `Card`
  - `Button`
  - `Empty`
  - `Space`
- 迁移目标：
  - `t-card`
  - `t-button`
  - `t-empty`
  - `t-space`
- 验收点：
  - toolbar、empty、table host 三个区域不回归
  - `itemCountLabel` 和 empty 文案仍可由外部传入

### 7. Preview Skeleton

- 当前文件：`packages/ui-enterprise-vue/src/components/ElyPreviewSkeleton.vue`
- 当前 Arco 依赖：
  - `Card`
  - `Descriptions`
  - `DescriptionsItem`
  - `List`
  - `ListItem`
  - `Timeline`
  - `TimelineItem`
  - `Button`
  - `Space`
  - `Tag`
- 迁移目标：
  - `t-card`
  - `t-descriptions`
  - `t-list`
  - `t-timeline`
  - `t-button`
  - `t-space`
  - `t-tag`
- 验收点：
  - 演示页仍能说明预设 contract
  - 文案从 `Arco` 改为 `TDesign`，但不误写成“已经完成切换”

## 非组件清单

### 构建与依赖

- `packages/ui-enterprise-vue/package.json`
  - 移除 `@arco-design/web-vue`
  - 引入 `tdesign-vue-next`
- `apps/example-vue/vite.config.ts`
  - `vendor-arco` 切片需替换为等价 `TDesign` vendor chunk

### 元数据与文案

- `packages/ui-enterprise-vue/src/index.ts`
  - `description`
  - `vueEnterprisePresetFoundation.designSystem`
  - `selectionDate`
- `apps/example-vue/src/App.vue`
  - `Arco-backed customer operations`
  - `preset-label="Arco Design Vue"`
- `packages/ui-enterprise-vue/src/components/ElyPreviewSkeleton.vue`
  - `Arco shell`
  - foundation lock 文案

### 样式与 token

- 清理 Arco 专属 import：
  - `@arco-design/web-vue/dist/arco.css`
- 清理 Arco 专属色值/类名：
  - `arcoblue`
  - `.arco-table-tr`

## 实施前核对项（已归档）

- 已确认 `ADR-0010` 状态是否从 `proposed` 转为 `accepted`
- 已确认当前 `Phase 6B` runbook 收尾完成，不与发布基线并行
- 已确认 `ui-core` 无需改协议
- 已确认回滚方案与基线分支

## 实施后最小验收清单

- `bun run typecheck`
- `bun run test`
- `bun run build:vue`
- `apps/example-vue` 手工验证通过：
  - 登录后壳层展示正常
  - customer 查询、创建、编辑、详情、删除不回归
  - 导航、表格、表单、空态、标签展示正常
