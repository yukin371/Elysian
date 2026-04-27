# 发布检查清单

更新时间：`2026-04-24`

用于 `dev -> main` 合并前的最终检查。目标是降低“功能做完但仓库还不适合进入 `main`”的概率。

---

## 1. 范围确认

- [ ] 本次发布目标明确
- [ ] 没有混入与发布目标无关的改动
- [ ] 变更范围已在 PR 或发布说明中写清楚

## 2. 代码与工作区

- [ ] `git status --short` 干净
- [ ] 没有临时调试代码、占位实现、注释掉的大段逻辑
- [ ] 没有把 `generated/`、`dist/`、临时日志等产物误提交

## 3. 质量验证

- [ ] `bun run check`
- [ ] `bun run build:vue`
- [ ] 若改动涉及数据库，已确认 `bun run db:migrate` 可执行
- [ ] 若改动涉及关键链路，已做对应 smoke 验证

## 4. 文档同步

- [ ] README 已同步或确认无需同步
- [ ] `docs/roadmap.md` 已同步或确认无需同步
- [ ] `docs/PROJECT_PROFILE.md` 已同步或确认无需同步
- [ ] 相关 `MODULE.md` / ADR / `docs/plans/*.md` 已同步或确认无需同步

## 5. 发布风险说明

- [ ] 已列出未验证区域
- [ ] 已列出已知风险
- [ ] 已明确回滚方式或回退范围

## 6. 分支与合并

- [ ] 源分支是 `dev`
- [ ] 目标分支是 `main`
- [ ] `main` 当前无未处理冲突
- [ ] 合并后会同步 tag 或版本说明（如本次需要）

## 7. Tenant 发布演练附加检查

仅当本次发布触及多租户相关能力时启用本节。详细顺序与责任边界以 [2026-04-24-phase-6b-tenant-migration-release-runbook.md](./plans/2026-04-24-phase-6b-tenant-migration-release-runbook.md) 为准。

### 7.1 发布输入冻结

- [ ] 已锁定发布 commit / PR
- [ ] 已锁定目标环境标识
- [ ] 已锁定本次 migration 列表
- [ ] 已确认是否需要 `db:seed`
- [ ] 已确认是否存在新增非默认租户及其 `tenant:init` 列表
- [ ] 已锁定 tenant evidence / decision：
  - `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
  - `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`

### 7.2 发布前门禁

- [ ] 待发布 head 与观察窗口 head 一致，或已对新 head 重建窗口
- [ ] tenant 稳定性结论仍为 `candidate_for_next_step`
- [ ] 已确认目标环境数据库角色满足 `NOSUPERUSER + NOBYPASSRLS`
- [ ] 已确认数据库快照、备份或等价恢复能力就绪
- [ ] 已明确回滚 owner、审批点与回滚执行路径

### 7.3 发布后最小验证

- [ ] 默认租户登录可用
- [ ] super-admin 可访问 `/system/tenants`
- [ ] tenant admin 不可访问 `/system/tenants`
- [ ] 至少一个非默认 tenant 的 tenant admin 登录可用
- [ ] 至少一个真实业务实体的跨租户隔离仍成立

### 7.4 Rehearsal 归档

若本次同时执行 tenant release rehearsal：

- [ ] 已优先按 runbook 的“GitHub 手动演练速用步骤”执行；若改走 shell env，已说明回退原因
- [ ] 已记录 `tenant:release:*` 仅为 rehearsal 入口，不代表生产平台命令
- [ ] 若使用 GitHub `Tenant Release Rehearsal`，已记录 workflow run id、artifact 位置、最终 blocker 数与是否只剩真实人工前提项
- [ ] 已归档 `tenant-release-report.json`
- [ ] 已归档 `tenant-release-gate-report.json`
- [ ] 已记录仍需人工确认的平台级空白

### 7.5 演练输入映射

若使用 `bun run tenant:release:report` 或 `bun run tenant:release:finalize`，至少确认以下输入已被人工审核后再映射为环境变量：

| 检查项 | 对应变量 |
|---|---|
| 源/目标分支 | `ELYSIAN_TENANT_RELEASE_SOURCE_BRANCH` / `ELYSIAN_TENANT_RELEASE_TARGET_BRANCH` |
| 目标环境 | `ELYSIAN_TENANT_RELEASE_ENVIRONMENT` |
| commit / PR | `ELYSIAN_TENANT_RELEASE_COMMIT` / `ELYSIAN_TENANT_RELEASE_PR` |
| migrations / tenant init 列表 / default seed | `ELYSIAN_TENANT_RELEASE_MIGRATIONS` / `ELYSIAN_TENANT_RELEASE_TENANT_INIT_CODES` / `ELYSIAN_TENANT_RELEASE_DEFAULT_SEED_REQUIRED` |
| head / 文档 / 回滚 / 数据库角色 / 备份 | `ELYSIAN_TENANT_RELEASE_HEAD_MATCHES_WINDOW` / `ELYSIAN_TENANT_RELEASE_DOCS_SYNCED` / `ELYSIAN_TENANT_RELEASE_ROLLBACK_PREPARED` / `ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED` / `ELYSIAN_TENANT_RELEASE_BACKUP_READY` |
| 基础验证命令结果 | `ELYSIAN_TENANT_RELEASE_CHECK_PASSED` / `ELYSIAN_TENANT_RELEASE_BUILD_VUE_PASSED` / `ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED` |
| 发布后最小验证结果 | `ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED` / `ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED` / `ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED` / `ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED` / `ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED` |

---

## 发布说明模板

可直接复用：

```text
本次发布包含：

