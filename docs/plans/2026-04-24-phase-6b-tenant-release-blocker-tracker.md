# 2026-04-24 Phase 6B Tenant Release Blocker Tracker

## 目的

把 `Tenant 发布 blocker 确认单` 从模板转成可持续更新的本轮收证记录，避免：

- checklist 只有空模板，值班时还要二次抄写
- sample 里只有历史样例，和当前真实发布评审混在一起
- runbook 只定义顺序，不承载当前已收 / 未收证据状态

本文件只记录当前这轮 tenant 发布评审的真实收证状态，不替代 runbook、checklist 或 workflow artifact。

## 当前基线

- 默认 rehearsal 入口：GitHub `Tenant Release Rehearsal`
- 备用 rehearsal 入口：`tenant:release:report` / `tenant:release:gate` / `tenant:release:finalize`
- 已验证 workflow run：`24902244089`
- 当前已知状态：已自动补齐最新 head `ad29f09` 的 `5/5` tenant 观察窗口，workflow 结构链路稳定，最终只剩 `7` 个真实 blocker

## 当前发布元数据

```text
release environment: staging-rehearsal-github
release commit / PR: ad29f09e9a6f6be3cc75730a4d284a71c60c989a / #3
workflow run id: 24902244089
artifact: tenant-release-rehearsal-report
release report path: release/tenant-release-report.json
release gate report path: release/tenant-release-gate-report.json
fallback to shell env: false
fallback reason:
```

## 已确认的非 blocker 前提

这些项已经在最新已验证的 GitHub rehearsal 样例中成立，不属于当前剩余 `7` 个 blocker：

```text
headMatchesObservationWindow: true
docsSynced: true
rollbackPrepared: true
checkPassed: true
buildVuePassed: true
gitWorktreeClean: true
qualifiedForNextStep: true
recommendation: candidate_for_next_step
```

最新自动化取证：

```text
latest 5/5 observation runs:
- 24902162100
- 24902107795
- 24902051892
- 24901998931
- 24901849209
latest release rehearsal artifact dir:
- .ci-reports/gh-rehearsal-run-24902244089
```

## 收证顺序

按 runbook 固定顺序推进：

1. 环境 / DBA 前置
2. 发布前基线验证
3. 发布后最小验证

## Blocker 状态表

| Blocker | 当前状态 | 默认责任方 | 证据要求 | 当前证据 / 备注 |
|---|---|---|---|---|
| `databaseRoleConfirmed` | blocked | 环境 / DBA owner | 目标环境满足 `NOSUPERUSER + NOBYPASSRLS` | 当前工作区无目标环境角色取证权限；需环境 / DBA owner 在目标环境确认。 |
| `backupReady` | blocked | 环境 / DBA owner | 快照时间、恢复点或等价回退方案 | 当前工作区无目标环境备份/快照编排权限；需环境 / DBA owner 提供恢复点或等价回退方案。 |
| `tenantFullPassed` | done | 当前实施 owner / 模块 owner | `bun run e2e:tenant:full` 执行结果 | `2026-04-25 00:08:35 +08:00` 本地执行通过；报告：`.ci-reports/local-tenant-e2e/e2e-tenant-report.json` |
| `defaultTenantLoginVerified` | blocked | 发布负责人 + 模块 owner | 默认租户登录验证证据 | 尚未在目标环境执行发布后验证；本地 `e2e:tenant:full` 不能替代目标环境登录证据。 |
| `superAdminTenantAccessVerified` | blocked | 发布负责人 + `apps/server` owner | super-admin 访问 `/system/tenants` 证据 | 尚未在目标环境执行发布后验证；需发布后以 super-admin 账号取证。 |
| `tenantAdminDeniedVerified` | blocked | 发布负责人 + `apps/server` owner | tenant admin 禁止访问 `/system/tenants` 证据 | 尚未在目标环境执行发布后验证；需发布后以 tenant admin 账号取证。 |
| `nonDefaultTenantLoginVerified` | blocked | 发布负责人 + 模块 owner | 至少一个非默认 tenant admin 登录证据 | 尚未在目标环境执行发布后验证；需发布后选择至少一个非默认 tenant 取证。 |
| `crossTenantIsolationVerified` | blocked | 发布负责人 + 模块 owner | 至少一个真实业务实体跨租户隔离证据 | 尚未在目标环境执行发布后验证；需发布后选定实体与 tenant A/B 取证。 |

