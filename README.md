# Elysian

以代码生成为核心能力、可发布的中小项目快速开发平台。输入结构化模块规格，一键生成前后端生产级代码骨架，让团队专注于业务实现与上线交付。

## 为什么选择 Elysian

| 特性 | 说明 |
|---|---|
| **结构化生成，不是低代码** | 基于 Schema 驱动生成可回收、可重构、可测试的生产级代码，不是黑盒运行时拖拽 |
| **前后端契约单一来源** | 一个 `ModuleSchema` 同时驱动后端 CRUD、前端页面、权限点、路由注册和数据库变更 |
| **AI 辅助，不削弱质量** | AI 生成结构化 Schema（而非自由代码），通过校验网关后进入生成流程，人工兜底始终可用 |
| **企业能力内建** | RBAC、多租户（PostgreSQL RLS）、数据权限、审计日志、操作日志——不是事后拼接 |
| **前端可插拔** | UI 协议层与预设层分离，首发固定 Vue 参考发行版（TDesign），React 与 uniapp 保留为后续扩展 |
| **生成闭环可审计** | 预览 → 报告 → staging apply → 回放证据；进入正式模块目录时保留人工确认清单，避免覆盖手写代码 |

## 首发参考发行版

- 默认参考发行版固定为 `apps/example-vue`
- 后端与数据库发布路径固定为 `apps/server` + PostgreSQL + Docker
- `apps/example-uniapp` 与 `packages/frontend-react` 继续作为并行研发轨道，不作为首发门槛
- 目标不是做“更多示例”，而是做“能直接开新项目的发行版”

## 技术栈

