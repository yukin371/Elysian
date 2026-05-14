# 2026-05-12 首个参考发行版实施进展记录

本文件用于记录 `2026-05-12-reference-starter-release-plan.md` 的已完成任务与当前证据位置。

---

任务编号：`T1-1`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 统一 `README`、`docs/roadmap.md`、`docs/PROJECT_PROFILE.md`、首发 spec 的首发表述
- 固定“首个可发布参考发行版”作为当前主线
- 明确 `apps/example-vue` 是首发参考发行版前端 owner

验证结果：

- 人工对读以下文档，首发表述已对齐：
  - `README.md`
  - `docs/roadmap.md`
  - `docs/PROJECT_PROFILE.md`
  - `docs/plans/2026-05-12-reference-starter-release-plan.md`
- `git diff --check` 已通过当前文档改动

产出位置：

- `README.md`
- `docs/roadmap.md`
- `docs/PROJECT_PROFILE.md`
- `docs/plans/2026-05-12-reference-starter-release-plan.md`

未覆盖：

- 不再逐一扫描历史归档文档；当前首发主路径文档已对齐

残留风险：

- 后续若新增首发相关文档，按 `AGENTS.md` 文档同步规则维护，避免口径漂移

---

任务编号：`T1-2`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 固定首发官方命令链
- 在 `README` 中补齐本地启动、首发验收、go-live 附加命令
- 明确 `tenant:release:*` 仅服务 rehearsal

验证结果：

- `README.md` 已包含：
  - 本地启动命令
  - 首发验收命令
  - `go-live:*` 命令
- `package.json` 已确认包含这些脚本入口

产出位置：

- `README.md`
- `package.json`
- `docs/plans/2026-05-12-reference-starter-release-plan.md`

未覆盖：

- README 已补 generator 首发 Happy Path；不再作为本轮风险

残留风险：

- 若后续新增第二套推荐命令链，会重新引入首发主路径歧义

---

任务编号：`T1-3`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 在首发 spec 中固定完成定义
- 明确首发范围、非目标、固定决策、外部前提和验收矩阵
- 把首发 spec 拆到任务、批次、归档规则和完成模板层

验证结果：

- `docs/plans/2026-05-12-reference-starter-release-plan.md` 已包含：
  - 首发完成定义
  - 首发范围 / 非目标
  - `T1-1` 到 `T5-3`
  - 批次推进规则
  - 单任务完成记录模板

产出位置：

- `docs/plans/2026-05-12-reference-starter-release-plan.md`

未覆盖：

- 任务状态以本进展记录与验收包为准，spec 本文保留为任务定义，不重复维护状态

残留风险：

- 后续新增任务时必须同步进展记录或验收包，避免定义与结论分离

---

任务编号：`T4-1`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 把仓库发布、真实环境上线、tenant 演练三层口径写清楚
- 在 `release-checklist` 中明确三层场景
- 在 `go-live runbook` 中明确其不替代仓库发布与 tenant rehearsal
- 在 `07-release-workflow.md` 中补首发默认口径

验证结果：

- `docs/release-checklist.md` 已区分：
  - `A. 仓库发布清单`
  - `B. 正式上线附加清单（go-live）`
  - `Tenant 发布演练附加检查`
- `docs/reference/05-go-live-runbook.md` 已声明只处理真实环境上线层
- `docs/07-release-workflow.md` 已补“当前默认口径”

产出位置：

- `docs/release-checklist.md`
- `docs/reference/05-go-live-runbook.md`
- `docs/07-release-workflow.md`

未覆盖：

- 与首发发布路径直接相关的文档已覆盖；历史辅助模板不作为本轮 blocker

残留风险：

- 若后续只改其中一份发布文档，三层口径可能再次漂移

---

任务编号：`T4-3`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 固定首发推荐的构建、镜像、smoke、tenant、go-live 命令集合
- 在 `README` 中写出首发官方命令链
- 在 `release-checklist` 和 `go-live runbook` 中补齐关键命令要求

验证结果：

