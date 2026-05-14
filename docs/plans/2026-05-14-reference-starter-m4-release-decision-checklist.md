# 2026-05-14 参考发行版 M4 放行结论清单

更新时间：`2026-05-14`

## 目标

基于 `M1-M3` 的结果输出唯一的首发放行结论，并把残留项按 owner 和类别归档，避免出现多口径结论。

## 范围

仅覆盖 `M4 放行结论`。

### 纳入

- 输出单一 `ready / not ready`
- 统一候选包、验收包、go-live 准备包结论
- 分类残留项
- 确定回退里程碑或生成 release 说明

### 不纳入

- `M1` 候选冻结执行
- `M2` 环境前提锁定执行
- `M3` 目标环境演练执行
- 新功能、新 owner、新发布平台能力

## 前提

- 仅在 `M1-M3` 结果已归档后进入本清单。
- 若 `M3` 未通过，不得输出 `ready`。
- 若候选包、验收包、go-live 准备包结论不一致，先修正文档口径，再输出结论。

## 决策输入

必须汇总：

- `docs/plans/2026-05-12-reference-starter-release-candidate.md`
- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`
- `docs/plans/2026-05-06-go-live-preparation-packet.md`
- `artifacts/go-live/go-live-report.json`
- `artifacts/go-live/go-live-gate-report.json`

## 执行项

### 1. 汇总 `M1-M3` 结论

必须确认：

- `M1` 是否通过
- `M2` 是否通过
- `M3` 是否通过
- 当前 `go-live report` 的 `M4` 是否为 `passed`

### 2. 输出唯一结论

只允许输出以下两种之一：

- `ready`
- `not ready`

规则：

- 只要 `M1/M2/M3` 任一未通过，结论只能是 `not ready`
- 只有前三层全部通过且结论一致时，才可输出 `ready`

### 3. 分类残留项

残留项必须分类为：

- `application`
- `environment`
- `out-of-scope`

要求：

- 不得把环境问题混写为应用问题
- 不得把并行研发项写成当前首发 blocker

### 4. 决定后续动作

若结论为 `ready`：

- 生成 release 说明
- 固定最终发布对象
- 归档本轮放行结论

若结论为 `not ready`：

- 明确回退到哪个里程碑修补
- 指明默认 owner
- 指明下一次复核前必须完成的输入

## 完成标准

- 已输出唯一 `ready / not ready`
- 候选包、验收包、准备包三者结论一致
- 残留 blocker 已按 `application / environment / out-of-scope` 分类
- 若 `not ready`，已明确回退里程碑
- 若 `ready`，已生成 release 说明

## 默认回退规则

- `M1` 未过：回退到 `M1 候选冻结`
- `M2` 未过：回退到 `M2 环境前提锁定`
- `M3` 未过：回退到 `M3 目标环境演练`

## 结论模板

```text
首发结论：
- ready / not ready

命令结果：
- check:
- build:vue:
- server:image:verify:
- e2e:smoke:full:
- e2e:tenant:full:

人工场景结果：
- onboarding:
- shell / auth / navigation:
- core workspace:
- generator happy path:
- production smoke:
- go-live blocker convergence:

残留 blocker：
- application:
- environment:
- out-of-scope:

回退里程碑：
- M1 / M2 / M3 / 无

结论说明：
- 
```

## 产物

- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`
- 必要时更新 `docs/plans/2026-05-12-reference-starter-release-candidate.md`
- 必要时更新 `docs/plans/2026-05-06-go-live-preparation-packet.md`
- 最终 release 说明或本轮 `not ready` 归档记录

## 推荐顺序

1. 先汇总 `M1-M3` 与 `go-live` 结果
2. 再对齐候选包、验收包、准备包
3. 然后输出唯一结论
4. 最后生成 release 说明或回退结论

## 完成记录模板

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```
