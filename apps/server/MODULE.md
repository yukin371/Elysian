# MODULE: apps/server

## 模块职责

- 承载 HTTP API
- 承载鉴权接入与权限校验入口
- 暴露 OpenAPI 与 AI 相关接口
- 装配平台级运行时能力

## Owns

- 路由注册
- 中间件装配
- 认证接入点
- AI 流式接口编排
- 运行时配置读取与校验
- 服务端日志入口
- HTTP 错误映射
- 模块注册协议与装配
- 首个 `customer` 模块的应用层 service 与 HTTP 路由

## Must Not Own

- 前端框架专属页面逻辑
- 实体 schema 定义主来源
- 代码生成模板逻辑

## 关键依赖

- `packages/schema`
- `packages/core`
- `packages/persistence`

## 不变量

- API 契约必须可导出并被前端与生成器消费
- 鉴权规则的运行时执行入口必须在服务端
- AI 能力接入不得绕过服务端边界直接侵入前端适配层
- 新业务模块应通过模块注册协议接入，而不是继续堆到根入口文件
- 运行时错误响应应保持统一 envelope
- server 只消费 persistence 暴露的持久化能力，不直接持有关系型 schema owner

## 文件体量说明

- 根级 `src/app.test.ts` 已按 `src/app/system-crud/`、`src/app/workflow/`、`src/app/auth/` 与 `src/app/customer/` 目录化收敛。
- `src/app/auth/auth.test.ts` 已把 auth fixture、cookie helper 与 tenant context recorder 下沉到同目录 `test-support.ts`，当前 `src/app/` 下没有超过 `1000` 行的测试文件。
- 后续新增装配级测试时，应优先落在对应 `src/app/<capability>/` 目录，并保持 test support 局部化，不新增跨模块 shared helper。

## 常见坑

- 把 schema 和服务实现混写，导致 generator 无法稳定复用
- 把前端路由和后端权限规则强耦合在同一实现里
- 过早把服务端运行时能力抽进 `packages/core`
- 在新模块里各自定义错误返回格式

## 文档同步触发条件

- 增删服务端 owner
- 调整 API 契约输出方式
- 调整 auth 或 config 的 canonical owner
- 调整模块注册协议
- 调整错误 envelope 规则
