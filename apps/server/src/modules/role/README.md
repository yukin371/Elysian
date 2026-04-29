# role

`role` 负责角色元数据、权限绑定、用户绑定和部门数据范围的最小后端闭环。

## Owns

- `/system/roles` 的列表、详情、创建、更新。
- 角色 `code/name` 校验、系统角色不可变约束。
- `permissionCodes / userIds / deptIds / dataScope` 的最小引用检查。

## Must Not Own

- 权限码定义 owner、用户 owner、部门 owner。
- 更复杂的授权策略编排器。
- 前端角色授权工作区。

## Depends On

- `../auth`：权限点 `system:role:list/create/update`。
- `@elysian/persistence`：roles、role_permissions、user_roles、role_depts、lookup helper。
- `@elysian/schema`：`RoleDataScope` 与角色记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/roles] --> B[module.ts]
  B --> C[service.ts\ncode/name/system/dataScope]
  C --> D[repository.ts]
  D --> E[roles]
  D --> F[role_permissions]
  D --> G[user_roles]
  D --> H[role_depts]
```

## Validation

- `service.ts` 已确认 `dataScope` 只接受 `1..5` 的既有范围。
- `service.ts` 已确认系统角色不能改 `code`、`status`，也不能取消 `isSystem`。
- `service.ts` 已确认权限码、用户 ID、部门 ID 都必须先存在。
- `repository.ts` 已确认关联替换仍在 persistence owner 内完成，而不是在模块层手写 SQL 逻辑。
