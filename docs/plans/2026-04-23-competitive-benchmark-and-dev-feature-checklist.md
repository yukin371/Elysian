# 2026-04-23 竞品对标与开发功能清单

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

1. Phase 6A Round-2 收尾：
   - 用真实最近 5 次远端 artifact 执行 `phase:finalize:from-downloads`。
   - 形成阶段结论并更新 roadmap exit checklist。

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

## 可执行任务清单（下一轮）

### WP-1 真实窗口判定落地

- [ ] 下载最近 5 次 `e2e-smoke-report` artifact。
- [ ] 执行 `bun run e2e:smoke:phase:finalize:from-downloads`。
- [ ] 产出并归档：
  - `e2e-smoke-stability-evidence.json`
  - `e2e-smoke-phase-transition-decision.md`
- [ ] 在 `docs/roadmap.md` 勾选/更新 Round-2 Exit Checklist。

### WP-2 开发体验增强（CLI 引导）

- [ ] 新增“需求输入模板 + 生成命令模板”。
- [ ] 增加 `doctor`/`status` 子命令（检查环境与阶段状态）。
- [ ] 增加“首次运行最短路径”文档与脚本。

### WP-3 交付体验增强（部署模板）

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

Elysian 当前差异化优势已明确：`工程可控 + 阶段治理 + 质量可追溯`。下一阶段重点不在继续堆底层能力，而在“体验层与交付层”补齐，确保外部 AI 与开发者可以更快、更稳地复用。
