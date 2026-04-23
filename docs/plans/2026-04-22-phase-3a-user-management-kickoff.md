# Phase 3A System Modules Closure

更新时间：`2026-04-22`

> 说明：本文件是 `Phase 3A` 的短期实施计划，只描述当前活跃 work package 与验证边界。阶段状态以 [../roadmap.md](../roadmap.md) 为准。

## 当前进展

- `WP-3A-1` 已完成：`packages/schema/src/user.ts` 已新增 `userModuleSchema`
- `WP-3A-2` 已完成：`packages/persistence/src/auth.ts` 已补 users 列表、创建、更新、重置密码 helper
- `WP-3A-3` 已完成：`apps/server/src/modules/user` 已落最小 HTTP 模块并接入 auth guard
- `WP-3A-4` 已完成：默认 auth seed 已补 `system:user:(create|update|reset-password)` 权限点
- `WP-3A-5` 已完成：server / seed 测试已补齐
- 第二轮已完成：`packages/schema/src/role.ts`、`packages/persistence/src/auth.ts`、`apps/server/src/modules/role` 已打通角色管理最小后端闭环
- 默认 auth seed 已新增 `system:role:(list|create|update)` 权限点与 `/system/roles` 菜单
- 第三轮已完成：`packages/schema/src/menu.ts`、`packages/persistence/src/auth.ts`、`apps/server/src/modules/menu` 已打通菜单管理最小后端闭环
- 默认 auth seed 已新增 `system:menu:(list|update)` 权限点与 `/system/menus` 菜单
- 第四轮已完成：`packages/schema/src/department.ts`、`packages/persistence/src/schema/auth.ts`、`packages/persistence/src/auth.ts`、`apps/server/src/modules/department` 已打通部门管理最小后端闭环
- 默认 auth seed 已新增 `system:department:(list|create|update)` 权限点与 `/system/departments` 菜单
- `Phase 3A` 四个核心系统模块已完成后端闭环，当前进入阶段级质量审查与风险清理

## 目标

在正式进入 `P3B` 前，完成用户 / 角色 / 菜单 / 部门四个系统模块的最小后端闭环，确认当前 auth、RBAC、菜单与前端预设层边界可持续扩展。

## 范围

本轮已完成的范围：

- 补齐用户、角色、菜单、部门四个系统模块的 `schema -> persistence -> server` 最小闭环
- 复用既有 auth guard、RBAC seed、系统菜单与 `packages/persistence` auth owner
- 验证 `/system/users`、`/system/roles`、`/system/menus`、`/system/departments` 路由、权限点命名和系统菜单预留路径一致

## 本轮不做

- Vue 用户管理页面正式实现
- generator 自动生成系统管理模块
- 密码策略、审计日志、多设备会话管理的完整增强

## Canonical Owners

- 系统管理模块 schema：`packages/schema`
- 系统管理相关关系型持久化 helper：`packages/persistence`
- 系统管理 HTTP 模块与权限接入：`apps/server`
- 菜单树与前端导航协议：`packages/ui-core`
- Vue 预设层与企业组件映射：`packages/frontend-vue`、`packages/ui-enterprise-vue`

## 工作包拆分

### WP-3A-1 用户模块契约对齐

- 输出：`userModuleSchema` 或等价结构化定义
- 至少覆盖字段：
  - `id`
  - `username`
  - `displayName`
  - `email`
  - `phone`
  - `status`
  - `isSuperAdmin`
  - `lastLoginAt`
  - `createdAt`
  - `updatedAt`
- 验收：字段命名与现有 `users` 表、auth identity、系统菜单路径不冲突

### WP-3A-2 Persistence CRUD 补齐

- 输出：用户列表、按 id 读取、创建、更新、重置密码所需 helper
- 复用要求：
  - 优先扩展 `packages/persistence/src/auth.ts`
  - 不新增重复的用户 owner
- 验收：server 不直接操作 Drizzle schema，全部经 persistence owner 访问

### WP-3A-3 Server 模块接入

- 输出：`apps/server/src/modules/user`
- 最小路由建议：
  - `GET /system/users`
  - `GET /system/users/:id`
  - `POST /system/users`
  - `PUT /system/users/:id`
  - `POST /system/users/:id/reset-password`
- 验收：所有路由都通过 auth guard 进行权限校验，并保持统一错误 envelope

### WP-3A-4 权限点与菜单一致性验证

- 输出：权限点清单与 seed 对齐结果
- 至少确认：
  - `system:user:list`
  - `system:user:create`
  - `system:user:update`
  - `system:user:reset-password`
- 验收：权限点命名可以继续复用到 role/menu 管理与后续 generator

### WP-3A-5 测试与阶段文档同步

- 输出：server 模块测试、roadmap/PROJECT_PROFILE 更新
- 验收：
  - `bun run test` 通过
  - `bun run typecheck` 通过
  - 若前端预设层受影响，则 `bun run build:vue` 也需通过

## 建议顺序

1. 先做 `WP-3A-1`，锁定模块字段与权限命名。
2. 再做 `WP-3A-2` 和 `WP-3A-3`，完成后端闭环。
3. 之后补 `WP-3A-4`，确认 seed、菜单和 guard 语义一致。
4. 最后做 `WP-3A-5`，把验证和文档闭环补齐。

## 完成标准

- 用户、角色、菜单、部门四个系统模块已有最小后端 CRUD 闭环
- 四组系统路由与系统菜单预留路径一致
- 权限点命名可继续支撑后续系统模块与 generator 演进
- 本轮不引入新的重复 owner 或 shared helper 桶文件

## 风险

- 如果把用户管理逻辑从 auth/persistence owner 中平行复制一份，会直接形成重复 owner
- 如果权限点命名这轮继续摇摆，后续 role/menu/module generator 都会返工
- 如果前端预设层先于后端契约大规模铺开，会再次出现“规划先于稳定边界”的问题
