# P5A 回放与人工接管

## 目标

为 `AI -> Schema` 失败场景提供一个最小、可重复执行的接管流程，不引入交互式 AI 工作流或重型审计基础设施。

## 归档约定

每次 handoff 至少保留两类输入：

- 任务输入文件：按 [p5a-input-template.md](./p5a-input-template.md) 填写
- schema 输出文件：AI 生成或人工修正后的 `*.module-schema.json`

统一输出两类报告：

- `p5a-schema-handoff-report.json`
- `p5a-schema-handoff-summary.md`

## 命令

### 1. 首次判定

```powershell
bun run p5a:handoff:report --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-failed.module-schema.json
```

### 2. 人工修正后重放

```powershell
bun run p5a:handoff:replay --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-fixed.module-schema.json --generate --out ./generated/p5a-replay
```

### 3. 阶段最小闭环验收

```powershell
bun run p5a:acceptance
bun run p5a:acceptance:gate
bun run p5a:acceptance:finalize
```

- 当前默认会同时执行：
  - `p5a:handoff:corpus`
  - `p5a-acceptance-cases.json` 中的多条 replay + generator
- 当前 acceptance case manifest：
  - [p5a-acceptance-cases.json](./examples/p5a-acceptance-cases.json)
- CI 页面可直接查看 acceptance Step Summary 和 `GITHUB_OUTPUT`，不必先下载 artifact 才能判断阶段结果。
- `p5a:acceptance:gate` 会对 acceptance 报告执行独立门禁，当前默认要求至少 `3` 条成功 case，且 generator 成功 case 的 artifact 证据完整。
- `p5a:acceptance:finalize` 适合本地一键收尾；CI 仍保持 acceptance 与 gate 分步执行，避免丢失页面级可见性。
- 用于验证 `P5A` 当前主线是否仍满足“语料分类稳定 + 多条成功 handoff 进入 generator”。

## 失败分类

- `rollback_to_template`
  - 任务输入模板缺段落，说明问题在输入协议层，先回退到模板补齐
- `retry_ai_generation`
  - 顶层 `ModuleSchema` 形态错误，或混入顶层越界元数据，说明 AI 输出失真，先重试 AI
- `manual_fix_required`
  - 顶层结构基本正确，但字段细节有问题，允许人工直接修正 JSON 后重放
- `ready_for_generator`
  - 已满足 handoff 边界，可继续 `--schema-file` 进入 generator

## 当前边界

- 只记录文件级输入、输出与校验结果
- 不记录对话逐轮 token 级日志
- 不引入数据库审计或交互式回放 UI
- handoff JSON 仍然只接受纯 `ModuleSchema`；若出现权限、菜单、流程、UI 私有元数据，必须判定为越界输入并回退修正
- 失败语料基线：
  - `p5a-top-level-out-of-bound.module-schema.json` -> `retry_ai_generation`
  - `p5a-malformed.module-schema.txt` -> `retry_ai_generation`
  - `p5a-failed.module-schema.json` -> `manual_fix_required`
  - `p5a-service-ticket-out-of-bound.module-schema.json` -> `manual_fix_required`

## 推荐流程

1. 固定任务输入文本。
2. 生成或接收 schema JSON。
3. 执行 `p5a:handoff:report`。
4. 若失败，按 `decision` 处理：
   - `rollback_to_template`：补输入模板
   - `retry_ai_generation`：重试 AI
   - `manual_fix_required`：人工修 JSON
5. 修正后执行 `p5a:handoff:replay --generate`。
