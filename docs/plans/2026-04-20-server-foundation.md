# 2026-04-20 Server Foundation Plan

## 目标

把 `apps/server` 从“可运行 demo 入口”推进为“可继续承接模块开发的服务端底座”。

## 范围

- 环境配置读取与校验
- 统一错误响应与错误映射
- 模块注册入口
- 基础日志接入点
- `health` / `platform` 之外的系统级路由组织方式

## 非目标

- 不接入数据库
- 不实现真实业务模块
- 不引入复杂鉴权流程

## 需要明确的决策

- `config` 的 canonical owner 是否落在 `apps/server` 还是 `packages/core`
- `logging` 的 canonical owner 是否落在 `apps/server` 还是 `packages/core`
- 错误响应格式是否在首版固定为统一 envelope

## 实施拆分

1. 建立 `server/config` 入口，显式管理环境变量。
2. 建立 `server/errors` 入口，统一异常到 HTTP 响应的映射。
3. 建立 `server/modules` 入口，定义模块注册协议。
4. 把现有系统路由收敛到模块化装配方式。
5. 为这些底座能力补最小测试。

## 影响面

- `apps/server`
- `packages/core`
- `docs/ARCHITECTURE_GUARDRAILS.md`
- 可能需要新增 ADR

## 验证

- `bun run typecheck`
- `bun run test`
- 启动 server 验证基础路由可用
- 验证未注册模块时服务端仍能稳定启动

## 完成标准

- server 有清晰的配置、错误、模块装配入口
- 新业务模块不需要直接改根入口文件
- 文档能明确 `config` / `logging` / `error mapping` 的 owner
