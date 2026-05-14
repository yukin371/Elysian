# 2026-05-14 参考发行版 M3 目标环境演练清单

更新时间：`2026-05-14`

## 目标

在真实目标环境完成一次从发布输入到发布后最小冒烟的完整演练，并把停止条件与回滚路径记录为可归档证据。

## 范围

仅覆盖 `M3 目标环境演练`。

### 纳入

- 部署前准备
- 数据库备份与 migration
- server / frontend 切换
- 发布后最小冒烟
- 停止条件、回滚记录与演练结论

### 不纳入

- `M1` 候选冻结
- `M2` 环境前提锁定
- `M4` 最终放行结论
- 自动化发布平台、多机发布编排、自动回滚

## 前提

- 仅在 `M2` 已通过后进入本清单。
- 本清单执行的是“真实目标环境演练”，不是仓库内命令复验。
- 若 `release tag / PR / environment / migration list / backup / roles / proxy` 任一项未锁定，停止进入本清单。

## 默认 owner

- 发布负责人：宣布开始、停止、回滚，协调执行顺序，归档结论
- 环境 owner：server / frontend 发布、proxy reload、`/health` 与 `/metrics` 可达性
- DBA：备份、migration、数据库恢复
- 应用 owner：管理员登录、权限 gate、核心工作区与核心写操作验证

## 执行项

### 1. 部署前准备

必须确认：

- 已拉取本次锁定的 `release commit` 或 `release tag`
- 构建机 / 发布主机已切到目标版本
- 不混入未锁定提交

建议命令基线：

```bash
cd /srv/elysian
git fetch --all --tags
git checkout <release-commit-or-tag>
bun install --frozen-lockfile
```

### 2. 构建 server 镜像与前端产物

执行：

- `bun run server:image:build`
- 条件允许时执行 `bun run server:image:smoke`
- `bun run build:vue`
- 将 `apps/example-vue/dist/` 同步到目标静态目录

要求：

- 使用本次锁定的镜像 / 产物版本
- 若镜像源不可达，归类为环境问题，不误判为应用问题

### 3. 数据库备份与 migration

必须确认：

- 备份时间
- 备份编号
- 恢复点
- 恢复执行人
- 当前 migration 步骤

执行：

- 先完成数据库备份
- 再执行 `bun run db:migrate`

规则：

- migration 独立执行，不内嵌到 server startup
- migration 失败后立即停止上线，并按恢复点回退

### 4. 发布 server 与 frontend

server 最小替换示例：

```bash
docker rm -f elysian-server || true
docker run -d \
  --name elysian-server \
  --restart unless-stopped \
  --env-file /etc/elysian/server.env \
  -p 3000:3000 \
  elysian-server:local
```

frontend 最小切换方式：

- 同步静态产物到目标目录
- 由环境 owner reload 反向代理

要求：

- 不混入未锁定版本
- 若发布失败，立即进入停止条件判断

### 5. 发布后最小冒烟

必须确认：

- `GET /health`
- `GET /metrics`
- 管理员登录成功
- 菜单与权限 gate 正常
- 至少一个核心工作区列表读取成功
- 至少一个核心写操作成功

若本次触及 tenant，再补：

- super-admin 可访问 `/system/tenants`
- tenant admin 不可访问 `/system/tenants`
- 至少一个非默认 tenant 登录成功
- 至少一个真实业务实体跨租户隔离仍成立

映射字段：

- `ELYSIAN_GO_LIVE_HEALTH_VERIFIED`
- `ELYSIAN_GO_LIVE_METRICS_VERIFIED`
- `ELYSIAN_GO_LIVE_ADMIN_LOGIN_VERIFIED`
- `ELYSIAN_GO_LIVE_MENU_PERMISSION_GATE_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WORKSPACE_LIST_VERIFIED`
- `ELYSIAN_GO_LIVE_CORE_WRITE_ACTION_VERIFIED`

tenant 附加字段：

- `ELYSIAN_GO_LIVE_SUPER_ADMIN_TENANT_ACCESS_VERIFIED`
- `ELYSIAN_GO_LIVE_TENANT_ADMIN_DENIED_VERIFIED`
- `ELYSIAN_GO_LIVE_NON_DEFAULT_TENANT_LOGIN_VERIFIED`
- `ELYSIAN_GO_LIVE_CROSS_TENANT_ISOLATION_VERIFIED`

### 6. 生成演练结论

完成冒烟后执行：

- `bun run go-live:report`
- `bun run go-live:gate`

必须归档：

- 当前演练是否通过
- 当前 blocker 类别
- 是否进入回滚
- 当前轮次准备包 / 演练记录位置

## 完成标准

- `go-live report` 的 `M3` 状态为 `passed`
- `bun run go-live:gate` 返回通过
- 最小冒烟全部通过
- 停止条件与回滚路径已完成演练级确认

## 停止条件

出现以下任一项，立即停止继续发布或继续放量：

- migration 失败
- `/health` 不可用
- 管理员登录主链路异常
- 关键 5xx 持续出现
- 跨租户隔离异常

## 回滚顺序

### 1. 应用回滚

- 回退到上一版稳定 frontend 产物
- 回退到上一版稳定 server 镜像

### 2. 数据回滚

- 由 DBA / 环境 owner 按备份或快照恢复
- 若 migration 已改变数据，由 DBA 判断是否允许仅回退应用而不回退数据库

### 3. 结论归档

至少记录：

- 停止时间
- 触发人
- blocker category
- failed check
- 当前 frontend 版本
- 当前 server 镜像
- 当前 migration step
- rollback required
- rollback decision owner
- rollback actions
- post-rollback verification

## 产物

- `artifacts/go-live/go-live-report.json`
- `artifacts/go-live/go-live-gate-report.json`
- 当前轮次 runbook / 演练记录

## 推荐顺序

1. 确认目标版本与部署前准备
2. 构建 server 镜像与前端产物
3. 完成备份后执行 migration
4. 切换 server 与 frontend
5. 执行最小冒烟
6. 输出演练结论，必要时回滚

## 完成记录模板

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```
