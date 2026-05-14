# 2026-05-14 参考发行版下阶段规划 Spec

更新时间：`2026-05-14`

## 背景

- 当前仓库的阶段判断已经收敛：`Phase 2`、`Phase 3`、`Phase 4`、`Phase 5 / P5A`、`Phase 6A Round-2`、`Phase 6B` 与 `Phase 7 / P7A` 都按“已完成的能力基线”处理。
- 当前主线不是继续开新 Phase，也不是继续外扩平台能力，而是把“参考发行版 ready”推进到“真实环境可 go-live”的首发闭环。
- 现有计划已分别覆盖首发定义、验收包、候选包、go-live 准备包与里程碑计划；本 spec 只负责把这些结论压成单一执行口径，供下阶段直接认领和推进。

配套文档：

- [2026-05-12-reference-starter-release-plan.md](./2026-05-12-reference-starter-release-plan.md)
- [2026-05-12-reference-starter-release-candidate.md](./2026-05-12-reference-starter-release-candidate.md)
- [2026-05-12-reference-starter-release-acceptance-packet.md](./2026-05-12-reference-starter-release-acceptance-packet.md)
- [2026-05-13-reference-starter-go-live-stage-plan.md](./2026-05-13-reference-starter-go-live-stage-plan.md)
- [2026-05-06-go-live-preparation-packet.md](./2026-05-06-go-live-preparation-packet.md)

## 边界摘要

- 目标模块：
  - `apps/example-vue`
  - `apps/server`
  - `packages/persistence`
  - `packages/generator`
- 现有 owner：
  - `apps/example-vue`：首个参考发行版前端 owner
  - `apps/server`：HTTP / auth / go-live 运行时入口 / generator-session
  - `packages/persistence`：migration、seed、tenant 与关系型持久化
  - `packages/generator`：schema -> preview/report/apply -> artifact 的生成链路
- 影响面：
  - 首发候选冻结
  - 发布环境输入
  - migration / backup / restore
  - 目标环境演练
  - 放行结论与 blocker 分类
- 计划改动：
  - 统一下阶段目标、里程碑、出口门禁与 blocker 语义
  - 不新增平台能力，不新增第二套 starter 真相，不重写现有 owner
- 验证方式：
  - 文档自洽检查
  - `git diff --check`
  - 实施阶段按本 spec 的命令与产物清单执行
- 需要同步的文档：
  - `docs/roadmap.md`
  - 对应 `docs/plans/*` 执行包
  - 必要时 `docs/PROJECT_PROFILE.md`

## 规划结论

下阶段正式定义为：

`参考发行版 go-live 收口阶段`

该阶段只回答四个问题：

1. 当前候选是否已经冻结成唯一发布对象。
2. 目标环境输入是否已经从“口头待确认”收成“有 owner、有证据、有执行路径”。
3. 真实目标环境是否已经完成一次最小上线演练。
4. 最终是否能给出单一 `ready / not ready` 放行结论。

不在本阶段回答的问题：

- React、uniapp 是否进入首发
- workflow 是否继续进入 `transfer / delegate`
- Studio 是否首发化
- 是否引入新的发布平台、灰度、多机高可用、自动回滚
- 是否新增新的 shared owner 或跨层抽象

## 下阶段目标

把当前“仓库内已具备参考发行版基线”的状态，推进到“目标环境可演练、可归档、可放行”的状态。

完成标志：

1. 候选 commit / tag / PR 已锁定，且与验收包口径一致。
2. 环境 blocker 已映射到具体 owner，不再停留在描述层。
3. 目标环境完成最小部署与发布后冒烟。
4. 候选包、验收包、go-live 准备包与 gate 结论一致。

## 里程碑与出口

### M1 候选冻结

目标：固定唯一首发候选，并复跑仓库内验证。

必须完成：

- 锁定 `release commit`
- 锁定 `release tag` 或 `release PR`
- 复跑并归档：
  - `bun run check`
  - `bun run build:vue`
  - `bun run e2e:smoke:full`
  - `bun run server:image:verify`
  - 若触及 tenant：`bun run e2e:tenant:full`
- 更新候选包、验收包和 blocker 记录

出口门禁：

- `go-live report` 的 `M1` 为 `passed`
- 应用侧 blocker 为 `0`
- 候选对象与待发布对象不存在双口径

### M2 环境前提锁定

目标：把环境输入从“待确认”收成“有 owner 的待执行项”。

必须完成：

- 锁定 `release environment`
- 锁定 `migration list`
- 锁定 `backup / restore` 证据
- 锁定 `release roles / oncall`
- 锁定 `proxy / TLS owner`
- 将输入映射为 `go-live:*` 字段
- 必要时执行 `bun run go-live:handoff`

