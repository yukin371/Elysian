# 2026-05-12 首个参考发行版实施 Spec

## 背景

- 仓库当前已经具备 server、persistence、generator、Vue 企业预设、多租户、数据权限、最小 workflow 与 go-live 基线。
- 当前主要问题不再是“能力有没有”，而是“能不能把这些能力收口成一个可直接交付中小项目的 starter”。
- 当前对外首发形态已固定为 `apps/example-vue` 参考发行版；`apps/example-uniapp`、`packages/frontend-react`、更重的 Studio/AI 能力继续保留为并行研发轨道，但不进入本轮首发阻塞项。

当前已完成任务与证据记录见：

- [2026-05-12-reference-starter-release-progress.md](./2026-05-12-reference-starter-release-progress.md)

## 边界摘要

- 目标模块：
  - `apps/example-vue`
  - `apps/server`
  - `packages/persistence`
  - `packages/schema`
  - `packages/generator`
- 现有 owner：
  - `apps/example-vue`：参考发行版前端、工作区装配、generator preview 消费
  - `apps/server`：HTTP API、auth、模块装配、generator-session 运行态、发布运行时入口
  - `packages/persistence`：关系型 schema、migrate/seed、tenant/init、日志与业务持久化 helper
  - `packages/schema`：`ModuleSchema`、简化 schema、runtime 校验契约
  - `packages/generator`：模板、preview/report/apply、冲突策略、artifact 生成
- 影响面：
  - starter 对外定位
  - 首发可交付路径
  - 工作区验收口径
  - generator 首发 Happy Path
  - go-live / release 文档与门禁口径
- 计划改动：
  - 本文档把首发计划细化为可直接拆任务执行的 spec
  - 不在本轮新增第二套 starter owner
  - 不把 React、uniapp、重 Studio、复杂 BPM 纳入本轮首发
- 验证方式：
  - 文档自洽检查
  - `git diff --check`
  - 实施阶段按本文档验收命令执行
- 需要同步的文档：
  - `docs/roadmap.md`
  - `docs/PROJECT_PROFILE.md`
  - `README.md`
  - 必要时同步 `docs/release-checklist.md`、`docs/reference/05-go-live-runbook.md`

## 目标

把 Elysian 收口成一个“可发布、可复制、可交付”的中小项目 starter。这里的“starter”不是只会跑 demo 的脚手架，而是具备以下能力的参考发行版：

- 新团队可以按 `README` 在新环境完成安装、启动、迁移、seed 和登录
- 默认后台可以承接中小项目常见系统管理需求
- 新增一个标准业务模块时，可以先走 generator 默认路径，再按 checklist 接入主工程
- 进入 `main` 和真实 go-live 时，已有统一的门禁、runbook 和责任边界

## 首发完成定义

以下条件同时满足，才算“首个参考发行版首发完成”：

1. `apps/example-vue` 已经从“验证页”收口为“参考发行版前端 owner”
2. 默认管理员登录后，可完成核心后台日常动作，而不需要读源码猜测使用方式
3. 至少一条标准模块 generator 流程可从 schema 走到接线清单
4. `dev -> main` 与真实环境 go-live 的文档、门禁与输入模板可以直接执行
5. 首发 spec 中声明的非目标仍保持非目标，没有被顺手扩大

## 首发范围

本轮纳入：

- 参考发行版定义与对外文档口径冻结
- `apps/example-vue` 的启动、登录、导航、核心工作区体验收口
- generator 首发 Happy Path 与人工接线边界收口
- Docker / server image / go-live / tenant rehearsal 口径整理到可执行状态
- 首发验收命令、演练步骤、阻塞项判定标准固定

本轮不纳入：

- React 正式首发
- uniapp 正式首发
- workflow `transfer / delegate`
- 可视化低代码平台
- 自动化发布平台、灰度、Kubernetes、多机 HA
- 邮件/短信/消息队列通知中心
- generator 自由业务逻辑生成

## 固定决策

### 1. 发行版形态

- 首发参考前端固定为 `apps/example-vue`
- 首发后端固定为 `apps/server`
- 首发数据库固定为 PostgreSQL
- 首发发布平台固定为“单 Linux 主机 + Docker Engine”
- 首发 generator 使用方式固定为 CLI + server preview/apply 能力，不引入第二套 UI-first 真相

### 2. 首发用户路径

首发默认主路径固定为：

