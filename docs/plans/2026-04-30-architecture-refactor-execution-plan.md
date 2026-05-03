# 架构重构执行计划

> 记录日期：2026-04-30
> 依赖文档：
> - [后端架构痛点与改进方案](./2026-04-30-backend-query-pain-points.md)
> - [前端 Vue 架构痛点与改进方案](./2026-04-30-frontend-vue-pain-points.md)

> 状态更新：`2026-05-02`
> - 前端脊柱搭建第一阶段已按修订后边界完成，归档见 [2026-05-01-frontend-arch-spine-closeout.md](./2026-05-01-frontend-arch-spine-closeout.md)
> - 本文档继续保留为后续未完成里程碑的执行计划，不再把已收口的前端脊柱任务当作当前活动项
> - 关于”前端本地收口”和”generator 应接管的标准 CRUD 产物”之间的边界与顺序，见 [2026-05-01-generator-frontend-boundary-and-sequencing.md](./2026-05-01-generator-frontend-boundary-and-sequencing.md)
> - generator → frontend 注册契约已完成：`buildWorkspaceRegistration` 已替换 13 个标准 CRUD 模块的手写注册，generator artifact 已包含 kind/permissions/i18nKeys；当前进入 Phase 3（标准 CRUD 页面骨架回收到 generator 模板）
> 状态补记：`2026-05-02`
> - `5A / provide-inject` 已在当前标准 CRUD shell 上完成：`customer / department / dictionary / menu / notification / post / role / setting / tenant / user` 均已收口到 injected-state 契约，shell descriptor 旧 props 透传已显著收缩
> - `5B / 共享样式下沉` 已完成当前共享主线：`ui-enterprise-vue` 已承接 workspace 基础样式、panel 元数据/字段/按钮/危险态等通用 class，标准 CRUD panel 主线已移除本地同构 `<style>`；`file` 面板剩余上传区与空态等样式现已明确留在模块本地，`customer / auth-session / workflow / generator-preview / operation-log` 继续仅保留各自非标准语义样式
> - `6A / 前端类型网关` 已完成当前短期目标：`platform-api` 标准 Record/Status 类型已统一收敛到 `lib/platform-api/types.ts`，子模块不再各自直连 `@elysian/schema`
> - generator Phase 3 已补真实消费链：`example-vue` 已新增标准 CRUD surface 生成/校验脚本，`src/modules/*` 生成产物已提交入库并纳入 `build/check`；shell main / secondary 已消费 generated component map，标准 CRUD main/panel 已不再依赖示例应用本地手写实现
> - `3B / AuditLogWriter 显式注入` 与 `3C / compose-* 分桶组装` 已完成当前第一轮收口：`generator-session`、`workflow` 已改用共享 `AuditLogWriter` 契约，`apps/server/src/index.ts` 已切到 `compose-auth.ts`、`compose-system.ts`、`compose-business.ts` 组装并通过 `bun run check` / `bun run test`
> - `2B / listDataScopesForUser` 已完成当前收口：`packages/persistence/src/auth.ts` 已从“两次查询 + Map 拼装”收敛为单次 `user_roles -> roles -> role_depts` 查询，`bun run check` 与相关 auth/data-scope 定向测试已通过
> - `2A / 部门后代查询` 已完成当前收口：已新增 `0019_dept_descendant_function.sql` 与 `get_descendant_dept_ids` 函数，`data-scope.ts` 不再通过全表加载 `departments` 做内存过滤，相关权限测试与 `bun run check` 已通过
> - `2C / 分页工具` 已完成第三刀：`packages/persistence/src/query-utils.ts` 已提供 `normalizePagination` / `buildPaginatedResult`，当前 `customer.ts`、`notification.ts` 与 `file.ts` 已切换消费；其余 repository 仅在后续真正引入分页契约时继续收口
> - `2C / 分页工具` 已完成第六刀：`packages/persistence/src/role.ts`、`packages/persistence/src/setting.ts` 及对应模块已切换到统一分页契约；当前 `customer / notification / file / operation-log / user / role / setting` 已进入共享分页主线
> - `6B-1 / auth service mock 单测` 已完成：新增 `apps/server/src/modules/auth/service.test.ts`，覆盖 login / refresh rotation / logout 核心路径，并通过 `bun run check`
> - `6B-2 / workflow service mock 单测` 已完成：新增 `apps/server/src/modules/workflow/service.test.ts`，覆盖 `start / claim / complete / cancel` 核心状态流，并通过 `bun run check`
> - `3D / service 层单元测试补位` 已完成当前批次收口：新增 `role / customer / notification / file` 四组 mock service tests，并已在 `2026-05-02` 通过定向 `bun test` 与仓库级 `bun run check`
> - `3C-5 / compose smoke 独立复验` 已完成：在本地 PostgreSQL 环境下通过 `bun run e2e:smoke:full`，compose 分桶组装已补独立冒烟出口验证
> 状态补记：`2026-05-04`
> - `1B / 后端错误码治理` 已完成 4 位数字错误码注册表收口：`apps/server` 已新增注册表，`AppError` 现只接受注册表键并统一输出数字 `code`；注册表已补运行时唯一性与 4 位约束校验，避免继续写入游离业务码
> - `1B / 后端错误码治理` 已完成顶层错误信封迁移：`apps/server` 现统一返回 `{ code, message, status, details? }`，相关集成测试与 `generator-session` 契约断言已同步更新
> - `1B / 后端错误码治理` 已补前端过渡兼容：`apps/example-vue` 的 `platform-api` 已改为结构化 `ApiError`，当前同时兼容顶层信封与旧 `error.{...}` 响应，`generator-preview` 工作区不再依赖 `message.includes(...)` 判断会话业务错误
> - `1C / 前端 i18n 拆分` 已完成当前收口：`apps/example-vue/src/i18n/*modules.ts` 已按模块前缀拆到 `i18n/modules/`，中英文 key 数量与集合保持一致，并通过 `bun run build:vue`
> - `6C-1 / OpenAPI spec 完整度评估` 已完成当前盘点：`apps/server` 已挂载 `/openapi` 与 `/openapi/json`，但当前 `92` 条路由里显式 `response` 契约为 `0`，仅 `3` 条声明 `query`、`14` 条声明 `body`、`40` 条声明 `params`；系统级 `/openapi/json` 输出也未包含可消费的 `responses`。结论：可确认具备 OpenAPI 基础入口，但暂不满足 `openapi-typescript` 作为前端主类型源的切换条件
> - `6C / OpenAPI 响应契约补位` 已完成前三刀：`system`、`auth` 与 `customer` 核心成功响应已写入 OpenAPI schema，并通过 `/openapi/json` 定向测试锁住 `200/201` responses；当前剩余缺口集中在其余标准 CRUD 模块，以及 `204`/错误响应文档化

