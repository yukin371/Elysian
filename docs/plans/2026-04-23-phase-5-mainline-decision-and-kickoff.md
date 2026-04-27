# 2026-04-23 Phase 5 Mainline Decision and P5A Kickoff

> 历史说明：本文记录 `2026-04-23` 时点的主线决策。自 `2026-04-24` 起，仓库已完成 `P5A` 并切换到 `Phase 6B / P6B3`；当前优先级以 [06-phased-implementation-plan.md](../06-phased-implementation-plan.md) 与 [roadmap.md](../roadmap.md) 为准。

## 决策结论

- 下一主线选择：`Phase 5`
- 当前只启动：`P5A: AI -> Schema`
- 当前不进入：
  - `P5B` AI 建议器
  - `P5C` 交互与审计工作流
  - `Phase 6B` 企业增强（多租户、数据权限、缓存、定时任务、导入导出、特性开关）
- 以上结论为当时时点判断，现已归档为历史快照，不再代表当前执行主线

## 决策依据

1. `Phase 4` 已完成，满足 `Phase 5` 的入口条件；`Phase 6A Round-2` 已完成出口观察窗口与主线决策前置条件。
2. [03-ai-codegen-strategy.md](../03-ai-codegen-strategy.md) 已明确推荐顺序：先做 schema 驱动生成，再接入 AI 生成 schema，最后才做平台内交互式 AI 助手。
3. [06-phased-implementation-plan.md](../06-phased-implementation-plan.md) 已将 `Phase 5` 定义为 `Phase 4` 之后的自然延伸，而 `Phase 6B` 属于更重的企业运行时增强。
4. [2026-04-23-competitive-benchmark-and-dev-feature-checklist.md](./2026-04-23-competitive-benchmark-and-dev-feature-checklist.md) 已明确当前差距更偏体验层与交付层，不应在 `Phase 6A` 收尾后继续优先堆重型基础设施。
5. 当前仓库仍处于工程边界收敛期；若直接进入 `Phase 6B`，会在多租户、数据权限、缓存等方向显著扩大 owner 与运维复杂度，不符合“先补可持续治理骨架，再补重型能力”的仓库约束。

## Entry Gate 确认

- `Phase 4`（`P4D/P4E`）已完成。
- `Phase 6A Round-2` 的 `WP-4/5/6` 已达到出口标准。
- 最近 5 次 `dev` 相关 CI 运行稳定性窗口达标：
  - runIds: `24831519539`、`24831463736`、`24831405348`、`24831362661`、`24831277528`
  - `selectedWindowRuns=5`
  - `failedGateCount=0`
  - `maxConsecutiveFailedGates=0`
  - `recoveredByRetryCount=0`
  - `qualifiedForPhaseTransition=true`
- 已具备下一阶段入口文档与首轮 WBS。

## P5A 阶段边界

### 目标

把自然语言需求稳定转换为“可校验、可人工修正、可交给 generator”的结构化 schema 输入。

### 明确纳入

- 需求输入模板
- `AI -> Schema` 结构化输出约束
- 输出校验与 handoff 边界
- 人工接管、失败回放与最小审计骨架

### 明确不纳入

- 交互式 AI 助手 UI / CLI 工作流
- 让 AI 直接改 server / generator / persistence 核心基础设施
- 绕过 schema 校验直接生成最终代码
- `Phase 6B` 企业增强能力

## 首轮 WBS

### WP-1 输入契约与验收语料

- 目标：
  固定自然语言输入模板，避免 AI 输入过散导致 schema 输出不可比较。
- 输出物：
  - 需求输入模板
  - 至少 3 组代表性样例语料（标准 CRUD、带字典字段、带权限/菜单需求）
  - 验收规则草案（字段完整性、命名规范、权限点/菜单存在性）
- 验证方式：
  - 文档评审
  - 与现有 `packages/schema` / `packages/generator` 能力边界对齐
- 风险与回滚：
  - 若模板过宽导致输出漂移，收紧必填段落与字段枚举

### WP-2 结构化输出与校验边界

- 目标：
  明确 AI 输出的 canonical 结构，以及进入 generator 前必须通过的校验关口。
- 输出物：
  - `AI -> Schema` 输出字段清单
  - 与现有 module schema 的映射关系
  - 校验失败分类与人工修正入口
- 验证方式：
  - 至少 1 条从自然语言到 schema 的样例映射审查
  - `bun run check`
- 风险与回滚：
  - 若输出结构和既有 schema owner 冲突，优先回到 schema 侧统一契约，不新增平行 owner

### WP-3 回放与人工接管最小骨架

- 目标：
  保证 AI 失败时可以人工接管，而不是把阶段推进绑死在模型表现上。
- 输出物：
  - 输入 / 输出 / 校验结果的最小归档约定
  - 人工修正切入点说明
  - 失败场景分类（可重试 / 需人工修正 / 需回退模板）
- 验证方式：
  - 用 1 个失败样例走通“AI 输出失败 -> 人工修正 -> 继续 handoff”流程
  - `bun run check`
- 风险与回滚：
  - 若归档粒度过大导致维护成本上升，先保留文本与结构化结果，不提前引入重型审计存储

### WP-4 generator handoff 最小闭环

- 目标：
  证明“AI 生成 schema”不会绕过既有 generator / check / gate 体系。
- 输出物：
  - 一条最小演示链路：自然语言 -> schema -> generator staging
  - 阶段验收命令清单
  - 不通过条件与阻断规则
- 验证方式：
  - `bun run check`
  - 生成结果能进入既有 staging 目录而不破坏 hand-managed 文件
- 风险与回滚：
  - 若 handoff 边界不稳定，停在 schema 产出，不推进自动生成

## 当前阶段验收标准

1. 自然语言输入可稳定落入统一模板。
2. AI 输出能转为可校验 schema，失败时有明确分类和人工接管路径。
3. 至少 1 条样例链路能进入既有 generator 流程，而不突破既有 owner 边界。
4. 阶段文档、验证命令与风险约束同步到 `roadmap`。

## 首轮已落地产物

- `packages/schema/src/index.ts`
  - `validateModuleSchema`
  - `isModuleSchema`
- `packages/generator`
  - CLI 新增 `--schema-file`
  - 外部 schema handoff 改为内联 `.schema.ts`
- `docs/ai-playbooks`
  - `p5a-input-template.md`
  - `p5a-output-contract.md`
  - `p5a-acceptance-corpus.md`
  - `examples/*.module-schema.json`
- `scripts`
  - `p5a-schema-handoff-report.ts`
  - `p5a-schema-handoff-replay.ts`

## 暂缓事项

- `P5B` 的字段建议、表单建议、测试数据建议
- `P5C` 的 `--ai` 交互式工作流、回放界面、失败兜底 UI
- `Phase 6B` 的多租户、数据权限、缓存与定时任务

## 文档同步要求

- `roadmap.md`：同步当前主线与下一步
- `PROJECT_PROFILE.md`：同步当前阶段事实
- 后续若 `AI -> Schema` 改变 owner 或长期边界，再补 ADR
- 当前阶段推进请优先参考 `Phase 6B` 相关计划与 runbook，本文不再作为活跃任务文档
