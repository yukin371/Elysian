# MODULE: scripts

## 模块职责

- 承载仓库级本地验证、CI 辅助、E2E 编排、阶段证据收集与门禁脚本。
- 脚本可以编排 `apps/*` 与 `packages/*` 的公开命令，但不拥有运行时业务逻辑、数据库 schema 或前端页面状态。

## Owns

- 本地与 CI 可复用的质量门禁入口。
- E2E smoke / tenant / generator / P5A handoff 的执行编排。
- 报告、诊断、稳定性窗口和阶段 gate 的文件级证据生成。

## Must Not Own

- `apps/server` HTTP 路由、鉴权规则或模块实现。
- `packages/persistence` schema、migration 或 repository 实现。
- `apps/example-vue` 页面状态、组件视觉或工作区运行时。
- 可被产品运行时依赖的 shared utility。

## 文件体量说明

- `e2e-smoke.ts` 保留真实 smoke 主流程编排。
- `e2e-smoke-support.ts` 只承接 smoke 脚本本地类型、报告、端口等待、server 终止和 workflow draft 构造。
- 当前 `e2e-smoke*.ts` 文件均低于 `1000` 行；后续扩展 smoke 场景时，应优先按本地 support / scenario 文件继续拆分，而不是把所有步骤继续堆回主脚本。

## 文档同步触发条件

- 新增或调整脚本目录 owner。
- 调整 CI gate、报告格式或阶段证据文件语义。
- 将脚本内能力迁出到 `apps/*`、`packages/*` 或反向引入运行时代码依赖。
