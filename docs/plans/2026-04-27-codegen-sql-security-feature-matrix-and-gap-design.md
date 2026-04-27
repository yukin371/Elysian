# 2026-04-27 代码生成 / SQL 生成 / 安全能力功能矩阵与缺口设计

## 目标

- 用一份统一文档说明当前仓库在 `代码生成`、`SQL 生成`、`安全能力` 三个维度的真实完成度。
- 明确哪些能力已经可用，哪些只是部分完成，哪些尚未进入实现。
- 为下一轮实施提供稳定边界，避免把“参考竞品能力”误写成“仓库已实现事实”。

## 适用边界

本文件只覆盖以下范围：

- `packages/generator` 的代码生成与预览能力
- `packages/persistence` 作为正式 migration / SQL canonical owner 的边界
- `apps/server` 的 auth / RBAC / refresh session / guard 安全能力
- `apps/example-vue` 的 Studio / 示例装配层

本文件不覆盖：

- 通用 BPM / 低代码设计器
- 完整平台级云部署与运维中心
- OAuth2 / OIDC / SSO 等扩展安全体系

## 对标口径

### 1. 管理平台 / 代码生成

对标口径以“若依 / Jeecg 类企业后台常用能力”作为功能参考，而不是要求技术栈一致。

重点看：

- 模块生成是否可落地
- 生成前预览是否可审查
- 生成后是否可回放 / 可覆盖 / 可审计
- Studio 是否能承接生成流程，而不是只剩 CLI

### 2. SQL 生成

对标口径不是“任意 SQL 在线执行平台”，而是：

- 能否把 schema 变化稳定转成可审查的数据库变更草案
- 能否与正式 migration owner 保持边界一致

### 3. 安全能力

这里对标的是“Spring Security 常见企业后台能力形态”，不是要求引入 Spring 或复刻其框架结构。

重点看：

- 登录态与 token / session 管理
- RBAC 与权限校验
- 菜单、审计、租户与安全边界联动
- 是否具备继续扩展为企业级安全基线的稳定入口

## 功能矩阵

状态说明：

- `✅ 已完成`：已有实现，且已有代码或验证证据
- `🟡 部分完成`：已有最小实现，但未形成完整闭环
- `⚪ 未开始`：尚未进入实现
- `⛔ 当前不做`：当前阶段明确不进入

### A. 代码生成能力矩阵

| 能力项 | 当前状态 | 真实情况 | 证据 owner | 主要缺口 |
|---|---|---|---|---|
| 基于注册 schema 生成模块文件 | ✅ 已完成 | 可从已注册 `ModuleSchema` 生成 `schema/repository/service/routes/page` | `packages/generator` | 模板覆盖仍以标准 CRUD 为主 |
| 基于外部 schema 文件生成 | ✅ 已完成 | CLI 已支持 `--schema-file`，并在外部来源时内联 `.schema.ts` | `packages/generator` | 还缺 Studio 内的外部 schema 上传/导入链路 |
| 冲突策略与安全写入 | ✅ 已完成 | 已支持 `skip / overwrite / overwrite-generated-only / fail`，并有原子写入 | `packages/generator` | Studio 侧还没有可视化 apply 交互 |
| 生成预览（文件级） | ✅ 已完成 | CLI `--preview` 可输出文件动作预览 | `packages/generator` | 仍以 CLI 为主 |
| 结构化预览报告 | ✅ 已完成 | 可输出 JSON report，用于回归与审查 | `packages/generator` | 尚无报告中心 UI |
| 浏览器本地预览入口 | ✅ 已完成 | 已有 `@elysian/generator/browser`，示例页可消费 | `packages/generator` + `apps/example-vue` | 仅限本地纯渲染，不做真实 apply |
| Studio 生成预览工作区 | ✅ 已完成 | `example-vue` 已能选 schema / target，查看文件与源码 | `apps/example-vue` | 仍是示例装配，不是正式平台应用 |
| React / Vue 双前端目标 | ✅ 已完成 | 模板层已支持 `vue/react` 页面输出 | `packages/generator` | 两端都还只是最小页面模板 |
| 模块级生成历史 / 任务记录 | ⚪ 未开始 | 当前没有“本次生成任务”的持久化记录中心 | 无 | 无任务审计、无回放列表 |
| Studio 内触发真实生成 apply | ⚪ 未开始 | 当前 Studio 只预览，不写入目录 | 无 | 缺服务端任务入口、授权、审计与 staging/apply 语义 |
| Studio 内 diff / 冲突审查 | ⚪ 未开始 | 当前只看生成结果，不看目标目录 diff | 无 | 缺现有文件比对、冲突解释与人工确认 |
| 模板配置中心 / 生成参数模板 | ⚪ 未开始 | 没有平台内的 generator profile / preset 管理 | 无 | 仍以 CLI 参数为主 |
| 数据表导入后反推模块 schema | ⚪ 未开始 | 没有“库表 -> ModuleSchema” 导入链 | 无 | 对齐后台平台常见 codegen 能力仍缺关键入口 |
| 代码生成结果注册回平台导航 | 🟡 部分完成 | 生成物可落盘，但不会自动进入平台模块注册中心 | `packages/generator` / `apps/example-vue` | 缺页面注册 / 路由注册 owner |

