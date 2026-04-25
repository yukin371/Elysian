# roadmap

更新时间：`2026-04-26`

本文件只记录当前活跃工作轨道，不重复定义完整阶段体系。完整阶段与依赖关系见 [06-phased-implementation-plan.md](./06-phased-implementation-plan.md)。

## 当前版本目标

保持 `Phase 2`、`Phase 3`、`Phase 4`、`Phase 6A Round-2`、`Phase 5 / P5A` 与 `Phase 6B` 已归档；当前主线进入 `Phase 7 / P7A Round-1` 实施。`Phase 6B` 的多租户、数据权限、租户治理、`ADR-0009`、CI tenant e2e、`feature/dev/main` 的 `10/10` 滚动观察均已完成，并已在 `2026-04-25` 通过本地 `bun run check` 与 `bun run e2e:tenant:full` 再次确认阶段出口。

### Current Mainline: Phase 7 / P7A 🚧 Round-1 实施中

- 已决定：当前主线从 `Phase 6B` 切换至 `Phase 7 / P7A`
- 入口依据：`P6B1/P6B2/P6B3` 已完成，`feature/dev/main` 均已达到 `10/10` tenant 滚动观察，且本地 `bun run check` 与 `bun run e2e:tenant:full` 已在 `2026-04-25` 复验通过
- 当前范围：以简化工作流引擎为首个交付包，先服务 agent 自编排辅助工具，不扩成通用 BPM / agent orchestrator；安全合规与统一消息中心保持在 `Phase 7` 规划范围内，但不提前写成已实现事实
- 当前约束：tenant 迁移/发布演练、平台级发布命令与回滚责任边界仍作为运营收尾项持续跟踪，不虚构生产平台自动化
- 已推进：workflow definition 的创建 / 查询 / 版本化、instance 发起 / 查询 / 详情、todo 列表已打通
- 已推进：最小审批动作闭环已落地，当前支持 `approved / rejected` 完成、实例取消、done 列表与实例历史任务读取；仍保持“简化自编排工具”定位，不引入 claim、并行网关或独立调度器
- 已推进：`WP-4` 最小条件分支已落地，当前支持基于实例变量的白名单比较表达式与 `default` 分支，不引入脚本执行器
- 已推进：workflow 权限已拆分为 definition / instance / task 三组最小权限点，并补 server 403 覆盖与默认 seed
- 当前待推进：更复杂任务语义与是否继续细拆权限颗粒度
- PRD 文档：[2026-04-24-system-design-v2-prd.md](./plans/2026-04-24-system-design-v2-prd.md)
- 启动文档：[2026-04-25-phase-7a-workflow-engine-kickoff.md](./plans/2026-04-25-phase-7a-workflow-engine-kickoff.md)
- 首轮清单：[2026-04-25-phase-7a-workflow-engine-round1-checklist.md](./plans/2026-04-25-phase-7a-workflow-engine-round1-checklist.md)

## Active Tracks

### 1. Phase 2: Auth Foundation ✅ 归档

- 已完成：RBAC 表结构与 seed、login / refresh / logout / me 接口、customer 路由 auth guard、identity contract 收敛、`usePermissions` / `buildPermissionGates` 提取、最小 auth 审计基线

### 2. Phase 3: 标准企业模块 ✅ 归档

- 已完成：`Phase 3A` 用户 / 角色 / 菜单 / 部门四个系统模块的最小后端闭环
- 已完成：`Phase 3B` 字典 / 系统配置 / 操作日志模块后端闭环，保持既有 canonical owner 不漂移
- 已完成：`Phase 3C` 文件 / 通知模块后端闭环，保持 metadata owner 与 runtime storage owner 分离
- 已完成：`3.10` Vue 管理后台布局，`ElyShell` 已具备侧边栏 + 顶栏 + 内容区 + 标签页布局
- 已完成：`3.11` Vue 通用组件，`ui-enterprise-vue` 已落 `ElyCrudWorkspace`、标准列表页、标准表单页与只读详情视图
- 已完成：`3.12` Vue 企业预设首版，`apps/example-vue` 已接入真实 enterprise shell 与 customer 工作区

### 3. Phase 4 Pre-validation ✅ 归档

- 已完成：`productModuleSchema` 落地、generator 模板硬编码修复（`CustomerStatus` → `{PascalName}Status`、`input.name` → 动态字段检测）、product 生成验证零残留通过

### 4. Phase 6A: 生产基线准备 ✅ Round-2 收口

