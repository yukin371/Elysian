# 2026-05-06 Go-live 准备包

更新时间：`2026-05-12`

本文件用于把当前版本进入正式上线前的已知事实、待补证据和阻断项收敛到一处。

它不替代：

- `docs/release-checklist.md`
- `docs/reference/05-go-live-runbook.md`
- `docs/reference/07-database-backup-and-recovery-template.md`
- `docs/reference/08-release-roles-and-oncall-template.md`

当前已按 `2026-05-12` 首个参考发行版 spec 补充：

- blocker 分类口径
- 停止上线条件
- 应用 / 环境责任边界

当前可配套使用：

- `docs/plans/2026-05-13-reference-starter-go-live-stage-plan.md`
- `bun run go-live:report`
- `bun run go-live:handoff`
- `bun run go-live:gate`
- `bun run go-live:finalize`
- `docs/reference/09-go-live-gate-input-template.md`

## 当前发布元数据

```text
source branch: dev
release commit: 8e0b74e
release tag: v1.0.0
release pr:
release environment: staging
prepared at: 2026-05-06 19:21:01 +08:00
docker engine: 28.5.1
```

## 当前已确认验证

```text
check:
- status: passed
- date: 2026-05-06

build:vue:
- status: passed
- date: 2026-05-06

e2e:smoke:full:
- status: passed
- date: 2026-05-12
- notes: 已在 `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md` 记录为通过；当前 go-live 候选冻结默认把这条结果视为 M1 基线的一部分。

server:image:build:
- status: passed
- date: 2026-05-06
- notes: 本地 `bun run server:image:build` 已完成；基于 `elysian-server:local` 以 `APP_ENV=production`、`PORT=3300`、本地 PostgreSQL 与本地 access token secret 启动临时容器后，`GET /health` 返回成功，说明镜像构建与最小运行时闭包已通过本机烟测。

server:image:smoke:
- status: passed
- date: 2026-05-06
- notes: 通过 `bun run server:image:smoke` / `bun run server:image:verify` 完成；临时容器同时通过 `/health` 与 `/metrics`，报告文件：`.ci-reports/server-image-smoke-2026-05-06/server-image-smoke-report.json`

M1 candidate verification:
- status: passed
- date: 2026-05-14
- notes: `8e0b74e` 上复跑 `bun run check`、`bun run build:vue`、`bun run server:image:verify`、`bun run e2e:smoke:full` 与 `bun run e2e:tenant:full` 均通过；当前候选 commit 已锁定，release tag 已进入 `v1.0.0`

e2e:tenant:full:
- status: passed
- date: 2026-05-06
- notes: 使用 `DATABASE_URL=postgres://postgres:postgres@localhost:5432/elysian`、`ACCESS_TOKEN_SECRET=<local-secret>` 与 `ELYSIAN_TENANT_E2E_REPORT_DIR=.ci-reports/local-tenant-e2e-2026-05-06` 本地执行通过；报告文件：`.ci-reports/local-tenant-e2e-2026-05-06/e2e-tenant-report.json`
```

## 发布范围确认

```text
server changes:
frontend changes:
migration list:
tenant impact:
workflow impact:
generator impact:
not in this release:
```

## 数据库备份与恢复记录

参照：

- `docs/reference/07-database-backup-and-recovery-template.md`

当前预填：

```text
release environment: staging
release commit / tag / PR: 8e0b74e / v1.0.0
release date window:

database owner:
dba / environment owner:
release coordinator:

database engine: PostgreSQL
database host / cluster:
affected databases / schemas:

migration list:
- 0000–0022（`packages/persistence/drizzle/` 下全部 `.sql`）

backup strategy:
- 

backup ready:
- confirmed

backup created at:
backup created by:
backup id / snapshot id:
backup storage location:

restore point target:
restore point description:

restore owner:
restore command / platform action:
restore expected duration:

rollback decision owner:
rollback stop condition:

post-restore validation owner:
post-restore validation steps:
- GET /health
- GET /metrics
- admin login
- core workspace list

notes:
- 备份已确认；恢复点、执行人、备份编号与存储位置仍待 DBA / 环境 owner 补齐
```

## 发布角色与值守记录

参照：

- `docs/reference/08-release-roles-and-oncall-template.md`

当前预填：

```text
release environment: staging
release commit / tag / PR: 8e0b74e / v1.0.0
release date window:

release coordinator: yukin371
application owner: yukin371
dba / environment owner: yukin371
frontend release owner: yukin371
server release owner: yukin371

first 30m oncall: yukin371
first day oncall: yukin371
escalation manager: yukin371

log access owner: yukin371
metrics access owner: yukin371
proxy / tls owner: yukin371

incident channel: yukin371
escalation path: yukin371
fallback contact: yukin371

