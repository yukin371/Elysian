# Generator Studio 步骤引导流 实施方案

**Goal:** 在 Studio 生成器工作区新增步骤引导指示器，根据会话状态自动高亮当前步骤，渐进式展示控制项，降低首次使用门槛。

**Architecture:** 新增一个 `currentStep` computed 属性映射到已有的会话状态机（null → pending_review → ready/unconfirmed → ready/confirmed → applied），创建 StepIndicator 组件渲染步骤条，在 Main 组件中按当前步骤控制区域可见性。不改变现有状态管理逻辑，只在 UI 层做渐进披露。

**Tech Stack:** Vue 3, TypeScript, TDesign Vue Next, 现有 workspace composable

---

## Track 1: 步骤状态计算

### Task 1: 新增 currentStep computed 和 step 导航逻辑

**Files:**
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.ts`

**Step 1: 定义步骤类型和计算**

在 workspace composable 中新增步骤类型和 `currentStep` computed：

```typescript
type GeneratorPreviewStep = "configure" | "review" | "confirm" | "apply" | "done"

const currentStep = computed<GeneratorPreviewStep>(() => {
  const session = currentSession.value

  if (!session || !currentReport.value) {
    return "configure"
  }

  if (session.status === "pending_review") {
    return "review"
  }

  if (session.status === "applied") {
    return "done"
  }

  if (session.status === "rejected") {
    return "review"
  }

  // session.status === "ready"
  if (session.confirmedAt !== null) {
    return "apply"
  }

  if (
    currentSqlProposalHandoff.value &&
    currentSqlProposalHandoff.value.proposalStatus === "ready"
  ) {
    return "confirm"
  }

  return "review"
})
```

同时在 return 对象中暴露 `currentStep`。

**Step 2: 验证**

Run: `bun test apps/example-vue/src/workspaces/use-generator-preview-workspace.*.test.ts`
Expected: PASS（现有测试不涉及 currentStep）

**Step 3: 提交**

```bash
git add apps/example-vue/src/workspaces/use-generator-preview-workspace.ts
git commit -m "feat(example-vue): add currentStep computed to generator workspace"
```

---

## Track 2: 步骤指示器组件

### Task 2: 创建 GeneratorPreviewWorkspaceStepIndicator 组件

**Files:**
- Create: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceStepIndicator.vue`

**Step 1: 实现步骤指示器**

组件接收 `currentStep` 和 `t` props，渲染水平步骤条：

```vue
<script setup lang="ts">
import type { GeneratorPreviewTranslation } from "./types"

type GeneratorPreviewStep = "configure" | "review" | "confirm" | "apply" | "done"

interface StepIndicatorProps {
  t: GeneratorPreviewTranslation
  currentStep: GeneratorPreviewStep
}

const props = defineProps<StepIndicatorProps>()

const steps = [
  { key: "configure", labelKey: "app.generatorPreview.flow.configure" },
  { key: "review", labelKey: "app.generatorPreview.flow.review" },
  { key: "confirm", labelKey: "app.generatorPreview.flow.confirm" },
  { key: "apply", labelKey: "app.generatorPreview.flow.apply" },
] as const

const stepOrder: Record<string, number> = {
  configure: 0,
  review: 1,
  confirm: 2,
  apply: 3,
  done: 4,
}

const isStepActive = (key: string) => key === props.currentStep
const isStepCompleted = (key: string) =>
  stepOrder[key] < stepOrder[props.currentStep]
</script>

<template>
  <nav class="generator-step-indicator" aria-label="Generator flow steps">
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      class="generator-step"
      :class="{
        'generator-step-active': isStepActive(step.key),
        'generator-step-completed': isStepCompleted(step.key),
      }"
    >
      <span class="generator-step-index">{{ index + 1 }}</span>
      <span class="generator-step-label">{{ t(step.labelKey) }}</span>
      <span v-if="index < steps.length - 1" class="generator-step-connector" />
    </div>
  </nav>
</template>

<style scoped>
.generator-step-indicator {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.75rem 0;
}

.generator-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.generator-step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  border: 2px solid rgba(15, 23, 42, 0.12);
  background: rgba(248, 250, 252, 0.85);
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 700;
}

.generator-step-active .generator-step-index {
  border-color: #2457d6;
  background: #2457d6;
  color: #fff;
}

.generator-step-completed .generator-step-index {
  border-color: #0d9f6e;
  background: #0d9f6e;
  color: #fff;
}

.generator-step-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
}

.generator-step-active .generator-step-label {
  color: #173ea6;
}

.generator-step-completed .generator-step-label {
  color: #047857;
}

.generator-step-connector {
  display: inline-block;
  width: 1.5rem;
  height: 2px;
  margin: 0 0.35rem;
  background: rgba(15, 23, 42, 0.08);
}
</style>
```

