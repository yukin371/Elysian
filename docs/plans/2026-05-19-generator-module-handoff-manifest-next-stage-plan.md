# 2026-05-19 Generator Module Handoff Manifest 下阶段计划

更新时间：`2026-05-19`

## 定位

本文件规划 `Phase H Generator 可发布闭环硬化` 本地收口后的候选阶段。它只讨论 `--target module` 到正式模块目录的人工接线证据是否需要独立 manifest，不把 module target 扩成一键正式接线、正式 migration 自动化或导入平台能力。

候选阶段名称：

`Generator Module Handoff Manifest`

## 边界摘要

目标模块：
- `packages/generator`
- `scripts/*generator*`
- `docs/*`

现有 owner：
- `packages/generator`：`staging` / `module` target preset、文件计划、写入 manifest、`*.persistence.ts` 交接模板、module target 集成桩与人工集成清单
- `packages/schema`：`ModuleSchema` 与 simplified 输入展开，不拥有 module 接线状态
- `packages/persistence`：正式 Drizzle schema、migration、review-only SQL proposal snapshot canonical owner
- `apps/server`：正式模块 runtime 装配、HTTP routes、auth guard 与 OpenAPI，不由 generator 自动改写
- `apps/example-vue`：真实前端 workspace 消费与 generated surface 校验，不由 module handoff manifest 自动注册
- `scripts` / CI：阶段验证入口、报告和门禁，不拥有业务实现

影响面：
- `--target module` 生成后的人工接线可审查性
- module target checklist 与实际产物之间的一致性
- 生成产物进入正式模块前的缺口记录与验证入口
- 后续 PR review 时对“哪些步骤仍需人工完成”的判读

计划改动：
- 先定义 module handoff manifest 的最小字段和 owner。
- 只记录生成产物、建议人工步骤、对应 owner、验证命令和未完成状态。
- 不自动修改 `packages/persistence` 正式 schema index、migration、server compose 或 frontend registry。
- 不把 manifest 写成完成证明；它只能是人工接线前后的证据清单。
- 若进入实现，优先接在 `packages/generator` 现有 manifest / report 边界内，避免新增跨层 service。

验证方式：
- `bun test packages/generator/src/`
- `bun run e2e:generator:cli`
- `bun run e2e:generator:matrix`
- `bun run e2e:generator:reports:index`
- `bun run e2e:generator:reports:gate`
- 必要时新增或扩展 `scripts/e2e-generator-module-target-smoke.ts`

需要同步的文档：
- `docs/roadmap.md`
- `packages/generator/MODULE.md`（仅当 manifest 输出边界落地）
- `docs/PROJECT_PROFILE.md`（仅当新增命令、CI 或长期事实）
- `docs/reference/03-ci-gates-and-reports.md`（仅当 manifest 被纳入统一报告）

架构风险：
- manifest 被误解为“已经完成正式接线”。
- generator 越过 owner 自动写入 persistence / server / frontend 正式注册。
- 为了追踪 checklist 状态而新增跨层运行时中心。

重复实现风险：
- 现有 generator 写入 manifest 已记录生成文件；新 manifest 不应重复记录低层文件写入细节。
- 现有 SQL proposal snapshot / handoff artifact 属于 `packages/persistence`；module handoff manifest 不应复制 proposal 内容。
- 现有 P5A handoff / replay 记录 AI -> schema 输入证据；module handoff manifest 不应承担 AI 输入分类。

回滚路径：
- 若 manifest 设计过重，保持现有 CLI checklist 与 smoke 测试即可，不落实现。
- 若实现后发现 owner 混乱，可仅保留文档计划，删除新增 manifest 输出，不影响 staging apply 与 reports gate。

## 入口条件

进入实现前必须满足：

1. `Phase H` 已提交，且工作区干净。
2. 明确 manifest 只记录人工接线证据，不代表接线完成。
3. 明确不自动修改正式 migration、server compose、frontend registry。
4. 能指出复用现有 generator manifest / report 的位置，不能先新建第二套报告中心。

当前复核：

- `2026-05-19` 已执行 `bun scripts/e2e-generator-module-target-smoke.ts`，结果通过。
- 该结果只确认现有 module target 生成与 checklist 边界仍可用，不代表 module handoff manifest 已实现。

## 阶段目标

把 `--target module` 从“生成后打印 checklist”推进到“生成后可留下可审查、可回放、可提交讨论的人工接线证据”，帮助 reviewer 判断：

1. 生成了哪些 module target 产物。
2. 哪些步骤仍需人工接线。
3. 每个步骤的 canonical owner 是谁。
4. 推荐验证命令是什么。
5. 当前 manifest 只说明待办状态，不宣称正式合入完成。

