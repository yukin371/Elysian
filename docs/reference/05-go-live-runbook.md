# Go-live Runbook

更新时间：`2026-05-06`

本文档定义当前仓库在“单 Linux 主机 + Docker Engine”基线下的最小人工上线顺序。

若当前就是准备推进首次正式上线，建议同时维护：

- `docs/plans/2026-05-06-go-live-preparation-packet.md`
- `artifacts/go-live/go-live-report.json`
- `artifacts/go-live/go-live-gate-report.json`
- `docs/reference/09-go-live-gate-input-template.md`

## 适用范围

- `main` 已准备进入真实生产环境
- 发布范围包含 server、frontend、migration 或 tenant 相关能力
- 需要明确人工执行顺序、责任边界与回滚口径

## 平台前提

- 目标平台：单 Linux 主机
- 主机已安装：
  - `docker`
  - `bun`
- 目标主机存在仓库 checkout，例如：`/srv/elysian`
- frontend 静态目录由环境 owner 管理，例如：`/srv/elysian-web`
- 反向代理与 TLS 由环境 owner 管理，不属于当前仓库 owner

## 非目标

- 不定义 Kubernetes、ECS、Helm 等多机或编排平台细节
- 不虚构自动化回滚平台
- 不把 rehearsal 脚本误写成生产发布平台命令

## 角色分工

| 角色 | 责任 |
|---|---|
| 发布负责人 | 锁定发布输入、协调执行顺序、宣布开始/停止/回滚 |
| 应用 owner | 提供镜像、配置、应用冒烟与技术判断 |
| DBA / 环境 owner | 负责数据库备份、migration 执行、数据库恢复 |
| 值班人 | 上线后 30 分钟与首日观察 |

## 发布前冻结

1. 锁定 release commit / tag / PR
2. 锁定目标环境
3. 锁定 migration 列表
4. 锁定本次是否触及：
   - tenant
   - workflow
   - file
   - generator 主链路
5. 冻结并行高风险改动

## 发布前验证

必须完成：

- `bun run check`
- `bun run build:vue`
- `bun run go-live:report`

按需追加：

- `bun run e2e:tenant:full`
- tenant rehearsal evidence / decision

必须人工确认：

- 生产环境 `.env` / secret 已准备
- `ACCESS_TOKEN_SECRET` 非开发默认值
- `CORS_ALLOWED_ORIGINS` 非宽松 `*`
- 若执行 `server:image:smoke`，已确认传入的 `DATABASE_URL` 对临时容器可达
- 备份 / 快照已就绪
- 回滚负责人已到位

若希望把当前准备度输出成显式门禁结论，再执行：

```bash
bun run go-live:gate
```

若希望一键执行 report -> gate，可执行：

```bash
bun run go-live:finalize
```

## 发布顺序

### 1. 构建 server 镜像

```bash
cd /srv/elysian
git fetch --all --tags
git checkout <release-commit-or-tag>
bun install --frozen-lockfile
```

然后执行：

```bash
bun run server:image:build
```

若当前发布主机已具备可达的目标数据库连接与正式 secret，建议继续执行：

```bash
bun run server:image:smoke
```

若构建机无法拉取基础镜像：

- 先确认 Docker Hub / 镜像代理连通性
- 不要把“镜像源不可达”误判成应用代码问题

### 2. 准备前端产物

```bash
bun run build:vue
rsync -a --delete apps/example-vue/dist/ /srv/elysian-web/
```

说明：

- 若构建存在 chunk size warning，需在发布评审里明确“接受上线”还是“先优化再发”
- `rsync` 目标目录可由环境 owner 替换成真实静态目录

### 3. 数据库备份

执行 owner：DBA / 环境 owner

要求：

- 记录备份时间
- 记录恢复点
- 记录恢复执行人

建议同时填写：

- [07-database-backup-and-recovery-template.md](./07-database-backup-and-recovery-template.md)

### 4. 执行 migration

执行 owner：DBA / 环境 owner 或受控 release runner

当前基线命令：

```bash
bun run db:migrate
```

说明：

- migration 是独立步骤，不内嵌进 server startup
- 若失败，先停止上线，再按恢复点回退

### 5. 发布 server 与 frontend

执行 owner：发布负责人协调，环境 owner 实施

server 当前最小替换命令示例：

```bash
docker rm -f elysian-server || true
docker run -d \
  --name elysian-server \
  --restart unless-stopped \
  --env-file /etc/elysian/server.env \
  -p 3000:3000 \
  elysian-server:local
```

frontend 当前最小切换方式：

- 静态产物同步到目标目录后，由环境 owner reload 反向代理
- 当前仓库不拥有反向代理 reload 命令

要求：

- 使用本次锁定的镜像 / 产物版本
- 不混入未锁定提交

### 6. 运行后最小冒烟

必须确认：

- `GET /health`
- `GET /metrics`
- 管理员登录成功
- 菜单与权限 gate 正常
- 至少一个核心工作区列表读取成功
- 至少一个核心写操作成功

tenant 变更追加确认：

- super-admin 可访问 `/system/tenants`
- tenant admin 不可访问 `/system/tenants`
- 至少一个非默认 tenant 登录成功
- 至少一个真实业务实体跨租户隔离仍成立

## 停止条件

出现以下任一项，应停止继续放量或继续发布：

- migration 失败
- `/health` 不可用
- 登录主链路异常
- 关键 5xx 持续出现
- 跨租户隔离异常

## 回滚顺序

### 1. 应用回滚

- 回退到上一版稳定 frontend 产物与 server 镜像

### 2. 数据回滚

- 由 DBA / 环境 owner 按备份 / 快照恢复
- 若 migration 已改变数据，必须由 DBA owner 判断是否允许仅回退应用不回退数据库

### 3. 结论归档

至少记录：

- 停止时间
- 触发原因
- 已执行回滚动作
- 未恢复项
- 后续补救 owner
- 当前轮次准备包 / 发布记录位置

## 上线后观察

上线后前 30 分钟至少观察：

- 登录成功率
- 401 / 403 波动
- 5xx
- 数据库连接异常
- 关键模块首次访问成功率

上线后首日继续由值班人跟踪：

- tenant 相关异常
- 文件上传 / 下载异常
- workflow 核心链路异常

建议同时填写：

- [08-release-roles-and-oncall-template.md](./08-release-roles-and-oncall-template.md)

## 当前限制

- 当前 runbook 仍是“单机 + 人工执行 + 文档归档”模式
- 镜像仓库、监控平台、告警平台和自动回滚平台仍需后续定稿
