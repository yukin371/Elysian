# PROJECT_PROFILE

更新时间：`2026-05-23`

## 项目类型

- 绿地仓库
- 目标形态是可发布的中小项目快速开发平台
- 当前阶段已完成 `Phase 2` 认证底座归档、`Phase 3` 标准企业模块闭环（含 `3A/3B/3C` 后端模块与 `3.10/3.11/3.12` Vue 企业预设首版）、`Phase 4` 预验证与 `P4D/P4E` 收口、`Phase 6A Round-2` 生产基线增强收尾、`Phase 5 / P5A` 归档与 `Phase 6B` 企业增强收口；`P6B3` 的真实 PostgreSQL 验证、`ADR-0009`、CI 接入与 tenant 稳定性观察收尾链路已完成，并已在 `2026-04-25` 通过本地 `bun run check` 与 `bun run e2e:tenant:full` 完成阶段出口复验；`Phase 7 / P7A Round-1` 的最小 workflow 闭环与 `Round-2` 的验证补齐/最小 `claim` 收口均已落地，当前 workflow 阶段结果保持在“已验证的简化运行态”，不默认扩展为通用 BPM 能力；当前优先级已转向首个可发布参考发行版收口，企业后台基础能力作为首批验证对象继续完善，而不是作为主叙事继续外扩

## 已确认事实

