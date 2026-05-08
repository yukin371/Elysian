# 分栏工作台交互重设计 Implementation Plan

**Goal:** 将 example-vue 从弹窗+列表的后台模式，重设计为三栏分栏工作台模式，实现高密度、低操作链路的企业工作台。

**Architecture:** 在现有 `@elysian/ui-enterprise-vue` 包中新增 `ElyWorkbench` 组件族（WorkbenchShell、ContextPanel、WorkbenchToolbar），替代原有 ElyShell + Dialog 二级面板的模式。工作区组件保持现有 State 注入模式不变，只改变渲染容器。

**Tech Stack:** Vue 3.5 + TypeScript + TDesign Vue Next + Tailwind CSS

---

## Phase 1: 新增 Workbench 基础组件

在 `packages/ui-enterprise-vue/src/components/` 中新增三个核心组件，为分栏布局提供基础设施。

### Task 1: ElyContextPanel 组件

**Files:**
- Create: `packages/ui-enterprise-vue/src/components/ElyContextPanel.vue`
- Create: `packages/ui-enterprise-vue/src/components/ely-context-panel.ts` (工具函数)
- Modify: `packages/ui-enterprise-vue/src/contracts.ts` (新增类型)
- Modify: `packages/ui-enterprise-vue/src/index.ts` (导出新组件)

**Step 1: 在 contracts.ts 中新增 ContextPanel 类型**

在 `contracts.ts` 文件末尾添加：

```typescript
// --- Context Panel ---

export interface ElyContextPanelProps {
  visible: boolean
  title: string
  mode: 'detail' | 'edit' | 'create' | 'delete-confirm'
  width?: number
  loading?: boolean
  copy?: ElyContextPanelCopy
}

export interface ElyContextPanelCopy {
  closeLabel?: string
  editLabel?: string
  deleteLabel?: string
  saveLabel?: string
  cancelLabel?: string
  confirmDeleteLabel?: string
  cancelDeleteLabel?: string
  deleteWarning?: string
}

export interface ElyContextPanelEmits {
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'save'): void
  (e: 'cancel'): void
}
```

**Step 2: 创建 ElyContextPanel.vue**

创建一个右侧滑入面板组件：

- `visible=false` 时 `display: none`，不占空间
- `visible=true` 时从右侧滑入，宽度 360px（detail 模式）或 480px（edit/create 模式）
- 顶部标题栏 + 关闭按钮
- 内容区使用 `<slot>`
- detail 模式：底部显示编辑/删除按钮
- edit/create 模式：顶部显示保存/取消按钮
- delete-confirm 模式：显示红色危险区 + 确认/取消
- 过渡动画：`transform: translateX` + `transition: 0.2s ease`

模板结构：
```html
<div class="ely-context-panel" :class="{ 'ely-context-panel--visible': visible }"
     :style="{ width: panelWidth + 'px' }">
  <div class="ely-context-panel__header">
    <h3>{{ title }}</h3>
    <button @click="emit('close')">×</button>
  </div>
  <div class="ely-context-panel__body">
    <slot />
  </div>
  <div class="ely-context-panel__footer">
    <!-- 按模式渲染操作按钮 -->
  </div>
</div>
```

**Step 3: 在 index.ts 中导出**

```typescript
export { default as ElyContextPanel } from './components/ElyContextPanel.vue'
export type { ElyContextPanelProps, ElyContextPanelCopy } from './contracts'
```

**Step 4: 验证**

Run: `cd packages/ui-enterprise-vue && npx vue-tsc --noEmit`
Expected: 无类型错误

**Step 5: Commit**

```bash
git add packages/ui-enterprise-vue/src/components/ElyContextPanel.vue
git add packages/ui-enterprise-vue/src/contracts.ts
git add packages/ui-enterprise-vue/src/index.ts
git commit -m "feat(ui-enterprise): add ElyContextPanel component for split-panel workbench"
```

---

### Task 2: ElyWorkbenchToolbar 组件

**Files:**
- Create: `packages/ui-enterprise-vue/src/components/ElyWorkbenchToolbar.vue`
- Modify: `packages/ui-enterprise-vue/src/contracts.ts`
- Modify: `packages/ui-enterprise-vue/src/index.ts`

