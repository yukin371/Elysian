# ADR-0011 首个正式生产平台基线

状态：`accepted`

日期：`2026-05-06`

## 背景

在 `2026-05-06` 之前，仓库已经具备：

- `apps/server` 的最小生产镜像定义
- `bun run check`、`bun run build:vue`、tenant rehearsal 等验证入口
- `go-live` 清单、人工发布顺序和最小观测口径

但有一个长期边界仍未固定：

- 真实生产平台到底是什么

如果继续把“生产平台”留在 `TBD`，会持续带来几类问题：

- `go-live` runbook 只能停留在抽象顺序，无法落到具体命令
- `server:image:build`、frontend 产物、`db:migrate` 与回滚动作缺少统一发布语境
- tenant rehearsal 的“rehearsal-only”边界无法和真实发布路径形成清晰切面
- 后续值守、监控、备份恢复、静态资源部署都会继续悬空

当前仓库仍处于首版逼近上线前的阶段，不适合直接引入 Kubernetes、Helm、灰度系统、自动回滚平台等更重基础设施。因此需要先固定一个保守、真实、和当前代码库一致的首发生产平台基线。

## 决策

### 1. 首个正式生产平台基线固定为单 Linux 主机

- 首发生产平台固定为“单 Linux 主机”方案
- 该主机负责承载：
  - server 容器运行
  - frontend 静态产物部署
- 该主机不负责数据库 owner 决策

### 2. 应用运行时固定为 Docker Engine

- server 以 Docker 容器形式运行
- 当前不引入 Kubernetes、Helm、Nomad、Swarm 或自定义编排平台
- 容器重启策略依赖 Docker / 主机级运行能力，不新增仓库内进程守护 owner

### 3. 发布工作区固定为“主机本地 repo checkout + Bun + Docker”

- 首版发布默认在目标主机或等价 release workspace 中完成
- 该工作区要求具备：
  - 仓库 checkout
  - `bun`
  - `docker`
- 当前不额外定义镜像仓库、制品仓库或远程发布 runner 作为强依赖

### 4. server、frontend、migration 的发布路径分离

- server：
  - 使用 `apps/server/Dockerfile`
  - 通过 `bun run server:image:build` 构建镜像
- frontend：
  - 使用 `bun run build:vue`
  - 生成静态产物后由环境 owner 部署到静态目录
- migration：
  - 继续由 `packages/persistence` owner 负责
  - 保持为独立发布步骤
  - 不嵌入 server runtime startup

### 5. 数据库不与应用容器栈绑定

- 生产数据库不使用仓库根 `docker-compose.yml` 直接作为正式生产方案
- `docker-compose.yml` 继续只代表本地联调 / 本地容器基线
- 生产数据库由 DBA / 环境 owner 单独负责

### 6. 反向代理与 TLS 仍由环境 owner 持有

- 反向代理（如 Nginx、Caddy 或等价能力）不进入当前仓库 owner
- TLS 证书、域名接入、静态资源暴露与 HTTP 转发由环境 owner 持有
- 本 ADR 只固定应用发布平台，不把边界扩张到运维平台实现

## 理由

### 为什么选单机 Linux + Docker

- 和当前仓库已有的容器化基线最一致
- 不需要提前引入当前阶段尚未验证的重型编排系统
- 能让 server 镜像、frontend 构建、migration 和 runbook 迅速收敛到可执行状态
- 更符合“先验证，后扩展；先边界，后技巧”的当前仓库原则

### 为什么不直接选 Kubernetes / Helm

- 当前仓库还没有：
  - 镜像仓库流程
  - 多环境 values 管理
  - rollout / rollback 平台化责任边界
  - 监控与告警平台接入
- 在这些前提还没定稿前引入 K8s，只会把 `go-live` 风险从应用层转移到平台层

### 为什么不把 `docker-compose.yml` 直接升级成生产方案

- 当前 `docker-compose.yml` 带有明显本地联调语义：
  - 源码挂载
  - 启动时 `bun install`
  - `migrate + seed + server` 串在一个 command 里
- 这不适合作为正式生产发布路径

### 为什么 migration 必须独立

- migration owner 已固定在 `packages/persistence`
- 若把 migration 塞进 server startup，会把数据库状态变化和应用重启混成一个动作
- 失败时也会让回滚边界变模糊

## 影响

- `go-live` runbook 可以收敛成单机 Linux + Docker 的具体命令
- `PROJECT_PROFILE` 中“生产平台 `TBD`”的状态需要下调为“平台基线已确认，平台自动化仍未定稿”
- `docker-compose.yml` 的定位将进一步固定为本地基线，而不是准生产入口
- 后续若要升级到多机编排平台，需要补新 ADR，而不是隐式漂移

## 当前不决策项

- 镜像仓库选型
- 反向代理实现细节
- 静态资源 CDN / 对象存储方案
- 自动化回滚平台
- 监控 / 告警平台产品选型
- 多机高可用、蓝绿或灰度发布

这些能力等首个正式生产平台稳定后，再按需要单独决策。
