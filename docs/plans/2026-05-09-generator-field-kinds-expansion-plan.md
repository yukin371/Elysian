# Generator 字段类型扩展：text + json 实施方案

**Goal:** 为 ModuleSchema 新增 `text`（长文本）和 `json`（JSON 数据）两种字段类型，让生成器能覆盖需要富文本描述和结构化数据的真实业务模块。

**Architecture:** 从 schema 定义层到数据库映射、TypeScript 类型、前端表单组件的全链路扩展。新增类型不影响已有 6 种 kind 的任何行为。

**Tech Stack:** TypeScript, Bun test, PostgreSQL (jsonb), TDesign Vue Next (Textarea)

---

## Track 1: Schema 层

### Task 1: 在 moduleFieldKinds 中新增 text 和 json

**Files:**
- Modify: `packages/schema/src/index.ts`
- Test: `packages/schema/src/index.test.ts`

**Step 1: 写失败测试**

```typescript
// 在 packages/schema/src/index.test.ts 中新增
it("accepts text field kind", () => {
  const issues = validateModuleSchema({
    name: "article",
    label: "Article",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "content", label: "Content", kind: "text" },
    ],
  })
  expect(issues).toEqual([])
})

it("accepts json field kind", () => {
  const issues = validateModuleSchema({
    name: "config",
    label: "Config",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "payload", label: "Payload", kind: "json" },
    ],
  })
  expect(issues).toEqual([])
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/schema/src/index.test.ts`
Expected: FAIL — "text" and "json" not in moduleFieldKinds

**Step 3: 修改 moduleFieldKinds**

在 `packages/schema/src/index.ts` 中：

```typescript
// 原来是
moduleFieldKinds = [
  "id",
  "string",
  "number",
  "boolean",
  "enum",
  "datetime",
] as const

// 改为
moduleFieldKinds = [
  "id",
  "string",
  "text",
  "number",
  "boolean",
  "enum",
  "json",
  "datetime",
] as const
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/schema/src/index.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/schema/src/index.ts packages/schema/src/index.test.ts
git commit -m "feat(schema): add text and json field kinds"
```

---

### Task 2: 在 simplify 和 format-validation 中处理新类型

**Files:**
- Modify: `packages/schema/src/simplify.ts`
- Modify: `packages/schema/src/simplify.test.ts`
- Modify: `packages/schema/src/format-validation.ts`
- Modify: `packages/schema/src/format-validation.test.ts`

**Step 1: 写失败测试**

```typescript
// packages/schema/src/simplify.test.ts 新增
it("expands schema with text and json fields", () => {
  const result = expandSimplifiedSchema({
    name: "article",
    fields: [
      { key: "title", kind: "string", required: true },
      { key: "body", kind: "text" },
      { key: "metadata", kind: "json" },
    ],
  })

  expect(result.fields.find((f) => f.key === "body")?.kind).toBe("text")
  expect(result.fields.find((f) => f.key === "metadata")?.kind).toBe("json")
})
```

```typescript
// packages/schema/src/format-validation.test.ts 新增
it("includes text and json in supported kinds suggestion", () => {
  const result = formatValidationIssues([
    {
      path: "fields[0].kind",
      message: "Field kind must be one of: id, string, text, number, boolean, enum, json, datetime.",
    },
  ])
  expect(result).toContain("text")
  expect(result).toContain("json")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/schema/src/simplify.test.ts packages/schema/src/format-validation.test.ts`

**Step 3: 修改代码**

simplify.ts 不需要改（kind 作为字符串透传）。format-validation.ts 的 `getIssueSuggestion` 如果有 hardcode kind 列表的地方需要更新。

**Step 4: 运行测试确认通过**

**Step 5: 提交**

```bash
git add packages/schema/src/simplify.test.ts packages/schema/src/format-validation.ts packages/schema/src/format-validation.test.ts
git commit -m "test(schema): cover text and json in simplify and validation tests"
```

---

## Track 2: Generator 模板适配

### Task 3: 更新 getFieldTypeAnnotation 处理 text 和 json

**Files:**
- Modify: `packages/generator/src/templates.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 写失败测试**

```typescript
// 在 packages/generator/src/index.test.ts 中新增
it("renders text field as string type in record", () => {
  const schema: ModuleSchema = {
    name: "article",
    label: "Article",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "title", label: "Title", kind: "string", required: true },
      { key: "body", label: "Body", kind: "text" },
    ],
  }
  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const schemaFile = files.find((f) => f.contents.includes("interface Article"))
  expect(schemaFile).toBeDefined()
  expect(schemaFile!.contents).toContain("body: string")
})