1. `bun install`
2. 配置 `.env`
3. `bun run db:migrate`
4. `bun run db:seed`
5. `bun run dev:server`
6. `bun run dev:vue`
7. 使用默认管理员登录
8. 在参考发行版内完成系统管理动作
9. 通过 generator 生成一个标准模块
10. 参照 release / go-live 文档完成发布准备

除这条路径外，不额外承诺第二套“推荐主路径”。

### 3. generator 首发边界

- generator 首发只承诺标准模块链路
- generator 自动完成：
  - schema 输入解析
  - validate
  - preview/report
  - review-only SQL preview
  - staging apply
  - integration checklist 输出
- generator 不自动完成：
  - 正式 migration 合并
  - 复杂业务逻辑编写
  - 跨模块领域规则编排
  - 发布到生产环境

### 4. 运维边界

仓库 owner 负责：

- 应用镜像构建
- 前端产物构建
- migration 命令
- go-live / rehearsal 文档与脚本
- 应用级冒烟口径

环境 owner / DBA 负责：

- 备份与恢复
- 代理、TLS、域名
- 目标环境 secrets
- 生产告警平台
- 实际发布执行与值守

首发文档必须显式保留这条边界，不能把环境 owner 职责写成仓库已拥有的自动化能力。

## Work Packages

### WP-1 参考发行版定义冻结

目标：

- 把“首发是什么、不是什么、默认怎么用”固定成单一口径。

交付：

- `README` 明确对外定位、技术栈、快速开始、首发边界
- `roadmap` 明确当前主线是参考发行版首发，不再让平台并行轨道抢首发表述
- `PROJECT_PROFILE` 明确 `apps/example-vue` 是参考发行版 owner
- 本 spec 作为当前轮次唯一实施说明书

完成标准：

- 新人阅读上述文档后，不会把仓库误解为“多前端同时首发”或“已经是完整平台产品”

任务拆分：

#### T1-1 文档口径冻结

- 目标：统一 `README`、`roadmap`、`PROJECT_PROFILE`、本 spec 的首发表述
- 交付物：
  - 单一对外定位
  - 单一首发边界
  - 单一并行轨道说明
- 依赖：无
- 验证：
  - 人工对读四份文档
  - `git diff --check`
- 完成标志：
  - 不再同时出现“示例页 / 验证页 / 多前端首发”冲突说法

#### T1-2 首发公开契约冻结

- 目标：固定首发默认命令、默认技术栈、默认发布路径
- 交付物：
  - 官方启动命令
  - 官方 generator 命令
  - 官方验收命令
  - 官方 go-live 命令
- 依赖：`T1-1`
- 验证：
  - `README` 与本 spec 命令一致
- 完成标志：
  - 不再存在两套“推荐启动方式”或两套“推荐生成方式”

#### T1-3 首发完成定义冻结

- 目标：把“什么算首发完成”写成显式门槛
- 交付物：
  - 完成定义
  - 非目标清单
  - 外部前提清单
- 依赖：`T1-1`
- 验证：
  - 本 spec 的完成定义、范围、非目标互相一致
- 完成标志：
  - 实施者可以直接按本文判断“是否达到首发结束条件”

### WP-2 参考发行版前端收口

目标：

- 把 `apps/example-vue` 收口成“日常可用的后台 starter”，而不是“有很多验证页面的示例应用”。

纳入模块：

- `users`
- `roles`
- `menus`
- `departments`
- `posts`
- `dictionaries`
- `settings`
- `operation-logs`
- `notifications`
- `tenants`
- `files`
- `online sessions`

每个工作区的最低验收口径固定为：

- 列表读取可用
- 至少一个详情或只读查看入口可用
- 至少一个创建/编辑动作可用
- 至少一个关键状态动作可用
- 空态、无权限态、失败态有明确反馈

不要求每个工作区在首发时都具备“导入导出 + 批量操作 + 高级筛选”的完整企业成熟度；仅要求已进入主线的高频动作足够稳定。

实现约束：

- 只在 `apps/example-vue` 内收口页面与体验，不新增第二套 shared frontend owner
- `demohub` 继续作为原型试错区，不能直接替代真实工作区
- 若某工作区动作尚无后端契约，必须显式标成当前不可用，而不是用静态按钮伪装

任务拆分：

#### T2-1 Onboarding 路径审计