### B. SQL 生成能力矩阵

| 能力项 | 当前状态 | 真实情况 | 证据 owner | 主要缺口 |
|---|---|---|---|---|
| 基于 schema 生成 SQL 预览 | ✅ 已完成 | 已有 `renderModuleSqlPreview` | `packages/generator` | 仅供 review，不是正式 migration |
| CLI 输出 SQL preview | ✅ 已完成 | `generate --preview` 会输出 SQL preview | `packages/generator` | 无独立 SQL 工作流 |
| Studio 中查看 SQL preview | ✅ 已完成 | 生成预览工作区右侧已展示 SQL preview | `apps/example-vue` | 仍依附于 generator preview |
| SQL owner 与 migration owner 分离 | ✅ 已完成 | 文档与实现都保持“preview 在 generator，正式 migration 在 persistence” | `packages/generator` / `packages/persistence` | 还缺中间过渡产物 |
| 正式 migration 文件生成 | ⚪ 未开始 | 还没有从 `ModuleSchema` 直接生成正式 migration 文件 | 无 | 核心缺口 |
| Drizzle schema artifact 生成 | ⚪ 未开始 | 没有正式 `packages/persistence` 侧 schema artifact 输出链 | 无 | 无法进入 `db:generate / db:migrate` 闭环 |
| SQL 变更 diff / 兼容性分析 | ⚪ 未开始 | 当前只输出建表草案，不分析 alter / rename / drop 风险 | 无 | 高风险变更无法审查 |
| 数据源 / 表结构导入 | ⚪ 未开始 | 没有数据源管理或元数据导入能力 | 无 | 无法对齐常见后台 codegen 入口 |
| SQL 生成历史 / 审批 / 回滚建议 | ⚪ 未开始 | 没有平台级记录 | 无 | 缺治理证据 |

### C. 安全能力矩阵

