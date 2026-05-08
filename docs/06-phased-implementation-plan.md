# 整体实施规划

更新时间：`2026-05-08`

本文档定义 Elysian 的整体阶段划分、依赖关系和阶段出口。完整阶段体系只在本文件维护，[roadmap.md](./roadmap.md) 仅记录当前活跃轨道。

---

## 文档职责

| 文档 | 职责 |
|---|---|
| 本文档 | 唯一主计划源：Phase / Subphase 定义、阶段出口、依赖关系 |
| [roadmap.md](./roadmap.md) | 当前 1–3 个活跃工作轨道，最近进展与下一步 |
| `docs/plans/*.md` | 最近一轮可执行实施计划，粒度到具体交付包 |
| `docs/decisions/ADR-*.md` | 已定型的关键技术决策 |

---

## 执行粒度

| 层级 | 用途 | 建议周期 | 典型出口 |
|---|---|---|---|
| `Phase` | 平台里程碑 | 1–2 个月 | 进入下一阶段的系统能力门槛 |
| `Subphase` | 可收尾的能力闭环 | 1–2 周 | 接口/页面/生成链路可稳定运行 |
| `Work Package` | 具体开发任务 | 1–3 天 | 模块、ADR、脚手架或测试完成 |

---

## 阶段概览

```text
Phase 1          Phase 2          Phase 3          Phase 4
垂直切片闭环 ──→ 认证与权限底座 ──→ 标准企业模块 ──→ 代码生成成熟化
   ✅                ✅                ✅                ✅

Phase 5          Phase 6          Phase 7
AI 辅助开发  ──→ 生产强化     ──→ 企业业务平台
  ✅ P5A            ✅                ✅ P7A

Phase 8          Phase 9
AI 智能化    ──→ 平台扩展与生态
  📋                📋
```

---

## Phase 1：垂直切片闭环 ✅

> 完成：2026-04-21

**目标**：打通 `Schema → Server → Persistence → Generator → Frontend` 的第一个完整业务闭环。

**交付物**：
- Server 底座（配置、日志、错误映射、模块注册）
- Persistence 层（PostgreSQL + Drizzle ORM + migration）
- Customer Schema 与完整 CRUD
- Generator CLI（模板渲染、冲突策略、manifest）
- Vue 前端骨架（Vite + Vue 3 + Tailwind）与 Customer CRUD 页面
- Docker PostgreSQL + 浏览器 smoke 端到端验证

**完成标准**：
- [x] 浏览器中对 customer 执行增删改查，数据持久化到 PostgreSQL
- [x] Generator 从 schema 输出前后端代码框架
- [x] 新人按 README 在 30 分钟内跑通完整流程

---

## Phase 2：认证与权限底座 ✅

> 完成：2026-04-22

**目标**：建立统一认证鉴权体系，后续所有模块运行在权限框架之上。

**交付物**：
- JWT + Refresh Session 认证策略（ADR-0007）
- User / Role / Permission / Menu 数据模型与 CRUD
- 登录/登出/刷新接口 + Bearer token 校验
- Vue 登录页面、路由守卫、动态菜单渲染、权限指令
- Auth 审计基线

**完成标准**：
- [x] 用户名密码登录获取 JWT，未认证返回 401，无权限返回 403
- [x] 不同角色看到不同菜单和页面
- [x] 关键操作写入审计日志
- [x] Vue 前端根据后端菜单配置动态生成路由

**暂不纳入**：SSO、LDAP、OAuth、复杂组织级数据权限、审批流权限

---

## Phase 3：标准企业模块 ✅

> 完成：2026-04-22

**目标**：实现企业后台标准通用模块，使平台具备承接真实业务的基础设施。

**交付物**：
- **P3A**：用户、角色、菜单、部门四个核心权限管理模块
- **P3B**：字典类型/字典项、系统配置、操作日志
- **P3C**：文件上传下载、站内通知
- **Vue 企业预设首版**：ElyShell 布局、ElyCrudWorkspace 通用组件、TDesign Vue Next 底座

**完成标准**：
- [x] 所有模块 CRUD 接口可用且有权限控制
- [x] Vue 管理后台展示标准布局和动态菜单
- [x] 字典、配置可在其他模块中引用
- [x] 文件上传下载流程跑通

---

## Phase 4：代码生成成熟化 ✅

> 完成：2026-04-24

**目标**：让新增标准业务模块的工作量下降 50%+，生成代码可直接进入生产迭代。

**交付物**：
- **P4A**：Entity / Module / Permission Schema 正式化与校验
- **P4B**：Server 端代码生成（Repository / Service / Routes / Types / OpenAPI）
- **P4C**：Frontend 代码生成（列表页、表单页、详情页、API Client）
- **P4D**：Apply / Merge 安全写入（冲突预检 + 原子写入 + 区域保护）
- **P4E**：多 Schema / 多策略回归验证矩阵

**完成标准**：
- [x] Schema 驱动生成链路稳定，支持多 schema / 多目标 / 多策略
- [x] 二次生成安全写入边界固定（`overwrite-generated-only` + 冲突预检）
- [x] 生成结果纳入 `bun run check`、E2E 回归与 CI 门禁

**暂不纳入**：可视化拖拽式低代码编排器、跨前端框架运行时无损切换

---

## Phase 5：AI 辅助开发 ✅ P5A 已完成

> P5A 完成：2026-04-24 | P5B / P5C 未开始

**目标**：让 AI 参与规格生成和实现补全，而非直接生成最终代码。

**P5A 已交付**：
- AI → Schema 转换：自然语言稳定转换为可校验的 `ModuleSchema`
- 结构化校验网关：`validateModuleSchema` + enum 硬约束
- Handoff / Replay / Corpus / Acceptance 工具链
- 6 条验收 case 全绿，CI 自动化验证

