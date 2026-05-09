# setting

`setting` 负责配置项的后台 CRUD，是配置项管理面，不是 server runtime 配置 owner，也不是完整的系统设置中心。

> 当前推荐对外命名：中文使用“配置项管理 / 配置项”，英文使用 `Config Entries / Config Entry`。内部模块 code、路由、权限前缀继续保留 `setting`。
>
> 当前简化边界：模块对外只暴露配置项 CRUD；`tenant fallback` helper 已存在于 repository/persistence 层，但当前并没有把“按 tenant 回退读取”公开成独立 HTTP API。

## Owns

- `/system/settings` 的列表、详情、创建、更新。
- 配置列表 `page / pageSize` 的最小服务端分页语义。
- `key/value` 的必填和唯一性校验。
- 配置描述文本的最小规范化。
- 配置项仓库边界的最小澄清，不把 runtime config 或系统设置中心语义混入当前模块。

## Must Not Own

- `apps/server/src/config` 的运行时环境配置 owner。
- 配置缓存、热更新、分布式配置中心。
- 跨 tenant 覆盖策略的统一平台宣称。
- 配置消费注册、自动生效与完整系统设置中心。

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

## Boundary Summary

当前仓库需要把三层概念分开：

1. `Runtime Config`
   owner: `apps/server/config`
   例如 `DATABASE_URL`、token secret、限流与 CORS 环境变量。
2. `Setting 配置项仓库`
   owner: 当前 `setting` 模块和 persistence helper。
   适合品牌名、支持邮箱、默认时区、轻量阈值和纯文本 URL。
3. `System Settings Center`
   当前未实现；若未来进入主线，还需分组、schema、默认值、消费注册和生效机制。

一句话边界：

`setting` 当前只负责“把配置项存起来并提供 CRUD”，不负责“让系统自动理解这些配置项”。

## Validation

- `service.ts` 已确认 `key/value` 都会先 trim，再做非空和唯一性校验。
- `repository.ts` 已确认配置列表返回 `items + total + page + pageSize + totalPages`，当前导出继续复用同一 owner 但不复用分页切片。
- `repository.ts` 已确认存在 `getByKeyWithTenantFallback(key, tenantId)` 能力，但它仍属于 persistence 桥接，不等于公开 API 能力。
- 当前模块路由仅覆盖 CRUD，没有把 runtime `config` owner 混进配置项模块。