- `README.md` 已列出：
  - `bun run check`
  - `bun run build:vue`
  - `bun run server:image:verify`
  - `bun run e2e:smoke:full`
  - `bun run e2e:tenant:full`
  - `bun run go-live:report`
  - `bun run go-live:handoff`
  - `bun run go-live:gate`
- `package.json` 已确认这些脚本存在
- `docs/reference/05-go-live-runbook.md` 已把 `server:image:verify` 与 `e2e:smoke:full` 纳入发布前验证

产出位置：

- `README.md`
- `docs/release-checklist.md`
- `docs/reference/05-go-live-runbook.md`
- `package.json`

未覆盖：

- 已沉淀到 `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`

残留风险：

- go-live 命令仍依赖真实环境输入，不作为仓库参考发行版 ready 的应用侧 blocker

---

任务编号：`T4-2`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 在 `go-live` 输入模板中补齐环境前提与责任模板
- 明确 secrets、backup / recovery、proxy / TLS、值守与 rollback decision 的默认 owner
- 在 go-live 准备包中补齐应用侧与环境侧责任边界

验证结果：

- `docs/reference/09-go-live-gate-input-template.md` 已新增“环境前提与责任模板”
- `docs/plans/2026-05-06-go-live-preparation-packet.md` 已新增责任边界与 blocker owner 归档

产出位置：

- `docs/reference/09-go-live-gate-input-template.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`

未覆盖：

- 尚未锁定真实目标环境的具体 owner 名单与值守排班

残留风险：

- 若后续 go-live 只更新脚本输入而不更新准备包，责任边界可能再次分散

---

任务编号：`T4-4`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 固定 go-live blocker 分类
- 明确停止上线条件
- 明确最小回滚归档项与角色分工

验证结果：

- `docs/reference/09-go-live-gate-input-template.md` 已新增“Blocker 语义与停止条件映射”
- `docs/plans/2026-05-06-go-live-preparation-packet.md` 已新增“停止上线与回滚判断”模板

产出位置：

- `docs/reference/09-go-live-gate-input-template.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`

未覆盖：

- 已用 `go-live:*` 当前失败结果复核 blocker 分类能区分环境前提与应用验证

残留风险：

- 若未来新增新的生产依赖面，必须同步 blocker 分类与停止条件

---

任务编号：`T5-1`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 新增独立的首发验收包文档
- 固定首发最低命令门槛与记录模板

验证结果：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md` 已包含 `check`、`build:vue`、`server:image:verify`、`e2e:smoke:full`、`e2e:tenant:full`
- `docs/release-checklist.md` 已补对该验收包的引用

产出位置：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`
- `docs/release-checklist.md`

未覆盖：

- 已在当前候选工作区重新执行并写入本记录的追加执行快照

残留风险：

- 若后续实际 go-live 复用本验收包，必须重新执行目标环境 gate，不能沿用本地参考发行版结果

---

任务编号：`T5-2`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 在首发验收包中固定人工场景验收清单
- 覆盖 onboarding、shell/auth/navigation、核心工作区、generator Happy Path、production smoke 与 go-live blocker 收敛

验证结果：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md` 已包含分场景勾选项

产出位置：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`

未覆盖：

- 已在首发验收包中按工作区类别与命令证据归档

残留风险：

- 若前端体验继续变化，应同步更新验收包与相关 workspace 定向测试

---

任务编号：`T5-3`
完成时间：`2026-05-12`
完成人：`Codex`

已完成：

- 在首发验收包中固定 blocker 归档格式
- 把残留项拆分为应用侧、环境侧外部前提、并行研发 out-of-scope 三类
- 提供首发结论模板

验证结果：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md` 已包含 blocker 分类模板与结论模板

产出位置：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`

未覆盖：

- 已在首发验收包中填入本轮首发结论实例

残留风险：

- go-live 环境 blocker 仍需环境 owner 补齐，不应误归类为应用侧 blocker

---

## 2026-05-12 追加执行快照

本段用于补记当前候选工作区的真实执行结果，便于后续把 `T2-*`、`T3-*` 的实现证据和首发门槛对齐。

### `T2-*` 已补齐的实现证据

