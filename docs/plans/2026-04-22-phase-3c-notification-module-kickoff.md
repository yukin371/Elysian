# Phase 3C Notification Module Kickoff

更新时间：`2026-04-22`

> 说明：本文件是 `Phase 3C` 的第二轮实施计划，只描述通知模块这一轮的边界、owner 与验证方式。阶段状态以 [../roadmap.md](../roadmap.md) 为准。

## 当前进展

- `WP-3C-7` 已完成：确认通知模块只承接站内通知数据与已读未读语义，不引入外部推送基础设施
- `WP-3C-8` 已完成：`packages/schema/src/notification.ts` 已新增 `notificationModuleSchema`
- `WP-3C-9` 已完成：`packages/persistence/src/schema/notification.ts`、`packages/persistence/src/notification.ts` 已补通知 schema、migration 与 CRUD / 标记已读 helper
- `WP-3C-10` 已完成：`apps/server/src/modules/notification` 已打通列表、详情、创建、标记已读最小闭环
- `WP-3C-11` 已完成：默认 auth seed 已新增 `system:notification:(list|create|update)` 权限点与 `/system/notifications` 菜单
- `WP-3C-12` 已完成：server 测试、seed 测试与示例导航占位已补齐
- `Phase 3C` 文件 / 通知两个 IO 与协作模块的首轮后端闭环已完成

## 目标

在不引入短信、邮件、WebSocket、消息队列等外部推送基础设施的前提下，先验证通知模块的最小工程边界：通知数据进入 `packages/persistence`，已读未读语义收敛到 server service，并完成最小站内通知闭环。

## 范围

本轮已完成的范围：

- 补齐通知模块的 `schema -> persistence -> server` 最小闭环
- 使用站内通知模型验证 `列表 / 详情 / 创建 / 标记已读`
- 复用既有 auth guard、默认 RBAC seed、系统菜单与 `packages/persistence` owner
- 验证 `/system/notifications` 路由、权限点命名和系统菜单路径一致

## 本轮不做

- 邮件、短信、WebSocket、消息队列投递
- 通知模板、批量发送、广播组装
- 通知撤回、归档、优先级编排

## Canonical Owners

- 通知模块 schema：`packages/schema`
- 通知数据持久化：`packages/persistence`
- 通知 HTTP 模块与权限接入：`apps/server`

## 完成标准

- `/system/notifications` 列表、详情、创建、标记已读接口可用
- 通知数据进入数据库 owner，不复用 `audit_logs`
- 默认 RBAC seed、系统菜单和示例导航占位已对齐
- 本轮不引入新的重复 owner 或 shared helper 桶文件

## 风险

- 如果把通知直接挂到 `audit_logs`，会混淆审计记录和用户可见通知语义
- 如果过早引入消息队列或多通道投递，会在仓库尚未进入生产强化前把边界做重
- 如果后续用户侧收件箱能力绕过通知 owner 直接从其他表拼装，会让已读未读语义再次分散
