# 功能评审与体验评估机制

更新时间：`2026-05-16`

## 目的

本文件定义 Elysian 在功能优化时的评审机制，重点回答两个问题：

1. 一个功能是否真的降低用户完成任务的成本。
2. 这个功能是否在不破坏 owner、验证链路和生成物质量的前提下值得继续推进。

本文件不替代 [DEVELOPMENT_PRINCIPLES.md](../DEVELOPMENT_PRINCIPLES.md)、[ARCHITECTURE_GUARDRAILS.md](../ARCHITECTURE_GUARDRAILS.md) 或具体阶段计划。若评审结论涉及 owner、依赖方向、长期架构边界或当前主线目标变化，仍必须同步对应文档或补 ADR。

## 适用范围

适用：

- 新功能立项前的价值判断
- 已有功能优化前的优先级排序
- Generator、企业后台工作区、发布/门禁链路的体验复盘
- PR 前后的功能验收与风险归因

不适用：

- 只做代码风格整理且不改变用户行为的改动
- 生产事故当下的应急止血
- 已经有独立 ADR / runbook 约束的重型基础设施决策

## 核心判断

优秀功能必须同时满足：

```text
用户更快完成真实任务，结果更可信，边界仍清楚，验证仍可执行。
```

若只能提升“看起来完整”，但无法证明减少用户负担或增强验证闭环，应暂缓。

## 评审分层

### 1. 用户价值评审

判断功能是否服务真实任务。

必答问题：

- 目标用户是谁。
- 用户第一步要完成什么。
- 当前痛点是什么，是找不到入口、输入成本高、结果不可信，还是失败后不知道下一步。
- 新方案减少了哪一步成本。
- 不做该功能时，用户现在如何绕行。
- 该功能是高频刚需、阶段门槛，还是低频增强。

硬门槛：

- 说不清目标用户：暂缓。
- 说不清用户任务：暂缓。
- 只增加入口、配置或概念，但不减少任务成本：暂缓。

### 2. 边界与 owner 评审

判断功能是否落在正确位置。

必答问题：

- canonical owner 是谁。
- 是否已有实现可复用。
- 是否会和现有模块形成重复 owner。
- 是否需要新增 shared helper、adapter、service 或跨层抽象。
- 是否把规划态能力写成已实现事实。
- 是否改变 `apps/server`、`packages/schema`、`packages/generator`、`packages/persistence`、前端适配层之间的职责边界。

硬门槛：

- owner 不清楚：停止并确认。
- 需要跨多个层次且职责重叠：停止并确认。
- 为了复用而新增无明确 owner 的 shared 桶：禁止。

### 3. 验证评审

判断功能是否能被证据支撑。

必答问题：

- 成功路径如何验证。
- 失败路径如何验证。
- 用户是否能看到 preview、diff、blocker、确认清单、apply evidence 或其他决策证据。
- 是否已有合适的组件测试、composable 测试、server 合约测试、E2E smoke、报告门禁或人工验收方式。
- 上线后用什么信号判断是否继续优化。

硬门槛：

- 没有明确验证方式：不进入实现。
- 只有 happy path，没有阻断、权限、失败或回退路径：只能作为原型，不能作为稳定能力。
- 生成类能力没有 preview / review / confirm / apply 证据：不能进入正式写入链路。

## 标准评审流程

### 功能前评审

用于决定是否做。

```text
功能名称：
目标用户：
用户任务：
当前痛点：
现有 owner：
可复用能力：
计划方案：
验证方式：
预计收益：
主要风险：
结论：推进 / 原型验证 / 暂缓 / 放弃
```

### 实现中复审

以下情况必须触发：

- 准备新增 shared helper、adapter、service、通用 composable 或跨层抽象
- 实现范围开始跨越原定 owner
- 发现已有文档与代码事实冲突
- 发现必须补新的门禁或长期文档

复审输出：

```text
触发原因：
原 owner 判断：
新的影响面：
是否仍复用现有 owner：
是否需要同步文档：
是否需要 ADR：
结论：
```

### 上线后评估

用于决定继续优化、收敛或回滚。

```text
已上线能力：
用户路径证据：
验证结果：
失败与阻断分布：
用户困惑点：
维护成本：
下一步动作：继续优化 / 收敛文档 / 补验证 / 回滚
```

## 评分维度

每项按 `1` 到 `5` 评分，`3` 代表当前可接受，`4` 代表稳定，`5` 代表可作为后续模板。