it("renders json field as Record type in record", () => {
  const schema: ModuleSchema = {
    name: "config",
    label: "Config",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "payload", label: "Payload", kind: "json" },
    ],
  }
  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const schemaFile = files.find((f) => f.contents.includes("interface Config"))
  expect(schemaFile).toBeDefined()
  expect(schemaFile!.contents).toContain("payload: Record<string, unknown>")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/index.test.ts`
Expected: FAIL — "text" and "json" fall through to `string` in switch, json should be `Record<string, unknown>`

**Step 3: 修改 getFieldTypeAnnotation**

```typescript
// packages/generator/src/templates.ts
getFieldTypeAnnotation = (schema: ModuleSchema, field: ModuleField) => {
  switch (field.kind) {
    case "boolean":
      return "boolean"
    case "number":
      return "number"
    case "enum":
      return getEnumTypeName(schema, field)
    case "json":
      return "Record<string, unknown>"
    default:
      return "string"
  }
}
```

注意：`text` 落入 `default` 返回 `string`，行为正确。

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/templates.ts packages/generator/src/index.test.ts
git commit -m "feat(generator): handle text and json in TypeScript type rendering"
```

---

### Task 4: 更新 service 模板——text 字段不做 trim

**Files:**
- Modify: `packages/generator/src/templates.ts`

**Step 1: 修改 textLikeFields 过滤条件**

当前 `renderServiceTemplate` 中 `textLikeFields` 只包含 `string` 和 `id`。`text` 字段不应该做 `.trim()`（富文本内容 trim 会破坏格式）。

当前代码：
```typescript
const textLikeFields = inputFields.filter(
  (field) => field.kind === "string" || field.kind === "id",
)
```

无需修改。`text` 不在过滤条件中，所以不会做 trim。验证现有行为即可。

**Step 2: 写测试确认 text 字段不做 trim**

```typescript
it("does not trim text fields in service template", () => {
  const schema: ModuleSchema = {
    name: "article",
    label: "Article",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "title", label: "Title", kind: "string", required: true },
      { key: "body", label: "Body", kind: "text" },
    ],
  }
  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const serviceFile = files.find((f) => f.contents.includes("createArticleService"))
  expect(serviceFile).toBeDefined()
  // title (string) gets trim
  expect(serviceFile!.contents).toContain("titleValue.trim()")
  // body (text) does NOT get trim — it passes through as-is
  expect(serviceFile!.contents).toContain("body: input.body")
})
```

**Step 3: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 4: 提交**

```bash
git add packages/generator/src/index.test.ts
git commit -m "test(generator): verify text fields bypass trim in service template"
```

---

## Track 3: 数据库映射适配

### Task 5: 更新 DatabaseColumnSqlType 和 getSqlType

**Files:**
- Modify: `packages/generator/src/database-change-plan.ts`
- Test: `packages/generator/src/database-change-plan.test.ts`

**Step 1: 写失败测试**

```typescript
// packages/generator/src/database-change-plan.test.ts 新增
it("maps text kind to text sql type", () => {
  const plan = buildDatabaseChangePlan({
    name: "article",
    label: "Article",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "body", label: "Body", kind: "text" },
    ],
  })
  const bodyColumn = plan.tables[0].columns.find((c) => c.name === "body")
  expect(bodyColumn).toBeDefined()
  expect(bodyColumn!.sqlType).toBe("text")
})

it("maps json kind to jsonb sql type", () => {
  const plan = buildDatabaseChangePlan({
    name: "config",
    label: "Config",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "payload", label: "Payload", kind: "json" },
    ],
  })
  const payloadColumn = plan.tables[0].columns.find((c) => c.name === "payload")
  expect(payloadColumn).toBeDefined()
  expect(payloadColumn!.sqlType).toBe("jsonb")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/database-change-plan.test.ts`
Expected: FAIL — "jsonb" not in DatabaseColumnSqlType

**Step 3: 修改代码**

```typescript
// packages/generator/src/database-change-plan.ts

// 扩展类型
export type DatabaseColumnSqlType =
  | "boolean"
  | "integer"
  | "jsonb"
  | "text"
  | "timestamptz"
  | "uuid"

// 修改 getSqlType
const getSqlType = (field: ModuleField): DatabaseColumnSqlType => {
  switch (field.kind) {
    case "id":
      return "uuid"
    case "number":
      return "integer"
    case "boolean":
      return "boolean"
    case "json":
      return "jsonb"
    case "datetime":
      return "timestamptz"
    default:
      return "text"
  }
}
```