**Step 1: 在 contracts.ts 中新增 Toolbar 类型**

```typescript
// --- Workbench Toolbar ---

export interface ElyWorkbenchToolbarAction {
  key: string
  label: string
  tone?: 'primary' | 'secondary' | 'danger'
  icon?: string
  disabled?: boolean
}

export interface ElyWorkbenchToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  actions?: ElyWorkbenchToolbarAction[]
  moreActions?: ElyWorkbenchToolbarAction[]
  filters?: ElyQueryField[]
  filterValues?: ElyQueryValues
  loading?: boolean
}

export interface ElyWorkbenchToolbarEmits {
  (e: 'search', value: string): void
  (e: 'action', key: string): void
  (e: 'filter-change', values: ElyQueryValues): void
}
```

**Step 2: 创建 ElyWorkbenchToolbar.vue**

一行式工具条组件，取代独立查询区域：

- 左侧：主操作按钮（如"新增"，tone=primary）
- 中间：搜索输入框
- 右侧：筛选下拉 + 更多操作下拉
- 搜索框有 debounce（300ms）

模板结构：
```html
<div class="ely-workbench-toolbar">
  <div class="ely-workbench-toolbar__left">
    <slot name="actions">
      <t-button v-for="action in primaryActions" :key="action.key"
                :theme="action.tone === 'primary' ? 'primary' : 'default'"
                @click="emit('action', action.key)">
        {{ action.label }}
      </t-button>
    </slot>
  </div>
  <div class="ely-workbench-toolbar__center">
    <t-input :placeholder="searchPlaceholder" :value="searchValue"
             clearable @input="handleSearch" @clear="handleSearch('')">
      <template #prefix-icon><SearchIcon /></template>
    </t-input>
  </div>
  <div class="ely-workbench-toolbar__right">
    <t-dropdown v-if="filters?.length" :options="filterOptions" @click="handleFilter">
      <t-button variant="text">筛选</t-button>
    </t-dropdown>
    <t-dropdown v-if="moreActions?.length" :options="moreActionOptions" @click="handleMoreAction">
      <t-button variant="text">更多</t-button>
    </t-dropdown>
  </div>
</div>
```

**Step 3: 导出并验证**

同 Task 1 的导出和验证步骤。

**Step 4: Commit**

```bash
git commit -m "feat(ui-enterprise): add ElyWorkbenchToolbar for inline search and actions"
```

---

### Task 3: ElyWorkbenchShell 组件

**Files:**
- Create: `packages/ui-enterprise-vue/src/components/ElyWorkbenchShell.vue`
- Modify: `packages/ui-enterprise-vue/src/contracts.ts`
- Modify: `packages/ui-enterprise-vue/src/index.ts`

**Step 1: 在 contracts.ts 中新增 WorkbenchShell 类型**

```typescript
// --- Workbench Shell ---

export interface ElyWorkbenchShellProps {
  navigation: UiNavigationNode[]
  selectedMenuKey?: string | null
  tabs?: ElyShellTab[]
  selectedTabKey?: string | null
  user?: ElyShellUserSummary | null
  searchPlaceholder?: string
  contextPanelVisible?: boolean
  contextPanelTitle?: string
  contextPanelMode?: 'detail' | 'edit' | 'create' | 'delete-confirm'
  statusBar?: ElyWorkbenchStatusBar
  copy?: ElyWorkbenchShellCopy
}

export interface ElyWorkbenchStatusBar {
  moduleStatus?: { label: string; tone: 'success' | 'warning' | 'error' | 'default' }
  recordCount?: number
  selectedInfo?: string
}

export interface ElyWorkbenchShellCopy {
  navigationLabel?: string
  searchPlaceholder?: string
  closePanelLabel?: string
}

export interface ElyWorkbenchShellEmits {
  (e: 'menu-select', key: string): void
  (e: 'tab-select', key: string): void
  (e: 'global-search', query: string): void
  (e: 'panel-close'): void
  (e: 'user-click'): void
}
```

**Step 2: 创建 ElyWorkbenchShell.vue**

三栏布局组件：