- `T2-1`：`README.md` 与 `apps/example-vue/README.md` 已把安装、迁移、种子、启动与默认登录路径写清楚
- `T2-2`：`apps/example-vue/src/router/example-workspace-routes.test.ts` 与 `bun run build:vue` 已证明 shell / auth / navigation 的路由收口可构建
- `T2-3` / `T2-4`：`users / roles / menus / departments / posts` 与 `dictionaries / settings / operation-logs / notifications / tenants / files / online sessions` 的 workspace 测试已覆盖主流程
- `T2-5`：`apps/example-vue/src/components/workspaces/generator/use-generator-preview-workspace-main-state.test.ts` 与相关 generator preview 测试已覆盖状态语义收口

### `T3-*` 已补齐的实现证据

- `T3-1` / `T3-2` / `T3-3` / `T3-4`：`packages/generator` 与 `e2e:generator:cli` 证实 generator 首发路径、最小 schema、手工接线边界与样例输出已可执行

### 当前命令快照

- `bun run check`：通过
- `bun run build:vue`：通过
- `bun run server:image:verify`：通过
- `bun run e2e:generator:cli`：通过
- `bun run e2e:smoke:full`：通过（使用本地 PostgreSQL + `DATABASE_URL` + `ACCESS_TOKEN_SECRET`）
- `bun run e2e:tenant:full`：通过（使用本地 PostgreSQL + `DATABASE_URL` + `ACCESS_TOKEN_SECRET`）

### 当前结论

- 仓库内实现、发布命令链与首发门槛已闭合到“首个参考发行版 ready（仓库发布层）”
- `go-live:*` 当前仍会因真实环境输入未锁定而失败，但这些残留项已被稳定收敛为环境 owner blocker，不再是首发应用侧 blocker
- 候选发布材料已归档到 `docs/plans/2026-05-12-reference-starter-release-candidate.md`
- 正式 PR / tag 前仍需在最终提交后重新锁定 commit，并复跑首发命令基线，避免把未提交工作区结果误当成固定 head 证据

## 2026-05-12 风险清理补记

已完成：

- 把候选包中的 `head` 结论收紧为 `base head + 当前候选工作区`，避免未提交变更被误写成已锁定发布 commit
- 把 `当前 head` 验收措辞统一改为 `当前候选工作区或最终待发布 commit`
- 把 generator 风险口径从笼统的 `apply / merge 未定稿` 收紧为：安全 staging apply 已可用，正式模块目录仍以 `--target module` 集成桩、人工确认清单和后续接线证据为边界
- 保留 `go-live ready: no` 作为真实环境输入缺失的门禁结论，不把它归为应用侧 blocker

验证结果：

- `git diff --check`：通过
- `bun run check`：通过，`881` tests，`0` fail

残留风险：

- 正式 PR / tag 前仍需在最终提交后重新锁定 commit，并按首发命令基线重新执行至少一次固定版本验证

## 2026-05-13 快捷键与当前代码风险清理

已完成：

- 移除 `AdminShellLayout` 中未实现的 edit / delete 快捷键空实现，避免用户按键后被拦截但没有任何结果
- 将 `useWorkbenchShortcuts` 的 edit / delete handler 改为可选；未提供 handler 时不再拦截 `Alt+Enter` 或 `Delete`
- 补 `createWorkbenchShortcutKeydownHandler` 定向测试，固定“无 handler 不拦截，有 handler 才拦截”的契约
- 清理当前运行代码中的 workflow TODO 标记，保留“workflow detail 仍待迁移到 context panel”的过渡边界说明

验证结果：

- `bun test apps/example-vue/src/composables/use-workbench-shortcuts.test.ts`：通过，`2` tests，`0` fail
- `bun run typecheck`：通过
- `git diff --check`：通过

残留风险：

- `packages/generator` 模板中的 `TODO` 为 `--target module` 生成产物的人工接线标记，已有 smoke 测试断言存在；本轮不移除
- `packages/frontend-react` 仍是占位轨道，但已明确不进入首发门槛

## 2026-05-13 reference 系统总览收口

已完成：

- 将 `docs/reference/01-system-overview.md` 从模板收口为可直接阅读的系统总览
- 明确首发参考发行版 owner、模块边界、关键不变量与典型流程
- 去掉 reference 入口页的“模板”标识，避免新读者误把详细参考页当作未完成草稿

