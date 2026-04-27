# 2026-04-24 Phase 6B Tenant Release Rehearsal Sample

## 目的

产出一份可归档的 tenant release rehearsal 样例记录，验证：

- `tenant:release:report` / `tenant:release:gate` 的执行口径可复用
- runbook、release checklist 与脚本环境变量契约已对齐
- 在目标环境确认与发布后验证未完成时，gate 会按预期阻断

本记录是演练样例与手动演练实录，不代表真实生产发布。

## 样例范围

- 演练环境：`staging-rehearsal-sample`
- release commit：`0166dc2fb278c7900646dc2f6c54c1aa002e32df`
- 观察窗口证据：
  - `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
  - `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`
- 输出产物：
  - `artifacts/tenant-release-rehearsal/sample-doc-run/tenant-release-report.json`
  - `artifacts/tenant-release-rehearsal/sample-doc-run/tenant-release-gate-report.json`

## GitHub 手动演练实录

在本地样例验证完成后，仓库又进行了真实 GitHub `workflow_dispatch` 演练，用于确认：

- `Tenant Release Rehearsal` workflow 本身可被成功分发执行
- GitHub artifact 下载、evidence / decision 生成、release gate 与 artifact 上传链路可闭环
- 最终 blocker 只剩真实人工前提项，而不是 workflow 自身噪音

### 关键运行记录

1. `run 24894377156`
   - 首次真实触发后进入执行，但失败在 `Build tenant evidence from GitHub artifacts`
   - 暴露问题：脚本仍按仓库默认 `artifacts/tenant-stability-evidence/*` 读取 evidence，未兼容 workflow 实际使用的 `.ci-reports/...` 输出路径
2. `run 24894637803`
   - evidence / decision / release gate / artifact 上传已全部跑通
   - 暴露问题：`gitWorktreeClean` 被 `.ci-reports/` 与 hooks 安装副作用污染，额外多出 1 个非业务 blocker
3. `run 24894806843`
   - 在修复 `workflow_dispatch` 输入上限、evidence 路径解析与 git worktree 基线后完成最终验证
   - `Build tenant evidence from GitHub artifacts` 成功
   - `Run tenant release rehearsal` 成功
   - `Upload tenant release rehearsal artifacts` 成功
   - workflow 仅在最后 `Fail when rehearsal gate is blocked` 步骤按预期退出 `1`

### 最终 GitHub 演练结论

- workflow run: `24894806843`
- workflow URL: `https://github.com/yukin371/Elysian/actions/runs/24894806843`
- release report:
  - `status=failed`
  - `gitWorktreeClean=true`
  - `qualifiedForNextStep=true`
  - `recommendation=candidate_for_next_step`
  - `blockers=8`
- release gate:
  - `status=failed`
  - `conclusion=Tenant release rehearsal gate failed with 8 blocker(s).`

这说明 GitHub 手动演练入口已经达到可归档状态：workflow 自身结构风险已收口，当前 gate 只阻断真实目标环境确认与发布后验证缺失。

### 预填版 Blocker 确认单

可直接在本段基础上补人工证据：

```text
Tenant 发布 blocker 确认单

- release environment: staging-rehearsal-github
- release commit / PR: 9593301864efb6d36fe98c03b9662731bbbe40a2 / #3
- workflow run id: 24894806843

- databaseRoleConfirmed: false
  evidence:
- backupReady: false
  evidence:
- tenantFullPassed: false
  evidence:
- defaultTenantLoginVerified: false
  evidence:
- superAdminTenantAccessVerified: false
  evidence:
- tenantAdminDeniedVerified: false
  evidence:
- nonDefaultTenantLoginVerified: false
  evidence:
- crossTenantIsolationVerified: false
  evidence:
```

当前这份预填版对应的状态是：

- 已确认：
  - `headMatchesObservationWindow=true`
  - `docsSynced=true`
  - `rollbackPrepared=true`
  - `checkPassed=true`
  - `buildVuePassed=true`
- 待补真实证据：
  - 数据库角色
  - 备份回滚
  - `e2e:tenant:full`
  - 发布后最小验证五项

### 预填版责任分配

本次预填版建议直接按下表追证据：

| Blocker | 默认责任方 | 说明 |
|---|---|---|
| `databaseRoleConfirmed` | 环境 / DBA owner | 确认目标环境数据库角色满足 `NOSUPERUSER + NOBYPASSRLS` |
| `backupReady` | 环境 / DBA owner | 提供快照时间、恢复点或等价回退方案 |
| `tenantFullPassed` | 当前实施 owner / 模块 owner | 提供 `bun run e2e:tenant:full` 执行结果 |
| `defaultTenantLoginVerified` | 发布负责人 + 模块 owner | 提供默认租户登录验证证据 |
| `superAdminTenantAccessVerified` | 发布负责人 + `apps/server` owner | 提供 super-admin 访问 `/system/tenants` 验证证据 |
| `tenantAdminDeniedVerified` | 发布负责人 + `apps/server` owner | 提供 tenant admin 禁止访问 `/system/tenants` 验证证据 |
| `nonDefaultTenantLoginVerified` | 发布负责人 + 模块 owner | 提供至少一个非默认 tenant admin 登录验证证据 |
| `crossTenantIsolationVerified` | 发布负责人 + 模块 owner | 提供至少一个真实业务实体跨租户隔离验证证据 |

若发布负责人、环境 / DBA owner 或模块 owner 还未明确，本次发布评审不应继续推进。

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

GitHub 手动演练又额外证明了两件事：

1. `Tenant Release Rehearsal` workflow 已可真实下载 tenant artifact、生成 evidence / decision、执行 release gate 并上传归档 artifact。
2. 在固定 `workflow_dispatch` 输入上限、evidence 输出路径与 git worktree 基线后，GitHub 手动演练不会再引入额外的非业务 blocker。

## 下一步

1. GitHub `Tenant Release Rehearsal` 已固定为默认的 rehearsal 入口；若 GitHub 手动入口不可用，再回退到 runbook + shell env 路径。
2. 若继续逼近真实发布评审，只补目标环境数据库角色、备份回滚、`e2e:tenant:full` 与发布后最小验证这 `8` 个真实 blocker。
3. 在引入任何平台级发布命令前，继续维持 `tenant:release:*` 与 `Tenant Release Rehearsal` 只服务 rehearsal，不拥有生产审批与回滚能力。