**Step 2: 提交**

```bash
git add apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceStepIndicator.vue
git commit -m "feat(example-vue): create step indicator component for generator workspace"
```

---

## Track 3: i18n 步骤标签

### Task 3: 更新 i18n 步骤标签

**Files:**
- Modify: `apps/example-vue/src/i18n/zh-CN.workflow.ts`
- Modify: `apps/example-vue/src/i18n/en-US.workflow.ts`

**Step 1: 更新中文 i18n**

替换已有的 `flow.*` 键并新增 `flow.configure`：

```typescript
// 替换现有的 flow.refresh 为 flow.configure
"app.generatorPreview.flow.configure": "配置 Schema",
"app.generatorPreview.flow.review": "审核差异",
"app.generatorPreview.flow.confirm": "确认清单",
"app.generatorPreview.flow.apply": "应用到 staging",
```

删除 `flow.refresh` 和 `flow.handoff`（不再作为步骤条显示）。

**Step 2: 更新英文 i18n**

同样更新：

```typescript
"app.generatorPreview.flow.configure": "Configure Schema",
"app.generatorPreview.flow.review": "Review Diff",
"app.generatorPreview.flow.confirm": "Confirm Checklist",
"app.generatorPreview.flow.apply": "Apply to Staging",
```

**Step 3: 检查现有引用**

确保没有其他代码引用已删除的 `flow.refresh` 和 `flow.handoff` 键。如果有，将其替换为新的键名或移除。

**Step 4: 提交**

```bash
git add apps/example-vue/src/i18n/zh-CN.workflow.ts apps/example-vue/src/i18n/en-US.workflow.ts
git commit -m "feat(example-vue): update step flow i18n keys for guided wizard"
```

---

## Track 4: Main 组件渐进披露

### Task 4: 在 Main 组件中集成步骤指示器和渐进披露

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`

**Step 1: 导入 StepIndicator 并添加 currentStep prop**

在 script setup 中：

```typescript
import GeneratorPreviewWorkspaceStepIndicator from "./GeneratorPreviewWorkspaceStepIndicator.vue"

// 新增 props
interface GeneratorPreviewWorkspaceMainProps {
  // ... 现有 props
  currentStep: "configure" | "review" | "confirm" | "apply" | "done"
}
```

**Step 2: 在 template 顶部添加步骤指示器**

```vue
<template>
  <section class="enterprise-card enterprise-main-card">
    <GeneratorPreviewWorkspaceStepIndicator
      :t="t"
      :current-step="currentStep"
    />
    <div class="enterprise-workspace-stack">
      <!-- existing content -->
    </div>
  </section>
</template>
```

**Step 3: 渐进式显示控制项**

根据 `currentStep` 控制区域可见性：

- **Step configure**: 显示输入区域（input mode、schema select、manual editor、options）+ 刷新按钮
- **Step review**: 显示文件列表 + diff 工具 + 审核按钮（approve/reject）
- **Step confirm**: 显示确认清单 + confirm 按钮
- **Step apply**: 显示 apply 按钮 + handoff 信息
- **Step done**: 显示完成状态

修改 template：

```vue
<!-- 输入配置区域：configure 步骤始终可见，其他步骤折叠 -->
<section
  class="panel-section generator-input-section"
  :class="{ 'generator-section-collapsed': currentStep !== 'configure' }"
>
  <!-- existing input controls -->
</section>
```

对于折叠的输入区域，只显示 schema 名和一行摘要，点击可展开：

```vue
<!-- 当不在 configure 步骤时，显示紧凑摘要 -->
<div
  v-if="currentStep !== 'configure'"
  class="generator-config-summary"
  @click="emit('go-to-step', 'configure')"
>
  <span>{{ selectedSchemaName }} / {{ selectedFrontendTarget }}</span>
  <span class="generator-config-summary-action">{{ t('app.generatorPreview.action.editConfig') }}</span>
</div>
```

**Step 4: 更新 workspace composable emit**

在 Main 组件的 emit 中新增：

```typescript
(e: "go-to-step", value: "configure" | "review" | "confirm" | "apply"): void
```

**Step 5: 添加折叠样式**

```css
.generator-section-collapsed {
  display: none;
}