stop decision owner: yukin371
rollback coordination owner: yukin371

notes:
- `proxy / tls owner` 已锁定为 `yukin371`
- 发布值守与升级路径已按当前首发演练 owner 锁定为 `yukin371`
```

## 运行前阻断项

```text
- 目标环境数据库恢复点 / 执行人 / 备份编号等细节证据仍未补齐
```

## Blocker 分类与 owner 归档

| blocker 类别 | 典型触发项 | 默认 owner | 处理规则 |
|---|---|---|---|
| 发布输入 blocker | `release tag / PR / environment / migration list` 缺失 | 发布负责人 | 不得启动 migration 或发布切换 |
| 环境前提 blocker | `backup / restore` 证据缺失、`proxy / TLS` owner 未锁定、值守未锁定 | 环境 owner / DBA / 发布负责人 | 不得开始正式上线 |
| 应用验证 blocker | `check`、`build:vue`、`server:image:verify`、`e2e:tenant:full` 未通过 | 应用 owner | 不得进入 go-live 执行 |
| 发布后冒烟 blocker | `/health`、登录、权限 gate、核心列表/写动作失败 | 应用 owner / 环境 owner | 立即停止继续放量并评估回滚 |
| tenant 安全 blocker | super-admin 租户访问失败、tenant admin 越权、跨租户隔离异常 | 应用 owner / DBA / 环境 owner | 视为高优先级阻断，默认进入回滚评估 |

## 停止上线与回滚判断

出现以下任一情况，应停止继续上线：

- migration 失败
- `/health` 不可用
- 管理员登录主链路异常
- 关键 5xx 持续出现
- 跨租户隔离异常

当前记录模板：

```text
stop triggered at:
stop triggered by:
blocker category:
failed check:

current frontend version:
current server image:
current migration step:

rollback required:
rollback decision owner:
rollback actions:
-

post-rollback verification:
- GET /health
- GET /metrics
- admin login
- core workspace list
```

## 应用侧与环境侧责任边界

应用 owner 负责：

- `bun run check`
- `bun run build:vue`
- `bun run server:image:verify`
- `bun run e2e:tenant:full`
- 管理员登录、权限 gate、核心工作区与核心写操作验证

环境 / DBA owner 负责：

- 目标环境 secret 注入
- 数据库备份与恢复证据
- proxy / TLS owner 与 reload 路径
- migration 执行与数据库恢复
- 发布后 `/health`、`/metrics` 可达性

发布负责人负责：

- 冻结发布输入
- 锁定值守与升级路径
- 宣布开始 / 停止 / 回滚
- 归档最终 blocker 结论

## 发布后最小冒烟记录

```text
health: true
metrics: true
admin login: true
menu and permission gate: true
core workspace list: true
core write action: true

tenant add-ons:
- super-admin /system/tenants: true
- tenant admin denied /system/tenants: true
- non-default tenant login: true
- cross-tenant isolation: false

notes:
- health=ok, metrics=ok
- admin login、permission gate（16 menus, 47 perms）与 customer CRUD 通过
- super-admin 可列出 36 个 tenants，tenant admin 访问 `/system/tenants` 正确返回 403
- 非默认 tenant 登录通过
- cross-tenant isolation 失败：tenant B（`m3-test-tenant-b`）可读取 tenant A（`m3-test-tenant`）customers
- 当前根因判断：应用以 `postgres`（table owner）连接数据库，PostgreSQL RLS 默认不对 table owner 生效，即使启用了 `FORCE ROW LEVEL SECURITY`
- 仓库侧修复已在 `c6d06d6` 提交：server runtime 改为优先读取 `DATABASE_RUNTIME_URL`；`DATABASE_URL` 继续保留给 migration / admin 路径
- `staging` 重跑前必须确认 `DATABASE_RUNTIME_URL` 指向非 owner、`NOSUPERUSER`、`NOBYPASSRLS` 的受限运行角色
```

## 当前结论

```text
go-live ready: no

next actions:
1. 在 `staging` 注入 `DATABASE_RUNTIME_URL`，并确认其角色不是 table owner / superuser，且无 `BYPASSRLS`
2. 保留 `DATABASE_URL` 给 migration / admin 路径，不要再让 server runtime 直接复用 owner 连接
3. 在 `staging` 重新执行 tenant 附加验证，优先复核跨租户隔离
4. 复跑 `go-live:report` / `go-live:gate`，确认 `M3` 是否转为 `passed`
```

## 当前 go-live gate 试跑

```text
commands:
- bun run go-live:report
- bun run go-live:handoff
- bun run go-live:gate

