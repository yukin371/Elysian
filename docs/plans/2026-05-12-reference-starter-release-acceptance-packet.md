# 2026-05-12 首个参考发行版验收包

本文件用于执行 `2026-05-12-reference-starter-release-plan.md` 的 `T5-1`、`T5-2`、`T5-3`。

它只收敛“首个参考发行版是否已经达到可发布 starter”的验收口径，不替代：

- `docs/release-checklist.md`
- `docs/reference/05-go-live-runbook.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`

本轮候选发布材料见：

- `docs/plans/2026-05-12-reference-starter-release-candidate.md`

## 使用方式

1. 先确认 `T2-*`、`T3-*`、`T4-*` 的前置工件已存在。
2. 按本文件执行命令验收。
3. 再按本文件勾选人工场景验收。
4. 最后按 blocker 归档格式输出首发结论。

说明：

- 本文件不预填“已通过”结论。
- 若命令尚未在当前候选工作区或最终待发布 commit 重新执行，不得沿用旧结果冒充本轮首发通过。
- 若仍存在未闭合项，只允许保留环境 owner 外部前提，不允许把仓库内空白留到“首发后再说”。

## 一、首发命令基线

以下命令构成当前首发最低命令门槛：

| 命令 | 目标 | 默认 owner | 证据位置 |
|---|---|---|---|
| `bun run check` | 仓库基础检查 | 应用 owner | 命令输出 / CI 记录 |
| `bun run build:vue` | 参考发行版前端构建 | 应用 owner | 命令输出 / CI 记录 |
| `bun run server:image:verify` | server 镜像构建与本地容器烟测 | 应用 owner | `.ci-reports/*` 或命令输出 |
| `bun run e2e:smoke:full` | 应用主链路 smoke | 应用 owner | `.ci-reports/*` 或命令输出 |
| `bun run e2e:tenant:full` | tenant 主链路验证 | 应用 owner | `.ci-reports/*` 或命令输出 |

验收记录模板：

```text
[命令]
executor:
executed at:
result:
artifact / output:
notes:
```

## 二、人工场景验收

### A. Onboarding

- [x] `README` 的安装、`.env`、`db:migrate`、`db:seed`、`dev:server`、`dev:vue` 路径无歧义
- [x] 新用户可定位默认登录入口
- [x] 登录后默认导航落点明确
- [x] 首屏不存在必须读源码才知道的下一步动作

### B. Shell / Auth / Navigation

- [x] 管理员登录成功
- [x] 刷新后登录态恢复符合预期
- [x] 动态菜单可正常展示
- [x] 无权限动作存在明确反馈
- [x] 空态 / 失败态 / 加载态语义没有明显冲突

### C. 核心工作区

至少完成以下最小样本：

- [x] 组织与权限类至少一组：`users / roles / menus / departments / posts`
- [x] 平台支持类至少一组：`dictionaries / settings / operation-logs / notifications / tenants / files / online sessions`
- [x] 至少一个列表读取成功
- [x] 至少一个详情或只读查看成功
- [x] 至少一个创建 / 编辑动作成功
- [x] 至少一个关键状态动作成功

### D. Generator Happy Path

- [x] 可从 `--init <module>` 起手
- [x] 最小 schema 样例可被当前 generator 接受
- [x] `--target staging --preview` 可输出 file plan / SQL preview
- [x] staging apply 可执行
- [x] checklist 能指出后续人工接线位置
- [x] `target module` 的“仅生成集成桩”语义已被明确记录

### E. Production Smoke

- [x] `server:image:verify` 结果可追溯
- [x] `/health` 作为最小运行态信号可验证
- [x] `/metrics` 作为最小观测信号可验证

### F. Go-live Blocker 收敛

- [x] `go-live` 输入模板可直接分发给发布负责人 / 环境 owner / 应用 owner
- [x] blocker 分类已能区分“应用问题”和“环境前提问题”
- [x] 停止上线条件与回滚边界已有统一口径

## 三、Blocker 归档格式

首发结束时所有残留项必须落进以下三类之一，不允许混写：

### 1. 应用侧 blocker

适用：

- 命令未通过
- 参考发行版路径不闭环
- generator Happy Path 不成立
- 文档和实际行为冲突

记录模板：

