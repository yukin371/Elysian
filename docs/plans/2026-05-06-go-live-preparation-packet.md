# 2026-05-06 Go-live 准备包

更新时间：`2026-05-06`

本文件用于把当前版本进入正式上线前的已知事实、待补证据和阻断项收敛到一处。

它不替代：

- `docs/release-checklist.md`
- `docs/reference/05-go-live-runbook.md`
- `docs/reference/07-database-backup-and-recovery-template.md`
- `docs/reference/08-release-roles-and-oncall-template.md`

当前可配套使用：

- `bun run go-live:report`
- `bun run go-live:gate`
- `bun run go-live:finalize`
- `docs/reference/09-go-live-gate-input-template.md`

## 当前发布元数据

```text
source branch: dev
release commit: 867a3b5e1c2a41f6a8ddd11e8194d1e78fffc414
release tag:
release pr:
release environment:
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

server:image:build:
- status: passed
- date: 2026-05-06
- notes: 本地 `bun run server:image:build` 已完成；基于 `elysian-server:local` 以 `APP_ENV=production`、`PORT=3300`、本地 PostgreSQL 与本地 access token secret 启动临时容器后，`GET /health` 返回成功，说明镜像构建与最小运行时闭包已通过本机烟测。

server:image:smoke:
- status: passed
- date: 2026-05-06
- notes: 通过 `bun run server:image:smoke` / `bun run server:image:verify` 完成；临时容器同时通过 `/health` 与 `/metrics`，报告文件：`.ci-reports/server-image-smoke-2026-05-06/server-image-smoke-report.json`

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
release environment:
release commit / tag / PR: 867a3b5e1c2a41f6a8ddd11e8194d1e78fffc414
release date window:

database owner:
dba / environment owner:
release coordinator:

database engine: PostgreSQL
database host / cluster:
affected databases / schemas:

migration list:
- 

backup strategy:
- 

backup ready:
- blocked

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
- 目标环境数据库备份与恢复证据尚未提供
```

## 发布角色与值守记录

参照：

- `docs/reference/08-release-roles-and-oncall-template.md`

当前预填：

```text
release environment:
release commit / tag / PR: 867a3b5e1c2a41f6a8ddd11e8194d1e78fffc414
release date window:

release coordinator:
application owner:
dba / environment owner:
frontend release owner:
server release owner:

first 30m oncall:
first day oncall:
escalation manager:

log access owner:
metrics access owner:
proxy / tls owner:

incident channel:
escalation path:
fallback contact:

stop decision owner:
rollback coordination owner:

notes:
- 当前模板已创建，但目标环境值守人和升级路径仍未填写
```

## 运行前阻断项

```text
- release environment 未锁定
- release tag / release PR 未锁定
- migration list 未锁定
- database backup / restore evidence 缺失
- release roles / oncall evidence 缺失
- proxy / tls owner 未明确
```

## 发布后最小冒烟记录

```text
health:
metrics:
admin login:
menu and permission gate:
core workspace list:
core write action:

tenant add-ons:
- super-admin /system/tenants:
- tenant admin denied /system/tenants:
- non-default tenant login:
- cross-tenant isolation:
```

## 当前结论

```text
go-live ready: no

next actions:
1. 锁定 release environment、tag / PR、migration list
2. 由环境 / DBA owner 填写数据库备份与恢复记录
3. 由发布负责人填写角色与值守记录
4. 在目标环境完成镜像拉取、容器启动与发布后最小冒烟
5. 发布后按最小冒烟记录补齐目标环境证据
```

## 当前 go-live gate 试跑

```text
commands:
- bun run go-live:report
- bun run go-live:gate

artifacts:
- artifacts/go-live/go-live-report.json
- artifacts/go-live/go-live-gate-report.json

latest result:
- status: failed
- blocker count: 12
- notes: 当前脚本结论与准备包一致，阻断项集中在 release tag / PR、release environment、migration list、backup / roles / proxy owner，以及目标环境发布后最小冒烟证据。
```

## 当前 go-live env 预填建议

参照：

- `docs/reference/09-go-live-gate-input-template.md`

以下是基于当前已知事实的预填版本，仍需环境 / 发布 owner 补空白项：

```text
ELYSIAN_GO_LIVE_SOURCE_BRANCH=dev
ELYSIAN_GO_LIVE_TARGET_BRANCH=main
ELYSIAN_GO_LIVE_RELEASE_COMMIT=867a3b5e1c2a41f6a8ddd11e8194d1e78fffc414
ELYSIAN_GO_LIVE_RELEASE_TAG=
ELYSIAN_GO_LIVE_RELEASE_PR=
ELYSIAN_GO_LIVE_ENVIRONMENT=
ELYSIAN_GO_LIVE_MIGRATIONS=
ELYSIAN_GO_LIVE_TENANT_IMPACT=

ELYSIAN_GO_LIVE_CHECK_PASSED=true
ELYSIAN_GO_LIVE_BUILD_VUE_PASSED=true
ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED=true
ELYSIAN_GO_LIVE_TENANT_FULL_PASSED=true

ELYSIAN_GO_LIVE_BACKUP_READY=false
ELYSIAN_GO_LIVE_RELEASE_ROLES_READY=false
ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY=false

ELYSIAN_GO_LIVE_HEALTH_VERIFIED=false
ELYSIAN_GO_LIVE_METRICS_VERIFIED=false
ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED=false
ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED=false
ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED=false
ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED=false

ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED=false
ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED=false
ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED=false
ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED=false
```

## 当前交接建议

发布负责人先补：

- `ELYSIAN_GO_LIVE_RELEASE_TAG` 或 `ELYSIAN_GO_LIVE_RELEASE_PR`
- `ELYSIAN_GO_LIVE_ENVIRONMENT`
- `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY`

环境 / DBA owner 再补：

- `ELYSIAN_GO_LIVE_MIGRATIONS`
- `ELYSIAN_GO_LIVE_BACKUP_READY`
- `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY`
- `ELYSIAN_GO_LIVE_HEALTH_VERIFIED`
- `ELYSIAN_GO_LIVE_METRICS_VERIFIED`

应用 owner 最后补：

- `ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED`
- `ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED`
- 若触及 tenant，再补全部 tenant 附加验证项

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