artifacts:
- artifacts/go-live/go-live-report.json
- artifacts/go-live/go-live-handoff-report.json
- artifacts/go-live/go-live-input.prefill.env
- artifacts/go-live/handoffs/
- artifacts/go-live/go-live-gate-report.json

latest result:
- status: failed
- blocker count: 1
- next milestone: M3
- notes: `M1/M2` 已通过，`M3` 的 10 项验证中 9 项通过、1 项失败。当前唯一 blocker 是 `cross-tenant isolation`：`postgres` 作为 table owner 连接数据库时，RLS 未对 owner 生效，导致 tenant B 可读取 tenant A customers。仓库侧修复已在 `c6d06d6` 提交，但 `staging` 仍需完成 `DATABASE_RUNTIME_URL` 受限角色注入并重跑验证。`go-live:gate` 当前因此返回 failed。
```

## 参考发行版首发验收衔接

若当前不是单次 go-live 排查，而是要完成“首个参考发行版是否可发布”的统一验收，继续使用：

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`

本准备包只负责 go-live 输入、blocker 与责任边界，不替代首发总验收清单。

## 当前 go-live env 预填建议

参照：

- `docs/reference/09-go-live-gate-input-template.md`

以下是基于当前已知事实的预填版本，仍需环境 / 发布 owner 补空白项：

```text
ELYSIAN_GO_LIVE_SOURCE_BRANCH=dev
ELYSIAN_GO_LIVE_TARGET_BRANCH=main
ELYSIAN_GO_LIVE_RELEASE_COMMIT=8e0b74e
ELYSIAN_GO_LIVE_RELEASE_TAG=v1.0.0
ELYSIAN_GO_LIVE_RELEASE_PR=
ELYSIAN_GO_LIVE_ENVIRONMENT=staging
ELYSIAN_GO_LIVE_MIGRATIONS=0000-0022
ELYSIAN_GO_LIVE_TENANT_IMPACT=true

ELYSIAN_GO_LIVE_CHECK_PASSED=true
ELYSIAN_GO_LIVE_BUILD_VUE_PASSED=true
ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED=true
ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED=true
ELYSIAN_GO_LIVE_TENANT_FULL_PASSED=true

ELYSIAN_GO_LIVE_BACKUP_READY=true
ELYSIAN_GO_LIVE_RELEASE_ROLES_READY=true
ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY=true

ELYSIAN_GO_LIVE_HEALTH_VERIFIED=true
ELYSIAN_GO_LIVE_METRICS_VERIFIED=true
ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED=true
ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED=true
ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED=true
ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED=true

ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED=true
ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED=true
ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED=true
ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED=false
```

## 当前交接建议

发布负责人先补：

- `ELYSIAN_GO_LIVE_RELEASE_TAG` 或 `ELYSIAN_GO_LIVE_RELEASE_PR`
- `ELYSIAN_GO_LIVE_ENVIRONMENT`
- `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY`
- 对应交接包：`artifacts/go-live/handoffs/release-coordinator.md`

环境 / DBA owner 再补：

- `ELYSIAN_GO_LIVE_MIGRATIONS`
- `ELYSIAN_GO_LIVE_BACKUP_READY`
- `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY`
- `ELYSIAN_GO_LIVE_HEALTH_VERIFIED`
- `ELYSIAN_GO_LIVE_METRICS_VERIFIED`
- 对应交接包：`artifacts/go-live/handoffs/environment-dba.md`

应用 owner 最后补：

- `ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED`
- `ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED`
- 若触及 tenant，再补全部 tenant 附加验证项
- 对应交接包：`artifacts/go-live/handoffs/application-owner.md`

## 当前可直接转发的话术

发给发布负责人：

```text
请补齐这次 go-live 的发布负责人字段：
- ELYSIAN_GO_LIVE_RELEASE_TAG 或 ELYSIAN_GO_LIVE_RELEASE_PR
- ELYSIAN_GO_LIVE_ENVIRONMENT
- ELYSIAN_GO_LIVE_RELEASE_ROLES_READY

并确认 docs/reference/08-release-roles-and-oncall-template.md 已填写。
```

发给环境 / DBA owner：

```text
请补齐这次 go-live 的环境 / DBA 字段：
- ELYSIAN_GO_LIVE_MIGRATIONS
- ELYSIAN_GO_LIVE_BACKUP_READY
- ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY
- ELYSIAN_GO_LIVE_HEALTH_VERIFIED
- ELYSIAN_GO_LIVE_METRICS_VERIFIED

并确认 docs/reference/07-database-backup-and-recovery-template.md 已填写。
```

发给应用 owner：

```text
请补齐这次 go-live 的应用验证字段：
- ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED
- ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED
- ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED
- ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED

若本次触及 tenant，再补全部 tenant 附加验证字段。
```
