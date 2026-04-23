# Phase 2 RBAC Data Model Draft

更新时间：`2026-04-21`

> 说明：本文件是短期实施文档，用于支撑 `P2B` 的建模和落库实现。实际推进状态统一以 [../roadmap.md](../roadmap.md) 为准。

## 目标

为 `Elysian` 的 Phase 2 提供一套可直接开始实现的最小 RBAC 数据模型，覆盖：

- 用户身份
- 角色与权限
- 菜单与动态路由
- refresh session

这套模型的目标不是一次性覆盖所有企业权限场景，而是先支撑：

- 登录与刷新
- `401 / 403` 权限语义
- 动态菜单
- 按钮级权限控制
- 后续标准模块与 generator 的权限点生成

## 设计原则

### 1. 先支持平台后台，再考虑复杂组织权限

当前阶段只处理“用户 -> 角色 -> 权限 / 菜单”这条主路径，不把数据权限、审批流、组织级隔离提前塞进模型。

### 2. 权限点必须可生成、可比对、可审计

权限点命名不能依赖中文标题或自由文本，必须使用稳定 code，便于：

- server 守卫引用
- frontend 指令判断
- generator 自动注册
- 审计日志记录

### 3. 菜单和权限分开建模

菜单解决“看见什么”，权限解决“能做什么”。

两者关联，但不强行合并为同一个概念，否则后续会把目录节点、页面节点、按钮权限、API 权限搅在一起。

### 4. refresh session 必须可撤销

遵循 [ADR-0007](../decisions/ADR-0007-auth-token-and-session-strategy.md)，refresh token 对应服务端 session 记录，而不是完全无状态 JWT。

## 范围

本轮纳入以下表：

- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `menus`
- `role_menus`
- `refresh_sessions`

本轮不纳入：

- `departments`
- `user_departments`
- `data_scopes`
- `tenant_*`
- 审计日志正式表

## 关系概览

```text
users ──< user_roles >── roles ──< role_permissions >── permissions
                           │
                           └──< role_menus >── menus

users ──< refresh_sessions
```

## 命名约定

### 表名

- PostgreSQL 表名统一使用复数：`users`、`roles`、`permissions`
- 关联表使用显式复数连接：`user_roles`、`role_permissions`、`role_menus`

### 主键

- 主键统一使用 `uuid`
- 字段名统一为 `id`

### 时间字段

所有主表默认带：

- `created_at`
- `updated_at`

状态型或会话型表按需补：

- `last_login_at`
- `last_used_at`
- `expires_at`
- `revoked_at`

### 代码字段

- 角色稳定标识用 `code`
- 权限稳定标识用 `code`
- 菜单稳定标识也保留 `code`

`code` 一旦对外使用，不应随展示文案变化而变更。

## 权限点命名规范

权限点采用三段式命名：

```text
<module>:<resource>:<action>
```

示例：

- `system:user:list`
- `system:user:create`
- `system:user:update`
- `system:user:delete`
- `system:role:assign-permission`
- `system:menu:list`

说明：

- `module`：平台一级模块，如 `system`、`customer`
- `resource`：资源名，如 `user`、`role`、`menu`
- `action`：动作名，如 `list`、`create`、`update`、`delete`

这个格式优于自由字符串的原因是：

- 便于 generator 稳定生成
- 便于前端按钮指令和后端守卫共用
- 便于后续按模块聚合权限

## 表结构草案

### 1. `users`

用途：系统登录主体。

建议字段：

| 字段 | 类型 | 约束 / 默认值 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 用户主键 |
| `username` | text | unique, not null | 登录名 |
| `display_name` | text | not null | 展示名称 |
| `email` | text | null | 邮箱，当前阶段可选 |
| `phone` | text | null | 手机号，当前阶段可选 |
| `password_hash` | text | not null | 密码哈希 |
| `status` | enum(`active`,`disabled`) | default `active` | 登录可用状态 |
| `is_super_admin` | boolean | default `false` | 是否超管 |
| `last_login_at` | timestamptz | null | 最后登录时间 |
| `created_at` | timestamptz | default now() | 创建时间 |
| `updated_at` | timestamptz | default now() | 更新时间 |

