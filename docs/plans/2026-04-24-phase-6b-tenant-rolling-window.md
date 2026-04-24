# 2026-04-24 Phase 6B Tenant Rolling Window Record

## 目标

记录 `Phase 6B` 首轮“更高规模 tenant 样本”滚动观察结果，验证现有 tenant download / collect / evidence / decision / gate 链路是否可以直接承接 `10` 次窗口。

## 观察范围

- 观察对象：`feature-p6b1-tenant-isolation` 上最近 `10` 次成功的 `workflow_dispatch`
- 窗口大小：`10`
- 执行命令：

```bash
ELYSIAN_TENANT_STABILITY_WINDOW_SIZE=10 bun run e2e:tenant:upgrade:finalize:from-github -- --branch feature-p6b1-tenant-isolation --limit 10 --scan-limit 20
```

## 记录表

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
  - 当前 feature 分支窗口内不存在系统性失败信号

## 限制说明

- 该窗口是 `feature-p6b1-tenant-isolation` 分支级观察，不等同于 `dev/main` 的长期主线观察。
- 最近 `10` 次样本跨越了 `cca12cf`、`154e343`、`7a6125f` 三个实现头；其中后两个新 head 仅包含文档治理改动，不代表新增 tenant 运行时代码已再次放大验证。

## 证据产物

- `artifacts/downloads/tenant/e2e-tenant-stability-download-report.json`
- `artifacts/tenant/e2e-tenant-stability-collect-report.json`
- `artifacts/tenant-stability-evidence/e2e-tenant-stability-evidence.json`
- `artifacts/tenant-stability-evidence/e2e-tenant-upgrade-decision.md`

## 下一步

1. 把同一 `10` 次滚动观察策略迁移到 `dev/main`，形成主线级第一版记录。
2. 等 `dev/main` 的 tenant artifact 密度稳定后，再判断是否把 Level 2 从“建议”升级为硬门槛。
3. 在生产部署平台明确后，再补发布后观察的责任边界与平台级命令。
