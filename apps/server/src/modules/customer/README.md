# customer

`customer` 是首个真实业务模块，当前提供客户的最小 CRUD 和数据范围过滤。

> 当前简化边界：当前运行态只覆盖 `name/status` 两个业务字段；部门、创建人、tenant 信息来自当前 identity，用于数据范围过滤而不是复杂业务建模。

## Owns

- `/customers` 的列表、详情、创建、更新、删除。
- customer 路由级权限点：`customer:customer:list/create/update/delete`。
- 名称必填、not-found、数据范围透传等最小业务校验。

## Must Not Own

- 客户 schema owner、客户数据库 helper owner。
- 通用数据权限框架本身。
- 跨模块的审批、文件、通知等扩展语义。

## Depends On

- `../auth`：权限校验与 `identity.dataAccess`。
- `@elysian/persistence`：customers helper、data access condition。
- `@elysian/schema`：`customerModuleSchema` 与记录类型。

## Key Flows

```mermaid
flowchart LR
  A[/customers routes] --> B[module.ts\npermission + DTO]
  B --> C[service.ts\ntrim + not-found]
  C --> D[repository.ts\ndataAccess bridge]
  D --> E[@elysian/persistence\ncustomers]
```

## Validation

- `module.ts` 已确认创建时会把 `deptId / creatorId / tenantId` 从当前 identity 注入，而不是由客户端直写。
- `service.ts` 已确认 `name` 会被 trim，空字符串返回 `CUSTOMER_NAME_REQUIRED`。
- `repository.ts` 已确认列表、详情、更新、删除都可挂接 `buildDataAccessCondition`，不会在模块层重写数据权限。