约束建议：

- `username` 全局唯一
- 禁止物理删除默认管理员
- `disabled` 用户不能登录，也不能 refresh

### 2. `roles`

用途：权限聚合单元。

建议字段：

| 字段 | 类型 | 约束 / 默认值 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 角色主键 |
| `code` | text | unique, not null | 稳定标识，如 `admin` |
| `name` | text | not null | 展示名 |
| `description` | text | null | 描述 |
| `status` | enum(`active`,`disabled`) | default `active` | 是否启用 |
| `is_system` | boolean | default `false` | 是否系统内置角色 |
| `created_at` | timestamptz | default now() | 创建时间 |
| `updated_at` | timestamptz | default now() | 更新时间 |

首批建议保留两个系统角色：

- `admin`
- `operator`

### 3. `permissions`

用途：描述 API、页面动作或按钮动作的稳定权限点。

建议字段：

| 字段 | 类型 | 约束 / 默认值 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 权限主键 |
| `code` | text | unique, not null | 权限码，如 `system:user:list` |
| `module` | text | not null | 模块名，如 `system` |
| `resource` | text | not null | 资源名，如 `user` |
| `action` | text | not null | 动作名，如 `list` |
| `name` | text | not null | 展示名 |
| `description` | text | null | 描述 |
| `created_at` | timestamptz | default now() | 创建时间 |
| `updated_at` | timestamptz | default now() | 更新时间 |

约束建议：

- `code` 唯一
- `module + resource + action` 组合唯一

### 4. `user_roles`

用途：用户与角色的多对多关联。

建议字段：

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `user_id` | uuid | FK -> `users.id` | 用户 |
| `role_id` | uuid | FK -> `roles.id` | 角色 |
| `created_at` | timestamptz | default now() | 创建时间 |

约束建议：

- 复合主键：`(user_id, role_id)`

### 5. `role_permissions`

用途：角色与权限点的多对多关联。

建议字段：

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `role_id` | uuid | FK -> `roles.id` | 角色 |
| `permission_id` | uuid | FK -> `permissions.id` | 权限 |
| `created_at` | timestamptz | default now() | 创建时间 |

约束建议：

- 复合主键：`(role_id, permission_id)`

### 6. `menus`

用途：动态菜单与路由元数据。

菜单分三类：

- `directory`
- `menu`
- `button`

说明：

- `directory` 用于目录节点和分组
- `menu` 对应可导航页面
- `button` 对应页面内操作项，主要给前端按钮权限和后续 generator 使用

建议字段：

| 字段 | 类型 | 约束 / 默认值 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | 菜单主键 |
| `parent_id` | uuid | null, FK -> `menus.id` | 父节点 |
| `type` | enum(`directory`,`menu`,`button`) | not null | 节点类型 |
| `code` | text | unique, not null | 稳定标识，如 `system-user` |
| `name` | text | not null | 展示名称 |
| `path` | text | null | 前端路由路径，按钮节点可空 |
| `component` | text | null | 前端组件标识，目录/按钮可空 |
| `icon` | text | null | 图标标识 |
| `sort` | integer | default `0` | 排序 |
| `is_visible` | boolean | default `true` | 是否可见 |
| `status` | enum(`active`,`disabled`) | default `active` | 是否启用 |
| `permission_code` | text | null | 绑定的权限点 code |
| `created_at` | timestamptz | default now() | 创建时间 |
| `updated_at` | timestamptz | default now() | 更新时间 |

约束建议：

- `code` 唯一
- `permission_code` 可空，但如果非空，应指向 `permissions.code`
- `directory` 节点通常没有 `component`
- `button` 节点通常没有 `path`

### 7. `role_menus`

用途：角色与菜单的多对多关联，用于确定“角色看见哪些菜单树节点”。

