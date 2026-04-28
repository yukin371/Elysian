# roadmap

更新时间：`2026-04-28`

本文件只记录当前活跃工作轨道，不重复定义完整阶段体系。完整阶段与依赖关系见 [06-phased-implementation-plan.md](./06-phased-implementation-plan.md)。

## 当前版本目标

保持 `Phase 2`、`Phase 3`、`Phase 4`、`Phase 6A Round-2`、`Phase 5 / P5A` 与 `Phase 6B` 已归档；`Phase 7 / P7A` 的最小 workflow 闭环已在 `2026-04-26` 完成 `Round-2` 收口，当前按“已完成的能力基线”处理，不继续外扩到 `transfer / delegate`。当前即时优先级切回“若依基础功能对齐”：先把已落后端能力收口成更完整的后台基础功能包，优先补系统模块工作区闭环、在线会话治理、登录安全策略、常用导入导出与仍缺失的高频基础模块；`generator / SQL / workflow` 继续保留为次级推进轨道，而不是当前第一优先级。

### Current Mainline: 若依基础能力对齐 🚧

- 已决定：`P7A Round-2` 视为已完成能力基线；当前主线回到“标准后台基础能力收口”，优先按若依常用后台矩阵补齐日常可用能力
- 入口依据：认证、RBAC、系统模块、多租户、数据权限与 workflow 最小闭环都已具备，不再缺“能不能做”的底座，当前缺的是“后台常用功能是否足够完整”
- 当前范围：优先收口 `apps/example-vue` 的系统模块工作区、真实路由切换与高频交互；优先补岗位、在线会话治理、登录锁定/失败策略、用户/字典/配置等高频模块的导入导出与日志视图缺口
- 当前约束：不新增第二套 shared owner，不把示例应用扩写成完整低代码平台，不把 `generator / SQL / workflow` 的次级缺口继续拔高为当前第一优先级
- 当前补充决策：C 端界面方向维持 `Vue` 第一优先级，`uniapp` 作为第二优先级进入设计储备；当前只允许文档设计，不并行开启第二前端实现主线
- 已具备基础：用户、角色、菜单、部门、字典、系统配置、操作日志、文件、通知、租户等后端闭环已落地，前端工作区已覆盖其中大部分模块
- 已具备基础：当前用户 refresh session 列表 / 单会话 revoke 已落最小后端切片，可作为“在线用户/会话治理”入口继续扩写，而不引入第二套 auth owner
- 已具备基础：`P7A` workflow、`generator-session` 与 SQL preview 已可保留为次级轨道，当前只做必要收口，不继续抢占后台基础功能优先级
- 当前结论：先把“像若依的基本后台”补齐，再决定是否恢复 `P7B/P7C`、独立 SQL 工作区或更完整 Studio 产品化
- 功能矩阵：[2026-04-28-ruoyi-basic-feature-alignment-matrix.md](./plans/2026-04-28-ruoyi-basic-feature-alignment-matrix.md)
- 执行计划：[2026-04-28-ruoyi-basic-feature-alignment-execution-plan.md](./plans/2026-04-28-ruoyi-basic-feature-alignment-execution-plan.md)
- C 端第二界面设计：[2026-04-28-c-end-uniapp-second-surface-design.md](./plans/2026-04-28-c-end-uniapp-second-surface-design.md)
- uniapp 范围规划：[2026-04-28-uniapp-scope-plan.md](./plans/2026-04-28-uniapp-scope-plan.md)
- workflow 收口文档：[2026-04-26-phase-7a-round2-verification-and-task-semantics.md](./plans/2026-04-26-phase-7a-round2-verification-and-task-semantics.md)

## Active Tracks

### 1. 若依基础功能对齐 🚧

- 当前目标：把仓库现有系统能力收口成“企业后台日常可用”的基础包，优先解决模块闭环覆盖率不足，而不是继续拔高平台能力天花板
- 第一优先级：收口 `apps/example-vue` 已有系统工作区，优先保证 `users / roles / menus / departments / dictionaries / settings / operation-logs / notifications / tenants` 具备真实路由切换、列表/详情、创建/编辑与必要状态动作
- 第一优先级：补仍缺的若依高频基础项，优先 `岗位（post）`、在线会话治理、登录失败计数/锁定、登录日志视图与高频模块导入导出
- 第二优先级：C 端界面扩展方向先固定为 `uniapp`，但当前只保留设计储备，不提前进入实现
- 第二优先级：在不改变 owner 的前提下，继续把通知、操作日志、租户与数据权限体验向后台常用形态收口
- 当前不优先：不继续扩 `workflow transfer / delegate`，不先做独立 SQL 工作区，不先做更重的 Studio 报告中心

