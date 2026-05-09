# Generator 可用性打磨 实施方案

**Goal:** 把 generator 从"能用"推进到"好用"——简化 Schema 输入、改善 CLI 体验、增强校验可读性。

**Architecture:** 三个独立轨道并行推进：Schema 输入简化层（packages/schema）、CLI/校验体验（packages/generator）、以及 `--init` 脚手架命令。不改 owner 边界，不新增 shared 包。

**Tech Stack:** TypeScript, Bun test, Elysia, 现有 packages/schema + packages/generator

---

## Track 1: Schema 输入简化

目标：用户不需要写完整 ModuleSchema，写一个最小 JSON 就能生成。

### Task 1: 定义 SimplifiedModuleSchema 类型与转换器

**Files:**
- Create: `packages/schema/src/simplify.ts`
- Test: `packages/schema/src/simplify.test.ts`

**Step 1: 写失败测试**

```typescript
// packages/schema/src/simplify.test.ts
import { describe, expect, it } from "bun:test"
import { expandSimplifiedSchema } from "./simplify"

describe("expandSimplifiedSchema", () => {
  it("expands minimal schema with auto-id and auto-label", () => {
    const result = expandSimplifiedSchema({
      name: "supplier",
      fields: [
        { key: "name", kind: "string" },
        { key: "status", kind: "enum", options: ["active", "inactive"] },
      ],
    })

    expect(result.name).toBe("supplier")
    expect(result.label).toBe("Supplier")
    expect(result.fields[0]).toEqual({
      key: "id",
      label: "ID",
      kind: "id",
      required: true,
    })
    expect(result.fields[1]).toEqual({
      key: "name",
      label: "Name",
      kind: "string",
    })
    expect(result.fields[2].key).toBe("status")
    expect(result.fields[2].options).toEqual([
      { label: "active", value: "active" },
      { label: "inactive", value: "inactive" },
    ])
  })

  it("preserves explicit label and required", () => {
    const result = expandSimplifiedSchema({
      name: "supplier",
      fields: [
        { key: "name", kind: "string", label: "供应商名称", required: true },
      ],
    })

    expect(result.fields[1].label).toBe("供应商名称")
    expect(result.fields[1].required).toBe(true)
  })

  it("generates frontend metadata from name when not provided", () => {
    const result = expandSimplifiedSchema({
      name: "supplier",
      fields: [{ key: "name", kind: "string" }],
    })

    expect(result.frontend).toEqual({
      workspaceDomain: "business",
      routePath: "/business/supplier",
      permissionPrefix: "business:supplier",
      moduleCode: "supplier",
      workspaceKind: "standard-crud",
      permissionActions: {
        list: true,
        create: true,
        update: true,
        delete: true,
        export: true,
      },
    })
  })

  it("accepts full ModuleSchema as-is", () => {
    const full = {
      name: "supplier",
      label: "Supplier",
      fields: [
        { key: "id", label: "ID", kind: "id", required: true },
        { key: "name", label: "Name", kind: "string" },
      ],
      frontend: {
        workspaceDomain: "system" as const,
        routePath: "/system/supplier",
        permissionPrefix: "system:supplier",
        moduleCode: "supplier",
        workspaceKind: "standard-crud",
      },
    }

    const result = expandSimplifiedSchema(full)
    expect(result).toEqual(full)
  })

  it("throws on missing name", () => {
    expect(() =>
      expandSimplifiedSchema({ fields: [] } as any),
    ).toThrow(/name/)
  })

  it("throws on empty fields", () => {
    expect(() =>
      expandSimplifiedSchema({ name: "test", fields: [] }),
    ).toThrow(/fields/)
  })
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/schema/src/simplify.test.ts`
Expected: FAIL — module not found

**Step 3: 实现 expandSimplifiedSchema**

