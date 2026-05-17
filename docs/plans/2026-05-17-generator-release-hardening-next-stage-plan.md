# 2026-05-17 Generator 可发布闭环硬化下阶段计划

更新时间：`2026-05-17`

## 定位

本文件规划 `Phase G Generator 真链路收口` 之后的候选阶段。它不直接宣布 `Phase G` 已结束，也不把导入链路、正式 migration 自动化或新的发布平台能力写入当前完成定义。

候选阶段名称：

`Generator 可发布闭环硬化`

若需要在 roadmap 中使用阶段代号，可暂称为 `Phase H Candidate`；只有当 `Phase G` 出口门禁完成并同步文档后，才允许把它切为当前主线。

## 边界摘要

目标模块：
- `apps/example-vue`
- `apps/server`
- `packages/persistence`
- `packages/generator`
- `.github/workflows/ci.yml`
- `scripts/*generator*`

现有 owner：
- `apps/example-vue`：真实 `generator preview` workspace、`demohub` 原型试稿、用户动作语义、证据展示
- `apps/server`：`generator-session` 的 preview / review / confirm / apply 编排与响应契约
- `packages/persistence`：review-only SQL proposal snapshot 与 handoff artifact canonical owner
- `packages/generator`：schema -> preview/report/apply artifact，不拥有前端运行时、不拥有正式 migration
- `scripts` / CI：阶段验证入口、报告索引、门禁与 artifact 归档，不拥有业务实现

影响面：
- Generator 真链路的自动化验收
- apply 阻断、drift、recovery 与 confirmation evidence 的回看体验
- generator 报告索引、门禁、CI artifact 与截图证据
- 导入链路是否进入后续主线的边界判断

计划改动：
- 先完成 `Phase G` 出口锁定，再进入本阶段
- 把现有 `studio / browser / matrix / cli` generator 验证收成统一可判读证据
- 硬化真实 workspace 的用户路径，但页面结构试验仍先落 `demohub`
- 强化 staging apply 和 handoff 的可回看证据，不升级为正式 migration 自动化
- 对导入链路只输出边界决策，不在本阶段实现导入 DSL 或导入平台接口

验证方式：
- `bun run check`
- `bun run build:vue`
- `bun run e2e:generator:cli`
- `bun run e2e:generator:matrix`
- `bun run e2e:generator:studio`
- `bun run e2e:generator:browser`
- `bun run e2e:generator:reports:index`
- `bun run e2e:generator:reports:gate`

需要同步的文档：
- `docs/roadmap.md`
- `docs/PROJECT_PROFILE.md`（仅当命令、CI、拓扑或长期事实变化）
- `apps/example-vue/src/MODULE.md`（仅当 workspace owner / 不变量变化）
- `apps/example-vue/PAGE_DESIGN.md` 或 `apps/example-vue/DESIGN.md`（仅当前端页面规则变化）
- 必要时新增后续 `docs/plans/*` 或 ADR

## 入口条件

进入本阶段前必须满足：

1. `Phase G` closeout 文档已记录真实 workspace 的当前事实与验证入口。
2. `bun run e2e:generator:studio` 与 `bun run e2e:generator:browser` 在目标分支上可复跑。
3. roadmap 已明确 `Phase G` 的非目标：不做导入 DSL、不做正式 migration 自动化、不新增第二套 starter。
4. 当前未提交改动已完成归属确认，不能把他人正在进行的 CI / smoke 改动误写成新阶段已完成事实。

## 阶段目标

把 `Generator` 从“真链路已打通”推进到“可作为 starter 发布基线的一条稳定、可审查、可回放闭环”。

完成标志：

1. 用户可在真实 workspace 顺畅完成 `start -> preview -> review -> confirm -> apply to staging`。
2. 阻断路径可在同一真实 workspace 回看，包括 apply rejected、stale、drift、confirmation required 与 snapshot recovery。
3. CI 和本地命令能把 generator 关键验证归并为单一报告索引与门禁结论。
4. staging apply 的边界保持清楚：不等于正式 migration，不等于生产发布，不越过 `packages/persistence` 的 proposal owner。
5. 导入链路只形成下一阶段候选决策，不在本阶段实现。

## 工作包

### H0. Phase G 出口锁定

目标：确认当前真链路收口不是只停留在单次本地运行。

必须完成：
- 复跑 `studio` 与 `browser` 两条 generator 验证。
- 确认 CI 中 browser smoke artifact 能归档 JSON report 与截图。
- 把 `Phase G` closeout、roadmap 与模块文档对齐到同一事实口径。

出口门禁：
- `bun run e2e:generator:studio`
- `bun run e2e:generator:browser`
- `bun run build:vue`
- 文档 diff 不出现“已实现导入链路”“已完成正式 migration 自动化”等越界表述。

