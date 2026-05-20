# 项目介绍与自述

更新时间：`2026-05-20`

## 用途

这份文档用于把 Elysian 讲清楚。它不是面试问答模板，也不是营销稿，而是一份可以放进作品集、项目说明、博客、简历附件或对外沟通材料里的项目自述。

核心目标：

- 让不了解仓库的人快速知道这个项目在解决什么问题。
- 让介绍重点落在工程判断、边界治理和交付闭环上，而不是简单罗列功能。
- 避免把规划态能力、验证中能力或演练脚本写成已经产品化的事实。

## 一句话介绍

Elysian 是一个面向中小项目交付的全栈快速开发平台，以 `ModuleSchema` 为前后端契约中心，提供企业后台基础模块、Schema 驱动代码生成、可审查的生成闭环，以及从本地验证到 go-live gate 的发布准备链路。

## 短版介绍

Elysian 不是单纯的后台模板，也不是低代码平台。它更像一个可发布的项目 starter：后端、前端、数据库、代码生成器、权限、多租户、审计和发布检查被放在同一套工程边界里。

我做这个项目时最关心的不是“再多写几个 CRUD 页面”，而是三个问题：

1. 新模块能不能从结构化契约出发，而不是靠复制粘贴。
2. AI 和代码生成能不能提高效率，同时仍然可审查、可回滚、可验证。
3. 一个 starter 能不能从开发环境一路走到发布准备，而不是只停在能跑 demo。

当前 `v1.0.0` 已经把 `apps/example-vue`、`apps/server`、`packages/persistence` 和 `packages/generator` 收口成首个参考发行版。它可以启动、登录、操作标准后台模块、生成模块骨架，并通过 `check / build / E2E / Docker smoke / generator reports / go-live gate` 这些入口验证发布信心。

## 稍长一点的介绍

Elysian 的出发点是中小项目里反复出现的一组问题：后台基础能力总要重做，模块代码经常靠复制改名，AI 生成代码容易绕过边界，发布前也常常缺少可复用的检查链路。

所以这个项目没有从“做一个漂亮后台”开始，而是先固定了几个工程前提：

- `apps/server` 只拥有 HTTP API、鉴权、模块装配和服务端运行态。
- `packages/persistence` 只拥有 Drizzle schema、migration、seed 和持久化 helper。
- `packages/schema` 只拥有结构化契约。
- `packages/generator` 只拥有 schema 到文件产物、preview/report、staging apply 和 manifest。
- `apps/example-vue` 是首发参考前端，不让 React、uniapp 或第二套 starter 抢主线。

在这个边界上，项目逐步补齐认证、RBAC、用户、角色、菜单、部门、岗位、字典、配置、操作日志、文件、通知、多租户、数据权限和简化 workflow。然后再把 generator 接进真实链路：从 schema 生成代码骨架，先 preview 和 report，再 review、confirm，最后只 apply 到 staging，并保留 manifest 和 handoff 证据。

这个项目最有价值的部分，不是某一个模块本身，而是它把“生成、审查、运行、验证、发布准备”串成了一个可重复的工程流程。

## 项目故事

如果只做后台页面，项目很快就会变成一堆功能清单。Elysian 刻意避开了这条路。

前期优先做的是边界：哪些能力属于 server，哪些属于 persistence，哪些属于 schema，哪些属于 generator。这样后续即使模块越来越多，也不会因为“顺手抽一个 shared helper”或者“为了少写几行把 owner 混在一起”而失控。

中期开始补企业基础能力：认证、RBAC、菜单、租户、数据权限、审计、通知、文件和 workflow。这里的重点是每个能力都有最小闭环和验证方式，而不是把功能描述写得很大。

后期重点转向生成器和发布闭环。生成器不能只会写文件，它还要能告诉人：会写哪些文件、为什么阻断、SQL 只是 proposal、哪些步骤还需要人工接线、apply 之后有哪些证据可以回看。发布也不能只写“已完成”，而要有 `bun run check`、`build:vue`、`server:image:verify`、`e2e:smoke:full`、`e2e:tenant:full`、`e2e:generator:*` 和 `go-live:*` 这类可执行入口。

这也是 Elysian 的主线：它一直在尝试把“能写出来”推进到“能解释、能验证、能交付”。

## 可以重点展示的部分

### 1. Schema 驱动生成