- 已决定：下一阶段优先进入 `Phase 6A`，先补部署、观测、安全和 E2E 基线，避免将工程风险后置
- 已启动计划文档：[2026-04-22-phase-6a-production-baseline-kickoff.md](./plans/2026-04-22-phase-6a-production-baseline-kickoff.md)
- 当前约束：`Phase 4` 仍处于预验证完成态，`Phase 6A` 先以“生产基线准备与验证链路收敛”为范围，不提前引入多租户/复杂数据权限等重型能力
- 当前状态：`WP-1` 容器化基线、`WP-2` E2E smoke、`WP-3` 观测与最小安全基线均已落地
- 第二轮已启动：新增 `/metrics/prometheus`，提供 Prometheus exposition 格式指标输出，作为指标标准化起点
- 第二轮已推进：Prometheus 指标基线已补 `process_start_time_seconds`，便于进程重启识别与采集侧时序校准
- 第二轮已推进：Prometheus 指标基线已补 `process_cpu_user_seconds_total` 与 `process_cpu_system_seconds_total`
- 第二轮已推进：`e2e-smoke` 新增结构化报告（含阶段与失败分类），CI `e2e-smoke` 已归档报告 artifact
- 第二轮已推进：新增 `e2e:smoke:diagnose`，CI `e2e-smoke` 在 `if: always()` 下输出结构化诊断结论与建议动作
- 第二轮已推进：smoke 诊断结果已写入 CI Step Summary，支持在作业页面直接查看失败分类与建议动作
- 第二轮已推进：smoke 诊断已增加 `retryRecommendation`，用于 CI 值班时快速判断“先重试”还是“先修复”
- 第二轮已推进：CI `e2e-smoke` 已支持“依赖类失败自动重试一次 + 终态门禁判定”
- 第二轮已推进：CI smoke 报告已按 attempt1/attempt2 分文件归档，重试不再覆盖首轮失败报告
- 第二轮已推进：新增 smoke 报告索引（`finalStatus`/`recoveredByRetry`），用于单次 CI 运行结果汇总
- 第二轮已推进：smoke 报告索引已输出 Step Summary 与 step outputs（`smoke_final_status`/`smoke_recovered_by_retry`）
- 第二轮已推进：CI `e2e-smoke` 已改为脚本化 gate 判定（`e2e:smoke:reports:gate`），替换手写 shell 逻辑
- 第二轮已推进：`workflow_dispatch` 已支持 smoke gate 参数化输入（允许重试恢复、最大尝试次数）
- 第二轮已推进：新增 smoke 稳定性快照（`e2e-smoke-stability-snapshot.json`），统一沉淀单次运行 gate/finalStatus/retry 信号用于观察窗口记录
- 第二轮已推进：新增 smoke 稳定性窗口报告（`e2e-smoke-stability-window.json`），按默认 5 次窗口输出连续失败检测与阶段切换建议
- 第二轮已推进：新增 smoke 稳定性证据汇总（`e2e-smoke-stability-evidence.json`），可对多次 artifact 进行窗口判定并生成“是否可进入下一阶段”的决策输入
- 第二轮已推进：新增阶段切换决策报告生成（`e2e-smoke-phase-transition-decision.md`），将 evidence 自动转为可归档的窗口结论
- 第二轮已推进：新增阶段出口门禁（`e2e:smoke:phase:gate`），对 evidence 执行硬判定并在未达标时返回失败退出码
- 第二轮已推进：新增阶段收尾一键闭环（`e2e:smoke:phase:finalize`），串联 evidence/decision/gate 降低执行遗漏
- 第二轮已推进：新增快照收集脚本（`e2e:smoke:stability:collect`），用于将下载 artifact 归拢为 evidence 输入
- 第二轮已推进：新增从下载包直接收尾命令（`e2e:smoke:phase:finalize:from-downloads`），串联 collect/evidence/decision/gate
- 第二轮已推进：基于最近 5 次 `dev` 相关成功运行（runIds: `24831519539`、`24831463736`、`24831405348`、`24831362661`、`24831277528`）生成稳定性证据，窗口已达标且阶段出口门禁通过
- 第二轮已完成：主线决策已归档为 `Phase 5`，仅启动 `P5A: AI -> Schema`，暂不进入 `Phase 6B`
- 第二轮已推进：限流响应头观测增强（`x-ratelimit-limit`/`remaining`/`reset` + `retry-after`），为分布式限流评估提供运行期信号
- 第二轮已推进：已建立双轨文档与 skill 模板骨架（`docs/quickstart`、`docs/reference`、`docs/ai-playbooks`、`skills/templates`）
- 第二轮计划文档：[2026-04-22-phase-6a-round2-baseline-hardening.md](./plans/2026-04-22-phase-6a-round2-baseline-hardening.md)
- WP-5 处置手册：[2026-04-22-phase-6a-wp5-smoke-triage-runbook.md](./plans/2026-04-22-phase-6a-wp5-smoke-triage-runbook.md)
- WP-6 评估文档：[2026-04-22-phase-6a-wp6-rate-limit-evaluation.md](./plans/2026-04-22-phase-6a-wp6-rate-limit-evaluation.md)
- 阶段执行基线：[2026-04-23-phase-execution-gates-and-wbs.md](./plans/2026-04-23-phase-execution-gates-and-wbs.md)
- 稳定性观察窗口：[2026-04-23-phase-6a-round2-stability-window.md](./plans/2026-04-23-phase-6a-round2-stability-window.md)
- 对标与功能清单：[2026-04-23-competitive-benchmark-and-dev-feature-checklist.md](./plans/2026-04-23-competitive-benchmark-and-dev-feature-checklist.md)
- 主线决策与启动文档：[2026-04-23-phase-5-mainline-decision-and-kickoff.md](./plans/2026-04-23-phase-5-mainline-decision-and-kickoff.md)