### H1. Generator 验证证据归并

目标：让 `cli / matrix / studio / browser` 不再是分散信号。

必须完成：
- 将 browser smoke 纳入 generator 报告索引与 gate 的来源白名单。
- gate 输出中区分实现失败、浏览器结构失败、artifact 缺失与配置错误。
- CI Summary 直接展示最终 generator 结论、失败来源和 artifact 路径。

出口门禁：
- `bun run e2e:generator:reports:index`
- `bun run e2e:generator:reports:gate`
- 至少覆盖 browser report 缺失、失败、通过三种门禁输入。

### H2. 真实 workspace 用户路径硬化

目标：打磨真实 `generator preview` 页面，而不是回退到流程教学页。

必须遵守：
- 新页面结构试验先落 `demohub`。
- 正式页继续保持 `新建生成 / 最近结果 / 生成结果` 三段结构。
- `Schema JSON` 保持高级输入，不回到首屏主入口。
- 不恢复页面级步骤条，不把 `session / step / manual-schema-json` 等内部词放回首屏。

可做范围：
- 空状态、加载态、失败态和阻断证据的短文案收敛。
- review / confirm / apply 主动作的状态可用性校验。
- 文件级 diff / SQL preview / apply evidence 的覆盖层查看体验。

出口门禁：
- `bun run build:vue`
- generator workspace 相关单元测试
- `bun run e2e:generator:browser`

### H3. Apply / Handoff 证据硬化

目标：让 staging apply 的成功与失败都有可回放证据。

必须完成：
- apply 前目标文件漂移检查仍为硬门禁。
- apply 成功后 manifest、apply evidence 与 session detail 可互相回看。
- SQL proposal snapshot 缺失或损坏时，恢复状态必须显式可见。
- handoff 只读取 persistence artifact，不把 proposal owner 迁回前端或 server。

出口门禁：
- server `generator-session` lifecycle / guards / detail 测试
- `bun run e2e:generator:studio`
- 失败路径必须能落到 report，而不是只在控制台输出。

### H4. 导入链路边界决策

目标：只判断导入是否值得进入后续阶段，不在本阶段实现导入能力。

必须回答：
- 导入的 canonical owner 是谁。
- 是否复用既有 schema / generator / persistence proposal 契约。
- 是否需要新的错误报告格式。
- 是否会与当前导出、staging apply 或正式 migration owner 冲突。
- 是否需要 ADR。

明确不做：
- 不新增导入 DSL。
- 不新增导入平台接口。
- 不把文件上传、批量校验、错误回写和数据落库揉成一个阶段目标。

产物：
- 一份 `docs/plans/*import-boundary-decision*.md` 或 ADR 草案。

### H5. 发布基线回填

目标：把阶段结果回填到 starter 发布基线，而不是新增第二套 starter。

必须完成：
- 若新增或调整命令，更新 `docs/PROJECT_PROFILE.md`。
- 若 owner / 不变量变化，更新对应 `MODULE.md`。
- 若页面规则变化，更新 `PAGE_DESIGN.md` 或 `DESIGN.md`。
- roadmap 只记录当前活跃轨道和下一步，不重复长篇执行细节。

出口门禁：
- `bun run check`
- `git diff --check`
- 文档中规划态与已实现事实不混写。

## 非目标

- 不新增第二套 starter。
- 不启动 React / uniapp 首发化。
- 不把 browser smoke 扩成通用 E2E 平台。
- 不新增跨层 shared owner。
- 不把前端运行时职责迁入 `packages/generator`。
- 不把 confirm / apply 等同于正式 migration 完成。
- 不实现导入 DSL、导入 API、批量落库或导入错误报告平台。
- 不扩展 workflow `transfer / delegate`。

## 风险与处置

### 1. Browser smoke 膨胀成通用平台

处置：browser smoke 只验证真实 generator 路由和 DOM 信心层；API 仍复用 `generator-session` DTO mock，不新增第二套后端测试协议。

### 2. Apply 被误解为正式上线

处置：文案、报告和 handoff 都保留 `staging` 语义；正式 migration 仍由 persistence proposal 与人工确认路径承接。

### 3. 页面继续堆说明

处置：遵守 `PAGE_DESIGN.md` 的生成预览页规则，用结构、状态和按钮表达流程，不用长说明解释内部状态机。

### 4. 导入链路提前实现

处置：本阶段只做边界决策；若 owner、错误报告、验证链路答不清，导入不得进入实现。

## 推荐起手顺序

1. 先跑通并归档 `Phase G` 出口验证。
2. 再把 browser smoke 接入 reports index / gate。
3. 然后处理真实 workspace 的阻断证据和可回看体验。
4. 最后输出导入链路边界决策。

## 完成记录模板

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```