注意：`text` 和 `string` 都落入 `default` 返回 `"text"`，行为正确（PostgreSQL 的 `text` 本身就是变长字符串）。

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/database-change-plan.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/database-change-plan.ts packages/generator/src/database-change-plan.test.ts
git commit -m "feat(generator): add jsonb sql type mapping for json field kind"
```

---

## Track 4: 前端模板适配

### Task 6: 前端表单中 text 渲染为 textarea，json 渲染为 JSON textarea

**Files:**
- Modify: `packages/generator/src/vue-enterprise-crud-template-shared.ts`
- Modify: `packages/generator/src/vue-enterprise-crud-templates.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 更新 renderFieldDefaultValue**

```typescript
// packages/generator/src/vue-enterprise-crud-template-shared.ts
export const renderFieldDefaultValue = (field: ModuleField): string => {
  if (field.kind === "boolean") return "false"
  if (field.kind === "number") return "0"
  if (field.kind === "json") return "null"
  if (field.kind === "enum") {
    const firstOption = field.options?.[0]
    if (firstOption) {
      return JSON.stringify(firstOption.value)
    }
  }
  if (field.kind === "datetime") return '""'
  return '""'
}
```

**Step 2: 写测试确认 text 和 json 在生成的前端代码中表现正确**

```typescript
it("renders text field default as empty string", () => {
  const schema: ModuleSchema = {
    name: "article",
    label: "Article",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "body", label: "Body", kind: "text" },
    ],
  }
  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const mainFile = files.find((f) => f.contents.includes("body"))
  expect(mainFile).toBeDefined()
  // text field should appear in form but rendered as string type
  expect(mainFile!.contents).toContain("body")
})

it("renders json field default as null", () => {
  const schema: ModuleSchema = {
    name: "config",
    label: "Config",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "payload", label: "Payload", kind: "json" },
    ],
  }
  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const mainFile = files.find((f) => f.contents.includes("payload"))
  expect(mainFile).toBeDefined()
})
```

**Step 3: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 4: 提交**

```bash
git add packages/generator/src/vue-enterprise-crud-template-shared.ts packages/generator/src/index.test.ts
git commit -m "feat(generator): handle text and json in frontend form defaults"
```

---

## Track 5: 端到端验证

### Task 7: 新增含 text/json 字段的生成器 E2E 验证

**Files:**
- Create: `scripts/e2e-generator-field-kinds-smoke.ts`

**Step 1: 编写冒烟脚本**

验证以下场景：
1. 定义含 text + json 字段的 simplified schema
2. 调用 expandSimplifiedSchema 展开
3. 调用 renderModuleFiles 生成
4. 验证生成的 schema 文件包含 `Record<string, unknown>` 类型
5. 验证 database-change-plan 包含 `jsonb` 列
6. 验证生成的 service 不对 text 字段做 trim

**Step 2: 运行验证**

Run: `bun run scripts/e2e-generator-field-kinds-smoke.ts`
Expected: PASS

**Step 3: 提交**

```bash
git add scripts/e2e-generator-field-kinds-smoke.ts
git commit -m "test(generator): add E2E smoke for text and json field kinds"
```

---

### Task 8: 更新 README 和 --init 模板

**Files:**
- Modify: `README.md`
- Modify: `packages/generator/src/init.ts`

**Step 1: 更新 --init 模板增加 text 和 json 示例**

```typescript
// packages/generator/src/init.ts — 在 scaffold.fields 中添加注释行
// { key: "description", kind: "text" },
// { key: "metadata", kind: "json" },
```

**Step 2: 更新 README 字段类型表**

在生成器特性或快速开始章节中列出完整字段类型：
`id, string, text, number, boolean, enum, json, datetime`

**Step 3: 提交**

```bash
git add README.md packages/generator/src/init.ts
git commit -m "docs: document text and json field kinds"
```

---

## 任务依赖关系

```
Task 1 (moduleFieldKinds 扩展)
  -> Task 2 (simplify + format-validation 适配)
  -> Task 3 (getFieldTypeAnnotation)
  -> Task 4 (service trim 验证)
  -> Task 5 (database sql type)
  -> Task 6 (前端模板)
  -> Task 7 (E2E)
  -> Task 8 (文档)
```

**推荐执行顺序：** Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 5 -> Task 6 -> Task 7 -> Task 8

所有任务严格顺序执行，因为每一步都依赖上一步的类型定义。