#### Phase 6A Round-2 Exit Checklist

- [x] `WP-4` 指标标准化：`/metrics/prometheus` 与 `/metrics` 已补进程级 uptime/start/cpu/memory 指标
- [x] `WP-5` smoke 稳定性：报告（attempt1/2）+ 诊断 + 索引 + 门禁 + CI Summary/outputs + workflow_dispatch 参数化
- [x] `WP-5` 策略边界回归：`allowRecoveredByRetry`、`maxAttempts`、非法输入已覆盖测试
- [x] `WP-6` 分布式限流评估：门槛与切换条件已文档化
- [x] 最近连续 CI 运行稳定性观察窗口达标（建议最少 5 次，且无系统性 smoke 阻断）
- [x] 基于观察窗口输出“进入 `Phase 6B` 或 `Phase 5`”的主线决策记录

### 5. Phase 5: AI 辅助开发 ✅ P5A 已归档

- 已归档：`P5A: AI -> Schema` 最小闭环已完成，当前不再作为主线推进
- 选择依据：
  - `Phase 4` 已完成，满足 `Phase 5` 入口条件
  - `03-ai-codegen-strategy.md` 已明确推荐顺序为“schema 驱动生成 -> AI 生成 schema -> 交互式 AI 助手”
  - `Phase 6A Round-2` 已完成最小生产基线收尾，当前短板更偏体验层与交付层，而非继续追加 `Phase 6B` 重型企业能力
- 当前约束：
  - 不启动 `P5B/P5C`
  - 不做交互式 AI 助手
  - 不允许 AI 绕过 schema / generator 直接改平台核心基础设施
- 当前工作包：
  - `WP-1` 需求输入模板与 `AI -> Schema` 验收语料
  - `WP-2` 结构化输出校验与 handoff 边界
  - `WP-3` 人工兜底、回放与失败审计最小骨架
- 已推进：`packages/schema` 已补 `validateModuleSchema` / `isModuleSchema` runtime 校验，固定外部 schema handoff 的最小硬约束
- 已推进：`packages/schema` 已把“`enum` 字段必须提供 `options` 或 `dictionaryTypeCode`”收紧为 runtime 硬约束，避免裸 enum 误过 P5A handoff
- 已推进：`packages/generator` CLI 已支持 `--schema-file`，允许从 JSON schema 文件直接生成 staging，并在外部 schema 来源时内联 `.schema.ts`
- 已推进：`docs/ai-playbooks` 已补 `P5A` 输入模板、输出契约、验收语料与可执行样例 schema 文件
- 已推进：新增 `p5a:handoff:report` / `p5a:handoff:replay`，形成“失败分类 -> 人工修正 -> 重放 -> 继续 generator”的最小接管骨架
- 已推进：`p5a:handoff:replay` 已输出结构化 replay 报告，记录 handoff、generator 与生成 artifact 路径，继续补齐 `WP-3` 的最小失败审计证据
- 已推进：`p5a:handoff:report` / `p5a:handoff:replay` 已支持输出 GitHub Step Summary 与 `GITHUB_OUTPUT`，补齐单次 handoff / replay 的页面级诊断可见性
- 已推进：补充“顶层越界元数据 / 非法 JSON / 字段级局部错误”三类失败语料，并把 `retry_ai_generation` 与 `manual_fix_required` 的分界收紧到可执行分类规则
- 已推进：新增 `p5a:handoff:corpus`，把真实任务输入变体与失败语料收敛为可批量执行的分类回归入口
- 已推进：CI 新增 `p5a-handoff-corpus` 作业，把 P5A 语料分类回归纳入固定质量链路
- 已推进：`p5a:handoff:corpus` 新增 Step Summary / GitHub output，失败时可直接定位 case 级分界偏差
- 已推进：新增 `p5a:acceptance`，把 corpus 与成功 replay/generator 串成统一阶段验收入口
- 已推进：CI 新增 `p5a-acceptance` 作业，把 P5A 最小闭环验收纳入固定阶段门禁
- 已推进：P5A corpus 新增服务工单 mixed 字典/布尔/数字/时间案例，以及字段级越界元数据 failure case，继续压实 `retry_ai_generation` / `manual_fix_required` 分界
- 已推进：`p5a:acceptance` 改为 manifest 驱动的多成功 replay/generator case 验收，不再只依赖单一样例
- 已推进：`p5a:acceptance` 新增 Step Summary / GitHub output，CI 页面可直接判读阶段验收状态与 case 数
- 已推进：`p5a:acceptance` 成功样例覆盖已扩到 `manual-fix-supplier` 加 `supplier / visitor-pass / asset / service-ticket / meeting-booking` 六条 replay/generator case，继续在 `P5A` 范围内扩大真实需求变体
- 已推进：新增 `p5a:acceptance:gate`，对 acceptance 报告执行独立门禁，固定“至少 3 条成功 case + generator artifact 证据完整”的当前阶段边界
- 已推进：CI `p5a-acceptance` 已接入 acceptance gate，并支持 `workflow_dispatch` 参数化最小 case 数与 artifact 证据策略
- 已推进：新增 `p5a:acceptance:index`，把 acceptance 与 gate 收敛成单一结论文件，降低 artifact 下载后的二次拼装成本
- 已推进：新增 `p5a:acceptance:finalize`，把 acceptance 与 gate 串成一键收尾入口，降低本地执行遗漏
- 启动文档：[2026-04-23-phase-5-mainline-decision-and-kickoff.md](./plans/2026-04-23-phase-5-mainline-decision-and-kickoff.md)

