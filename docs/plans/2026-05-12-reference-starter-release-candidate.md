# 2026-05-12 首个参考发行版候选发布包

本文件用于把当前 `dev` head 作为“首个可发布参考发行版候选”做一次可读的发布材料收口。

当前校验基线：

- branch: `dev`
- base head: `ef57bc3`
- worktree: 包含本轮首发候选未提交变更
- objective: 首个参考发行版可发布

说明：本文结论绑定当前候选工作区。正式 PR / tag 前必须在最终提交后重新锁定 commit，并至少重跑 `bun run check` 与本文件列出的首发命令基线。

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

- `bun run check`：通过
- `bun run build:vue`：通过
- `bun run server:image:verify`：通过
- `bun run e2e:generator:cli`：通过
- `bun run e2e:smoke:full`：通过
- `bun run e2e:tenant:full`：通过

### 证据位置

- `bun run check`：仓库级 lint / typecheck / workspace registry / standard CRUD / test 全绿
- `bun run build:vue`：Vite 构建通过，workspace registry 与 shell descriptor coverage 通过
- `bun run server:image:verify`：镜像构建与 `/health`、`/metrics` 烟测通过
- `bun run e2e:generator:cli`：generator CLI 真实路径通过
- `bun run e2e:smoke:full`：本地 PostgreSQL + `DATABASE_URL` + `ACCESS_TOKEN_SECRET` 下通过
- `bun run e2e:tenant:full`：本地 PostgreSQL + `DATABASE_URL` + `ACCESS_TOKEN_SECRET` 下通过

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

## 六、建议 PR / 发布说明

```text
feat(release): 收口首个参考发行版可发布候选

- 固化 reference starter release spec / acceptance / progress
- 补齐 example-vue、generator、server 验证证据
- 收敛 go-live 文档、门禁与 blocker 归档模板
```