- 目标：确认“安装 -> 启动 -> 登录 -> 进入后台”链路在参考发行版上无歧义
- 交付物：
  - 首次进入后台的最小路径说明
  - 登录后默认导航落点说明
  - 首屏卡点清单
- 依赖：`T1-2`
- 验证：
  - `README` 路径与参考发行版真实入口一致
- 完成标志：
  - 新用户不需要靠源码猜“先去哪一页”

#### T2-2 Shell / Auth / Navigation 收口

- 目标：把 shell、动态菜单、登录态恢复、权限 gate 收成稳定 starter 入口体验
- 交付物：
  - 登录后的默认工作区
  - 菜单与权限缺失时的统一反馈
  - 刷新/恢复后的最小一致性要求
- 依赖：`T2-1`
- 验证：
  - `bun run build:vue`
  - 登录 / 菜单 / 权限相关现有测试不退化
- 完成标志：
  - shell 入口不再有明显“内部验证页”路径感

#### T2-3 核心模块批次 A 收口

- 目标：优先收口组织与权限相关工作区
- 纳入：
  - `users`
  - `roles`
  - `menus`
  - `departments`
  - `posts`
- 依赖：`T2-2`
- 交付物：
  - 列表/详情/写动作/状态动作最小闭环
  - 空态/失败态/无权限态收口
- 验证：
  - `bun run build:vue`
  - 相关工作区定向测试
- 完成标志：
  - 组织与权限类能力可作为 starter 默认资产演示

#### T2-4 核心模块批次 B 收口

- 目标：收口平台支持类工作区
- 纳入：
  - `dictionaries`
  - `settings`
  - `operation-logs`
  - `notifications`
  - `tenants`
  - `files`
  - `online sessions`
- 依赖：`T2-2`
- 交付物：
  - 高概率日常操作路径
  - 至少一个关键治理动作
- 验证：
  - `bun run build:vue`
  - 相关工作区定向测试
- 完成标志：
  - 支持类工作区不再只是“可看”，而是“可管理”

#### T2-5 状态语义统一收口

- 目标：统一参考发行版中的空态、错误态、加载态、无权限态
- 交付物：
  - 页面状态语义检查清单
  - 不一致项清理记录
- 依赖：`T2-3`、`T2-4`
- 验证：
  - 人工回归核心工作区
- 完成标志：
  - 参考发行版不再出现一页一个反馈风格

### WP-3 generator 首发 Happy Path

目标：

- 新用户能在不读源码的情况下理解如何新增一个标准模块。

固定演示路径：

1. `generate --init <module>`
2. 编辑简化 schema
3. `generate --schema-file ... --target staging --frontend vue --preview`
4. 查看 file plan / conflict strategy / SQL preview
5. `apply` 到 staging
6. 按 checklist 接入正式 owner

交付：

- 首发用法写入 README 或配套 quickstart
- 明确 `SimplifiedModuleSchema` 的首发建议写法
- 明确 `target staging` 是默认安全路径
- 明确 `target module` 只输出集成桩，不承诺一键接线完成
- 明确 persistence migration、菜单/权限/seed 等人工补位点

完成标准：

- 至少一个标准模块样例可完整复现这条路径
- checklist 不再依赖实现者自行推断“下一步应该改哪里”

任务拆分：

#### T3-1 默认 generator 路径冻结

- 目标：固定首发推荐 generator 路径，只保留一条默认安全路径
- 交付物：
  - `--init`
  - `--preview`
  - `--target staging`
  - apply / checklist 的说明
- 依赖：`T1-2`
- 验证：
  - `README` 与本 spec 命令一致
- 完成标志：
  - 不再出现多条未分级的“推荐生成路径”

#### T3-2 最小 schema 样例冻结

- 目标：给首发保留一条可复制的最小 schema 样例
- 交付物：
  - 标准字段样例
  - 推荐字段类型范围
  - 首发不建议演示的复杂能力说明
- 依赖：`T3-1`
- 验证：
  - schema 示例与当前 generator 能力相符
- 完成标志：
  - 新用户可以从样例直接开始，而不是凭空猜 schema 结构

#### T3-3 手工接线边界冻结

- 目标：写清 generator 自动完成到哪里，人工从哪里开始接手
- 交付物：
  - migration 人工确认边界
  - seed / permission / menu / registry 等人工动作清单
  - `target module` 的真实语义说明