| 能力项 | 当前状态 | 真实情况 | 证据 owner | 主要缺口 |
|---|---|---|---|---|
| 登录 / 退出 / 获取当前身份 | ✅ 已完成 | 已有 `/auth/login` `/auth/logout` `/auth/me` | `apps/server` | 无 |
| access token + refresh session | ✅ 已完成 | 已采用短时 access token + 持久 refresh session | `apps/server` + `packages/persistence` | 多设备/会话治理尚弱 |
| refresh 轮换 | ✅ 已完成 | `/auth/refresh` 已轮换 refresh session | `apps/server` | 无 |
| Bearer token route guard | ✅ 已完成 | 已有 auth guard，401/403 语义已有验证 | `apps/server` | 主要停留在 route / module 边界 |
| RBAC 权限码校验 | ✅ 已完成 | `permissionCodes` 已用于后端校验与前端 gate | `apps/server` + `apps/example-vue` | 权限表达式仍较简单 |
| 动态菜单按权限收敛 | ✅ 已完成 | 登录后菜单树按 RBAC 收敛 | `apps/server` + `apps/example-vue` | 缺更细粒度页面动作注册中心 |
| auth 审计日志 | ✅ 已完成 | login / refresh / logout / denied 已写审计 | `apps/server` | 还不是完整安全事件中心 |
| 租户感知登录与 refresh | ✅ 已完成 | 已支持 tenant-aware 登录与 token 语义 | `apps/server` + `packages/persistence` | 无独立租户会话治理页 |
| 数据权限基线 | ✅ 已完成 | `Phase 6B` 已落地最小数据权限框架 | `apps/server` + `packages/persistence` | 仍需更多真实业务压测 |
| 密码重置等基础账号运维 | ✅ 已完成 | 系统用户模块已有 reset-password 能力 | `apps/server` | 缺更完整账号安全策略 |
| 登录失败策略 / 锁定 / 设备管理 | ⚪ 未开始 | 没有账户锁定、设备列表、强制下线等能力 | 无 | 与企业安全平台常见能力仍有差距 |
| OAuth2 / OIDC / SSO | ⛔ 当前不做 | 当前阶段未进入 | 无 | 非当前主线 |
| 注解式 / 表达式级方法安全 | ⛔ 当前不做 | 当前是 Elysia + 模块 guard，不走 Spring 注解模型 | 无 | 不追求框架形态等价 |
| CSRF 体系 | ⛔ 当前不做 | 当前以 Bearer access token + SameSite refresh cookie 为主 | `apps/server` | 如未来进入浏览器表单态再评估 |

## 结论

### 1. 代码生成

当前结论不是“未完成”，而是：

- `Generator CLI + preview/report + browser-safe preview` 已形成最小可用闭环。
- 还没有进入“后台产品级代码生成中心”阶段。

换句话说：

- `生成内核` 已有
- `Studio 化产品闭环` 未完成

### 2. SQL 生成

当前不能说“SQL 生成功能已完成”。

更准确的说法是：

- `SQL preview` 已完成
- `正式 migration proposal / artifact / import 闭环` 未完成

### 3. 安全能力

当前不能说“没有 Spring Security 对应能力”。

更准确的说法是：

- `JWT + refresh session + RBAC + route guard + 审计 + tenant-aware auth` 这一层已经具备常见企业后台的基础等价能力
- 但还没有进入“完整企业安全平台”或“Spring Security 全家桶级扩展能力”

## 未完成部分设计

以下设计只给出下一轮应实现的能力边界与顺序，不把规划态内容写成已实现事实。

### Track 1. Studio 代码生成产品化

#### 目标

把当前“CLI 为主、示例页预览为辅”的状态，推进到“可在平台内发起、审查、落盘”的最小 Studio 生成闭环。

#### 分阶段设计

##### T1-1 预览工作区收口

状态：`已基本完成`

保留边界：

- 继续由 `packages/generator/browser` 提供纯渲染能力
- `apps/example-vue` 只做示例装配，不写真实目标目录

##### T1-2 生成会话与报告中心

目标：

- 为每次生成建立结构化 `generation session`
- 至少记录：
  - 输入来源（registered schema / external schema）
  - frontend target
  - conflict strategy
  - preview report path
  - 生成时间
  - 发起人

建议 owner：

- `apps/server`
- 不放进 `packages/generator`

原因：

- 这是平台运行态任务与审计能力，不是纯生成内核

##### T1-3 staging apply

目标：

- 允许平台内把生成结果先落到官方 staging 目录
- 不直接写入正式业务模块目录

建议边界：

- `packages/generator` 继续负责“生成 + 冲突策略 + manifest”
- `apps/server` 负责“谁可以发起、写到哪里、如何审计”

##### T1-4 diff / confirm / apply evidence

目标：

- 展示生成结果与目标目录差异
- apply 后保留证据

最小证据建议：

- generation session id
- preview report
- apply manifest
- actor / request id / timestamp

#### 暂不做

- 浏览器直接写业务目录
- Studio 直接绕过 CLI / server 权限边界
- 复杂模板市场

### Track 2. SQL 生成功能补齐

#### 目标

把当前 `review-only SQL preview` 推进到“可进入正式 migration owner”的最小闭环。

#### 关键边界