- **后端**：[Elysia](https://elysiajs.com/) (Bun) + PostgreSQL + Drizzle ORM
- **前端**：Vue 3 + Vite + TypeScript + TDesign Vue Next + Tailwind CSS
- **代码生成**：Schema 驱动 + 模板渲染 + 冲突策略 + manifest 追踪
- **AI 辅助**：自然语言 → 结构化 Schema → 校验 → 生成
- **部署**：Docker + docker-compose（单主机生产基线已固定）

## 平台能力总览

### 后端模块（已实现）

| 模块 | 说明 |
|---|---|
| 认证 | JWT + Refresh Session，登录/登出/刷新/在线会话管理 |
| RBAC | 用户、角色、权限、菜单，支持动态路由与权限指令 |
| 部门与岗位 | 树形组织结构、部门关联用户 |
| 字典与配置 | 字典类型/字典项 CRUD，key-value 系统配置 |
| 操作日志 | 审计日志查看、筛选、导出 |
| 文件管理 | 上传、下载、存储策略抽象 |
| 通知管理 | 站内通知、已读未读、批量操作 |
| 多租户 | PostgreSQL RLS 隔离，租户 CRUD 与一键初始化 |
| 数据权限 | 5 档数据范围（全部/自定义/本部门/本部门及下级/仅本人） |
| 工作流 | 简化流程引擎：定义、发起、线性审批、最小条件分支 |
| 代码生成会话 | Preview → Apply → Staging，可回放的生成闭环 |

### 前端（已实现）

- **ElyShell**：企业后台布局（侧边栏 + 顶栏 + 内容区 + 标签页）
- **ElyCrudWorkspace**：标准 CRUD 工作区（列表 + 搜索 + 表单 + 详情）
- **ElyTable / ElyForm / ElyQueryBar**：企业级表格、表单、搜索栏组件
- **13 个标准 CRUD 模块**：Schema 驱动注册，从生成器 artifact 自动生成前端 surface
- **动态菜单与权限 Gate**：根据后端菜单配置生成路由，权限指令控制按钮可见性

### 代码生成器

```bash
# 列出当前可用的已注册 schema
bun --filter @elysian/generator generate --list-schemas

# 从零初始化一个简化 schema 文件
bun --filter @elysian/generator generate --init supplier

# 从已注册 schema 生成前后端骨架
bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue

# 从外部 JSON schema 文件生成（支持 simplified schema）
bun --filter @elysian/generator generate --schema-file ./my-module.json --out ./generated --frontend vue

# 预览生成结果（不写入磁盘）
bun --filter @elysian/generator generate --schema customer --target staging --frontend vue --preview

# 直接生成到服务端模块目录，并输出集成清单
bun --filter @elysian/generator generate --schema customer --target module --frontend vue --preview
```

生成器特性：
- 支持 `SimplifiedModuleSchema`：缺省补 `id`、`label`、`frontend` 元数据
- 支持字段类型：`id`、`string`、`text`、`number`、`boolean`、`enum`、`json`、`datetime`
- 支持 `skip / overwrite / overwrite-generated-only / fail` 四种冲突策略
- 支持 `staging / module` 两种目标预设：`staging` 用于安全预览，`module` 用于服务端模块集成桩
- 原子写入（temp + rename），避免部分写入损坏
- 每次生成输出 manifest，支持二次生成安全覆盖
- Preview 模式：预览文件计划、diff、SQL 变更，确认后再 Apply

`--target module` 会把生成目标切到 `apps/server/src/modules`，额外产出 `*.module.ts` 装配桩，并在 CLI 末尾输出集成清单，提示后续需要完成的 persistence schema、compose 注册和前端注册步骤。为避免覆盖手写装配代码，生成器会保留已有的 `*.module.ts`。

最小 simplified schema 示例：

```json
{
  "name": "supplier",
  "fields": [
    { "key": "name", "kind": "string", "required": true, "searchable": true },
    { "key": "description", "kind": "text" },
    { "key": "metadata", "kind": "json" },
    { "key": "status", "kind": "enum", "options": ["active", "inactive"] }
  ]
}
```

从零开始的推荐流程：

```bash
# 1. 初始化脚手架（文件固定写到仓库根目录）
bun --filter @elysian/generator generate --init supplier

# 2. 编辑 supplier.module-schema.json

# 3. 先 preview
bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --target staging --frontend vue --preview

# 4. 再正式生成到 staging 目录
bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --out ./generated --frontend vue

# 5. 需要直接落到服务端模块目录时，先看 module target checklist
bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --target module --frontend vue --preview
```

## 快速开始

### 前置条件

- [Bun](https://bun.sh) >= 1.3
- PostgreSQL（用于完整 CRUD 体验；不配置时 server 以纯系统模式启动）

### 安装与启动

```bash
# 1. 安装依赖
bun install

# 2. 复制环境配置
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env

# 3. 启动服务端
bun run dev:server

# 4. 启动 Vue 前端（另开终端）
bun run dev:vue
```

### 容器一键启动（server + db）

```bash
cp .env.example .env
bun run stack:up    # 自动执行 migrate + seed
```

服务默认监听：
- API：`http://localhost:3000`
- PostgreSQL：`localhost:5432`

### 连接数据库

如需启用完整 CRUD 体验：

1. 确保 PostgreSQL 运行中
2. 在 `.env` 中设置 `DATABASE_URL=postgres://user:pass@localhost:5432/elysian`
3. 设置 `ACCESS_TOKEN_SECRET`（避免使用缺失 secret 启动鉴权）
4. 执行迁移：`bun run db:migrate`
5. 写入种子数据：`bun run db:seed`
6. 重启 server

默认 seed 创建超管账号 `admin / <ELYSIAN_ADMIN_PASSWORD>`。

不配置 `DATABASE_URL` 时，server 仅注册系统模块（`/health`、`/platform`、`/system/modules`），前端展示模块离线状态。

## 项目结构

```
apps/
  server/             # Elysia 服务端（API、鉴权、模块装配）
  example-vue/        # Vue 参考发行版（首个 starter 前端 owner）
  example-uniapp/     # UniApp C 端骨架（设计储备）
packages/
  core/               # 平台级共享基础能力
  schema/             # 结构化 Schema 定义与校验（前后端契约单一来源）
  persistence/        # PostgreSQL + Drizzle ORM + 数据访问层
  generator/          # 代码生成器（模板渲染、冲突策略、manifest）
  frontend-vue/       # Vue 预设层（导航、权限、注册契约）
  ui-core/            # UI 协议层（框架无关的页面/表格/表单契约）
  ui-enterprise-vue/  # Vue 企业预设（TDesign 组件封装）
```

## 开发流程

- **分支策略**：`main` 保持可发布，`dev` 日常集成，功能开发从 `feature/*` 切出
- **提交前验证**：`bun run check`（lint + format + typecheck）和 `bun run build:vue`
- **CI 门禁**：`main` / `dev` 分支 PR 需通过 `pr-format` / `validate`，禁止 force push
- **详细规范**：见 [CONTRIBUTING.md](./CONTRIBUTING.md) 和 [AGENTS.md](./AGENTS.md)

### 常用命令

| 命令 | 说明 |
|---|---|
| `bun run dev:server` | 服务端热更新 |
| `bun run dev:vue` | Vue 前端开发 |
| `bun run check` | lint + format + typecheck |
| `bun run build:vue` | 构建前端 |
| `bun run test` | 单元测试 |
| `bun run e2e:smoke:full` | E2E 冒烟（含 migrate + seed） |
| `bun run e2e:tenant:full` | 多租户 E2E（含 migrate + seed） |
| `bun run server:image:verify` | server 镜像构建 + 本地容器烟测 |
| `bun run go-live:report` | 生成 go-live blocker 报告 |
| `bun run go-live:gate` | 基于报告输出放行 / 阻断结论 |
| `bun run go-live:finalize` | 串联 go-live report -> gate |
| `bun run stack:up` | 容器一键启动 |
| `bun run stack:down` | 停止容器 |

### 首发官方命令链

当前参考发行版首发默认使用以下命令链，不再额外维护第二套“推荐主路径”：

```bash
# 本地启动
bun install
bun run db:migrate
bun run db:seed
bun run dev:server
bun run dev:vue

# 首发验收
bun run check
bun run build:vue
bun run server:image:verify
bun run e2e:smoke:full
bun run e2e:tenant:full

# 真实环境 go-live 附加口径
bun run go-live:report
bun run go-live:gate
```

说明：

- `dev -> main` 的仓库发布先走 `check` / `build:vue` 与 [release-checklist.md](./docs/release-checklist.md)。
- 真实环境上线再追加 `go-live:*`。
- `tenant:release:*` 仅服务 tenant 演练，不代表正式生产发布命令。

## 文档索引

- [项目画像](./docs/PROJECT_PROFILE.md) — 当前项目状态与事实
- [路线图](./docs/roadmap.md) — 活跃工作轨道与进展
- [架构边界](./docs/ARCHITECTURE_GUARDRAILS.md) — 模块职责与依赖约束
- [开发原则](./docs/DEVELOPMENT_PRINCIPLES.md) — 核心开发理念
- [产品定义](./docs/01-product-definition.md) — 产品目标与范围
- [架构草案](./docs/02-architecture.md) — 技术架构设计
- [AI 与代码生成策略](./docs/03-ai-codegen-strategy.md) — AI 辅助开发策略
- [整体实施规划](./docs/06-phased-implementation-plan.md) — 阶段划分与进度
- [发布流转](./docs/07-release-workflow.md) — 发布流程

## 核心原则

1. **企业上线优先于炫技** — 不做自研 SSR 元框架、低代码可视化搭建器
2. **约定优先于配置** — 默认行为覆盖 80% 场景，允许覆盖剩余 20%
3. **结构化生成优先于自由生成** — Schema 驱动，产出可回收、可重构
4. **前后端契约单一来源** — 一个 Schema 定义，多端生成
5. **AI 只放大工程效率，不削弱工程质量** — AI 产出经校验网关，人工兜底始终可用
6. **代码可回收、可重构、可测试** — 生成代码与手写代码同权，不生成不可维护的代码

## 当前状态

项目已完成 7 个阶段的开发（Phase 1–7A），具备完整的后端模块、前端企业预设、代码生成器、AI Schema 转换、生产部署和多租户能力。当前聚焦于**首个可发布参考发行版**：把 `apps/example-vue`、`apps/server`、`packages/persistence` 与 `packages/generator` 收口成真正可开项目、可交付、可上线的 starter。

项目当前不是“早期原型”，而是进入了首发收口阶段。
