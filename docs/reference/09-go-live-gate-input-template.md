# Go-live Gate 输入模板

更新时间：`2026-05-06`

本文档用于给 `go-live:*` 脚本提供统一输入来源，减少发布负责人、环境 owner 与 DBA 之间的口径漂移。

适用脚本：

- `bun run go-live:report`
- `bun run go-live:gate`
- `bun run go-live:finalize`

当前若按首发落地里程碑推进，配套参考：

- `docs/plans/2026-05-13-reference-starter-go-live-stage-plan.md`

## 使用规则

- 这份模板只收敛“已确认事实”，不替代真实发布动作。
- 不要把生产 secret 直接提交到仓库。
- `release tag / PR / environment / migration list / backup / roles / proxy owner / post-release smoke` 这几类字段，必须由对应 owner 显式填写。
- 若本次发布不触及 tenant 主链路，`ELYSIAN_GO_LIVE_TENANT_IMPACT=false`，tenant 附加验证项可保留 `false`。

## 环境前提与责任模板

以下前提若未锁定，应直接视为 go-live blocker，而不是继续靠口头说明推进：

| 前提项 | 需要锁定的事实 | 默认 owner |
|---|---|---|
| secrets | `DATABASE_URL`、`ACCESS_TOKEN_SECRET`、前端 API 域名、其他生产必需 secret 的注入位置与轮换 owner | 环境 owner / 应用 owner |
| backup / recovery | 备份时间、备份编号、恢复点、恢复执行人、预计恢复时长 | DBA / 环境 owner |
| proxy / TLS | 反向代理 owner、TLS 证书 owner、reload 路径 | 环境 owner |
| 发布值守 | 发布负责人、应用 owner、DBA / 环境 owner、首 30 分钟值守人与升级路径 | 发布负责人 |
| rollback decision | 谁能宣布停止上线、谁能协调前端 / server / 数据库回滚 | 发布负责人 / DBA / 环境 owner |

推荐配套填写：

- `docs/reference/07-database-backup-and-recovery-template.md`
- `docs/reference/08-release-roles-and-oncall-template.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`

## 字段分组

### 1. 发布元数据

| 变量 | 含义 | 默认 owner |
|---|---|---|
| `ELYSIAN_GO_LIVE_SOURCE_BRANCH` | 源分支 | 发布负责人 |
| `ELYSIAN_GO_LIVE_TARGET_BRANCH` | 目标分支 | 发布负责人 |
| `ELYSIAN_GO_LIVE_RELEASE_COMMIT` | 本次发布 commit | 发布负责人 |
| `ELYSIAN_GO_LIVE_RELEASE_TAG` | 本次 release tag | 发布负责人 |
| `ELYSIAN_GO_LIVE_RELEASE_PR` | 本次 release PR | 发布负责人 |
| `ELYSIAN_GO_LIVE_ENVIRONMENT` | 目标环境标识 | 发布负责人 / 环境 owner |
| `ELYSIAN_GO_LIVE_MIGRATIONS` | migration 列表，逗号分隔 | DBA / 环境 owner |
| `ELYSIAN_GO_LIVE_TENANT_IMPACT` | 是否触及 tenant 主链路 | 发布负责人 / 应用 owner |

### 2. 仓库内已验证项

| 变量 | 含义 | 默认 owner |
|---|---|---|
| `ELYSIAN_GO_LIVE_CHECK_PASSED` | `bun run check` 是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_BUILD_VUE_PASSED` | `bun run build:vue` 是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED` | `bun run e2e:smoke:full` 是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED` | `bun run server:image:verify` 是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_TENANT_FULL_PASSED` | `bun run e2e:tenant:full` 是否通过 | 应用 owner |

### 3. 环境/责任人前提项

| 变量 | 含义 | 默认 owner |
|---|---|---|
| `ELYSIAN_GO_LIVE_BACKUP_READY` | 备份/恢复证据是否齐备 | DBA / 环境 owner |
| `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY` | 发布角色与值守是否已锁定 | 发布负责人 |
| `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY` | proxy / TLS owner 是否明确 | 环境 owner |

### 4. 发布后最小冒烟

| 变量 | 含义 | 默认 owner |
|---|---|---|
| `ELYSIAN_GO_LIVE_HEALTH_VERIFIED` | `/health` 是否通过 | 应用 owner / 环境 owner |
| `ELYSIAN_GO_LIVE_METRICS_VERIFIED` | `/metrics` 是否通过 | 应用 owner / 环境 owner |
| `ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED` | 管理员登录是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED` | 菜单与权限 gate 是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED` | 核心工作区列表是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED` | 核心写操作是否通过 | 应用 owner |

### 5. Tenant 附加验证

仅当 `ELYSIAN_GO_LIVE_TENANT_IMPACT=true` 时要求：

| 变量 | 含义 | 默认 owner |
|---|---|---|
| `ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED` | super-admin 可访问 `/system/tenants` | 应用 owner |
| `ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED` | tenant admin 被禁止访问 `/system/tenants` | 应用 owner |
| `ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED` | 非默认 tenant 登录是否通过 | 应用 owner |
| `ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED` | 跨租户隔离是否通过 | 应用 owner |

## 可复制模板

以下是 `.env` 风格模板，可由发布负责人复制到临时文件，再映射为 shell env：

```text
ELYSIAN_GO_LIVE_SOURCE_BRANCH=dev
ELYSIAN_GO_LIVE_TARGET_BRANCH=main
ELYSIAN_GO_LIVE_RELEASE_COMMIT=
ELYSIAN_GO_LIVE_RELEASE_TAG=
ELYSIAN_GO_LIVE_RELEASE_PR=
ELYSIAN_GO_LIVE_ENVIRONMENT=
ELYSIAN_GO_LIVE_MIGRATIONS=
ELYSIAN_GO_LIVE_TENANT_IMPACT=