---

## 总览

```text
M1 ──── M2 ──── M3 ──── M4 ──── M5 ──── M6 ──── M7
│       │       │       │       │       │       │
│       │       │       │       │       │       └─ 里程碑 7：远期基建就绪
│       │       │       │       │       └─ 里程碑 6：类型自动化
│       │       │       │       └─ 里程碑 5：前端体验升级
│       │       │       └─ 里程碑 4：前端脊柱搭建完成
│       │       └─ 里程碑 3：后端契约+架构层
│       │       └─ 里程碑 2：后端查询层修复
│       └─ 里程碑 1：基础规范生效
└─ 里程碑 0：启动
```

---

## 里程碑 0：启动 — 确认与准备

**目标**：确认痛点文档、建立工作分支、清理技术债前置条件

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 0-1 创建重构工作分支 `refactor/arch-spine` | 分支 | 从 dev 切出，CI 绿 |
| 0-2 确认后端痛点文档终稿 | 签字 | 两份痛点文档无待讨论项 |
| 0-3 确认前端痛点文档终稿 | 签字 | 同上 |
| 0-4 确保 `bun run check && bun run build:vue && bun run test` 在 dev 分支全绿 | CI 基线 | 作为后续所有检查点的回归基线 |

**检查点 CP0**：分支已创建 + CI 基线全绿 + 两份文档无待定项

---

## 里程碑 1：基础规范生效

**目标**：零代码改动或极低成本的规范立即落地，不依赖其他任务

