# ARCHITECTURE_GUARDRAILS

更新时间：`2026-04-20`

本文件定义仓库初始化阶段的目标边界。若实际工程实现偏离这些边界，必须先更新本文件或补 ADR，再继续实现。

## 目标层次划分

- `apps/server`
  owner: HTTP API、鉴权接入、OpenAPI、AI 接口编排、服务装配
- `packages/schema`
  owner: 实体 schema、模块 schema、页面与表单 DSL、共享校验契约
- `packages/generator`
  owner: 模板、代码生成规则、文件合并策略、再生成机制
- `packages/persistence`
  owner: 数据库 client、关系型 schema、迁移配置、持久化接入基线
- `packages/frontend-vue`
  owner: Vue 适配层、Vue 侧 API 封装、权限指令、页面渲染约定
- `packages/frontend-react`
  owner: React 适配层、React 侧 API 封装、权限组件、页面渲染约定
- `packages/core`
  owner: 平台级无业务语义的核心装配能力

## 允许的依赖方向

- `apps/*` 可以依赖 `packages/*`
- `packages/frontend-vue` 和 `packages/frontend-react` 可以依赖 `packages/schema`
- `packages/generator` 可以依赖 `packages/schema`
- `packages/persistence` 可以依赖 `packages/core`
- `packages/core` 可以被其他 package 依赖
- 前端适配层不得直接依赖对方的实现

## 当前禁止事项

- 禁止在多个 package 中重复定义 schema
- 禁止在前端适配层直接拥有后端鉴权规则
- 禁止在业务模块中直接实现通用生成规则
- 禁止让 AI 绕过 schema 直接修改平台核心基础设施
- 禁止在未确定 owner 前新增 shared utils 桶文件

## Canonical Owners

- logging: `apps/server`
- config: `apps/server`
- auth: `apps/server`
- persistence: `packages/persistence`
- HTTP / API client: 前端适配层各自实现，契约来源统一为 `apps/server` 输出的 API/schema
- shared utilities: `packages/core`
- UI primitives: 各前端适配层自己拥有，不放进通用无差别 shared 包
- error mapping: `apps/server` 与前端适配层各自拥有本侧映射，不共享业务语义不明的错误工具
- file / path helpers: `packages/core`
- binary file storage adapters: `apps/server`
- feature flags: `TBD`
  确认路径：首版是否引入该能力后再确定

说明：当前 `config`、`logging`、`error mapping` 都收敛在 `apps/server`，因为它们强依赖服务端运行时和 HTTP 生命周期。

## Forbidden Ownership

- `packages/schema` must not own:
  运行时 API 调用、数据库访问、UI 组件实现
- `packages/generator` must not own:
  领域规则判断、运行时鉴权、页面运行时状态管理
- `packages/persistence` must not own:
  HTTP 路由、前端状态、页面 schema DSL、业务鉴权规则
- 前端适配层 must not own:
  后端持久化、通用 schema 定义、生成器模板主逻辑
- `apps/server` must not own:
  某一个前端框架特有的页面实现细节

## 跨切关注点规则

- 任何通用能力先找 canonical owner，再实现
- 若某能力同时影响 server、schema、generator，优先通过 schema 契约解耦
- 若某能力要跨前端适配层共享，必须先证明它不携带框架绑定语义

## 文档同步触发条件

- 新增或调整 package owner
- 依赖方向变化
- 增加新的跨切关注点 owner
- 引入新的 forbidden import / forbidden ownership 规则
