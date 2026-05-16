# 系统能力评估

更新时间：`2026-05-16`

## 目的

本文件评估 Elysian 当前已经具备的系统能力，区分“已稳定”“可用但需收口”“验证中”和“规划/不应宣传”的能力边界。

本文件只基于当前仓库事实、已声明验证入口和阶段文档，不把 roadmap 中的后续方向写成已实现能力。

## 总体结论

Elysian 当前适合定位为：

```text
可发布参考 starter + 企业后台基础模块 + schema 驱动生成器 + 可审查 staging apply 链路
```

当前不宜定位为：

```text
完整低代码平台 / 完整生产发布平台 / 完整多端应用平台 / 通用 BPM 平台 / 自由 AI 自动改核心代码平台
```

综合评估：`3.7 / 5`

该分数代表：工程底座和验证链路已经较强，核心能力可以继续复用；主要短板不在“有没有能力”，而在“用户是否足够顺手、生产闭环是否足够产品化、能力宣传是否足够克制”。

## 能力分级

### A. 已稳定能力

这些能力已有明确 owner、可运行实现和验证入口，可作为当前参考发行版的稳定基线。

| 能力 | 当前状态 | 主要 owner | 验证入口 |
| --- | --- | --- | --- |
| Monorepo 工程骨架 | Bun workspaces 已建立 | 根工程 | `bun run check` |
| Server 基础运行时 | Elysia server、config、logging、errors、modules 已落地 | `apps/server` | `bun run server` / server tests |
| PostgreSQL 持久化基线 | Drizzle、migration、seed、repository helper 已形成 | `packages/persistence` | `bun run db:migrate` / tests |
| 认证与 RBAC | login/refresh/logout/me、权限校验、refresh session 已落地 | `apps/server` + `packages/persistence` | server tests / smoke |
| 标准企业模块后端 | 用户、角色、菜单、部门、岗位、字典、配置、日志、文件、通知、租户等已具备最小闭环 | `apps/server` + `packages/persistence` | `bun run test` / `e2e:smoke` |
| Vue 参考发行版 | `apps/example-vue` 已作为首个参考前端 owner | `apps/example-vue` | `bun run build:vue` |
| Generator CLI 基线 | schema -> 文件产物、preview/report、冲突策略已具备 | `packages/generator` | `bun run e2e:generator:cli` |
| Generator 安全 staging apply | apply 前漂移检测、manifest、apply evidence 已具备 | `packages/generator` + `apps/server` | `bun run e2e:generator:safe-apply` |
| CI 与报告门禁 | smoke、tenant、generator、P5A 多组报告与 gate 已接入 | `.github` + `scripts` | GitHub Actions / `*:gate` |
| 文档治理 | quickstart/reference/ai-playbooks/plans/ADR 结构已形成 | `docs` | 人工审阅 |

判断：这些能力可以进入对内使用说明和参考发行版描述，但仍应避免夸大成完整平台能力。

### B. 可用但需收口能力

这些能力已经能用，但用户体验、边界表达或长期维护成本仍需继续打磨。

| 能力 | 当前状态 | 主要风险 | 下一步 |
| --- | --- | --- | --- |
| Generator 真实 workspace | 已支持 `start -> preview -> review -> confirm -> apply` | schema 草稿、review、confirm、apply 对非熟练用户仍偏专业 | 继续降低输入门槛和失败恢复成本 |
| SQL proposal | 已有 review-only SQL draft 与 handoff snapshot | 用户可能误解为正式 migration 已落地 | 继续强化 review-only 与人工接入边界 |
| 标准 CRUD 前端 surface | 已由 generator 产物真实消费 | 页面体验仍更偏验证型后台 | 优先打磨高频模块日常路径 |
| 多租户治理 | tenant init、RLS、tenant E2E 与稳定性观察已具备 | 生产发布平台和数据库快照编排未固化 | 保持 rehearsal 定位，后续补生产级 runbook/gate |
| Workflow 简化运行态 | 线性审批、条件分支、claim、审计已具备 | 容易被误宣传成通用 BPM | 明确不含 transfer/delegate 等复杂语义 |
| 文件模块 | 本地磁盘存储和元数据 CRUD 已具备 | 对象存储、多副本、生命周期未进入 | 保持本地适配器定位 |
| 通知模块 | 站内通知、已读未读、查询导出已具备 | 邮件、短信、WebSocket、消息队列未进入 | 不混淆站内通知与外部投递 owner |
| Go-live gate | report/handoff/gate/finalize 已具备 | 生产环境输入和平台化发布仍依赖人工 | 继续作为 go-live 准备机制，不宣传为发布平台 |

判断：这些能力是下一轮优化重点。优先做体验与边界收口，不急着扩新平台能力。

### C. 验证中能力

这些能力已有储备或局部验证，但不应作为当前成熟能力宣传。

| 能力 | 当前状态 | 不确定点 |
| --- | --- | --- |
| uniapp H5 骨架 | 可启动/构建骨架，作为 C 端设计储备 | 未进入首发主线，不反向驱动核心契约 |
| React 前端适配层 | 仓库保留 `packages/frontend-react` | 当前不是 C 端主线，成熟度低于 Vue |
| AI -> Schema | P5A 已归档，输入模板、语料、handoff/replay/gate 已具备 | 适合受控 schema handoff，不适合自由改核心代码 |
| Browser-level generator smoke | 已新增真实路由浏览器 smoke | 作为 Phase G 信心层，不扩成通用浏览器 E2E 平台 |
| 生产平台基线 | 单 Linux 主机 + Docker Engine 基线已固定 | 镜像仓库、自动回滚、监控告警平台仍 TBD |

