# Generator Module Apply 路径实施方案

**Goal:** 新增 `--target module` 生成目标，让生成器直接产出可集成到主工程的服务端模块骨架（module.ts + repository 实现 + compose 注册桩），把"staging 代码搬到生产"从纯手工变为半自动。

**Architecture:** 在现有 staging 生成的基础上，新增 `module` 目标预设。`module` 目标额外生成 `module.ts`（模块装配文件）和 `repository.ts`（Drizzle 实现桩），并输出一个集成清单说明开发者需要手动完成的部分（persistence schema、compose 注册、前端注册）。不改变现有 staging 目标的任何行为。

**Tech Stack:** TypeScript, Bun test, 现有 packages/generator 模板系统

---

## Track 1: 目标预设扩展

### Task 1: 新增 `module` 目标预设

**Files:**
- Modify: `packages/generator/src/shared-conventions.ts`
- Modify: `packages/generator/src/conventions.ts`
- Modify: `packages/generator/src/cli-args.ts`
- Test: `packages/generator/src/cli-args.test.ts`

**Step 1: 写失败测试**

```typescript
// packages/generator/src/cli-args.test.ts 新增
it("accepts --target module", () => {
  const result = parseCliArgs([
    "--schema", "customer",
    "--target", "module",
    "--frontend", "vue",
  ])
  expect(result).not.toBeNull()
  expect(result!.targetPreset).toBe("module")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/cli-args.test.ts`
Expected: FAIL — "module" is not a valid target preset

**Step 3: 修改代码**

```typescript
// packages/generator/src/shared-conventions.ts
export type GenerationTargetPreset = "staging" | "module"

export const DEFAULT_GENERATION_TARGET: GenerationTargetPreset = "staging"
export const DEFAULT_OUTPUT_DIR = "generated"

export const listTargetPresets = (): GenerationTargetPreset[] => ["staging", "module"]
```

在 `conventions.ts` 的 `resolveTargetPresetOutputDir` 中：

```typescript
export const resolveTargetPresetOutputDir = (
  target: GenerationTargetPreset,
): string => {
  if (target === "module") {
    return resolve(resolveRepositoryRoot(), "apps", "server", "src", "modules")
  }
  // staging and default
  return resolve(resolveRepositoryRoot(), DEFAULT_OUTPUT_DIR)
}
```

在 `cli-args.ts` 的 `parseCliArgs` 中，`--target` 分支增加 `"module"` 识别。

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/cli-args.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/shared-conventions.ts packages/generator/src/conventions.ts packages/generator/src/cli-args.ts packages/generator/src/cli-args.test.ts
git commit -m "feat(generator): add 'module' target preset for direct-to-app generation"
```

---

## Track 2: 模块装配模板

### Task 2: 新增 renderModuleRegistrationTemplate

**Files:**
- Modify: `packages/generator/src/templates.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 写失败测试**

```typescript
it("renders module registration template", () => {
  const schema: ModuleSchema = {
    name: "supplier",
    label: "Supplier",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
    ],
  }
  const result = renderModuleRegistrationTemplate(schema)
  expect(result).toContain("createSupplierModule")
  expect(result).toContain("createSupplierRepository")
  expect(result).toContain("AuthGuard")
  expect(result).toContain("ServerModule")
  expect(result).toContain("supplier")
})
```

**Step 2: 运行测试确认失败**

Run: `bun test packages/generator/src/index.test.ts`
Expected: FAIL — renderModuleRegistrationTemplate not found

**Step 3: 实现模板**

```typescript
// packages/generator/src/templates.ts
export const renderModuleRegistrationTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const camelName = toCamelCase(schema.name)

  return `import type { DatabaseClient } from "@elysian/persistence"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import { create${pascalName}Service } from "./${schema.name}.service"

export const create${pascalName}Repository = (db: DatabaseClient) => ({
  list: async () => {
    // TODO: implement with Drizzle query
    // Reference: packages/persistence/src/schema/ for table definitions
    return [] as any[]
  },
  getById: async (id: string) => {
    // TODO: implement with Drizzle query
    return null as any
  },
  create: async (input: any) => {
    // TODO: implement with Drizzle insert
    return {} as any
  },
})

export const create${pascalName}Module = (
  ${camelName}Repository: ReturnType<typeof create${pascalName}Repository>,
  options: { authGuard: AuthGuard },
): ServerModule => {
  const service = create${pascalName}Service(${camelName}Repository)

  return {
    name: "${schema.name}",
    register: (app) => {
      // TODO: wire routes with auth guard
      // Example: app.get("/${schema.name}s", ...service.list)
      return app
    },
  }
}
`
}
```

**Step 4: 运行测试确认通过**

Run: `bun test packages/generator/src/index.test.ts`
Expected: PASS

**Step 5: 提交**

```bash
git add packages/generator/src/templates.ts packages/generator/src/index.test.ts
git commit -m "feat(generator): add module registration template with Drizzle stubs"
```

---

### Task 3: 在 module target 下生成额外的文件计划

