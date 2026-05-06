# 发布 / 上线检查清单

更新时间：`2026-05-06`

用于两类场景：

1. `dev -> main` 合并前的仓库发布检查
2. 首次或阶段性正式上线前的环境 / 发布 / 回滚检查

目标是降低两类风险：

- “功能做完但仓库还不适合进入 `main`”
- “代码能合进 `main`，但仍不具备正式上线条件”

---

## A. 仓库发布清单（`dev -> main`）

适用场景：

- 日常阶段发布
- 里程碑版本从 `dev` 合并进入 `main`
- 不一定立刻触发真实生产上线

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
- [ ] 若改动涉及 server 生产交付面，已执行 `bun run server:image:verify` 或等价镜像构建 + 容器烟测

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

## B. 正式上线附加清单（`go-live`）

若要把正式上线检查从“人工清单”收敛成“可执行报告”，可追加：

- `bun run go-live:report`
- `bun run go-live:gate`
- 或一键执行 `bun run go-live:finalize`

当前脚本只收敛当前准备包里已经明确的 blocker，不代替环境 owner 实际执行备份、迁移、代理切换和值守。

### B.1 Go-live 输入映射

若使用 `go-live:*` 脚本，至少确认以下输入已被人工审核后再映射为环境变量：

推荐先参照：

- `docs/reference/09-go-live-gate-input-template.md`

| 检查项 | 对应变量 |
|---|---|
| 源/目标分支 | `ELYSIAN_GO_LIVE_SOURCE_BRANCH` / `ELYSIAN_GO_LIVE_TARGET_BRANCH` |
| release commit / tag / PR / environment | `ELYSIAN_GO_LIVE_RELEASE_COMMIT` / `ELYSIAN_GO_LIVE_RELEASE_TAG` / `ELYSIAN_GO_LIVE_RELEASE_PR` / `ELYSIAN_GO_LIVE_ENVIRONMENT` |
| migration list / tenant impact | `ELYSIAN_GO_LIVE_MIGRATIONS` / `ELYSIAN_GO_LIVE_TENANT_IMPACT` |
| 基础验证命令结果 | `ELYSIAN_GO_LIVE_CHECK_PASSED` / `ELYSIAN_GO_LIVE_BUILD_VUE_PASSED` / `ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED` / `ELYSIAN_GO_LIVE_TENANT_FULL_PASSED` |
| 备份、角色、代理 owner | `ELYSIAN_GO_LIVE_BACKUP_READY` / `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY` / `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY` |
| 发布后最小冒烟结果 | `ELYSIAN_GO_LIVE_HEALTH_VERIFIED` / `ELYSIAN_GO_LIVE_METRICS_VERIFIED` / `ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED` / `ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED` / `ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED` / `ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED` |
| tenant 附加验证结果 | `ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED` / `ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED` / `ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED` / `ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED` |

### B.2 当前脚本结论边界

- `go-live:report`：生成当前 blocker 列表与建议动作
- `go-live:gate`：根据 report 输出放行 / 阻断结论
- `go-live:finalize`：串联 report -> gate
- 这套脚本不会替用户“自动确认环境已就绪”，只会把已填入的事实汇总成一致结论

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

---

## C. 正式上线人工清单（go-live）

适用场景：

- 首次正式上线
- 把 `main` 对接到真实生产环境
- 对外承诺可用性、需要可回滚和可观测的版本切换

说明：

- 本节是对 “A. 仓库发布清单” 的追加，不替代前面的基础检查
- 若 `A` 未完成，不应进入本节
- 若只是内部联调、测试环境或 rehearsal，可按需裁剪，但要显式记录裁剪项

## 8. 上线范围与冻结

- [ ] 已锁定上线 commit / tag / PR
- [ ] 已锁定上线窗口、目标环境和执行人
- [ ] 已明确本次上线包含的模块、接口、迁移和配置项
- [ ] 已确认本次不上线的能力范围，并避免误带入
- [ ] 上线窗口内已冻结高风险并行改动

## 9. 构建产物与部署输入

- [ ] 已明确 server 的正式构建 / 启动方式，而不是只依赖本地 `dev:server`
- [ ] 已明确前端产物构建方式，并确认本次使用的 `build:vue` 产物来源
- [ ] 已明确镜像、压缩包或等价部署产物的生成位置与版本标识
- [ ] 已明确环境变量清单、默认值策略和缺失时的失败方式
- [ ] 已确认 `.env.example`、部署脚本或平台配置没有把开发环境默认值误带入生产

## 10. 环境与密钥

