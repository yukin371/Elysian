# Elysian

一个以 `Elysia` 为后端内核、以前端可插拔为原则、以代码生成和 AI 辅助为核心能力的企业级快速开发平台。

项目目标不是生成“能跑起来的原型”，而是生成可持续迭代、可测试、可运维、可上线的业务系统。

## 项目定位

- 后端内核固定为 `Elysia`，承担 API、鉴权、流式 AI、OpenAPI、模块装配。
- 前端不绑定单一技术栈，首批支持 `Vue` 和 `React` 两条实现路线。
- UI 采用“协议层 + 官方预设层”设计，先提供企业预设与自建风格预设，再逐步开放第三方 Adapter。
- 平台预置企业项目中的高频重复能力，例如用户、角色、权限、菜单、部门、字典、日志、任务、文件、通知、审计、配置等。
- 平台提供代码生成，但生成结果必须是正常工程代码，而不是难以维护的运行时拼装产物。
- 平台提供 AI 辅助，但 AI 的职责是生成结构化规格、补全重复逻辑、加速实现，不直接成为系统正确性的唯一来源。

## 核心原则

1. 企业上线优先于炫技。
2. 约定优先于配置，但必须允许覆盖。
3. 结构化生成优先于自由生成。
4. 代码可回收、可重构、可测试。
5. 前后端契约单一来源。
6. AI 只放大工程效率，不削弱工程质量。

## 首版范围

- `Elysia` 后端骨架
- 前端适配层，支持 `Vue` / `React`
- OpenAPI 与类型安全客户端
- RBAC、菜单路由、字典、审计日志等通用模块
- 基于实体定义的 CRUD/表单/列表/详情代码生成
- AI 辅助的模块规格生成、页面草案生成、接口草案生成、测试样例生成

## 文档索引

- [项目画像](./docs/PROJECT_PROFILE.md)
- [当前路线图](./docs/roadmap.md)
- [架构边界](./docs/ARCHITECTURE_GUARDRAILS.md)
- [产品定义](./docs/01-product-definition.md)
- [架构草案](./docs/02-architecture.md)
- [AI 与代码生成策略](./docs/03-ai-codegen-strategy.md)
- [MVP 路线图](./docs/04-mvp-roadmap.md)
- [调研与技术决策](./docs/05-research-and-decisions.md)
- [整体实施规划](./docs/06-phased-implementation-plan.md)
- [发布流转](./docs/07-release-workflow.md)

## 当前判断

这个方向可行，但首版必须避免同时追求：

- 自研 SSR 元框架
- 低代码可视化搭建器
- 多数据库深度兼容
- 多租户、工作流、BI、消息总线全量集成

这些都能做，但不该进入第一阶段。

## 快速开始

### 前置条件

