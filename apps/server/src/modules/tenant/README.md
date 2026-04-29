# tenant

`tenant` 负责租户元数据管理，是跨租户后台管理入口，不是 tenant 初始化/发布平台本身。

> 当前简化边界：当前模块只管理 `tenants` 元数据和状态；`tenant:init` CLI、发布演练和升级 runbook 不在此模块内。

## Owns

- `/system/tenants` 的列表、详情、创建、更新、状态切换。
- super-admin 才能访问的租户管理入口。
- repository 侧的“暂时清空 tenant context 再操作 tenants 表”桥接。

## Must Not Own

- tenant 初始化 CLI owner。
- tenant 发布/升级编排平台。
- 普通租户用户的自服务管理门户。

## Depends On

- `../auth`：权限点 `system:tenant:list/create/update` 与 `isSuperAdmin` 判断。
- `@elysian/persistence`：tenants helper、tenant context clear/reset。
- `@elysian/schema`：租户记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/tenants] --> B[module.ts\npermission + super-admin]
  B --> C[service.ts\ncode/name/status]
  C --> D[repository.ts]
  D --> E[clearTenantContext]
  D --> F[@elysian/persistence\ntenants]
  D --> G[resetTenantContext]
```

## Validation

- `module.ts` 已确认即使通过权限码，也还要再经过 `assertSuperAdmin(identity)`。
- `service.ts` 已确认 `code/name` 非空、`code` 唯一，状态更新也会先检查 tenant 是否存在。
- `repository.ts` 已确认租户管理必须绕过请求级 tenant filter，否则 super-admin 无法跨租户管理。