### 任务组 1A：后端 ORM 边界约定（后端痛点 4）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 1A-1 编写 ORM 使用边界文档 | `docs/decisions/ADR-orm-usage-boundary.md` | 明确哪些场景用链式 API、哪些用 sql 模板、哪些建视图/函数 |
| 1A-2 后续新增查询按此约定执行 | — | ADR 合入 main |

### 任务组 1B：后端错误码治理（后端痛点 9）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 1B-1 创建 4 位数字编码注册表 | `apps/server/src/errors/registry.ts` | 0=成功，1xxx=auth，2xxx=业务，3xxx=系统管理，4xxx=工作流/生成器，9xxx=全局 |
| 1B-2 `AppError.code` 从 `string` 改为 `number` | `apps/server/src/errors.ts` | 类型变更 + 构造函数适配 |
| 1B-3 响应结构统一为 `{ code, message, data?, details? }` | `apps/server/src/errors.ts` | `toErrorResponse` 输出新结构 |
| 1B-4 逐模块替换硬编码字符串为 `errorCodes.xxx` | 各 module 文件 | 所有 `throw new AppError({ code: ... })` 使用注册表 |
| 1B-5 前端 `platform-api/core.ts` 适配新响应结构 | `lib/platform-api/core.ts` | 统一判断 `response.code === 0` |
| 1B-6 前端错误处理适配数字码 | 各 workspace composable | 错误分支使用数字码判断 |
| 1B-7 更新所有集成测试断言 | `app/*.test.ts` | 字符串匹配改为数字匹配 |
| 1B-8 验证全部测试绿 | `bun run test` | 无回归 |

### 任务组 1C：前端 i18n 拆分（前端痛点 7）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 1C-1 将 `zh-CN.modules.ts` 按模块拆分 | `i18n/modules/zh-CN.*.ts` | 已完成：按模块前缀拆分并由聚合器统一导入 |
| 1C-2 将 `en-US.modules.ts` 同步拆分 | `i18n/modules/en-US.*.ts` | 已完成：中英文 key 集合保持完全对齐 |
| 1C-3 验证前端构建无回归 | `bun run build:vue` | 已完成：无缺失 key 报错，构建通过 |

**检查点 CP1**：ADR 已提交 + 错误码注册表替换完成且测试绿 + i18n 拆分完成且构建绿

---

## 里程碑 2：后端查询层修复

**目标**：解决后端痛点 1-3 的性能隐患和重复模式

### 任务组 2A：部门后代查询优化（后端痛点 1）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 2A-1 编写递归 CTE 迁移 SQL | `drizzle/0019_dept_descendant_function.sql` | 已完成：`get_descendant_dept_ids` 函数可迁移 |
| 2A-2 重构 `data-scope.ts`，调用 SQL 函数替代内存过滤 | `packages/persistence/src/data-scope.ts` | 已完成：消除 `listDescendantDepartmentIds` 中的全表查询 |
| 2A-3 验证数据范围权限测试 | `bun run test` | 已完成：相关权限测试全绿 |
| 2A-4 性能对比（可选） | 测试报告 | 验证 CTE 比内存过滤更快 |

### 任务组 2B：多查询合并（后端痛点 2）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 2B-1 重构 `listDataScopesForUser` 为单条 SQL | `packages/persistence/src/auth.ts` | 已完成：收敛为单次 join 查询并在内存内按 role 聚合 |
| 2B-2 验证认证/权限测试 | `bun run test` | 已完成：auth/data-scope 定向测试通过，`bun run check` 全绿 |

### 任务组 2C：分页工具收敛（后端痛点 3）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 2C-1 创建通用分页工具 | `packages/persistence/src/query-utils.ts` | 已完成：补齐 `normalizePagination` + `buildPaginatedResult` |
| 2C-2 重构 customer repository 使用工具函数 | `packages/persistence/src/customer.ts` | 已完成：customer 已切换消费分页工具 |
| 2C-3 重构 dictionary repository | `packages/persistence/src/dictionary.ts` | 当前未推进：该模块仍是全量类型/条目列表契约，未在本轮强行改为服务端分页 |
| 2C-4 重构 notification repository | `packages/persistence/src/notification.ts` | 已完成：通知列表已切到统一分页工具，并补齐 in-memory / server API 一致性 |
| 2C-5 逐个重构其余 repository（menu, role, setting, tenant, user, operation-log, department, file, post） | 各 repository 文件 | 当前 `file`、`operation-log`、`user`、`role` 与 `setting` 已完成；其余 repository 仅在真实进入服务端分页契约时继续推进 |
| 2C-6 验证全部测试绿 | `bun run test` | 无回归 |