- 依赖：`T3-1`
- 验证：
  - checklist 与当前 owner 边界一致
- 完成标志：
  - 不再把 generator 误表述成“一键业务接入完成”

#### T3-4 标准模块首发验收样例

- 目标：至少保留一条对外可复现的标准模块样例链路
- 交付物：
  - 从 schema 到 checklist 的样例路径
  - 验证记录或实施说明
- 依赖：`T3-2`、`T3-3`
- 验证：
  - `bun run e2e:generator:cli`
  - 或等价 generator 定向验证
- 完成标志：
  - Happy Path 不再只存在于抽象文档里

### WP-4 发布与 go-live 收口

目标：

- 把“仓库可发布”和“环境可上线”区分清楚，并形成固定执行顺序。

固定分层：

- `release-checklist`：`dev -> main` 仓库发布
- `go-live runbook`：真实环境上线附加步骤
- `tenant release rehearsal`：tenant 相关演练入口

交付：

- `bun run check`
- `bun run build:vue`
- `bun run server:image:verify`
- `bun run e2e:smoke:full`
- `bun run e2e:tenant:full`
- `bun run go-live:report`
- `bun run go-live:handoff`
- `bun run go-live:gate`
- `bun run go-live:finalize`

首发阶段必须明确的环境前提：

- `.env` 中不允许沿用开发默认 secrets
- migration 作为独立步骤执行
- 目标环境备份与恢复责任已明确
- `/health`、`/metrics`、管理员登录、核心工作区读写构成最小上线冒烟

完成标准：

- 不再把 `tenant:release:*` 误写成正式生产发布命令
- 不再把本地 docker stack 与正式生产发布路径混为一谈

任务拆分：

#### T4-1 release / go-live / rehearsal 分层冻结

- 目标：把仓库发布、真实上线、tenant 演练三层边界写清楚
- 交付物：
  - `release-checklist` 适用范围
  - `go-live` 适用范围
  - `tenant release rehearsal` 适用范围
- 依赖：`T1-2`
- 验证：
  - `docs/07-release-workflow.md`
  - `docs/release-checklist.md`
  - `docs/reference/05-go-live-runbook.md`
- 完成标志：
  - 不再出现“同一命令既像上线又像演练”的歧义

#### T4-2 环境前提与责任模板冻结

- 目标：把目标环境前提列成显式清单，而不是散落在文档描述里
- 交付物：
  - secrets 前提
  - backup / recovery 前提
  - proxy / TLS 前提
  - 值守与责任前提
- 依赖：`T4-1`
- 验证：
  - 与现有 go-live input template 不冲突
- 完成标志：
  - 仓库 owner 与环境 owner 职责边界固定

#### T4-3 首发发布命令链路冻结

- 目标：固定首发需要执行的构建、镜像、smoke、tenant、go-live 命令集合
- 交付物：
  - 官方验收命令列表
  - 官方发布前验证命令列表
- 依赖：`T4-1`
- 验证：
  - 命令存在于 `package.json`
- 完成标志：
  - 首发不再依赖“口头推荐命令”

#### T4-4 阻塞项语义与停止条件冻结

- 目标：把什么情况下必须停止上线写成统一口径
- 交付物：
  - blocker 语义
  - stop conditions
  - rollback 边界
- 依赖：`T4-2`、`T4-3`
- 验证：
  - 与 `go-live runbook` 当前停止条件一致
- 完成标志：
  - 上线演练不再只有命令，没有停止判断

### WP-5 首发验收与发布演练

目标：

- 在正式对外声明“可发布 starter”前，完成一轮统一验收与演练。

验收命令：

- `bun run check`
- `bun run build:vue`
- `bun run server:image:verify`
- `bun run e2e:smoke:full`
- `bun run e2e:tenant:full`

验收场景：

- 新环境安装与启动
- 默认管理员登录
- 核心工作区读写
- generator 新模块 Happy Path
- image 构建与本地 production smoke
- go-live 报告与 blocker 收敛

完成标准：

- 验收通过后，若仍存在未闭合项，只能是环境 owner 侧外部前提，不应再是仓库内应用侧空白

任务拆分：

#### T5-1 首发验收命令基线冻结

- 目标：确定首发通过所依赖的最小命令集合
- 交付物：
  - `check`
  - `build:vue`
  - `server:image:verify`
  - `e2e:smoke:full`
  - `e2e:tenant:full`