- 仓库已从纯文档阶段进入可执行工程骨架持续扩展阶段，当前已具备稳定的 CI、E2E 与多租户治理增量能力。
- 根目录已存在 [README.md](/E:/Github/Elysian/README.md)。
- 已存在的设计文档包括产品定义、架构草案、AI 与代码生成策略、MVP 路线图、调研与技术决策。
- 仓库目标是以 `Elysia` 为后端内核，以前端可插拔为原则，支持中小项目快速开发与 AI 辅助。
- 前端当前不绑定单一实现；当前 C 端界面方向已明确为 `Vue` 第一优先级、`uniapp` 第二优先级设计储备，`React` 暂不进入当前 C 端主线。
- 当前对外首发形态已固定为 `apps/example-vue` 参考发行版，`apps/example-uniapp` 与 `packages/frontend-react` 继续作为并行研发轨道。
- 仓库已建立 `Bun workspaces` 工作区。
- 仓库根目录已提供 `docker-compose.yml`，可一键拉起 `server + PostgreSQL` 本地容器栈（含 migrate + seed）；compose server 会显式把 `DATABASE_URL` 与 `DATABASE_RUNTIME_URL` 都覆盖到 `db:5432` 服务地址，避免宿主机 `.env` 中的 `localhost` 运行态连接串污染容器内 server。
- `apps/server` 已提供最小生产镜像定义文件 `apps/server/Dockerfile`，当前首个正式生产平台基线已固定为“单 Linux 主机 + Docker Engine + 容器镜像优先”；自动回滚、镜像仓库与监控平台仍未定稿。
- 根依赖声明文件已存在：[package.json](/E:/Github/Elysian/package.json)。
- TypeScript 基线配置已存在：[tsconfig.json](/E:/Github/Elysian/tsconfig.json)。
- 已存在一个可运行的服务端入口：[apps/server/src/index.ts](/E:/Github/Elysian/apps/server/src/index.ts)。
- 已存在一个最小服务端装配入口：[apps/server/src/app.ts](/E:/Github/Elysian/apps/server/src/app.ts)。
- 服务端已建立 `config`、`logging`、`errors`、`modules` 四个基础入口。
- 服务端当前已暴露 `/health`、`/platform`、`/system/modules` 三个系统级接口。
- 服务端当前已暴露 `/metrics` 运行时指标快照接口（最小观测基线）。
- 服务端当前已暴露 `/metrics/prometheus` 指标端点（Prometheus exposition 格式，含 `process_uptime_seconds`、`process_start_time_seconds`、`process_cpu_*_seconds_total`、`process_memory_*`）。
- 服务端已落首个真实业务模块：`customer`，并已具备完整 CRUD。
- 服务端已落认证模块：`auth`，并已提供 `POST /auth/login`、`POST /auth/refresh`、`POST /auth/logout`、`GET /auth/me`、`GET /auth/sessions`、`DELETE /auth/sessions/:id`。
- 服务端已落菜单管理模块：`menu`，并已提供 `GET /system/menus`、`GET /system/menus/:id`、`GET /system/menus/export`、`POST /system/menus`、`PUT /system/menus/:id`。
- 服务端已落角色管理模块：`role`，并已提供 `GET /system/roles`、`GET /system/roles/:id`、`GET /system/roles/export`、`POST /system/roles`、`PUT /system/roles/:id`。
- 服务端已落用户管理模块：`user`，并已提供 `GET /system/users`、`GET /system/users/:id`、`POST /system/users`、`PUT /system/users/:id`、`POST /system/users/:id/reset-password`。
- 服务端已落部门管理模块：`department`，并已提供 `GET /system/departments`、`GET /system/departments/:id`、`GET /system/departments/export`、`POST /system/departments`、`PUT /system/departments/:id`。
- 服务端已落岗位管理模块：`post`，并已提供 `GET /system/posts`、`GET /system/posts/:id`、`GET /system/posts/export`、`POST /system/posts`、`PUT /system/posts/:id`。
- 服务端已落字典管理模块：`dictionary`，并已提供 `GET /system/dictionaries/types`、`GET /system/dictionaries/types/:id`、`POST /system/dictionaries/types`、`PUT /system/dictionaries/types/:id`、`GET /system/dictionaries/items`、`GET /system/dictionaries/items/:id`、`POST /system/dictionaries/items`、`PUT /system/dictionaries/items/:id`。
- 服务端已落配置项管理模块：`setting`，并已提供 `GET /system/settings`、`GET /system/settings/:id`、`POST /system/settings`、`PUT /system/settings/:id`。
- 服务端已落租户管理模块：`tenant`，并已提供 `GET /system/tenants`、`GET /system/tenants/:id`、`GET /system/tenants/export`、`POST /system/tenants`、`PUT /system/tenants/:id`、`PUT /system/tenants/:id/status`。
- 服务端已落操作日志模块：`operation-log`，并已提供 `GET /system/operation-logs`、`GET /system/operation-logs/:id`、`GET /system/operation-logs/export`。
- 服务端已落文件管理模块：`file`，并已提供 `GET /system/files`、`GET /system/files/:id`、`GET /system/files/export`、`POST /system/files`、`POST /system/files/delete`、`GET /system/files/:id/download`、`DELETE /system/files/:id`。
- 服务端已落通知管理模块：`notification`，并已提供 `GET /system/notifications`、`GET /system/notifications/:id`、`GET /system/notifications/export`、`POST /system/notifications`、`POST /system/notifications/read`、`POST /system/notifications/:id/read`。
- 服务端已落 `workflow` 简化运行态，当前提供 `GET /workflow/definitions`、`GET /workflow/definitions/:id`、`POST /workflow/definitions`、`PUT /workflow/definitions/:id`、`POST /workflow/instances`、`GET /workflow/instances`、`GET /workflow/instances/:id`、`GET /workflow/tasks/todo`、`GET /workflow/tasks/done`、`POST /workflow/tasks/:id/claim`、`POST /workflow/tasks/:id/complete`、`POST /workflow/instances/:id/cancel`，并已支持最小条件分支运行时、认领后唯一执行人语义，以及任务级最小认领历史保留（`claimSourceAssignee / claimedByUserId / claimedAt`）。
- workflow 权限已从 definition owner 内拆分为 `workflow:definition:*`、`workflow:instance:*` 与 `workflow:task:*` 三组最小权限点，并已新增独立 `workflow:task:claim`；`transfer / delegate` 等更复杂任务语义仍未进入实现。
- workflow 运行态成功动作已补最小审计证据，当前会对 `instance start / task claim / task complete / instance cancel` 写入 `category=workflow` 的 audit log，并复用既有 `requestId / ip / userAgent / actor / target / result / details` 字段；其中 `task claim / complete` 已补任务 ownership context，`instance cancel` 已补被取消待办快照。
- `customer` 模块已接入 auth guard，401 / 403 语义已有测试覆盖。
- auth 模块当前已对 `login / refresh / logout / permission denied` 写入最小审计记录，并保留 `request id / ip / user agent / actor / target / result` 字段。
- 在启用 `tenant-context` 数据库上下文时，`/auth/login` 若未显式传入 `tenantCode`，当前会默认收敛到 `DEFAULT_TENANT_ID` 范围，避免同名用户跨租户误命中。
- 在存在 `DATABASE_RUNTIME_URL` 或 `DATABASE_URL` 时，server 会自动注册 `tenant-context`、`auth`、`tenant`、`customer`、`user`、`role`、`menu`、`department`、`dictionary`、`setting`、`operation-log`、`file` 与 `notification` 模块；运行时若同时提供两者，优先使用 `DATABASE_RUNTIME_URL`，便于把 server 连接切到 `NOSUPERUSER + NOBYPASSRLS` 的受限角色，而 migrate / seed 继续使用管理连接。
- 服务端已启用 CORS，可直接支撑本地 `dev:server` + `dev:vue` 双端口开发；当前也已补 `dev:uniapp` / `build:uniapp` 骨架脚本，供 `uniapp` H5 空壳验证使用。
- 服务端已支持基于环境变量的最小 CORS 白名单和内存限流策略（生产环境默认启用限流）。
- 限流开启时服务端会返回 `x-ratelimit-limit`、`x-ratelimit-remaining`、`x-ratelimit-reset` 响应头，并在超限时保留 `retry-after`。
- 已存在前端应用：`apps/example-vue`（首个参考发行版与主线企业后台验证）、`apps/example-uniapp`（首轮 C 端骨架验证与设计储备）与 `apps/storybook-vue`（第一阶段 public preset 展示与视觉回归入口）。
- 已存在共享包：`packages/core`、`packages/schema`、`packages/persistence`、`packages/generator`、`packages/frontend-vue`、`packages/frontend-react`、`packages/ui-core`、`packages/ui-enterprise-vue` 与 `packages/ui-public-vue`。
- `packages/ui-public-vue` 当前已提供第一阶段 `public-luxe` 品牌预设基线，包含主题 pack 元数据、`data-theme` 运行时契约，以及 `Accordion / Button / Icon Button / Link / Menu / Toolbar / List / DescriptionList / Table / Breadcrumb / Pagination / Stepper / Timeline / Tooltip / Popover / Stat / Meter / Text / Kbd / Avatar / Image / Input / Search Input / Fieldset / Textarea / NumberInput / DateInput / FileInput / Card / Badge / Chip / Toast / Tabs / Dialog / Progress / Spinner / Select / Slider / Rating / Switch / Empty State / Checkbox / Radio Group / Segmented Control / Skeleton / Alert / Divider` 四十七个受控公共组件。
- `apps/storybook-vue` 当前已接入第一阶段 Storybook 入口，用于预览 `public-luxe` 的多主题家族、light / dark / system 模式，并按 `Foundations / Components / Patterns / Showcase` 四层组织公共主题系统的浏览与验收。
- `apps/storybook-vue` 当前已为 `Accordion / Button / Icon Button / Link / Menu / Toolbar / List / DescriptionList / Table / Breadcrumb / Pagination / Stepper / Timeline / Tooltip / Popover / Stat / Meter / Text / Kbd / Avatar / Image / Input / Search Input / Fieldset / Textarea / NumberInput / DateInput / FileInput / Card / Badge / Chip / Toast / Tabs / Dialog / Progress / Spinner / Select / Slider / Rating / Switch / Empty State / Checkbox / Radio Group / Segmented Control / Skeleton / Alert / Divider` 四十七个受控公共组件补齐独立 `Components` stories，便于按组件粒度浏览与回归，不把页面 showcase 当作主入口。
- `apps/storybook-vue` 当前单组件 `Anatomy` stories 已展示来自 `ui-public-vue` 的组件选择依据、组合建议和反模式，帮助评审者在组件详情页直接判断“何时用/如何用/不要怎么用”。
- `apps/storybook-vue` 当前已按 Qingyu 参考项目的组件验收颗粒度加厚全部四十七个 public 组件 stories；每个组件至少保留两个详细场景 story，覆盖 tones、sizes、variants、placements、route-depth scenarios、icon-button toolbar/media/toggle/boundary scenarios、menu action-overflow/keyboard/boundary scenarios、toolbar action-lane/preference/boundary scenarios、search query/recovery/boundary scenarios、table comparison/compact-audit/boundary scenarios、slider intensity/budget/boundary scenarios、rating feedback/read-only/boundary scenarios、meter capacity/quality/boundary scenarios、segmented view-mode/density/boundary scenarios、popover context-preview/support-action/boundary scenarios、spinner inline/local wait/boundary scenarios、fieldset preference/consent/boundary scenarios、textarea creator/support/boundary scenarios、date event/validity/boundary scenarios、file verification/multi-attachment/boundary scenarios、number quantity/precision/boundary scenarios、list collection/navigation scenarios、description profile/policy scenarios、kbd shortcut/inline-help scenarios、page-range scenarios、flow-state scenarios、disclosure scenarios、chronology/schedule scenarios、selection/removal scenarios、dismissal scenarios、field/option sets、validation scenarios、composition scenarios、keyboard review、product/recovery scenarios、media scenarios、loading scenarios 与 section scenarios，并纳入静态契约测试。
- `apps/storybook-vue` 当前已把详细组件场景清单收敛到 `component-story-coverage.ts`，并由 `Components / Index`、`Components / Acceptance Board`、`Components / Handoff Dossier`、`Components / API Reference`、`Component Composition Matrix`、`Components / Variant Matrix`、`Components / State Matrix`、`Components / Scenario Atlas`、静态契约测试与 `e2e:storybook:public` 共同消费；索引页会展示每个组件的文档覆盖、详细场景 story 链接和场景评审焦点分布，并支持按评审焦点过滤组件与场景入口，同时提供 review lane snapshot 摘要当前焦点下的组件清单和代表性场景；Acceptance Board 会把每个 public primitive 按 owner docs、scenario depth、risk focus、state+a11y 与 misuse boundary 汇总成验收总板；Handoff Dossier 会把每个 public primitive 按 intent、contract、story proof、risk focus 与 reject line 组织成 reviewer-ready packet；API Reference 会把 `ui-public-vue` owner docs 的 props、states、accessibility、decision 与 anti-patterns 组织成组件契约表；Component Composition Matrix 会把 owner-documented primitives 组织成 action、form、recovery、editorial、identity、loading 与 confirmation 组合配方；Variant Matrix 会把 owner-documented variant props、runtime state props、scenario proof 与 anti-pattern blocker 组织成新增变体前的审批矩阵；State Matrix 会把 owner-documented states、accessibility notes、risk-focused scenarios 与 state blocker 组织成状态可用性矩阵；Scenario Atlas 会把全部详细场景按 review focus、组件家族和风险路线组织成可直接审查的场景地图，避免 Storybook 导览只剩治理页或页面 showcase。
- `apps/storybook-vue` 当前已补 `Component Operability Board`，用于把 Dialog focus、Alert repair、Input invalid、Select option、Switch runtime、Tabs keyboard、Skeleton loading 与 Progress bounded 等高风险状态汇总成组件行为证据板；该入口只作为展示与评审面，不拥有第二份组件 API、状态机、表单模型或生产交互平台真相。
- `apps/storybook-vue` 当前已补 `Component Failure Gallery`，用于展示 Button 装饰化、Badge CTA 化、Input 缺少 label、Dialog 承接整页流程、Tabs 替代路由、Skeleton 变成最终内容等 primitive 误用案例；该入口只作为展示与评审面，不拥有第二份组件 API、token 或组件实现真相。
- `packages/ui-public-vue` 当前已为 launch theme pack 元数据补充预览色卡信息，供 `Theme Gallery` 一类展示层复用，不把第二套主题描述写回 Storybook。
- `packages/ui-public-vue` 当前已把公共组件文档元数据扩展为 `usage / decision / composition / antiPatterns / props / states / accessibility` 契约，确保组件说明不仅覆盖 API，也覆盖何时使用、如何组合与哪些用法应拒绝。
- `apps/storybook-vue` 当前已补页面级 `Patterns` stories，用于验证 `public-luxe` 在 `Creator Center / Member Rewards / Editorial Collection / Event Landing / Theme Atelier` 一类前台样机场景中的结构与气质，并已补 `Pattern Evidence Atlas / Pattern Readiness Board` 用 user job、主动作、主题证明、移动端顺序、恢复路径与 handoff blocker 汇总 pattern 交付前评审证据。
- `apps/storybook-vue` 当前已补 `Member Rewards` pattern，用于验证 public-luxe 在会员权益、领取动作、tier progress、稀缺提示和历史恢复路径中的组合节奏；该入口只作为展示与评审面，不拥有生产会员业务模型、权益规则或计费流程真相。
- `apps/storybook-vue` 当前已补 `Editorial Collection` pattern，用于验证 public-luxe 在内容专题、受控媒体比例、阅读顺序、内容分区、support link 与 archive recovery 中的组合节奏；该入口只作为展示与评审面，不拥有生产内容 CMS、业务路由或发布流程真相。
- `apps/storybook-vue` 当前已补 `Event Landing` pattern，用于验证 public-luxe 在活动发布、主报名动作、席位进度、日程节奏、政策链接与 access recovery 中的组合节奏；该入口只作为展示与评审面，不拥有生产活动 CMS、票务、计费、直播或日历集成真相。
- `apps/storybook-vue` 当前已补 `Forms & Feedback` pattern，用于验证 `public-luxe` 在标签、说明、校验、同意/确认、进度、状态反馈和空态恢复中的组合节奏；该入口只作为展示与评审面，不拥有业务表单模型或生产流程真相。
- `apps/storybook-vue` 当前已补 `Pattern Failure Gallery`，用于展示多主按钮、恢复路径消失、表单修复文案缺失、装饰越界和主题角色漂移等页面组合失败案例；该入口只作为展示与评审面，不拥有生产缺陷库、业务流程或第二份主题规则。
- `apps/storybook-vue` 当前已把页面级 `Patterns` stories 拆成独立 story 文件，并补 `Patterns` 浏览器烟测，用于验证 `Theme Atelier` 的主题选择、密度决策与同步开关，以及 `Creator Center` 的 tabs、开关与输入编辑联动。
- `apps/storybook-vue` 当前已补 `Theme Gallery / Showcase Hub` 两个 story，作为 `Foundations` 与 `Showcase` 层的辅助入口，帮助从主题预览与系统导览进入组件和 pattern，而不是替代组件级信息架构。
- `apps/storybook-vue` 当前已补 `Design Principles / Design Review Checklist / Release Gate Dashboard / Radius & Color Discipline / Theme Failure Gallery / Theme System Spec / Token Pairing Ledger / Theme Role Matrix / Theme Family Dossier / Theme Selection Playbook / Theme Composition / Theme Readiness / Theme Customization Guardrails / Mode Pairing Lab / Theme Application Recipes / Component Anatomy / Component Usage Matrix / Pattern Composition / Surface Rhythm / Interaction States / Action Hierarchy / Navigation & Wayfinding / Data Display & Summary / Typography & Voice / Material & Motion / Ornament Budget / Layout & Density / Imagery & Iconography / Accessibility & Inclusion` Foundations 治理入口，用于把 public preset 的优雅原则、批准前评审门禁、发布证据驾驶舱、圆角与色彩纪律、失败案例、主题系统规格、token 配对账本、主题角色矩阵、主题族档案、主题选择手册、主题组合、主题批准矩阵、用户自定义主题护栏、明暗模式配对、主题应用配方、组件结构、组件选择矩阵、页面组合语法、容器节奏、圆角/色彩规则、交互状态、动作层级、导航导览、数据摘要、排版文案、材质动效、装饰预算、响应式密度、视觉资产语法与无障碍验收显式化；其中 `Foundations / Index` 已把组件证据板和 pattern 证据板纳入审批地图，`Release Gate Dashboard` 已把主题契约、token 配对、主题角色、主题族档案、主题选择手册、主题批准、组件可操作性、pattern readiness 与失败修复入口串成发布前证据链；这些入口只作为展示与评审面，不拥有主题 token、组件 API、业务文案、生产动效、自定义主题编辑器、生产设置模型、业务布局、生产路由、生产数据模型、版权素材、生产发布流程或生产可访问性测试平台真相。
- `apps/storybook-vue` 当前已补一条浏览器烟测脚本入口，用于验证 `Tabs / Radio Group / Dialog` 在 Storybook iframe 中的真实键盘与焦点路径。
- `apps/storybook-vue` 当前已补主题系统浏览器烟测脚本入口，用于验证 `Theme System Spec` 在真实 Storybook iframe 中的语义 token 可见性、light/dark 预览条、root 主题切换与 live component token 消费，并覆盖 `Token Pairing Ledger` 的 paired token、base token、review route、live specimen，`Theme Role Matrix` 的 role group、theme family、light/dark preview、review route 与 live specimen，`Theme Family Dossier` 的 launch family packet、light/dark proof、role promises、blocker、review route 与 live specimen，以及 `Theme Selection Playbook` 的 decision lane、recommended/alternate choice、family fit、selection checks、review route 与 live specimen。
- `apps/storybook-vue` 当前浏览器烟测已覆盖组件详情页中 `Decision guidance / Composition / Anti-patterns`、组件索引详细场景链接，以及第二批详细场景 story 的真实 iframe 可见性，确保组件深度文档不只停留在静态结构测试。
- persistence 路线已确定为 `PostgreSQL + Drizzle ORM + Bun SQL + drizzle-kit`。
- `packages/persistence` 已定义首个真实表：`customers`。
- `packages/persistence` 已提供 `customer` 查询、插入、更新、删除 helper。
- `packages/persistence` 已补 `users / roles / permissions / user_roles / role_permissions / menus / role_menus / refresh_sessions` 的关系型 schema 与 helper。
- `packages/persistence` 已补 `audit_logs` 审计表与最小写入 / 查询 helper。
- `packages/persistence` 已补 users 列表、创建、更新、重置密码与 `user_posts` 关联 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 roles 列表、创建、更新、角色权限替换、角色用户关联替换等角色管理 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 menus 列表、创建、更新、菜单角色关联替换等菜单管理 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 `departments / user_departments` 关系型 schema、migration 与部门 CRUD / 用户关联 helper，并保持在既有 auth/persistence owner 内。
- `packages/persistence` 已补 `dictionary_types / dictionary_items` 关系型 schema、migration 与字典类型 / 字典项 CRUD helper，并保持在 `packages/persistence` owner 内。
- `packages/persistence` 已补 `system_settings` 关系型 schema、migration 与配置项 CRUD / key 查询 helper，并保持在 `packages/persistence` owner 内。
- `packages/persistence` 已补 `tenants` 查询/创建/更新 helper、请求级 tenant context SQL helper，以及“当前 tenant 优先 + 默认 tenant 回退”的 setting 查询 helper，并保持在 `packages/persistence` owner 内。
- `packages/persistence` 已补 `tenant:init` CLI，可在 persistence owner 内完成“创建 tenant + 幂等补齐租户级角色/权限/菜单/字典/tenant admin”。
- `packages/persistence` 已把默认 `db:seed` 收紧为 tenant-aware 执行路径，显式设置 tenant context，并按 tenant 组合键处理 conflict。
- `packages/persistence` 的 `db:seed` 当前已支持 `--reconcile-seed-labels`，用于显式对齐默认租户既有 seed 菜单/权限的显示文案，而不改变 `setting` / route / permission code 契约。
- `packages/persistence` 已为 `db:seed` 与 `tenant:init` CLI 补显式数据库连接回收，降低真实 PostgreSQL 下重复执行时的连接泄漏与 `too many clients` 风险。
- `packages/persistence` 已沿用既有 `audit_logs` owner 补充操作日志按条件查询、详情读取能力，未引入第二套日志表或重复 owner。
- `packages/persistence` 已补 `files` 关系型 schema、migration 与文件元数据 CRUD helper；文件二进制存储仍保持在 `apps/server` runtime owner，不侵入 persistence。
- `packages/persistence` 已补 `notifications` 关系型 schema、migration 与通知 CRUD / 标记已读 helper，并保持在 `packages/persistence` owner 内，不复用 `audit_logs`。
- `packages/persistence` 已补 `workflow_definitions / workflow_instances / workflow_tasks` 关系型 schema、migration 与最小查询 / 插入 / 更新 helper，并支持任务结果、实例历史任务读取、待办取消、已办查询与最小认领历史字段持久化，用于当前简化的 workflow 运行态。
- `packages/persistence` 默认 auth seed 已补 workflow definition / instance / task 的最小权限点，并继续将 workflow 菜单可见性挂在 definition list 权限上。
- `packages/persistence` 的 `bun run db:migrate` 已可正常执行已提交的 SQL migrations。
- `packages/persistence` 已支持 `bun run db:tenant:init -- --code <tenant-code> --name <tenant-name> --admin-password <password>` 初始化非默认租户。
- `packages/persistence` 已补 workflow repository 独立测试，当前通过 `PGlite` 嵌入式 PostgreSQL 兼容底座覆盖 definition 版本唯一性、next version 计算、todo/done 查询边界、实例任务排序与取消语义；tenant RLS 仍继续由 server 测试与真实 PostgreSQL E2E 兜底。
- `packages/generator` 已支持为 `customer` 渲染 server 与页面模板，并带基础测试，当前优先继续收口 preview/report、安全 staging apply、前端 artifact 与正式模块人工接线证据链路。
- `packages/generator` 已具备最小 CLI，可将已注册 schema 落盘到目标目录。
- `packages/generator` 已新增 preview/report 能力，可在不写入目标目录的前提下输出文件动作预览、内容快照报告与 review-only SQL preview。
- `packages/generator` 已新增 `DatabaseChangePlan` 中性数据库变更描述，可从 `ModuleSchema` 产出 reviewable create-table 计划，继续保持正式 migration owner 在 `packages/persistence`。
- `packages/schema` 已支持 `text` / `json` 字段类型，以及 `expandSimplifiedSchema` 简化输入展开，可把轻量 JSON 输入收敛为标准 `ModuleSchema`。
- `packages/schema` 当前已允许可选 `frontend` 注册元数据（`workspaceDomain`、`routePath`、`permissionPrefix`、`permissionActions`、`workspaceKind`、`moduleCode`），作为 generator 输出前端静态注册 artifact 的完整契约入口。
- 13 个标准 CRUD `ModuleSchema` 已补 `frontend` 元数据，覆盖 `customer` / `file` / `notification` / `operation-log` / `tenant` / `workflow`（business）和 `dictionary` / `department` / `post` / `menu` / `role` / `setting` / `user`（system）。
- `packages/frontend-vue` 已提供 `buildWorkspaceRegistration(schema)` 函数，可从 `ModuleSchema` 的 `frontend` 元数据推导出完整的 `WorkspaceRegistration`（domain / path / kind / moduleCode / permissionPrefix / permissions / i18nKeys），无需手写同构记录。
- `apps/example-vue` 的 `system-registry.ts` 与 `business-registry.ts` 已从手写注册切换为 schema 驱动注册，13 个标准 CRUD 模块通过 `buildWorkspaceRegistration` 生成；`auth-registry`（session 无 schema）与 `generator-preview`（特殊 workspace）仍保持手写。
- `packages/generator` 当前除 `schema/repository/service/routes/page` 外，还会额外生成 `*.frontend.ts` 静态前端注册 artifact，已包含 `kind`、`permissions`、`surfaceKind` 与页面装配路径；`apps/example-vue` 已开始通过 app-local generated artifact 输入构建 workspace registry，而不是只从 schema 直连注册。
- `packages/generator` 当前已支持 `--target module` 直接产出模块目录内的 server 集成桩，并会额外生成 `*.persistence.ts` Drizzle schema 模板，供人工复制到 `packages/persistence` 继续完成正式 schema / migration 集成。
- `apps/example-vue` 当前已把 workspace registry artifact 校验收口进默认工程入口：`@elysian/example-vue` 的 `build` 与仓库根 `bun run check` 都会显式执行 `verify:workspace-registry-artifacts`，标准 CRUD shell descriptor 漏接线或 generated artifact 漂移不会再只依赖人工记忆发现。
- `apps/example-vue` 当前已把标准 CRUD 前端 surface 落盘到 `src/modules/*`，并由 shell main / secondary 真实消费；`@elysian/example-vue` 的 `build` 与仓库根 `bun run check` 已显式执行 `verify:standard-crud-surfaces`，标准 CRUD 页面骨架与生成器模板漂移不会再静默积累。
- `apps/example-vue` 当前已新增 `demohub` prototype-only workspace，专门承接页面信息架构与交互试稿；当前 `generator preview` 的主流程试验先在该页验证，不直接接入真实 session / apply 能力。
- `packages/persistence` 已新增 migration proposal 草案生成能力，可消费 `DatabaseChangePlan` 形状并输出 review-only SQL draft、Drizzle schema snippet 与风险说明；正式 `db:generate / db:migrate` 仍保持人工确认后进入。
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
- 已新增 `e2e:generator:studio`，用于真实 `generator preview` workspace 的 guided happy path / blocked apply 验收。
- 已新增 `e2e:generator:browser`，用于在真实 Vue 路由中执行 `generator preview` 浏览器级 smoke，覆盖首屏结构、起稿输入、review / confirm / apply 主动作与阻断证据可见性；该入口只作为 Phase G-B 信心补强，不扩成通用浏览器 E2E 平台。
- 已新增 `e2e:generator:reports:index`，用于汇总 generator 回归报告索引；当前索引来源包含 `matrix`、`cli`、`studio` 与 `browser`，并可识别 CI artifact 子目录与本地扁平报告文件两种形态。
- 已新增 `e2e:generator:reports:gate`，用于按策略执行 generator 回归门禁判定；CI 当前要求 `matrix / cli / studio / browser` 四类 report source 同时存在，避免 browser 或其他 generator artifact 缺失时误判通过。
- `scripts/e2e-generator-reports-index.ts` 与 `scripts/e2e-generator-reports-gate.ts` 现已支持输出 GitHub Step Summary 与 `GITHUB_OUTPUT`，便于 CI 页面直接判读 generator reports index / gate 结论。
- `scripts/e2e-generator-reports-gate.test.ts` 已覆盖来源白名单解析、必需来源缺失检测、推荐动作分流与索引一致性校验，降低门禁误配置风险。
- CI 手动触发（`workflow_dispatch`）可动态配置 gate 参数（失败阈值、允许失败来源）。
- `e2e:generator:matrix`、`e2e:generator:cli` 与 `e2e:generator:studio` 支持通过 `ELYSIAN_REPORT_DIR` 指定报告输出目录；`e2e:generator:browser` 默认输出到 `.ci-reports/generator-browser-smoke`，也可通过 `ELYSIAN_BROWSER_SMOKE_REPORT_DIR` 覆盖。
- `packages/schema` 当前已注册 `customer`、`product`、`user`、`role`、`menu`、`department`、`dictionary`、`setting`、`operation-log`、`file` 与 `notification` 十一个模块 schema。
- `packages/schema` 已补 workflow definition / instance / task 的最小 contract，并补实例历史任务视图、任务结果字段与条件表达式白名单校验，用于当前 agent 自编排辅助工具的流程定义与运行态数据交换。
- `packages/frontend-vue` 已提供最小 Vue 预设层，并包含导航构建、权限 gate helper 与供 enterprise preset 消费的页面协议映射。
- `packages/ui-core` 已承接菜单树、CRUD 页面契约与权限相关 UI 协议。
- `packages/ui-enterprise-vue` 已落地 `ElyShell`、`ElyTable`、`ElyQueryBar`、`ElyForm`、`ElyCrudWorkspace`、`ElyPreviewSkeleton` 等企业预设组件；当前运行时底座已完成 `TDesign Vue Next` 收口，并已具备 tabs、标准列表页、标准表单页与只读详情视图。
- `2026-05-12` 首个参考发行版已完成本地发布门槛复验：`bun run check`、`bun run build:vue`、`bun run server:image:verify`、`bun run e2e:smoke:full`、`bun run e2e:tenant:full` 与 `bun run e2e:generator:cli` 均已通过；当前 `Phase G` 额外把真实 workspace 验收固定为 `bun run e2e:generator:studio`，并用 `bun run e2e:generator:browser` 补一层真实路由浏览器 smoke，用于压实 `generator preview` 的 review / confirm / apply 真链路回归。真实环境 go-live 仍需环境 owner 补齐 release tag / PR、migration、backup / recovery、proxy / TLS、值守与目标环境冒烟输入。
- `packages/persistence` 的 `db:seed` 已包含默认 workflow definitions 样本（`expense-approval v1/v2`、`expense-approval-condition v1`），默认开发环境无需前端 override 也可验证 workflow 版本历史；`apps/example-vue` 的 override seam 当前只用于稳定复现特定测试样本。
- `apps/example-vue` 已消费 auth identity、动态菜单、权限 gate 和 `ui-enterprise-vue` 预设组件，并已接入真实 customer enterprise workspace；当前定位已从“最小交互验证页”转为首个参考发行版的前端 owner，不再只是单模块验证。
- `apps/example-vue` 的 customer workspace 已从“前端拉全量后本地筛选”收敛到服务端列表协议，当前 `GET /customers` 已承接 query、分页与排序参数，并返回 page metadata 供工作区 footer 分页交互消费。
- `apps/example-vue` 的 generator preview workspace 已接入 `generator-session` 后端运行态，当前由 preview session DTO 驱动文件计划、差异摘要、SQL preview 与 staging apply 证据；schema 选项仍保持在前端注册表内解析。
- `apps/example-vue` 的 generator preview workspace 当前已补简化 schema 草稿输入、模板快速填充、结构化校验反馈与步骤引导流，降低首次使用门槛。
- 服务端已落生成会话运行时模块：`generator-session`，并已提供 `GET /studio/generator/sessions`、`GET /studio/generator/sessions/:id`、`POST /studio/generator/sessions/preview`、`POST /studio/generator/sessions/:id/review`、`POST /studio/generator/sessions/:id/confirm`、`POST /studio/generator/sessions/:id/apply` 与 `POST /studio/generator/validate-schema` 最小后端闭环。
- `generator-session` 当前已落最小持久化回放中心：session 元数据进入 `packages/persistence` 的关系型表，preview report 仍按文件落盘并由 `apps/server` 运行时回放读取，避免把生成内核 owner 迁入数据库层。
- 生成预览报告中心当前已具备后端最小运行态：可输出 preview report、review-only SQL preview 与 `DatabaseChangePlan`，并按会话落盘到 `generated/reports/generator-sessions/*.preview.json`。
- generator 当前已支持基于 preview report 的安全 staging apply：apply 前会重验目标文件状态是否漂移，成功后写入 staging manifest，并把 apply 证据回传给 `generator-session`。
- 仓库已具备最小质量链路：`Biome + GitHub Actions CI`。
- 仓库当前已使用 `Husky` 托管 `pre-commit / commit-msg / pre-push` 本地 hooks；`bun install` 会自动执行 `prepare` 完成安装，并保留 `bun run hooks:install` 作为手动修复入口。
- CI workflow 已升级至 Node 24 兼容 action 版本（`actions/checkout@v5`、`actions/download-artifact@v7`、`actions/upload-artifact@v6`）。
- 仓库 CI 已新增 `e2e-smoke` 作业（PostgreSQL service + migrate/seed + 登录/customer CRUD 冒烟）、`e2e-tenant` 作业（真实 PostgreSQL 下 tenant init 幂等、super-admin 授权、跨租户隔离、RLS/FK 验证 + artifact 归档）、`e2e-generator-safe-apply` 作业（生成安全覆盖三场景冒烟）、`e2e-generator-matrix` 作业（多 schema / 多策略回归矩阵）、`e2e-generator-cli` 作业（CLI 真实执行路径回归）、`e2e-generator-browser` 作业（真实 Vue 路由浏览器 smoke + 截图 artifact）、`p5a-handoff-corpus` 作业（P5A 语料分类回归 + artifact 归档）、`p5a-acceptance` 作业（P5A 阶段最小闭环验收 + artifact 归档）、`e2e-generator-report-index` 作业（汇总报告索引 artifact）与 `e2e-generator-report-gate` 作业（门禁判定 artifact）。
- GitHub Actions 当前还提供 `Tenant Release Rehearsal` 手动工作流：先从 GitHub 下载 tenant artifact 生成 evidence / decision，再把人工确认项映射给 `tenant:release:finalize`；该入口仅服务 release rehearsal，不代表生产发布平台命令，当前已固定为 tenant 发布演练默认入口。
- `Tenant Release Rehearsal` 已完成一次真实 GitHub `workflow_dispatch` 验证（run `24894806843`）：workflow 可稳定下载 tenant artifact、生成 evidence / decision、执行 release gate 并上传 rehearsal artifact；在固定 checkout 后 git 基线后，gate 仅保留目标环境与发布后验证相关的 `8` 个预期 blocker。
- `scripts/e2e-smoke.ts` 已支持输出 `e2e-smoke-report.json`（状态、阶段、失败分类、失败信息），CI `e2e-smoke` 作业已归档 smoke report artifact。
- `scripts/e2e-smoke.ts` 已纳入 workflow 真实运行态 smoke，当前覆盖 definition 创建、实例发起、manager/finance 待办、`approved/rejected`、最小 `claim`、显式 instance cancel、条件分支命中与 `default` 分支、done/instance list，以及 workflow 审计日志端到端校验，并补高位随机端口与 Windows 端口释放清理，支持临时 PostgreSQL 库下重复执行。
- `bun run e2e:smoke:full` 当前会执行 `bun run db:seed -- --reconcile-admin-password`，用于在本地已存在默认管理员但密码已漂移的数据库上保持 smoke 重跑确定性。
- 已新增 `bun run e2e:smoke:diagnose`，可基于 smoke 报告输出诊断结论与建议动作；CI `e2e-smoke` 已接入该诊断步骤并归档诊断结果。
- 已新增 `bun run e2e:tenant` 与 `bun run e2e:tenant:full`，用于真实 PostgreSQL 下验证 tenant init 幂等、super-admin 租户管理授权、customer 跨租户隔离、RLS 与 `tenant_id` 外键约束。
- `scripts/e2e-tenant-isolation.ts` 当前已改为优先读取 `ELYSIAN_TENANT_PORT`，默认走随机高位端口，不再受通用 `PORT` 环境变量污染影响。
- 已新增 `bun run e2e:tenant:stability:snapshot`，用于把单次 tenant e2e 结果沉淀为稳定性快照（含 run 元数据）；CI `e2e-tenant` 已接入并随 artifact 归档。
- 已新增 `bun run e2e:tenant:stability:evidence`，用于对多次下载的 tenant 稳定性快照做窗口汇总并输出“继续观察 / 可进入下一步”的证据报告。
- 已新增 `bun run e2e:tenant:stability:collect` 与 `bun run e2e:tenant:upgrade:finalize:from-downloads`，用于把下载的 tenant snapshot artifact 归拢后串联 evidence / decision / gate，减少观察窗口收尾遗漏。
- 已新增 `bun run e2e:tenant:stability:download` 与 `bun run e2e:tenant:upgrade:finalize:from-github`，复用本机 `gh` CLI 直接下载最近 tenant CI artifact 并串联升级结论，降低人工逐个下载成本。
- 已完成 tenant 真实观察收尾：先基于 `workflow_dispatch` 连续 `5/5` 样本得到 `candidate_for_next_step`，随后用 `ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10` 完成首轮 `10/10` 滚动观察；当前结论为 `failedRunCount=0`、`systemicBlockerDetected=false`、`recommendation=candidate_for_next_step`，并已作为 `Phase 6B` 阶段出口证据归档。
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

