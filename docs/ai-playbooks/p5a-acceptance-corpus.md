# P5A 验收语料

用于验证 `AI -> Schema -> generator` 的最小闭环。当前语料只覆盖仓库已经具备 canonical owner 的 `ModuleSchema` 范围。

## 批量回归命令

- `bun run p5a:handoff:corpus --manifest ./docs/ai-playbooks/examples/p5a-handoff-corpus.json`
- 当前 corpus 会同时覆盖：
  - `ready_for_generator`
  - `rollback_to_template`
  - `retry_ai_generation`
  - `manual_fix_required`

## 阶段验收命令

- `bun run p5a:acceptance`
- `bun run p5a:acceptance:gate`
- `bun run p5a:acceptance:finalize`
- 当前 acceptance 会同时执行：
  - `p5a:handoff:corpus`
  - `p5a-acceptance-cases.json` 中的多条 replay + generator case
- 当前 finalize 会顺序执行：
  - `p5a:acceptance`
  - `p5a:acceptance:gate`
- 适用边界：
  - 本地或脚本侧一键收尾，避免只跑 acceptance 忘记补 gate
  - CI 仍保留分步执行，保证作业页面可直接看到 acceptance 与 gate 的独立结果
- 当前 acceptance manifest：
  - [p5a-acceptance-cases.json](./examples/p5a-acceptance-cases.json)
- CI 运行时还会输出：
  - GitHub Step Summary
  - `p5a_acceptance_status` / `p5a_acceptance_case_count` / `p5a_acceptance_replay` / `p5a_acceptance_generator`
- 当前 acceptance gate 会额外输出：
  - `p5a_acceptance_gate_status`
  - `p5a_acceptance_gate_case_count`
  - `p5a_acceptance_gate_min_case_count`
  - `p5a_acceptance_gate_generated_artifact_coverage`
- 当前默认 gate policy：
  - 至少 `3` 条成功 replay + generator case
  - 每条 generator 成功 case 都必须保留 `generatedSchemaArtifactPath`

## Case 1: 标准 CRUD 模块

- 目标：验证标准文本 + 状态枚举模块可以稳定 handoff。
- 输入摘要：
  - 模块：供应商管理
  - 需要名称、联系人邮箱、状态、创建/更新时间
  - 列表页支持按名称和状态搜索
- 期望 handoff：
  - [supplier.module-schema.json](./examples/supplier.module-schema.json)
- 对应任务输入：
  - [p5a-complete-task-input.txt](./examples/p5a-complete-task-input.txt)
- 验收命令：
  - `bun --filter @elysian/generator generate --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json --target staging --frontend vue`

## Case 2: 带布尔与时间字段的模块

- 目标：验证布尔/时间字段不会被错误降级成字符串。
- 输入摘要：
  - 模块：访客通行证
  - 需要访客姓名、是否已签署保密协议、到访时间、状态
- 对应任务输入：
  - [p5a-visitor-pass-task-input.txt](./examples/p5a-visitor-pass-task-input.txt)
- 期望 handoff：
  - [visitor-pass.module-schema.json](./examples/visitor-pass.module-schema.json)
- 验收重点：
  - `hasNda` 保持 `boolean`
  - `visitAt` 保持 `datetime`

## Case 3: 带数字字段和超界需求备注的模块

- 目标：验证 AI 能把可 handoff 的字段留下，同时把权限/菜单要求留在备注，而不是伪造成 schema 能力。
- 输入摘要：
  - 模块：资产台账
  - 需要资产编号、资产名称、状态、原值、采购日期
  - 业务方还要求“自动挂菜单、自动生成角色权限”
- 对应任务输入：
  - [p5a-asset-task-input.txt](./examples/p5a-asset-task-input.txt)
- 期望 handoff：
  - [asset.module-schema.json](./examples/asset.module-schema.json)
- 额外要求：
  - 权限/菜单需求只能记为评审备注，不进入当前 handoff JSON

## Case 4: 带字典映射与混合字段类型的模块

- 目标：验证字典字段、布尔字段、数字字段和时间字段可以稳定混合进入 handoff，而不会把 UI 私有配置混进 JSON。
- 输入摘要：
  - 模块：服务工单
  - 需要工单编号、标题、优先级、是否上门、预计处理时长、计划处理时间、当前状态
  - 业务方还要求自动通知、工单看板和权限菜单
- 对应任务输入：
  - [p5a-service-ticket-task-input.txt](./examples/p5a-service-ticket-task-input.txt)
- 期望 handoff：
  - [service-ticket.module-schema.json](./examples/service-ticket.module-schema.json)
- 额外要求：
  - `priority` 保持字典映射能力，但不把通知、看板、权限菜单写进 handoff JSON

## Failure Case 1: 顶层越界元数据

- 目标：验证 AI 把权限、菜单、流程元数据直接塞进 handoff JSON 时，会被判定为 `retry_ai_generation`，而不是误判为人工微调。
- 失败样例：
  - [p5a-top-level-out-of-bound.module-schema.json](./examples/p5a-top-level-out-of-bound.module-schema.json)
- 期望决策：
  - `retry_ai_generation`
- 验收命令：
  - `bun run p5a:handoff:report --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-top-level-out-of-bound.module-schema.json`

## Failure Case 2: 非法 JSON

- 目标：验证 handoff 文件不是合法 JSON 时，会在报告阶段被直接判定为 `retry_ai_generation`。
- 失败样例：
  - [p5a-malformed.module-schema.txt](./examples/p5a-malformed.module-schema.txt)
- 期望决策：
  - `retry_ai_generation`
- 验收命令：
  - `bun run p5a:handoff:report --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-malformed.module-schema.txt`

## Failure Case 3: 字段级可人工修正错误

- 目标：验证字段重复、枚举选项缺失等“局部接近正确”的输出，仍落到 `manual_fix_required`。
- 失败样例：
  - [p5a-failed.module-schema.json](./examples/p5a-failed.module-schema.json)
- 修正样例：
  - [p5a-fixed.module-schema.json](./examples/p5a-fixed.module-schema.json)
- 期望决策：
  - 首次报告：`manual_fix_required`
  - 修正后重放：`ready_for_generator`

## Failure Case 4: 字段级越界元数据

- 目标：验证字段级或 option 级的 UI 私有配置越界时，仍然落到 `manual_fix_required`，而不是误判成需要重试 AI。
- 失败样例：
  - [p5a-service-ticket-out-of-bound.module-schema.json](./examples/p5a-service-ticket-out-of-bound.module-schema.json)
- 期望决策：
  - `manual_fix_required`

## 通过标准

1. 所有样例 JSON 均通过 `ModuleSchema` runtime 校验。
2. `p5a:acceptance` 必须能稳定跑通多条 replay/generator case，而不只是一条单例样例。
3. 任一含超界需求的 case，都必须把“超出当前 handoff 的要求”留在文档层，而不是改写 schema owner。
4. 顶层越界元数据和非法 JSON 必须稳定落入 `retry_ai_generation`。
5. 字段级局部错误必须稳定落入 `manual_fix_required`，并可通过人工修正后进入 replay。
6. 字段级或 option 级越界元数据必须稳定落入 `manual_fix_required`，不能被误分类为 `retry_ai_generation`。
7. `p5a-handoff-corpus.json` 中的所有 case 必须通过预期分类校验。
8. `p5a:acceptance:gate` 必须维持至少 `3` 条成功 acceptance case，且 generator 成功 case 的 artifact 证据完整。
9. `p5a:acceptance:finalize` 必须能稳定串联 acceptance 与 gate，而不引入第二套验收来源。
