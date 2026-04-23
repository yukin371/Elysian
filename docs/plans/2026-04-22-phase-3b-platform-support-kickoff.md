# Phase 3B Platform Support Kickoff

更新时间：`2026-04-22`

> 说明：本文件是 `Phase 3B` 的短期实施计划，只描述当前活跃 work package 与验证边界。阶段状态以 [../roadmap.md](../roadmap.md) 为准。

## 当前进展

- `WP-3B-1` 已完成：`packages/schema/src/dictionary.ts` 已新增 `dictionaryModuleSchema`
- `WP-3B-2` 已完成：`packages/persistence/src/schema/dictionary.ts`、`packages/persistence/src/dictionary.ts` 已补 `dictionary_types / dictionary_items` schema、migration 与 CRUD helper
- `WP-3B-3` 已完成：`apps/server/src/modules/dictionary` 已落最小 HTTP 模块并接入 auth guard
- `WP-3B-4` 已完成：默认 auth seed 已补 `system:dictionary:(list|create|update)` 权限点与 `/system/dictionaries` 菜单
- `WP-3B-5` 已完成：server / seed 测试与示例导航占位已补齐
- 第二轮已完成：`packages/schema/src/setting.ts`、`packages/persistence/src/schema/setting.ts`、`packages/persistence/src/setting.ts`、`apps/server/src/modules/setting` 已打通系统配置最小后端闭环
- 默认 auth seed 已新增 `system:setting:(list|create|update)` 权限点与 `/system/settings` 菜单
- 第三轮已完成：`packages/schema/src/operation-log.ts`、`apps/server/src/modules/operation-log` 已打通操作日志只读闭环，并复用既有 `audit_logs` owner 暴露列表、详情、CSV 导出
- 默认 auth seed 已新增 `system:operation-log:(list|export)` 权限点与 `/system/operation-logs` 菜单
- `Phase 3B` 三个平台支撑模块的首轮后端闭环已完成

## 目标

在正式铺开字典 / 配置 / 操作日志三个平台支撑模块前，以三个代表性平台模块验证当前 system module、persistence owner、RBAC seed 与前端系统导航占位是否已具备继续扩展的稳定边界。

## 范围

本轮已完成的范围：

- 补齐字典类型、字典项的 `schema -> persistence -> server` 最小闭环
- 复用既有 auth guard、默认 RBAC seed、系统菜单与 `packages/persistence` owner
- 验证 `/system/dictionaries/types`、`/system/dictionaries/items` 路由、权限点命名和系统菜单路径一致
- 补齐系统配置 `schema -> persistence -> server` 最小闭环，并保持 `setting` 与 runtime `config` owner 隔离
- 补齐操作日志只读 `server -> persistence` 闭环，并验证沿用 `audit_logs` owner 不产生重复日志域

## 本轮不做

- 字典导入导出、批量排序、版本化
- 前端正式字典管理页面
- generator 正式消费字典 API
- 操作日志分页、时间区间筛选与大批量导出治理

## Canonical Owners

- 字典模块 schema：`packages/schema`
- 字典关系型持久化 helper：`packages/persistence`
- 字典 HTTP 模块与权限接入：`apps/server`
- 系统导航协议：`packages/ui-core`
- Vue 预设层与企业组件映射：`packages/frontend-vue`、`packages/ui-enterprise-vue`

## 完成标准

- 字典类型、字典项最小后端 CRUD 闭环已可用
- `/system/dictionaries` 与系统菜单预留路径一致
- 权限点命名可继续复用到配置和操作日志模块
- 本轮不引入新的重复 owner 或 shared helper 桶文件
- 操作日志模块只围绕既有 `audit_logs` owner 暴露查询能力，不新增第二套日志表

## 风险

- 如果把平台支撑模块继续塞进 `auth.ts`，会让 auth owner 膨胀成无边界的系统桶文件
- 如果字典值唯一性只放在 HTTP 校验层，后续绕过入口的写入会破坏数据一致性
- 如果把系统配置模块命名和实现成 runtime `config` 的延伸，会直接冲掉 `ADR-0003` 固定的 owner 边界
- 如果操作日志模块后续重新定义日志表而不复用 `audit_logs`，会直接形成重复 owner
