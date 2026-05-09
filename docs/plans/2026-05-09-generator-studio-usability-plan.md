# Generator Studio 交互体验打磨 实施方案

**Goal:** 把 Studio 手动 schema 编辑器接入简化格式、增加实时校验反馈和模板快速填充，让用户在浏览器中也能享受 CLI 侧已完成的可用性提升。

**Architecture:** 三个独立轨道：手动编辑器接入简化 schema + 实时校验（apps/example-vue workspace）、schema 模板快速填充（前端组件）、以及后端 validate-only 端点。不改 packages/schema 或 packages/generator 的 owner 边界，只做接线。

**Tech Stack:** Vue 3, TypeScript, TDesign Vue Next, 现有 packages/schema (expandSimplifiedSchema / validateModuleSchema / formatValidationIssues)

---

## Track 1: 手动编辑器接入简化 schema + 实时校验

### Task 1: 在 workspace 中导入 expandSimplifiedSchema 和 formatValidationIssues

**Files:**
- Modify: `apps/example-vue/src/lib/generator-preview-browser.ts`
- Modify: `apps/example-vue/src/workspaces/use-generator-preview-workspace.ts`

**Step 1: 扩展 browser re-export**

```typescript
// apps/example-vue/src/lib/generator-preview-browser.ts
export {
  getRegisteredSchema,
  listRegisteredSchemas,
  listRegisteredSchemaNames,
  renderModuleFiles,
  renderModuleSqlPreview,
  type FrontendTarget,
  type ModuleSqlPreview,
  type RenderedModuleFile,
} from "@elysian/generator/browser"

export {
  expandSimplifiedSchema,
  formatValidationIssues,
} from "@elysian/schema"
```

**Step 2: 修改 manualSchemaDraftParsed 接入 expandSimplifiedSchema**

在 `apps/example-vue/src/workspaces/use-generator-preview-workspace.ts` 中，将 `manualSchemaDraftParsed` 的解析逻辑改为先尝试 `expandSimplifiedSchema`，再校验：

```typescript
import { expandSimplifiedSchema, formatValidationIssues } from "../lib/generator-preview-browser"

// 在 manualSchemaDraftParsed computed 中：
const manualSchemaDraftParsed = computed(() => {
  const raw = manualSchemaDraft.value.trim()

  if (raw.length === 0) {
    return {
      error: null as string | null,
      errorDetails: null as string | null,
      schema: null as NonNullable<ReturnType<typeof getRegisteredSchema>> | null,
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return {
      error: t("app.generatorPreview.input.manualSchemaDraftInvalidJson"),
      errorDetails: null as string | null,
      schema: null as NonNullable<ReturnType<typeof getRegisteredSchema>> | null,
    }
  }

  let expandedSchema: ReturnType<typeof getRegisteredSchema>
  try {
    expandedSchema = expandSimplifiedSchema(parsed)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      errorDetails: null as string | null,
      schema: null as NonNullable<ReturnType<typeof getRegisteredSchema>> | null,
    }
  }

  const issues = validateModuleSchema(expandedSchema)
  if (issues.length > 0) {
    return {
      error: t("app.generatorPreview.input.manualSchemaDraftInvalid", {
        value: issues[0]?.message ?? "",
      }),
      errorDetails: formatValidationIssues(issues),
      schema: null as NonNullable<ReturnType<typeof getRegisteredSchema>> | null,
    }
  }

  return {
    error: null as string | null,
    errorDetails: null as string | null,
    schema: expandedSchema as NonNullable<ReturnType<typeof getRegisteredSchema>>,
  }
})
```

**Step 3: 运行现有测试**

Run: `bun test apps/example-vue/src/workspaces/use-generator-preview-workspace.*.test.ts`
Expected: PASS（expandSimplifiedSchema 对完整 ModuleSchema 透传，现有行为不变）

**Step 4: 提交**

```bash
git add apps/example-vue/src/lib/generator-preview-browser.ts apps/example-vue/src/workspaces/use-generator-preview-workspace.ts
git commit -m "feat(example-vue): wire expandSimplifiedSchema into Studio manual schema editor"
```

---

