# notification

`notification` 负责站内通知的最小后端闭环，包括列表、详情、导出、创建、单条已读和批量已读标记。

> 当前简化边界：当前只覆盖站内通知和读/未读语义；未实现邮件、短信、WebSocket、消息队列或模板中心。

## Owns

- `/system/notifications` 的列表、分页元数据、详情、当前筛选导出、创建、单条已读、批量已读。
- 通知接收人、标题、内容的最小校验。
- 基于 `dataAccess` 的部门/创建人可见性过滤。
- 通知筛选字段 `recipientUserId / title / content / level / status` 的列表与导出一致性。
- 通知列表 `page / pageSize` 的最小服务端分页语义。

## Must Not Own

- 外部投递通道、重试队列、消息模板平台。
- 用户收件箱前端状态。
- 审计日志 owner。

## Depends On

- `../auth`：权限点 `system:notification:list/create/update` 与 `dataAccess`。
- `@elysian/persistence`：notifications helper、user lookup、data access condition。
- `@elysian/schema`：通知记录契约。

## Key Flows

```mermaid
flowchart LR
  A[/system/notifications] --> B[module.ts]
  A2[/system/notifications/export] --> B
  B --> C[service.ts\nrecipient/title/content/exportCsv]
  C --> D[repository.ts\ndataAccess bridge]
  D --> E[notifications]
  D --> F[users]
```

## Validation

- `service.ts` 已确认创建前必须先校验 `recipientUserId` 是否存在。
- `service.ts` 已确认导出只读取站内通知元数据并生成 CSV，不接管公告中心或外部投递语义。
- `service.ts` 已确认 `markAsRead` 会先读取当前记录；已读记录直接返回，不重复制造状态变化。
- 批量已读只接收显式通知 ID 列表，不在通知模块内引入批处理平台或外部投递语义。
- `repository.ts` 已确认列表、详情、标记已读都可挂接 `buildDataAccessCondition`。
- `repository.ts` 已确认通知列表返回 `items + total + page + pageSize + totalPages`，且当前筛选导出继续复用同一筛选字段但不复用分页切片。