**检查点 CP2**：`2A/2B` 已完成；`2C` 已完成基础工具与 `customer / notification / file / operation-log / user / role / setting` 收口，当前剩余项集中在其余 repository 是否真正需要进入服务端分页契约的持续收口

---

## 里程碑 3：后端契约层 + 架构层

**目标**：解决后端痛点 5-7，实现 schema→校验推导、显式接口注入、分桶组装

### 任务组 3A：Schema→校验推导（后端痛点 5）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 3A-1 ModuleField 新增 `validation` 字段 | `packages/schema/src/index.ts` | 已完成：类型定义、allowlist 与 runtime 校验已补齐 |
| 3A-2 创建 `deriveBodySchema` 工具函数 | `packages/schema/src/elysia-bridge.ts` | 已完成第一刀：支持 `create/update`、基础类型推导、`exclude/overrides` |
| 3A-3 重构 role module 使用推导 | `modules/role/module.ts` | 已完成：`role` create/update body 已切到 `deriveBodySchema`，特殊字段继续本地 override |
| 3A-4 重构 department module | `modules/department/module.ts` | 已完成：`department` create/update body 已切到 `deriveBodySchema`，`parentId/sort/status/userIds` 保留本地 override |
| 3A-5 重构 dictionary module | `modules/dictionary/module.ts` | 已完成：`type/item` 两套 body 已切到 schema owner + `deriveBodySchema`，不再保留 server 侧第二份手写主干 |
| 3A-6 重构 menu / notification / setting / post / tenant / user / file module | 各 module 文件 | 已完成当前主线：`menu / notification / setting / post / tenant / user` 已切到 `deriveBodySchema`；`file` 保持 multipart/upload 与动作型接口显式 body |
| 3A-7 验证全部测试绿 | `bun run test` | 已完成当前首刀复验：`packages/schema/src/index.test.ts` 与 `bun run check` 通过 |

### 任务组 3B：显式接口注入（后端痛点 6）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 3B-1 定义 `AuditLogWriter` 接口 | `apps/server/src/modules/shared/audit-log.ts` | 已完成：补齐 `AuditLogWriter` 与 `AuditLogEvent` 契约 |
| 3B-2 auth 模块导出 `createAuthAuditLogWriter` | `modules/auth/index.ts` | 已完成：返回 `AuditLogWriter` 实现 |
| 3B-3 generator-session 和 workflow 模块改用 `AuditLogWriter` | 两个 module 文件 | 已完成：参数类型从匿名闭包改为接口 |
| 3B-4 `index.ts` 改为显式注入 | `apps/server/src/index.ts` | 已完成：通过 compose/auth writer 显式注入 |
| 3B-5 验证全部测试绿 | `bun run test` | 已完成：当前测试全绿 |

### 任务组 3C：分桶组装（后端痛点 7）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 3C-1 创建 `compose-auth.ts` | `apps/server/src/modules/compose-auth.ts` | 已完成：auth + user + role + post 组装 |
| 3C-2 创建 `compose-system.ts` | `apps/server/src/modules/compose-system.ts` | 已完成：dictionary + menu + department + setting 组装 |
| 3C-3 创建 `compose-business.ts` | `apps/server/src/modules/compose-business.ts` | 已完成：customer + file + notification + workflow + generator + operation-log + tenant 组装 |
| 3C-4 重构 `index.ts` 使用 compose 文件 | `apps/server/src/index.ts` | 已完成：入口已切到 compose 组装 |
| 3C-5 验证全部测试绿 + smoke 测试 | `bun run test && bun run e2e:smoke` | 已完成：`bun run check`、`bun run test` 与本地 PostgreSQL 环境下的 `bun run e2e:smoke:full` 均通过 |