```typescript
// packages/schema/src/simplify.ts
import type { ModuleField, ModuleFieldKind, ModuleSchema } from "./index"

interface SimplifiedField {
  key: string
  kind: ModuleFieldKind | string
  label?: string
  required?: boolean
  searchable?: boolean
  options?: string[] | Array<{ label: string; value: string }>
  dictionaryTypeCode?: string
  validation?: Record<string, unknown>
}

interface SimplifiedSchema {
  name: string
  label?: string
  fields: SimplifiedField[]
  frontend?: ModuleSchema["frontend"]
}

function autoLabel(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1)
}

function normalizeOptions(
  options: SimplifiedField["options"],
): Array<{ label: string; value: string }> | undefined {
  if (!options || options.length === 0) return undefined
  if (typeof options[0] === "string") {
    return (options as string[]).map((v) => ({ label: v, value: v }))
  }
  return options as Array<{ label: string; value: string }>
}

function isFullModuleSchema(input: unknown): boolean {
  if (typeof input !== "object" || input === null) return false
  const obj = input as Record<string, unknown>
  return (
    typeof obj.label === "string" &&
    Array.isArray(obj.fields) &&
    obj.fields.length > 0 &&
    typeof (obj.fields as any[])[0]?.key === "string" &&
    (obj.fields as any[])[0]?.key === "id" &&
    (obj.fields as any[])[0]?.kind === "id"
  )
}

export function expandSimplifiedSchema(input: unknown): ModuleSchema {
  if (!input || typeof input !== "object") {
    throw new Error("Schema must be a non-null object.")
  }

  if (isFullModuleSchema(input)) {
    return input as ModuleSchema
  }

  const raw = input as SimplifiedSchema

  if (!raw.name || typeof raw.name !== "string") {
    throw new Error("Schema name is required and must be a non-empty string.")
  }

  if (!Array.isArray(raw.fields) || raw.fields.length === 0) {
    throw new Error("Schema fields must be a non-empty array.")
  }

  const hasIdField = raw.fields.some((f) => f.key === "id")

  const expandedFields: ModuleField[] = []

  if (!hasIdField) {
    expandedFields.push({
      key: "id",
      label: "ID",
      kind: "id",
      required: true,
    })
  }

  for (const field of raw.fields) {
    expandedFields.push({
      key: field.key,
      label: field.label ?? autoLabel(field.key),
      kind: field.kind as ModuleFieldKind,
      ...(field.required !== undefined ? { required: field.required } : {}),
      ...(field.searchable !== undefined ? { searchable: field.searchable } : {}),
      ...(field.dictionaryTypeCode
        ? { dictionaryTypeCode: field.dictionaryTypeCode }
        : {}),
      ...(normalizeOptions(field.options)
        ? { options: normalizeOptions(field.options) }
        : {}),
      ...(field.validation ? { validation: field.validation as any } : {}),
    })
  }

  const frontend = raw.frontend ?? {
    workspaceDomain: "business" as const,
    routePath: `/business/${raw.name}`,
    permissionPrefix: `business:${raw.name}`,
    moduleCode: raw.name,
    workspaceKind: "standard-crud",
    permissionActions: {
      list: true,
      create: true,
      update: true,
      delete: true,
      export: true,
    },
  }

  return {
    name: raw.name,
    label: raw.label ?? autoLabel(raw.name),
    fields: expandedFields,
    frontend,
  }
}
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/schema/src/simplify.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/schema/src/simplify.ts packages/schema/src/simplify.test.ts
git commit -m "feat(schema): add SimplifiedModuleSchema expander for easier schema input"
```

---

### Task 2: 在 CLI 和 generator-session 中接入 SimplifiedSchema

**Files:**
- Modify: `packages/generator/src/cli.ts`
- Modify: `apps/server/src/modules/generator-session/module.ts`

**Step 1: 修改 loadSchemaFromFile 接入 expandSimplifiedSchema**

在 `packages/generator/src/cli.ts` 中：

```typescript
import { expandSimplifiedSchema } from "@elysian/schema"

const loadSchemaFromFile = async (filePath: string): Promise<ModuleSchema> => {
  const raw = await Bun.file(filePath).json()
  return expandSimplifiedSchema(raw)
}
```

同时在 `generator-session` 的 preview 端点中，对 `sourceType: "json"` 的输入也走 `expandSimplifiedSchema`。

**Step 2: 运行测试**

Run: `bun test packages/generator/src/`
Expected: PASS（现有测试不应 break，因为完整 ModuleSchema 会被 isFullModuleSchema 直接透传）

