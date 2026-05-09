# Generator Persistence Schema 模板生成 实施方案

**Goal:** 为生成器新增 Persistence Schema 模板，从 ModuleSchema 直接产出 Drizzle pgTable 定义文件，消除开发者手动编写 ORM 表定义的最大重复工作。

**Architecture:** 新增 `renderPersistenceSchemaTemplate` 函数，复用已有的 `buildDatabaseChangePlan` 列映射逻辑，生成完整的 Drizzle schema 文件（import、pgEnum、pgTable、类型导出）。在 `planModuleFiles` 中追加到文件计划，在 `renderTemplateForPath` 中路由渲染。不改动 `migration-proposal.ts` 的运行时提案逻辑。

**Tech Stack:** TypeScript, Bun test, Drizzle ORM, 现有 packages/generator + packages/schema

---

## Track 1: 持久化 Schema 模板

### Task 1: 新增 renderPersistenceSchemaTemplate

**Files:**
- Modify: `packages/generator/src/templates.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 写失败测试**

```typescript
// packages/generator/src/index.test.ts 新增
it("renders persistence schema template with pgTable", () => {
  const schema: ModuleSchema = {
    name: "supplier",
    label: "Supplier",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
      { key: "status", label: "Status", kind: "enum", required: true, options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ] },
      { key: "sort", label: "Sort", kind: "number" },
      { key: "enabled", label: "Enabled", kind: "boolean" },
      { key: "metadata", label: "Metadata", kind: "json" },
      { key: "createdAt", label: "Created At", kind: "datetime" },
    ],
  }
  const result = renderPersistenceSchemaTemplate(schema)

  // import 语句
  expect(result).toContain('import type { InferInsertModel, InferSelectModel } from "drizzle-orm"')
  expect(result).toContain('from "drizzle-orm/pg-core"')

  // pgEnum for enum field
  expect(result).toContain('pgEnum("supplier_status"')
  expect(result).toContain('"active"')
  expect(result).toContain('"inactive"')

  // pgTable
  expect(result).toContain('pgTable("suppliers"')
  expect(result).toContain('uuid("id").defaultRandom().primaryKey()')
  expect(result).toContain('text("name").notNull()')
  expect(result).toContain('integer("sort")')
  expect(result).toContain('boolean("enabled")')
  expect(result).toContain('jsonb("metadata")')
  expect(result).toContain('timestamp("created_at", { withTimezone: true })')

  // 类型导出
  expect(result).toContain("export type SupplierRow = InferSelectModel")
  expect(result).toContain("export type NewSupplierRow = InferInsertModel")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/index.test.ts`
Expected: FAIL — renderPersistenceSchemaTemplate not found

**Step 3: 实现 renderPersistenceSchemaTemplate**

在 `packages/generator/src/templates.ts` 中新增：

```typescript
import { buildDatabaseChangePlan } from "./database-change-plan"

export const renderPersistenceSchemaTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const snakeName = toSnakeCase(schema.name)
  const tableConstName = `${schema.name}s` // e.g. "suppliers"
  const rowTypeName = `${pascalName}Row`
  const newRowTypeName = `New${pascalName}Row`

  const plan = buildDatabaseChangePlan(schema)
  const tablePlan = plan.operations[0]
  if (!tablePlan) {
    throw new Error(`No table plan for schema: ${schema.name}`)
  }

  // 收集需要的 import
  const requiredImports = new Set(["pgTable"])
  const hasEnum = tablePlan.columns.some(
    (col) => col.sourceFieldKind === "enum" && col.enumOptions.length > 0,
  )
  if (hasEnum) requiredImports.add("pgEnum")

  for (const column of tablePlan.columns) {
    switch (column.sqlType) {
      case "uuid": requiredImports.add("uuid"); break
      case "integer": requiredImports.add("integer"); break
      case "boolean": requiredImports.add("boolean"); break
      case "jsonb": requiredImports.add("jsonb"); break
      case "timestamptz": requiredImports.add("timestamp"); break
      default: requiredImports.add("text"); break
    }
  }

  // 生成 pgEnum 定义
  const enumLines: string[] = []
  for (const column of tablePlan.columns) {
    if (column.sourceFieldKind === "enum" && column.enumOptions.length > 0) {
      const enumName = `${schema.name}_${column.sourceFieldKey}`
      const options = column.enumOptions.map((opt) => `"${opt}"`).join(", ")
      enumLines.push(
        `export const ${column.sourceFieldKey}Enum = pgEnum("${enumName}", [${options}])`,
      )
      requiredImports.add("pgEnum")
    }
  }

  // 生成列定义
  const columnLines = tablePlan.columns.map((column) => {
    const base = getDrizzleColumnBase(column)
    const modifiers: string[] = []

    if (column.primaryKey) modifiers.push(".primaryKey()")
    if (column.required && !column.primaryKey) modifiers.push(".notNull()")
    if (column.defaultExpression === "gen_random_uuid()") modifiers.push(".defaultRandom()")

    return `  ${column.sourceFieldKey}: ${base}${modifiers.join("")},`
  })

  // 组装文件
  const lines: string[] = []
  lines.push(
    `import type { InferInsertModel, InferSelectModel } from "drizzle-orm"`,
  )
  lines.push(
    `import { ${[...requiredImports].sort().join(", ")} } from "drizzle-orm/pg-core"`,
  )
  lines.push("")
  lines.push(...enumLines)
  if (enumLines.length > 0) lines.push("")
  lines.push(`export const ${tableConstName} = pgTable(`)
  lines.push(`  "${tableConstName}",`)
  lines.push("  {")
  lines.push(...columnLines)
  lines.push("  },")
  lines.push(")")
  lines.push("")
  lines.push(
    `export type ${rowTypeName} = InferSelectModel<typeof ${tableConstName}>`,
  )
  lines.push(
    `export type ${newRowTypeName} = InferInsertModel<typeof ${tableConstName}>`,
  )

  return lines.join("\n")
}

