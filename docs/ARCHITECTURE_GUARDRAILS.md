# ARCHITECTURE_GUARDRAILS

更新时间：`2026-05-23`

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
- `packages/ui-core`
  owner: 中立 UI 协议、页面动作与导航结构契约
- `packages/ui-enterprise-vue`
  owner: 企业 TDesign 预设、后台壳层与 CRUD 工作区组件
- `packages/ui-public-vue`
  owner: `public-luxe` 品牌预设、主题 token 与 preset-scoped theme runtime
- `packages/core`
  owner: 平台级无业务语义的核心装配能力
- `apps/storybook-vue`
  owner: Vue 侧 Storybook 展示与视觉回归入口

## 允许的依赖方向

- `apps/*` 可以依赖 `packages/*`
- `packages/frontend-vue` 和 `packages/frontend-react` 可以依赖 `packages/schema`
- `packages/generator` 可以依赖 `packages/schema`
- `packages/persistence` 可以依赖 `packages/core`
- `packages/core` 可以被其他 package 依赖
- `packages/ui-enterprise-vue` 和 `packages/ui-public-vue` 可以依赖 `packages/ui-core`
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
- migration proposal snapshot artifacts: `packages/persistence`
- HTTP / API client: 前端适配层各自实现，契约来源统一为 `apps/server` 输出的 API/schema
- shared utilities: `packages/core`
- UI primitives: 各预设 owner 自己拥有，不放进通用无差别 shared 包
- preset-scoped theme tokens / runtime: 各预设 owner 自己拥有
- Storybook preview harness: `apps/storybook-vue`
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
- `packages/ui-public-vue` must not own:
  企业 TDesign runtime、业务页面路由、跨应用主题真相以外的业务状态
- `apps/storybook-vue` must not own:
  生产运行时页面、主题 token 真相、企业预设实现
- `apps/server` must not own:
  某一个前端框架特有的页面实现细节

## 跨切关注点规则

- 任何通用能力先找 canonical owner，再实现
- 若某能力同时影响 server、schema、generator，优先通过 schema 契约解耦
- 若某能力要跨前端适配层共享，必须先证明它不携带框架绑定语义
- 前端页面的信息架构试错、表单主流程试稿与交互文案打磨，默认先落到应用内的 prototype-only owner（当前为 `apps/example-vue` 的 `demohub` workspace）验证；稳定后再迁回真实业务 workspace，避免把原型试错直接混入正式运行时 owner
- 当前首个正式发行版的参考前端 owner 固定为 `apps/example-vue`；它承接 starter 体验、标准工作区联动与 generator preview 验证，不在仓库内再新增第二套 starter 真相
- `apps/example-uniapp` 继续作为 C 端设计储备，不进入首发 owner，也不反向驱动核心契约变化

## 文档同步触发条件

- 新增或调整 package owner
- 依赖方向变化
- 增加新的跨切关注点 owner
- 引入新的 forbidden import / forbidden ownership 规则