**Files:**
- Modify: `packages/generator/src/core.ts`
- Test: `packages/generator/src/index.test.ts`

**Step 1: 写失败测试**

```typescript
it("includes module.ts in file plan when target is module", () => {
  const schema: ModuleSchema = {
    name: "supplier",
    label: "Supplier",
    fields: [
      { key: "id", label: "ID", kind: "id", required: true },
      { key: "name", label: "Name", kind: "string", required: true },
    ],
  }
  const plans = planModuleFiles(schema, { targetPreset: "module" })
  const moduleFile = plans.find((p) => p.path.endsWith("module.ts"))
  expect(moduleFile).toBeDefined()
  expect(moduleFile!.path).toContain("supplier")
})
```

**Step 2: 运行测试确认失败**

**Step 3: 修改 planModuleFiles**

在 `packages/generator/src/core.ts` 的 `planModuleFiles` 中，当 `options.targetPreset === "module"` 时，追加 `module.ts` 到文件计划：

```typescript
// 在 baseFiles 之后、return 之前
if (options.targetPreset === "module") {
  baseFiles.push({
    path: `${basePath}/${schema.name}.module.ts`,
    reason: "module registration with Drizzle repository stubs",
    mergeStrategy: "skip" as any, // 不覆盖已有的 module.ts
  })
}
```

注意：mergeStrategy 用 `skip` 因为如果 module.ts 已经存在（开发者已经手写了），不应覆盖。

**Step 4: 运行测试确认通过**

**Step 5: 提交**

```bash
git add packages/generator/src/core.ts packages/generator/src/index.test.ts
git commit -m "feat(generator): include module.ts in file plan for module target"
```

---

## Track 3: 集成清单输出

### Task 4: 生成后输出集成清单

**Files:**
- Modify: `packages/generator/src/cli.ts`

**Step 1: 在 module target 生成完成后输出集成指南**

当 `targetPreset === "module"` 且生成成功时，输出以下清单：

```typescript
if (options.targetPreset === "module") {
  console.log("")
  console.log("=== Integration Checklist ===")
  console.log(`1. Create persistence schema in packages/persistence/src/schema/${schema.name}.ts`)
  console.log(`2. Run: bun run db:generate && bun run db:migrate`)
  console.log(`3. Implement repository methods in apps/server/src/modules/${schema.name}/${schema.name}.module.ts`)
  console.log(`4. Wire routes in the register() function`)
  console.log(`5. Register module in apps/server/src/modules/compose-business.ts (or compose-system.ts)`)
  console.log(`6. Register frontend workspace in apps/example-vue/src/modules/`)
  console.log("")
  console.log("See docs/plans/2026-05-09-generator-module-apply-path-plan.md for details.")
}
```

**Step 2: 手动验证**

Run: `bun --filter @elysian/generator generate --schema customer --target module --frontend vue --preview`
Expected: 输出文件计划包含 `module.ts`，且最后显示集成清单

**Step 3: 提交**

```bash
git add packages/generator/src/cli.ts
git commit -m "feat(generator): output integration checklist for module target"
```

---

## Track 4: 端到端验证

### Task 5: E2E 冒烟——module target 生成验证

**Files:**
- Create: `scripts/e2e-generator-module-target-smoke.ts`

**Step 1: 编写冒烟脚本**

验证：
1. `--target module --preview` 输出的文件计划包含 `module.ts`
2. `--target module` 生成的 `module.ts` 包含 `create{PascalName}Module` 和 `create{PascalName}Repository`
3. 生成的 `module.ts` 包含 `// TODO` 标记的待实现项
4. 不影响现有 staging 目标的生成行为

**Step 2: 运行验证**

Run: `bun run scripts/e2e-generator-module-target-smoke.ts`
Expected: PASS

**Step 3: 提交**

```bash
git add scripts/e2e-generator-module-target-smoke.ts
git commit -m "test(generator): add E2E smoke for module target generation"
```

---

### Task 6: 更新 README 和 printUsage

**Files:**
- Modify: `README.md`
- Modify: `packages/generator/src/cli.ts` (printUsage)

**Step 1: 更新帮助文本**

在 printUsage 的 Target presets 部分新增：

```
Target presets: staging, module
  staging  — Generate to generated/ directory (safe preview)
  module   — Generate directly into apps/server/src/modules/ (integration-ready)
```

在 Quick Start 新增：

```
# Generate with integration stubs
generate --schema customer --target module --frontend vue --preview
```

**Step 2: 更新 README**

在代码生成器章节补充 `--target module` 用法和集成清单说明。

**Step 3: 提交**

```bash
git add README.md packages/generator/src/cli.ts
git commit -m "docs: document module target preset and integration checklist"
```

---

## 任务依赖关系

```
Task 1 (module 目标预设)
  -> Task 3 (文件计划扩展)
  -> Task 4 (集成清单输出)
  -> Task 5 (E2E)
  -> Task 6 (文档)

Task 2 (module.ts 模板) -- 独立
  -> Task 3
```

**推荐执行顺序：** Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 5 -> Task 6
