# generator-session

`generator-session` 负责把 generator preview/apply 过程包装成可查询的后端 session 运行时。

> 当前简化边界：只支持已注册 schema、`staging` 目标目录和 `vue/react` 前端目标；它是“生成预览与应用记录中心”，不是通用低代码 studio 编排平台。

## Owns

- `/studio/generator/sessions` 的列表、详情、preview 创建、staging apply。
- preview report 的落盘、session 元数据持久化、apply evidence 回传。
- blocking conflict / stale report / apply conflict 的运行时错误语义。
- generator 审计的 best-effort 写入。

## Must Not Own

- `@elysian/generator` 的模板规则 owner。
- 正式 migration owner、正式 merge 审批平台。
- 任意目录写入和任意 schema 来源的通用平台化承诺。

## Depends On

- `../auth`：当前 identity 与可选鉴权。
- `@elysian/generator`：`buildGenerationPreviewReport`、`applyGenerationPreviewReport`、schema registry、target preset 解析。
- `@elysian/persistence`：preview session 表。

## Key Flows

```mermaid
flowchart LR
  A[POST /studio/generator/sessions/preview] --> B[module.ts]
  B --> C[service.createPreviewSession]
  C --> D[@elysian/generator\nbuild preview report]
  C --> E[write *.preview.json]
  C --> F[repository.createPreviewSession]
  F --> G[@elysian/persistence]
```

```mermaid
flowchart TD
  Apply[POST /sessions/:id/apply] --> Load[load session + report]
  Load --> Guard{status=ready\nand no blocking conflicts?}
  Guard -->|yes| Run[@elysian/generator\napply preview report]
  Run --> Mark[markPreviewSessionApplied]
  Mark --> Audit[best-effort audit]
  Guard -->|no| Conflict[409 AppError]
```

## Validation

- `service.ts` 已确认 preview 前必须在 generator registry 中找到 schema，否则返回 `GENERATOR_SCHEMA_NOT_FOUND`。
- `service.ts` 已确认 apply 前必须满足 `status=ready` 且无 blocking conflicts。
- `service.ts` 已确认 stale report 与 apply conflict 会分流成 `GENERATOR_SESSION_STALE` / `GENERATOR_SESSION_APPLY_CONFLICT`。
- `repository.ts` 已确认持久化 session 需要 `tenantId`，详情读取依赖落盘的 preview report。