ELYSIAN_GO_LIVE_CHECK_PASSED=
ELYSIAN_GO_LIVE_BUILD_VUE_PASSED=
ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED=
ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED=
ELYSIAN_GO_LIVE_TENANT_FULL_PASSED=

ELYSIAN_GO_LIVE_BACKUP_READY=
ELYSIAN_GO_LIVE_RELEASE_ROLES_READY=
ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY=

ELYSIAN_GO_LIVE_HEALTH_VERIFIED=
ELYSIAN_GO_LIVE_METRICS_VERIFIED=
ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED=
ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED=
ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED=
ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED=

ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED=
ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED=
ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED=
ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED=
```

## 推荐填法

可优先由应用 owner 预填：

- `ELYSIAN_GO_LIVE_RELEASE_COMMIT`
- `ELYSIAN_GO_LIVE_CHECK_PASSED`
- `ELYSIAN_GO_LIVE_BUILD_VUE_PASSED`
- `ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED`
- `ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED`
- `ELYSIAN_GO_LIVE_TENANT_FULL_PASSED`

必须由环境 / 发布 owner 补齐：

- `ELYSIAN_GO_LIVE_RELEASE_TAG` 或 `ELYSIAN_GO_LIVE_RELEASE_PR`
- `ELYSIAN_GO_LIVE_ENVIRONMENT`
- `ELYSIAN_GO_LIVE_MIGRATIONS`
- `ELYSIAN_GO_LIVE_BACKUP_READY`
- `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY`
- `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY`
- 全部发布后最小冒烟变量

## 按角色拆分的快速填写清单

### 1. 发布负责人版

优先负责：

- `ELYSIAN_GO_LIVE_SOURCE_BRANCH`
- `ELYSIAN_GO_LIVE_TARGET_BRANCH`
- `ELYSIAN_GO_LIVE_RELEASE_COMMIT`
- `ELYSIAN_GO_LIVE_RELEASE_TAG` 或 `ELYSIAN_GO_LIVE_RELEASE_PR`
- `ELYSIAN_GO_LIVE_ENVIRONMENT`
- `ELYSIAN_GO_LIVE_TENANT_IMPACT`
- `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY`

填写前应同步核对：

- `docs/reference/08-release-roles-and-oncall-template.md`
- 发布窗口
- 执行人
- 值守与升级路径

交付口径：

- 若 `release tag / PR / environment / roles` 仍为空或 `false`，不要把 go-live blocker 甩给应用 owner 处理。

### 2. 环境 / DBA owner 版

优先负责：

- `ELYSIAN_GO_LIVE_MIGRATIONS`
- `ELYSIAN_GO_LIVE_BACKUP_READY`
- `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY`
- `ELYSIAN_GO_LIVE_HEALTH_VERIFIED`
- `ELYSIAN_GO_LIVE_METRICS_VERIFIED`

填写前应同步核对：

- `docs/reference/07-database-backup-and-recovery-template.md`
- 目标环境数据库备份记录
- proxy / TLS owner
- 发布后容器启动与基础健康检查结果

交付口径：

- 若 migration、backup、proxy owner 仍未锁定，不要把“环境未就绪”误写成“应用未通过”。

### 3. 应用 owner 版

优先负责：

- `ELYSIAN_GO_LIVE_CHECK_PASSED`
- `ELYSIAN_GO_LIVE_BUILD_VUE_PASSED`
- `ELYSIAN_GO_LIVE_SMOKE_FULL_PASSED`
- `ELYSIAN_GO_LIVE_SERVER_IMAGE_VERIFY_PASSED`
- `ELYSIAN_GO_LIVE_TENANT_FULL_PASSED`
- `ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED`
- `ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED`

若 `ELYSIAN_GO_LIVE_TENANT_IMPACT=true`，再补：

- `ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED`
- `ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED`
- `ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED`
- `ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED`

交付口径：

- 应用 owner 负责把“仓库内已验证事实”和“发布后功能冒烟结果”补齐，但不替环境 owner 虚构 backup / proxy / TLS 已就绪。

## 当前里程碑映射

`go-live:report` 当前默认把输入收敛到四个里程碑：

- `M1 候选冻结`：`release commit`、`release tag / PR`、`check`、`build:vue`、`e2e:smoke:full`、`server:image:verify`，以及按需的 `e2e:tenant:full`
- `M2 环境前提锁定`：`release environment`、`migration list`、`backup`、`roles / oncall`、`proxy / TLS owner`
- `M3 目标环境演练`：`/health`、`/metrics`、管理员登录、权限 gate、核心工作区列表与核心写操作，以及按需的 tenant 验证
- `M4 首发放行结论`：只有当前三层都通过才会进入 `passed`

若 `nextMilestone` 仍停在前一层，不要跳过前置 blocker 直接推进下一层动作。

同时，`go-live:report` 还会输出 `ownerHandoffs`：

- 按默认 owner 分组当前 blocker
- 给出每组 blocker 对应的 `envKeys`
- 供发布负责人直接分发给对应 owner，而不必手工再从模板里二次摘字段

## 当前推荐交接顺序

1. 发布负责人先补 `release tag / PR / environment / roles`。
2. 环境 / DBA owner 再补 `migration / backup / proxy / health / metrics`。
3. 应用 owner 最后补 `admin login / permission gate / workspace / write action`，以及按需的 tenant 附加验证。
4. 三方完成后执行 `bun run go-live:report` 与 `bun run go-live:gate`。

## 可直接转发的交接消息

### 1. 发给发布负责人

```text
请补齐这次 go-live 的发布负责人字段，填完后回传：