## 建议 manifest 形态

最小字段候选：

```ts
interface ModuleHandoffManifest {
  version: 1
  generatedAt: string
  schemaName: string
  frontendTarget: "vue" | "react"
  targetPreset: "module"
  generatedFiles: Array<{
    path: string
    owner: "generator"
    mergeStrategy: string
  }>
  manualSteps: Array<{
    id: string
    title: string
    canonicalOwner:
      | "packages/persistence"
      | "apps/server"
      | "apps/example-vue"
      | "reviewer"
    status: "pending"
    evidenceHint: string
  }>
  suggestedCommands: string[]
  nonGoals: string[]
}
```

约束：
- `manualSteps.status` 初始只能是 `pending`，避免 generator 宣称人工步骤已完成。
- `canonicalOwner` 必须落到现有 owner，不新增 `shared` 或 `platform` owner。
- `nonGoals` 必须固定包含“不自动生成正式 migration”“不自动注册 server compose”“不自动注册 frontend workspace”。

## MHM-1 契约草案

当前 `packages/generator/src/write.ts` 已有 `GenerationManifest`，负责记录写入文件、绝对路径、冲突策略、输出目录和 target preset。因此 module handoff manifest 不应复制底层文件写入证据，而应作为 `module` target 的人工接线补充证据：

- `generationManifestPath`：指向既有 `.elysian-generator/{schema}.{frontend}.json`，复用文件写入事实。
- `manualSteps`：只列出人工步骤和 canonical owner。
- `status`：生成时只能是 `pending`，不得由 generator 标成 `completed`。
- `evidenceHint`：描述 reviewer 应查看什么，不写入运行时完成状态。
- `suggestedCommands`：只给验证建议，不自动执行。
- `nonGoals`：固定约束 generator 不越过 owner。

候选类型：

```ts
interface ModuleHandoffManifestV1 {
  version: 1
  generatedAt: string
  schemaName: string
  frontendTarget: "vue" | "react"
  targetPreset: "module"
  generationManifestPath: string
  manualSteps: ModuleHandoffManualStep[]
  suggestedCommands: string[]
  nonGoals: string[]
}

interface ModuleHandoffManualStep {
  id:
    | "persistence-schema-review"
    | "persistence-migration"
    | "server-repository-implementation"
    | "server-route-registration"
    | "frontend-workspace-registration"
    | "final-verification"
  title: string
  canonicalOwner:
    | "packages/persistence"
    | "apps/server"
    | "apps/example-vue"
    | "reviewer"
  status: "pending"
  evidenceHint: string
}
```

示例 JSON：

```json
{
  "version": 1,
  "generatedAt": "2026-05-19T00:00:00.000Z",
  "schemaName": "customer",
  "frontendTarget": "vue",
  "targetPreset": "module",
  "generationManifestPath": "apps/server/src/modules/.elysian-generator/customer.vue.json",
  "manualSteps": [
    {
      "id": "persistence-schema-review",
      "title": "Review generated persistence schema handoff template",
      "canonicalOwner": "packages/persistence",
      "status": "pending",
      "evidenceHint": "Review customer.persistence.ts before copying any schema into packages/persistence."
    },
    {
      "id": "persistence-migration",
      "title": "Create and review the formal database migration",
      "canonicalOwner": "packages/persistence",
      "status": "pending",
      "evidenceHint": "Run db:generate/db:migrate only after the persistence owner accepts the schema change."
    },
    {
      "id": "server-repository-implementation",
      "title": "Implement repository and route behavior in the server module",
      "canonicalOwner": "apps/server",
      "status": "pending",
      "evidenceHint": "Replace TODO stubs in customer.module.ts with reviewed repository and route logic."
    },
    {
      "id": "server-route-registration",
      "title": "Register the server module in the correct compose owner",
      "canonicalOwner": "apps/server",
      "status": "pending",
      "evidenceHint": "Choose compose-business.ts or compose-system.ts by module domain; generator must not decide this automatically."
    },
    {
      "id": "frontend-workspace-registration",
      "title": "Register and verify the frontend workspace surface",
      "canonicalOwner": "apps/example-vue",
      "status": "pending",
      "evidenceHint": "Use existing generated surface verification before committing frontend workspace changes."
    },
    {
      "id": "final-verification",
      "title": "Run boundary verification before claiming integration complete",
      "canonicalOwner": "reviewer",
      "status": "pending",
      "evidenceHint": "Run targeted module tests plus generator/module smoke; do not treat this manifest as completion proof."
    }
  ],
  "suggestedCommands": [
    "bun test packages/generator/src/",
    "bun scripts/e2e-generator-module-target-smoke.ts",
    "bun run e2e:generator:cli"
  ],
  "nonGoals": [
    "Does not generate formal migrations automatically.",
    "Does not register server compose automatically.",
    "Does not register frontend workspace automatically.",
    "Does not mark manual integration as completed."
  ]
}
```