Elysian 用 `ModuleSchema` 作为模块契约中心。一个模块的字段、权限、路由、前端注册元数据和生成产物都尽量从同一份结构化描述推导。

这条线可以这样讲：

```text
ModuleSchema -> validate -> preview/report -> generated files -> manifest -> staging apply -> handoff
```

值得展示的点：

- 支持简化 schema 输入，再展开为标准 `ModuleSchema`。
- 支持外部 schema 文件，不要求所有模块预注册在 `@elysian/schema`。
- 支持冲突策略、原子写入、manifest 和 preview report。
- SQL proposal 是 review-only，不自动变成正式 migration。
- `--target module` 只生成集成桩和 handoff manifest，不自动宣称正式接线完成。

### 2. 企业后台 starter

`apps/example-vue` 是首发参考前端。它不是展示型 demo，而是用来验证真实后台工作区、权限 gate、标准 CRUD surface 和 generator preview workspace 的 starter。

当前可以展示：

- 登录和会话恢复。
- 动态菜单与权限 gate。
- 用户、角色、菜单、部门、岗位、字典、配置、租户等系统模块。
- 文件、通知、操作日志等后台常用模块。
- generator preview 的新建、预览、复核、确认与 apply 证据回看。

### 3. 多租户与安全边界

多租户不是只在表里加 `tenant_id`。Elysian 当前的关键点是：

- tenant context 进入数据库查询链路。
- PostgreSQL RLS 作为隔离底线。
- server runtime 支持优先使用 `DATABASE_RUNTIME_URL`，可以切到 `NOSUPERUSER + NOBYPASSRLS` 的受限角色。
- `e2e:tenant:full` 用真实 PostgreSQL 验证 tenant init、super-admin 授权、跨租户隔离、RLS 和 FK 约束。

这部分可以体现项目不是只做应用层判断，而是把数据库运行身份也纳入验证范围。

### 4. 发布准备链路

Elysian 不是完整生产发布平台，但它已经有比较清楚的发布准备链路：

```text
check -> build:vue -> server:image:verify -> e2e:smoke:full -> e2e:tenant:full -> generator reports gate -> go-live gate
```

其中：

- `check` 覆盖 lint、typecheck、registry artifact 校验、standard CRUD surface 校验和测试。
- `server:image:verify` 验证服务端镜像构建与本地容器 smoke。
- `e2e:generator:reports:gate` 汇总 `matrix / cli / studio / browser` 四类 generator 报告源。
- `go-live:*` 只汇总目标环境输入和 blocker，不替代备份、代理、TLS、值守和上线后 smoke 的人工 owner。

## 可以怎么放进作品集

### 标题

```text
Elysian：面向中小项目交付的全栈快速开发 starter
```

或：

```text
Elysian：Schema 驱动的企业后台与代码生成平台
```

### 摘要

```text
Elysian 是一个以 ModuleSchema 为契约中心的全栈 starter，覆盖 Elysia server、Vue 企业后台、PostgreSQL/Drizzle 持久化、RBAC、多租户、审计、文件、通知、简化 workflow 和代码生成器。项目重点不是堆功能，而是把模块生成、人工审查、staging apply、tenant 隔离验证和 go-live gate 串成可复用的工程交付链路。
```

### 关键能力

- 全栈 monorepo：`apps/server`、`apps/example-vue`、`packages/persistence`、`packages/generator`、`packages/schema`。
- 企业基础模块：认证、RBAC、菜单、组织、租户、审计、文件、通知、workflow。
- Schema 驱动生成：preview、report、冲突策略、manifest、staging apply、handoff。
- 多租户安全：PostgreSQL RLS、受限 runtime DB role、tenant E2E。
- 发布准备：check、build、Docker image smoke、E2E、generator reports gate、go-live gate。

### 一段更自然的项目说明

```text
我把 Elysian 当成一个“可以真的开项目”的 starter 来做，而不是只做一个后台模板。它从一开始就强调 owner 边界：server 管 HTTP 和运行时，persistence 管数据库，schema 管契约，generator 管生成，example-vue 管首发前端。这样后续补认证、RBAC、多租户、文件、通知、workflow 和代码生成时，每个能力都能落在自己的位置。

项目里我最看重的是生成和发布两条链路。生成器不会直接替人改正式工程，而是先 preview、report、review、confirm，再 apply 到 staging，并保留 manifest 和 handoff 证据。发布侧也不是只说“能跑”，而是用 check、build、E2E、镜像 smoke、tenant 隔离验证和 go-live gate 去收敛风险。
```