### 6. Phase 6B: 企业增强 ✅ 已归档

- 已完成：`P6B1` 租户模型与查询隔离，包含 `tenants` schema、既有业务表 `tenant_id`、PostgreSQL RLS、JWT `tid`、tenant middleware、租户感知 seed 与基础测试覆盖
- 已完成：`P6B1` 修复收口，修正租户登录、上下文重置与多租户约束边界，已提交到功能分支
- 已完成：`P6B2` 数据权限框架，已落 `roles.data_scope`、`role_depts`、`departments.ancestors`、`customer/file/notification` 数据访问过滤与 `AuthIdentity.dataAccess`
- 已接入：角色管理创建/更新支持 `dataScope` 与 `deptIds`，多角色权限按“最宽松”组合
- 已完成：`P6B3 / WP-1` 租户管理模块，已补 `/system/tenants` 列表/详情/创建/更新/状态更新接口，且仅允许 super-admin 操作
- 已完成：`P6B3 / WP-2 tenant:init`，已补 persistence owner 内的租户初始化 CLI，支持按 tenant 幂等补齐角色/权限/菜单/字典/tenant admin，且 tenant admin 不再误授超管能力
- 已完成：`P6B3 / WP-3` 租户配置回退，已补“当前 tenant 优先，默认 tenant 回退”的 setting 查询语义，并显式阻断跨租户 override 泄漏
- 已清理风险：认证侧请求租户上下文模块已更名为 `tenant-context` / `createTenantContextModule`，避免与真实租户业务模块重名
- 已清理风险：`db:seed` 已补 tenant context 设置与 tenant-aware conflict 目标，降低真实 PostgreSQL 下的 RLS/唯一约束错位风险
- 已清理风险：customer 创建链路已补 `identity.user.tenantId` 透传，避免写入错误回退到 `DEFAULT_TENANT_ID`
- 已清理风险：`db:seed`、`tenant:init` 与 tenant e2e harness 已补显式数据库连接回收，降低重复执行时的连接耗尽风险
- 已完成验证：`bun run check` 与 `bun run e2e:tenant:full` 已通过，覆盖 tenant init 幂等、super-admin 租户管理授权、customer 跨租户隔离、RLS 与 `tenant_id` 外键约束
- 已完成：`P6B3 / WP-4 ADR-0009`，已归档多租户升级与验证策略，固定默认租户/非默认租户初始化分离、真实 PostgreSQL 验证门槛与连接回收要求
- 已完成：CI 已接入 `e2e-tenant` 作业，复用 `e2e:tenant:full` 与 PostgreSQL service 执行真实租户隔离验证并归档报告
- 已完成：新增 `e2e:tenant:stability:snapshot` 与 `e2e:tenant:stability:evidence`，用于单次 tenant e2e 快照沉淀与多次 artifact 观察窗口证据汇总
- 已接入：CI `e2e-tenant` 已在单次 tenant e2e 后产出稳定性快照并随 artifact 归档
- 已完成：新增 `e2e:tenant:stability:collect`、`e2e:tenant:upgrade:decision`、`e2e:tenant:upgrade:gate`、`e2e:tenant:upgrade:finalize` 与 `e2e:tenant:upgrade:finalize:from-downloads`，将下载 artifact 到升级结论的收尾链路固定为脚本化流程
- 已完成：新增 `e2e:tenant:stability:download` 与 `e2e:tenant:upgrade:finalize:from-github`，可直接从 GitHub 下载 tenant artifact 并落升级结论
- 已完成：基于 `workflow_dispatch` 连续 5 次真实样本 `24886462252 / 24886403317 / 24886352160 / 24886285868 / 24886175279` 输出 tenant observation evidence；当前 `selectedWindowRuns=5`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`，门禁返回 `candidate_for_next_step`
- 已完成：基于 `ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10` 与最近 `10` 次 tenant artifact（`24887191148 / 24887139395 / 24887089834 / 24887032527 / 24886462252 / 24886403317 / 24886352160 / 24886285868 / 24886175279 / 24885957451`）输出首轮滚动观察结论；当前 `selectedWindowRuns=10`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`
- 已完成：`feature-p6b1-tenant-isolation -> dev -> main` 已全部晋级，`dev` push / workflow_dispatch 与 `main` push / workflow_dispatch 均已包含 `e2e-tenant` job 与 artifact
- 已完成：基于 `dev` 最近 `10` 次 tenant artifact（含 `24888296758 / 24888362434 / 24888586126 / 24888651338 / 24888706653 / 24888757984 / 24888812971 / 24888870698 / 24888923973 / 24888972790`）输出主线级第一版 `10/10` 观察结论；当前 `selectedWindowRuns=10`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`
- 已完成：基于 `main` 最近 `10` 次 tenant artifact（含 `24889218600 / 24889284909 / 24889342252 / 24889396810 / 24889454355 / 24889506795 / 24889562531 / 24889627339 / 24889689643 / 24889747211`）输出主线级第一版 `10/10` 观察结论；当前 `selectedWindowRuns=10`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`
- 已新增前期文档草案：[2026-04-25-vue-enterprise-preset-tdesign-migration-draft.md](./plans/2026-04-25-vue-enterprise-preset-tdesign-migration-draft.md) 与 [2026-04-25-vue-enterprise-preset-tdesign-mapping-checklist.md](./plans/2026-04-25-vue-enterprise-preset-tdesign-mapping-checklist.md)，用于在当前 `Phase 6B` runbook 收尾后评估 `Arco -> TDesign` 迁移窗口
- 已推进：`packages/ui-enterprise-vue` 与 `apps/example-vue` 已完成当前 POC 范围内的 `TDesign Vue Next` 收口，`ElyShell / ElyTable / ElyQueryBar / ElyForm / ElyCrudWorkspace / ElyPreviewSkeleton` 已不再依赖 `Arco` runtime；示例页默认语言已切到 `zh-CN`，并保留 `en-US` 回退
- 已完成阶段出口复验：`2026-04-25` 本地 `bun run check` 与 `bun run e2e:tenant:full` 通过，可将 `Phase 6B` 作为已归档阶段处理
- 归档后残留运营收尾：按迁移/发布 runbook 收敛生产发布演练、平台级发布命令与回滚责任边界，不再把“主线 tenant artifact 缺失”作为阻断项
- 计划文档：[2026-04-24-phase-6b-enterprise-enhancement-design.md](./plans/2026-04-24-phase-6b-enterprise-enhancement-design.md)
- 执行手册：[2026-04-24-phase-6b-tenant-upgrade-runbook.md](./plans/2026-04-24-phase-6b-tenant-upgrade-runbook.md)
- 迁移/发布手册：[2026-04-24-phase-6b-tenant-migration-release-runbook.md](./plans/2026-04-24-phase-6b-tenant-migration-release-runbook.md)
- 观察策略：[2026-04-24-phase-6b-tenant-scale-observation-strategy.md](./plans/2026-04-24-phase-6b-tenant-scale-observation-strategy.md)
- 滚动观察记录：[2026-04-24-phase-6b-tenant-rolling-window.md](./plans/2026-04-24-phase-6b-tenant-rolling-window.md)