**Step 3: 提交**

```bash
git add packages/generator/src/cli.ts apps/server/src/modules/generator-session/module.ts
git commit -m "feat(generator): auto-expand simplified schema in CLI and session API"
```

---

## Track 2: CLI 体验改善

### Task 3: 重写 printUsage 为结构化帮助文本

**Files:**
- Modify: `packages/generator/src/cli.ts`

**Step 1: 替换 printUsage 实现**

```typescript
const printUsage = () => {
  const schemas = listRegisteredSchemaNames()
  const targets = listTargetPresets()

  console.log(`
Elysian Code Generator

Usage:
  bun --filter @elysian/generator generate <input> [options]

Input (one required):
  --schema <name>          Use a registered schema: ${schemas.join(", ")}
  --schema-file <path>     Use a JSON schema file (supports simplified format)

Output:
  --target <preset>        Target preset: ${targets.join(", ")}
  --out <dir>              Custom output directory

Options:
  --frontend <vue|react>   Frontend framework (default: vue)
  --conflict <strategy>    Conflict strategy: skip | overwrite | overwrite-generated-only | fail
                           (default: skip)
  --preview                Preview only, do not write files
  --report <path>          Save preview report to file (requires --preview)

Quick Start:
  # Preview a registered schema
  generate --schema customer --target staging --frontend vue --preview

  # Generate from a simple JSON file
  generate --schema-file ./my-module.json --target staging --frontend vue

  # Generate with force overwrite
  generate --schema customer --target staging --frontend vue --conflict overwrite
`.trim())
}
```

**Step 2: 运行测试**

Run: `bun test packages/generator/src/`
Expected: PASS

**Step 3: 提交**

```bash
git add packages/generator/src/cli.ts
git commit -m "feat(generator): rewrite CLI help with structured sections and examples"
```

---

### Task 4: 新增 --init 脚手架命令

**Files:**
- Create: `packages/generator/src/init.ts`
- Create: `packages/generator/src/init.test.ts`
- Modify: `packages/generator/src/cli.ts`
- Modify: `packages/generator/src/cli-args.ts`

**Step 1: 写失败测试**

```typescript
// packages/generator/src/init.test.ts
import { describe, expect, it } from "bun:test"
import { generateScaffoldSchema } from "./init"

describe("generateScaffoldSchema", () => {
  it("generates a minimal scaffold from module name", () => {
    const result = generateScaffoldSchema("product")
    const parsed = JSON.parse(result)

    expect(parsed.name).toBe("product")
    expect(parsed.fields).toBeInstanceOf(Array)
    expect(parsed.fields.length).toBeGreaterThanOrEqual(2)
    expect(parsed.fields.find((f: any) => f.key === "name")).toBeDefined()
  })

  it("includes all supported kinds as commented examples", () => {
    const result = generateScaffoldSchema("order")
    expect(result).toContain("string")
    expect(result).toContain("number")
    expect(result).toContain("boolean")
    expect(result).toContain("enum")
    expect(result).toContain("datetime")
  })
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/init.test.ts`
Expected: FAIL

**Step 3: 实现 generateScaffoldSchema**

```typescript
// packages/generator/src/init.ts

export function generateScaffoldSchema(moduleName: string): string {
  const template = {
    name: moduleName,
    // label: "Product",  // optional, auto-derived from name
    fields: [
      // id field is auto-added; do not include it here
      { key: "name", kind: "string", required: true, searchable: true },
      // { key: "description", kind: "string" },
      // { key: "price", kind: "number", required: true },
      // { key: "isActive", kind: "boolean" },
      // { key: "status", kind: "enum", options: ["draft", "published", "archived"] },
      // { key: "createdAt", kind: "datetime" },
    ],
    // frontend: {  // optional, auto-derived from name
    //   workspaceDomain: "business",  // or "system"
    //   routePath: "/business/product",
    // },
  }

  return JSON.stringify(template, null, 2)
}
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/init.test.ts`
Expected: PASS

**Step 5: 在 CLI 中接入 --init**

在 `parseCliArgs` 中新增 `--init <name>` 参数解析，在 `main` 中新增分支：