- 运行入口：本地开发入口已确认 `bun run dev:server` / `bun run server`；容器运行入口已确认 `apps/server/Dockerfile`
  确认路径：若后续新增 worker、job 或多进程运行面，再补充更多运行入口。
- 构建命令：已存在 `bun run build:vue`、`bun run build:uniapp`、`bun run build:storybook:vue` 与 `bun run server:image:build`
  补充：已存在 `bun run server:image:smoke` 与 `bun run server:image:verify`，用于镜像构建后的本机容器烟测。
  补充：已存在 `bun run go-live:report`、`bun run go-live:handoff`、`bun run go-live:gate` 与 `bun run go-live:finalize`，用于把 go-live 阻断项收敛成统一报告、按角色拆分交接包与门禁结论。
  确认路径：若后续需要 server bundle、签名产物或多架构镜像，再补充更正式的 build matrix。
- 部署方式：已固定首个正式生产平台基线为“单 Linux 主机 + Docker Engine”；具体镜像仓库、反向代理实现、自动回滚与监控告警平台仍为 `TBD`
  确认路径：后续按平台化能力逐项补 ADR / runbook。

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
- 多租户基础能力已接入主线相关的 CI tenant e2e 作业，并已完成历史功能分支样本、`dev`、`main` 三段 `10/10` 滚动观察；当前无系统性失败信号，且仓库已补 `tenant:release:report`、`tenant:release:gate`、`tenant:release:finalize` 作为 release rehearsal 执行层自动化，但生产发布平台、数据库快照编排与发布后演练仍未固化到平台级自动化。
- 文件模块当前只验证了本地磁盘存储适配器，尚未进入对象存储、多副本或生产级生命周期治理。
- 通知模块当前只验证了站内通知与已读未读语义，尚未进入邮件、短信、WebSocket 或消息队列投递。
- workflow 模块当前只验证了线性审批、最小动作闭环与白名单条件分支；独立权限点与更复杂任务语义仍未进入实现。
- 如果在 schema 未稳定前直接做 AI 自由生成，后续可维护性风险很高。
- generator 的安全 staging apply 已可用；二次生成进入正式模块目录仍以 `--target module` 集成桩和人工确认清单为边界，正式 migration / menu / permission / registry 合入不得自动化冒进。
- 当前参考发行版的本地自动化验证链路已包含 `check`、Vue 构建、server 镜像烟测、smoke E2E、tenant E2E 与 generator CLI 回归；后续风险主要转向真实 go-live 环境输入、生产级对象存储、通知投递与更复杂 workflow 语义。
- 已新增 `bun run go-live:handoff`，可基于 `go-live-report.json` 产出预填 `.env` 草稿和按 `发布负责人 / 环境-DBA / 应用 owner` 拆分的交接包，继续降低发布负责人二次摘字段与漏传 blocker 的协调风险。