评审问题：

1. `generationManifestPath` 是否足够复用既有写入 manifest，避免重复文件列表？
2. `manualSteps` 是否过多，是否应先只保留 persistence / server / frontend / reviewer 四类 owner 级步骤？
3. `frontendTarget: "react"` 是否应保留在契约中，还是在当前实现阶段只允许 `vue`？
4. manifest 是否需要进入 reports index，还是只作为 module target 附属产物？

## 工作包

### MHM-0. 现状复核

目标：确认当前 module target 的实际输出与 checklist。

必须完成：
- 复跑 `scripts/e2e-generator-module-target-smoke.ts`。
- 定位当前生成 manifest 与 module target checklist 的输出位置。
- 确认 `*.persistence.ts` 仍只是交接模板。

出口门禁：
- `bun run e2e:generator:cli`
- `bun run e2e:generator:matrix`

### MHM-1. Manifest 契约草案

目标：只定义 manifest schema 与示例，不接入写入流程。

必须完成：
- 明确字段只覆盖人工接线证据。
- 明确不能承载正式 migration、runtime compose 或 frontend registry 完成状态。
- 明确与现有 generator write manifest 的关系。

出口门禁：
- 文档评审通过，且没有新增实现。

### MHM-2. 最小实现候选

目标：在 `packages/generator` 内复用现有 report / manifest 边界输出 module handoff manifest。

当前进展：

- 已在 `packages/generator` 内新增 `ModuleHandoffManifestV1` 最小构建器。
- `writeModuleFiles(... targetPreset: "module")` 和 module preview apply 会在既有 `.elysian-generator` 目录旁挂 `{schema}.{frontend}.module-handoff.json`。
- CLI module target checklist 会提示 handoff manifest 文件名。
- 该 manifest 只记录 pending 人工步骤、canonical owner、建议验证命令和 non-goals，不自动修改 persistence / server / frontend 正式 owner。
- `2026-05-19` 已复跑 `bun test packages/generator/src/write.test.ts packages/generator/src/index.test.ts`、`bun scripts/e2e-generator-module-target-smoke.ts`、`bun run e2e:generator:cli` 与 `bun run typecheck`，均通过。

必须遵守：
- 不改 `packages/persistence` 正式 schema。
- 不改 `apps/server` compose。
- 不改 `apps/example-vue` registry。
- 不新增跨层 service。

出口门禁：
- `bun test packages/generator/src/`
- `bun run e2e:generator:cli`
- module target smoke 覆盖 manifest shape。

### MHM-3. Reports 接入评估

目标：判断 module handoff manifest 是否需要进入 generator reports index / gate。

必须回答：
- 它是 release blocker，还是 review 辅助证据？
- 缺失时是否应导致 reports gate 失败？
- 是否会让 reports gate 混入人工接线完成状态？

默认结论：
- 本阶段先不纳入 gate required source，除非已有明确 CI 产物与失败语义。

当前评估：

- module handoff manifest 是 review 辅助证据，不是 release blocker。
- 缺失 module handoff manifest 不应导致 `e2e:generator:reports:gate` 失败；当前 gate 继续只要求 `matrix / cli / studio / browser` 四类发布闭环报告源。
- manifest 的存在只能说明 generator 输出了人工接线待办，不能说明 persistence migration、server compose 或 frontend registry 已经完成。
- 若后续要纳入 reports index，应先新增独立 source 与失败语义，并确保 gate 不把 `manualSteps.status = "pending"` 误判为失败或完成。
- 当前结论：保持附属证据，不接入 gate required source。

## 非目标

- 不实现导入 DSL、导入 API、批量落库或错误回写平台。
- 不把 `--target module` 改成一键正式接线。
- 不自动生成正式 migration。
- 不自动注册 server compose。
- 不自动注册 frontend workspace。
- 不新增第二套 starter。
- 不新增跨层 shared helper 或运行时 handoff center。

## 推荐起手顺序

1. 若继续本方向，优先补 module handoff manifest 的示例文档或 README 引用，而不是接入 reports gate。
2. 若未来要做正式模块接线验证，先单独设计人工步骤完成证据，不复用 generator 生成时的 pending manifest。
3. 若继续扩大 generator 输入来源，回到 Phase H 导入边界决策，只做 schema 输入层 POC，不进入导入平台实现。
