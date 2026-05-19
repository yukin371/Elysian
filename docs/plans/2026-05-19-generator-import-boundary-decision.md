# 2026-05-19 Generator 导入链路边界决策

## 定位

本文件只回答 `Phase H Generator 可发布闭环硬化` 中“导入链路是否进入后续阶段”的边界问题，不实现导入 DSL、导入 API、批量落库、错误回写平台或第二套 starter。

当前结论：

- 导入链路可以作为后续候选阶段继续评估。
- 当前 `Phase H` 不进入导入实现。
- 若后续启动，只能先做 `ModuleSchema` / 生成器输入层的受控导入，不直接做业务数据批量导入平台。

## 现有事实

- `apps/example-vue` 已有文件上传、CSV 导出和 generator preview workspace，但没有业务数据导入工作区。
- `apps/server` 已有 `generator-session` preview / review / confirm / apply 闭环，但没有导入 API。
- `packages/schema` 已提供 `ModuleSchema`、简化 schema 展开与 runtime 校验，可作为“外部结构化输入 -> schema”的契约入口。
- `packages/generator` 已消费 `ModuleSchema` 产出 preview / report / staging apply artifact，不拥有运行时数据导入。
- `packages/persistence` 已拥有 review-only SQL proposal snapshot 与正式 migration 边界，不拥有前端文件解析或导入交互。
- 现有 P5A handoff / replay 更接近“AI 或人工修正后的 schema 输入接管”，不等于业务数据导入。

## Owner 判断

候选能力拆分如下：

| 能力 | 候选 owner | 当前判断 |
| --- | --- | --- |
| 上传文件选择、预览、字段映射交互 | `apps/example-vue` | 仅在具体应用工作区内成立，不应进入通用前端 shared owner |
| 导入输入契约、schema 形状校验 | `packages/schema` | 只限结构化 schema / mapping contract，不接管文件解析运行时 |
| 从导入结果生成 preview / report | `packages/generator` | 只处理 `ModuleSchema` 或未来明确的中性计划，不处理业务落库 |
| 导入任务 API、鉴权、审计、错误响应 | `apps/server` | 若后续启动，应由 server 拥有 HTTP 生命周期 |
| 业务数据写入、事务、约束、正式 migration | `packages/persistence` | 只拥有数据库层 helper / migration，不拥有页面导入流程 |

因此，导入链路不能由单一 `packages/generator` 吞掉。后续若启动，应按“输入契约 -> 预览 -> 人工确认 -> server 执行 -> persistence 写入”的分层路线拆分。

## 可复用契约

可以复用：

- `ModuleSchema` 与 `validateModuleSchema`：用于导入“生成器 schema 草稿”。
- `expandSimplifiedSchema`：用于轻量 JSON 输入展开。
- generator preview report 形态：用于导入前的结构化预览和失败分类参考。
- `blockerReasons` / `driftStatus` / `recoveryStatus` 的状态表达思路：用于后续导入阻断证据，但不能直接复用为业务导入错误模型。
- persistence proposal snapshot 的 handoff 思路：用于“可回放证据”，但不表示导入可以绕过正式 migration 或业务事务边界。

不能直接复用：

- `apply to staging` 语义不能变成业务数据落库。
- `generator-session` 不能直接扩成通用导入任务中心。
- 文件上传模块不能直接成为导入平台 owner。
- CSV 导出接口不能反推出对应导入契约。

## 错误报告格式

后续如果只做 `ModuleSchema` 导入：

- 可先复用 P5A / generator 的 schema 校验失败分类。
- 不需要新增平台级导入错误报告格式。

后续如果做业务数据导入：

- 需要新的错误报告格式。
- 至少需要区分文件解析错误、字段映射错误、行级校验错误、权限错误、唯一约束冲突、事务失败与可重试环境错误。
- 该格式应由 `apps/server` 定义 API envelope，由具体业务模块和 `packages/persistence` 返回可解释的约束信息。

## 冲突判断

当前若直接实现导入，会产生以下冲突：

- 与 `packages/generator` 的 schema -> artifact owner 冲突：导入业务数据不是生成器职责。
- 与 `packages/persistence` 的正式 migration owner 冲突：不能把导入过程当作 migration 自动化。
- 与 `apps/example-vue` 的真实 workspace owner 冲突：正式页面仍在硬化 generator 闭环，不应同时承接导入平台试错。
- 与 `Phase H` 完成定义冲突：本阶段目标是可审查、可确认、可 apply 的生成闭环，不是导入平台。

## 后续候选路径

推荐拆成两个候选阶段，而不是一次性做完整导入：

1. `Import Boundary POC`
   - 只允许导入 `ModuleSchema` JSON 或简化 schema JSON。
   - owner 以 `packages/schema` 校验和 `apps/example-vue` generator 高级输入为主。
   - 输出仍进入现有 preview / review / confirm / apply 链路。

2. `Business Data Import Candidate`
   - 单独选择一个低风险模块做 CSV 导入 POC。
   - 先定义 server API、错误报告、权限点、审计和事务边界。
   - 不复用 generator apply 语义，不写成正式 migration 自动化。

## ADR 判断

当前不需要新增 ADR。

原因：

- 本文件只记录阶段边界决策，不改变长期 owner、依赖方向或技术路线。
- 真正进入业务数据导入时，若要新增导入任务中心、错误报告标准或跨模块导入协议，再补 ADR。

## Phase H 决策

`Phase H` 只保留导入链路边界判断：

- 不新增导入 DSL。
- 不新增导入平台接口。
- 不新增批量落库能力。
- 不把导入结果写成当前已实现事实。
- 下一步若继续，只能先在 `demohub` 或 generator 高级输入里做 schema 输入层 POC，再决定是否进入正式工作区。