### 2. Phase 2: Auth Foundation ✅ 归档

- 已完成：RBAC 表结构与 seed、login / refresh / logout / me 接口、customer 路由 auth guard、identity contract 收敛、`usePermissions` / `buildPermissionGates` 提取、最小 auth 审计基线

### 3. Phase 3: 标准企业模块 ✅ 归档

- 已完成：`Phase 3A` 用户 / 角色 / 菜单 / 部门四个系统模块的最小后端闭环
- 已完成：`Phase 3B` 字典 / 系统配置 / 操作日志模块后端闭环，保持既有 canonical owner 不漂移
- 已完成：`Phase 3C` 文件 / 通知模块后端闭环，保持 metadata owner 与 runtime storage owner 分离
- 已完成：`3.10` Vue 管理后台布局，`ElyShell` 已具备侧边栏 + 顶栏 + 内容区 + 标签页布局
- 已完成：`3.11` Vue 通用组件，`ui-enterprise-vue` 已落 `ElyCrudWorkspace`、标准列表页、标准表单页与只读详情视图
- 已完成：`3.12` Vue 企业预设首版，`apps/example-vue` 已接入真实 enterprise shell 与 customer 工作区
- 已推进：`apps/example-vue` 的 enterprise workspace 已扩到 `users / roles / departments / menus / dictionaries / settings / operation-logs / workflow definitions / notifications / tenants`，当前通知页已收敛为“主区单列表 + 右侧详情/创建”结构；tenant 工作区已接入列表 / 详情 / 创建 / 编辑 / 状态切换的最小闭环，并完成首轮示例应用内 helper 拆分，避免继续把 tenant 纯逻辑堆进 `App.vue`
- 已推进：通知工作区已通过真实浏览器回归验证登录、列表筛选、详情联动、创建通知与标记已读；当前已补状态列映射缺口，避免 `read/unread` 在企业表格中退化为“未知”
- 已推进：customer 工作区已从前端本地筛选收敛到服务端列表协议，`GET /customers` 当前支持 query / page / pageSize / sortBy / sortOrder，并返回 page metadata 供示例页最小分页交互消费
- 已确认边界：`apps/example-vue` 当前是“企业预设 + 多工作区联调验证页”，重点验证 customers / notifications / tenants / workflow 等真实闭环，不视为完整多模块后台；后续结构整理仍限制在示例应用内部，不新增 shared owner；详见 [2026-04-26-vue-enterprise-example-boundaries-and-benchmark.md](./plans/2026-04-26-vue-enterprise-example-boundaries-and-benchmark.md)

### 4. Phase 4 Pre-validation ✅ 归档

- 已完成：`productModuleSchema` 落地、generator 模板硬编码修复（`CustomerStatus` → `{PascalName}Status`、`input.name` → 动态字段检测）、product 生成验证零残留通过

### 5. Phase 6A: 生产基线准备 ✅ Round-2 收口

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
- 第二轮已完成：曾输出“主线进入 `Phase 5 / P5A`”的阶段决策；该决策现已完成历史使命，当前主线已切换到 `Phase 6B`
- 第二轮已推进：限流响应头观测增强（`x-ratelimit-limit`/`remaining`/`reset` + `retry-after`），为分布式限流评估提供运行期信号
- 第二轮已推进：已建立双轨文档与 skill 模板骨架（`docs/quickstart`、`docs/reference`、`docs/ai-playbooks`、`skills/templates`）
- 第二轮计划文档：[2026-04-22-phase-6a-round2-baseline-hardening.md](./plans/2026-04-22-phase-6a-round2-baseline-hardening.md)
- WP-5 处置手册：[2026-04-22-phase-6a-wp5-smoke-triage-runbook.md](./plans/2026-04-22-phase-6a-wp5-smoke-triage-runbook.md)
- WP-6 评估文档：[2026-04-22-phase-6a-wp6-rate-limit-evaluation.md](./plans/2026-04-22-phase-6a-wp6-rate-limit-evaluation.md)
- 阶段执行基线：[2026-04-23-phase-execution-gates-and-wbs.md](./plans/2026-04-23-phase-execution-gates-and-wbs.md)
- 稳定性观察窗口：[2026-04-23-phase-6a-round2-stability-window.md](./plans/2026-04-23-phase-6a-round2-stability-window.md)
- 对标与功能清单：[2026-04-23-competitive-benchmark-and-dev-feature-checklist.md](./plans/2026-04-23-competitive-benchmark-and-dev-feature-checklist.md)
- 历史主线决策文档：[2026-04-23-phase-5-mainline-decision-and-kickoff.md](./plans/2026-04-23-phase-5-mainline-decision-and-kickoff.md)