### Task 2: 在 Main 组件中显示结构化校验详情

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`

**Step 1: 接收新的 errorDetails prop**

在 Main 组件的 props 中新增 `errorDetails`，在手动 schema 编辑器的错误区域下方展示结构化校验详情：

```vue
<!-- 在 manualSchemaDraftError 显示区域之后 -->
<t-textarea
  v-if="selectedInputMode === 'manual-schema-json'"
  v-model="manualSchemaDraftLocal"
  :placeholder="t('app.generatorPreview.input.manualSchemaDraftPlaceholder')"
  :autosize="{ minRows: 8, maxRows: 20 }"
/>
<div v-if="manualSchemaDraftError" class="schema-editor-error">
  <span class="error-summary">{{ manualSchemaDraftError }}</span>
  <pre v-if="errorDetails" class="error-details">{{ errorDetails }}</pre>
</div>
```

**Step 2: 添加 errorDetails 样式**

```css
.error-details {
  margin-top: 4px;
  padding: 8px;
  background: var(--td-bg-color-container-hover);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}
```

**Step 3: 运行构建验证**

Run: `bun run build:vue`
Expected: PASS

**Step 4: 提交**

```bash
git add apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue
git commit -m "feat(example-vue): show structured validation details in Studio schema editor"
```

---

## Track 2: Schema 模板快速填充

### Task 3: 定义模板数据源

**Files:**
- Create: `apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.ts`
- Create: `apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`

**Step 1: 写失败测试**

```typescript
// apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts
import { describe, expect, it } from "bun:test"
import {
  getSchemaTemplate,
  listSchemaTemplateIds,
} from "./generator-preview-schema-templates"

describe("schema templates", () => {
  it("lists available template ids", () => {
    const ids = listSchemaTemplateIds()
    expect(ids.length).toBeGreaterThanOrEqual(3)
    expect(ids).toContain("simple-crud")
    expect(ids).toContain("with-status")
    expect(ids).toContain("with-dictionary")
  })

  it("returns valid simplified schema for each template", () => {
    for (const id of listSchemaTemplateIds()) {
      const template = getSchemaTemplate(id)
      expect(template).toContain('"name"')
      expect(template).toContain('"fields"')
      expect(template).toContain('"kind"')
    }
  })

  it("simple-crud template has name and description fields", () => {
    const template = JSON.parse(getSchemaTemplate("simple-crud"))
    expect(template.fields.some((f: any) => f.key === "name")).toBe(true)
  })

  it("with-status template has enum status field", () => {
    const template = JSON.parse(getSchemaTemplate("with-status"))
    const statusField = template.fields.find((f: any) => f.key === "status")
    expect(statusField).toBeDefined()
    expect(statusField.kind).toBe("enum")
    expect(statusField.options.length).toBeGreaterThan(0)
  })

  it("with-dictionary template has dictionaryTypeCode", () => {
    const template = JSON.parse(getSchemaTemplate("with-dictionary"))
    const dictField = template.fields.find(
      (f: any) => f.dictionaryTypeCode !== undefined,
    )
    expect(dictField).toBeDefined()
  })
})
```

**Step 2: 运行测试确认失败**

Run: `bun test apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`
Expected: FAIL

**Step 3: 实现模板数据源**

```typescript
// apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.ts

interface SchemaTemplate {
  id: string
  label: string
  description: string
  schema: Record<string, unknown>
}

const templates: SchemaTemplate[] = [
  {
    id: "simple-crud",
    label: "Simple CRUD",
    description: "Basic CRUD with name, code and sort fields",
    schema: {
      name: "module_name",
      fields: [
        { key: "name", kind: "string", required: true, searchable: true },
        { key: "code", kind: "string", searchable: true },
        { key: "sort", kind: "number" },
        { key: "enabled", kind: "boolean" },
        { key: "createdAt", kind: "datetime" },
        { key: "updatedAt", kind: "datetime" },
      ],
    },
  },
  {
    id: "with-status",
    label: "CRUD with Status",
    description: "CRUD with enum status field",
    schema: {
      name: "module_name",
      fields: [
        { key: "name", kind: "string", required: true, searchable: true },
        { key: "code", kind: "string", searchable: true },
        {
          key: "status",
          kind: "enum",
          required: true,
          searchable: true,
          options: ["draft", "active", "archived"],
        },
        { key: "enabled", kind: "boolean" },
        { key: "createdAt", kind: "datetime" },
        { key: "updatedAt", kind: "datetime" },
      ],
    },
  },
  {
    id: "with-dictionary",
    label: "CRUD with Dictionary",
    description: "CRUD with dictionary-linked enum field",
    schema: {
      name: "module_name",
      fields: [
        { key: "name", kind: "string", required: true, searchable: true },
        {
          key: "type",
          kind: "enum",
          required: true,
          searchable: true,
          dictionaryTypeCode: "module_type",
        },
        { key: "sort", kind: "number" },
        { key: "enabled", kind: "boolean" },
        { key: "createdAt", kind: "datetime" },
        { key: "updatedAt", kind: "datetime" },
      ],
    },
  },
]