```typescript
if (options.initModule) {
  const scaffold = generateScaffoldSchema(options.initModule)
  const outPath = resolveCliPath(`./${options.initModule}.module-schema.json`)
  await Bun.write(outPath, scaffold)
  console.log(`[generator] scaffold written to ${outPath}`)
  console.log(`[generator] edit the file, then run:`)
  console.log(`  generate --schema-file ${outPath} --target staging --frontend vue --preview`)
  return
}
```

**Step 6: 运行全量测试**

Run: `bun test packages/generator/src/`
Expected: PASS

**Step 7: 提交**

```bash
git add packages/generator/src/init.ts packages/generator/src/init.test.ts packages/generator/src/cli.ts packages/generator/src/cli-args.ts
git commit -m "feat(generator): add --init scaffold command for quick schema bootstrapping"
```

---

### Task 5: 新增 --list-schemas 列出可用 schema 及描述

**Files:**
- Modify: `packages/generator/src/cli.ts`
- Modify: `packages/generator/src/cli-args.ts`

**Step 1: 在 CLI 中新增 --list-schemas 分支**

在 `parseCliArgs` 中识别 `--list-schemas` flag，在 `main` 中新增分支：

```typescript
if (options.listSchemas) {
  const names = listRegisteredSchemaNames()
  console.log("Available schemas:\n")
  for (const name of names) {
    const schema = getRegisteredSchema(name)
    const fieldCount = schema.fields.length
    const domain = schema.frontend?.workspaceDomain ?? "business"
    console.log(`  ${name.padEnd(20)} ${schema.label} (${fieldCount} fields, ${domain})`)
  }
  return
}
```

**Step 2: 运行测试**

Run: `bun test packages/generator/src/`
Expected: PASS

**Step 3: 手动验证**

Run: `bun --filter @elysian/generator generate --list-schemas`
Expected: 列出所有 13+ 已注册 schema，带字段数和域信息

**Step 4: 提交**

```bash
git add packages/generator/src/cli.ts packages/generator/src/cli-args.ts
git commit -m "feat(generator): add --list-schemas to display available schemas"
```

---

## Track 3: 校验体验增强

### Task 6: 人类可读的校验输出格式化器

**Files:**
- Create: `packages/schema/src/format-validation.ts`
- Create: `packages/schema/src/format-validation.test.ts`

**Step 1: 写失败测试**

```typescript
// packages/schema/src/format-validation.test.ts
import { describe, expect, it } from "bun:test"
import { formatValidationIssues } from "./format-validation"
import type { ModuleSchemaValidationIssue } from "./index"

describe("formatValidationIssues", () => {
  it("formats single issue", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      { path: "name", message: "Module name must be a non-empty string." },
    ]
    const result = formatValidationIssues(issues)
    expect(result).toContain("name")
    expect(result).toContain("Module name must be a non-empty string")
    expect(result).toContain("1 issue")
  })

  it("formats multiple issues with field index", () => {
    const issues: ModuleSchemaValidationIssue[] = [
      { path: "fields[2].kind", message: "Field kind must be one of: id, string, number, boolean, enum, datetime." },
      { path: "fields[2].key", message: "Field key must be a non-empty string." },
    ]
    const result = formatValidationIssues(issues)
    expect(result).toContain("fields[2].kind")
    expect(result).toContain("2 issues")
  })

  it("returns no-issues message for empty array", () => {
    const result = formatValidationIssues([])
    expect(result).toContain("No issues")
  })
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/schema/src/format-validation.test.ts`
Expected: FAIL

**Step 3: 实现 formatValidationIssues**

```typescript
// packages/schema/src/format-validation.ts
import type { ModuleSchemaValidationIssue } from "./index"

export function formatValidationIssues(
  issues: ModuleSchemaValidationIssue[],
): string {
  if (issues.length === 0) {
    return "No issues found. Schema is valid."
  }

  const header = `Schema validation failed with ${issues.length} issue${issues.length > 1 ? "s" : ""}:\n`
  const lines = issues.map(
    (issue) => `  - ${issue.path}: ${issue.message}`,
  )

  return header + lines.join("\n")
}
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/schema/src/format-validation.test.ts`
Expected: PASS

