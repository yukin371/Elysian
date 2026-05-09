# Generator Surface Template / 页面骨架入模 实施方案

`REQUIRED SUB-SKILL: Use superpowers:executing-plans`

**Goal:** 把 generator Studio 从“可用但靠解释理解”的起稿页，收口为“公共模板 + 页面骨架 + 结果处理”三段稳定语义；正式把页面骨架纳入生成输入，避免后续继续把页面样式、详情布局和工作区结构写死在手工页面里。

**Architecture:** 保持 owner 不变。`packages/schema` 负责补充可序列化的模板元数据契约；`packages/generator` 负责消费该契约并把页面骨架落到生成模板与 artifact；`apps/example-vue` 只负责 Studio 起稿 UI、preview 呈现与示例消费，不拥有第二套模板真相。`克隆现有模块` 继续保留，但降级为辅助起稿入口，不再作为长期 canonical template source。

**Tech Stack:** TypeScript, Vue 3, TDesign Vue Next, `packages/schema`, `packages/generator`, `apps/example-vue`

---

## Boundary Summary

- 目标模块：`packages/schema`、`packages/generator`、`apps/example-vue/src/components/workspaces/generator`
- 现有 owner：
  - 起稿页面与用户操作路径：`apps/example-vue`
  - 生成输入契约：`packages/schema`
  - 模板、文件计划、前端 artifact：`packages/generator`
- 影响面：
  - generator Studio 起稿首屏
  - preview session `sourceType` / 模板元信息展示
  - 未来标准 CRUD 页面骨架生成入口
- 计划改动：
  - 为公共模板建立二层结构：`领域模板` + `页面骨架模板`
  - 把 `页面骨架` 正式进入 schema / generator 契约
  - Studio 首屏改成高密度、非卡片堆叠的起稿工作台
  - `克隆现有模块` 收成辅助参考，而不是主入口
- 验证方式：
  - `bun test packages/schema/src/index.test.ts packages/schema/src/simplify.test.ts`
  - `bun test packages/generator/src/index.test.ts packages/generator/src/preview.test.ts`
  - `bun test apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`
  - `bun test apps/example-vue/src/workspaces/use-generator-preview-workspace.*.test.ts`
  - `bun run build:vue`
- 需要同步的文档：
  - 本计划文档
  - 若最终契约稳定，再同步 `packages/schema/MODULE.md` / `packages/generator/MODULE.md`

---

## Track 1: 起稿语义收口

### Task 1: 固定“起稿方式”与 session sourceType 的边界

**Goal:** 明确用户在首屏看到的是“怎么开始一次新的生成”，不是“有哪些技术输入模式”；同时让前端文案、session sourceType 和模板元数据保持一一对应。

**Files:**
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.ts`
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`
- Modify: `apps/example-vue/src/i18n/zh-CN.workflow.ts`
- Modify: `apps/example-vue/src/i18n/en-US.workflow.ts`

**Implementation Notes:**
- 保留当前 runtime `sourceType`，但把页面语义固定为：
  - `公共模板`
  - `参考现有模块`
  - `高级 JSON`
- `registered-schema` 只对应“参考现有模块”。
- `manual-schema-json` 允许由“公共模板”填充后继续编辑，也允许直接进入“高级 JSON”。
- 页面上不再把内部术语 `registered-schema`、`manual-schema-json`、`session` 暴露为首屏主文案。

**Validation:**
- `bun test apps/example-vue/src/workspaces/use-generator-preview-workspace.*.test.ts`
- `bun run build:vue`

---

## Track 2: 公共模板二层化

### Task 2: 为公共模板建立“领域模板 + 页面骨架模板”契约

**Goal:** 让当前只有字段结构的公共模板，升级为能表达“这个模块通常长什么页面骨架”的正式输入。

**Files:**
- Modify: `packages/schema/src/index.ts`
- Modify: `packages/schema/src/simplify.ts`
- Modify: `packages/schema/src/index.test.ts`
- Modify: `packages/schema/src/simplify.test.ts`