验证结果：

- `rtk rg -n "待补" docs/reference/01-system-overview.md docs/reference`：未命中
- `git diff --check`：通过

残留风险：

- `docs/reference` 里仍有部分真实环境说明保留 `TBD` 或“未定稿”字样，属于环境 owner 外部前提，不是仓库内实现缺口

## 2026-05-13 首发落地阶段计划落仓

已完成：

- 新增 `docs/plans/2026-05-13-reference-starter-go-live-stage-plan.md`，把首发落地收口为 `M1 候选冻结 -> M2 环境前提锁定 -> M3 目标环境演练 -> M4 首发放行结论`
- `go-live-report` 已补 `ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED` 输入，并输出里程碑状态、`nextMilestone` 与结构化 blocker detail
- `go-live-report` 进一步补 `ownerHandoffs`，把 blocker 直接按默认 owner 和 `envKeys` 分组，降低发布负责人二次整理字段的协调风险
- `go-live-gate` 已透传里程碑状态，便于在 gate 与 Step Summary 中直接判读当前卡点
- `docs/roadmap.md`、`docs/release-checklist.md`、`docs/reference/05-go-live-runbook.md`、`docs/reference/09-go-live-gate-input-template.md`、`docs/plans/2026-05-06-go-live-preparation-packet.md` 已同步到同一口径

验证结果：

- `bun test scripts/go-live-report.test.ts scripts/go-live-gate.test.ts scripts/go-live-finalize.test.ts`：通过
- `git diff --check`：待当前轮次统一收尾时复核

残留风险：

- `go-live:*` 仍不会替环境 owner 自动补事实；若 `release tag / PR`、`environment`、`backup / restore`、`roles / oncall`、`proxy / TLS` 与目标环境冒烟未锁定，报告仍应继续阻断

## 2026-05-14 M1 候选冻结启动

已完成：

- 提交下阶段 go-live 规划文档，固定当前候选基线为 `8e0b74e`
- 将 `docs/plans/2026-05-12-reference-starter-release-candidate.md` 的 `base head` 从旧的未提交工作区基线收口为 `8e0b74e + clean worktree`
- 在 `8e0b74e` 上重新执行 `bun run check`，通过
- 在 `8e0b74e` 上重新执行 `bun run build:vue`，通过
- 在 `8e0b74e` 上重新执行 `bun run server:image:verify`，通过
- 在仓库根 `.env` 的本地 `DATABASE_URL` 与 `ACCESS_TOKEN_SECRET` 前提下重新执行 `bun run e2e:smoke:full`，通过
- 在同一组本地前提下重新执行 `bun run e2e:tenant:full`，通过

验证结果：

- `bun run check`：通过，`890` tests，`0` fail
- `bun run build:vue`：通过
- `bun run server:image:verify`：通过，`server-image-smoke-report.json` 状态 `passed`
- `bun run e2e:smoke:full`：通过
- `bun run e2e:tenant:full`：通过

残留风险：

- `release tag / PR` 仍未锁定，因此当前只能视为“候选 commit 已锁定，发布对象未完全锁定”
- 当前 `M1` 的剩余缺口已不在应用验证，而在发布对象锁定和后续 `M2` 环境前提输入

## 2026-05-14 go-live 报告与交接包收口

已完成：

- 以 `ELYSIAN_GO_LIVE_RELEASE_COMMIT=8e0b74e` 重新执行 `bun run go-live:report`
- 以同一组环境前提执行 `bun run go-live:handoff`
- 生成按 owner 拆分的交接包：
  - `artifacts/go-live/handoffs/release-coordinator.md`
  - `artifacts/go-live/handoffs/environment-dba.md`
  - `artifacts/go-live/handoffs/application-owner.md`

验证结果：

- `go-live:report`：失败，`blockerCount=16`
- `go-live:handoff`：执行完成，已产出 `go-live-input.prefill.env` 与 owner bundles

残留风险：