- 左侧栏（200px，可折叠）：导航树 + 收藏/最近
- 主工作区（flex-1）：`workspace` slot
- 右侧上下文面板（条件渲染）：`context` slot，默认隐藏
- 顶栏：全局搜索 + 面包屑 + 用户
- 底部状态栏：模块状态 + 记录数 + 选中信息

布局用 CSS Grid 实现：

```css
.ely-workbench {
  display: grid;
  grid-template-rows: 48px 1fr 28px;
  grid-template-columns: v-bind(sidebarWidth) 1fr v-bind(panelWidth);
  grid-template-areas:
    "header header header"
    "sidebar workspace context"
    "status status status";
  height: 100vh;
}

.ely-workbench--no-panel {
  grid-template-columns: v-bind(sidebarWidth) 1fr;
}
```

**Step 3: 导出并验证**

**Step 4: Commit**

```bash
git commit -m "feat(ui-enterprise): add ElyWorkbenchShell three-column layout component"
```

---

### Task 4: 更新样式文件

**Files:**
- Modify: `packages/ui-enterprise-vue/src/styles/workspace-base.css`

**Step 1: 新增 Workbench 相关 CSS 类**

```css
/* --- Workbench Shell --- */
.ely-workbench { /* grid layout */ }
.ely-workbench__header { /* top bar */ }
.ely-workbench__sidebar { /* sidebar */ }
.ely-workbench__workspace { /* main area */ }
.ely-workbench__context { /* right panel */ }
.ely-workbench__status { /* bottom bar */ }

/* --- Context Panel --- */
.ely-context-panel { /* slide-in panel */ }
.ely-context-panel--visible { /* when shown */ }
.ely-context-panel__header { /* title bar */ }
.ely-context-panel__body { /* scrollable content */ }
.ely-context-panel__footer { /* action bar */ }
.ely-context-panel__danger-zone { /* delete confirm area */ }

/* --- Workbench Toolbar --- */
.ely-workbench-toolbar { /* inline toolbar */ }
.ely-workbench-toolbar__left { /* action buttons */ }
.ely-workbench-toolbar__center { /* search input */ }
.ely-workbench-toolbar__right { /* filters and more */ }

/* --- Section Groups in Panel --- */
.ely-section-group { /* collapsible section */ }
.ely-section-group__title { /* section heading */ }
.ely-section-group__body { /* section content */ }
.ely-section-group--collapsed .ely-section-group__body { display: none; }
```

**Step 2: Commit**

```bash
git commit -m "feat(ui-enterprise): add workbench CSS layout classes"
```

---

## Phase 2: Shell 层重构

将 AdminShellLayout 从 ElyShell + Dialog 模式切换为 ElyWorkbenchShell + ContextPanel 模式。

### Task 5: 重构 AdminShellLayout

**Files:**
- Modify: `apps/example-vue/src/components/layout/AdminShellLayout.vue`

**Step 1: 替换模板**

将 ElyShell + TDialog 的组合替换为 ElyWorkbenchShell：

```html
<ElyWorkbenchShell
  :navigation="navigation"
  :selected-menu-key="currentMenuKey"
  :tabs="tabs"
  :selected-tab-key="currentTabKey"
  :user="user"
  :context-panel-visible="hasSelection"
  :context-panel-title="panelTitle"
  :context-panel-mode="panelMode"
  :status-bar="statusBar"
  @menu-select="handleMenuSelect"
  @tab-select="handleTabSelect"
  @global-search="handleGlobalSearch"
  @panel-close="handlePanelClose"
>
  <template #workspace>
    <ShellWorkspaceMainSwitch v-bind="mainSwitchProps" />
  </template>
  <template #context>
    <ShellWorkspaceSecondarySwitch v-bind="secondarySwitchProps" />
  </template>
</ElyWorkbenchShell>
```

**Step 2: 移除 Dialog 逻辑**

删除原有的 TDialog 及其事件包装逻辑（基于字符串匹配的 open/close），改为直接通过 panel visible 状态控制。

**Step 3: 验证**

Run: `cd apps/example-vue && npx vue-tsc --noEmit`

**Step 4: Commit**

