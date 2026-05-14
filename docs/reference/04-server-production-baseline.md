# Server 生产镜像与部署基线

更新时间：`2026-05-06`

本文档只定义当前仓库已经落地的最小生产交付基线，不虚构发布平台能力。

## 目标

- 给 `apps/server` 一个正式可交付的镜像入口
- 明确镜像、迁移、运行和回滚的 owner 边界
- 作为 `go-live` 清单中的 server build / packaging / process manager 基线

## 当前决定

### 1. 交付形态

- 当前首版 server 正式交付形态为“容器镜像优先”
- 镜像定义文件：`apps/server/Dockerfile`
- 该镜像只负责运行 `@elysian/server`

### 2. 进程管理

- 当前仓库不引入 `pm2`、`systemd` 或自定义进程守护脚本
- 进程管理责任交给容器运行平台
- 仓库当前只拥有“镜像内如何启动 server”的事实，不拥有“生产平台如何拉起和重启容器”的事实

### 3. 迁移边界

- 数据库迁移 owner 仍是 `packages/persistence`
- server 运行镜像不默认内置“自动执行 `db:migrate` 再启动”的发布行为
- 正式发布时，migration 应作为独立步骤执行，而不是隐式塞进 runtime startup

## 镜像构建

推荐命令：

```bash
bun run server:image:build
```

本机镜像烟测命令：

```bash
bun run server:image:smoke
```

一键构建并烟测：

```bash
bun run server:image:verify
```

等价命令：

```bash
docker build -f apps/server/Dockerfile -t elysian-server:local .
```

说明：

- 镜像基于 `oven/bun:1.3.10`
- 当前镜像安装的是 production 依赖，目标是运行 `@elysian/server`
- 当前镜像不承担 `drizzle-kit` 执行责任，因此 migration 仍在镜像外完成
- `server:image:smoke` 会启动临时容器并检查 `/health` 与 `/metrics`，默认要求外部提供可达的 `DATABASE_URL` 与 `ACCESS_TOKEN_SECRET`；若同时提供 `DATABASE_RUNTIME_URL`，容器内 server 运行时会优先使用它
- 若本机 PostgreSQL 供容器访问，`DATABASE_URL` / `DATABASE_RUNTIME_URL` 通常应写成 `host.docker.internal`，而不是容器内不可达的 `localhost`

## 运行前必备环境变量

最小必需项：

- `APP_ENV=production`
- `PORT`
- `DATABASE_URL`
- `DATABASE_RUNTIME_URL`（若运行时与 migration/seed 使用不同数据库角色）
- `ACCESS_TOKEN_SECRET`

强烈建议显式设置：

- `CORS_ALLOWED_ORIGINS`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `LOG_LEVEL`

禁止直接沿用开发默认值的项：

- `.env.example` 中的 `ACCESS_TOKEN_SECRET`
- `.env.example` 中的 `ELYSIAN_ADMIN_PASSWORD`
- 宽松的 `CORS_ALLOWED_ORIGINS=*`

## 最小发布顺序

1. 锁定本次发布 commit / tag
2. 执行：
   - `bun run check`
   - `bun run build:vue`
   - 若触及 tenant 主链路，再执行 `bun run e2e:tenant:full`
3. 构建 server 镜像
   - 若需要本机构建后立即验活，执行 `bun run server:image:smoke`
4. 在目标环境执行数据库备份 / 快照
5. 由发布 runner 或人工发布工作区执行 `bun run db:migrate`
6. 以新镜像启动 server 容器
7. 执行最小冒烟：
   - `GET /health`
   - `GET /metrics`
   - 管理员登录
   - 至少一个核心工作区列表读取

## 最小运行命令示例

以下命令只表示“当前容器镜像可以被这样启动”，不表示仓库已拥有正式生产平台：

```bash
docker run --rm \
  -p 3000:3000 \
  -e APP_ENV=production \
  -e PORT=3000 \
  -e DATABASE_URL=postgres://user:pass@host:5432/elysian \
  -e ACCESS_TOKEN_SECRET=replace-me \
  -e CORS_ALLOWED_ORIGINS=https://admin.example.com \
  -e RATE_LIMIT_ENABLED=true \
  elysian-server:local
```

## 回滚边界

### 代码 / 镜像回滚

- 回滚对象：上一版稳定镜像
- 执行 owner：发布负责人 + 环境 owner

### 数据库回滚

- 回滚对象：数据库备份 / 快照 / 恢复点
- 执行 owner：DBA / 环境 owner

### 当前明确不拥有的能力

- 自动化数据库回滚平台
- 自动化灰度 / 金丝雀发布
- 自动化对象存储、队列或外部依赖编排

## 当前限制

- 这是一份“最小生产基线”，不是完整平台交付手册
- 当前仍未固定具体生产平台（单机、容器编排或托管平台）
- 当前仍未把监控接入、告警阈值和值守流程平台化
