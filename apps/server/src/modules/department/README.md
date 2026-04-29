# department

`department` 负责组织部门树和部门成员关联的最小后端闭环。

## Owns

- `/system/departments` 的列表、详情、创建、更新。
- 部门编码/名称校验、父子关系校验、环路检测。
- 部门与用户关联的最小一致性检查。

## Must Not Own

- 用户 owner、组织数据权限引擎 owner。
- 前端树控件、组织图展示逻辑。
- 跨模块 shared tree helper。

## Depends On

- `../auth`：权限点 `system:department:list/create/update`。
- `@elysian/persistence`：departments、user_departments、users helper。
- `@elysian/schema`：部门记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/departments] --> B[module.ts]
  B --> C[service.ts\ncode/name/parent/userIds]
  C --> D[repository.ts]
  D --> E[departments]
  D --> F[user_departments + users]
```

## Validation

- `service.ts` 已确认创建和更新都会检查 `code` 唯一、`name` 非空。
- `service.ts` 已确认 `parentId` 不能指向自己，也不能形成循环。
- `service.ts` 已确认 `userIds` 会先去重排序，再通过 repository 校验是否都存在。
- `repository.ts` 已确认用户关联替换仍在 persistence owner 内完成。