- 当前 `M1` 仍缺 `release tag / PR`
- `M2` 仍缺 `release environment`、`migration list`、`backup / restore`、`release roles / oncall`、`proxy / TLS owner`
- `M3` 仍缺全部发布后最小冒烟证据与 tenant 附加验证

## 2026-05-14 M2 外部输入回填

已完成：

- 回填 `release tag=v1.0.0`
- 回填 `release environment=staging`
- 回填 `migration list=0000-0022`
- 回填 `backup=true`
- 回填 `proxy / tls owner=yukin371`
- 保持 `release roles / oncall=false`
- 基于上述输入重新执行 `bun run go-live:report` 与 `bun run go-live:handoff`

验证结果：

- `go-live:report`：失败，`blockerCount=11`
- `go-live:report`：`M1` 已变为 `passed`
- `go-live:report`：`nextMilestone=M2`
- `go-live:handoff`：已按最新 blocker 刷新 owner bundles

残留风险：

- `M2` 当前只剩 `release roles / oncall evidence 缺失`
- `M3` 的 `/health`、`/metrics`、管理员登录、权限 gate、核心列表/写操作与 tenant 附加验证仍全部未在目标环境确认

## 2026-05-14 M2 通过，切换到 M3

已完成：

- 回填 `release roles / oncall=yukin371`
- 以 `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY=true` 重新执行 `bun run go-live:report`
- 按最新状态重新执行 `bun run go-live:handoff`

验证结果：

- `go-live:report`：失败，`blockerCount=10`
- `go-live:report`：`M2` 已变为 `passed`
- `go-live:report`：`nextMilestone=M3`
- `go-live:handoff`：owner bundles 已刷新为只包含 `M3` 相关 blocker

残留风险：

- 当前剩余 blocker 全部位于 `M3`，需要在 `staging` 目标环境完成 `/health`、`/metrics`、管理员登录、权限 gate、核心列表/写操作与 tenant 附加验证

## 2026-05-14 M3 结果回填

已完成：

- 回填 `staging` 目标环境最小冒烟结果
- 记录 `health / metrics / admin login / permission gate / core list / core write / tenant admin denied / non-default tenant login` 为通过
- 记录 `cross-tenant isolation=false`，并补充根因判断：应用以 `postgres`（table owner）连接数据库，RLS 不对 table owner 生效
- 以最新结果重新执行 `bun run go-live:report`，当前 `blockerCount=1`
- 以最新结果重新执行 `bun run go-live:gate`，失败

验证结果：

- `go-live:report`：失败，`M3` 仍 blocked
- `go-live:gate`：失败
- `go-live:report`：唯一 blocker 为 `cross-tenant isolation`

残留风险：

- 当前发布已经不再缺少基础环境前提
- 现阶段唯一阻断是跨租户隔离修复：需要把应用数据库连接切到非 owner 的受限角色，或调整 owner/RLS 策略使隔离对当前连接身份真正生效

## 2026-05-14 M3 blocker 修复已提交，等待 staging 重跑

已完成：

- 提交 `c6d06d6` `fix(tenant): prefer runtime db url for server rls enforcement`
- 在 `packages/persistence` 增加 runtime DB 配置分流：运行态优先使用 `DATABASE_RUNTIME_URL`，迁移与管理仍保留 `DATABASE_URL`
- 在 `apps/server` 切换为 runtime DB client，避免服务继续默认以 migration / owner 连接身份访问业务表
- 更新 `server image smoke` 配置与测试，使镜像烟测也能显式透传 runtime 连接串
- 同步 `PROJECT_PROFILE`、server README 与 production baseline 文档，明确 runtime / migration DB 身份分离

验证结果：

- `bun test packages/persistence/src/config.test.ts scripts/server-image-smoke.test.ts apps/server/src/app.config.test.ts`：通过
- `bun run check`：通过

残留风险：

- 应用侧修复已进入仓库，但 `staging` 只有在实际注入 `DATABASE_RUNTIME_URL`，且该角色不是 table owner、不是 superuser、没有 `BYPASSRLS` 时，`cross-tenant isolation` 才会转为通过
- 当前 `M3` 仍需在目标环境重跑，不能把仓库内修复直接视为 go-live blocker 已解除
