# Phase 3C File Module Kickoff

更新时间：`2026-04-22`

> 说明：本文件是 `Phase 3C` 的首轮实施计划，只描述文件模块这一轮的边界、owner 与验证方式。阶段状态以 [../roadmap.md](../roadmap.md) 为准。

## 当前进展

- `WP-3C-1` 已完成：确认 `P3C` 首个入口为文件模块，通知模块延后
- `WP-3C-2` 已完成：`packages/schema/src/file.ts` 已新增 `fileModuleSchema`
- `WP-3C-3` 已完成：`packages/persistence/src/schema/file.ts`、`packages/persistence/src/file.ts` 已补文件元数据 schema、migration 与 CRUD helper
- `WP-3C-4` 已完成：`apps/server/src/modules/file` 已打通上传、列表、详情、下载、删除最小闭环
- `WP-3C-5` 已完成：默认 auth seed 已新增 `system:file:(list|upload|download|delete)` 权限点与 `/system/files` 菜单
- `WP-3C-6` 已完成：server 测试、seed 测试与示例导航占位已补齐
- 下一轮进入通知模块边界验证

## 目标

在不引入对象存储、消息队列等重型基础设施的前提下，先验证文件模块的最小工程边界：文件元数据进入 `packages/persistence`，二进制存储适配器留在 `apps/server`，并完成最小上传 / 下载流程。

## 范围

本轮已完成的范围：

- 补齐文件模块的 `schema -> persistence -> server` 最小闭环
- 使用本地磁盘存储适配器验证上传 / 下载流程，不引入外部对象存储
- 复用既有 auth guard、默认 RBAC seed、系统菜单与 `packages/persistence` owner
- 验证 `/system/files` 路由、权限点命名和系统菜单路径一致

## 本轮不做

- 多存储后端切换
- 文件预览、缩略图、断点续传
- 文件版本化、标签、目录树
- 通知模块完整实现

## Canonical Owners

- 文件模块 schema：`packages/schema`
- 文件元数据持久化：`packages/persistence`
- 本地磁盘存储适配器与运行时路径：`apps/server`
- 文件 HTTP 模块与权限接入：`apps/server`

## 完成标准

- `/system/files` 上传、列表、详情、下载、删除接口可用
- 文件元数据进入数据库 owner，文件体不侵入 `packages/persistence`
- 默认 RBAC seed、系统菜单和示例导航占位已对齐
- 本轮不引入新的重复 owner 或 shared helper 桶文件

## 风险

- 如果把磁盘 I/O 塞进 `packages/persistence`，会混淆 DB owner 与 runtime storage owner
- 如果过早抽象对象存储协议，会在仓库尚未进入生产强化前引入过重基础设施
- 如果后续文件导出 / 预览直接绕过模块边界，会让权限与审计接入再次分散
