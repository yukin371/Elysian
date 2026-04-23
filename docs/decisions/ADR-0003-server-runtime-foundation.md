# ADR-0003 Server Runtime Foundation Owners

状态：`accepted`

日期：`2026-04-20`

## 背景

`apps/server` 已从最小 demo 入口升级为可扩展底座。在继续推进 persistence、auth 和业务模块前，需要先固定几个运行时关注点的 canonical owner，避免后续在 `packages/core` 和 `apps/server` 之间来回漂移。

## 决策

1. `config` 的 canonical owner 设为 `apps/server`。
2. `logging` 的 canonical owner 设为 `apps/server`。
3. `error mapping` 的 canonical owner 设为 `apps/server`。
4. 服务端错误响应首版采用统一 envelope：
   - 成功响应保持路由自定义结构
   - 错误响应统一为 `error.code`、`error.message`、`error.status`、可选 `error.details`
5. 模块装配通过 `ServerModule` 注册协议进入 `apps/server`，新模块不直接编辑根入口。

## 理由

- 这几项能力都强依赖服务端运行时语义和 HTTP 生命周期，不适合先抽到 `packages/core`。
- `packages/core` 当前应保持无业务语义、低运行时耦合的基础能力，不应过早吸收服务端特有逻辑。
- 统一错误 envelope 能为前端适配层、测试和后续模块化扩展提供稳定预期。

## 影响

- `ARCHITECTURE_GUARDRAILS` 中 `config`、`logging` 不再是 `TBD`
- 新增的 server 共享能力优先放在 `apps/server/src/*`
- 若未来多个运行时都需要共享 logging/config 抽象，再通过新 ADR 评估是否上移到 `packages/core`

## 暂不决策项

- 生产级日志后端
- 配置分层与 secrets 管理
- auth 的具体模型
- persistence owner 与数据库访问方案
