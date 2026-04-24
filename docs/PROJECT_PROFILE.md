# PROJECT_PROFILE

更新时间：`2026-04-24`

## 项目类型

- 绿地仓库
- 目标形态是企业级快速开发平台
- 当前阶段已完成 `Phase 2` 认证底座归档、`Phase 3` 标准企业模块闭环（含 `3A/3B/3C` 后端模块与 `3.10/3.11/3.12` Vue 企业预设首版）、`Phase 4` 预验证与 `P4D/P4E` 收口、`Phase 6A Round-2` 生产基线增强收尾与 `Phase 5 / P5A` 归档，并已启动 `Phase 6B`（`P6B3` 真实 PostgreSQL 验证、`ADR-0009`、CI 接入与 tenant 稳定性观察收尾链路已收口，下一步进入观察窗口样本积累与升级执行评审）

## 已确认事实

- 仓库已从纯文档阶段进入最小工程骨架阶段。
- 根目录已存在 [README.md](/E:/Github/Elysian/README.md)。
- 已存在的设计文档包括产品定义、架构草案、AI 与代码生成策略、MVP 路线图、调研与技术决策。
- 仓库目标是以 `Elysia` 为后端内核，以前端可插拔为原则，支持企业级快速开发与 AI 辅助。
- 前端当前不绑定单一实现，设计方向支持 `Vue` 与 `React`。
- 仓库已建立 `Bun workspaces` 工作区。
- 仓库根目录已提供 `docker-compose.yml`，可一键拉起 `server + PostgreSQL` 本地容器栈（含 migrate + seed）。
- 根依赖声明文件已存在：[package.json](/E:/Github/Elysian/package.json)。
- TypeScript 基线配置已存在：[tsconfig.json](/E:/Github/Elysian/tsconfig.json)。
- 已存在一个可运行的服务端入口：[apps/server/src/index.ts](/E:/Github/Elysian/apps/server/src/index.ts)。
- 已存在一个最小服务端装配入口：[apps/server/src/app.ts](/E:/Github/Elysian/apps/server/src/app.ts)。
- 服务端已建立 `config`、`logging`、`errors`、`modules` 四个基础入口。
- 服务端当前已暴露 `/health`、`/platform`、`/system/modules` 三个系统级接口。
- 服务端当前已暴露 `/metrics` 运行时指标快照接口（最小观测基线）。
- 服务端当前已暴露 `/metrics/prometheus` 指标端点（Prometheus exposition 格式，含 `process_uptime_seconds`、`process_start_time_seconds`、`process_cpu_*_seconds_total`、`process_memory_*`）。
- 服务端已落首个真实业务模块：`customer`，并已具备完整 CRUD。
- 服务端已落认证模块：`auth`，并已提供 `POST /auth/login`、`POST /auth/refresh`、`POST /auth/logout`、`GET /auth/me`。
- 服务端已落菜单管理模块：`menu`，并已提供 `GET /system/menus`、`GET /system/menus/:id`、`POST /system/menus`、`PUT /system/menus/:id`。
- 服务端已落角色管理模块：`role`，并已提供 `GET /system/roles`、`GET /system/roles/:id`、`POST /system/roles`、`PUT /system/roles/:id`。
- 服务端已落用户管理模块：`user`，并已提供 `GET /system/users`、`GET /system/users/:id`、`POST /system/users`、`PUT /system/users/:id`、`POST /system/users/:id/reset-password`。
- 服务端已落部门管理模块：`department`，并已提供 `GET /system/departments`、`GET /system/departments/:id`、`POST /system/departments`、`PUT /system/departments/:id`。
- 服务端已落字典管理模块：`dictionary`，并已提供 `GET /system/dictionaries/types`、`GET /system/dictionaries/types/:id`、`POST /system/dictionaries/types`、`PUT /system/dictionaries/types/:id`、`GET /system/dictionaries/items`、`GET /system/dictionaries/items/:id`、`POST /system/dictionaries/items`、`PUT /system/dictionaries/items/:id`。
- 服务端已落系统配置模块：`setting`，并已提供 `GET /system/settings`、`GET /system/settings/:id`、`POST /system/settings`、`PUT /system/settings/:id`。
- 服务端已落租户管理模块：`tenant`，并已提供 `GET /system/tenants`、`GET /system/tenants/:id`、`POST /system/tenants`、`PUT /system/tenants/:id`、`PUT /system/tenants/:id/status`。
- 服务端已落操作日志模块：`operation-log`，并已提供 `GET /system/operation-logs`、`GET /system/operation-logs/:id`、`GET /system/operation-logs/export`。
- 服务端已落文件管理模块：`file`，并已提供 `GET /system/files`、`GET /system/files/:id`、`POST /system/files`、`GET /system/files/:id/download`、`DELETE /system/files/:id`。
- 服务端已落通知管理模块：`notification`，并已提供 `GET /system/notifications`、`GET /system/notifications/:id`、`POST /system/notifications`、`POST /system/notifications/:id/read`。
- `customer` 模块已接入 auth guard，401 / 403 语义已有测试覆盖。
- auth 模块当前已对 `login / refresh / logout / permission denied` 写入最小审计记录，并保留 `request id / ip / user agent / actor / target / result` 字段。
- 在存在 `DATABASE_URL` 时，server 会自动注册 `tenant-context`、`auth`、`tenant`、`customer`、`user`、`role`、`menu`、`department`、`dictionary`、`setting`、`operation-log`、`file` 与 `notification` 模块。
- 服务端已启用 CORS，可直接支撑本地 `dev:server` + `dev:vue` 双端口开发。
- 服务端已支持基于环境变量的最小 CORS 白名单和内存限流策略（生产环境默认启用限流）。
- 限流开启时服务端会返回 `x-ratelimit-limit`、`x-ratelimit-remaining`、`x-ratelimit-reset` 响应头，并在超限时保留 `retry-after`。
- 已存在首个真实前端示例应用：`apps/example-vue`。
- 已存在共享包：`packages/core`、`packages/schema`、`packages/persistence`、`packages/generator`、`packages/frontend-vue`、`packages/frontend-react`、`packages/ui-core`、`packages/ui-enterprise-vue`。
- persistence 路线已确定为 `PostgreSQL + Drizzle ORM + Bun SQL + drizzle-kit`。
- `packages/persistence` 已定义首个真实表：`customers`。
- `packages/persistence` 已提供 `customer` 查询、插入、更新、删除 helper。
- `packages/persistence` 已补 `users / roles / permissions / user_roles / role_permissions / menus / role_menus / refresh_sessions` 的关系型 schema 与 helper。
- `packages/persistence` 已补 `audit_logs` 审计表与最小写入 / 查询 helper。
- `packages/persistence` 已补 users 列表、创建、更新、重置密码等用户管理 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 roles 列表、创建、更新、角色权限替换、角色用户关联替换等角色管理 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 menus 列表、创建、更新、菜单角色关联替换等菜单管理 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 `departments / user_departments` 关系型 schema、migration 与部门 CRUD / 用户关联 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 `dictionary_types / dictionary_items` 关系型 schema、migration 与字典类型 / 字典项 CRUD helper，并保持在 `packages/persistence` owner 内。
- `packages/persistence` 已补 `system_settings` 关系型 schema、migration 与系统配置 CRUD / key 查询 helper，并保持在 `packages/persistence` owner 内。
- `packages/persistence` 已补 `tenants` 查询/创建/更新 helper、请求级 tenant context SQL helper，以及“当前 tenant 优先 + 默认 tenant 回退”的 setting 查询 helper，并保持在 `packages/persistence` owner 内。
- `packages/persistence` 已补 `tenant:init` CLI，可在 persistence owner 内完成“创建 tenant + 幂等补齐租户级角色/权限/菜单/字典/tenant admin”。
- `packages/persistence` 已把默认 `db:seed` 收紧为 tenant-aware 执行路径，显式设置 tenant context，并按 tenant 组合键处理 conflict。
- `packages/persistence` 已为 `db:seed` 与 `tenant:init` CLI 补显式数据库连接回收，降低真实 PostgreSQL 下重复执行时的连接泄漏与 `too many clients` 风险。
- `packages/persistence` 已沿用既有 `audit_logs` owner 补充操作日志按条件查询、详情读取能力，未引入第二套日志表或重复 owner。
- `packages/persistence` 已补 `files` 关系型 schema、migration 与文件元数据 CRUD helper；文件二进制存储仍保持在 `apps/server` runtime owner，不侵入 persistence。
- `packages/persistence` 已补 `notifications` 关系型 schema、migration 与通知 CRUD / 标记已读 helper，并保持在 `packages/persistence` owner 内，不复用 `audit_logs`。
- `packages/persistence` 的 `bun run db:migrate` 已可正常执行已提交的 SQL migrations。
- `packages/persistence` 已支持 `bun run db:tenant:init -- --code <tenant-code> --name <tenant-name> --admin-password <password>` 初始化非默认租户。
- `packages/generator` 已支持为 `customer` 渲染 server 与页面模板，并带基础测试。
- `packages/generator` 已具备最小 CLI，可将已注册 schema 落盘到目标目录。
- `packages/schema` 已补 `validateModuleSchema` 与 `isModuleSchema`，可对 AI/JSON handoff 的 `ModuleSchema` 执行最小 runtime 校验。
- `packages/schema` 已把 `enum` 字段必须提供 `options` 或 `dictionaryTypeCode` 收紧为 runtime 硬约束，避免裸 enum 误过 `P5A` handoff。
- `packages/generator` 已支持 `--schema-file` 直接消费外部 JSON `ModuleSchema`；当 schema 来源为外部文件时，会在生成目录内联 `.schema.ts`，不假设该模块已注册到 `@elysian/schema`。
- 已新增 `bun run p5a:handoff:report` 与 `bun run p5a:handoff:replay`，用于 `P5A` 的失败分类、人工接管和修正后重放。
- `p5a:handoff:replay` 现已输出结构化 replay report，记录 handoff、generator 与生成 schema artifact 证据，补齐 `P5A / WP-3` 的最小文件级审计骨架。
- `p5a:handoff:report` 与 `p5a:handoff:replay` 现已支持输出 GitHub Step Summary 与 `GITHUB_OUTPUT`，便于单次 handoff / replay 诊断直接在 CI 页面判读。
- 已新增 `bun run p5a:handoff:corpus`，用于批量执行 `P5A` 输入/输出语料并校验预期分类边界。
- `p5a:handoff:corpus` 现已支持输出 GitHub Step Summary 与 `GITHUB_OUTPUT`，失败时可直接在 CI 页面查看 case 级摘要。
- P5A corpus 已新增服务工单 mixed 字典/布尔/数字/时间案例，以及字段级越界元数据 failure case，用于继续压实 `retry_ai_generation` / `manual_fix_required` 分界。
- `p5a:acceptance` 已改为 manifest 驱动的多成功 replay/generator case 验收，阶段闭环不再只依赖单一样例。
- `p5a:acceptance` 现已支持输出 GitHub Step Summary 与 `GITHUB_OUTPUT`，CI 页面可直接查看阶段验收状态与 case 数。
- `p5a:acceptance` 成功样例覆盖已扩到 `manual-fix-supplier` 加 `supplier / visitor-pass / asset / service-ticket / meeting-booking` 六条 replay/generator case，继续压实真实需求变体的 handoff 稳定性。
- 已新增 `bun run p5a:acceptance:gate`，基于 acceptance 报告执行后置门禁，固定最小成功 case 数与 generator artifact 证据完整性。
- CI `p5a-acceptance` 作业已接入 acceptance gate，并支持 `workflow_dispatch` 参数化最小 case 数与 artifact 证据策略。
- 已新增 `bun run p5a:acceptance:index`，把 acceptance 与 gate 收敛成单一索引结论文件。
- 已新增 `bun run p5a:acceptance:finalize`，把 acceptance 与 gate 串成一键收尾入口，降低本地执行遗漏而不改变 CI 的分步可见性。
- generator 当前已具备 `skip / overwrite / overwrite-generated-only / fail` 冲突策略与 manifest 输出。
- generator 写入流程已收敛“冲突预检 + 原子写入（temp + rename）”，降低部分写入和中断损坏风险。
- generator 当前官方 staging 落点是仓库根 `generated/`。
- 已新增 `e2e:generator:matrix`，用于多 schema、多冲突策略与多前端目标的生成一致性回归。
- 已新增 `e2e:generator:cli`，用于 generator CLI 真实执行路径冲突策略回归。
- 已新增 `e2e:generator:reports:index`，用于汇总 generator 回归报告索引。
- 已新增 `e2e:generator:reports:gate`，用于按策略执行 generator 回归门禁判定。
- `scripts/e2e-generator-reports-gate.test.ts` 已覆盖来源白名单解析、推荐动作分流与索引一致性校验，降低门禁误配置风险。
- CI 手动触发（`workflow_dispatch`）可动态配置 gate 参数（失败阈值、允许失败来源）。
- `e2e:generator:matrix` 与 `e2e:generator:cli` 支持通过 `ELYSIAN_REPORT_DIR` 指定报告输出目录。
- `packages/schema` 当前已注册 `customer`、`product`、`user`、`role`、`menu`、`department`、`dictionary`、`setting`、`operation-log`、`file` 与 `notification` 十一个模块 schema。
- `packages/frontend-vue` 已提供最小 Vue 预设层，并包含导航构建、权限 gate helper 与供 enterprise preset 消费的页面协议映射。
- `packages/ui-core` 已承接菜单树、CRUD 页面契约与权限相关 UI 协议。
- `packages/ui-enterprise-vue` 已基于 `Arco Design Vue` 落地 `ElyShell`、`ElyTable`、`ElyQueryBar`、`ElyForm`、`ElyCrudWorkspace`、`ElyPreviewSkeleton` 等企业预设组件，并已具备 tabs、标准列表页、标准表单页与只读详情视图。
- `apps/example-vue` 已消费 auth identity、动态菜单、权限 gate 和 `ui-enterprise-vue` 预设组件，并已接入真实 customer enterprise workspace。
- 仓库已具备最小质量链路：`Biome + GitHub Actions CI`。
- CI workflow 已升级至 Node 24 兼容 action 版本（`actions/checkout@v5`、`actions/download-artifact@v7`、`actions/upload-artifact@v6`）。
- 仓库 CI 已新增 `e2e-smoke` 作业（PostgreSQL service + migrate/seed + 登录/customer CRUD 冒烟）、`e2e-tenant` 作业（真实 PostgreSQL 下 tenant init 幂等、super-admin 授权、跨租户隔离、RLS/FK 验证 + artifact 归档）、`e2e-generator-safe-apply` 作业（生成安全覆盖三场景冒烟）、`e2e-generator-matrix` 作业（多 schema / 多策略回归矩阵）、`e2e-generator-cli` 作业（CLI 真实执行路径回归）、`p5a-handoff-corpus` 作业（P5A 语料分类回归 + artifact 归档）、`p5a-acceptance` 作业（P5A 阶段最小闭环验收 + artifact 归档）、`e2e-generator-report-index` 作业（汇总报告索引 artifact）与 `e2e-generator-report-gate` 作业（门禁判定 artifact）。
- `scripts/e2e-smoke.ts` 已支持输出 `e2e-smoke-report.json`（状态、阶段、失败分类、失败信息），CI `e2e-smoke` 作业已归档 smoke report artifact。
- 已新增 `bun run e2e:smoke:diagnose`，可基于 smoke 报告输出诊断结论与建议动作；CI `e2e-smoke` 已接入该诊断步骤并归档诊断结果。
- 已新增 `bun run e2e:tenant` 与 `bun run e2e:tenant:full`，用于真实 PostgreSQL 下验证 tenant init 幂等、super-admin 租户管理授权、customer 跨租户隔离、RLS 与 `tenant_id` 外键约束。
- 已新增 `bun run e2e:tenant:stability:snapshot`，用于把单次 tenant e2e 结果沉淀为稳定性快照（含 run 元数据）；CI `e2e-tenant` 已接入并随 artifact 归档。
- 已新增 `bun run e2e:tenant:stability:evidence`，用于对多次下载的 tenant 稳定性快照做窗口汇总并输出“继续观察 / 可进入下一步”的证据报告。
- 已新增 `bun run e2e:tenant:stability:collect` 与 `bun run e2e:tenant:upgrade:finalize:from-downloads`，用于把下载的 tenant snapshot artifact 归拢后串联 evidence / decision / gate，减少观察窗口收尾遗漏。
- 已新增 `bun run e2e:tenant:stability:download` 与 `bun run e2e:tenant:upgrade:finalize:from-github`，复用本机 `gh` CLI 直接下载最近 tenant CI artifact 并串联升级结论，降低人工逐个下载成本。
- `e2e:smoke:diagnose` 现已支持输出 GitHub Step Summary（状态、阶段、失败分类、建议动作），失败排查无需先下载 artifact。
- `e2e:smoke:diagnose` 已补 `retryRecommendation`（是否建议先重试 + 原因），用于区分瞬时依赖故障与需先修复的问题。
- CI `e2e-smoke` 已接入“依赖类失败自动重试一次”策略：首次失败且 `retryRecommendation.shouldRetry=true` 时自动执行一次重试，并由终态门禁步骤统一判定成功/失败。
- CI `e2e-smoke` 现保留 attempt1/attempt2 独立 smoke 与 diagnosis 报告文件，避免重试覆盖首轮失败证据。
- 已新增 `bun run e2e:smoke:reports:index`，将 attempt 级 smoke 报告聚合为单一索引（含 `finalStatus` 与 `recoveredByRetry`），CI `e2e-smoke` 已接入。
- `e2e:smoke:reports:index` 现已输出 CI Step Summary 与 step outputs（`smoke_final_status`、`smoke_recovered_by_retry`），便于作业页面直接判读本次 smoke 结果。
- 已新增 `bun run e2e:smoke:reports:gate`，按策略（是否允许 recoveredByRetry、最大 attempts）判定本次 smoke 门禁，并输出 gate 报告。
- CI 手动触发（`workflow_dispatch`）已支持 smoke gate 参数输入（是否允许 recoveredByRetry、最大 attempts）。
- 已新增 `bun run e2e:smoke:stability:snapshot`，基于 smoke index/gate 报告生成单次运行稳定性快照（含 run 元数据），CI `e2e-smoke` 已接入并归档。
- 已新增 `bun run e2e:smoke:stability:window`，聚合最近窗口（默认 5 次）稳定性快照并输出窗口结论（连续失败检测、是否可进入下一阶段），CI `e2e-smoke` 已接入并归档。
- 已新增 `bun run e2e:smoke:stability:evidence`，可对多次下载的 smoke 稳定性快照 artifact 做汇总判定并输出阶段决策证据报告。
- 已新增 `bun run e2e:smoke:phase:decision`，基于稳定性证据报告自动生成阶段切换决策 Markdown，减少手工结论漂移。
- 已新增 `bun run e2e:smoke:phase:gate`，基于稳定性证据执行阶段出口硬门禁，确保未达标时不误判可切换阶段。
- 已新增 `bun run e2e:smoke:phase:finalize`，按 evidence → decision → phase gate 顺序执行阶段收尾闭环。
- 已新增 `bun run e2e:smoke:stability:collect`，将下载的多次 CI artifact 快照统一归拢为 evidence 输入目录。
- 已新增 `bun run e2e:smoke:phase:finalize:from-downloads`，一键执行 collect → evidence → decision → phase gate。
- 仓库已采用 `main / dev / feature-*` 的轻量分支模型，并提供 `CONTRIBUTING.md` 与 PR 模板。
- 仓库已补发布流转文档与发布检查清单，用于 `dev -> main` 的阶段发布。
- 仓库已建立双轨文档与 AI 模板骨架：`docs/quickstart`（简略版）、`docs/reference`（详细版）、`docs/ai-playbooks`（AI 剧本）、`skills/templates`（Codex/Claude skill 模板）。
- `docs/ai-playbooks` 已补 `P5A` 专用输入模板、输出契约、验收语料与样例 schema 文件，用于约束 `AI -> Schema` 的最小执行协议。