- 依赖：`T2-5`、`T3-4`、`T4-3`
- 验证：
  - 命令清单已写入 spec
- 完成标志：
  - 不再为“哪些命令算首发必须跑”争论

#### T5-2 首发场景验收清单

- 目标：把命令之外的人工场景验收固定为可勾选条目
- 交付物：
  - onboarding
  - 登录与导航
  - 核心工作区读写
  - generator Happy Path
  - production smoke
  - go-live blocker 收敛
- 依赖：`T5-1`
- 验证：
  - 场景与本 spec 的验收矩阵一致
- 完成标志：
  - 首发验收从“跑命令”提升为“命令 + 用户路径”

#### T5-3 首发 blocker 归档格式

- 目标：统一记录首发结束时仍残留的 blocker
- 交付物：
  - 应用侧已完成项
  - 环境侧外部前提项
  - 不纳入本轮的并行研发项
- 依赖：`T5-2`
- 验证：
  - blocker 能被明确归类，不互相污染
- 完成标志：
  - 首发结论可以清楚地说“还差什么，归谁负责”

## 任务依赖

```text
T1-1 -> T1-2 -> T1-3
T1-2 -> T2-1 -> T2-2 -> {T2-3, T2-4} -> T2-5
T1-2 -> T3-1 -> T3-2
T3-1 -> T3-3
T3-2 + T3-3 -> T3-4
T1-2 -> T4-1 -> T4-2
T4-1 -> T4-3
T4-2 + T4-3 -> T4-4
T2-5 + T3-4 + T4-3 -> T5-1 -> T5-2 -> T5-3
```

## 执行批次

### Batch 0: 首发定义冻结

- 纳入任务：
  - `T1-1`
  - `T1-2`
  - `T1-3`
- 目标：
  - 先把“首发是什么”和“首发不是什么”固定下来，再进入实现
- 阻塞关系：
  - 未完成本批次，不应开始 generator / go-live 的正式收口
- 完成信号：
  - 文档口径统一
  - 官方命令集合固定
  - 首发完成定义可直接作为后续 gate 依据

### Batch 1: 参考发行版入口收口

- 纳入任务：
  - `T2-1`
  - `T2-2`
- 目标：
  - 先把用户第一次进入 starter 的体验收口，避免后续工作区收口建立在错误主路径上
- 阻塞关系：
  - 未完成本批次，不应开始大规模工作区日常体验收口
- 完成信号：
  - onboarding 路径明确
  - shell / auth / navigation 的首发语义稳定

### Batch 2: 核心工作区收口

- 纳入任务：
  - `T2-3`
  - `T2-4`
  - `T2-5`
- 目标：
  - 把参考发行版从“能进后台”推进到“能拿来演示和交付”
- 并行规则：
  - `T2-3` 与 `T2-4` 可并行
  - `T2-5` 必须在前两者完成后统一收口
- 完成信号：
  - 核心模块两批次闭环完成
  - 状态语义统一

### Batch 3: generator 首发路径收口

- 纳入任务：
  - `T3-1`
  - `T3-2`
  - `T3-3`
  - `T3-4`
- 目标：
  - 固定首发默认生成路径，避免把 generator 继续当作“内部能力集合”
- 并行规则：
  - `T3-2` 与 `T3-3` 可在 `T3-1` 后并行
  - `T3-4` 必须等 `T3-2`、`T3-3` 完成
- 完成信号：
  - 至少一条可对外复现的标准模块路径成立

### Batch 4: 发布与上线口径收口

- 纳入任务：
  - `T4-1`
  - `T4-2`
  - `T4-3`
  - `T4-4`
- 目标：
  - 把“仓库可发布”和“环境可上线”切开，形成统一门禁
- 并行规则：
  - `T4-2`、`T4-3` 可在 `T4-1` 后并行
  - `T4-4` 必须等 `T4-2`、`T4-3` 完成
- 完成信号：
  - 命令链路、环境前提、停止条件三者一致

### Batch 5: 首发总验收

- 纳入任务：
  - `T5-1`
  - `T5-2`
  - `T5-3`
- 目标：
  - 输出首发结论，而不是停在“差不多都做了”
- 阻塞关系：
  - 未完成 Batch 2 / 3 / 4，不应提前进入本批次
- 完成信号：
  - 命令基线固定
  - 人工验收场景固定
  - blocker 归档格式固定

## 认领建议

