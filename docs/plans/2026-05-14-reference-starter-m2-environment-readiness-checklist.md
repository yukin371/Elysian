# 2026-05-14 参考发行版 M2 环境前提锁定清单

更新时间：`2026-05-14`

## 目标

把当前 go-live 环境 blocker 从“缺信息”收成“有 owner、有输入、有执行路径”的待执行项。

## 范围

仅覆盖 `M2 环境前提锁定`。

### 纳入

- 锁定 `release environment`
- 锁定 `migration list`
- 锁定 `backup / restore` 证据
- 锁定 `release roles / oncall`
- 锁定 `proxy / TLS owner`
- 将以上事实映射到 `go-live:*` 输入

### 不纳入

- `M1` 仓库内复验
- `M3` 目标环境演练
- `M4` 放行结论
- 新发布平台能力、自动回滚、多机高可用

## 前提

- 只有在 `M1` 候选冻结通过后，才进入本清单。
- 本清单只收敛环境前提，不替环境 owner 虚构“已经部署完成”或“已经冒烟通过”。

## 默认 owner

- 发布负责人：`release tag / PR / environment`、值守与升级路径、停止上线决策权
- 环境 owner：secret 注入位置、proxy / TLS owner、容器启动路径、基础健康检查执行路径
- DBA：migration 列表、备份与恢复证据、数据库回滚路径

## 执行项

### 1. 锁定发布输入

发布负责人必须确认：

- `release tag` 或 `release PR`
- `release environment`
- 是否触及 tenant 主链路
- 发布窗口

映射字段：

- `ELYSIAN_GO_LIVE_RELEASE_TAG`
- `ELYSIAN_GO_LIVE_RELEASE_PR`
- `ELYSIAN_GO_LIVE_ENVIRONMENT`
- `ELYSIAN_GO_LIVE_TENANT_IMPACT`

### 2. 锁定 migration 与数据库回退路径

DBA / 环境 owner 必须确认：

- 本次 `migration list`
- 备份时间与备份编号
- 恢复点与恢复执行人
- 预计恢复时长
- 数据库回滚路径

映射字段：

- `ELYSIAN_GO_LIVE_MIGRATIONS`
- `ELYSIAN_GO_LIVE_BACKUP_READY`

配套记录：

- `docs/reference/07-database-backup-and-recovery-template.md`

### 3. 锁定发布角色与值守

发布负责人必须确认：

- 发布负责人
- 应用 owner
- 环境 owner
- DBA
- 首 30 分钟值守人
- 升级路径
- 谁能宣布停止上线
- 谁能协调前端 / server / 数据库回滚

映射字段：

- `ELYSIAN_GO_LIVE_RELEASE_ROLES_READY`

配套记录：

- `docs/reference/08-release-roles-and-oncall-template.md`

### 4. 锁定 proxy / TLS 与 secret 注入路径

环境 owner 必须确认：

- proxy owner
- TLS 证书 owner
- reload 路径
- 前端 API 域名注入位置
- `DATABASE_URL` / `ACCESS_TOKEN_SECRET` 等生产必需 secret 的注入位置

映射字段：

- `ELYSIAN_GO_LIVE_PROXY_TLS_OWNER_READY`

### 5. 生成交接包

在以上输入补齐后执行：

- `bun run go-live:report`
- 必要时 `bun run go-live:handoff`

目标：

- 生成预填 `.env`
- 生成按角色拆分的 handoff 包
- 让 blocker 按 owner 分组，不再人工二次摘字段

## 完成标准

- `go-live report` 的 `M2` 状态为 `passed`
- 所有环境类 blocker 都已映射到具体 owner
- 不再存在“待确认”“后续补齐”式阶段结论
- 进入 `M3` 所需的环境输入已齐备

## 阻断项

### release-input

- `release tag / PR` 未锁定
- `release environment` 未锁定
- `migration list` 未锁定

默认 owner：

- 发布负责人
- DBA / 环境 owner

### environment

- `backup / restore` 证据缺失
- `proxy / TLS owner` 未锁定
- secret 注入位置未锁定
- 值守与升级路径未锁定

默认 owner：

- 环境 owner
- DBA
- 发布负责人

### out-of-scope

- 目标环境尚未执行真实部署
- 发布后最小冒烟尚未开始
- React / uniapp / Studio / 复杂 BPM 等并行研发项

## 产物

- `docs/plans/2026-05-06-go-live-preparation-packet.md`
- `artifacts/go-live/go-live-report.json`
- `artifacts/go-live/go-live-handoff-report.json`
- `artifacts/go-live/go-live-input.prefill.env`
- `artifacts/go-live/handoffs/`

## 推荐顺序

1. 发布负责人先锁定 `release tag / PR / environment / tenant impact`
2. DBA / 环境 owner 再锁定 `migration / backup / restore`
3. 发布负责人补齐 `roles / oncall / stop decision`
4. 环境 owner 锁定 `proxy / TLS / secret 注入`
5. 最后执行 `go-live:report` 与 `go-live:handoff`

## 完成记录模板

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```
