# operation-log

`operation-log` 是审计日志的只读查询面，用于浏览和导出既有 `audit_logs` 数据。

> 当前简化边界：当前模块不写日志，只提供列表、详情和 CSV 导出；日志写入仍由 `auth`、`workflow`、`generator-session` 等 owner 在各自成功/失败路径中触发。

## Owns

- `/system/operation-logs` 的列表、详情、CSV 导出。
- 按 `category/action/actorUserId/result` 过滤。
- CSV 序列化与转义。

## Must Not Own

- 审计日志写入 owner。
- 新的日志表或第二套日志模型。
- BI 报表、归档、保留策略平台。

## Depends On

- `../auth`：权限点 `system:operation-log:list/export`。
- `@elysian/persistence`：`audit_logs` 查询 helper。

## Key Flows

```mermaid
flowchart LR
  A[/system/operation-logs] --> B[module.ts]
  B --> C[service.list / getById / exportCsv]
  C --> D[repository.ts]
  D --> E[@elysian/persistence\naudit_logs]
```

## Validation

- `module.ts` 已确认导出接口单独使用 `system:operation-log:export` 权限点。
- `service.ts` 已确认 CSV 只导出既有字段，不引入新的日志 schema。
- `service.ts` 已确认包含逗号、双引号、换行的字段都会做 CSV 转义。