```bash
git commit -m "refactor(example-vue): replace ElyShell+Dialog with ElyWorkbenchShell"
```

---

### Task 6: 重构 ShellWorkspaceMainSwitch 事件

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/shell/ShellWorkspaceMainSwitch.vue`

**Step 1: 移除 row-click 事件的 Dialog 联动**

当前 row-click 事件会触发 Dialog 打开。改为只更新选中状态（用于 ContextPanel 显示）：

```typescript
// 之前: emit('row-click', row) → AdminShellLayout 监听后打开 Dialog
// 之后: 只更新 selectedRow 状态，ContextPanel 自动响应
const handleRowClick = (row: Record<string, unknown>) => {
  selectedRow.value = row
  panelMode.value = 'detail'
}
```

**Step 2: 验证类型正确**

**Step 3: Commit**

```bash
git commit -m "refactor(example-vue): simplify ShellWorkspaceMainSwitch row-click handling"
```

---

## Phase 3: 标准 CRUD 工作区迁移

将所有标准 CRUD 页面从 ElyCrudWorkspace 迁移到新的 ElyWorkbenchToolbar + ContextPanel 模式。

### Task 7: 创建标准 CRUD 工作区模板组件

**Files:**
- Create: `packages/ui-enterprise-vue/src/components/ElyCrudWorkbench.vue`

**Step 1: 创建 ElyCrudWorkbench 组件**

这是一个整合了 Toolbar + Table + ContextPanel 的完整 CRUD 工作区组件，替代 ElyCrudWorkspace：

Props 复用 ElyCrudWorkspace 的所有 props，新增：
- `selectedRow?: Record<string, unknown> | null`
- `panelMode?: 'detail' | 'edit' | 'create' | 'delete-confirm'`
- `panelLoading?: boolean`

模板结构：
```html
<div class="ely-crud-workbench">
  <ElyWorkbenchToolbar
    :search-placeholder="searchPlaceholder"
    :actions="toolbarActions"
    :more-actions="moreActions"
    @search="handleSearch"
    @action="handleAction"
  />
  <ElyTable
    :columns="tableColumns"
    :items="items"
    :loading="tableLoading"
    :actions="tableActions"
    @action="handleAction"
    @row-click="handleRowClick"
  />
</div>
```

**Step 2: 导出并验证**

**Step 3: Commit**

```bash
git commit -m "feat(ui-enterprise): add ElyCrudWorkbench combining toolbar, table, and context panel"
```

---

### Task 8: 迁移 Customer 工作区

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/customer/CustomerWorkspaceMain.vue`
- Modify: `apps/example-vue/src/components/workspaces/customer/CustomerWorkspacePanel.vue`
- Modify: `apps/example-vue/src/components/workspaces/customer/customer-workspace-state.ts`

**Step 1: 重写 CustomerWorkspaceMain.vue**

- 移除所有 warning message 块（移到底部状态栏）
- 移除自定义分页（使用标准分页）
- 将 ElyCrudWorkspace 替换为 ElyCrudWorkbench
- 行内操作改为 `⋯` 菜单
- 添加行选中高亮样式

**Step 2: 重写 CustomerWorkspacePanel.vue**

- 从独立的卡片式面板改为 ContextPanel 内的内容
- 移除重复的权限检查块
- 移除独立的删除确认区域（改用 panelMode='delete-confirm'）
- 表单直接在 ContextPanel 内渲染，不再包裹额外卡片

**Step 3: 更新 state 类型**

新增 `panelMode` 和 `selectedRow` 状态字段。

**Step 4: 验证**

Run: `cd apps/example-vue && npx vue-tsc --noEmit`

**Step 5: Commit**

```bash
git commit -m "refactor(example-vue): migrate customer workspace to split-panel workbench"
```

---

