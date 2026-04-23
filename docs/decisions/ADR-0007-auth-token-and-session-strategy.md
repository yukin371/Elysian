# ADR-0007 采用短时 Access Token + 持久 Refresh Session 的认证策略

状态：`accepted`

日期：`2026-04-21`

## 背景

`Elysian` 已完成首个垂直切片，但后续所有标准模块、动态菜单、权限守卫和代码生成，都依赖一个稳定的认证与权限底座。

当前项目形态具有几个明确约束：

- 后端固定为 `Elysia`
- 前端当前以独立 SPA 方式开发，首个真实示例为 `Vue`
- 后续还会支持 `React`
- 平台需要支持标准企业后台的登录态、RBAC、审计和后续可扩展的多模块接入

如果认证策略在实现阶段反复摇摆，会直接影响：

- 前端 token 存储方式
- server 中间件和 user context 注入方式
- `401 / 403` 错误语义
- RBAC、动态菜单和审计日志的接口设计

因此需要先固定一套适合当前阶段、又不阻塞后续扩展的认证方案。

## 决策

### 1. 采用双令牌模型

- 使用短时 `access token` 作为接口访问凭证
- 使用持久 `refresh token` 作为续期凭证
- `access token` 为 JWT
- `refresh token` 对应服务端可失效化的 session 记录

### 2. access token 使用 Bearer Token 传递

- 前端通过 `Authorization: Bearer <token>` 调用受保护接口
- `access token` 默认有效期定为 `15 分钟`
- `access token` 只承载最小必要身份信息：
  - `sub`：用户 ID
  - `sid`：session ID
  - `roles`：角色标识集合或最小权限摘要
  - `iat` / `exp`

### 3. refresh token 采用服务端可撤销 session 模型

- 登录成功后签发 `refresh token`
- `refresh token` 默认有效期定为 `7 天`
- 服务端保存 refresh session 记录，用于：
  - 登出失效
  - 主动撤销
  - 后续审计与多设备会话管理扩展
- `refresh token` 的轮换策略采用“每次刷新即轮换”

### 4. 前端存储策略分离

- `access token` 存储在前端内存态
- `refresh token` 不进入普通 JavaScript 可读存储
- 默认通过 `HttpOnly` Cookie 承载 `refresh token`

这意味着：

- 页面刷新后，前端先尝试通过 refresh 接口恢复登录态
- 不把长期凭证放进 `localStorage`
- 前端实现以“内存中的 access token + cookie 中的 refresh token”为标准路径

### 5. 登出语义固定为“服务端失效 + 前端清理”

- `POST /auth/logout` 负责让当前 refresh session 失效
- 前端同时清理内存中的 access token 和当前用户态
- 登出后旧的 `access token` 不做实时全局撤销，依赖短时过期自然失效

### 6. 错误语义固定

- `401 Unauthorized`
  - 未提供 token
  - token 无效
  - token 过期
  - refresh session 不存在或已失效
- `403 Forbidden`
  - 用户已认证，但没有访问该资源的权限

### 7. 最小接口集合固定

Phase 2 首批认证接口固定为：

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

其中：

- `login` 返回用户基础信息和 access token，并设置 refresh cookie
- `refresh` 验证 refresh session 后签发新的 access token，并轮换 refresh token
- `logout` 失效当前 refresh session
- `me` 返回当前登录用户和基础权限上下文

## 理由

### 选择 JWT access token

- 能很好地匹配前后端分离和后续多前端适配层
- server 中间件只需校验并注入 user context，接入简单
- 与后续 OpenAPI、generator 权限声明结合更直接

### 选择服务端可撤销 refresh session

- 纯 JWT 双令牌虽然实现快，但登出和主动失效能力弱
- 企业后台更看重可撤销、可审计、可追踪
- 为后续多端登录、会话列表、异常会话下线预留空间

### 选择 access token 放内存、refresh token 放 HttpOnly Cookie

- 比把长期 token 放 `localStorage` 更稳妥
- 对当前 SPA 路线友好
- 前端只关心 access token 的使用，不直接持有长期凭证

### 选择 15 分钟 / 7 天 的默认生命周期

- `15 分钟` 足够控制 access token 泄露窗口
- `7 天` 对后台系统来说能平衡安全性和可用性
- 两者都是可配置值，但实现和文档先按这组默认值收敛

## 影响

### 对 server

- 需要新增 auth middleware，用于解析 Bearer token 并注入 user context
- 需要 refresh session 持久化表
- 需要明确 `401 / 403` 错误 envelope

### 对 frontend

- 需要统一 access token 内存管理
- 应用启动时要有“尝试 refresh 恢复登录态”的流程
- 所有受保护请求都应自动附带 Bearer token

### 对 RBAC

- `me` 或登录响应需要返回最小权限上下文
- 菜单、权限守卫和按钮级权限控制都将建立在该身份上下文之上

### 对审计

- 登录、刷新、登出、session 失效应记录审计事件
- 后续可以基于 `sid` 追踪关键操作来源

## 暂不决策项

- 密码哈希算法的最终选型
- refresh session 的完整表结构字段
- 是否支持多设备同时在线与会话列表
- 是否支持记住我、长周期登录
- 第三方登录、SSO、LDAP、OAuth

这些内容在 `P2B` 和后续安全相关 ADR 中继续细化，但不影响当前阶段开始实现登录与权限底座。