### 任务组 3D：service 层单元测试补位（后端痛点 8）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 3D-1 为 role service 补充 mock 单元测试 | `modules/role/service.test.ts` | 已完成：覆盖 trim、关系校验、system role 不可变边界 |
| 3D-2 为 customer service 补充 mock 单元测试 | `modules/customer/service.test.ts` | 已完成：覆盖 trim、blank name、not-found remove 边界 |
| 3D-3 逐模块补充（可在后续迭代中持续） | 各 service.test.ts | 已完成当前一批：`notification / file / tenant` 已有 service tests，当前 `role / customer / notification / file / auth / workflow / tenant` 已形成首轮补位覆盖；后续仅按新增模块继续补位 |

**检查点 CP3**：`3A/3B/3C/3D` 已完成当前收口并通过 `bun run check`、`bun run test` 与本地 PostgreSQL 环境下的 `bun run e2e:smoke:full`；`file` 因 multipart/upload 与动作型接口继续保留显式 body

---

## 里程碑 4：前端脊柱搭建 ✅ 已按修订边界归档

**目标**：解决前端痛点 3 + 6，建立 workspace 注册表和 CRUD 工厂

归档说明：

- 归档文档：[2026-05-01-frontend-arch-spine-closeout.md](./2026-05-01-frontend-arch-spine-closeout.md)
- 实际归档边界：
  - workspace 注册表、路由/导航/ready 推导、CRUD 工厂、本地直接回归补强已完成
  - `customer` 与 `operation-log` 已明确不纳入“标准 CRUD 工厂全覆盖”统计
- 本节保留为历史执行记录，不再作为当前活动任务列表

### 任务组 4A：workspace 注册表（前端痛点 6）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 4A-1 定义 `WorkspaceState` 和 `WorkspaceRegistration` 类型 | `app/workspace-registry/types.ts` | 泛型约束工厂返回值 |
| 4A-2 创建 injection keys | `app/workspace-registry/injection-keys.ts` | `WORKSPACE_STATE_KEY` |
| 4A-3 创建 `auth-registry.ts` | auth / user / role / session 注册项 | 4 条注册记录 |
| 4A-4 创建 `system-registry.ts` | dictionary / menu / department / setting / post 注册项 | 5 条注册记录 |
| 4A-5 创建 `business-registry.ts` | customer / file / notification / tenant / workflow / generator / operation-log 注册项 | 7 条注册记录 |
| 4A-6 创建聚合 `index.ts` | `workspaceRegistry` 数组导出 | 16 条记录，与现有 workspace 一一对应 |
| 4A-7 重构路由从注册表推导 | `router/example-workspace-routes.ts` | 消除独立路由定义 |
| 4A-8 重构导航从注册表推导 | `app/use-example-navigation.ts` | 消除独立导航定义 |
| 4A-9 重构 gates 为 Map 模式 | `app/use-example-workspace-gates.ts` | 15 个独立 ref 替换为 `Map<string, Ref>` |

### 任务组 4B：CRUD 工厂（前端痛点 3）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 4B-1 设计并实现 `BaseCrudState` 接口 | `workspaces/create-crud-workspace.ts` | 满足 `WorkspaceState` 最小公共接口 |
| 4B-2 实现 `createCrudWorkspace` 工厂函数 | 同上 | 内置分页/排序/loading/CRUD + extend 钩子 |
| 4B-3 重构 `use-customer-workspace` 使用工厂 | `workspaces/use-customer-workspace.ts` | 已按修订边界排除，不强制迁移 |
| 4B-4 重构 `use-dictionary-workspace` 使用工厂 | `workspaces/use-dictionary-workspace.ts` | 验证 extend 钩子可用（字典有树形结构） |
| 4B-5 重构 `use-setting-workspace` 使用工厂 | `workspaces/use-setting-workspace.ts` | 第三个验证点 |
| 4B-6 验证 3 个重构 workspace 功能无回归 | 手动验证 + 现有测试 | 已由直接回归与全链路检查补强 |
| 4B-7 逐个重构其余标准 CRUD workspace | 各 composable 文件 | 已完成 `dictionary / department / post / menu / notification / role / setting / tenant / user`；`operation-log` 按边界排除 |