export function listSchemaTemplateIds(): string[] {
  return templates.map((t) => t.id)
}

export function listSchemaTemplates(): SchemaTemplate[] {
  return templates
}

export function getSchemaTemplate(id: string): string {
  const template = templates.find((t) => t.id === id)
  if (!template) {
    throw new Error(`Unknown schema template: ${id}`)
  }
  return JSON.stringify(template.schema, null, 2)
}
```

**Step 4: 运行测试确认通过**

Run: `bun test apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.ts apps/example-vue/src/components/workspaces/generator/generator-preview-schema-templates.test.ts
git commit -m "feat(example-vue): add schema template data source for Studio quick-fill"
```

---

### Task 4: 在 Main 组件中接入模板快速填充下拉

**Files:**
- Modify: `apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue`

**Step 1: 添加模板选择 UI**

在手动 schema 编辑区域上方，当 `selectedInputMode === "manual-schema-json"` 且 `manualSchemaDraft` 为空时，显示模板选择按钮：

```vue
<!-- 在 manual schema textarea 上方 -->
<div v-if="selectedInputMode === 'manual-schema-json' && !manualSchemaDraftLocal" class="schema-templates">
  <span class="template-label">{{ t('app.generatorPreview.input.templateLabel') }}</span>
  <t-button
    v-for="tpl in schemaTemplates"
    :key="tpl.id"
    variant="outline"
    size="small"
    @click="emit('load-template', tpl.id)"
  >
    {{ tpl.label }}
  </t-button>
</div>
```

**Step 2: 在 workspace composable 中处理模板加载**

在 `use-generator-preview-workspace.ts` 中新增：

```typescript
const loadSchemaTemplate = (templateId: string) => {
  const { getSchemaTemplate } = require("../components/workspaces/generator/generator-preview-schema-templates")
  manualSchemaDraft.value = getSchemaTemplate(templateId)
  selectedInputMode.value = "manual-schema-json"
}
```

并暴露给模板。同时 emit `load-template` 事件在 Main 组件中连接。

**Step 3: 运行构建验证**

Run: `bun run build:vue`
Expected: PASS

**Step 4: 提交**

```bash
git add apps/example-vue/src/components/workspaces/generator/GeneratorPreviewWorkspaceMain.vue apps/example-vue/src/workspaces/use-generator-preview-workspace.ts
git commit -m "feat(example-vue): add schema template quick-fill buttons to Studio editor"
```

---

## Track 3: 后端 validate-only 端点

### Task 5: 新增 POST /studio/generator/validate-schema 端点

**Files:**
- Modify: `apps/server/src/modules/generator-session/module.ts`
- Modify: `apps/server/src/modules/generator-session/openapi.ts`

**Step 1: 写失败测试**

在 `apps/server/src/modules/generator-session/module.lifecycle.test.ts` 中新增：

```typescript
it("validates a simplified schema and returns expanded result", async () => {
  const response = await app
    .handle(
      new Request("http://localhost/studio/generator/validate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: {
            name: "product",
            fields: [
              { key: "name", kind: "string", required: true },
              { key: "price", kind: "number" },
            ],
          },
        }),
      }),
    )

  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body.valid).toBe(true)
  expect(body.expandedSchema.name).toBe("product")
  expect(body.expandedSchema.label).toBe("Product")
  expect(body.expandedSchema.fields.length).toBe(3) // id + name + price
  expect(body.expandedSchema.frontend).toBeDefined()
})

