# 2026-05-14 参考发行版 M1 候选冻结清单

更新时间：`2026-05-14`

## 目标

把当前参考发行版候选冻结成唯一发布对象，并把仓库内验证重新锁到可追溯证据。

## 范围

仅覆盖 `M1 候选冻结`。

### 纳入

- 锁定候选 commit / tag / PR
- 复跑仓库内验证
- 更新候选包、验收包、blocker 记录

### 不纳入

- M2 环境前提锁定
- M3 目标环境演练
- M4 放行结论
- 新平台能力、新 owner、新抽象

## 前提

- 当前候选仍以参考发行版主线为准，不扩展到 React、uniapp、复杂 BPM 或新发布平台能力。
- 若最终提交尚未完成，不得把工作区状态误写成已冻结发布对象。

## 执行项

### 1. 锁定发布对象

- 确认最终 `release commit`
- 确认 `release tag` 或 `release PR`
- 确认候选包引用的是同一对象

### 2. 复跑仓库内验证

- `bun run check`
- `bun run build:vue`
- `bun run e2e:smoke:full`
- `bun run server:image:verify`
- 若本轮触及 tenant：`bun run e2e:tenant:full`

### 3. 更新候选材料

- 更新候选发布包
- 更新验收包
- 更新 blocker 归档
- 若结论变化，统一写入 progress 记录

### 4. 归档证据

- 记录执行命令
- 记录通过/失败结论
- 记录最终冻结对象

## 完成标准

- 候选对象唯一且已冻结
- 仓库内验证全部通过或已显式记录失败原因
- 应用侧 blocker 为 `0`
- 候选包与验收包口径一致

## 阻断项

### application

- 仓库内验证失败
- 参考发行版体验与验收包不一致
- 候选包与实际冻结对象不一致

### out-of-scope

- 环境 owner 未锁定
- `release environment` 未锁定
- `backup / restore`、`proxy / TLS`、`roles / oncall` 未锁定

## 产物

- `docs/plans/2026-05-12-reference-starter-release-candidate.md`
- `docs/plans/2026-05-12-reference-starter-release-acceptance-packet.md`
- `docs/plans/2026-05-12-reference-starter-release-progress.md`

## 推荐顺序

1. 先锁定最终候选对象
2. 再复跑仓库内验证
3. 最后更新候选包和 blocker 归档

## 完成记录模板

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```