**P5B / P5C（未开始）**：AI 建议器、交互式工作流、审计追踪

**完成标准**：
- [x] 自然语言到可运行模块的链路可跑通（6 case 全绿）
- [x] AI 输出通过结构化校验
- [x] AI 失败时人工可直接编辑 schema 继续推进
- [x] 每次交互有审计记录可回放

---

## Phase 6：生产强化 ✅

> 完成：2026-04-25

**目标**：让平台具备真正的生产部署和运营能力。

**交付物**：
- **P6A**：Docker 部署方案、健康检查、Prometheus 指标、CORS / Rate Limit 安全基线、E2E 测试
- **P6B1**：多租户模型（共享数据库 + `tenant_id` + PostgreSQL RLS），现有模块零改动
- **P6B2**：数据权限框架（RuoYi 5 档 data_scope + 部门树过滤）
- **P6B3**：租户管理 CRUD、一键初始化 CLI、租户配置覆盖、ADR-0009

**关键设计决策**：

| 决策 | 选择 | 理由 |
|---|---|---|
| 租户隔离 | 共享数据库 + `tenant_id` | 与 Drizzle ORM 兼容，保留升级路径 |
| 租户过滤 | PostgreSQL RLS | 数据库层强制隔离，现有 helper 零改动 |
| 数据权限 | RuoYi `data_scope` 5 档 | 企业后台最成熟的模式 |
| 多角色冲突 | 取最宽松（OR 组合） | 与 RuoYi 一致 |

**完成标准**：
- [x] 平台可通过 Docker 部署到生产环境
- [x] 关键接口有 Rate Limit 和认证保护
- [x] 健康检查和指标可被监控系统采集
- [x] 数据权限按组织/角色粒度控制
- [x] 核心用户流程有 E2E 测试覆盖

**暂不纳入**：定时任务、Redis 缓存、灰度发布、完整数据导入导出

---

## Phase 7：企业业务平台 ✅ P7A 已完成

> P7A 完成：2026-04-26 | P7B / P7C 未开始

**目标**：从"开发平台"升级为可承载复杂业务的企业平台。

**P7A 已交付**：
- 简化工作流引擎：定义、发起、任务、取消、线性审批
- 最小条件分支（白名单表达式）
- 任务认领（claim）语义与认领历史保留
- 独立权限点（`workflow:definition/instance/task` 三组）
- 审计日志覆盖关键动作

**P7B / P7C（未开始）**：安全合规加固、统一消息中心

**当前边界**：不扩展为通用 BPM，不进入 transfer / delegate

---

## Phase 8：AI 智能化与蓝图体系 📋

> 状态：未开始（PRD 已定稿）

**目标**：AI 从"辅助生成"升级为"智能编排"，建立蓝图复用体系。

| Subphase | 目标 | 说明 |
|---|---|---|
| P8A | 蓝图 + Studio | 可复用项目模板 + Web UI 平台管理控制台 |
| P8B | 多 Agent 编排 | LangGraph 式 DAG：代码生成 + Lint + 测试全自动流水线 |
| P8C | AI 审计工具 | 版本对比、5 维质量评分、依赖分析、人工审查 |

**前置条件**：Phase 7 完成、Phase 5B/C 完成

---

## Phase 9：平台扩展与生态 📋

> 状态：未开始（PRD 已定稿）

**目标**：扩展技术覆盖面，建立开发者生态。

| Subphase | 目标 | 说明 |
|---|---|---|
| P9A | 多框架适配 | React 正式化 + Angular 预设，同一 schema 生成三套代码 |
| P9B | 国际化与主题 | i18n + 设计令牌 + 暗色模式 |
| P9C | 社区生态 | 插件机制、模板市场、贡献者路线图 |

**前置条件**：Phase 8 完成

---

## 依赖关系

```text
Phase 1 (垂直切片)
  │
  ├──→ Phase 2 (认证权限)
  │      │
  │      ├──→ Phase 3 (标准模块) ──→ Phase 6 (生产强化) ──→ Phase 7 (企业平台)
  │      │                                                     │
  │      └──→ Phase 4 (生成成熟化) ──→ Phase 5 (AI 辅助) ──→ Phase 8 (智能化)
  │                                                            │
  │                                                            └──→ Phase 9 (生态)
```

关键路径：`Phase 1 → 2 → 3 → 6 → 7`
可并行路径：`Phase 4` 在 `Phase 2` 后可与 `Phase 3` 并行；`Phase 5B/C` 可与 `Phase 7` 并行

---

## 当前优先级

1. **生成器自举闭环**（主线）：Schema → Preview/Report → Apply/Merge → Frontend Artifact → 正式模块落地
2. **企业后台基础功能对齐**（验证对象）：系统工作区日常可用性打磨，而非继续拔高平台能力天花板
3. **Phase 7–9**：保留为中长期方向，不等于当前第一优先级

功能矩阵与执行计划：[ruoyi-basic-feature-alignment-matrix.md](./plans/2026-04-28-ruoyi-basic-feature-alignment-matrix.md)

---

## 风险与关注

| 风险 | 缓解措施 |
|---|---|
| Schema 体系过早固定 | P4A 前用 2–3 个实体验证 |
| 前端适配层耦合 | 严格通过 schema 解耦，适配层不共享框架语义 |
| Generator 合并策略不足 | P4D 完善 apply/merge 与区域保护 |
| AI 输出不可控 | Schema 校验网关 + 人工确认环节 |
| 工作流边界膨胀 | 固定"agent 自编排辅助工具"定位，只保留最小流程语义 |
| Phase 7–9 周期过长 | 按 Exit Gate 控制，每个子阶段独立可用 |