### 任务组 4C：App.vue 初步收敛

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 4C-1 App.vue 改为消费注册表初始化 workspace | `App.vue` | 消除 15 个独立 moduleReady ref，使用 Map |
| 4C-2 App.vue 删除硬编码的 workspace 初始化 | `App.vue` | 改为从注册表遍历 |
| 4C-3 验证所有 workspace 功能正常 | 手动全量验证 | 每个 workspace 的列表/详情/CRUD 均正常 |

**检查点 CP4**：已按修订边界达成并归档。后续不再在本计划中重复跟踪。

---

## 里程碑 5：前端体验升级 🚧 当前剩余项

**目标**：解决前端痛点 4 + 5，消除 props 爆炸，样式收敛

### 任务组 5A：provide/inject 替代 props（前端痛点 4）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 5A-1 在 shell 层实现 workspace state 的 provide | shell binding 层 | 已完成；路由匹配 → factory → provide 已进入当前 shell 主线 |
| 5A-2 重构 CustomerWorkspaceMain 使用 inject | `components/workspaces/customer/CustomerWorkspaceMain.vue` | 已完成；props 已降到渲染配置类 |
| 5A-3 逐个重构其余 workspace 组件 | 各 Main/Panel 组件 | 已完成标准 CRUD 范围：`department / dictionary / menu / notification / post / role / setting / tenant / user` |
| 5A-4 删除中间层的 props 透传代码 | shell workspace descriptors | 已完成当前标准 CRUD descriptor 收口；特殊 workspace 仍按边界保留独立 props |
| 5A-5 验证全部 workspace 功能正常 | 手动验证 | 已由 `bun run check`、`bun run build:vue`、workspace/provider/test coverage 持续覆盖 |

### 任务组 5B：样式下沉（前端痛点 5）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 5B-1 创建 `workspace-base.css` | `packages/ui-enterprise-vue/src/styles/workspace-base.css` | 消息提示、栅格布局、圆角统一到 DESIGN.md 规范 |
| 5B-2 创建 `workspace-crud.css` | `packages/ui-enterprise-vue/src/styles/workspace-crud.css` | 表格、表单、分页样式 |
| 5B-3 逐个 workspace 组件替换重复样式 | 各组件 `<style>` 块 | 标准 CRUD panel 主线已完成；剩余只保留非标准面板和文件上传区等模块私有语义样式 |
| 5B-4 验证视觉效果无回归 | 手动验证 | 圆角/间距/颜色符合 DESIGN.md |

**检查点 CP5**：`5A` 已完成；`5B` 的共享样式主线已闭合，后续只继续维护非标准面板与模块私有语义样式的一致性回归

---

## 里程碑 6：类型自动化 + 后端测试补位 🚧 当前活跃后续项

**目标**：解决前端痛点 2 中期方案 + 后端痛点 8 持续补位

### 任务组 6A：前端类型网关短期落地（前端痛点 2 短期）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 6A-1 创建类型网关 `lib/platform-api/types.ts` | types.ts | 已完成：以 schema 为单一来源 re-export 标准 Record/Status 类型 |
| 6A-2 逐个替换 platform-api 子模块的类型定义 | 各子模块 | 已完成：标准 Record/Status 类型统一改为从 `./types` 导入 |
| 6A-3 验证前端类型检查通过 | `bun run typecheck` | 已由当前阶段 `bun run check` / `bun run build:vue` 持续覆盖，类型网关主线无回归 |

### 任务组 6B：后端 service 单元测试持续补位（后端痛点 8）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 6B-1 为 auth service 补充 mock 单元测试 | `modules/auth/service.test.ts` | 已完成：覆盖登录/刷新/登出核心路径 |
| 6B-2 为 workflow service 补充 mock 单元测试 | `modules/workflow/service.test.ts` | 已完成：覆盖状态机转换核心路径 |
| 6B-3 为 file / notification / tenant service 补充 | 各 service.test.ts | 已完成当前范围：`file / notification / tenant` 均已补位 |

### 任务组 6C：OpenAPI 自动生成准备（前端痛点 2 中期，视 API 稳定度决定是否在本里程碑执行）

