# 2026-04-24 Phase 6B Tenant Release Rehearsal Sample

## 目的

产出一份可归档的 tenant release rehearsal 样例记录，验证：

- `tenant:release:report` / `tenant:release:gate` 的执行口径可复用
- runbook、release checklist 与脚本环境变量契约已对齐
- 在目标环境确认与发布后验证未完成时，gate 会按预期阻断

本记录是演练样例，不代表真实生产发布。

## 样例范围

- 演练环境：`staging-rehearsal-sample`
- release commit：`0166dc2fb278c7900646dc2f6c54c1aa002e32df`
- 观察窗口证据：
  - `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
  - `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`
- 输出产物：
  - `artifacts/tenant-release-rehearsal/sample-doc-run/tenant-release-report.json`
  - `artifacts/tenant-release-rehearsal/sample-doc-run/tenant-release-gate-report.json`

## 输入说明

本次样例采用“保守失败”策略：

- 已确认并置为 `true`：
  - `gitWorktreeClean`
  - `headMatchesObservationWindow`
  - `docsSynced`
  - `rollbackPrepared`
  - `checkPassed`
  - `buildVuePassed`
- 未在真实目标环境完成确认，因此保留为 `false`：
  - `databaseRoleConfirmed`
  - `backupReady`
  - `tenantFullPassed`
  - 发布后最小验证五项

### `headMatchesObservationWindow=true` 的判断依据

相对 tenant 观察结论收口时的实现头 `5a5d76e`，当前 `HEAD` 之后的变更集中在：

- `docs/*`
- `scripts/tenant-release-*.ts`
- `scripts/tenant-release-*.test.ts`
- `package.json`

本轮没有新增 tenant runtime、schema、RLS、`tenant:init` 或 server 鉴权语义变更，因此本样例把它视为“tenant 运行时等价头”的演练输入。

## 执行命令

```powershell
$env:ELYSIAN_TENANT_RELEASE_SOURCE_BRANCH='dev'
$env:ELYSIAN_TENANT_RELEASE_TARGET_BRANCH='main'
$env:ELYSIAN_TENANT_RELEASE_ENVIRONMENT='staging-rehearsal-sample'
$env:ELYSIAN_TENANT_RELEASE_COMMIT='0166dc2fb278c7900646dc2f6c54c1aa002e32df'
$env:ELYSIAN_TENANT_RELEASE_MIGRATIONS='0008_tenants.sql,0009_tenant_id_columns.sql,0010_rls_policies.sql'
$env:ELYSIAN_TENANT_RELEASE_DEFAULT_SEED_REQUIRED='false'
$env:ELYSIAN_TENANT_RELEASE_HEAD_MATCHES_WINDOW='true'
$env:ELYSIAN_TENANT_RELEASE_DOCS_SYNCED='true'
$env:ELYSIAN_TENANT_RELEASE_ROLLBACK_PREPARED='true'
$env:ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED='false'
$env:ELYSIAN_TENANT_RELEASE_BACKUP_READY='false'
$env:ELYSIAN_TENANT_RELEASE_CHECK_PASSED='true'
$env:ELYSIAN_TENANT_RELEASE_BUILD_VUE_PASSED='true'
$env:ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED='false'
$env:ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED='false'
$env:ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED='false'
$env:ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED='false'
$env:ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED='false'
$env:ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED='false'
bun run tenant:release:report
bun run tenant:release:gate
```

## 结果摘要

- `tenant-release-report.json`
  - `status=failed`
  - `qualifiedForNextStep=true`
  - `recommendation=candidate_for_next_step`
  - `blockers=8`
- `tenant-release-gate-report.json`
  - `status=failed`
  - `conclusion=Tenant release rehearsal gate failed with 8 blocker(s).`

## 阻断项

1. 目标环境数据库角色未确认满足 `NOSUPERUSER + NOBYPASSRLS`
2. 数据库快照或等价回退手段未确认就绪
3. `bun run e2e:tenant:full` 未确认通过
4. 默认租户登录未完成发布后验证
5. super-admin `/system/tenants` 验证未完成
6. tenant admin 禁止管理 `/system/tenants` 验证未完成
7. 非默认租户 tenant admin 登录验证未完成
8. 跨租户实体隔离验证未完成

## 结论

本样例证明了两件事：

1. 当前 rehearsal 输入契约、runbook 与 release checklist 已经能收敛成同一条执行路径。
2. 在缺少目标环境确认和发布后验证时，`tenant:release:*` 会按预期阻断，而不会把“观察窗口已达标”误判成“可直接发布”。

## 下一步

1. 若需要继续降低人工拼装成本，可评估新增仅用于 rehearsal 的 `workflow_dispatch` 入口，把这些输入项表单化。
2. 在引入任何平台级发布命令前，继续维持 `tenant:release:*` 只服务 rehearsal，不拥有生产审批与回滚能力。