it("returns validation issues for invalid schema", async () => {
  const response = await app
    .handle(
      new Request("http://localhost/studio/generator/validate-schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schema: {
            name: "",
            fields: [],
          },
        }),
      }),
    )

  expect(response.status).toBe(200)
  const body = await response.json()
  expect(body.valid).toBe(false)
  expect(body.issues.length).toBeGreaterThan(0)
  expect(body.formattedMessage).toBeDefined()
})
```

**Step 2: 运行测试确认失败**

Run: `bun test apps/server/src/modules/generator-session/module.lifecycle.test.ts`
Expected: FAIL on the new test cases

**Step 3: 实现 validate-schema 端点**

在 `createGeneratorSessionModule` 的 register 中新增路由：

```typescript
.post(
  "/studio/generator/validate-schema",
  async ({ body }) => {
    try {
      const expandedSchema = expandSimplifiedSchema(body.schema)
      const issues = validateModuleSchema(expandedSchema)

      if (issues.length > 0) {
        return {
          valid: false,
          issues,
          formattedMessage: formatValidationIssues(issues),
        }
      }

      return {
        valid: true,
        expandedSchema,
      }
    } catch (error) {
      return {
        valid: false,
        issues: [{
          path: "$",
          message: error instanceof Error ? error.message : String(error),
        }],
        formattedMessage: error instanceof Error ? error.message : String(error),
      }
    }
  },
  {
    body: t.Object({
      schema: t.Any(),
    }),
    response: {
      200: t.Object({
        valid: t.Boolean(),
        ...(t.Any() as any), // expandedSchema or issues/formattedMessage
      }),
    },
    detail: {
      tags: ["generator"],
      summary: "Validate and expand a schema (supports simplified format)",
    },
  },
)
```

**Step 4: 运行测试确认通过**

Run: `bun test apps/server/src/modules/generator-session/module.lifecycle.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add apps/server/src/modules/generator-session/module.ts apps/server/src/modules/generator-session/openapi.ts
git commit -m "feat(generator-session): add validate-schema endpoint for Studio live validation"
```

---

## Track 4: i18n 补齐 + E2E 验证

### Task 6: 补齐新增 UI 文案的 i18n key

**Files:**
- Modify: `apps/example-vue/src/locales/zh-CN.ts` (或对应 i18n 文件)
- Modify: `apps/example-vue/src/locales/en-US.ts` (如存在)

**Step 1: 添加以下 i18n key**

```typescript
"app.generatorPreview.input.templateLabel": "快速开始：",
"app.generatorPreview.input.manualSchemaDraftPlaceholder": "粘贴或输入 JSON schema（支持简化格式）",
"app.generatorPreview.input.manualSchemaDraftInvalid": "Schema 校验失败：{value}",
"app.generatorPreview.input.manualSchemaDraftInvalidJson": "JSON 格式无效，请检查语法",
```

**Step 2: 运行构建验证**

Run: `bun run build:vue`
Expected: PASS

**Step 3: 提交**

```bash
git add apps/example-vue/src/locales/
git commit -m "feat(example-vue): add i18n keys for Studio schema editor improvements"
```

---

### Task 7: E2E 验证——Studio 编辑器简化 schema 流程

**Files:**
- Create: `scripts/e2e-generator-studio-simplified-smoke.ts`

**Step 1: 编写冒烟脚本**

验证后端 validate-schema 端点：

1. 发送简化 schema → 返回 valid + expandedSchema
2. 发送完整 ModuleSchema → 返回 valid + 原样 expandedSchema
3. 发送无效 schema → 返回 valid=false + issues + formattedMessage
4. 发送无法 JSON.parse 的内容 → 返回 valid=false

**Step 2: 运行验证**

Run: `bun run scripts/e2e-generator-studio-simplified-smoke.ts`
Expected: PASS

**Step 3: 提交**

```bash
git add scripts/e2e-generator-studio-simplified-smoke.ts
git commit -m "test(generator-session): add E2E smoke for validate-schema endpoint"
```

---

## 任务依赖关系

```
Task 1 (workspace 接入 expandSimplifiedSchema)
  -> Task 2 (Main 组件 errorDetails 展示)
  -> Task 4 (模板快速填充 UI)

Task 3 (模板数据源) -- 独立
  -> Task 4

Task 5 (后端 validate-schema) -- 独立
  -> Task 7

Task 6 (i18n) -- 独立
  -> Task 4

Task 7 (E2E) -- 依赖 Task 5
```

**推荐执行顺序：** Task 3 -> Task 1 -> Task 5 -> Task 6 -> Task 2 -> Task 4 -> Task 7

其中 Task 3/5/6 可以并行。