- [Bun](https://bun.sh) >= 1.3
- PostgreSQL（用于完整 CRUD 体验；不配置时 server 以纯系统模式启动）

### 安装与启动

```bash
# 1. 安装依赖
bun install

# 2. 复制环境配置（PowerShell）
Copy-Item .env.example .env

# macOS / Linux 可使用
# cp .env.example .env

# 3. 启动服务端
bun run dev:server

# 4. 启动 Vue 前端（另开终端）
bun run dev:vue
```

### 容器一键启动（server + db）

```bash
# 1. 复制环境配置（PowerShell）
Copy-Item .env.example .env

# 2. 启动容器栈（会自动执行 migrate + seed）
bun run stack:up
```

服务默认监听：

- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

常用容器命令：

- 停止并移除容器：`bun run stack:down`
- 停止并清空数据卷：`bun run stack:reset`

### 连接数据库

如需启用 Customer 模块的完整 CRUD：

1. 确保 PostgreSQL 运行中
2. 在 `.env` 中设置 `DATABASE_URL=postgres://user:pass@localhost:5432/elysian`
3. 在 `.env` 中设置 `ACCESS_TOKEN_SECRET`，避免使用缺失 secret 启动鉴权模块
4. 执行迁移：`bun run db:migrate`
5. 写入默认认证种子：`bun run db:seed`
6. 重启 server

默认 seed 会创建超管账号 `admin / <ELYSIAN_ADMIN_PASSWORD>`。开发环境可沿用 `.env.example` 中的默认值；生产环境必须显式设置 `ELYSIAN_ADMIN_PASSWORD`。

不配置 `DATABASE_URL` 时，server 仅注册 system 模块（`/health`、`/platform`、`/system/modules`），前端展示模块离线状态。

常用命令：

- `bun run dev:server`
- `bun run dev:vue`
- `bun run build:vue`
- `bun run lint`
- `bun run check`
- `bun run typecheck`
- `bun run test`
- `bun run db:generate`
- `bun run db:migrate`
- `bun run db:seed`
- `bun run stack:up`
- `bun run stack:down`
- `bun run stack:reset`
- `bun run e2e:smoke`（仅执行冒烟用例，需先准备数据库）
- `bun run e2e:smoke:full`（执行 `migrate + seed + smoke`，推荐本地与 CI 使用）
- `bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue`
- `bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue --conflict fail`
- `bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue --conflict overwrite-generated-only`
- `bun --filter @elysian/generator generate --schema customer --target staging --frontend vue`

运行时基线说明：

- 健康检查：`GET /health`
- 运行时指标快照：`GET /metrics`
- 生产环境默认开启基础限流（可通过 `.env` 的 `RATE_LIMIT_*` 配置调整）
- 生产环境建议将 `CORS_ALLOWED_ORIGINS` 设置为明确域名列表，避免使用 `*`

## 当前骨架

- `apps/server`
  Elysia 服务端底座，已具备配置、错误映射和模块注册机制
- `apps/example-vue`
  首个真实前端示例，采用 Vue + Vite + Tailwind，现已接入登录态、菜单树与权限驱动展示
- `packages/schema`
  平台级结构化 schema，已落首个 `customer` 模型定义
- `packages/ui-core`
  UI 协议层，定义菜单、页面、表格、表单、动作等中立结构
- `packages/frontend-vue`
  Vue 官方预设层，当前已落自建风格预设雏形，并保留企业预设插槽
- `packages/ui-enterprise-vue`
  Vue 企业预设承载包，底座已固定为 `Arco Design Vue`
- `packages/persistence`
  PostgreSQL + Drizzle ORM + Bun SQL 基线，已落 `customer` 表定义与首个迁移 SQL
- `packages/generator`
  模块文件计划、模板渲染、冲突策略与最小 CLI 生成入口

生成器当前约定：

- 默认目标目录预设是 `staging`，会落到仓库根的 `./generated`
- 默认冲突策略是 `skip`
- 可选 `--conflict overwrite|fail`
- 每次生成都会写 `.elysian-generator/<schema>.<frontend>.json` manifest
- 每个生成文件都带 `@generated` 头和 `merge-strategy` 标记

## 开发流程

- 默认分支策略：
  `main` 保持可发布，`dev` 作为日常集成分支，功能开发从 `feature/*` 或 `fix/*` 分支切出
- GitHub 保护规则：
  `main` 需要 PR + `pr-format`/`validate` 通过 + conversation 已解决；`dev` 需要 `pr-format`/`validate` 通过，二者都禁止 force push 和删除
- 首次 clone 后执行 `bun install` 会自动安装仓库 hooks；若本地 Git 配置被覆盖，可手动修复：

```bash
bun run hooks:install
```

- 提交前最低验证：
  `bun run check` 和 `bun run build:vue`
- 详细开发规范见 [CONTRIBUTING.md](./CONTRIBUTING.md)
- 发布前检查见 [release-checklist.md](./docs/release-checklist.md)

## 下一步

1. 启动 Phase 2，先固化认证方案 ADR 与 RBAC 数据模型。
2. 为 generator 设计从 `generated/` 到正式模块目录的 apply / merge 流程。
3. 增加第二个实体（如 `product`），验证生成模板与模块边界的可复用性。
4. 在此基础上继续补 auth scaffold 和标准企业模块。
