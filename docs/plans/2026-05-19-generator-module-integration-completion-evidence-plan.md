# 2026-05-19 Generator Module Integration Completion Evidence 候选计划

更新时间：`2026-05-19`

## 定位

本文件规划 `module handoff manifest` 之后的候选方向：如果后续需要证明 `--target module` 生成后的人工接线已经完成，应单独设计“完成证据”，不能复用 generator 生成时产出的 pending handoff manifest。

本计划只定义边界和候选证据形态，不实现正式模块接线、不自动生成 migration、不自动注册 server compose 或 frontend workspace。

## 边界摘要

目标模块：
- `docs/*`
- 后续若实现，优先落在 `scripts/*generator*` 或 review 辅助文档，不落在运行时模块

现有 owner：
- `packages/generator`：生成 pending handoff manifest，不能宣称人工接线完成
- `packages/persistence`：正式 schema、migration 与数据库验证 owner
- `apps/server`：正式 module runtime、route、auth guard、OpenAPI 与 compose owner
- `apps/example-vue`：正式 frontend workspace、generated surface 校验与页面接入 owner
- reviewer / PR：人工完成状态的最终确认 owner

影响面：
- PR review 时如何判断 module target 产物是否已被正确接入
- generator pending manifest 与人工完成证据之间的边界
- 后续是否需要独立脚本校验“完成证据”而不是让 reports gate 误判

计划改动：
- 先定义人工完成证据的最小字段和适用范围。
- 只允许人工或独立验证脚本写入完成状态。
- 不让 `packages/generator` 在生成阶段写入 completed 状态。
- 不把完成证据接入现有 `e2e:generator:reports:gate` required source，除非后续有明确失败语义。

验证方式：
- 文档审查
- 若进入实现，再设计独立脚本，例如 `scripts/generator-module-integration-evidence*.ts`
- 不复用生成时的 `module-handoff.json` 作为完成证明

需要同步的文档：
- `docs/roadmap.md`
- 必要时 `docs/reference/10-feature-review-and-evaluation.md`
- 若新增脚本，再同步 `docs/PROJECT_PROFILE.md`

## 核心原则

`module-handoff.json` 的语义是：

- generator 已输出待人工接线清单
- 所有 `manualSteps.status` 初始为 `pending`
- 它不是完成证明

人工完成证据的语义应是：

- reviewer 或独立验证脚本确认某些接线步骤已完成
- 每个 completed 项必须指向具体证据
- 不能由 generator 生成阶段自动产生

## 候选证据形态

```ts
interface ModuleIntegrationCompletionEvidence {
  version: 1
  generatedAt: string
  schemaName: string
  sourceHandoffManifestPath: string
  completedSteps: Array<{
    id:
      | "persistence-schema-reviewed"
      | "persistence-migration-created"
      | "server-module-registered"
      | "server-routes-tested"
      | "frontend-workspace-verified"
      | "final-review-complete"
    canonicalOwner:
      | "packages/persistence"
      | "apps/server"
      | "apps/example-vue"
      | "reviewer"
    evidence:
      | { kind: "file"; path: string }
      | { kind: "command"; command: string; status: "passed" }
      | { kind: "review-note"; summary: string }
  }>
  openSteps: string[]
  nonGoals: string[]
}
```

约束：
- `completedSteps` 只能由人工或独立验证脚本产生。
- 每个完成项必须带证据，不允许只有状态。
- `openSteps` 不能因为缺失而被默认视为完成。
- `nonGoals` 必须固定包含“不自动生成正式 migration”“不自动接线 server compose”“不自动接线 frontend registry”。

## 不进入实现的原因

当前阶段已有 pending handoff manifest，已经足够解决“生成后有哪些人工步骤”的可审查问题。完成证据会触及正式 owner 的真实接线状态，必须先明确：

1. 哪些完成项可以由脚本验证。
2. 哪些完成项只能由 reviewer 判断。
3. 失败时是否影响 PR gate。
4. 是否会诱导 generator 越权修改正式 owner。

答不清前，不进入实现。

## 推荐后续

1. 若需要继续，先选一个真实 `--target module` 样例，人工完成接线后再设计 evidence。
2. 若只是提高 review 体验，优先补 PR 模板或 review checklist，而不是新增脚本。
3. 若要做脚本，先只读检查文件与命令结果，不写正式 owner 文件。

## Reviewer Checklist

人工确认 `module` 接线完成时，建议至少检查：

- `module-handoff.json` 是否存在，且所有 `manualSteps.status` 仍然是 `pending`。
- `GenerationManifest` 是否仍然只记录生成文件与冲突策略，没有把人工接线状态伪装成完成状态。
- `packages/persistence` 是否已经由 owner 自己完成 schema / migration 接入。
- `apps/server` 的 module compose 和 route registration 是否已经由 owner 自己完成。
- `apps/example-vue` 的 workspace 接线是否已经通过现有 generated surface 校验。
- 如果要写 completion evidence，是否能逐项给出文件路径或命令结果，而不是只给结论。

## Completion Evidence Skeleton

```json
{
  "version": 1,
  "generatedAt": "2026-05-19T00:00:00.000Z",
  "schemaName": "customer",
  "sourceHandoffManifestPath": ".elysian-generator/customer.vue.module-handoff.json",
  "completedSteps": [],
  "openSteps": [
    "persistence schema review",
    "server module registration",
    "frontend workspace verification"
  ],
  "nonGoals": [
    "Does not rewrite generated handoff manifest.",
    "Does not auto-register server compose.",
    "Does not auto-register frontend workspace."
  ]
}
```
