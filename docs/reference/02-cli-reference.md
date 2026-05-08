# CLI 参考

本页只收录当前仓库里真正可执行的生成相关入口。

## 生成入口

| 场景 | 命令 | 输入 | 说明 |
|---|---|---|---|
| 人类边界模式 | `bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue` | 已注册 schema 名称 | 走现有注册 schema 入口，适合边界明确、无需编辑 JSON 的情况。 |
| 前端 JSON 输入 | `bun --filter @elysian/generator generate --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json --target staging --frontend vue` | 外部 `ModuleSchema` JSON 文件 | 适合前端页面粘贴或编辑后提交的 schema 草稿。 |
| 预览回放 | `bun run p5a:handoff:replay --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-fixed.module-schema.json --generate --out ./generated/p5a-replay` | AI / 人工修正后的 handoff 文件 | 先做校验，再进入 generator。 |
| 代码生成预览 | `bun run example-vue:workspace-registry:generate` | workspace registry artifact | 生成示例应用的 workspace registry。 |
| 标准 CRUD surface | `bun run example-vue:standard-crud-surfaces:generate` | registry 驱动的标准 CRUD 模块 | 生成示例应用的标准 CRUD 前端 surface。 |
| 数据库迁移 | `bun run db:generate` | persistence owner 的变更计划 | 仍然是 persistence owner 的正式迁移入口。 |

## 常见组合

```powershell
# 先从 AI handoff / 前端 JSON 入手，再做生成预览
bun run p5a:handoff:report --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-failed.module-schema.json
bun run p5a:handoff:replay --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-fixed.module-schema.json --generate --out ./generated/p5a-replay
```

```powershell
# 人类边界模式：直接基于已注册 schema 生成
bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue
```

## 约束

- `registered-schema` 是人类边界模式，适合直接选已注册 schema。
- `manual-schema-json` 适合前端输入和 AI 编辑后的 JSON 草稿，必须先通过 `ModuleSchema` 校验。
- 当前 generator 仍然不负责正式 migration owner；正式迁移入口仍在 `packages/persistence`。