### 7. Phase 4 Completion: P4D Apply / Merge ✅ 已完成

- 已启动：生成写入冲突策略增强，新增 `overwrite-generated-only`，仅允许覆盖受管生成文件
- 已完成：空文件也纳入冲突检测，避免“空文件被误判为可覆盖”
- 已完成：冲突策略回归测试补齐（`skip/fail/overwrite-generated-only` + CLI 参数解析）
- 已完成：写入阶段改为冲突预检，冲突发生时不再出现“前置文件已写入、后续失败”的部分成功状态
- 已完成：生成文件与 manifest 落盘改为原子替换（temp + rename），并补“无临时文件残留”回归测试
- 已新增：`bun run e2e:generator:safe-apply`，覆盖受管覆盖成功 / 非受管拒绝 / skip 保守写入三场景
- 收口结论：P4D 安全基线已完成，可进入 `P4E` 回归验证阶段
- 计划文档：[2026-04-22-phase-4d-safe-apply-kickoff.md](./plans/2026-04-22-phase-4d-safe-apply-kickoff.md)

### 8. Phase 4 Completion: P4E Regression Matrix ✅ 已完成

- 已启动：`P4E` 生成一致性回归矩阵
- 当前范围：`schema × frontendTarget × conflictStrategy` 多轮回归（含 deterministic 校验）
- 已新增：`bun run e2e:generator:matrix` 本地回归入口
- 已接入：CI `e2e-generator-matrix` 与 `e2e-generator-cli` 作业
- 已清理：并发覆盖下 Windows `rename` 瞬时冲突风险（原子写入增加重试），并补并发回归断言
- 已新增：`bun run e2e:generator:cli`，覆盖 generator CLI 真实执行路径的冲突策略语义
- 已新增：matrix/cli JSON 报告输出，并在 CI 归档 artifact 用于失败定位与趋势追踪
- 已新增：`bun run e2e:generator:reports:index` 与 CI `e2e-generator-report-index`，汇总 matrix/cli 报告为单一索引 artifact
- 已新增：`bun run e2e:generator:reports:gate` 与 CI `e2e-generator-report-gate`，按阈值策略执行发布门禁判定
- 已支持：`workflow_dispatch` 手动触发时可配置 gate 阈值与失败来源白名单
- 已补：`scripts/e2e-generator-reports-gate.test.ts`，覆盖来源白名单解析、推荐动作分流与索引一致性校验，降低门禁误配置与报告漂移风险
- 收口结论：`P4E` 回归矩阵、报告聚合与门禁策略链路已闭环，可将主线推进至下一阶段范围确认
- 计划文档：[2026-04-22-phase-4e-regression-matrix-kickoff.md](./plans/2026-04-22-phase-4e-regression-matrix-kickoff.md)