- 文档/产品口径：`T1-1`、`T1-2`、`T1-3`
- 前端参考发行版：`T2-1` 到 `T2-5`
- generator 首发链路：`T3-1` 到 `T3-4`
- 发布与运维口径：`T4-1` 到 `T4-4`
- 首发验收与结论：`T5-1` 到 `T5-3`

## 任务产出归档规则

每个任务完成时至少留下以下一种证据，不允许只口头说明“已经做完”：

- 文档任务：
  - 对应文档 diff
  - 明确的新增/更新段落
- 前端体验任务：
  - 受影响页面列表
  - 对应验收路径说明
  - 定向测试或 build 结果
- generator 任务：
  - 命令样例
  - 生成结果样例
  - checklist 或 report 样例
- 发布任务：
  - 命令清单
  - 模板/准备包路径
  - blocker/stop condition 文档位置
- 验收任务：
  - 执行命令结果
  - 人工场景勾选记录
  - blocker 归类结论

推荐归档位置：

- 计划与结论：`docs/plans/*`
- 命令输出与报告：`.ci-reports/` 或 `artifacts/`
- 可复用模板：`docs/reference/*`

## 单任务完成记录模板

每个任务完成后，统一记录为：

```text
任务编号：
完成时间：
完成人：

已完成：
-

验证结果：
-

产出位置：
-

未覆盖：
-

残留风险：
-
```

## 当前推荐起手顺序

若从零开始推进本 spec，默认推荐：

1. `T1-1` 文档口径冻结
2. `T1-2` 首发公开契约冻结
3. `T2-1` Onboarding 路径审计
4. `T2-2` Shell / Auth / Navigation 收口
5. `T4-1` release / go-live / rehearsal 分层冻结

原因：

- 这 5 个任务会先固定入口、命令和发布语义，能最大限度减少后续前端与 generator 收口时的返工

## 实施顺序

必须按以下顺序推进，不交叉打乱：

1. 冻结发行版定义与文档口径
2. 收口参考发行版前端体验
3. 收口 generator Happy Path
4. 收口 release / go-live / rehearsal 文档与门禁
5. 统一执行首发验收
6. 产出首发结论与残留 blocker

若某一步发现前置条件未达成，不允许跳到后一步靠文档掩盖。

## 验收矩阵

### A. Onboarding

- `bun install` 成功
- `.env` 配置说明无歧义
- `db:migrate` / `db:seed` 可按 README 执行
- `dev:server` / `dev:vue` 路径可跑通

### B. 参考发行版体验

- 登录成功
- 动态菜单正常
- 核心工作区列表正常
- 至少一组写操作成功
- 权限不足反馈正确

### C. generator 路径

- 最小 schema 可 preview
- report / SQL preview 可理解
- staging apply 可执行
- checklist 能指导人工接线

### D. 发布路径

- image build / smoke 正常
- go-live report 生成 blocker 列表
- tenant rehearsal 仍保持 rehearsal-only 边界

## 风险与处置

### 1. 文档说法超前于实现

- 处置：凡未通过命令或真实链路验证的能力，只能写成“已具备最小基线”或“仍待目标环境确认”，不能写成“正式支持”

### 2. 首发范围被并行轨道挤占

- 处置：React、uniapp、重 Studio、复杂 workflow 统一归为并行研发轨道，不进入本 spec 的完成定义

### 3. generator 边界再次变模糊

- 处置：首发默认路径固定为 staging-safe path；module target 明确是集成桩，不宣传一键完成

### 4. go-live 与本地验证混淆

- 处置：显式区分“仓库发布通过”和“目标环境上线通过”；后者必须带环境证据与责任人

## 非目标

- 不新增第二套 starter 入口
- 不新增第二套 generator 主路径
- 不为了减少局部重复而抽新的 shared owner
- 不为了“首发完整”把复杂 BPM、低代码 Studio、分布式平台一起打包进来

## 实施后需要同步的文档

- `README.md`
- `docs/roadmap.md`
- `docs/PROJECT_PROFILE.md`
- 若发布口径变化，再同步：
  - `docs/release-checklist.md`
  - `docs/reference/05-go-live-runbook.md`
  - 相关 `MODULE.md`

## 备注

本 spec 只服务首个参考发行版首发。首发完成后，再基于新的主线决策单独启动“首发后第一轮增强”计划，而不是继续在本文档里累加长期平台路线。
