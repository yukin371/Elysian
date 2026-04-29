# notification

`notification` 负责站内通知的最小后端闭环，包括列表、详情、创建和已读标记。

> 当前简化边界：当前只覆盖站内通知和读/未读语义；未实现邮件、短信、WebSocket、消息队列或模板中心。

## Owns

- `/system/notifications` 的列表、详情、创建、标记已读。
- 通知接收人、标题、内容的最小校验。
- 基于 `dataAccess` 的部门/创建人可见性过滤。

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
  B --> C[service.ts\nrecipient/title/content]
  C --> D[repository.ts\ndataAccess bridge]
  D --> E[notifications]
  D --> F[users]
```

## Validation

- `service.ts` 已确认创建前必须先校验 `recipientUserId` 是否存在。
- `service.ts` 已确认 `markAsRead` 会先读取当前记录；已读记录直接返回，不重复制造状态变化。
- `repository.ts` 已确认列表、详情、标记已读都可挂接 `buildDataAccessCondition`。