| 维度 | 说明 | 低分信号 |
| --- | --- | --- |
| 用户价值 | 是否解决明确任务 | 功能存在但用户第一步仍不清楚 |
| 使用成本 | 是否减少理解、输入、等待和返工 | 首屏术语多、配置重、路径长 |
| 结果可信度 | 用户是否知道系统生成了什么、改了什么、没改什么 | 只有成功/失败，没有证据 |
| 边界清晰度 | owner 和依赖方向是否稳定 | 多处重复实现或 shared owner 不明 |
| 复用程度 | 是否优先复用既有 schema、模板、组件、报告链路 | 新增平行实现 |
| 验证充分性 | happy path、失败路径和阻断路径是否可回归 | 只能人工凭感觉验收 |
| 维护成本 | 是否增加长期复杂度 | 为少量场景引入重抽象 |

建议结论：

| 平均分 | 结论 |
| --- | --- |
| `4.2+` | 可作为稳定基线继续复用 |
| `3.5 - 4.1` | 可继续推进，但需补短板 |
| `2.8 - 3.4` | 只适合小步优化或原型验证 |
| `< 2.8` | 暂缓，先重定用户任务或 owner |

硬门槛优先于平均分。只要 owner、验证方式或用户任务任一项不清楚，即使平均分较高，也不能直接进入实现。

## 当前首轮评估：Phase G Generator 真链路

评估范围：

- 真实 `generator preview` workspace 的 `start -> preview -> review -> confirm -> apply`
- `apps/server` 的 `generator-session` 编排
- `packages/generator` 的 preview/report/apply artifact
- `packages/persistence` 的 review-only SQL proposal snapshot

评估依据：

- [2026-05-16 Phase G：Generator 真链路收口](../plans/2026-05-16-phase-g-generator-true-path-closeout.md)
- [2026-05-10 用户体验打磨 BDD 规格](../plans/2026-05-10-user-experience-bdd-spec.md)
- [CI 门禁与报告](./03-ci-gates-and-reports.md)
- 当前 roadmap 对 `Phase G` 的边界描述

说明：本评估基于仓库文档与已声明验证入口，不等同于真实用户访谈结论。

| 维度 | 评分 | 判断 |
| --- | --- | --- |
| 用户价值 | `4` | 已从完整 `Schema JSON` 门槛转向模板起稿、复制结构和真实生成结果，直接服务生成器使用者的第一步任务。 |
| 使用成本 | `3` | 首屏结构已收敛为新建生成、最近结果、生成结果，但 schema 草稿、review、confirm、apply 仍是偏专业路径，需要继续降低字段输入和失败恢复成本。 |
| 结果可信度 | `4` | 已有 file plan、diff、SQL proposal、confirmation evidence、apply evidence、drift/recovery 状态，用户可判断生成结果与阻断原因。 |
| 边界清晰度 | `4` | `apps/example-vue`、`apps/server`、`packages/generator`、`packages/persistence` 的职责描述清楚，confirm 不等于 migration，apply 只到 staging。 |
| 复用程度 | `4` | 继续复用 schema、generator report、persistence proposal snapshot 与既有 CI report/gate 链路，没有新增第二套 starter 或跨层 shared owner。 |
| 验证充分性 | `4` | 已具备组件/composable/server 生命周期测试、`e2e:generator:studio`、`e2e:generator:browser`、generator reports gate 等入口。 |
| 维护成本 | `3` | 真链路证据较完整，但前端 workspace 与证据视图仍有复杂度积累风险，后续优化需优先拆清用户路径而不是增加步骤或抽象。 |

综合结论：平均 `3.7`，当前适合继续推进，但不宜扩成新的平台能力 phase。

## 当前优化建议

优先级 `P0`：

- 继续把 Generator 真实 workspace 的 happy path、blocked apply、drift、recovery 和 evidence 回看固定到自动化验证。
- 保持 `apply` 只到 staging，正式 migration 继续由 `packages/persistence` 的人工接入路径承接。
- 对失败文案继续做用户可行动化处理，避免把 server 原始原因直接暴露为主界面说明。

优先级 `P1`：

- 用评审表复核每个 Generator 入口是否服务“开始生成、审查结果、确认应用”三类任务，删除或降级不服务当前任务的展示。
- 将字段草稿与 schema 校验反馈继续收敛到“改哪里、为什么、怎么修”的表达。
- 对最近结果与历史回放补明确边界，防止用户误以为旧结果已应用或已发布。

优先级 `P2`：

- 观察真实使用后再决定是否补更强的视觉 diff、模板搜索、权限/菜单影响摘要增强。
- 导入链路只做边界判断，不进入当前 `Phase G` 完成定义。
- 不引入新的通用设计器、SQL 工作台或生产发布平台语义。

## 评审结论模板

后续每次功能评审可直接复制：

```text
功能名称：
目标用户：
用户任务：
当前痛点：
现有 owner：
可复用能力：
计划方案：
验证方式：
用户价值评分：
使用成本评分：
结果可信度评分：
边界清晰度评分：
复用程度评分：
验证充分性评分：
维护成本评分：
硬门槛检查：
结论：
需要同步的文档：
残留风险：
```