状态约定：

- `pending`：尚未开始收证
- `in_progress`：责任方已接手，但证据还没闭合
- `blocked`：存在环境、账号、窗口不一致等前置阻断
- `done`：证据已落地，可映射为对应布尔输入 `true`

## 收证记录

### 1. 环境 / DBA 前置

#### `databaseRoleConfirmed`

```text
status: blocked
owner: 环境 / DBA owner
checked at: 2026-04-25 00:14:44 +08:00
evidence:
notes: 当前工作区仅具备本地 PostgreSQL 与 GitHub artifact 取证能力，无法直接读取目标环境数据库角色属性；需环境 / DBA owner 在目标环境确认 `NOSUPERUSER + NOBYPASSRLS`。
```

#### `backupReady`

```text
status: blocked
owner: 环境 / DBA owner
checked at: 2026-04-25 00:14:44 +08:00
evidence:
notes: 当前工作区无法直接确认目标环境快照、恢复点或等价回退手段；需环境 / DBA owner 提供可追溯备份证据。
```

### 2. 发布前基线验证

#### `tenantFullPassed`

```text
status: done
owner: 当前实施 owner / 模块 owner
checked at: 2026-04-25 00:08:35 +08:00
command: DATABASE_URL=postgres://postgres:postgres@127.0.0.1:55432/elysian ACCESS_TOKEN_SECRET=<local-secret> ELYSIAN_TENANT_E2E_REPORT_DIR=.ci-reports/local-tenant-e2e bun run e2e:tenant:full
evidence: .ci-reports/local-tenant-e2e/e2e-tenant-report.json（status=passed, lastStage=db_fk_constraint, durationMs=4825）
notes: 复用本机容器 `elysian-tenant-e2e-pg`（127.0.0.1:55432）；执行链路已覆盖 migrate + seed + tenant init 幂等、super-admin 授权、customer 跨租户隔离、RLS 与 tenant_id FK。
```

### 3. 发布后最小验证

#### `defaultTenantLoginVerified`

```text
status: blocked
owner: 发布负责人 + 模块 owner
checked at: 2026-04-25 00:14:44 +08:00
account:
evidence:
notes: 尚未在目标环境完成实际发布；当前本地 `e2e:tenant:full` 只证明实现链路与本地 PostgreSQL 环境，不替代发布后默认租户登录证据。
```

#### `superAdminTenantAccessVerified`

```text
status: blocked
owner: 发布负责人 + `apps/server` owner
checked at: 2026-04-25 00:14:44 +08:00
account:
evidence:
notes: 尚未在目标环境完成实际发布；需发布后以 super-admin 账号验证 `/system/tenants` 可访问。
```

#### `tenantAdminDeniedVerified`

```text
status: blocked
owner: 发布负责人 + `apps/server` owner
checked at: 2026-04-25 00:14:44 +08:00
account:
evidence:
notes: 尚未在目标环境完成实际发布；需发布后以 tenant admin 账号验证 `/system/tenants` 继续返回拒绝结果。
```

#### `nonDefaultTenantLoginVerified`

```text
status: blocked
owner: 发布负责人 + 模块 owner
checked at: 2026-04-25 00:14:44 +08:00
tenant code:
account:
evidence:
notes: 尚未在目标环境完成实际发布；需发布后选择至少一个非默认 tenant admin 完成登录取证。
```

#### `crossTenantIsolationVerified`

```text
status: blocked
owner: 发布负责人 + 模块 owner
checked at: 2026-04-25 00:14:44 +08:00
entity:
tenant A:
tenant B:
evidence:
notes: 尚未在目标环境完成实际发布；需发布后选定至少一个真实业务实体，并提供 tenant A / tenant B 的隔离取证。
```

## 当前结论

```text
blockerCount: 7
ready for tenant:release:finalize: no
remaining blockers:
- databaseRoleConfirmed
- backupReady
- defaultTenantLoginVerified
- superAdminTenantAccessVerified
- tenantAdminDeniedVerified
- nonDefaultTenantLoginVerified
- crossTenantIsolationVerified
next action:
- 先由环境 / DBA owner 补 `databaseRoleConfirmed` 与 `backupReady`
- 再在目标环境完成发布后最小验证五项
```
