# 2026-05-19 Phase H：Generator 可发布闭环硬化收口

更新时间：`2026-05-19`

## 目的

本文件记录 `Phase H Generator 可发布闭环硬化` 在当前工作区内已经完成的事实、边界与验证。它不宣布正式 PR / tag 已锁定，也不把导入链路、正式 migration 自动化或生产发布平台写成已实现能力。

## 边界摘要

目标模块：
- `apps/example-vue`
- `scripts/*generator*`
- `.github/workflows/ci.yml`
- `docs/*`

现有 owner：
- `apps/example-vue`：真实 `generator preview` workspace、用户动作语义、阻断与证据展示
- `apps/server`：`generator-session` 的 preview / review / confirm / apply 编排与响应契约
- `packages/persistence`：review-only SQL proposal snapshot 与 handoff artifact canonical owner
- `packages/generator`：schema -> preview/report/apply artifact，不拥有前端运行时、不拥有正式 migration
- `scripts` / CI：阶段验证入口、报告索引、门禁与 artifact 归档

影响面：
- generator reports index / gate 的本地与 CI 判读
- 真实 `generator preview` workspace 的 confirmation / apply evidence 回看
- guided-flow smoke report 的 happy / blocked / stale 证据
- Phase H 导入链路边界决策

验证方式：
- `bun run check`
- `bun run build:vue`
- `bun test scripts/e2e-generator-reports-index.test.ts scripts/e2e-generator-reports-gate.test.ts`
- `bun test scripts/e2e-generator-studio-guided-flow-smoke.test.ts`
- `bun test apps/example-vue/src/components/workspaces/generator/use-generator-preview-workspace-main-state.test.ts`
- `bun run e2e:generator:cli`
- `bun run e2e:generator:matrix`
- `bun run e2e:generator:studio`
- `bun run e2e:generator:browser`
- `bun run e2e:generator:reports:index`
- `bun run e2e:generator:reports:gate`
- `git diff --check`

需要同步的文档：
- `docs/roadmap.md`
- `docs/PROJECT_PROFILE.md`
- `docs/reference/03-ci-gates-and-reports.md`
- `apps/example-vue/src/MODULE.md`
- `docs/plans/2026-05-19-generator-import-boundary-decision.md`

## 已完成收口

### H1. Generator 验证证据归并

- CI generator report gate 已显式要求 `matrix / cli / studio / browser` 四类报告源。
- reports index 已支持 CI artifact 子目录来源与本地扁平报告名，并跳过自身生成的 index / gate 报告。
- reports index / gate 已支持 GitHub Step Summary 与 `GITHUB_OUTPUT`，便于 PR 页面直接判读最终结论。
- gate 已把缺失必需来源计入 `effectiveFailedReports`，避免 browser artifact 等关键报告缺失时误判通过。

### H2. 真实 workspace 用户路径硬化

- 正式 `generator preview` workspace 继续保持“新建生成 / 最近结果 / 生成结果”三段结构。
- 当前结果摘要已在 drift、snapshot recovery 或 apply evidence 存在时补充结构化事实。
- 当前结果恢复建议已直接消费 `driftStatus` 与结构化 `blockerReasons`，不再只依赖错误字符串。
- `use-generator-preview-workspace-main-state.ts` 已把状态事实和恢复建议拆到同 owner helper，主文件降到 `1000` 行以下。

### H3. Apply / Handoff 证据硬化

- session detail 已展示 confirmation evidence 的 report / snapshot / recovery / checklist count。
- session detail 已展示 apply evidence 的 report / manifest / request id。
- guided-flow smoke report 已记录 happy path 的 confirmation / apply evidence。
- guided-flow smoke report 已记录 blocked apply 的 blocker reasons / final state。
- guided-flow smoke report 已记录 stale apply 的 drift status / blocker reasons / regenerated session。

### H4. 导入链路边界决策

- 已新增导入边界决策文档。
- Phase H 明确不实现导入 DSL、导入 API、批量落库或错误回写平台。
- 后续若继续，只能先从 `ModuleSchema` / 简化 schema 输入层 POC 评估，不能把 generator apply 语义扩成业务数据导入。

### H5. 发布基线回填

- roadmap 已回填 Phase H 当前事实。
- `docs/PROJECT_PROFILE.md` 已记录 generator reports 必需来源、扁平/CI 来源识别、Step Summary 与 outputs。
- `docs/reference/03-ci-gates-and-reports.md` 已补 generator reports summary / outputs 与 `missing-required-source` 排查口径。
- `apps/example-vue/src/MODULE.md` 已补 confirmation / apply evidence 展示边界。

## 阶段内保留边界

- confirm 不等于 migration 完成。
- apply 只到 staging。
- SQL preview / proposal 仍然是 review-only。
- handoff 只读取 persistence artifact，不把 proposal owner 迁回前端或 server。
- browser smoke 只验证真实 generator 路由和 DOM 信心层，不扩成通用 E2E 平台。
- `demohub` 继续是后续页面试稿 owner，不作为主流程必经页。

## 当前非目标

- 不新增第二套 starter。
- 不新增跨层 shared owner。
- 不把前端运行时职责迁入 `packages/generator`。
- 不实现导入 DSL、导入 API、批量落库或导入错误报告平台。
- 不把 confirm / apply 等同于正式 migration 完成。
- 不扩展 workflow `transfer / delegate`。

## 后续门槛

- 正式 PR / tag 前，需要在最终提交后重新复跑关键验证并锁定 commit。
- 若进入导入候选方向，只能先做 schema 输入层 POC 的边界验证。
- 若继续调整正式 generator 页面结构，仍必须先在 `demohub` 验证新交互。
