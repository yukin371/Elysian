# 2026-04-23 Phase 6A Round-2 CI 稳定性观察窗口

## 目标

为 `Phase 6A Round-2 Exit Checklist` 中的“稳定性观察窗口达标”提供统一记录模板，避免口径不一致。

## 观察范围

- 观察对象：CI `e2e-smoke` 作业
- 建议窗口：连续 5 次主干相关运行（`dev/main` push 或关键 PR）
- 判定重点：
  - `e2e:smoke:full` 是否通过
  - 是否触发 retry
  - gate 最终是否通过
  - 失败是否属于系统性问题（同类重复）

## 记录表

| # | 日期 | 触发来源 | smoke 首次结果 | 是否触发 retry | gate 结果 | 分类/结论 | 备注 |
|---|---|---|---|---|---|---|---|
| 1 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 2 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 3 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 4 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| 5 | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## 达标规则（建议）

- 5 次窗口内无“系统性 smoke 阻断”：
  - 不出现连续 2 次同类失败且无法通过修复闭环；
  - 不出现需要人工临时放宽 gate 策略才能通过的情况。
- 若出现单次依赖抖动但 retry 恢复，记录为“可接受波动”，不直接阻断出阶段。

## 输出结论模板

```text
窗口结论：
- 是否达标：是 / 否
- 主要证据：
- 阻断项（如有）：
- 建议主线：Phase 6B / Phase 5
- 进入下一阶段前置动作：
```

## 建议执行方式

1. 下载最近多次 `e2e-smoke-report` artifact（至少覆盖 5 次主干相关运行）。
2. 执行 `bun run e2e:smoke:stability:collect`，将下载目录中的快照归拢到统一输入目录。
3. 执行 `bun run e2e:smoke:stability:evidence`（可用 `ELYSIAN_SMOKE_STABILITY_EVIDENCE_INPUT_DIR` 指向收集目录）。
4. 执行 `bun run e2e:smoke:phase:decision`，从 evidence 自动生成阶段切换决策记录（Markdown）。
5. 执行 `bun run e2e:smoke:phase:gate`，做阶段出口硬门禁判定（失败时退出码非 0）。
6. 使用输出的决策记录更新“窗口结论”，并在 roadmap 对应 checklist 勾选。

也可使用一键命令：

- `bun run e2e:smoke:phase:finalize`（按顺序执行 evidence -> decision -> phase gate；建议先执行 collect）
- `bun run e2e:smoke:phase:finalize:from-downloads`（按顺序执行 collect -> evidence -> decision -> phase gate）