const getDrizzleColumnBase = (column: DatabaseColumnPlan): string => {
  switch (column.sqlType) {
    case "uuid":
      return `uuid("${column.name}")`
    case "integer":
      return `integer("${column.name}")`
    case "boolean":
      return `boolean("${column.name}")`
    case "jsonb":
      return `jsonb("${column.name}")`
    case "timestamptz":
      return `timestamp("${column.name}", { withTimezone: true })`
    default:
      // text 类型覆盖 string 和 text kind
      if (column.sourceFieldKind === "enum" && column.enumOptions.length > 0) {
        return `${column.sourceFieldKey}Enum("${column.name}")`
      }
      return `text("${column.name}")`
  }
}
```

注意：需要 import `DatabaseColumnPlan` 类型从 `database-change-plan.ts`。如果该类型未导出，需要导出。

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/templates.ts packages/generator/src/index.test.ts
git commit -m "feat(generator): add renderPersistenceSchemaTemplate for Drizzle schema generation"
```

---

### Task 2: 处理 dictionaryTypeCode 枚举字段

**Files:**
- Modify: `packages/generator/src/templates.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 写测试**

```typescript
it("renders dictionary enum field as text without pgEnum", () => {
  const schema: ModuleSchema = {
    name: "product",
    label: "Product",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
      { key: "type", label: "Type", kind: "enum", dictionaryTypeCode: "product_type" },
    ],
  }
  const result = renderPersistenceSchemaTemplate(schema)

  // dictionaryTypeCode 字段不生成 pgEnum，用 text 列
  expect(result).not.toContain("pgEnum")
  expect(result).toContain('text("type")')
})

it("renders text field kind as text column", () => {
  const schema: ModuleSchema = {
    name: "article",
    label: "Article",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "title", label: "Title", kind: "string", required: true },
      { key: "body", label: "Body", kind: "text" },
    ],
  }
  const result = renderPersistenceSchemaTemplate(schema)

  expect(result).toContain('text("body")')
  expect(result).toContain('text("title").notNull()')
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/index.test.ts`
Expected: FAIL — dictionaryTypeCode field generates pgEnum but should be text

**Step 3: 修改 getDrizzleColumnBase**

在 `getDrizzleColumnBase` 的 default 分支中，检查 `dictionaryTypeCode`，如果有则使用 `text`：

```typescript
default:
  if (
    column.sourceFieldKind === "enum" &&
    column.dictionaryTypeCode
  ) {
    return `text("${column.name}")`
  }
  if (column.sourceFieldKind === "enum" && column.enumOptions.length > 0) {
    return `${column.sourceFieldKey}Enum("${column.name}")`
  }
  return `text("${column.name}")`
```

同时在 pgEnum 生成逻辑中跳过有 `dictionaryTypeCode` 的字段：

```typescript
if (
  column.sourceFieldKind === "enum" &&
  column.enumOptions.length > 0 &&
  !column.dictionaryTypeCode
) {
  // generate pgEnum
}
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/templates.ts packages/generator/src/index.test.ts
git commit -m "fix(generator): handle dictionaryTypeCode and text fields in persistence template"
```

---

## Track 2: 文件计划扩展

### Task 3: 将 persistence schema 加入文件计划

**Files:**
- Modify: `packages/generator/src/core.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 写失败测试**

```typescript
it("includes persistence schema in file plan", () => {
  const schema: ModuleSchema = {
    name: "supplier",
    label: "Supplier",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
    ],
  }
  const plans = planModuleFiles(schema)
  const persistenceFile = plans.find((p) =>
    p.path.endsWith(".persistence.ts"),
  )
  expect(persistenceFile).toBeDefined()
  expect(persistenceFile!.path).toContain("supplier")
})

it("renders persistence schema file contents", () => {
  const schema: ModuleSchema = {
    name: "supplier",
    label: "Supplier",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
    ],
  }
  const files = renderModuleFiles(schema, { frontendTarget: "vue" })
  const persistenceFile = files.find((f) =>
    f.path.endsWith(".persistence.ts"),
  )
  expect(persistenceFile).toBeDefined()
  expect(persistenceFile!.contents).toContain("pgTable")
  expect(persistenceFile!.contents).toContain("Suppliers")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/index.test.ts`