建议字段：

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| `role_id` | uuid | FK -> `roles.id` | 角色 |
| `menu_id` | uuid | FK -> `menus.id` | 菜单 |
| `created_at` | timestamptz | default now() | 创建时间 |

约束建议：

- 复合主键：`(role_id, menu_id)`

为什么保留 `role_menus`，而不是完全从 `permissions` 推导菜单：

- 目录节点通常不对应具体权限点
- 某些页面是否展示，不一定等于是否有某个按钮权限
- 动态菜单返回需要显式、稳定的树结构授权

### 8. `refresh_sessions`

用途：refresh token 对应的服务端可撤销 session 记录。

建议字段：

| 字段 | 类型 | 约束 / 默认值 | 说明 |
|---|---|---|---|
| `id` | uuid | PK | session ID，同时可写入 access token 的 `sid` |
| `user_id` | uuid | not null, FK -> `users.id` | 所属用户 |
| `token_hash` | text | not null | refresh token 哈希 |
| `user_agent` | text | null | 客户端标识 |
| `ip` | inet / text | null | 登录 IP |
| `expires_at` | timestamptz | not null | 过期时间 |
| `last_used_at` | timestamptz | null | 最后使用时间 |
| `revoked_at` | timestamptz | null | 失效时间 |
| `replaced_by_session_id` | uuid | null | 轮换后的新 session |
| `created_at` | timestamptz | default now() | 创建时间 |
| `updated_at` | timestamptz | default now() | 更新时间 |

约束建议：

- `token_hash` 唯一
- `revoked_at` 不为空时，当前 session 不再可用
- refresh 时创建新 session，并把旧 session 的 `replaced_by_session_id` 指向新记录

## 建议返回形态

为了支撑前端动态菜单和权限判断，`GET /auth/me` 建议返回：

```json
{
  "user": {
    "id": "uuid",
    "username": "admin",
    "displayName": "Administrator",
    "isSuperAdmin": true
  },
  "roles": ["admin"],
  "permissionCodes": [
    "system:user:list",
    "system:user:create"
  ],
  "menus": []
}
```

说明：

- `roles` 返回角色 `code`
- `permissionCodes` 返回权限点 `code`
- `menus` 返回前端所需的树结构，不强迫前端自己拼树

## Seed 建议

首批建议提供最小 seed：

### 用户

- `admin`
  - `is_super_admin = true`
  - 默认绑定 `admin` 角色

### 角色

- `admin`
  - 拥有全部权限和菜单
- `operator`
  - 仅拥有基础浏览与有限操作权限

### 菜单

- `system-root`
- `system-user`
- `system-role`
- `system-menu`

### 权限

- `system:user:list`
- `system:user:create`
- `system:user:update`
- `system:user:delete`
- `system:role:list`
- `system:role:update`
- `system:menu:list`
- `system:menu:update`

## 与后续阶段的关系

### 对 `P2C`

- 可直接基于 `users` 和 `refresh_sessions` 实现 `login / refresh / logout / me`

### 对 `P3A`

- 用户、角色、菜单管理模块可以直接围绕这套数据模型展开

### 对 `P4`

- `permissions.code` 和 `menus.code` 可以作为 generator 自动注册的稳定锚点

## 暂缓项

- 部门与组织树
- 数据权限范围
- 租户隔离字段
- 多设备会话列表 API
- 按菜单类型细分更多前端运行时字段

## 建议落地顺序

1. 先建 `users`、`roles`、`permissions`、`user_roles`、`role_permissions`
2. 再建 `menus`、`role_menus`
3. 最后建 `refresh_sessions`
4. 在此基础上定义 `/auth/me` 的最小返回结构

## 当前建议

这份草案足够支撑下一步进入实现，但其中两件事最好在真正写 migration 前再确认一次：

1. `menus.permission_code` 是否直接引用 `permissions.code`
2. `refresh_sessions.ip` 最终用 `inet` 还是 `text`

这两个点不会影响整体建模方向，但会影响具体 SQL 实现细节。
