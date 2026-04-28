# 2026-04-28 若依基础功能对齐执行计划

## 背景

- 仓库当前已具备认证、RBAC、标准系统模块、多租户、数据权限与最小 workflow 闭环。
- 当前主要缺口不再是“有没有底座”，而是“是否已经像一个日常可用的企业后台”。
- 当前优先级已切换为“若依基础功能对齐”，见 [2026-04-28-ruoyi-basic-feature-alignment-matrix.md](./2026-04-28-ruoyi-basic-feature-alignment-matrix.md)。

## 命名校准

- 若依常见菜单名通常就是“岗位管理”，底层语义常对应 `post`。
- 为避免“岗位 / 职位 / post”三套说法并存，本轮统一口径为：
  - 文档与计划：`岗位管理（post）`
  - 若需解释业务语义时，可补一句“职位语义”
- 本轮不单独引入新的 `position` owner；先沿 `post` 口径实施。

## 边界摘要

- 目标模块：
  - `apps/server`
  - `apps/example-vue`
  - `packages/persistence`
  - `packages/schema`
- 现有 owner：
  - `apps/server`：auth、安全策略、系统模块 HTTP 与运行态装配
  - `apps/example-vue`：示例后台工作区装配
  - `packages/persistence`：系统模块与 session 持久化 canonical owner
  - `packages/schema`：模块 contract 与共享枚举/记录类型
- 影响面：
  - 系统模块工作区闭环覆盖率
  - auth 会话治理与登录安全策略
  - 新增 `post` 模块的 schema / persistence / server / example-vue 链路
  - 用户、字典、配置、日志等模块的导入导出体验
- 计划改动：
  - 先收口已有工作区
  - 再补 `post`
  - 再补会话治理与登录安全
  - 最后补导入导出与登录日志视图
- 验证方式：
  - server 合约测试
  - 必要的 persistence 测试
  - `bun run build:vue`
  - 相关定向回归
- 需要同步的文档：
  - `docs/roadmap.md`
  - 本计划文档
  - `2026-04-28-ruoyi-basic-feature-alignment-matrix.md`
  - 若模块职责变化，再同步对应 `MODULE.md` / `PROJECT_PROFILE.md`

## 目标

在不新增错误 owner、不把示例应用扩成第二套平台、不扩大到 workflow/Studio 主线的前提下，把当前仓库先收口到“若依式基础后台常用功能”可用状态。

## 范围

本轮纳入：

- 已有系统模块工作区闭环收口
- `岗位管理（post）` 模块
- 在线会话治理页与强制下线
- 登录失败计数、锁定窗口、最小解锁策略
- 登录日志视图
- 用户 / 字典 / 参数配置 / 日志等高频模块导入导出

本轮不纳入：

- workflow `transfer / delegate`
- 独立 SQL 工作区
- 更完整的 generator Studio 产品化
- 多通道通知中心
- SSO / OAuth2 / OIDC
- 第二套前端 shared owner

## Work Packages

### WP-1 已有工作区闭环收口

目标：

- 先把已经有后端、也已有前端切片的工作区补到“真实后台可操作”。

优先模块：

- `users`
- `roles`
- `menus`
- `departments`
- `dictionaries`
- `settings`
- `operation-logs`
- `notifications`
- `tenants`

交付：

- 真实路由切换与页面落点一致
- 列表 / 详情 / 创建 / 编辑 / 状态动作口径统一
- 权限不足、空态、加载态与失败态统一收口

验证：

- `bun run build:vue`
- 相关 workspace helper / 组件测试继续通过

### WP-2 岗位管理（post）模块 ✅ 已完成最小闭环

目标：

- 补齐若依式系统管理中的 `post` 能力，不把组织能力长期停留在“用户 + 部门”两层。

建议边界：

- `packages/schema`：`post` record / module schema
- `packages/persistence`：`posts` 表结构与 CRUD helper
- `apps/server`：`/system/posts` 列表 / 详情 / 创建 / 更新 / 状态动作
- `apps/example-vue`：岗位管理工作区

最小交付：

- 岗位编码、名称、排序、状态、备注
- 用户与岗位的最小关联策略评估
- 对应权限点、菜单与 seed

需要先判断：

- 用户与岗位是否本轮直接建立关联，还是先只落岗位模块自身闭环

默认建议：

- 第一轮先落岗位模块自身闭环与菜单/权限点。
- 用户-岗位关联仅在不扩大范围的前提下纳入；若会牵动太多现有用户 contract，则放到下一小轮。