| 任务 | 产物 | 完成标准 |
|------|------|---------|
| 6C-1 评估 OpenAPI spec 完整度 | 评估报告 | 确认所有 endpoint 都有完整 schema |
| 6C-2 配置 `openapi-typescript` 生成流程 | CI 步骤或手动脚本 | 当前未推进：需先补最小请求/响应 schema 主线，否则生成结果仅有空壳 path/type 信息 |
| 6C-3 切换类型网关导入源 | `lib/platform-api/types.ts` | 当前未推进：在 `response` 契约缺失前切换会降低类型质量 |
| 6C-4 验证前端类型检查通过 | `bun run typecheck` | 当前未推进：待 6C-2/6C-3 落地后再验证 |

**检查点 CP6**：类型网关落地 + 所有 platform-api 子模块统一从网关导入 + 后端核心 service 有单元测试覆盖

---

## 里程碑 7：远期基建就绪

**目标**：为后续扩展做基础设施准备，视实际需求决定执行时机

### 任务组 7A：后端 DI 注册器（后端痛点 7 远期，模块数 30+ 时）

- 模块自描述定义 + 拓扑排序注册器
- 触发条件：模块数超过 30 或 compose 文件单文件超过 100 行

### 任务组 7B：后端事件总线（后端痛点 6 远期，消费者 3+ 时）

- 事件总线替代 AuditLogWriter 接口
- 触发条件：跨模块交互场景超过 3 个

### 任务组 7C：前端非标 workspace 独立 composable 片段（前端痛点 3 方案 B）

- 当非标 workspace（generator-preview、workflow）数量增多时，抽取共享片段
- 触发条件：非标 workspace 超过 3 个

**检查点 CP7**：按实际触发条件评估，不设硬性完成时间

---

## 回归检查策略

每个检查点必须通过以下回归验证：

```bash
# 代码质量
bun run check

# 后端测试
bun run test

# 前端构建
bun run build:vue

# 类型检查
bun run typecheck

# E2E 冒烟（里程碑 3 之后）
bun run e2e:smoke:full
```

任何检查点回归失败则阻塞，修复后才能推进下一阶段。

---

## 里程碑时间线参考

```text
CP0 ──── CP1 ──── CP2 ──── CP3 ──── CP4 ──── CP5 ──── CP6
启动     规范     查询层    契约+架构  前端脊柱   前端体验   类型+测试
  │       │        │         │         │         │         │
  │       │        │         │         │         │         │
  ▼       ▼        ▼         ▼         ▼         ▼         ▼
 0.5天    1-2天    2-3天     3-5天     3-5天     2-3天     2-3天
```

总计预估：14-22 天（不含远期里程碑 7）

---

## 风险与缓解

| 风险 | 影响 | 缓解策略 |
|------|------|---------|
| CRUD 工厂泛型推导复杂度超预期 | 前端脊柱延期 | 先用 `any` 桥接，后续逐步收紧类型 |
| 分桶组装后模块注册顺序出错 | 启动失败 | 保留现有顺序作为 fallback，新顺序由测试验证 |
| provide/inject 导致组件调试困难 | 开发体验下降 | 提供 devtools 插件或 logging 辅助 |
| OpenAPI spec 不完整 | 类型自动生成延迟 | 短期方案 B（schema 类型网关）已覆盖，不阻塞 |
| 递归 CTE 在大数据量下性能不及预期 | 部门后代查询回退 | 保留内存过滤作为 fallback，CTE 默认开启 |

---

## 完成标准

全部检查点通过的最终状态：

**后端**：
- 查询层无内存过滤、无多查询拼装、所有 repository 统一分页工具
- 手写模块使用 deriveBodySchema，不再手写 t.Object
- 跨模块依赖通过 AuditLogWriter 显式接口
- index.ts 分桶组装，~30 行
- 核心 service 有 mock 单元测试

**前端**：
- workspace 注册表覆盖全部 16 个 workspace，按领域分桶
- 标准 CRUD workspace 使用工厂，~3KB
- provide/inject 替代 props 透传
- 共享样式收敛到 ui-enterprise-vue
- i18n 按模块拆分
- 类型统一从网关导入
- 新增标准 CRUD workspace 只需改 2-3 个文件
