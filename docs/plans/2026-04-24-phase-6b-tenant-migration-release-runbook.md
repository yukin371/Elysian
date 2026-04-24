# 2026-04-24 Phase 6B Tenant Migration Release Runbook

## 目的

为当前 `Phase 6B` 的多租户能力提供一份可执行的迁移 / 发布手册，统一以下口径：

- 何时允许把 tenant 相关改动从阶段实现推进到发布准备
- 数据库迁移、默认租户基线与非默认租户初始化的执行顺序
- 发布前后最小验证点
- 失败时的停机、回退与重新观察路径

## 当前适用前提

本手册只反映仓库当前真实状态，不假设尚未落地的生产平台能力：

- 仓库已有标准分支发布流转，见 [07-release-workflow.md](../07-release-workflow.md)
- 多租户长期边界已固定在 [ADR-0009](../decisions/ADR-0009-tenant-upgrade-and-validation-strategy.md)
- 已有 tenant 升级执行评审手册，见 [2026-04-24-phase-6b-tenant-upgrade-runbook.md](./2026-04-24-phase-6b-tenant-upgrade-runbook.md)
- 生产部署平台、自动化回滚平台、云数据库快照编排当前仍为 `TBD`

因此，本手册只定义“当前人工可执行的发布顺序与门槛”，不虚构平台命令。

为减少发布演练时的人工拼装，仓库当前已提供一组“执行层自动化”脚本入口：

- `tenant:release:report`
- `tenant:release:gate`
- `tenant:release:finalize`

这些入口当前只表示“把既有 runbook 步骤收敛为 rehearsal report / gate / finalize 三段式入口”的执行层自动化；它们不表示仓库已存在生产平台发布脚本，也不改变既有 owner 边界。

当前仓库还额外提供一个仅用于演练的 GitHub 手动入口：

- `.github/workflows/tenant-release-rehearsal.yml`

该 workflow 只负责：

- 从 GitHub 下载既有 tenant artifact 并生成最新 evidence / decision
- 把人工确认项映射为 `ELYSIAN_TENANT_RELEASE_*` 输入
- 执行 `tenant:release:finalize` 并归档 rehearsal 产物

该 workflow 明确不表示生产发布平台或自动回滚平台已落地。

## 适用范围

适用于触及以下任一项且准备进入 `dev -> main` 发布评审的改动：

- `tenant_id` schema / migration
- PostgreSQL RLS policy
- tenant context SQL
- `db:seed` / `tenant:init`
- 租户感知写路径
- super-admin 跨租户管理边界
- tenant 管理接口与权限模型

## 非目标

- 不定义云厂商、容器平台或 Helm 级别的部署细节
- 不把 `db:seed` 扩写成“生产环境通用修复命令”
- 不提供历史单租户数据批量回填脚本
- 不新增新的 package owner、脚本 owner 或第二套 tenant 发布策略

## 发布前提

进入本手册前，应先满足以下条件：

1. 已通过 tenant 升级执行评审：
   - `candidate_for_next_step`
   - 观察窗口 `5/5`
   - `systemicBlockerDetected=false`
2. 若当前待发布 head 与观察窗口 head 不一致：
   - 必须对新 head 重建 `5/5` 观察窗口
3. 最小验证通过：
   - `bun run check`
   - `bun run build:vue`
   - `bun run e2e:tenant:full`
4. 文档已同步：
   - roadmap
   - 阶段计划
   - 相关 runbook
5. 若使用 release rehearsal 自动化脚本辅助演练：
   - 只能把 `tenant:release:report` / `tenant:release:gate` / `tenant:release:finalize` 视为本手册步骤的执行层映射
   - 不得把这些脚本解释为生产平台发布命令

## 发布输入

发布评审时至少锁定以下输入：

