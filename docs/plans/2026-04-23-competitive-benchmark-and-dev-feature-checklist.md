# 2026-04-23 竞品对标与开发功能清单

> 历史说明：本文记录 `2026-04-23` 时点基于竞品对标得出的开发判断，其中“进行中/下一轮/主线”部分属于当时结论。仓库现已完成 `P5A` 并切换到 `Phase 6B / P6B3`，因此本文应作为历史分析输入使用，而不是当前排期依据。

## 目标

明确 Elysian 相对主流 AI 应用构建平台（v0 / Bolt / Lovable / Replit Agent / Firebase Studio）的功能对比、当前优势与短板，并沉淀可执行的开发功能清单。

## 对标范围（功能维度）

1. 生成能力：从需求到代码/页面/接口的速度与质量。
2. 工程能力：代码可维护性、可审计性、可测试性、可复用性。
3. 交付能力：部署、发布、环境配置、集成生态。
4. 治理能力：阶段门禁、回归报告、风险收尾、团队协作。

## 竞品功能对比（简表）

| 维度 | v0 / Bolt / Lovable / Replit Agent / Firebase Studio（共性） | Elysian 当前状态 | 结论 |
|---|---|---|---|
| 首屏产出速度 | 强，偏“Prompt -> 可见页面/应用” | 中，偏“工程化落地” | 体验需加强 |
| 代码资产可控 | 中（平台导向） | 强（repo-native） | 明确优势 |
| 阶段治理 | 中到弱（偏快速产出） | 强（gate/report/checklist） | 明确优势 |
| CI 可追溯 | 中 | 强（smoke attempt/diagnose/index/gate/window/evidence） | 明确优势 |
| 部署开箱 | 强（平台内建） | 中（已具备 CI 与本地栈，云发布体验待补） | 待补 |
| 非工程用户上手 | 强 | 中偏弱 | 待补 |

## Elysian 开发功能清单

### A. 已完成（可用）

1. 模板与生成：
   - Generator CLI、冲突策略、原子写入、回归矩阵、报告索引与门禁。
2. 后端基础与模块：
   - auth + customer + 系统模块（user/role/menu/department/dictionary/setting/operation-log/file/notification）。
3. CI 与质量链路：
   - lint/typecheck/test/check。
   - smoke：diagnose/retry/index/gate/snapshot/window/evidence/decision/phase-gate/finalize/from-downloads。
4. 阶段治理：
   - roadmap + plans + exit checklist + 稳定性观察窗口文档。

### B. 进行中（本阶段主线）

1. 当时主线：Phase 5 / P5A 启动：
   - 固定自然语言输入模板、验收语料与 `AI -> Schema` 结构化输出边界。
   - 打通“AI 输出可校验 schema，再交给 generator”的最小入口。
   - 暂不进入交互式 AI 助手与 `Phase 6B` 企业增强范围。

### C. 待补（对标差距）

1. 体验层（优先级高）：
   - 一键 bootstrap（从需求模板到本地可运行）。
   - 过程可视化（阶段状态、报告聚合、失败定位）。
2. 交付层（优先级高）：
   - 标准化云部署模板（最小生产发布路径）。
   - 环境变量与密钥管理指南（dev/staging/prod）。
3. 协作层（优先级中）：
   - 外部 AI 使用说明模板（输入规范、输出约束、验收清单）。
   - 常见问题与回滚手册（失败场景到修复路径）。

## 可执行任务清单（当时下一轮）

### WP-1 真实窗口判定落地

- [x] 下载最近 5 次 `e2e-smoke-report` artifact。
- [x] 执行 `bun run e2e:smoke:phase:finalize:from-downloads`。
- [x] 产出并归档：
  - `e2e-smoke-stability-evidence.json`
  - `e2e-smoke-phase-transition-decision.md`
- [x] 在 `docs/roadmap.md` 勾选/更新 Round-2 Exit Checklist。

### WP-2 `P5A` 入口约束

- [ ] 固定需求输入模板与样例语料。
- [ ] 明确 `AI -> Schema -> generator` handoff 边界。
- [ ] 定义失败时的人工接管与回放最小要求。

### WP-3 开发体验增强（CLI 引导）

- [ ] 新增“需求输入模板 + 生成命令模板”。
- [ ] 增加 `doctor`/`status` 子命令（检查环境与阶段状态）。
- [ ] 增加“首次运行最短路径”文档与脚本。

### WP-4 交付体验增强（部署模板）

- [ ] 提供最小部署模板（server + db + migrate + health check）。
- [ ] 提供环境配置清单与示例。
- [ ] 提供发布前检查命令（与现有 gate 对齐）。

## 验收标准

1. 阶段验收：
   - 真实 5 次窗口证据可复现。
   - `phase:gate` 判定与文档结论一致。
2. 工程验收：
   - `bun run check` 通过。
   - CI `validate` 与关键 e2e 作业通过。
3. 文档验收：
   - roadmap / project profile / plans 同步一致。

## 结论

Elysian 当前差异化优势已明确：`工程可控 + 阶段治理 + 质量可追溯`。在 `2026-04-23` 当时判断里，`Phase 6A Round-2` 收尾后的下一主线是 `Phase 5 / P5A`，重点仍然是“体验层与交付层”补齐，但必须通过 schema / generator 边界推进，而不是直接放大 AI 自由度。

后续状态补记：

- 上述判断现已归档。
- 当前执行主线已转为 `Phase 6B / P6B3`，并聚焦多租户迁移/发布演练与责任边界收口。
