# ADR-0002 Bun Workspace Baseline

状态：`accepted`

日期：`2026-04-20`

## 背景

仓库已经决定以 `Elysia` 为后端内核，当前环境已具备 `bun 1.3.10`。在没有前端示例、数据库和 CI 之前，需要先选定一个足够轻量、与 `Elysia` 匹配、并且能快速建立 monorepo 的工作区基线。

## 决策

1. 首版 monorepo 使用 `Bun workspaces`。
2. 根配置采用单个 `tsconfig.json` 管理最小 TypeScript 基线和工作区路径映射。
3. 首个可运行应用是 `apps/server`。
4. `packages/core`、`packages/schema`、`packages/generator`、`packages/frontend-vue`、`packages/frontend-react` 先落最小可编译入口，不提前引入重型依赖。

## 理由

- `Bun workspaces` 与 `Elysia` 组合天然匹配，首版成本最低。
- 先建立最小可运行路径，比同时引入多套工具链更容易收敛。
- 前端方向尚未定稿，适配层包先保留占位，比过早生成完整应用更稳妥。

## 影响

- 根命令默认以 `bun` 为主
- 后续若要引入 `pnpm` 或其他工作区工具，需要新增 ADR 并说明迁移理由
- 前端真实工程启动前，适配层只作为 owner 占位和 API 边界入口

## 暂不决策项

- 持久化方案
- 前端示例应用先后顺序
- 生产构建与发布策略
- CI 与 lint 体系