验证：

- server 合约测试
- persistence 定向测试
- `bun run build:vue`

### WP-3 在线会话治理 ✅ 已完成最小闭环

目标：

- 把现有 refresh session 列表 / 单会话 revoke，从“后端已具备”推进到“后台可用”。

交付：

- 当前用户会话管理工作区
- 设备信息基础展示
- 单会话强制下线
- 当前会话与历史会话状态区分

建议 owner：

- `packages/persistence`：session 查询与更新继续留在既有 owner
- `apps/server`：session 管理接口与审计
- `apps/example-vue`：在线会话页

验证：

- 现有 refresh / revoke / logout 回归不退化
- 新增最小 server 测试与前端装配验证

本轮收口结果：

- 已补 `user_posts` 持久化与 `postIds` 前后端链路
- 已补在线会话工作区、当前/历史状态区分与 `revoked / rotated` 二次吊销治理
- 后端 `DELETE /auth/sessions/:id` 已显式拒绝再次吊销 rotated 会话

### WP-4 登录安全策略

目标：

- 补齐若依类后台常见的最小登录防护，而不引入重型安全平台。

最小交付：

- 登录失败计数
- 锁定窗口
- 锁定后的错误语义
- 最小解锁策略

建议边界：

- `packages/persistence`：失败次数、锁定时间等字段与查询更新
- `apps/server`：登录判定、锁定逻辑、审计记录

当前不做：

- MFA
- 风控引擎
- 异地登录检测

验证：

- 登录成功 / 失败 / 锁定 / 解锁路径的 server 合约测试

### WP-5 登录日志视图

目标：

- 把当前 auth 审计事件显式化为后台可读的登录日志视图。

实现策略：

- 优先复用既有 `audit_logs` / `operation-log` owner
- 不新增第二套安全日志真源

最小交付：

- 登录成功
- 登录失败
- refresh
- logout
- session revoke

验证：

- 列表筛选与详情读取测试
- 前端工作区可展示最小字段集

### WP-6 高频模块导入导出

目标：

- 把导入导出从“只有操作日志导出”补到日常后台高频模块。

第一轮建议模块：

- `users`
- `dictionary types/items`
- `settings`

默认顺序：

1. 先补导出
2. 再评估导入

原因：

- 导出更容易复用既有列表过滤语义，风险更低。
- 导入会涉及模板、校验、错误报告与批量写入，范围更大。

当前不做：

- 通用 Excel 平台
- 任意模块统一导入 DSL

验证：

- server 导出接口测试
- 前端导出入口装配验证

## 实施顺序

### 第一阶段

1. `WP-1` 已有工作区闭环收口
2. `WP-2` 岗位管理（post）模块

### 第二阶段

1. `WP-3` 在线会话治理
2. `WP-4` 登录安全策略
3. `WP-5` 登录日志视图

### 第三阶段

1. `WP-6` 高频模块导入导出

## Entry Gate

开始本轮前，应确认：

- [x] 当前优先级已在 `roadmap` 与主计划源同步
- [x] 若依基础功能矩阵已建立
- [x] workflow / generator / SQL 已降为次级轨道
- [ ] 为 `post` 模块确认第一轮是否包含用户关联

## Exit Gate

完成本轮时，应满足：

- [ ] 已有系统工作区完成一轮后台闭环收口
- [ ] `岗位管理（post）` 最小闭环落地
- [ ] 在线会话治理页可用
- [ ] 登录失败计数与锁定策略可验证
- [ ] 登录日志视图可用
- [ ] 至少 1 到 3 个高频模块导出能力落地
- [ ] `bun run build:vue` 通过
- [ ] 相关 server / persistence / helper 测试通过

## 风险与约束

- 若 `post` 直接绑定用户 contract 会扩大范围，先停在岗位模块自身闭环。
- 若会话治理需要管理员视角的“在线用户总览”，先确认 auth owner 与权限边界，不默认和“当前用户会话管理”并做。
- 若导入导出开始推动出统一抽象层，先停下复审，避免为了 DRY 新增错误 owner。

## 建议的首个实施包

若按最小风险起步，建议先做：

1. `WP-2` 岗位管理（post）模块
2. `WP-3` 当前用户在线会话治理页

原因：

- 这两个都能直接提升“像不像一个完整后台”的感知。
- 都能较稳定复用既有 owner。
- 都不要求先进入更重的通用化抽象。
