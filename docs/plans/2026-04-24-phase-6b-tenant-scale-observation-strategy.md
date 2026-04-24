# 2026-04-24 Phase 6B Tenant Scale Observation Strategy

## 目的

在当前 `5/5` tenant 观察窗口达标之后，补齐“更高规模样本与回归频率策略”，避免：

- 把一次达标窗口误判为长期稳定
- 每次 tenant 相关改动都临时决定观察规模
- roadmap、upgrade runbook 与 release runbook 对“还要观察多少”给出不同口径

## 当前基线

- 已有真实 PostgreSQL tenant e2e
- CI 已归档 `e2e-tenant-report` 与 `e2e-tenant-stability-snapshot.json`
- 已有下载、collect、evidence、decision、gate、finalize 链路
- 已完成首个达标窗口：
  - `windowSize=5`
  - `selectedWindowRuns=5`
  - `failedRunCount=0`
  - `systemicBlockerDetected=false`
  - `recommendation=candidate_for_next_step`

## 适用范围

适用于以下场景的后续观察策略：

- tenant schema / migration 变更后
- tenant context / RLS / bootstrap 变更后
- 准备从 `dev` 进入 `main` 的 tenant 相关发布前
- 发布后需要继续确认 tenant CI 没有出现系统性回归时

## 不改变的基线

本策略不会覆盖已有硬门槛：

- 升级执行评审仍以 [2026-04-24-phase-6b-tenant-upgrade-runbook.md](./2026-04-24-phase-6b-tenant-upgrade-runbook.md) 为准
- 迁移 / 发布顺序仍以 [2026-04-24-phase-6b-tenant-migration-release-runbook.md](./2026-04-24-phase-6b-tenant-migration-release-runbook.md) 为准
- 同一实现头的最低真实观察基线仍是 `5/5`

换言之，“更高规模样本”是建立在 `5/5` 已达标之后的持续观察层，而不是替代当前门禁。

## 分层策略

### Level 1: 同一实现头发布前门槛

用途：

- 判断某个 tenant 相关实现头是否具备进入升级执行评审 / 发布评审的资格

口径：

- 观察对象：同一实现头的 `workflow_dispatch`
- 最低窗口：`5/5`
- 通过条件：
  - `failedRunCount=0`
  - `maxConsecutiveFailedRuns=0`
  - `systemicBlockerDetected=false`

说明：

- 这是当前已经落地并通过的门槛
- 只要实现头变化，就不能继承旧窗口

### Level 2: 分支级滚动稳定性观察

用途：

- 判断 tenant 能力在持续集成过程中是否保持稳定，而不是只在单一实现头上短时稳定

建议口径：

- 观察对象：
  - `dev` / `main` 相关 CI tenant 运行
  - 必要时补 `workflow_dispatch` 作为对照样本
- 建议窗口：最近 `10` 次可用 tenant snapshot
- 建议扫描范围：最近 `20` 次 CI 运行中提取 tenant artifact

通过条件（建议）：

- `10` 次窗口内：
  - `failedRunCount <= 1`
  - `maxConsecutiveFailedRuns <= 1`
  - `systemicBlockerDetected=false`
- 若唯一失败属于依赖或环境抖动，且后续样本恢复，可记录为“可接受波动”
- 若出现连续 2 次 tenant 失败，立即退出“稳定”判断，回到人工排查

说明：

- Level 2 不是阶段入口硬门槛，而是分支持续健康度信号
- 当前脚本链路已足够支撑该观察，不要求新增新的 CI owner

### Level 3: 发布后回归频率观察

用途：

- 在 tenant 改动进入 `main` 之后，确认没有因为后续集成而出现回归漂移

建议口径：

- 观察对象：`main` 上最近 tenant 相关 CI 运行
- 建议窗口：
  - 最近 `10` 次运行
  - 或最近 `14` 天内的可用 tenant snapshot，以先达到者为准

关注点：

- tenant e2e 是否仍持续产出 artifact
- 是否出现系统性失败或连续失败
- 是否出现“必须人工放宽策略才通过”的情况

说明：

- 当前仓库尚未固定生产平台，因此这里先观察 CI 层，不虚构线上指标采集

## 推荐频率

### tenant 高风险改动

定义：

- 触及 schema / migration / RLS / tenant context / `db:seed` / `tenant:init` / tenant 写路径

频率：

- 合并前：必须重建 Level 1 的 `5/5`
- 合并后：在 `dev` 或候选分支上补一次 Level 2 滚动窗口检查

### tenant 中风险改动

定义：

- 触及 tenant 管理接口、权限边界、租户感知查询，但未改变 schema / migration / bootstrap

频率：

- 合并前：至少执行一次 `bun run e2e:tenant:full`
- 若实现头变化且影响 tenant 核心边界，仍建议重建 `5/5`
- 合并后：纳入下一次 Level 2 窗口观察

### 非 tenant 直接改动

定义：

- 文档、非租户业务模块、与 tenant 无直接语义耦合的改动

频率：

- 不要求单独重建 tenant 观察窗口
- 但 tenant CI artifact 仍应纳入正常滚动观察

## 建议执行方式

### Level 1

继续使用：

```bash
bun run e2e:tenant:upgrade:finalize:from-github -- --branch <branch> --limit 5 --scan-limit 15
```

### Level 2 / Level 3

当前不新增脚本，只复用现有下载与收尾链路，调整窗口参数：

```bash
ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10 bun run e2e:tenant:upgrade:finalize:from-github -- --branch <branch> --limit 10 --scan-limit 20
```

建议解释：

- `ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10`：显式把 evidence 窗口从默认 `5` 提升到 `10`
- `limit 10`：对应滚动观察窗口
- `scan-limit 20`：给 artifact 缺失、非 tenant 相关运行或失败运行留出扫描空间

若未来 `main` / `dev` 的 tenant artifact 密度上升，可再把 `scan-limit` 提到 `30`，但在当前阶段不强制。

## 退出稳定状态的条件

满足任一条件，应停止把 tenant 视为“持续稳定”：

1. Level 2 或 Level 3 出现连续 2 次失败
2. `systemicBlockerDetected=true`
3. 同一类 tenant 失败在 `10` 次窗口内重复出现 2 次以上
4. 为通过 tenant gate 临时修改阈值、跳过检查或手工绕过脚本

触发后动作：

1. 回到 upgrade runbook 的人工评审路径
2. 先定位失败是代码、环境还是依赖问题
3. 修复后重新建立新的观察窗口

## 当前建议结论

现阶段建议按以下顺序推进：

1. 保持 Level 1 的 `5/5` 作为 tenant 改动进入发布评审前的最低门槛
2. 把最近 `10` 次 tenant artifact 的滚动观察作为下一阶段新增策略
3. 在生产部署平台明确前，不再引入更重的线上稳定性 owner
4. 等 `dev/main` 上 tenant artifact 积累到足够密度后，再决定是否把 Level 2 从“建议”升级为硬门槛

## 后续待补

- 基于真实 `dev/main` 数据补第一版 `10` 次滚动观察记录
- 明确 Level 2 是否需要单独的 decision / gate 产物命名
- 在生产部署平台确定后，补 CI 观察到发布后观察的责任切分