- 

验证结果：

- bun run check
- bun run build:vue

未验证区域：

- 

残留风险：

- 
```

## Tenant 发布补充记录模板

仅当本次发布触及 tenant 相关改动时追加：

```text
Tenant 发布输入：

- environment:
- release commit / PR:
- migrations:
- default seed required:
- tenant:init codes:

Tenant 发布前门禁：

- headMatchesObservationWindow:
- qualifiedForNextStep:
- databaseRoleConfirmed:
- backupReady:
- rollbackPrepared:

Tenant 发布后验证：

- defaultTenantLoginVerified:
- superAdminTenantAccessVerified:
- tenantAdminDeniedVerified:
- nonDefaultTenantLoginVerified:
- crossTenantIsolationVerified:

Rehearsal 归档：

- tenant-release-report.json:
- tenant-release-gate-report.json:
- 仍需人工确认的平台级空白:
```

## Tenant 发布 Blocker 确认单

当 GitHub `Tenant Release Rehearsal` 已进入“只剩真实人工前提项 blocker”状态时，可直接用这份确认单推进：

| Blocker | 对应变量 | 确认方式 | 证据 / 备注 |
|---|---|---|---|
| 数据库角色满足 `NOSUPERUSER + NOBYPASSRLS` | `ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED` | 由环境 owner / DBA 在目标环境确认 | |
| 备份快照或等价回退手段已就绪 | `ELYSIAN_TENANT_RELEASE_BACKUP_READY` | 记录快照时间、恢复点或回退方案 | |
| `bun run e2e:tenant:full` 已通过 | `ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED` | 记录命令时间、执行人、结果 | |
| 默认租户登录可用 | `ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED` | 记录账号、环境与验证时间 | |
| super-admin 可访问 `/system/tenants` | `ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED` | 记录验证账号与结果 | |
| tenant admin 不可访问 `/system/tenants` | `ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED` | 记录验证账号与结果 | |
| 至少一个非默认 tenant admin 登录可用 | `ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED` | 记录 tenant code、账号与结果 | |
| 至少一个真实业务实体跨租户隔离仍成立 | `ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED` | 记录验证实体、tenant A/B 与结果 | |

可直接复制：

```text
Tenant 发布 blocker 确认单

- release environment:
- release commit / PR:
- workflow run id:

- databaseRoleConfirmed:
  evidence:
- backupReady:
  evidence:
- tenantFullPassed:
  evidence:
- defaultTenantLoginVerified:
  evidence:
- superAdminTenantAccessVerified:
  evidence:
- tenantAdminDeniedVerified:
  evidence:
- nonDefaultTenantLoginVerified:
  evidence:
- crossTenantIsolationVerified:
  evidence:
```
