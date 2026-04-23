# P5A 验收语料

用于验证 `AI -> Schema -> generator` 的最小闭环。当前语料只覆盖仓库已经具备 canonical owner 的 `ModuleSchema` 范围。

## Case 1: 标准 CRUD 模块

- 目标：验证标准文本 + 状态枚举模块可以稳定 handoff。
- 输入摘要：
  - 模块：供应商管理
  - 需要名称、联系人邮箱、状态、创建/更新时间
  - 列表页支持按名称和状态搜索
- 期望 handoff：
  - [supplier.module-schema.json](./examples/supplier.module-schema.json)
- 验收命令：
  - `bun --filter @elysian/generator generate --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json --target staging --frontend vue`

## Case 2: 带布尔与时间字段的模块

- 目标：验证布尔/时间字段不会被错误降级成字符串。
- 输入摘要：
  - 模块：访客通行证
  - 需要访客姓名、是否已签署保密协议、到访时间、状态
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
- 期望 handoff：
  - [asset.module-schema.json](./examples/asset.module-schema.json)
- 额外要求：
  - 权限/菜单需求只能记为评审备注，不进入当前 handoff JSON

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

## 通过标准

1. 所有样例 JSON 均通过 `ModuleSchema` runtime 校验。
2. 至少 `supplier.module-schema.json` 能通过 `--schema-file` 走完整 generator CLI。
3. 任一含超界需求的 case，都必须把“超出当前 handoff 的要求”留在文档层，而不是改写 schema owner。
4. 顶层越界元数据和非法 JSON 必须稳定落入 `retry_ai_generation`。
5. 字段级局部错误必须稳定落入 `manual_fix_required`，并可通过人工修正后进入 replay。