判断：这些能力可以写进技术路线或储备说明，但宣传时必须带阶段限定。

### D. 规划或不应宣传能力

这些能力当前不能按已实现事实描述。

| 能力 | 当前结论 |
| --- | --- |
| 完整低代码平台 | 当前只有 schema 驱动生成和受控 preview/apply，不是完整在线设计器 |
| 生产发布平台 | 当前有 go-live gate 和 rehearsal，不是自动化生产发布平台 |
| 通用 BPM | workflow 是简化运行态，不含复杂任务语义 |
| 通用导入平台 | 导入链路只做边界判断，不进入 Phase G 完成定义 |
| 自动正式 migration | SQL proposal 是 review-only，正式 migration 仍需人工接入 |
| 对象存储平台 | 当前文件模块只验证本地磁盘适配器 |
| 多通道消息平台 | 当前通知模块只验证站内通知 |
| 自由 AI 改基础设施 | 明确禁止绕过 schema/generator 直接改平台核心基础设施 |

## 维度评分

| 能力域 | 评分 | 判断 |
| --- | --- | --- |
| 工程边界与 owner | `4.2` | owner 划分清楚，guardrails 与开发原则成熟 |
| 后端企业基础模块 | `4.0` | 标准模块覆盖较完整，后端闭环扎实 |
| Generator 生成链路 | `3.7` | 证据链完整度较好，输入与恢复体验仍需打磨 |
| 数据与多租户 | `3.8` | RLS、tenant E2E、稳定性观察较强，生产发布链路仍需固化 |
| 前端参考发行版 | `3.5` | Vue starter 可用，但日常体验仍需产品化打磨 |
| AI -> Schema | `3.6` | 适合受控 handoff，不适合自由生成 |
| CI / 验证 / 报告 | `4.3` | 当前最强能力之一，报告、gate、artifact 链路完整 |
| 生产准备 | `3.2` | 有单机 Docker 与 go-live 骨架，但自动回滚、监控告警等仍未定 |
| 多前端能力 | `2.8` | Vue 主线成熟，uniapp/React 暂属储备或并行轨道 |
| 用户快速上手体验 | `3.3` | starter 可跑、generator 可用，但非熟练用户第一步仍不够轻 |

## 用户视角评估

### 平台管理员

当前可完成：

- 登录、恢复会话
- 用户、角色、菜单、部门、岗位、租户等系统管理
- 操作日志、文件、通知等后台基础管理

主要不足：

- 部分模块仍偏“验证型后台”，需要继续降低查找、编辑、导出、批量动作的理解成本。
- 权限失败、业务失败、空状态需要继续保持业务化表达。

### 开发者 / 生成器使用者

当前可完成：

- 从 schema 或简化 schema 发起生成
- 预览文件计划、diff、SQL proposal
- review、confirm 后 apply 到 staging
- 回看 apply evidence、drift/recovery 状态

主要不足：

- 首次理解成本仍偏高。
- 字段草稿、校验建议、历史结果边界还可以更“顺手”。
- 正式 migration 和正式模块接线仍需要清楚的人工接入说明。

### Reviewer

当前可完成：

- 通过 preview report、SQL proposal、confirmation evidence 判断生成风险
- 通过 gate/report 看 CI 与 E2E 结果

主要不足：

- 仍需把 reviewer 决策面压缩成更短的“是否可 apply / 为什么不能 / 谁接手”的视图。

### 发布负责人

当前可完成：

- 使用 go-live report/handoff/gate 做发布前准备判断
- 借助 tenant release rehearsal 做发布演练

主要不足：

- 目标环境输入、备份恢复、反向代理、TLS、监控告警、值守仍不是完整自动化平台能力。

## 宣传口径

推荐口径：

```text
Elysian 是一个面向中小项目的可发布参考 starter，提供企业后台基础模块、schema 驱动代码生成、可审查 preview/apply 链路，以及较完整的 CI/E2E 质量门禁。
```

谨慎口径：

```text
支持 AI 辅助开发，但当前 AI 只进入受控 schema handoff 和生成器链路，不允许绕过契约直接修改核心基础设施。
```

禁止口径：

```text
完整低代码平台。
完整生产发布平台。
完整多端平台。
通用工作流/BPM。
自动完成正式数据库迁移。
AI 自动改全栈代码并上线。
```

## 下一步优先级

### P0

- 继续收口 Generator 真链路，固定 happy path、blocked apply、drift、recovery 和 evidence 回看。
- 保持 SQL proposal review-only，不把 confirm/apply 扩成正式 migration。
- 把用户可行动的失败恢复文案作为 Generator 下一轮核心优化点。

### P1

- 补齐系统能力矩阵在 README / reference 之间的链接，减少外部理解偏差。
- 继续打磨 `users / roles / tenants / notifications / files / operation-logs` 的日常后台路径。
- 用功能评审机制复核每个 Generator 入口，删除或降级不服务当前任务的展示。

### P2

- 在 Generator 真链路稳定后，再进入生产运维平台化补强。
- 评估对象存储、通知多通道、导入链路是否进入下一阶段。
- 保持 uniapp/React 为储备轨道，不抢当前 Vue reference starter 主线。

## 复评触发条件

出现以下变化时，应更新本文件：

- Generator 真链路完成新的阶段收口。
- `apps/example-vue` 的参考发行版能力发生明显变化。
- 生产平台基线从单机 Docker 扩展到镜像仓库、自动回滚或监控告警平台。
- uniapp 或 React 从储备轨道进入主线。
- workflow、导入、对象存储、通知投递等能力进入新的实现阶段。
- 对外宣传口径发生变化。