#### Phase 6A Round-2 Exit Checklist

- [x] `WP-4` 指标标准化：`/metrics/prometheus` 与 `/metrics` 已补进程级 uptime/start/cpu/memory 指标
- [x] `WP-5` smoke 稳定性：报告（attempt1/2）+ 诊断 + 索引 + 门禁 + CI Summary/outputs + workflow_dispatch 参数化
- [x] `WP-5` 策略边界回归：`allowRecoveredByRetry`、`maxAttempts`、非法输入已覆盖测试
- [x] `WP-6` 分布式限流评估：门槛与切换条件已文档化
- [x] 最近连续 CI 运行稳定性观察窗口达标（建议最少 5 次，且无系统性 smoke 阻断）
- [x] 基于观察窗口输出“进入 `Phase 6B` 或 `Phase 5`”的主线决策记录

### 5. Phase 5: AI 辅助开发 ✅ P5A 已归档

- 已归档：`P5A: AI -> Schema` 最小闭环已完成；该阶段现作为已完成能力保留，不再定义当前主线优先级
- 归档说明：
  - `Phase 4` 已完成，满足 `Phase 5` 入口条件
  - `03-ai-codegen-strategy.md` 已明确推荐顺序为“schema 驱动生成 -> AI 生成 schema -> 交互式 AI 助手”
  - `P5A` 收尾后，仓库已按最新主计划切换到 `Phase 6B / P6B3`；`P5B/P5C` 保留为后续 backlog，而非当前执行主线
- 归档边界：
  - 不启动 `P5B/P5C`
  - 不做交互式 AI 助手
  - 不允许 AI 绕过 schema / generator 直接改平台核心基础设施