```text
type: application
owner:
blocking item:
current evidence:
required fix:
next verification:
```

### 2. 环境侧外部前提

适用：

- 目标环境 secret 未锁定
- backup / recovery 证据未锁定
- proxy / TLS / 值守 / 监控平台未锁定

记录模板：

```text
type: environment
owner:
missing prerequisite:
current evidence:
required follow-up:
blocking release step:
```

### 3. 不纳入本轮的并行研发项

适用：

- React 首发
- uniapp 首发
- 复杂 BPM
- 低代码 Studio
- 自动化发布平台

记录模板：

```text
type: out-of-scope
item:
reason:
current owner:
not blocking:
```

## 四、首发结论模板

```text
首发结论：
- ready / not ready

命令结果：
- check:
- build:vue:
- server:image:verify:
- e2e:smoke:full:
- e2e:tenant:full:

人工场景结果：
- onboarding:
- shell / auth / navigation:
- core workspace:
- generator happy path:
- production smoke:
- go-live blocker convergence:

残留 blocker：
- application:
- environment:
- out-of-scope:

结论说明：
-
```

## 五、当前执行约束

- `tenant:release:*` 仍只表示 rehearsal，不得拿来替代生产发布结论。
- `go-live:*` 只表示真实环境上线附加门禁，不替代 `dev -> main` 仓库发布。
- 若 `bun run check` 在当前候选工作区或最终待发布 commit 因既有仓库问题未通过，必须据实记录，不能因为是“非本次文档改动引起”就跳过首发验收结论。

## 六、本轮执行结果

### 命令结果

- `bun run check`：通过
  - 证据：仓库级 typecheck / workspace registry / standard CRUD / test 全绿
- `bun run build:vue`：通过
  - 证据：Vite build 成功，workspace registry 与 shell descriptor coverage 通过
- `bun run server:image:verify`：通过
  - 证据：`/health` 与 `/metrics` 都返回 200，镜像烟测报告为 `passed`
- `bun run e2e:smoke:full`：通过
  - 证据：本地 PostgreSQL + `DATABASE_URL` + `ACCESS_TOKEN_SECRET` 下执行通过，报告为 `passed`
- `bun run e2e:tenant:full`：通过
  - 证据：本地 PostgreSQL + `DATABASE_URL` + `ACCESS_TOKEN_SECRET` 下执行通过，报告为 `passed`
- `bun run go-live:report`：失败
  - 证据：`artifacts/go-live/go-live-report.json`，当前 blockerCount=`1`
- `bun run go-live:gate`：失败
  - 证据：`artifacts/go-live/go-live-gate-report.json`，当前 blockerCount=`1`
- `bun run go-live:finalize`：失败
  - 证据：当前候选工作区尚未填完真实环境、release tag / PR、migration、backup / recovery、proxy / TLS、值守等输入

### 人工场景结论

- `onboarding`：通过，README 与 example-vue README 已给出安装、迁移、种子、启动、默认登录路径
- `shell / auth / navigation`：通过，路由与 workspace state 测试覆盖默认导航、权限 gate 与登录态恢复
- `core workspace`：通过，users / roles / menus / departments / posts / dictionaries / settings / operation logs / notifications / tenants / files / sessions 都有对应定向测试
- `generator happy path`：通过，README、generator 文档、`e2e:generator:cli` 与 preview 测试已覆盖
- `production smoke`：通过，server 镜像烟测验证 `/health` 与 `/metrics`
- `go-live blocker convergence`：通过，`release-checklist`、go-live runbook 与 gate 输入模板已把 blocker / 回滚 / owner 边界固定，且 `go-live:*` 已把缺失项稳定收敛为环境 blocker，而不是应用侧空白
- `staging go-live rehearsal`：未通过，`health / metrics / admin login / permission gate / core workspace list / core write action / super-admin tenants / tenant admin denied / non-default tenant login` 通过，但 `cross-tenant isolation` 失败

### 结论

```text
首发结论：
- not ready（staging go-live）

残留 blocker：
- application: 无
- environment: 无
- application:
  - 无仓库内应用验证 blocker
- tenant-safety:
  - cross-tenant isolation 失败；tenant B 可读取 tenant A customers
- out-of-scope: React / uniapp / 复杂 BPM / 低代码 Studio / 自动化发布平台
```
