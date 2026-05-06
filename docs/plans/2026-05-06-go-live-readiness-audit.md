# 正式上线准备度核对

更新时间：`2026-05-06`

本文件是对当前上线清单的核对结果，不替代 `docs/release-checklist.md`。

## 结论

- 仓库已具备工程 alpha 到内测 beta 的基础能力。
- 当前仍不建议直接视为“正式上线版本”。
- 主要原因不是缺少功能，而是正式上线所需的发布、部署、回滚、监控和责任边界还未完全定稿。

## 清单状态

- `A. 仓库发布清单（dev -> main）`：基本可执行
- `B. 正式上线附加清单（go-live）`：当前未通过

## 已核对输入

- `docs/release-checklist.md`
- `docs/07-release-workflow.md`
- `docs/PROJECT_PROFILE.md`
- `docs/roadmap.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`
- `package.json`
- `apps/server/package.json`
- `docker-compose.yml`
- `.env.example`
- `.github/workflows/ci.yml`
- `.github/workflows/tenant-release-rehearsal.yml`

## 已确认通过

- `2026-05-06` 本地 `bun run check`
- `2026-05-06` 本地 `bun run build:vue`
- `2026-05-06` 本地 `bun run e2e:tenant:full`
- `2026-05-06` 本地 `bun run server:image:build`
- `2026-05-06` 本地 `bun run server:image:smoke` / `bun run server:image:verify`
- `2026-05-06` 基于 `elysian-server:local` 的本地 production 容器 `/health` 与 `/metrics` 冒烟通过
- CI 已有 `validate`、`e2e-smoke`、`e2e-tenant`、`tenant-release-rehearsal` 等门禁与演练入口
- `apps/server` 已提供 `start` / `dev` 入口，且支持 `production` 环境配置
- `apps/server/Dockerfile` 已落最小 server 生产镜像基线
- 服务端已暴露 `/health`、`/metrics`、`/metrics/prometheus`
- 多租户与 tenant rehearsal 相关文档和脚本已存在

## 本轮未复跑 / 未在目标环境确认

- 目标环境 `db:migrate`
- 目标环境登录、会话恢复、核心工作区最小冒烟
- 目标环境监控采集、告警和值守演练
- 目标环境镜像拉取、容器启动与发布后 `/health` / `/metrics` 冒烟
- 目标环境 `server:image:smoke` 运行记录与报告归档

## 仍需补齐

### 1. 正式 server build / packaging / process manager

- 现状：已新增 `apps/server/Dockerfile`
- 现状：已新增 `bun run server:image:build`
- 现状：当前决定是“容器镜像优先”，进程管理交给容器运行平台
- 现状：本地镜像构建与最小 production 容器 `/health` / `/metrics` 冒烟已通过
- 现状：已新增 `bun run server:image:smoke` 与 `bun run server:image:verify`
- 结论：server 正式交付形态已有可验证的最小基线，但目标环境发布编排仍未定稿

### 2. 生产部署方式

- 现状：已通过 `ADR-0011` 固定首个正式生产平台基线为“单 Linux 主机 + Docker Engine”
- 现状：已新增平台化 `go-live` runbook
- 现状：当前仓库已有本地容器栈，但仍不等于正式生产发布命令本身
- 结论：生产平台边界与人工发布路径已明确；后续仍需补镜像仓库、反向代理实现与自动化发布能力

### 3. 数据库备份与恢复

- 现状：文档里已要求备份/恢复点，但仓库级执行责任未固化
- 现状：tenant 相关 runbook 仍把恢复责任留给环境 / DBA owner
- 现状：已新增数据库备份与恢复责任模板
- 结论：恢复责任模板已具备，仍待目标环境填写真实证据

### 4. 监控、告警和值守

- 现状：指标端点已存在
- 现状：已新增观测与值守基线文档，固定最小观察口径
- 现状：已新增发布角色与值守模板
- 现状：尚未看到监控系统、告警阈值和值守流程的平台级落点
- 结论：值守模板已具备，真实监控接入与告警平台仍未定稿

### 5. generator 上线边界

- 现状：generator 已能 preview / report / apply
- 现状：当前 roadmap 仍把自举闭环收口作为主线
- 结论：哪些生成能力可以进入正式主工程，仍需明确边界

## 额外风险

- `apps/example-vue` 的生产构建存在 chunk size warning，需确认是否只是已知警告，还是需要作为上线前优化项处理。
- `.env.example` 仍包含开发默认值，正式生产环境不能直接沿用。

## 建议动作

1. 在目标环境填写数据库备份与恢复责任模板。
2. 在目标环境填写发布角色与值守模板。
3. 在目标环境完成镜像拉取、容器启动与发布后健康检查。
4. 之后再把 go-live 检查从“人工清单”收敛成“可执行门禁”。
