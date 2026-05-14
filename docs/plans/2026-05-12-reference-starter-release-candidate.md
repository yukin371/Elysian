# 2026-05-12 首个参考发行版候选发布包

本文件用于把当前 `dev` head 作为“首个可发布参考发行版候选”做一次可读的发布材料收口。

当前校验基线：

- branch: `dev`
- base head: `8e0b74e`
- final tagged release object: `b0c2c0f` (`v1.0.0`)
- worktree: clean
- objective: 首个参考发行版可发布

说明：

- `8e0b74e` 是本轮 `M1` 候选冻结时的固定验证基线。
- 在 `M3` 修复跨租户隔离并完成最终归档后，正式 `v1.0.0` tag 已锁定到 `b0c2c0f`。
- 这意味着：候选冻结证据保留在 `8e0b74e`，最终发布对象锁定为 `b0c2c0f`。

## 一、候选范围

本轮候选只覆盖首个参考发行版仓库发布层，不覆盖真实环境 go-live。

### 已纳入

- `apps/example-vue` 参考发行版体验收口
- `packages/generator` 默认路径、最小 schema、手工接线边界
- `apps/server` 镜像验证与最小生产烟测
- 仓库发布与 go-live 文档、门禁、责任边界

### 不纳入

- React 首发
- uniapp 首发
- 复杂 BPM
- 低代码 Studio
- 自动化发布平台

## 二、发布证据

### 命令

- `bun run check`：已于 `8e0b74e` 重新执行，通过
- `bun run build:vue`：已于 `8e0b74e` 重新执行，通过
- `bun run server:image:verify`：已于 `8e0b74e` 重新执行，通过
- `bun run e2e:generator:cli`：通过
- `bun run e2e:smoke:full`：已于 `8e0b74e` 重新执行，通过
- `bun run e2e:tenant:full`：已于 `8e0b74e` 重新执行，通过

### 证据位置

- `bun run check`：`8e0b74e` 上复跑通过；仓库级 lint / typecheck / workspace registry / standard CRUD / test 全绿
- `bun run build:vue`：`8e0b74e` 上复跑通过；Vite 构建通过，workspace registry 与 shell descriptor coverage 通过
- `bun run server:image:verify`：`8e0b74e` 上复跑通过；镜像构建与 `/health`、`/metrics` 烟测通过
- `bun run e2e:generator:cli`：generator CLI 真实路径通过
- `bun run e2e:smoke:full`：`8e0b74e` 上复跑通过；使用仓库根 `.env` 中的本地 PostgreSQL `DATABASE_URL` 与 `ACCESS_TOKEN_SECRET`
- `bun run e2e:tenant:full`：`8e0b74e` 上复跑通过；使用仓库根 `.env` 中的本地 PostgreSQL `DATABASE_URL` 与 `ACCESS_TOKEN_SECRET`

## 三、人工验收摘要

- onboarding：通过
- shell / auth / navigation：通过
- core workspace：通过
- generator happy path：通过
- production smoke：通过
- go-live blocker convergence：通过

## 四、当前 blocker

### 应用侧

- 无

### 环境侧

- 目标发布环境未锁定
- release tag / release PR 未锁定
- migration 执行顺序未锁定
- backup / recovery 证据未锁定
- 发布负责人 / 环境 owner / DBA / 值守角色未锁定
- proxy / TLS / 目标环境最小冒烟输入未锁定

### out-of-scope

- React / uniapp / 复杂 BPM / 低代码 Studio / 自动化发布平台

## 五、结论

当前候选工作区已达到“仓库参考发行版 ready”。
真实 go-live 仍需环境 owner 完成外部前提锁定，不能直接把本地参考发行版结论等同为生产上线放行。
当前 `M1` 已在 `8e0b74e` 上完成 `check`、`build:vue`、`server:image:verify`、`e2e:smoke:full` 与 `e2e:tenant:full` 的固定版本复跑；当前剩余未锁定项已经收敛到 `release tag / PR` 与环境侧输入，而不是应用侧验证。

## 六、最终发布对象锁定

- release tag: `v1.0.0`
- tagged commit: `b0c2c0f`
- tag 说明：包含 runtime DB role 切换修复、`M3` 重跑交接文档与最终 go-live readiness 归档
- 最终 go-live 产物：`artifacts/go-live/go-live-report.json` 与 `artifacts/go-live/go-live-gate-report.json` 已按 `b0c2c0f` 重生成并通过

## 七、建议 PR / 发布说明

```text
feat(release): 收口首个参考发行版可发布候选

- 固化 reference starter release spec / acceptance / progress
- 补齐 example-vue、generator、server 验证证据
- 收敛 go-live 文档、门禁与 blocker 归档模板
```