- ELYSIAN_GO_LIVE_RELEASE_TAG 或 ELYSIAN_GO_LIVE_RELEASE_PR
- ELYSIAN_GO_LIVE_ENVIRONMENT
- ELYSIAN_GO_LIVE_RELEASE_ROLES_READY

同时确认：
- docs/reference/08-release-roles-and-oncall-template.md 已填写
- 发布窗口、值守人与升级路径已锁定

当前建议填写块：

ELYSIAN_GO_LIVE_RELEASE_TAG=
ELYSIAN_GO_LIVE_RELEASE_PR=
ELYSIAN_GO_LIVE_ENVIRONMENT=
ELYSIAN_GO_LIVE_RELEASE_ROLES_READY=
```

### 2. 发给环境 / DBA owner

```text
请补齐这次 go-live 的环境 / DBA 字段，填完后回传：

- ELYSIAN_GO_LIVE_MIGRATIONS
- ELYSIAN_GO_LIVE_BACKUP_READY
- ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY
- ELYSIAN_GO_LIVE_HEALTH_VERIFIED
- ELYSIAN_GO_LIVE_METRICS_VERIFIED

同时确认：
- docs/reference/07-database-backup-and-recovery-template.md 已填写
- 目标环境 backup / restore 证据已锁定
- proxy / TLS owner 已明确

当前建议填写块：

ELYSIAN_GO_LIVE_MIGRATIONS=
ELYSIAN_GO_LIVE_BACKUP_READY=
ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY=
ELYSIAN_GO_LIVE_HEALTH_VERIFIED=
ELYSIAN_GO_LIVE_METRICS_VERIFIED=
```

### 3. 发给应用 owner

```text
请补齐这次 go-live 的应用验证字段，填完后回传：

- ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED
- ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED
- ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED
- ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED

若本次触及 tenant，再补：
- ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED
- ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED
- ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED
- ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED

当前建议填写块：

ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED=
ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED=
ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED=
ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED=

ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED=
ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED=
ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED=
ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED=
```

## 使用顺序

1. 先按本模板填值。
2. 运行 `bun run go-live:report`。
3. 按 blocker 补齐剩余环境事实。
4. 运行 `bun run go-live:gate`。
5. 若希望一键执行，使用 `bun run go-live:finalize`。

## Blocker 语义与停止条件映射

### 1. 发布输入 blocker

命中条件：

- `release tag / PR / environment / migration list` 任一为空

处理规则：

- 不得开始 migration
- 不得开始 server / frontend 切换
- 先回到发布负责人补齐输入

### 2. 环境前提 blocker

命中条件：

- `backup ready=false`
- `release roles ready=false`
- `proxy / tls owner ready=false`

处理规则：

- 不得开始正式上线
- 不要把这类问题误归类为“应用验证失败”

### 3. 发布后冒烟 blocker

命中条件：

- `/health`
- `/metrics`
- 管理员登录
- 菜单 / 权限 gate
- 核心工作区列表
- 核心写操作

任一项为 `false`

处理规则：

- 立即停止继续放量
- 由发布负责人判断是否进入回滚
- 先记录失败时间、失败项、当前环境版本、已执行动作

### 4. tenant 安全 blocker

命中条件：

- super-admin 租户访问失败
- tenant admin 越权成功
- 非默认 tenant 无法登录
- 跨租户隔离异常

处理规则：

- 直接按高优先级 blocker 处理
- 默认进入“停止继续上线 + 评估回滚”路径

## 回滚边界

- 应用 owner：提供 server / frontend 可回退版本信息
- DBA / 环境 owner：负责数据库恢复与恢复后验证
- 发布负责人：宣布停止、协调回滚、归档结论

最少归档项：

- 停止时间
- blocker 类别
- 触发条件
- 已执行回滚动作
- 未恢复项
- 后续 owner