- [ ] 已确认 `DATABASE_URL`、`ACCESS_TOKEN_SECRET` 与其他必需密钥已在目标环境注入
- [ ] 已确认生产环境 CORS 白名单已收敛到明确域名，不使用宽松 `*`
- [ ] 已确认生产环境限流参数已按真实流量目标设置，而非沿用纯开发值
- [ ] 已确认默认管理员密码、测试账号或临时演示入口不会暴露到生产
- [ ] 已明确密钥 owner、轮换方式和泄漏后的处置路径

## 11. 数据库与迁移

- [ ] 已锁定本次 migration 列表
- [ ] 已确认 `bun run db:migrate` 对应的 SQL 已审阅并可在目标环境执行
- [ ] 已确认是否需要 `db:seed`，并明确 seed 是否只允许初始化而不能覆盖生产数据
- [ ] 已完成数据库备份、快照或等价恢复点准备
- [ ] 已明确 migration 失败、部分成功或数据校验失败时的回退路径

### 11.1 Tenant / 隔离附加项

仅当本次上线触及多租户能力时启用：

- [ ] 已完成 tenant rehearsal 证据归档
- [ ] 已确认目标环境数据库角色满足 `NOSUPERUSER + NOBYPASSRLS`
- [ ] 已确认至少一个非默认 tenant 的初始化、登录和关键业务验证路径
- [ ] 已确认跨租户隔离验证的业务样本与执行人

## 12. 运行前验证

- [ ] 已在上线前的最终待发布版本上重新执行 `bun run check`
- [ ] 已在待发布版本上重新执行 `bun run build:vue`
- [ ] 已审阅构建输出警告（例如 chunk size warning），并确认是否影响上线决策
- [ ] 若本次触及多租户主链路，已重新执行 `bun run e2e:tenant:full` 或等价目标环境演练
- [ ] 若本次触及 generator 主链路，已确认 preview / report / apply 边界与本次发布范围一致
- [ ] 已确认本次上线不依赖仍为 `TBD` 的生产发布前提

## 13. 观测、告警与排障入口

- [ ] 已确认 `/health` 与 `/metrics` 在目标环境可访问或可采集
- [ ] 已确认 `/metrics/prometheus` 已接入或至少已预留采集路径
- [ ] 已明确日志查看入口、错误追踪入口和关键指标查看入口
- [ ] 已明确上线后前 30 分钟需要盯的核心信号
- [ ] 已明确告警通知渠道、值班人和升级路径

建议至少观察：

- 登录成功率 / 401 / 403 异常波动
- 5xx 数量
- 数据库连接异常
- migration 执行结果
- 关键模块首次访问是否成功

## 14. 上线后最小冒烟

- [ ] 首页或登录入口可访问
- [ ] 管理员可登录并完成一次会话恢复 / 刷新
- [ ] 菜单与权限 gate 符合预期
- [ ] 至少一个核心工作区完成列表读取
- [ ] 至少一个核心写操作闭环成功
- [ ] 至少一个审计 / 日志 / 指标信号已确认产生

建议最小样本：

- `auth`：登录、刷新、退出
- `customer` 或当前主业务模块：列表、创建、更新
- `tenant`：仅在 super-admin 范围验证，并确认 tenant admin 受限
- `file` / `notification` / `workflow`：按本次发布触及范围选做

## 15. 回滚与人工兜底

- [ ] 已明确本次上线的停止条件
- [ ] 已明确回滚负责人、执行命令或平台操作路径
- [ ] 已明确前端回滚、server 回滚、数据库回滚是否独立
- [ ] 已明确“只能前滚不能回滚”的场景，并提前获得批准
- [ ] 已准备上线后异常时的人工降级或临时封禁策略

## 16. 上线证据归档

- [ ] 已归档最终上线 commit / tag / PR 链接
- [ ] 已归档验证命令结果
- [ ] 已归档 migration / backup / rollback 说明
- [ ] 已归档上线后最小冒烟结果
- [ ] 已归档未验证区域、已知风险和后续补验计划

建议附上：

- 数据库备份与恢复责任模板
- 发布角色与值守模板
- 当前轮次 `go-live` 准备包

---

## 当前仓库首次正式上线前的额外必答项

根据当前仓库状态，以下问题在第一次真实生产上线前必须明确回答：

1. `apps/server` 的正式 build / packaging / process manager 方案是什么？
2. 生产环境部署方式是什么？
   是单机、容器、还是平台托管；当前仓库已有 `docker compose` 本地基线，但这不等于正式生产发布方案。
3. 数据库备份恢复由谁执行，恢复点目标是什么？
4. `/metrics` 和 `/metrics/prometheus` 接入到哪套监控系统？
5. 首次上线后由谁负责前 30 分钟和首日值守？
6. generator 当前哪些能力允许进入正式主工程，哪些仍停留在 staging / preview / rehearsal 边界？

若这 6 个问题答不清，建议继续视为“可发布工程 alpha / 内测 beta”，而不是正式上线版本。
