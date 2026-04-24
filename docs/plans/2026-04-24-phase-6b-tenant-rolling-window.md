# 2026-04-24 Phase 6B Tenant Rolling Window Record

## 目标

记录 `Phase 6B` 从功能分支到主线分支的 `10` 次 tenant 滚动观察结果，验证现有 tenant download / collect / evidence / decision / gate 链路是否可以直接承接 `feature -> dev -> main` 的连续晋级。

## 观察范围

- 观察对象：
  - `feature-p6b1-tenant-isolation` 最近 `10` 次成功的 `workflow_dispatch`
  - `dev` 最近 `10` 次可用 tenant artifact
  - `main` 最近 `10` 次可用 tenant artifact
- 窗口大小：`10`
- 执行命令：

```bash
ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10 bun run e2e:tenant:upgrade:finalize:from-github -- --branch feature-p6b1-tenant-isolation --limit 10 --scan-limit 20
```

## 记录表

### feature-p6b1-tenant-isolation

| # | createdAt (UTC) | runId | headSha | 结果 | 备注 |
|---|---|---|---|---|---|
| 1 | 2026-04-24T11:29:25Z | `24887191148` | `7a6125f...` | passed | 文档阶段继续观察样本 |
| 2 | 2026-04-24T11:28:03Z | `24887139395` | `7a6125f...` | passed | 文档阶段继续观察样本 |
| 3 | 2026-04-24T11:26:50Z | `24887089834` | `7a6125f...` | passed | 文档阶段继续观察样本 |
| 4 | 2026-04-24T11:25:22Z | `24887032527` | `7a6125f...` | passed | 文档阶段继续观察样本 |
| 5 | 2026-04-24T11:10:19Z | `24886462252` | `154e343...` | passed | 首轮 `5/5` 观察窗口样本 |
| 6 | 2026-04-24T11:08:50Z | `24886403317` | `154e343...` | passed | 首轮 `5/5` 观察窗口样本 |
| 7 | 2026-04-24T11:07:30Z | `24886352160` | `154e343...` | passed | 首轮 `5/5` 观察窗口样本 |
| 8 | 2026-04-24T11:05:45Z | `24886285868` | `154e343...` | passed | 首轮 `5/5` 观察窗口样本 |
| 9 | 2026-04-24T11:03:04Z | `24886175279` | `154e343...` | passed | 首轮 `5/5` 观察窗口样本 |
| 10 | 2026-04-24T10:57:29Z | `24885957451` | `cca12cf...` | passed | 首个真实 GitHub observation 样本 |

### dev

| # | createdAt (UTC) | runId | 触发方式 | 结果 | 备注 |
|---|---|---|---|---|---|
| 1 | 2026-04-24T11:59:59Z | `24888362434` | workflow_dispatch | passed | 主线级首批手动样本 |
| 2 | 2026-04-24T11:58:15Z | `24888296758` | push | passed | PR #3 合入 `dev` 后首个主线样本 |
| 3 | 2026-04-24T12:04:19Z | `24888586126` | workflow_dispatch | passed | 主线滚动观察样本 |
| 4 | 2026-04-24T12:05:40Z | `24888651338` | workflow_dispatch | passed | 主线滚动观察样本 |
| 5 | 2026-04-24T12:07:03Z | `24888706653` | workflow_dispatch | passed | 主线滚动观察样本 |
| 6 | 2026-04-24T12:08:26Z | `24888757984` | workflow_dispatch | passed | 主线滚动观察样本 |
| 7 | 2026-04-24T12:09:46Z | `24888812971` | workflow_dispatch | passed | 主线滚动观察样本 |
| 8 | 2026-04-24T12:11:07Z | `24888870698` | workflow_dispatch | passed | 主线滚动观察样本 |
| 9 | 2026-04-24T12:12:27Z | `24888923973` | workflow_dispatch | passed | 主线滚动观察样本 |
| 10 | 2026-04-24T12:13:51Z | `24888972790` | workflow_dispatch | passed | 主线滚动观察样本 |

### main

| # | createdAt (UTC) | runId | 触发方式 | 结果 | 备注 |
|---|---|---|---|---|---|
| 1 | 2026-04-24T12:21:47Z | `24889218600` | push | passed | PR #4 合入 `main` 后首个主线样本 |
| 2 | 2026-04-24T12:23:25Z | `24889284909` | workflow_dispatch | passed | 主线滚动观察样本 |
| 3 | 2026-04-24T12:24:48Z | `24889342252` | workflow_dispatch | passed | 主线滚动观察样本 |
| 4 | 2026-04-24T12:26:07Z | `24889396810` | workflow_dispatch | passed | 主线滚动观察样本 |
| 5 | 2026-04-24T12:27:30Z | `24889454355` | workflow_dispatch | passed | 主线滚动观察样本 |
| 6 | 2026-04-24T12:28:47Z | `24889506795` | workflow_dispatch | passed | 主线滚动观察样本 |
| 7 | 2026-04-24T12:30:07Z | `24889562531` | workflow_dispatch | passed | 主线滚动观察样本 |
| 8 | 2026-04-24T12:31:39Z | `24889627339` | workflow_dispatch | passed | 主线滚动观察样本 |
| 9 | 2026-04-24T12:33:07Z | `24889689643` | workflow_dispatch | passed | 主线滚动观察样本 |
| 10 | 2026-04-24T12:34:31Z | `24889747211` | workflow_dispatch | passed | 主线滚动观察样本 |

## 输出结论

窗口结论：

- 是否达标：是
- 主要证据：
  - `windowSize=10`
  - `selectedWindowRuns=10`
  - `failedRunCount=0`
  - `maxConsecutiveFailedRuns=0`
  - `dependencyFailureCount=0`
  - `environmentFailureCount=0`
  - `systemicBlockerDetected=false`
  - `qualifiedForNextStep=true`
  - `recommendation=candidate_for_next_step`
- 当前判断：
  - 现有 tenant 收尾链路无需新增脚本，即可支撑 `10` 次滚动观察
  - 当前 `feature/dev/main` 三条分支窗口内均不存在系统性失败信号

## 限制说明

- `feature` 窗口是分支级观察，`dev/main` 窗口则是主线级观察；三者结论一致，但仍不替代真实生产发布演练。
- `feature` 最近 `10` 次样本跨越了 `cca12cf`、`154e343`、`7a6125f` 三个实现头；其中后两个新 head 仅包含文档治理改动，不代表新增 tenant 运行时代码已再次放大验证。

## 证据产物

- `artifacts/downloads/tenant/e2e-tenant-stability-download-report.json`
- `artifacts/tenant/e2e-tenant-stability-collect-report.json`
- `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
- `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`

## 下一步

1. 基于现有 `feature/dev/main` 全部 `10/10` 结论，继续按迁移/发布 runbook 推进发布演练。
2. 等生产部署平台明确后，再补发布后观察的责任边界与平台级命令。
3. 若后续出现新的 tenant 高风险改动，对最新实现头重新建立 `5/5`，并将 `dev/main` 纳入下一轮 `10/10` 滚动观察。
