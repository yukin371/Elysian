# P5A 输入模板（AI -> Schema）

用于把自然语言需求压缩成当前仓库可承接的 `ModuleSchema` 输入，不让 AI 直接跳到运行时实现。

## 使用规则

- 先写业务需求，再写结构化字段草案。
- 当前 handoff 只覆盖 `name`、`label`、`fields`、`searchable`、`options`、`dictionaryTypeCode`。
- 权限、菜单、审批流、通知链路、集成接口等超出 `ModuleSchema` 的需求，必须落到“超出当前 handoff 的要求”段落，不能混入 schema 文件。

## 输入模板

```text
任务目标：
模块中文名：
模块英文名候选：
业务背景：
核心对象：

列表页要求：
- 需要展示哪些字段？
- 哪些字段可搜索？

表单要求：
- 哪些字段必填？
- 哪些字段是枚举/字典？
- 哪些字段是数字、布尔或时间？

字段草案：
- key:
  label:
  kind: id|string|number|boolean|enum|datetime
  required:
  searchable:
  dictionaryTypeCode:
  options:

超出当前 handoff 的要求：
- 权限/菜单：
- 复杂流程：
- 外部集成：
- 其他暂不纳入 generator 的需求：

验收要求：
验证命令：
文档同步要求：
```

## 最低填写要求

- 必须给出一个稳定的模块英文名候选。
- 必须说明至少一个 `id` 字段和 1 个以上业务字段。
- 枚举字段必须给出 `options` 或明确字典来源。
- 若需求包含权限/菜单，只能作为后续事项记录，不能伪装成当前 schema 已支持能力。