- 已完成工作包：
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
- 已清理风险：tenant e2e harness 已改为优先读取 `ELYSIAN_TENANT_PORT`，默认走随机高位端口，避免本机旧进程占用通用 `PORT` 时误连错误实例
- 已完成验证：`bun run check` 与 `bun run e2e:tenant:full` 已通过，覆盖 tenant init 幂等、super-admin 租户管理授权、customer 跨租户隔离、RLS 与 `tenant_id` 外键约束
- 已完成：`P6B3 / WP-4 ADR-0009`，已归档多租户升级与验证策略，固定默认租户/非默认租户初始化分离、真实 PostgreSQL 验证门槛与连接回收要求
- 已完成：CI 已接入 `e2e-tenant` 作业，复用 `e2e:tenant:full` 与 PostgreSQL service 执行真实租户隔离验证并归档报告
- 已完成：新增 `e2e:tenant:stability:snapshot` 与 `e2e:tenant:stability:evidence`，用于单次 tenant e2e 快照沉淀与多次 artifact 观察窗口证据汇总
- 已接入：CI `e2e-tenant` 已在单次 tenant e2e 后产出稳定性快照并随 artifact 归档
- 已完成：新增 `e2e:tenant:stability:collect`、`e2e:tenant:upgrade:decision`、`e2e:tenant:upgrade:gate`、`e2e:tenant:upgrade:finalize` 与 `e2e:tenant:upgrade:finalize:from-downloads`，将下载 artifact 到升级结论的收尾链路固定为脚本化流程
- 已完成：新增 `e2e:tenant:stability:download` 与 `e2e:tenant:upgrade:finalize:from-github`，可直接从 GitHub 下载 tenant artifact 并落升级结论
- 已完成：基于 `workflow_dispatch` 连续 5 次真实样本 `24886462252 / 24886403317 / 24886352160 / 24886285868 / 24886175279` 输出 tenant observation evidence；当前 `selectedWindowRuns=5`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`，门禁返回 `candidate_for_next_step`
- 已完成：基于 `ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10` 与最近 `10` 次 tenant artifact（`24887191148 / 24887139395 / 24887089834 / 24887032527 / 24886462252 / 24886403317 / 24886352160 / 24886285868 / 24886175279 / 24885957451`）输出首轮滚动观察结论；当前 `selectedWindowRuns=10`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`
- 已完成：tenant 主线收敛链已完成，历史功能分支样本已收敛到 `dev/main`，且 `dev` push / workflow_dispatch 与 `main` push / workflow_dispatch 均已包含 `e2e-tenant` job 与 artifact
- 已完成：基于 `dev` 最近 `10` 次 tenant artifact（含 `24888296758 / 24888362434 / 24888586126 / 24888651338 / 24888706653 / 24888757984 / 24888812971 / 24888870698 / 24888923973 / 24888972790`）输出主线级第一版 `10/10` 观察结论；当前 `selectedWindowRuns=10`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`
- 已完成：基于 `main` 最近 `10` 次 tenant artifact（含 `24889218600 / 24889284909 / 24889342252 / 24889396810 / 24889454355 / 24889506795 / 24889562531 / 24889627339 / 24889689643 / 24889747211`）输出主线级第一版 `10/10` 观察结论；当前 `selectedWindowRuns=10`、`failedRunCount=0`、`systemicBlockerDetected=false`、`qualifiedForNextStep=true`
- 已新增前期文档草案：[2026-04-25-vue-enterprise-preset-tdesign-migration-draft.md](./plans/2026-04-25-vue-enterprise-preset-tdesign-migration-draft.md) 与 [2026-04-25-vue-enterprise-preset-tdesign-mapping-checklist.md](./plans/2026-04-25-vue-enterprise-preset-tdesign-mapping-checklist.md)，用于在当前 `Phase 6B` runbook 收尾后评估 `Arco -> TDesign` 迁移窗口
- 已推进：`packages/ui-enterprise-vue` 与 `apps/example-vue` 已完成当前 POC 范围内的 `TDesign Vue Next` 收口，`ElyShell / ElyTable / ElyQueryBar / ElyForm / ElyCrudWorkspace / ElyPreviewSkeleton` 已不再依赖 `Arco` runtime；示例页默认语言已切到 `zh-CN`，并保留 `en-US` 回退
- 已完成：`2026-04-26` 自动化回归整理，已补 `P7A Round-1` 与 `TDesign` 迁移的统一回归收口文档，并明确当前仍待真实环境与手工 UI 验证
- 已完成阶段出口复验：`2026-04-25` 本地 `bun run check` 与 `bun run e2e:tenant:full` 通过，可将 `Phase 6B` 作为已归档阶段处理
- 归档后残留运营收尾：按迁移/发布 runbook 收敛生产发布演练、平台级发布命令与回滚责任边界，不再把“主线 tenant artifact 缺失”作为阻断项
- 已完成最小执行层自动化：新增 `tenant:release:report`、`tenant:release:gate`、`tenant:release:finalize`，把既有 tenant migration/release runbook 收敛为 rehearsal report / gate / finalize 三段式入口；这些脚本仅服务发布演练，不代表生产平台命令、owner 边界或发布责任已变更
- 已完成：发布检查清单已补 tenant 发布演练附加检查、输入映射与补充记录模板，`P6B3` 的 runbook 与 release checklist 已形成同一执行口径
- 已完成：已产出一份可归档的 tenant release rehearsal 样例记录，证明在目标环境确认和发布后验证缺失时，rehearsal gate 会按预期阻断
- 已完成：新增 `Tenant Release Rehearsal` GitHub 手动工作流，用表单化输入承接既有 `ELYSIAN_TENANT_RELEASE_*` 人工确认项；该工作流仅服务 rehearsal，不代表生产发布入口
- 已完成：真实 GitHub manual rehearsal（run `24894806843`）已验证新 workflow 的输入、artifact 与 gate 行为；在 `gitWorktreeClean=true` 前提下，最终只保留目标环境确认与发布后验证相关的 `8` 个预期 blocker
- 已完成：`P6B3 / WP-5` 迁移 / 发布演练与责任边界已完成最小收口，runbook、release checklist、rehearsal sample 与 GitHub manual rehearsal 已统一到同一执行口径
- 已完成：GitHub `Tenant Release Rehearsal` 已固定为 tenant 发布演练的默认入口；runbook + shell env 路径保留为备用入口
- 计划文档：[2026-04-24-phase-6b-enterprise-enhancement-design.md](./plans/2026-04-24-phase-6b-enterprise-enhancement-design.md)
- 执行手册：[2026-04-24-phase-6b-tenant-upgrade-runbook.md](./plans/2026-04-24-phase-6b-tenant-upgrade-runbook.md)
- 迁移/发布手册：[2026-04-24-phase-6b-tenant-migration-release-runbook.md](./plans/2026-04-24-phase-6b-tenant-migration-release-runbook.md)
- 收证记录：[2026-04-24-phase-6b-tenant-release-blocker-tracker.md](./plans/2026-04-24-phase-6b-tenant-release-blocker-tracker.md)
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
- 已推进：`packages/generator` 已补 preview/report 闭环，当前 `generate --preview` 可输出文件动作预览、结构化报告与 review-only SQL preview，为后续 Studio 生成预览提供底层产物
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

- generator 已从“只写入”扩到“可预览后再决定是否落盘”，当前可在 CLI 预览文件动作、输出 JSON 报告并生成 review-only SQL preview
- 已补代码生成 / SQL 生成 / 安全能力的功能矩阵与缺口设计文档，明确当前状态应表述为“代码生成底座已可用、SQL 仍为 review-only preview、安全具备基础等价能力但未进入完整企业安全平台”；详见 [2026-04-27-codegen-sql-security-feature-matrix-and-gap-design.md](./plans/2026-04-27-codegen-sql-security-feature-matrix-and-gap-design.md)
- `Track 1 / T1-2` 已落最小后端切片：`apps/server` 新增 `generator-session` 运行时模块，当前已支持生成 preview session 列表、详情、创建与 report 落盘，不提前进入 staging apply
- `Track 1 / T1-3` 已落最小后端切片：当前可对 preview session 执行 staging apply，apply 前会重验目标文件是否漂移，成功后写入 manifest 并保留最小 apply evidence
- `Track 1 / T1-4` 已落最小前端装配切片：`apps/example-vue` 的 generator workspace 当前已消费 `generator-session` 的 preview/apply DTO，主区展示文件计划与差异摘要，侧栏展示 session 元数据、SQL preview 与 apply evidence
- `Track 1 / T1-5` 已落最小持久化切片：`packages/persistence` 新增 `generator_preview_sessions` 表与 CRUD helper，`apps/server` 在 `DATABASE_URL` 分支已切到持久化 repository，并通过 report path 回放 preview 详情与 apply 链路
- `Track 2 / T2-1` 已落首个中性产物：`packages/generator` 当前可从 `ModuleSchema` 输出 `DatabaseChangePlan` create-table 计划，继续保持 SQL preview 在 generator、正式 migration proposal 在 persistence
- `Track 2 / T2-2` 已落最小 proposal builder：`packages/persistence` 当前可基于 `DatabaseChangePlan` 形状输出 review-only SQL draft、Drizzle schema snippet 与风险标签，但仍不直接生成正式 migration 文件
- 已完成一次功能矩阵复验：确认 generator session 列表 / 详情 / preview / staging apply 以及 auth refresh session 列表 / 单会话 revoke 均已落地，相关矩阵文档已按真实完成度回填
- 已确认当前缺口边界：`generator-session` 已具备最小持久化回放中心，但更细粒度目标目录 diff、冲突解释与正式人工确认体验仍待补齐；SQL proposal 到正式 migration 的人工接入规范也仍待补齐
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
- `packages/ui-enterprise-vue` 新增 `ElyShell`、`ElyNavNodes`、`ElyTable`、`ElyQueryBar`、`ElyForm`、`ElyPreviewSkeleton` 六个组件；首版曾以 `Arco Design Vue` 起步，当前已完成 `TDesign Vue Next` 运行时收口；新增 `useElyCrudPage` composable 把 `ui-core` 的 `UiCrudPageDefinition` 映射为企业组件 contracts；组件命名从 `ElysianEnterprise*` 收敛为 `Ely*`
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
- 已完成 `Phase 6A Round-2` 退出判定；先前已切到 `Phase 5 / P5A`，当前已进一步推进到 `Phase 6B / P6B3`

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

1. 先按若依基础功能矩阵收口 `apps/example-vue` 与 `apps/server` 的现有系统模块，优先补真实路由切换、列表/详情、创建/编辑、状态动作与权限动作闭环。
2. 先补仍缺的高频基础能力：`岗位（post）`、当前用户会话管理页与强制下线、登录失败计数/锁定、以及从操作日志扩展到用户/字典/配置等模块的导入导出能力。
3. `generator / SQL / workflow` 维持次级推进：优先做必要收口（如会话设备化、diff/evidence 强化），不抢占若依基础功能对齐的第一优先级。
4. 在前端企业工作区完成更高覆盖率前，不扩大到通知中心联动、调度器、脚本节点、前端设计器或第二套消息中心模型。
