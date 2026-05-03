# OpenAPI Generated Types

- `openapi.json`：由 `apps/server` 的 in-memory OpenAPI fixture 导出的完整规范快照
- `openapi-types.d.ts`：基于 `openapi-typescript` 生成的并行前端类型

当前这里仍是并行类型源，不是 `platform-api` 的 canonical owner。

刷新命令：

```bash
bun run openapi:types:generate
```