.generator-config-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.85rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 8px;
  background: rgba(248, 250, 252, 0.6);
  cursor: pointer;
  font-size: 0.82rem;
  color: #475569;
}

.generator-config-summary:hover {
  background: rgba(248, 250, 252, 0.95);
}

.generator-config-summary-action {
  font-weight: 600;
  color: #2457d6;
}
```

**Step 6: 运行构建验证**

Run: `bun run build:vue`
Expected: PASS

**Step 7: 提交**

```bash
git add apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue
git commit -m "feat(example-vue): integrate step indicator and progressive disclosure in generator workspace"
```

---

## Track 5: 工作区接线

### Task 5: 在 workspace 挂载点传递 currentStep 和 go-to-step

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue` (确保 emit 已连接)
- 查找并修改挂载 useGeneratorPreviewWorkspace 的父组件

**Step 1: 找到 workspace composable 的消费方**

搜索 `useGeneratorPreviewWorkspace` 的调用点，确认它是如何将 props 传给 Main 组件的。

**Step 2: 在消费方中传递 currentStep**

将 `currentStep` 从 composable 的返回值传递给 Main 组件的 prop。

**Step 3: 实现 go-to-step 事件处理**

在消费方中处理 `go-to-step` 事件：
- `"configure"`: 调用 `resetPreviewState()` 回到配置步骤
- 其他步骤: 无操作（步骤由状态机驱动，不可手动跳转）

**Step 4: 运行构建验证**

Run: `bun run build:vue`
Expected: PASS

**Step 5: 提交**

```bash
git add apps/example-vue/src/components/workspaces/generator/
git commit -m "feat(example-vue): wire currentStep prop and go-to-step event in generator workspace"
```

---

## Track 6: i18n 补充 + 验证

### Task 6: 补充新增 UI 文案的 i18n key

**Files:**
- Modify: `apps/example-vue/src/i18n/zh-CN.workflow.ts`
- Modify: `apps/example-vue/src/i18n/en-US.workflow.ts`

**Step 1: 添加以下 i18n key**

```typescript
// zh-CN
"app.generatorPreview.action.editConfig": "修改配置",
"app.generatorPreview.flow.done": "已完成",

// en-US
"app.generatorPreview.action.editConfig": "Edit Config",
"app.generatorPreview.flow.done": "Done",
```

**Step 2: 运行构建验证**

Run: `bun run build:vue`
Expected: PASS

**Step 3: 提交**

```bash
git add apps/example-vue/src/i18n/zh-CN.workflow.ts apps/example-vue/src/i18n/en-US.workflow.ts
git commit -m "feat(example-vue): add i18n keys for step indicator and config summary"
```

---

### Task 7: E2E 冒烟——步骤引导流验证

**Files:**
- Create: `scripts/e2e-generator-studio-guided-flow-smoke.ts`

**Step 1: 编写冒烟脚本**

验证以下场景（通过直接调用 composable 逻辑或组件 mount）：

1. 初始状态：`currentStep === "configure"`
2. 执行 refreshPreview 成功后：`currentStep` 转为 `"review"` 或 `"confirm"`
3. Session 为 pending_review：`currentStep === "review"`
4. Session 为 ready + confirmedAt !== null：`currentStep === "apply"`
5. Session 为 applied：`currentStep === "done"`

如果 composable 无法在脚本环境中直接运行，改为验证 `currentStep` 计算逻辑的纯函数版本。

**Step 2: 运行验证**

Run: `bun run scripts/e2e-generator-studio-guided-flow-smoke.ts`
Expected: PASS

**Step 3: 提交**

```bash
git add scripts/e2e-generator-studio-guided-flow-smoke.ts
git commit -m "test(example-vue): add E2E smoke for generator guided flow step transitions"
```

---

## 任务依赖关系

```
Task 1 (currentStep computed) — 独立
  -> Task 4 (Main 集成)
  -> Task 5 (workspace 接线)

Task 2 (StepIndicator 组件) — 独立
  -> Task 4

Task 3 (i18n 步骤标签) — 独立
  -> Task 4

Task 4 (Main 渐进披露) — 依赖 Task 1, 2, 3
  -> Task 5

Task 5 (workspace 接线) — 依赖 Task 4
  -> Task 7

Task 6 (i18n 补充) — 独立，与 Task 3 可合并

Task 7 (E2E) — 依赖 Task 5
```

**推荐执行顺序：** Task 1 -> Task 2 -> Task 3 -> Task 6 -> Task 4 -> Task 5 -> Task 7

其中 Task 1/2/3/6 可以并行，Task 4 依赖前三者完成后执行。
