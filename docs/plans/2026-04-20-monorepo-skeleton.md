# 2026-04-20 Monorepo Skeleton Plan

## 目标

把仓库从纯文档初始化推进到“可安装依赖、可启动服务端、可运行类型检查和测试”的最小工程骨架。

## 范围

- 根 `package.json`
- 根 `tsconfig.json`
- `apps/server` 最小 `Elysia` 应用
- `packages/core`
- `packages/schema`
- `packages/generator`
- `packages/frontend-vue`
- `packages/frontend-react`

## 非目标

- 不接入数据库
- 不引入 ORM
- 不创建真实前端应用
- 不补 CI / lint / 发布流程

## 验证

- `bun install`
- `bun run typecheck`
- `bun run test`
- 启动 `bun run server` 后验证 `/health`

## 结果去向

- 长期有效的工作区基线进入 ADR
- 当前状态同步到 `PROJECT_PROFILE` 和 `roadmap`