**Implementation Notes:**
- 在 `ModuleSchema` 或其 frontend 元数据附近增加最小模板契约，优先使用现有 `frontend` 入口，不新开平行 owner。
- 建议最小化新增：
  - `surfaceTemplate`: 领域模板标识，例如 `standard-ledger`、`status-ledger`、`dictionary-ledger`
  - `workspaceSkeleton`: 页面骨架标识，例如 `standard-list-dialog`、`standard-list-panel`、`tree-list-detail`
- `expandSimplifiedSchema` 允许在 simplified 输入中接受上述字段，并补稳定默认值。
- 若 schema 未显式指定 `workspaceSkeleton`，先给出可预测默认值，而不是在 UI 里临时猜。

**Validation:**
- `bun test packages/schema/src/index.test.ts packages/schema/src/simplify.test.ts`

---

## Track 3: generator 模板消费新契约

### Task 3: 让 generator 文件计划与前端 artifact 消费页面骨架模板

**Goal:** 不再让前端 surface 只根据模块名或少量 override 猜页面结构，而是显式消费 `workspaceSkeleton`。

**Files:**
- Modify: `packages/generator/src/core.ts`
- Modify: `packages/generator/src/templates.ts`
- Modify: `packages/generator/src/vue-enterprise-crud-templates.ts`
- Modify: `packages/generator/src/index.ts`
- Modify: `packages/generator/src/index.test.ts`
- Modify: `packages/generator/src/preview.test.ts`

**Implementation Notes:**
- `planModuleFiles()` 与前端 artifact 输出应带出 `surfaceTemplate` / `workspaceSkeleton` 元信息。
- `renderFrontendArtifactTemplate()` 应把骨架类型作为 artifact 的稳定字段，不再只停留在 `surfaceKind`。
- `renderVueEnterpriseMainTemplate()` / `renderVueEnterprisePanelTemplate()` 应优先按 `workspaceSkeleton` 分流，再按个别模块 override 收口。
- 不新增第二套“页面模板注册真相”；模板真相继续收在 generator owner。

**Validation:**
- `bun test packages/generator/src/index.test.ts packages/generator/src/preview.test.ts`

---

## Track 4: Studio 起稿页重排

### Task 4: 把起稿首屏收口为高密度工作台，而不是卡片堆叠

**Goal:** 首屏默认只回答三件事：用什么模板起稿、生成什么模块、如何处理已有文件。用户不需要下拉就能完成完整配置。

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`
- Modify: `apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.ts`
- Modify: `apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`
- Modify: `apps/example-vue/src/i18n/zh-CN.workflow.ts`
- Modify: `apps/example-vue/src/i18n/en-US.workflow.ts`

**Implementation Notes:**
- 首屏主区固定为：
  - `新建生成`
  - `当前结果 / 最近结果`
  - `生成结果`
- `新建生成` 内部改为表格式或分区式骨架，不再使用多层卡片包裹卡片。
- 公共模板展示改成“模板行 + 骨架行”的二维选择，而不是只列字段模板。
- `参考现有模块` 收为辅助区：
  - 默认展示搜索框和受控候选集
  - 不再与公共模板等权占满首屏
- `高级 JSON` 只作为展开区，不抢占首屏主视觉。

**File Size Constraint:**
- `GeneratorPreviewWorkspaceMain.vue` 已明显超出可审查体量。
- 本任务允许在同 owner 内受控拆分为：
  - `GeneratorPreviewWorkspaceDraftStartPanel.vue`
  - `GeneratorPreviewWorkspaceCurrentResultPanel.vue`
  - `GeneratorPreviewWorkspaceResultListSection.vue`
- 不得借拆分新增跨模块 shared helper 桶文件。

**Validation:**
- `bun test apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`
- `bun run build:vue`

---

## Track 5: preview / recent result / apply 语义防漂移

### Task 5: 稳定“新建生成 / 当前结果 / 生成结果”三段页面语义

**Goal:** 避免用户再次回到“先看结果，再猜怎么重新开始”的混乱流。

**Files:**
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.ts`
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspacePanel.vue`
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceSummaryPanel.vue`
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.refresh.test.ts`
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.restore.test.ts`
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.steps.test.ts`

**Implementation Notes:**
- `当前结果` 语义优先于“最近 session 列表”。
- 重新发起生成时，顶部起稿区始终可用，不依赖用户先清空或退出当前结果。
- `审核通过 / 拒绝 / 应用到 staging` 只跟着结果区走，不再和起稿配置混排解释。
- 若存在 current session 与 recent sessions，同一事实只出现一次，避免摘要和详情重复。

**Validation:**
- `bun test apps/example-vue/src/workspaces/use-generator-preview-workspace.*.test.ts`
- `bun run build:vue`

---

## Track 6: 模板边界与自举能力校验

### Task 6: 增补模板体系与页面骨架的最小回归

**Goal:** 保证“公共模板 + 页面骨架”不是只在 UI 可选，而是真正进入 generator 自举闭环。

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`
- Modify: `packages/schema/src/index.test.ts`
- Modify: `packages/generator/src/index.test.ts`
- Modify: `packages/generator/src/preview.test.ts`

