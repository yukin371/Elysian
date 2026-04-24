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
- 已验证 workflow run：`24894806843`
- 当前已知状态：workflow 结构链路稳定，最终只剩 `8` 个真实 blocker

## 当前发布元数据

```text
release environment: staging-rehearsal-github
release commit / PR: 9593301864efb6d36fe98c03b9662731bbbe40a2 / #3
workflow run id: 24894806843
artifact: tenant-release-rehearsal-report
release report path: release/tenant-release-report.json
release gate report path: release/tenant-release-gate-report.json
fallback to shell env: false
fallback reason:
```

## 已确认的非 blocker 前提

这些项已经在最新已验证的 manual rehearsal 样例中成立，不属于当前剩余 `8` 个 blocker：

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

## 收证顺序

按 runbook 固定顺序推进：

1. 环境 / DBA 前置
2. 发布前基线验证
3. 发布后最小验证

## Blocker 状态表

| Blocker | 当前状态 | 默认责任方 | 证据要求 | 当前证据 / 备注 |
|---|---|---|---|---|
| `databaseRoleConfirmed` | pending | 环境 / DBA owner | 目标环境满足 `NOSUPERUSER + NOBYPASSRLS` | |
| `backupReady` | pending | 环境 / DBA owner | 快照时间、恢复点或等价回退方案 | |
| `tenantFullPassed` | pending | 当前实施 owner / 模块 owner | `bun run e2e:tenant:full` 执行结果 | |
| `defaultTenantLoginVerified` | pending | 发布负责人 + 模块 owner | 默认租户登录验证证据 | |
| `superAdminTenantAccessVerified` | pending | 发布负责人 + `apps/server` owner | super-admin 访问 `/system/tenants` 证据 | |
| `tenantAdminDeniedVerified` | pending | 发布负责人 + `apps/server` owner | tenant admin 禁止访问 `/system/tenants` 证据 | |
| `nonDefaultTenantLoginVerified` | pending | 发布负责人 + 模块 owner | 至少一个非默认 tenant admin 登录证据 | |
| `crossTenantIsolationVerified` | pending | 发布负责人 + 模块 owner | 至少一个真实业务实体跨租户隔离证据 | |

状态约定：

- `pending`：尚未开始收证
- `in_progress`：责任方已接手，但证据还没闭合
- `blocked`：存在环境、账号、窗口不一致等前置阻断
- `done`：证据已落地，可映射为对应布尔输入 `true`

## 收证记录

### 1. 环境 / DBA 前置

#### `databaseRoleConfirmed`

```text
status:
owner:
checked at:
evidence:
notes:
```

#### `backupReady`

```text
status:
owner:
checked at:
evidence:
notes:
```

### 2. 发布前基线验证

#### `tenantFullPassed`

```text
status:
owner:
checked at:
command:
evidence:
notes:
```

### 3. 发布后最小验证

#### `defaultTenantLoginVerified`

```text
status:
owner:
checked at:
account:
evidence:
notes:
```

#### `superAdminTenantAccessVerified`

```text
status:
owner:
checked at:
account:
evidence:
notes:
```

#### `tenantAdminDeniedVerified`

```text
status:
owner:
checked at:
account:
evidence:
notes:
```

#### `nonDefaultTenantLoginVerified`

```text
status:
owner:
checked at:
tenant code:
account:
evidence:
notes:
```

#### `crossTenantIsolationVerified`

```text
status:
owner:
checked at:
entity:
tenant A:
tenant B:
evidence:
notes:
```

## 当前结论

```text
blockerCount: 8
ready for tenant:release:finalize: no
remaining blockers:
- databaseRoleConfirmed
- backupReady
- tenantFullPassed
- defaultTenantLoginVerified
- superAdminTenantAccessVerified
- tenantAdminDeniedVerified
- nonDefaultTenantLoginVerified
- crossTenantIsolationVerified
next action:
- 先补环境 / DBA 前置证据
- 再补 `bun run e2e:tenant:full`
- 最后补发布后最小验证五项
```
