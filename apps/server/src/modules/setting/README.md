# setting

`setting` 负责系统配置项的后台 CRUD，是配置数据管理面，不是 server runtime 配置 owner。

> 当前简化边界：模块对外只暴露配置项 CRUD；`tenant fallback` helper 已存在于 repository/persistence 层，但当前并没有把“按 tenant 回退读取”公开成独立 HTTP API。

## Owns

- `/system/settings` 的列表、详情、创建、更新。
- `key/value` 的必填和唯一性校验。
- 配置描述文本的最小规范化。

## Must Not Own

- `apps/server/src/config` 的运行时环境配置 owner。
- 配置缓存、热更新、分布式配置中心。
- 跨 tenant 覆盖策略的统一平台宣称。

## Depends On

- `../auth`：权限点 `system:setting:list/create/update`。
- `@elysian/persistence`：settings helper，以及 repository 内部的 tenant fallback helper。
- `@elysian/schema`：配置记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/settings] --> B[module.ts]
  B --> C[service.ts\nkey/value]
  C --> D[repository.ts]
  D --> E[@elysian/persistence\nsystem_settings]
  D --> F[getSettingWithTenantFallback\ninternal helper]
```

## Validation

- `service.ts` 已确认 `key/value` 都会先 trim，再做非空和唯一性校验。
- `repository.ts` 已确认存在 `getByKeyWithTenantFallback(key, tenantId)` 能力，但它仍属于 persistence 桥接，不等于公开 API 能力。
- 当前模块路由仅覆盖 CRUD，没有把 runtime `config` owner 混进系统配置模块。