**Implementation Notes:**
- 至少覆盖：
  - 公共模板能产出合法 simplified schema
  - 页面骨架模板能稳定映射到 schema/frontend 契约
  - generator artifact 能带出骨架信息
  - preview/report 不因新增模板元数据而失配
- 若需要新增测试样例，优先复用既有 `customer` / `supplier` / `post` 等 schema，不新造不必要 fixture owner。

**Validation:**
- `bun test packages/schema/src/index.test.ts packages/schema/src/simplify.test.ts`
- `bun test packages/generator/src/index.test.ts packages/generator/src/preview.test.ts`
- `bun test apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`

---

## Track 7: 文档与命名同步

### Task 7: 收口模块文档与页面命名

**Goal:** 避免实现已经改成“模板 + 骨架”，文档还停留在“registered/manual 两路输入”的旧表述。

**Files:**
- Modify: `packages/schema/MODULE.md`
- Modify: `packages/generator/MODULE.md`
- Modify: `apps/example-vue/PAGE_DESIGN.md`

**Implementation Notes:**
- 只有在 Task 2-6 的契约落稳后再更新长期文档。
- `PAGE_DESIGN.md` 只同步长期有效的页面语义，不写实现细节。
- 若最终没有改变长期边界，则本 Task 可跳过，不为“文档完整”硬写不稳定事实。

**Validation:**
- 人工审阅 owner、术语与页面语义是否一致

---

## 任务依赖关系

```text
Task 1 起稿语义收口
  -> Task 4 Studio 起稿页重排
  -> Task 5 preview / recent result 语义防漂移

Task 2 公共模板二层化
  -> Task 3 generator 消费新契约
  -> Task 4 Studio 起稿页重排
  -> Task 6 模板回归

Task 3 generator 消费新契约
  -> Task 6 模板回归
  -> Task 7 文档同步

Task 4 Studio 起稿页重排
  -> Task 5

Task 5 preview / recent result 语义防漂移
  -> Task 7

Task 6 模板回归
  -> Task 7
```

## 推荐执行顺序

`Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 5 -> Task 6 -> Task 7`

## Checkpoints

- Checkpoint A: `Task 1-2` 完成后，确认起稿语义和模板契约已稳定，再继续 generator 消费层。
- Checkpoint B: `Task 3-4` 完成后，确认 Studio 首屏已能直觉起稿，再继续结果区语义整理。
- Checkpoint C: `Task 5-6` 完成后，确认 preview / apply 闭环未漂移，再决定是否同步长期文档。