## 当前未确认项

- 运行入口：`TBD`
  确认路径：前端示例与生成器 CLI 建立后补充更多入口。
- 构建命令：已存在 `bun run build:vue` 用于构建 Vue 示例；服务端独立 build 产物命令仍为 `TBD`
  确认路径：确定 server 首版打包与发布方式后补充。
- 部署方式：已具备本地容器化启动基线（`docker compose`）；生产发布方式仍为 `TBD`
  确认路径：确定正式生产镜像与发布流程后补充。

## 仓库拓扑

当前已存在：

- `package.json`
- `tsconfig.json`
- `README.md`
- `apps/`
- `packages/`
- `docs/`
- `.github/`
- `biome.json`

## 共享能力可能的 owner

- `apps/server`: HTTP API、鉴权接入、OpenAPI 暴露、AI 接口编排
- `packages/schema`: 实体 schema、模块 schema、表单与页面 DSL
- `packages/persistence`: 数据库 client、关系型 schema、迁移配置
- `packages/generator`: 模板、生成规则、文件合并策略
- `packages/core`: 平台级共享基础能力

这些 owner 已作为当前骨架阶段的基线；其中 `config`、`logging`、`error mapping` 已收敛到 `apps/server`，`persistence` 已收敛到 `packages/persistence`。若发生调整，应同步到架构边界文档和 ADR。