### Task 9: 迁移 Department 工作区

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/department/DepartmentWorkspaceMain.vue`
- Modify: `apps/example-vue/src/components/workspaces/department/DepartmentWorkspacePanel.vue`
- Modify: `apps/example-vue/src/components/workspaces/department/department-workspace-state.ts`

**Step 1: 重写 DepartmentWorkspaceMain.vue**

与 Task 8 相同模式，额外处理树形结构：
- 主区改为左树右表
- 左侧树占 240px
- 右侧展示选中节点的子项列表

**Step 2: 重写 DepartmentWorkspacePanel.vue**

同 Task 8 Panel 改造模式。

**Step 3: 验证并 Commit**

```bash
git commit -m "refactor(example-vue): migrate department workspace to split-panel workbench with tree layout"
```

---

### Task 10: 批量迁移其余 CRUD 工作区

**Files:**
- 修改所有剩余工作区的 Main.vue 和 Panel.vue：
  - `workspaces/user/`
  - `workspaces/role/`
  - `workspaces/menu/`（树形，同 department 模式）
  - `workspaces/dictionary/`
  - `workspaces/post/`
  - `workspaces/setting/`
  - `workspaces/notification/`
  - `workspaces/tenant/`
  - `workspaces/auth-session/`
  - `workspaces/operation-log/`

每个工作区遵循 Task 8 的相同模式。按模块逐个迁移，每个模块一个 commit。

**Step N: 批量 Commit**

每个模块一个 commit：
```bash
git commit -m "refactor(example-vue): migrate <module> workspace to split-panel workbench"
```

---

## Phase 4: 特殊工作区迁移

### Task 11: 重构生成预览工作区

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`
- Modify 相关 generator 子组件

**Step 1: 重写为四块布局**

将 699 行的 GeneratorPreviewWorkspaceMain.vue 拆分为：
- 左栏 40%：配置面板 + 会话状态
- 右栏 60%：文件列表 + 文件详情

使用 CSS Grid 实现四块布局：
```css
.generator-workbench {
  display: grid;
  grid-template-columns: 40% 60%;
  grid-template-rows: auto 1fr;
  gap: 16px;
  height: 100%;
}
```

**Step 2: 简化交互流程**

- 删除所有说明文本
- 删除步骤条
- "刷新 → 审核 → 应用" 作为唯一主节奏
- 会话状态只出现一次
- 文件操作在文件详情面板内

**Step 3: 验证并 Commit**

```bash
git commit -m "refactor(example-vue): redesign generator preview to four-block layout"
```

---