## 已落地基础

- 仓库初始化：[2026-04-20-repo-bootstrap.md](./plans/2026-04-20-repo-bootstrap.md)
- monorepo 骨架：[2026-04-20-monorepo-skeleton.md](./plans/2026-04-20-monorepo-skeleton.md)
- P1 收尾：[2026-04-21-p1-completion.md](./plans/2026-04-21-p1-completion.md)

## 最近进展

- 完成 `Phase 1` 垂直切片闭环，打通 `schema -> server -> persistence -> generator -> frontend`
- 用 Docker PostgreSQL + 浏览器 smoke 验证 customer create / update / delete 持久化链路
- 固定仓库品牌与命名体系为 `Elysian` / `@elysian/*`
- 收敛 `main / dev` 分支流转、CI 与 GitHub 分支保护规则
- 将整体规划文档升级为 7 阶段 + 子阶段拆分的主计划源
- 收敛 roadmap 文档职责，避免与主计划文档重复定义阶段
- 完成 `ADR-0007`，固定短时 access token + 持久 refresh session 的认证策略
- 已提交 `0001_auth_rbac.sql`，将 `users / roles / permissions / user_roles / role_permissions / menus / role_menus / refresh_sessions` 落为 migration 级实现
- `packages/persistence/src/schema/auth.ts`、`packages/persistence/src/auth.ts` 与 `packages/persistence/src/seed.ts` 已形成 RBAC / refresh session 的 canonical owner
- `apps/server/src/modules/auth/module.ts` 已提供 `POST /auth/login`、`POST /auth/refresh`、`POST /auth/logout`、`GET /auth/me`
- `apps/server/src/modules/auth/service.ts` 与 `guard.ts` 已打通 Bearer access token 校验、refresh session 轮换和最小权限校验入口
- `packages/persistence/src/schema/auth.ts` 已新增 `audit_logs` 审计表，`packages/persistence/src/auth.ts` 已提供最小写入 / 查询 helper
- `apps/server/src/modules/auth/service.ts` 已对 login / refresh / logout / permission denied 写入 auth 审计记录，并在测试中验证 `request id / ip / user agent / actor / target / result` 字段
- `apps/server/src/app.test.ts` 已覆盖 login / me / refresh / logout 的最小 server 合约
- `apps/example-vue/src/lib/platform-api.ts` 已接入 access token 内存管理与 refresh 恢复登录态流程
- `apps/example-vue/src/App.vue` 已开始消费 auth identity、permissionCodes 和 menus 构建前端权限体验
- 新增 `@elysian/ui-core`，把菜单树、页面契约、动作权限等 UI 协议从示例前端中抽离
- 让 `example-vue` 开始消费 `frontend-vue` 预设层，验证“协议层 + 自建风格预设层”的实现路径
- 完成 `ADR-0008`，固定 `Arco Design Vue` 为 Vue 企业预设底座
- `packages/frontend-vue/src/index.ts` 的 `usePermissions()` 已修正为支持 reactive `moduleReady`，避免示例端因初始值捕获导致权限 gate 失真
- `packages/ui-enterprise-vue` 已新增 `ElyCrudWorkspace`，并补齐 `ElyTable` 行数据 / row-click、`ElyForm` 值同步 / 只读详情、`ElyShell` tabs 渲染
- `apps/example-vue/src/App.vue` 已从 enterprise preview skeleton 切换到真实 customer enterprise workspace，包含 query / list / create / edit / detail / delete 流程
- `apps/server/src/modules/customer/module.ts` 已接入 auth guard，`customer:customer:(list|create|update|delete)` 权限码与 401/403 语义已通过 server 测试验证
- `apps/server/src/modules/auth/service.ts` 已导出 `AuthIdentity` 作为 canonical identity owner，`AuthLoginResponse` 作为 login/refresh 统一返回类型
- `apps/server/src/modules/auth/module.ts` 中 `/auth/login` 与 `/auth/refresh` 返回体已通过 `AuthLoginResponse` 类型化
- `apps/example-vue/src/lib/platform-api.ts` 中 `login()` / `refreshAuth()` 已简化为直接解构 `LoginResponse` 而非重复拷贝字段
- `packages/frontend-vue` 新增 `usePermissions` composable 和 `buildPermissionGates` 工具函数，`App.vue` 中的 customer action 权限判断已迁移到预设层消费
- `packages/ui-enterprise-vue` 新增 `ElyShell`、`ElyNavNodes`、`ElyTable`、`ElyQueryBar`、`ElyForm`、`ElyPreviewSkeleton` 六个组件；首版曾以 `Arco Design Vue` 起步，当前迁移 POC 已收敛到 `TDesign Vue Next` 运行时；新增 `useElyCrudPage` composable 把 `ui-core` 的 `UiCrudPageDefinition` 映射为企业组件 contracts；组件命名从 `ElysianEnterprise*` 收敛为 `Ely*`
- `packages/schema` 新增 `productModuleSchema`，包含 `name/sku/price/category/status` 字段，`productModuleSchema` 已注册为 generator 可用 schema
- `packages/generator/src/templates.ts` 中 `renderRepositoryTemplate` 的 `CustomerStatus` 硬编码已修复为 `{PascalName}Status`，`renderServiceTemplate` 的 `input.name` 硬编码已修复为动态检测第一个 `string/id` 字段
- 已用 `product` 实体验证 generator 模板抽象稳定性，`bun --filter @elysian/generator generate --schema product` 零残留通过
- `Phase 2` 审计基线已补齐；“权限变更审计”将待 `Phase 3A` 的用户 / 角色管理模块落地后沿用现有 `audit_logs` owner 接入
- `packages/schema` 已新增 `userModuleSchema`，`packages/persistence/src/auth.ts` 已补 users CRUD / reset-password helper，`apps/server/src/modules/user` 已提供 `GET /system/users`、`GET /system/users/:id`、`POST /system/users`、`PUT /system/users/:id`、`POST /system/users/:id/reset-password`
- 默认 auth seed 已补 `system:user:create`、`system:user:update`、`system:user:reset-password` 权限点，并与 `/system/users` 菜单路径保持一致
- `apps/server/src/app.test.ts` 已覆盖用户列表、详情、创建、更新、重置密码和重复用户名冲突的最小 server 合约
- `packages/schema` 已新增 `roleModuleSchema`，`packages/persistence/src/auth.ts` 已补 roles CRUD、角色权限替换、角色用户关联替换 helper，`apps/server/src/modules/role` 已提供 `GET /system/roles`、`GET /system/roles/:id`、`POST /system/roles`、`PUT /system/roles/:id`
- 默认 auth seed 已补 `system:role:list`、`system:role:create`、`system:role:update` 权限点，并新增 `/system/roles` 系统菜单
- `apps/server/src/app.test.ts` 已覆盖角色列表、详情、创建、更新、权限/用户关联和系统角色保护语义
- `packages/schema` 已新增 `menuModuleSchema`，`packages/persistence/src/auth.ts` 已补 menus CRUD、菜单角色关联替换 helper，`apps/server/src/modules/menu` 已提供 `GET /system/menus`、`GET /system/menus/:id`、`POST /system/menus`、`PUT /system/menus/:id`
- 默认 auth seed 已补 `system:menu:list`、`system:menu:update` 权限点，并新增 `/system/menus` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖菜单列表、详情、创建、更新以及 parent / permission / role 关联校验
- `packages/schema` 已新增 `departmentModuleSchema`，`packages/persistence/src/schema/auth.ts` 与 `packages/persistence/src/auth.ts` 已补 `departments / user_departments`、部门 CRUD、部门用户关联 helper，并新增 `0003_auth_departments.sql`
- `apps/server/src/modules/department` 已提供 `GET /system/departments`、`GET /system/departments/:id`、`POST /system/departments`、`PUT /system/departments/:id`
- 默认 auth seed 已补 `system:department:list`、`system:department:create`、`system:department:update` 权限点，并新增 `/system/departments` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖部门列表、详情、创建、更新以及 parent / user 关联校验；`Phase 3A` 四个核心系统模块后端闭环已完成
- `packages/schema` 已新增 `dictionaryModuleSchema`，`packages/persistence/src/schema/dictionary.ts` 与 `packages/persistence/src/dictionary.ts` 已补 `dictionary_types / dictionary_items`、字典类型 / 字典项 CRUD helper，并新增 `0004_dictionary.sql`
- `apps/server/src/modules/dictionary` 已提供 `GET /system/dictionaries/types`、`GET /system/dictionaries/types/:id`、`POST /system/dictionaries/types`、`PUT /system/dictionaries/types/:id`、`GET /system/dictionaries/items`、`GET /system/dictionaries/items/:id`、`POST /system/dictionaries/items`、`PUT /system/dictionaries/items/:id`
- 默认 auth seed 已补 `system:dictionary:list`、`system:dictionary:create`、`system:dictionary:update` 权限点，并新增 `/system/dictionaries` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖字典类型 / 字典项列表、详情、创建、更新及 type relation 校验；`P3B` 首轮字典模块后端闭环已完成
- `packages/schema` 已新增 `settingModuleSchema`，`packages/persistence/src/schema/setting.ts` 与 `packages/persistence/src/setting.ts` 已补 `system_settings`、系统配置 CRUD 和按 key 查询 helper，并新增 `0005_setting.sql`
- `apps/server/src/modules/setting` 已提供 `GET /system/settings`、`GET /system/settings/:id`、`POST /system/settings`、`PUT /system/settings/:id`
- 默认 auth seed 已补 `system:setting:list`、`system:setting:create`、`system:setting:update` 权限点，并新增 `/system/settings` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖系统配置列表、详情、创建、更新与 key 冲突校验；`P3B` 第二轮系统配置模块后端闭环已完成
- `packages/schema` 已新增 `operationLogModuleSchema`，`packages/persistence/src/auth.ts` 已沿用 `audit_logs` owner 补 `getAuditLogById`、`listAuditLogsByFilter` 查询能力，`apps/server/src/modules/operation-log` 已提供 `GET /system/operation-logs`、`GET /system/operation-logs/:id`、`GET /system/operation-logs/export`
- 默认 auth seed 已补 `system:operation-log:list`、`system:operation-log:export` 权限点，并新增 `/system/operation-logs` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖操作日志列表、筛选、详情、导出与 not-found 语义；`P3B` 操作日志模块只读闭环已完成
- `packages/schema` 已新增 `fileModuleSchema`，`packages/persistence/src/schema/file.ts` 与 `packages/persistence/src/file.ts` 已补 `files` 元数据 schema、migration 与 CRUD helper，`apps/server/src/modules/file` 已提供 `GET /system/files`、`GET /system/files/:id`、`POST /system/files`、`GET /system/files/:id/download`、`DELETE /system/files/:id`
- `apps/server/src/modules/file/storage.ts` 已把本地磁盘存储适配器收敛在 `apps/server` runtime owner，避免文件二进制存储侵入 `packages/persistence`
- 默认 auth seed 已补 `system:file:list`、`system:file:upload`、`system:file:download`、`system:file:delete` 权限点，并新增 `/system/files` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖文件上传、列表、详情、下载、删除与缺失 multipart 文件校验；`P3C` 首轮文件模块后端闭环已完成
- `packages/schema` 已新增 `notificationModuleSchema`，`packages/persistence/src/schema/notification.ts` 与 `packages/persistence/src/notification.ts` 已补 `notifications` schema、migration 与 CRUD / 标记已读 helper，`apps/server/src/modules/notification` 已提供 `GET /system/notifications`、`GET /system/notifications/:id`、`POST /system/notifications`、`POST /system/notifications/:id/read`
- 默认 auth seed 已补 `system:notification:list`、`system:notification:create`、`system:notification:update` 权限点，并新增 `/system/notifications` 系统菜单；`example-vue` 的系统导航占位已与之对齐
- `apps/server/src/app.test.ts` 已覆盖通知列表、筛选、详情、创建、标记已读与非法接收人校验；`P3C` 通知模块后端闭环已完成
- 已新增仓库根 `docker-compose.yml` 与 `stack:*` 脚本，形成 `server + PostgreSQL` 一键启动基线（含 migrate + seed）
- 已新增 `e2e:smoke` 与 `e2e:smoke:full` 脚本，并在 CI 接入 `e2e-smoke` job（统一走 full 入口，执行 migrate + seed + 登录/customer CRUD 冒烟）
- 已补 `WP-3` 最小基线：`/metrics` 运行时指标快照、可配置 CORS 白名单、内存限流策略（生产环境默认启用）
- 已完成 `Phase 6A Round-2` 退出判定，并将下一主线切换为 `Phase 5 / P5A`