## 可以怎么口头介绍

### 30 秒版本

```text
Elysian 是我做的一个全栈快速开发 starter，核心是用 ModuleSchema 作为前后端契约中心，从 schema 生成后端 CRUD、前端工作区、权限注册和生成报告。它已经包含认证、RBAC、多租户、审计、文件、通知和简化 workflow，也有 check、E2E、Docker smoke、generator reports gate 和 go-live gate 这些发布准备链路。
```

### 2 分钟版本

```text
这个项目的背景是：很多中小项目都会重复做后台基础能力，模块开发靠复制粘贴，AI 生成代码也容易越过工程边界。所以我做 Elysian 时没有先追求页面数量，而是先固定 owner 和契约。

它的核心是 ModuleSchema。模块先被描述成结构化 schema，再由 generator 生成服务端、前端、权限和报告相关产物。生成器不会直接宣称正式接线完成，而是走 preview、report、review、confirm、staging apply 和 handoff，这样生成结果可以被人审查，也可以被 CI 和报告门禁验证。

同时，项目也补了企业后台 starter 的基础能力，比如认证、RBAC、菜单、租户、数据权限、操作日志、文件、通知和 workflow。多租户这块不是只做应用层过滤，还用 PostgreSQL RLS 和受限 runtime DB role 验证隔离。发布侧则有 check、build、server image smoke、smoke E2E、tenant E2E、generator reports gate 和 go-live gate。

所以我介绍它时更愿意说：这是一个把生成、审查、运行和发布准备放到一起的工程 starter，而不是一个普通后台模板。
```

## 不建议这样介绍

不建议说：

- “完整低代码平台”
- “完整生产发布平台”
- “通用 BPM”
- “AI 自动生成并上线全栈代码”
- “自动完成正式数据库迁移”
- “React / uniapp 已经和 Vue 主线同等成熟”

更稳妥的说法：

- “Schema 驱动生成，而不是黑盒低代码。”
- “go-live gate 是发布准备机制，不是自动生产发布平台。”
- “workflow 是简化运行态，不是通用 BPM。”
- “SQL proposal 是 review-only，正式 migration 仍由 persistence owner 人工接入。”
- “React / uniapp 是储备轨道，首发参考发行版固定为 Vue。”

## 讲项目时可以强调的取舍

### 为什么不是低代码

低代码常见问题是运行时黑盒、产物难回收、后期改造成本高。Elysian 选择生成真实代码，并且生成产物与手写代码同权。生成器负责提高起步速度，但不剥夺人工审查和重构空间。

### 为什么 AI 不直接改核心代码

AI 自由改代码很容易绕过 owner。Elysian 把 AI 放在 schema handoff 和 generator 链路里：先让 AI 产出结构化 schema，再经过 runtime 校验、preview report 和人工确认。这样 AI 参与的是“输入整理”，不是无边界地改平台基础设施。

### 为什么 apply 只到 staging

正式模块接线会影响 migration、server module registry、menu、permission、frontend registry 等多个 owner。如果 generator 自动跨 owner 写完所有接线，短期看起来更自动，长期会让责任边界变差。当前让 apply 停在 staging，再通过 handoff manifest 提醒人工接线，是为了保持可审查和可回滚。

### 为什么发布链路要这么重

starter 一旦被别人拿去开项目，问题就不只是“本机能跑”。它需要明确哪些命令能验证代码质量，哪些命令能验证数据库隔离，哪些报告能证明 generator 主链路还完整，哪些 go-live 输入必须由环境 owner 确认。这套发布链路就是为了把风险显性化。

## 如果要继续包装

下一步可以补三类轻量材料：

1. `docs/reference/13-project-screens-and-demo-script.md`
   记录推荐截图、演示顺序和每一步要展示的工程点。
2. `docs/reference/14-project-resume-snippets.md`
   放几种不同长度的项目摘要，但仍保持克制，不写成夸张宣传。
3. `docs/reference/15-project-deep-dive-notes.md`
   深挖 generator、多租户、发布门禁三条线，便于写博客或做分享。

这些材料不需要一次写完。当前先用本文统一项目叙事，避免每次介绍都临时组织语言。