### Task 12: 重构文件管理页

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/file/FileWorkspaceMain.vue`
- Modify: `apps/example-vue/src/components/workspaces/file/FileWorkspacePanel.vue`

**Step 1: 增加拖拽上传**

- 工具条的"新增"按钮改为"上传"按钮，主色强调
- 主区支持拖拽上传（dragover/drop 事件）
- 拖拽时显示上传提示覆盖层

**Step 2: ContextPanel 改造**

- 文件预览在 ContextPanel 中完成
- 图片文件显示缩略图
- 文本/代码文件显示高亮预览

**Step 3: Commit**

```bash
git commit -m "refactor(example-vue): migrate file workspace with drag-drop upload and preview panel"
```

---

## Phase 5: 全局功能

### Task 13: 全局快捷键

**Files:**
- Create: `apps/example-vue/src/composables/use-workbench-shortcuts.ts`
- Modify: `apps/example-vue/src/components/layout/AdminShellLayout.vue`

**Step 1: 创建 useWorkbenchShortcuts composable**

```typescript
export function useWorkbenchShortcuts(options: {
  onSearch: () => void
  onClosePanel: () => void
  onNavigateUp: () => void
  onNavigateDown: () => void
  onEdit: () => void
  onCreate: () => void
  onDelete: () => void
}) {
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === '/' && !isInputFocused()) {
      e.preventDefault()
      options.onSearch()
    }
    if (e.key === 'Escape') options.onClosePanel()
    if (e.key === 'ArrowUp' && e.altKey) options.onNavigateUp()
    if (e.key === 'ArrowDown' && e.altKey) options.onNavigateDown()
    if (e.key === 'Enter' && e.altKey) options.onEdit()
    if (e.key === 'n' && !isInputFocused()) options.onCreate()
    if (e.key === 'Delete' && !isInputFocused()) options.onDelete()
  }

  onMounted(() => document.addEventListener('keydown', handleKeydown))
  onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
}
```

**Step 2: 在 AdminShellLayout 中接入**

**Step 3: Commit**

```bash
git commit -m "feat(example-vue): add global keyboard shortcuts for workbench navigation"
```

---

### Task 14: 全局搜索

**Files:**
- Create: `apps/example-vue/src/composables/use-global-search.ts`
- Modify: `packages/ui-enterprise-vue/src/components/ElyWorkbenchShell.vue`

**Step 1: 创建全局搜索 composable**

- 聚焦搜索框时展示搜索下拉
- 输入关键词后跨模块搜索
- 搜索结果按模块分组展示
- 点击结果直接跳转到对应工作区并选中记录

**Step 2: 在 WorkbenchShell 顶栏集成**

**Step 3: Commit**

```bash
git commit -m "feat(example-vue): add global cross-module search in workbench header"
```

---

### Task 15: 底部状态栏

**Files:**
- Modify: `packages/ui-enterprise-vue/src/components/ElyWorkbenchShell.vue`

**Step 1: 实现 status bar 区域**

28px 高度的底部薄条：
- 左侧：模块状态（色点 + 文字，如 "● 在线"）
- 中间：记录总数（如 "共 156 条"）
- 右侧：选中信息（如 "已选中: 张三"）

**Step 2: 从工作区移除 warning message 块**

将所有工作区顶部的 warning/info message 改为更新 statusBar 状态。

**Step 3: Commit**

```bash
git commit -m "feat(ui-enterprise): implement status bar in workbench shell"
```

---

## Phase 6: 清理与验证

### Task 16: 移除废弃代码

**Files:**
- 检查并移除所有不再使用的 ElyCrudWorkspace 引用
- 检查并移除 AdminShellLayout 中的 Dialog 相关逻辑
- 检查并清理 workspace-base.css 中不再使用的样式类
- 更新 index.ts 导出（保留 ElyCrudWorkspace 向后兼容但标记 deprecated）

**Step 1: 搜索所有 ElyCrudWorkspace 引用**

Run: `grep -r "ElyCrudWorkspace" apps/example-vue/src/`

**Step 2: 逐一替换或移除**

**Step 3: Commit**

```bash
git commit -m "chore(example-vue): remove deprecated ElyCrudWorkspace references"
```

---

### Task 17: 全量类型检查与测试

**Step 1: 运行完整类型检查**

Run: `cd packages/ui-enterprise-vue && npx vue-tsc --noEmit`
Run: `cd apps/example-vue && npx vue-tsc --noEmit`

**Step 2: 运行现有测试**

Run: `cd packages/ui-enterprise-vue && npm test`

**Step 3: 修复所有错误**

**Step 4: Commit**

```bash
git commit -m "chore: fix type errors after workbench redesign"
```

---

## 依赖关系

```
Task 1 (ElyContextPanel) ─────┐
Task 2 (ElyWorkbenchToolbar) ──┼── Task 3 (ElyWorkbenchShell) ── Task 4 (CSS) ── Task 5 (AdminShellLayout)
Task 7 (ElyCrudWorkbench) ─────┘                                    │
                                                                     ├── Task 6 (MainSwitch)
                                                                     │
Phase 3 (CRUD迁移) 依赖 Phase 1 + Phase 2 全部完成
  Task 8 (Customer) ── Task 9 (Department) ── Task 10 (批量迁移)
Phase 4 (特殊工作区) 依赖 Phase 3
  Task 11 (Generator) ── Task 12 (File)
Phase 5 (全局功能) 依赖 Phase 2
  Task 13 (快捷键) ── Task 14 (搜索) ── Task 15 (状态栏)
Phase 6 (清理) 依赖所有 Phase 完成
  Task 16 ── Task 17
```

## 预计工作量

| Phase | Tasks | 预计耗时 |
|-------|-------|----------|
| Phase 1: 基础组件 | 4 | 2-3h |
| Phase 2: Shell 重构 | 2 | 1-2h |
| Phase 3: CRUD 迁移 | 3 | 3-4h |
| Phase 4: 特殊工作区 | 2 | 2-3h |
| Phase 5: 全局功能 | 3 | 2-3h |
| Phase 6: 清理验证 | 2 | 1h |
| **总计** | **17** | **11-16h** |
