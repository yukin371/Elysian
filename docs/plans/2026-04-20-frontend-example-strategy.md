# 2026-04-20 Frontend Example Strategy Plan

## 目标

决定首个前端示例应用的落地方向，避免同时铺开 `Vue` 和 `React` 导致精力分散。

## 当前结论

- 首个前端示例：`Vue`
- 当前承载应用：`apps/example-vue`
- `React` 保持后续适配目标，不进入当前实现主线

## 范围

- 决定先落单前端示例还是双示例并行
- 定义前端示例的最小能力范围
- 明确前端适配层和真实示例应用的边界

## 非目标

- 不同时做完整双前端实现
- 不引入复杂设计系统
- 不做 SSR

## 当前实施重点

- 建立 `apps/example-vue`
- 保持 `packages/frontend-vue` 为 Vue 适配层入口
- 让示例应用先承接平台探活和首个 CRUD 模块

## 实施拆分

1. 建立 `apps/example-vue` 应用骨架。
2. 固定示例的最小范围。
3. 把平台探活与首个 CRUD 模块接入 Vue 示例。
4. 把 `React` 保留为后续适配目标，不提前实现。

## 影响面

- `packages/frontend-vue`
- `packages/frontend-react`
- 未来的 `apps/example-*`
- `docs/ARCHITECTURE_GUARDRAILS.md`

## 验证

- 形成一条明确实施路径，而不是继续并列讨论
- 不会让平台核心被某个前端框架绑死

## 完成标准

- 首个前端示例方向明确并已启动实现
- 示例应用与适配层边界明确
- 能为首个垂直切片提供前端承载体