出口门禁：

- `go-live report` 的 `M2` 为 `passed`
- 所有环境类 blocker 都能对应 owner
- 不再使用“后续补齐”“待确认”作为阶段结论

### M3 目标环境演练

目标：在真实目标环境完成一次最小上线闭环。

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

- `go-live report` 的 `M3` 为 `passed`
- `bun run go-live:gate` 返回通过
- 停止上线条件与回滚路径已完成演练级确认

### M4 放行结论

目标：形成唯一结论，并把残留项按 owner 归档。

必须完成：

- 输出单一 `ready / not ready`
- 将残留项分类为：
  - `application`
  - `environment`
  - `out-of-scope`
- 若 `ready`，生成 release 说明
- 若 `not ready`，明确回退里程碑

出口门禁：

- `go-live report` 的 `M4` 为 `passed`
- 候选包、验收包、准备包三者结论一致
- 未完成项不再混写为应用问题或环境问题

## 默认执行顺序

1. 应用 owner 完成 `M1`
2. 发布负责人、环境 owner、DBA 完成 `M2`
3. 目标环境执行 `M3`
4. 基于 `M1-M3` 输出 `M4`

顺序约束：

- `M1` 未过，不进入 `M2`
- `M2` 未过，不进入 `M3`
- `M3` 未过，不给 `ready`

## Blocker 分类

### application

定义：

- 仓库内验证未通过
- 应用行为与验收包不一致
- 发布后最小功能冒烟失败

当前默认 owner：

- 应用 owner

### environment

定义：

- `release environment` 未锁定
- `backup / restore` 证据缺失
- `proxy / TLS`、容器启动、secret 注入未锁定
- `roles / oncall`、回滚决策权未锁定

当前默认 owner：

- 发布负责人
- 环境 owner
- DBA

### out-of-scope

定义：

- 不属于本轮首发门槛
- 属于并行研发或后续阶段
- 不影响当前参考发行版 go-live 结论

典型样例：

- React / uniapp 首发化
- workflow 高阶能力
- 重型 Studio
- 新发布平台能力

## 当前认领建议

### T1 候选冻结

- 锁定 release commit/tag/PR
- 复跑仓库内命令并补齐候选包
- 关闭应用侧 blocker 漏项

### T2 环境输入收口

- 用 `go-live-gate` 模板补齐环境字段
- 生成 `go-live:handoff` 交接包
- 锁定 backup / restore、proxy / TLS、roles / oncall

### T3 目标环境演练

- 依据 runbook 执行一次完整演练
- 归档 `go-live-report` 与 `go-live-gate-report`
- 补齐停止上线与回滚记录

### T4 放行结论

- 汇总候选包、验收包、准备包
- 输出单一 `ready / not ready`
- 将残留项分流到 `application / environment / out-of-scope`

## 验证清单

仓库内：

- `bun run check`
- `bun run build:vue`
- `bun run e2e:smoke:full`
- `bun run server:image:verify`
- 若触及 tenant：`bun run e2e:tenant:full`

目标环境：

- `GET /health`
- `GET /metrics`
- 管理员登录
- 菜单与权限 gate
- 至少一个核心工作区列表
- 至少一个核心写操作
- 若触及 tenant：补 tenant 附加验证

归档产物：

- `docs/plans/2026-05-12-reference-starter-release-candidate.md`
- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`
- `artifacts/go-live/go-live-report.json`
- `artifacts/go-live/go-live-gate-report.json`

## 风险与约束

### 1. 环境问题被误写成应用问题

- 处置：强制使用 `application / environment / out-of-scope` 三类 blocker，避免责任漂移。

### 2. 首发范围继续膨胀

- 处置：本阶段只做 go-live 收口，不再把平台增强项写成当前门槛。

### 3. 文档多源导致结论不一致

- 处置：以本 spec 统一“下一阶段做什么”，以候选包、验收包、准备包承接执行证据。

### 4. 未锁环境就提前做演练

- 处置：若 `M2` 未过，不进入 `M3`。

## 非目标

- 新增第二套 starter 真相
- 继续扩大 `apps/example-vue` 的手写治理面
- 引入新的 shared helper / shared owner
- 提前实现对象存储、通知中心、复杂 BPM、自动回滚平台

## 当前推荐起手顺序

1. 先完成 `T1 候选冻结`
2. 立即进入 `T2 环境输入收口`
3. 仅当 `T2` 通过后才安排 `T3 目标环境演练`
4. 最后统一输出 `T4 放行结论`

## 完成记录模板

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```