- `packages/generator` 继续只负责：
  - schema 到 preview
  - schema 到中性数据库变更草案
- `packages/persistence` 负责：
  - Drizzle schema artifact
  - migration proposal
  - 与 `db:generate / db:migrate` 的正式衔接

#### 分阶段设计

##### T2-1 中性数据库变更描述

目标：

- 在 `generator` 与 `persistence` 之间引入可审查的中间产物

建议产物：

- `DatabaseChangePlan`
  - table name
  - columns
  - constraints
  - enum / dictionary hint
  - operation type（create / alter）

价值：

- 避免让 `packages/generator` 直接生成带运行时语义的 migration 文件

##### T2-2 persistence 侧 migration proposal

目标：

- `packages/persistence` 基于 `DatabaseChangePlan` 产出：
  - migration draft
  - Drizzle schema snippet
  - 风险说明

最小范围建议：

- 第一轮只支持 `create table`
- 不提前进入高风险 `rename / drop / destructive alter`

##### T2-3 Studio SQL 工作区

目标：

- 从“依附在 generator preview 的 SQL 区块”升级为独立 SQL 工作区

建议能力：

- schema 选择
- 变更计划查看
- SQL preview
- 风险标签
- 导出 proposal

##### T2-4 表结构导入

目标：

- 对齐常见后台 codegen 入口：从现有表导入再生成模块

前提：

- 数据源 owner、元数据读取边界、连接安全策略先明确

当前不应提前实现：

- 线上数据库任意连接与在线执行

### Track 3. 安全能力下一轮补齐

#### 目标

在不引入第二套安全框架的前提下，把当前安全基线补到“更接近企业后台日常可用”。

#### 分阶段设计

##### T3-1 会话治理

目标：

- 增加“当前用户的 refresh session 列表 / 强制下线 / 设备标识”

建议 owner：

- `packages/persistence`：session 查询与更新
- `apps/server`：session 管理接口
- `apps/example-vue`：会话管理页

##### T3-2 登录安全策略

目标：

- 最小登录失败计数
- 锁定窗口
- 解锁策略

当前阶段不要求：

- 风控引擎
- MFA

##### T3-3 权限边界显式化

目标：

- 继续把模块级权限点、动作级权限点、菜单可见性规则显式化

不是要做：

- Spring 式注解系统复刻

##### T3-4 安全事件视图

目标：

- 在操作日志或独立安全事件视图中聚合：
  - login success / failed
  - refresh
  - logout
  - permission denied
  - forced logout

#### 当前明确不做

- 完整 OAuth2 授权服务器
- SSO / OIDC 平台
- 注解 AOP 风格方法安全框架

## 推荐实施顺序

### 第一优先级

1. `Track 1 / T1-2` 生成会话与报告中心
2. `Track 2 / T2-1` 中性数据库变更描述
3. `Track 3 / T3-1` 会话治理

理由：

- 这三项能直接提高“平台可用度”，且不会破坏当前 owner

### 第二优先级

1. `Track 1 / T1-3` staging apply
2. `Track 2 / T2-2` migration proposal
3. `Track 3 / T3-2` 登录安全策略

### 第三优先级

1. `Track 1 / T1-4` diff / evidence
2. `Track 2 / T2-3` 独立 SQL 工作区
3. `Track 3 / T3-4` 安全事件视图

## 验证要求

### 代码生成

- `generator` 单测继续通过
- `build:vue` 能构建 Studio / 示例页
- 新增生成会话后，至少有结构化报告可回放

### SQL 生成

- preview 与 proposal 必须保持 owner 分离
- migration draft 只在 `packages/persistence` owner 内进入正式链路

### 安全能力

- 401 / 403 / refresh rotation / logout revoke 现有回归不得退化
- 新增会话治理能力必须有最小 server 测试

## 一句话结论

当前仓库已经有：

- `可用的代码生成底座`
- `可审查的 SQL 预览`
- `基础等价的企业后台安全能力`

下一轮不应再争论“有没有”，而应明确推进：

- `Studio 化`
- `migration 化`
- `会话治理化`

这三条是当前最合适的未完成部分实施方向。