## 待验证项

- RBAC 权限点命名是否足够支撑 generator 自动生成
- refresh session 表结构是否需要补多设备登录相关字段
- auth guard / middleware 应以模块级 helper 还是 app 级插件方式挂载
- `/auth/me` 返回结构是否已经足够稳定到可被更多前端预设层直接消费
- 第二个实体应优先选 `product` 还是 `order`
- `generated/` 到正式模块目录的 apply / merge 机制是否需要独立 manifest
- 本地开发数据库与测试数据库策略是否需要拆分
- `Arco` 主题 token 与 `ui-core` 页面协议之间的映射粒度应收敛到哪一层
- 用户管理模块后端闭环是否已经足够稳定到可供角色 / 菜单模块复用
- 字典模块契约是否已经足够稳定到可供后续配置模块、表单字典联动和 generator 消费
- 系统配置模块是否需要在后续补“按 key 批量读取 / 缓存”能力，但不反向侵入 runtime `config` owner
- 文件模块是否需要在后续补对象存储适配器、预览/缩略图与生命周期清理，但不改变当前 metadata/storage owner 拆分
- 通知模块是否需要在后续补模板化发送、多通道投递和用户侧收件箱视图，但不把站内通知 owner 和外部投递 owner 混在一起

## 下一步

1. 评估 `P7A Round-1` 是否可以收口，还是在进入下一轮前补 workflow 审计与 persistence 侧专项测试。
2. 若继续推进 workflow，优先限制在简化任务语义内，不提前引入 claim/transfer/delegate。
3. 再决定是否需要继续细拆 workflow 权限颗粒度，避免过早扩面。
