# P5A 输出契约（AI -> Schema Handoff）

## 目标

定义 AI 输出进入 generator 前的最小可接受形态。当前仓库只接受纯 `ModuleSchema` JSON 文件作为 handoff 输入。

## handoff 文件格式

```json
{
  "name": "supplier",
  "label": "Supplier",
  "fields": [
    { "key": "id", "label": "ID", "kind": "id", "required": true },
    { "key": "name", "label": "Name", "kind": "string", "required": true, "searchable": true }
  ]
}
```

## 当前硬约束

- 根节点必须是 JSON object。
- 根节点只允许出现 `name`、`label`、`fields`。
- `name`、`label` 必须是非空字符串。
- `fields` 必须是非空数组。
- 必须且只能有一个 `id` 字段。
- `id` 字段必须满足：
  - `key = "id"`
  - `kind = "id"`
  - `required = true`
- 字段 `key` 不能重复。
- `kind` 只能是：
  - `id`
  - `string`
  - `number`
  - `boolean`
  - `enum`
  - `datetime`
- 字段对象只允许出现：
  - `key`
  - `label`
  - `kind`
  - `required`
  - `searchable`
  - `options`
  - `dictionaryTypeCode`
- `options` 若存在，必须是 `{ label, value }[]`。
- `options` 项只允许出现 `label`、`value`。
- `enum` 字段必须至少提供以下其一：
  - 非空 `options`
  - 非空 `dictionaryTypeCode`
- 任何越出上述集合的键都会被视为 handoff 越界并直接校验失败。

## generator handoff 命令

```powershell
bun --filter @elysian/generator generate --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json --target staging --frontend vue
```

## 当前边界说明

- `--schema-file` 只负责把外部 JSON schema 送入 generator。
- 当 schema 来源是外部文件时，generator 会把 `.schema.ts` 生成为“本地内联 schema artifact”，不会假设该模块已经注册到 `@elysian/schema`。
- 权限、菜单、复杂流程说明必须保留在评审文档或 playbook 备注中，当前不能直接进入 handoff JSON。
- 以下信息即使业务上存在，也必须留在 handoff JSON 之外：
  - 权限点、角色映射、数据权限规则
  - 菜单树、路由、导航分组
  - 审批流、状态机、跨模块编排
  - UI 私有配置、组件库专属属性、展示样式提示

## 失败分类

- 输入缺字段：回到 AI 或人工补全 JSON。
- 输入字段冲突：先修正 `id` 规则、字段重复、错误类型。
- generator 成功但运行时仍缺能力：说明需求已经超出当前 `ModuleSchema` 边界，应回到计划文档拆分。
