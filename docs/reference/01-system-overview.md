# 系统总览

本文只记录当前仓库已经形成的系统边界，不把并行研发轨道写成首发能力。

## 产品定位

Elysian 当前定位为“可发布的中小项目快速开发平台”。首个参考发行版固定为：

- 前端：`apps/example-vue`
- 后端：`apps/server`
- 数据库：PostgreSQL
- 生成器：`packages/generator`
- 正式迁移 owner：`packages/persistence`

首发目标是让新团队能按仓库文档完成安装、启动、登录、常用后台模块操作、标准模块生成和发布前验证。React、uniapp、复杂 BPM、低代码 Studio 与自动化发布平台不进入当前首发门槛。

## 模块边界

| 模块 | 当前 owner | 不拥有 |
|---|---|---|
| `apps/server` | HTTP API、auth、模块装配、generator-session 运行态、server 镜像入口 | 前端页面实现、正式 migration 生成规则 |
| `apps/example-vue` | 首发参考前端、企业后台 shell、workspace 装配、generator preview 消费 | server 业务规则、persistence schema、generator 引擎 |
| `packages/schema` | `ModuleSchema`、简化 schema 展开、runtime 校验契约 | API 调用、数据库访问、UI 组件 |
| `packages/generator` | 模板、preview/report、staging apply、生成 manifest、`--target module` 集成桩 | 正式 migration 合并、运行时鉴权、业务领域规则 |
| `packages/persistence` | Drizzle schema、SQL migrations、seed、tenant init、持久化 helper | HTTP 路由、前端状态、页面 DSL |
| `packages/frontend-vue` | Vue 适配层、workspace registration 推导、权限与页面协议消费 | React 实现、后端持久化 |
| `packages/ui-enterprise-vue` | TDesign 企业预设组件与视觉基线 | 应用级业务流程、后端契约 |

## 关键不变量

- 先走 schema 契约，再进入 generator；AI 不直接修改平台核心基础设施。
- `staging apply` 是安全生成路径；正式模块目录仍需人工确认 migration、menu、permission、registry 等接线。
- `apps/example-vue` 是首发参考发行版前端 owner，不新增第二套 starter 真相。
- `tenant:release:*` 只表示 tenant 发布演练，不代表生产发布平台命令。
- `go-live:*` 只表示真实环境上线附加门禁，不替代 `dev -> main` 的仓库发布检查。
- 真实 go-live 的备份、恢复、proxy、TLS、值守和目标环境 smoke 由环境 owner / DBA / 发布负责人锁定，仓库只提供输入模板和门禁口径。

## 典型流程

### 本地启动

```powershell
bun install
Copy-Item .env.example .env
bun run db:migrate
bun run db:seed
bun run dev:server
bun run dev:vue
```

### 标准模块生成

```powershell
bun --filter @elysian/generator generate --init supplier
bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --target staging --frontend vue --preview
bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --out ./generated --frontend vue
```

如果需要查看服务端模块目录集成桩，先用：

```powershell
bun --filter @elysian/generator generate --schema-file ./supplier.module-schema.json --target module --frontend vue --preview
```

### 仓库发布验证

```powershell
bun run check
bun run build:vue
bun run server:image:verify
bun run e2e:smoke:full
bun run e2e:tenant:full
```

### 真实环境上线附加门禁

```powershell
bun run go-live:report
bun run go-live:handoff
bun run go-live:gate
```

`go-live:*` 的输入模板见 [09-go-live-gate-input-template.md](./09-go-live-gate-input-template.md)。若缺少 release tag / PR、migration 顺序、backup / recovery、proxy / TLS、值守或目标环境 smoke 证据，脚本应继续阻断上线；若需要直接分发 blocker 和 `envKeys`，先执行 `go-live:handoff` 生成预填 `.env` 与按角色拆分的交接包。