**Step 5: 在 CLI 和 generator-session 中接入格式化输出**

**Step 6: 提交**

```bash
git add packages/schema/src/format-validation.ts packages/schema/src/format-validation.test.ts
git commit -m "feat(schema): add human-readable validation issue formatter"
```

---

### Task 7: 校验时附带修复建议

**Files:**
- Modify: `packages/schema/src/format-validation.ts`
- Modify: `packages/schema/src/format-validation.test.ts`

**Step 1: 写测试——常见错误附带建议**

```typescript
it("suggests fix for missing id field", () => {
  const issues: ModuleSchemaValidationIssue[] = [
    { path: "fields", message: 'Module schema must contain exactly one "id" field.' },
  ]
  const result = formatValidationIssues(issues)
  expect(result).toContain("Add a field with key \"id\" and kind \"id\"")
})

it("suggests fix for enum without options", () => {
  const issues: ModuleSchemaValidationIssue[] = [
    { path: "fields[1]", message: "Enum field must provide non-empty options or dictionaryTypeCode." },
  ]
  const result = formatValidationIssues(issues)
  expect(result).toContain("Add 'options' array or 'dictionaryTypeCode'")
})

it("suggests fix for unknown field kind", () => {
  const issues: ModuleSchemaValidationIssue[] = [
    { path: "fields[0].kind", message: "Field kind must be one of: id, string, number, boolean, enum, datetime." },
  ]
  const result = formatValidationIssues(issues)
  expect(result).toContain("Supported kinds: id, string, number, boolean, enum, datetime")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/schema/src/format-validation.test.ts`
Expected: FAIL

**Step 3: 实现建议逻辑**

在 `formatValidationIssues` 中根据 issue.message 匹配常见模式，附加建议行。

**Step 4: 运行测试确认通过**

Run: `bun test packages/schema/src/format-validation.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/schema/src/format-validation.ts packages/schema/src/format-validation.test.ts
git commit -m "feat(schema): add fix suggestions to validation output"
```

---

## Track 4: 端到端验证

### Task 8: 简化 schema 端到端冒烟验证

**Files:**
- Create: `scripts/e2e-generator-simplified-smoke.ts`

**Step 1: 编写端到端冒烟脚本**

验证以下流程：
1. `--init product` 生成脚手架
2. 编辑脚手架添加字段
3. `--schema-file product.module-schema.json --preview` 预览成功
4. `--schema-file product.module-schema.json` 正式生成成功
5. 生成产物包含预期的文件（schema, repository, service, routes, frontend artifact）

**Step 2: 运行验证**

Run: `bun run scripts/e2e-generator-simplified-smoke.ts`
Expected: PASS

**Step 3: 提交**

```bash
git add scripts/e2e-generator-simplified-smoke.ts
git commit -m "test(generator): add e2e smoke for simplified schema input flow"
```

---

### Task 9: 更新 README 和 CLI 文档

**Files:**
- Modify: `README.md` (代码生成器章节)

**Step 1: 更新 README 生成器章节**

新增以下内容：
- 简化 schema 格式说明和示例
- `--init` 命令用法
- `--list-schemas` 命令用法
- 从零开始的快速开始流程（`--init` -> 编辑 -> `--preview` -> 生成）

**Step 2: 提交**

```bash
git add README.md
git commit -m "docs: update generator section with simplified schema and new CLI commands"
```

---

## 任务依赖关系

```
Task 1 (SimplifiedSchema 类型)
  -> Task 2 (CLI/Session 接入)
       -> Task 8 (E2E 冒烟)

Task 3 (CLI 帮助文本) -- 独立
Task 4 (--init 命令) -- 独立
Task 5 (--list-schemas) -- 独立

Task 6 (校验格式化) -- 独立
  -> Task 7 (修复建议)

Task 9 (文档更新) -- 依赖 Task 1-8 全部完成
```

**推荐执行顺序：** Task 1 -> Task 3 -> Task 4 -> Task 5 -> Task 6 -> Task 7 -> Task 2 -> Task 8 -> Task 9

其中 Task 3/4/5 和 Task 6/7 可以并行。