## 当前可用验证

- 文档检查：人工审阅
- git 状态检查：可用
- GitHub Actions CI（`main` / `dev` push 与 PR）：可用
- `bun install`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run check`
- `bun run verify:required-generated-artifacts`
- `bun run lint:workflows`（需本机可用 `actionlint`）
- `bun run example-vue:workspace-registry:verify`
- `bun run example-vue:standard-crud-surfaces:verify`
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
- `bun run tenant:release:report`（既有 tenant migration/release runbook 的 rehearsal report 自动化；不等于生产平台发布命令）
- `bun run tenant:release:gate`（既有 tenant migration/release runbook 的 rehearsal gate 自动化；不等于生产平台发布命令）
- `bun run tenant:release:finalize`（既有 tenant migration/release runbook 的 rehearsal finalize 自动化；不等于生产平台发布命令）
- `bun run e2e:generator:safe-apply`
- `bun run e2e:generator:matrix`
- `bun run e2e:generator:cli`
- `bun run e2e:generator:studio`
- `bun run e2e:generator:browser`
- `bun run e2e:storybook:public`
- `bun run e2e:storybook:theme-system`
- `bun run e2e:storybook:patterns`
- `bun run e2e:generator:reports:index`
- `bun run e2e:generator:reports:gate`
- `bun run build:vue`
- `bun run build:storybook:vue`
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
- 启动 Vue Storybook：`bun run dev:storybook:vue`
- 启动 uniapp H5 骨架：`bun run dev:uniapp`
- 构建 Vue 示例：`bun run build:vue`
- 构建 Vue Storybook：`bun run build:storybook:vue`
- 生成 example-vue workspace registry artifact：`bun run example-vue:workspace-registry:generate`
- 校验 example-vue workspace registry artifact：`bun run example-vue:workspace-registry:verify`
- 生成 example-vue 标准 CRUD surface：`bun run example-vue:standard-crud-surfaces:generate`
- 校验 example-vue 标准 CRUD surface：`bun run example-vue:standard-crud-surfaces:verify`
- 构建 uniapp H5 骨架：`bun run build:uniapp`
- lint：`bun run lint`
- 校验关键 generated 产物：`bun run verify:required-generated-artifacts`
- 校验 GitHub workflows：`bun run lint:workflows`
- 格式化：`bun run format`
- 全量检查：`bun run check`
- 手动重装 hooks：`bun run hooks:install`
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
- Tenant 发布演练报告：`bun run tenant:release:report`
- Tenant 发布演练门禁：`bun run tenant:release:gate`
- Tenant 发布演练收尾：`bun run tenant:release:finalize`
- Go-live 报告：`bun run go-live:report`
- Go-live 交接包：`bun run go-live:handoff`
- Go-live 门禁：`bun run go-live:gate`
- Go-live 一键收尾：`bun run go-live:finalize`
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
- Generator workspace guided 回归：`bun run e2e:generator:studio`
- Generator 浏览器 smoke：`bun run e2e:generator:browser`
- Storybook 公共组件浏览器烟测：`bun run e2e:storybook:public`
- Storybook 主题系统浏览器烟测：`bun run e2e:storybook:theme-system`
- Storybook 页面样机浏览器烟测：`bun run e2e:storybook:patterns`
- Generator 报告索引：`bun run e2e:generator:reports:index`
- Generator 报告门禁：`bun run e2e:generator:reports:gate`
- 生成数据库迁移：`bun run db:generate`
- 执行数据库迁移：`bun run db:migrate`
- 默认租户 seed：`bun run db:seed`
- 默认租户 seed 文案对齐：`bun run db:seed -- --reconcile-seed-labels`
- 初始化非默认租户：`bun run tenant:init -- --code tenant-alpha --name "Tenant Alpha" --admin-password "replace-me"`
- 启动本地容器栈：`bun run stack:up`
- 停止本地容器栈：`bun run stack:down`
- 停止并清空容器数据卷：`bun run stack:reset`
- PowerShell 复制环境文件：`Copy-Item .env.example .env`
- 生成模块模板：`bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue`
- 指定冲突策略：`bun --filter @elysian/generator generate --schema customer --out ./generated --frontend vue --conflict fail`
- 预览生成结果：`bun --filter @elysian/generator generate --schema customer --target staging --frontend vue --preview`
- 输出预览报告：`bun --filter @elysian/generator generate --schema customer --target staging --frontend vue --preview --report ./generated/reports/customer.preview.json`
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