Expected: FAIL — persistence file not in plan

**Step 3: 修改 planModuleFiles 和 renderTemplateForPath**

在 `planModuleFiles` 的 `baseFiles` 数组中，追加 persistence schema 文件：

```typescript
const baseFiles: GeneratedFilePlan[] = [
  // ... 现有文件
  {
    path: `${basePath}/${schema.name}.persistence.ts`,
    reason: "Drizzle ORM schema definition with pgTable, pgEnum, and type exports",
    mergeStrategy: DEFAULT_MERGE_STRATEGY,
  },
]
```

在 `renderTemplateForPath` 中新增路由：

```typescript
if (path.endsWith(".persistence.ts")) {
  return renderPersistenceSchemaTemplate(schema)
}
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/core.ts packages/generator/src/index.test.ts
git commit -m "feat(generator): include persistence schema in generated file plan"
```

---

## Track 3: 集成到 module target

### Task 4: module target 下的 persistence schema 集成指引

**Files:**
- Modify: `packages/generator/src/cli.ts`

**Step 1: 更新 module target 集成清单**

在 CLI 的 module target 集成清单中，更新步骤说明：

```typescript
if (options.targetPreset === "module") {
  console.log("")
  console.log("=== Integration Checklist ===")
  console.log(`1. Copy ${schema.name}.persistence.ts to packages/persistence/src/schema/${schema.name}.ts`)
  console.log(`2. Add re-export in packages/persistence/src/schema/index.ts`)
  console.log(`3. Run: bun run db:generate && bun run db:migrate`)
  console.log(`4. Implement repository methods in apps/server/src/modules/${schema.name}/${schema.name}.module.ts`)
  console.log(`5. Wire routes in the register() function`)
  console.log(`6. Register module in apps/server/src/modules/compose-business.ts (or compose-system.ts)`)
  console.log(`7. Register frontend workspace in apps/example-vue/src/modules/`)
  console.log("")
  console.log("See docs/plans/2026-05-09-generator-module-apply-path-plan.md for details.")
}
```

**Step 2: 运行测试**

Run: `bun test packages/generator/src/`
Expected: PASS

**Step 3: 提交**

```bash
git add packages/generator/src/cli.ts
git commit -m "feat(generator): update module target checklist with persistence schema step"
```

---

## Track 4: DatabaseColumnPlan 类型导出

### Task 5: 确保 DatabaseColumnPlan 类型可被 templates.ts 引用

**Files:**
- Modify: `packages/generator/src/database-change-plan.ts`

**Step 1: 检查并导出类型**

如果 `DatabaseColumnPlan` 接口未被导出，添加 export：

```typescript
export interface DatabaseColumnPlan {
  // ... 现有定义
}
```

**Step 2: 运行测试**

Run: `bun test packages/generator/src/`
Expected: PASS

**Step 3: 提交**

```bash
git add packages/generator/src/database-change-plan.ts
git commit -m "refactor(generator): export DatabaseColumnPlan type for template usage"
```

---

## Track 5: 端到端验证

### Task 6: E2E 冒烟——persistence schema 生成验证

**Files:**
- Create: `scripts/e2e-generator-persistence-schema-smoke.ts`

**Step 1: 编写冒烟脚本**

验证以下场景：
1. 标准 CRUD schema 生成包含 persistence.ts 文件
2. persistence.ts 包含完整的 Drizzle import、pgTable、类型导出
3. enum 字段生成 pgEnum
4. dictionaryTypeCode 枚举字段生成 text 列（不生成 pgEnum）
5. json 字段映射为 jsonb
6. text 字段映射为 text
7. 生成的列名使用 snake_case

**Step 2: 运行验证**

Run: `bun run scripts/e2e-generator-persistence-schema-smoke.ts`
Expected: PASS

**Step 3: 提交**

```bash
git add scripts/e2e-generator-persistence-schema-smoke.ts
git commit -m "test(generator): add E2E smoke for persistence schema generation"
```

---

## 任务依赖关系

```
Task 5 (类型导出) — 独立
  -> Task 1 (renderPersistenceSchemaTemplate)

Task 1 (persistence 模板) — 依赖 Task 5
  -> Task 2 (dictionary + text 处理)
  -> Task 3 (文件计划)

Task 2 (dictionary 处理) — 依赖 Task 1
  -> Task 3

Task 3 (文件计划) — 依赖 Task 1, 2
  -> Task 4 (CLI 清单)
  -> Task 6 (E2E)

Task 4 (CLI 清单) — 依赖 Task 3
  -> Task 6

Task 6 (E2E) — 依赖 Task 4
```

**推荐执行顺序：** Task 5 -> Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 6
