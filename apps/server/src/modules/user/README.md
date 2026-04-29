# user

`user` 负责后台用户主数据和密码重置接口，密码 hash 能力复用 `auth` owner。

## Owns

- `/system/users` 的列表、详情、创建、更新、重置密码。
- 用户名、显示名、密码的最小校验。
- 用户名唯一性检查。

## Must Not Own

- 登录流程、session 管理、权限校验规则 owner。
- 角色/部门/岗位等其他主数据 owner。
- 独立密码策略平台。

## Depends On

- `../auth`：权限点 `system:user:list/create/update/reset-password` 与 `createPasswordHash`。
- `@elysian/persistence`：users helper。
- `@elysian/schema`：用户记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/users] --> B[module.ts]
  B --> C[service.ts\nusername/displayName/password]
  C --> D[createPasswordHash]
  C --> E[repository.ts]
  E --> F[@elysian/persistence\nusers]
```

## Validation

- `service.ts` 已确认创建时 `username/displayName/password` 都必须是非空 trim 后值。
- `service.ts` 已确认重置密码只负责重算 hash 并调用 repository，不重做登录/session 逻辑。
- `service.ts` 已确认用户名冲突会返回 `USER_USERNAME_CONFLICT`。