## 已知高风险区域

- 前端适配层尚未定稿，容易过早耦合到某一个框架。
- 认证策略已初步固定，但复杂组织权限、数据范围和跨部门隔离仍未进入实现，后续阶段容易出现边界膨胀。
- 多租户基础能力已接入 CI tenant e2e 作业，且已建立单次稳定性快照脚本；但观察窗口样本仍未积累完成，后续阶段需要防止“单次接入 CI 即误判长期稳定”。
- 文件模块当前只验证了本地磁盘存储适配器，尚未进入对象存储、多副本或生产级生命周期治理。
- 通知模块当前只验证了站内通知与已读未读语义，尚未进入邮件、短信、WebSocket 或消息队列投递。
- 如果在 schema 未稳定前直接做 AI 自由生成，后续可维护性风险很高。
- generator 的 apply / merge 机制仍未定稿，二次生成进入正式模块目录的边界还不稳定。
- 当前已有最小验证命令，但仍缺少自动化 E2E 等更完整的工程验证链路。

## 当前可用验证

- 文档检查：人工审阅
- git 状态检查：可用
- GitHub Actions CI（`main` / `dev` push 与 PR）：可用
- `bun install`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run check`
- `bun run e2e:tenant`（需配置 `DATABASE_URL`、`ACCESS_TOKEN_SECRET` 与本地 PostgreSQL）
- `bun run e2e:tenant:full`（需配置 `DATABASE_URL`、`ACCESS_TOKEN_SECRET` 与本地 PostgreSQL）
- `bun run e2e:tenant:stability:download`（需本机已安装并登录 `gh` CLI）
- `bun run e2e:tenant:stability:collect`
- `bun run e2e:tenant:stability:snapshot`
- `bun run e2e:tenant:stability:evidence`
- `bun run e2e:tenant:upgrade:decision`
- `bun run e2e:tenant:upgrade:gate`
- `bun run e2e:tenant:upgrade:finalize`
- `bun run e2e:tenant:upgrade:finalize:from-downloads`
- `bun run e2e:tenant:upgrade:finalize:from-github`（需本机已安装并登录 `gh` CLI）
- `bun run e2e:generator:safe-apply`
- `bun run e2e:generator:matrix`
- `bun run e2e:generator:cli`
- `bun run e2e:generator:reports:index`
- `bun run e2e:generator:reports:gate`
- `bun run build:vue`
- `bun run db:migrate`（需配置 `DATABASE_URL`）
- `bun run tenant:init -- --code <tenant-code> --name <tenant-name> --admin-password <password>`（需配置 `DATABASE_URL`）
- `bun run server`
- `bun run dev:vue`
- `bun run build:vue`
- `bun run stack:up`（需本机可用 Docker）
- `bun run stack:down`
- `bun run stack:reset`
- `GET /metrics`（运行时指标快照）
- Docker PostgreSQL + 浏览器 smoke：已验证 customer create / update / delete 持久化闭环

## 当前不可用验证

- 暂无

## 当前运行与验证命令

- 安装依赖：`bun install`
- 启动服务端：`bun run server`
- 服务端热更新：`bun run dev:server`
- 启动 Vue 示例：`bun run dev:vue`
- 构建 Vue 示例：`bun run build:vue`
- lint：`bun run lint`
- 格式化：`bun run format`
- 全量检查：`bun run check`
- 类型检查：`bun run typecheck`
- 测试：`bun run test`
- E2E 冒烟（仅执行用例）：`bun run e2e:smoke`
- E2E 冒烟（含前置）：`bun run e2e:smoke:full`
- Tenant 隔离 E2E（仅执行用例）：`bun run e2e:tenant`
- Tenant 隔离 E2E（含前置 migrate/seed）：`bun run e2e:tenant:full`
- Tenant 稳定性快照下载：`bun run e2e:tenant:stability:download`
- Tenant 稳定性快照收集：`bun run e2e:tenant:stability:collect`
- Tenant 稳定性快照：`bun run e2e:tenant:stability:snapshot`
- Tenant 稳定性证据汇总：`bun run e2e:tenant:stability:evidence`
- Tenant 升级决策：`bun run e2e:tenant:upgrade:decision`
- Tenant 升级门禁：`bun run e2e:tenant:upgrade:gate`
- Tenant 升级收尾：`bun run e2e:tenant:upgrade:finalize`
- Tenant 从下载包收尾：`bun run e2e:tenant:upgrade:finalize:from-downloads`
- Tenant 从 GitHub 一键收尾：`bun run e2e:tenant:upgrade:finalize:from-github`
- E2E 冒烟报告诊断：`bun run e2e:smoke:diagnose`
- E2E 冒烟报告索引：`bun run e2e:smoke:reports:index`
- E2E 冒烟报告门禁：`bun run e2e:smoke:reports:gate`
- E2E 冒烟稳定性快照：`bun run e2e:smoke:stability:snapshot`
- E2E 冒烟稳定性快照收集：`bun run e2e:smoke:stability:collect`
- E2E 冒烟稳定性窗口：`bun run e2e:smoke:stability:window`
- E2E 冒烟稳定性证据汇总：`bun run e2e:smoke:stability:evidence`
- E2E 冒烟阶段切换决策：`bun run e2e:smoke:phase:decision`
- E2E 冒烟阶段出口门禁：`bun run e2e:smoke:phase:gate`
- E2E 冒烟阶段收尾闭环：`bun run e2e:smoke:phase:finalize`
- E2E 冒烟从下载包一键收尾：`bun run e2e:smoke:phase:finalize:from-downloads`
- Generator 安全写入冒烟：`bun run e2e:generator:safe-apply`
- Generator 回归矩阵：`bun run e2e:generator:matrix`
- Generator CLI 回归：`bun run e2e:generator:cli`
- Generator 报告索引：`bun run e2e:generator:reports:index`
- Generator 报告门禁：`bun run e2e:generator:reports:gate`
- 生成数据库迁移：`bun run db:generate`
- 执行数据库迁移：`bun run db:migrate`
- 初始化非默认租户：`bun run tenant:init -- --code tenant-alpha --name "Tenant Alpha" --admin-password "replace-me"`
- 启动本地容器栈：`bun run stack:up`
- 停止本地容器栈：`bun run stack:down`
- 停止并清空容器数据卷：`bun run stack:reset`
- PowerShell 复制环境文件：`Copy-Item .env.example .env`
- 生成模块模板：`bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue`
- 指定冲突策略：`bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue --conflict fail`
- 使用官方 staging 目录：`bun --filter @elysian/generator generate --schema customer --target staging --frontend vue`
- 从外部 schema 文件生成：`bun --filter @elysian/generator generate --schema-file ./docs/ai-playbooks/examples/supplier.module-schema.json --target staging --frontend vue`
- P5A handoff 报告：`bun run p5a:handoff:report --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-failed.module-schema.json`
- P5A handoff 重放：`bun run p5a:handoff:replay --input-file ./docs/ai-playbooks/examples/p5a-complete-task-input.txt --schema-file ./docs/ai-playbooks/examples/p5a-fixed.module-schema.json --generate --out ./generated/p5a-replay`
- P5A handoff 语料批跑：`bun run p5a:handoff:corpus --manifest ./docs/ai-playbooks/examples/p5a-handoff-corpus.json`
- P5A 阶段最小闭环验收：`bun run p5a:acceptance`
- P5A 阶段验收门禁：`bun run p5a:acceptance:gate`
- P5A 阶段验收索引：`bun run p5a:acceptance:index`
- P5A 阶段一键收尾：`bun run p5a:acceptance:finalize`

## 维护规则

仅在以下变化时更新本文件：

- 技术栈变化
- 构建 / 测试命令变化
- 部署方式变化
- 核心拓扑变化