- 待发布 commit / PR
- `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
- `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`
- 当前租户相关 migrations 列表
- 本次是否包含：
  - 默认租户基线初始化
  - 新增非默认租户初始化
  - 仅代码 / 配置升级

### 目标环境输入契约

若使用 `tenant:release:report` / `tenant:release:finalize` 做演练收尾，以下输入必须先被人工确认，再映射到环境变量；脚本只负责归档与门禁，不负责替代人工审批。

| 输入项 | 环境变量 / 元数据 | 要求 | 典型来源 |
|---|---|---|---|
| 发布源分支 | `ELYSIAN_TENANT_RELEASE_SOURCE_BRANCH` | 当前基线应为 `dev` | PR / 分支流转记录 |
| 发布目标分支 | `ELYSIAN_TENANT_RELEASE_TARGET_BRANCH` | 当前基线应为 `main` | PR / 分支流转记录 |
| 目标环境标识 | `ELYSIAN_TENANT_RELEASE_ENVIRONMENT` | 必须是本次演练/发布实际目标 | 环境命名约定 |
| 发布 commit | `ELYSIAN_TENANT_RELEASE_COMMIT` | 建议固定到单一 commit SHA | PR head / merge commit |
| 发布 PR | `ELYSIAN_TENANT_RELEASE_PR` | 建议记录 PR 编号 | GitHub PR |
| migration 列表 | `ELYSIAN_TENANT_RELEASE_MIGRATIONS` | 逗号分隔；只列本次实际涉及 migration | `drizzle/*.sql` / 变更清单 |
| 非默认租户初始化列表 | `ELYSIAN_TENANT_RELEASE_TENANT_INIT_CODES` | 逗号分隔；无则留空 | 租户开通计划 |
| 是否需默认租户 seed | `ELYSIAN_TENANT_RELEASE_DEFAULT_SEED_REQUIRED` | `true/false`；只在新环境首发为 `true` | 环境类型判断 |
| 待发布 head 与观察窗口 head 是否一致 | `ELYSIAN_TENANT_RELEASE_HEAD_MATCHES_WINDOW` | `true/false` | evidence / decision 对照 |
| 文档是否同步 | `ELYSIAN_TENANT_RELEASE_DOCS_SYNCED` | `true/false` | 文档审查 |
| 回滚是否已准备 | `ELYSIAN_TENANT_RELEASE_ROLLBACK_PREPARED` | `true/false` | 发布评审结论 |
| 数据库角色是否确认 | `ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED` | `true/false`；需满足 `NOSUPERUSER + NOBYPASSRLS` | DBA / 环境配置确认 |
| 备份是否就绪 | `ELYSIAN_TENANT_RELEASE_BACKUP_READY` | `true/false` | DBA / 平台方确认 |
| `bun run check` 是否通过 | `ELYSIAN_TENANT_RELEASE_CHECK_PASSED` | `true/false` | 本地 / CI 记录 |
| `bun run build:vue` 是否通过 | `ELYSIAN_TENANT_RELEASE_BUILD_VUE_PASSED` | `true/false` | 本地 / CI 记录 |
| `bun run e2e:tenant:full` 是否通过 | `ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED` | `true/false` | 本地 / CI 记录 |
| 默认租户登录验证 | `ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED` | `true/false` | 发布后人工验证 |
| super-admin 访问 `/system/tenants` 验证 | `ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED` | `true/false` | 发布后人工验证 |
| tenant admin 禁止访问 `/system/tenants` 验证 | `ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED` | `true/false` | 发布后人工验证 |
| 非默认租户登录验证 | `ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED` | `true/false` | 发布后人工验证 |
| 跨租户隔离验证 | `ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED` | `true/false` | 发布后人工验证 |

说明：

- 若没有人工确认来源，不应先把变量填成 `true` 再补证据。
- 若目标环境输入缺失，优先阻断发布演练，而不是放宽 gate。
- `tenant-release-report.ts` 会把这些输入沉淀到 `tenant-release-report.json`，后续评审应以该报告为准，而不是口头确认。

### 最小演练示例

以下命令只表示“把本手册中的人工确认结果喂给 rehearsal 脚本”，不代表生产平台发布入口：

```powershell
$env:ELYSIAN_TENANT_RELEASE_SOURCE_BRANCH='dev'
$env:ELYSIAN_TENANT_RELEASE_TARGET_BRANCH='main'
$env:ELYSIAN_TENANT_RELEASE_ENVIRONMENT='staging-rehearsal'
$env:ELYSIAN_TENANT_RELEASE_COMMIT='<commit-sha>'
$env:ELYSIAN_TENANT_RELEASE_PR='PR-3'
$env:ELYSIAN_TENANT_RELEASE_MIGRATIONS='0008_tenants.sql,0009_tenant_id_columns.sql,0010_rls_policies.sql'
$env:ELYSIAN_TENANT_RELEASE_TENANT_INIT_CODES='tenant-alpha'
$env:ELYSIAN_TENANT_RELEASE_DEFAULT_SEED_REQUIRED='false'
$env:ELYSIAN_TENANT_RELEASE_HEAD_MATCHES_WINDOW='true'
$env:ELYSIAN_TENANT_RELEASE_DOCS_SYNCED='true'
$env:ELYSIAN_TENANT_RELEASE_ROLLBACK_PREPARED='true'
$env:ELYSIAN_TENANT_RELEASE_DATABASE_ROLE_CONFIRMED='true'
$env:ELYSIAN_TENANT_RELEASE_BACKUP_READY='true'
$env:ELYSIAN_TENANT_RELEASE_CHECK_PASSED='true'
$env:ELYSIAN_TENANT_RELEASE_BUILD_VUE_PASSED='true'
$env:ELYSIAN_TENANT_RELEASE_TENANT_FULL_PASSED='true'
$env:ELYSIAN_TENANT_RELEASE_DEFAULT_TENANT_LOGIN_VERIFIED='true'
$env:ELYSIAN_TENANT_RELEASE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED='true'
$env:ELYSIAN_TENANT_RELEASE_TENANT_ADMIN_DENIED_VERIFIED='true'
$env:ELYSIAN_TENANT_RELEASE_NON_DEFAULT_TENANT_LOGIN_VERIFIED='true'
$env:ELYSIAN_TENANT_RELEASE_CROSS_TENANT_ISOLATION_VERIFIED='true'
bun run tenant:release:finalize
```

执行前提：

- 必须先完成本手册中的人工检查与发布后验证。
- 若只是预演发布前门禁，也可以先执行 `tenant:release:report`，待发布后验证补齐后再执行 `tenant:release:gate` / `finalize`。

### GitHub 手动演练入口

若不想手工拼装环境变量，可使用：

- GitHub Actions: `Tenant Release Rehearsal`

使用约束：

- 该 workflow 只用于 rehearsal，不用于真实生产发布。
- `evidence_branch` / `evidence_limit` / `evidence_scan_limit` 只控制 artifact 收集与 evidence 生成。
- 为避免超过 GitHub `workflow_dispatch` 的输入上限，该 workflow 固定使用 `ci.yml`、`push,workflow_dispatch` 与窗口大小 `5` 作为 evidence 默认值，不再对这三项开放表单输入。
- 该 workflow 会在 checkout 后立即捕获一次 git worktree 基线，避免后续 `.ci-reports` 或依赖安装副作用污染 `gitWorktreeClean` 判定。
- 其余布尔输入本质上仍是人工确认项，只是从 shell env 改为 GitHub 表单输入，不改变责任归属。
- 若环境 owner、DBA owner 或发布负责人尚未完成确认，不应把对应输入改成 `true`。

### GitHub 手动演练速用步骤

值班时可按下面顺序执行：

1. 打开 GitHub Actions `Tenant Release Rehearsal`
2. 保持 evidence 默认值：
   - `evidence_branch=dev`
   - `evidence_limit=5`
   - `evidence_scan_limit=15`
3. 填写发布元数据：
   - `source_branch=dev`
   - `target_branch=main`
   - `release_environment=<本次演练环境>`
   - `release_commit=<待演练 commit>`
   - `release_pr=<PR 编号>`
   - `release_migrations=<逗号分隔的 migration 列表>`
4. 只把已人工确认的布尔项改成 `true`
   - 最小保守失败演练通常只勾：
     - `head_matches_window`
     - `docs_synced`
     - `rollback_prepared`
     - `check_passed`
     - `build_vue_passed`
   - 数据库角色、备份、`tenant_full_passed` 与发布后最小验证五项，未确认前保持 `false`
5. 运行后按结果判读：
   - 若 workflow 只在最后 `Fail when rehearsal gate is blocked` 失败，说明结构链路正常，失败来自 gate blocker
   - 进入 artifact `tenant-release-rehearsal-report`，查看 `release/tenant-release-report.json` 与 `release/tenant-release-gate-report.json`
6. 归档时至少记录：
   - workflow run id
   - artifact 名称
   - blocker 数
   - blocker 是否只剩真实人工前提项

当前参考样例：

- 结构已验证的真实 run：`24894806843`
- 该 run 的结论：`gitWorktreeClean=true`，最终仅剩 `8` 个目标环境确认与发布后验证 blocker

## 执行顺序

### 1. 冻结发布范围

- 仅允许包含本次多租户发布目标所需改动
- 不混入无关重构、无关 schema 调整或权限模型漂移
- 若发现 tenant 相关高风险改动仍在 `dev` 持续变化，先停止发布评审

### 2. 明确环境类型

按环境区分执行路径：

- 新环境首发：
  - 允许执行默认租户基线初始化
- 已有环境升级：
  - 默认按“迁移 + 应用升级 + 必要的非默认租户 additive bootstrap”处理
  - 不把 `db:seed` 当成常规升级命令

### 3. 数据库与运行时前置检查

发布前人工确认：

- `DATABASE_URL` 指向目标环境且与本次发布环境一致
- 应用运行时数据库角色符合 `ADR-0009`：
  - `NOSUPERUSER`
  - `NOBYPASSRLS`
- 关键 secret 已就绪：
  - `ACCESS_TOKEN_SECRET`
  - 租户管理与初始化所需环境变量
- 已具备数据库快照、备份或等价回退手段

若以上任一项不成立，停止发布。

### 4. 执行数据库迁移

先执行：

```bash
bun run db:migrate
```

要求：

- migration 只执行一次
- 先迁移，再放量应用实例
- 若 migration 失败，不继续做 tenant bootstrap 或应用切换

### 5. 处理默认租户与非默认租户

#### 新环境首发

只在“全新环境需要平台基线数据”时执行：

```bash
bun run db:seed
```

约束：

- `db:seed` 负责默认租户基线，不替代 `tenant:init`
- 若环境不是全新环境，不应把 `db:seed` 当作升级修复动作直接执行

#### 新增非默认租户

按租户逐个执行 additive bootstrap：

```bash
bun run tenant:init -- --code <tenant-code> --name <tenant-name> --admin-password <password>
```

约束：

- `tenant:init` 只用于非默认租户
- tenant bootstrap 必须保持幂等
- 不批量并发执行多个 tenant bootstrap，先逐个完成并确认结果

### 6. 切换应用版本

数据库迁移完成后，再切换应用版本或实例。

当前仓库未固定生产平台，因此这里仅保留顺序约束：

1. 先保证新版本应用使用与迁移后 schema 匹配的构建
2. 再扩大流量或完成人工切换
3. 若应用切换失败，不继续做新的 tenant bootstrap

### 7. 发布后最小验证

至少完成以下验证：

- 默认租户登录可用
- super-admin 可访问 `/system/tenants`
- tenant admin 不可管理 `/system/tenants`
- 至少一个非默认 tenant 的 tenant admin 登录可用
- 至少一个真实业务实体的跨租户隔离仍成立

建议验证顺序：

1. 先做默认租户与 super-admin 验证
2. 再做非默认 tenant 登录验证
3. 最后做跨租户实体隔离验证

### 8. 发布结论归档

发布完成后，至少记录：

- 发布 commit / PR
- 执行的 migration
- 是否执行 `db:seed`
- 是否执行 `tenant:init`
- 发布后验证结果
- 风险、未验证区域、回滚路径

若本次同时做了 release rehearsal 演练，还应附带记录：

- 使用的执行入口（`tenant:release:report`、`tenant:release:gate`、`tenant:release:finalize`）
- 每一步映射到本手册的哪一段人工检查
- 是否仍存在需要人工确认的平台级空白

## 责任边界

### 角色与责任矩阵

| 事项 | owner / 责任方 | 说明 |
|---|---|---|
| migration 内容正确性 | `packages/persistence` owner | 确认 schema / RLS / seed / tenant:init 语义 |
| server 鉴权与租户边界正确性 | `apps/server` owner | 确认 JWT `tid`、tenant context、super-admin 边界 |
| 文档与 runbook 同步 | 文档 owner / 当前实施 owner | 确认 roadmap、plans、runbook 口径一致 |
| 目标环境数据库角色确认 | 环境 / DBA owner | 确认 `NOSUPERUSER + NOBYPASSRLS` |
| 目标环境备份与恢复能力 | 环境 / DBA owner | 提供快照、恢复点或等价能力 |
| 发布执行审批 | 发布负责人 | 决定是否进入 `dev -> main` |
| 发布后最小验证执行 | 发布负责人 + 模块 owner | 完成登录、权限、隔离验证 |
| 回滚执行 | 发布负责人协调，环境 / DBA owner 执行数据库恢复，模块 owner 提供技术判断 | 当前仓库未把回滚自动化平台化，因此必须保留人工协调责任 |

责任约束：

- `tenant:release:*` 不拥有审批权，也不拥有数据库恢复权。
- rehearsal 脚本只能输出“当前输入是否满足本手册门槛”，不能代替 owner 对环境真实性背书。
- 若数据库恢复、环境切换或发布审批 owner 未明确，发布演练应直接阻断。

### Rehearsal 命令边界

| 命令 | 当前角色 | 明确不做 |
|---|---|---|
| `bun run tenant:release:report` | 读取 evidence + 手工确认输入，生成 rehearsal 报告 | 不执行 `db:migrate`，不切换应用版本，不做数据库备份 |
| `bun run tenant:release:gate` | 基于 rehearsal 报告做门禁判定 | 不替代人工审批，不直接放行生产发布 |
| `bun run tenant:release:finalize` | 串联 report + gate，收尾本次演练 | 不代表一键生产发布，不拥有回滚能力 |

与未来平台级命令的关系：

- 未来若引入真实发布平台命令，应另行定义 owner、审批点、失败分类与回滚入口。
- 届时可以复用本 runbook 的输入/门禁语义，但不能直接把 `tenant:release:*` 重命名为生产命令后继续使用。
- 若生产平台命令落地，需同步 `07-release-workflow.md`、`PROJECT_PROFILE.md`，必要时补 ADR。

## 回滚路径

### 场景 1：迁移前发现问题

- 停止发布
- 不执行 `db:migrate`
- 修复后重新走发布评审

### 场景 2：迁移失败

- 停止应用切换
- 不执行 `db:seed` / `tenant:init`
- 使用目标环境既有数据库恢复能力回退
- 修复 migration 后重新发布

### 场景 3：迁移成功，但应用切换失败

- 先停止继续放量
- 回退应用版本到上一个已验证版本
- 若 schema 已不兼容旧应用，必须优先走数据库恢复路径，而不是强行保留旧应用

### 场景 4：`tenant:init` 后发现租户级问题

- 停止继续创建新的 tenant
- 优先把受影响 tenant 标记为不可用或暂停开放
- 若问题影响已创建 tenant 的基础数据一致性，使用数据库恢复能力回退

## 禁止事项

- 禁止把 `db:seed` 用作现网常规修复命令
- 禁止把默认租户交给 `tenant:init`
- 禁止在未完成 `5/5` 观察窗口时直接宣告 tenant 改动“可发布”
- 禁止在 schema 已变更但应用尚未切换时继续执行新的 tenant bootstrap
- 禁止把 superuser / bypassrls 测试结果当成真实发布依据

## 后续待补

- 为 `tenant:release:report`、`tenant:release:gate`、`tenant:release:finalize` 继续补 GitHub/manual release rehearsal 接线、目标环境输入与失败分类时，前提仍是生产平台边界先被确认
- 生产部署平台确定后的平台级命令与责任边界
- 历史单租户到多租户的数据迁移与回填策略
- 更高规模 tenant 样本、发布频率与灰度节奏
