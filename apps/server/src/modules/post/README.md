# post

`post` 负责岗位（post）的标准 CRUD，是当前若依基础能力对齐中的一个系统主数据模块。

## Owns

- `/system/posts` 的列表、详情、创建、更新。
- 岗位 `code/name` 的必填与唯一性校验。
- `remark` 的最小规范化。

## Must Not Own

- 用户-岗位复杂关系、审批或排班语义。
- 组织树 owner。
- 通用字典/配置中心能力。

## Depends On

- `../auth`：权限点 `system:post:list/create/update`。
- `@elysian/persistence`：posts helper。
- `@elysian/schema`：岗位记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/posts] --> B[module.ts]
  B --> C[service.ts\ncode/name/remark]
  C --> D[repository.ts]
  D --> E[@elysian/persistence\nposts]
```

## Validation

- `service.ts` 已确认 `code/name` 先 trim，再做非空和唯一校验。
- `service.ts` 已确认 `remark` 会被规范为字符串，避免把空白文本当成有效业务含义。
- `repository.ts` 已确认岗位模块目前只桥接 `posts` 持久化，不混入用户或部门关系。
