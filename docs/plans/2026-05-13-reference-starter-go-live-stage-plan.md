# 2026-05-13 首发落地阶段执行计划

更新时间：`2026-05-13`

本文把“首个参考发行版 ready”继续收口为“可执行真实首发”的阶段计划。它只服务当前首发主线，不承接 React、uniapp、复杂 workflow、重 Studio 或第二套 starter。

配套材料：

- [2026-05-12-reference-starter-release-plan.md](./2026-05-12-reference-starter-release-plan.md)
- [2026-05-12-reference-starter-release-acceptance-packet.md](./2026-05-12-reference-starter-release-acceptance-packet.md)
- [2026-05-06-go-live-preparation-packet.md](./2026-05-06-go-live-preparation-packet.md)
- [../reference/05-go-live-runbook.md](../reference/05-go-live-runbook.md)
- [../reference/09-go-live-gate-input-template.md](../reference/09-go-live-gate-input-template.md)

## 目标

把当前“仓库参考发行版 ready”推进到“目标环境可演练、可放行、可归档”的状态。当前默认不按自然周排期，而按里程碑和出口门禁推进。

## 执行原则

- 先锁定候选，再锁定环境，再做目标环境演练，最后给放行结论。
- 不把环境 owner 的外部前提伪装成仓库内已完成事实。
- 不因为 go-live 需要更多输入，就顺手新增平台能力或继续扩大产品范围。
- `go-live:*` 只服务真实环境上线附加门禁；`tenant:release:*` 继续只服务 rehearsal。

## 角色分工

| 角色 | 当前责任 |
|---|---|
| 应用 owner | 锁定候选 commit、补齐仓库内验证、提供应用冒烟结果 |
| 发布负责人 | 锁定 release tag / PR / environment、发布窗口、值守与停止决策 |
| 环境 owner | 锁定 proxy / TLS、容器启动、环境变量注入与最小健康检查 |
| DBA | 锁定 migration 列表、备份 / 恢复证据、数据库回滚路径 |

## M1 候选冻结

目标：把当前候选工作区收成可复跑、可追溯的固定首发候选。

必须完成：

- 锁定 `release commit`
- 锁定 `release tag` 或 `release PR`
- 复跑并归档：
  - `bun run check`
  - `bun run build:vue`
  - `bun run e2e:smoke:full`
  - `bun run server:image:verify`
  - 若触及 tenant：`bun run e2e:tenant:full`
- 更新候选包、验收包和 blocker 归档

出口门禁：

- `go-live report` 的 `M1` 状态为 `passed`
- 应用侧 blocker 为 `0`
- 不再存在“当前候选工作区”和“最终待发布对象”不一致的口径

建议产出：

- `docs/plans/2026-05-12-reference-starter-release-candidate.md`
- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`

## M2 环境前提锁定

目标：把当前环境 blocker 从“缺信息”收成“有 owner、有输入、有执行路径”的待办。

必须完成：

- 锁定 `release environment`
- 锁定 `migration list`
- 锁定数据库 `backup / restore` 证据
- 锁定 `release roles / oncall`
- 锁定 `proxy / TLS owner`
- 用统一模板把上述输入映射为 `go-live:*` 环境变量
- 必要时执行 `bun run go-live:handoff`，把当前 blocker 与预填字段分发给发布负责人、环境 / DBA owner、应用 owner

出口门禁：

- `go-live report` 的 `M2` 状态为 `passed`
- 当前 blocker 不再停留在“待确认”“后续补齐”这类口头描述
- 所有环境类 blocker 都能映射到具体 owner

建议产出：

- `docs/reference/07-database-backup-and-recovery-template.md`
- `docs/reference/08-release-roles-and-oncall-template.md`
- `docs/reference/09-go-live-gate-input-template.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`
- `artifacts/go-live/go-live-handoff-report.json`
- `artifacts/go-live/go-live-input.prefill.env`

## M3 目标环境演练

目标：在真实目标环境完成一次从发布输入到上线后最小冒烟的完整演练。

必须完成：

- 拉取目标版本并执行部署前准备
- 执行 migration
- 完成发布后最小冒烟：
  - `GET /health`
  - `GET /metrics`
  - 管理员登录
  - 菜单与权限 gate
  - 至少一个核心工作区列表
  - 至少一个核心写操作
- 若触及 tenant，再补：
  - super-admin 访问 `/system/tenants`
  - tenant admin 禁止访问 `/system/tenants`
  - 非默认 tenant 登录
  - 跨租户隔离

出口门禁：

- `go-live report` 的 `M3` 状态为 `passed`
- `bun run go-live:gate` 返回通过
- 停止上线条件和回滚路径已在演练中被具体验证

建议产出：

- `artifacts/go-live/go-live-report.json`
- `artifacts/go-live/go-live-gate-report.json`
- 当前轮次上线记录或 runbook 归档

## M4 首发放行结论

目标：形成唯一的首发放行结论，并把残留项分清 owner。

必须完成：

- 基于 M1-M3 的结果输出 `ready / not ready`
- 把残留项分类为：
  - `application`
  - `environment`
  - `out-of-scope`
- 若 `ready`，生成 release 说明
- 若 `not ready`，明确回退到哪个里程碑修补

出口门禁：

- `go-live report` 的 `M4` 状态为 `passed`
- 候选包、验收包、go-live 准备包三者结论一致
- 未完成项不再混写为“应用问题”或“环境问题”

## 当前默认执行顺序

1. 应用 owner 完成 M1 并更新候选包
2. 发布负责人、环境 owner、DBA 共同完成 M2
3. 在目标环境执行 M3，并归档 `go-live:*` 结果
4. 产出 M4 结论，决定是否放行

## 当前已知边界

- 当前仓库内不新增第二套 starter、第二套 generator 主路径或新的发布平台能力
- 若 M1 未过，不进入 M2/M3
- 若 M2 未过，不进入 M3
- 若 M3 未过，不给 `ready` 结论
