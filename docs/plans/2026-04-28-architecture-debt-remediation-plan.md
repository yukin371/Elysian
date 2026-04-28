# 2026-04-28 架构债务治理方案

更新时间：`2026-04-28`

关联审查：

- [2026-04-28-architecture-debt-audit.md](./2026-04-28-architecture-debt-audit.md)

## 目标

- 把本轮已识别的架构债务从“问题清单”收口成可执行治理计划。
- 优先解决已经开始影响边界稳定性、review 成本和后续扩展成本的汇流点。
- 在不扩大 owner、不新增共享桶文件、不引入第二套基础设施的前提下完成受控治理。

## 当前结论

本轮治理优先解决的不是“功能缺口”，而是以下结构问题：

1. `apps/example-vue` 绕过 package public API，直接深引 `packages/schema/src/*`
2. `apps/example-vue/src/lib/platform-api.ts` 过度集中
3. `packages/persistence/src/auth.ts` 与 `src/schema/auth.ts` 命名失真且边界过宽
4. `packages/frontend-vue` 开始泄露具体业务样例
5. `apps/example-vue` shell 装配依赖多处硬编码汇流点
6. smoke / server 合约测试存在单文件汇流

## 设计约束

本方案执行时必须持续遵守以下约束：

- 不新增新的 shared `utils` / `helpers` / `base` 桶目录
- 不为了压文件体量把职责推到错误 owner
- 不把 `apps/example-vue` 的示例应用装配问题外溢到 `packages/*`
- 不把 `packages/persistence` 内部拆分演化成第二套 persistence owner
- 不为了“统一”把 `frontend-vue` 和 `frontend-react` 提前拉到同一抽象层
- 不在缺少验证路径时做跨层大重构

## 非目标

本轮明确不做：

- 不重写 `apps/example-vue` 为完整后台框架
- 不新增 `packages/frontend-uniapp`
- 不引入新的 route registry / page registry 平台级 owner，除非先补边界决策
- 不在本轮把所有超大文件一次性全部拆完
- 不把 `workflow`、`generator`、`SQL preview` 次级轨道抬升为当前第一优先级

## 总体顺序

建议按以下顺序推进：

1. 先修复 package public API 绕过问题
2. 再拆前端 API 汇流点
3. 再拆 persistence 内部宽边界文件
4. 再收敛 `example-vue` 的 workspace 装配模式
5. 最后治理验证层单文件汇流

原因：

- 第 1 步风险最低、收益最快，可先把错误依赖方式止损。
- 第 2 步和第 4 步都落在 `apps/example-vue`，但第 2 步是第 4 步的基础。
- 第 3 步涉及 `apps/server` 对 persistence 的消费面，应该在前端局部治理后单独推进。
- 第 5 步不直接改变生产运行态，可作为尾段收口。

## Workstream A：修复 `@elysian/schema` public API 绕过

### 目标

- 让应用层只通过 `@elysian/schema` 消费 module schema 与对外类型。

### 作用域

- `packages/schema/src/index.ts`
- `apps/example-vue/src/App.vue`

### 做法

1. 检查 `packages/schema/src/index.ts` 是否已导出审查中涉及的 module schema。
2. 若缺失，则优先在 `packages/schema` 的公开导出面补齐。
3. 将 `apps/example-vue/src/App.vue` 中所有 `../../../packages/schema/src/*` 深引替换为 `@elysian/schema`。

### 退出标准

- `apps/example-vue` 不再存在对 `packages/schema/src/*` 的深引。
- `packages/schema` 的对外导出面能覆盖当前示例应用所需 module schema。

### 验证

- `rg "packages/schema/src/" apps/example-vue/src`
- `bun run typecheck`
- `bun run build:vue`

## Workstream B：拆分 `apps/example-vue/src/lib/platform-api.ts`

### 目标

- 保持 `apps/example-vue` 本地 owner 不变，但把 transport、auth 会话和模块 API 拆开。

### 作用域

- `apps/example-vue/src/lib/platform-api.ts`
- `apps/example-vue/src/lib/*`
- 直接消费 `platform-api.ts` 的 workspace / component / app binding 文件

### 推荐落点

- `src/lib/platform-api/transport.ts`
- `src/lib/platform-api/auth.ts`
- `src/lib/platform-api/customers.ts`
- `src/lib/platform-api/users.ts`
- `src/lib/platform-api/roles.ts`
- `src/lib/platform-api/menus.ts`
- `src/lib/platform-api/settings.ts`
- `src/lib/platform-api/tenants.ts`
- `src/lib/platform-api/files.ts`
- `src/lib/platform-api/notifications.ts`
- `src/lib/platform-api/workflow.ts`
- `src/lib/platform-api/generator-preview.ts`
- `src/lib/platform-api/index.ts`

上面是推荐分组，不要求一次拆满；允许先按高频消费面做首轮拆分。

### 关键边界

- `transport.ts` 只承载：
  - `SERVER_URL`
  - `requestJson`
  - `requestBlob`
  - 错误映射
- `auth.ts` 承载：
  - access token 内存态
  - `login / refresh / logout / fetchMe`
  - refresh retry 所需最小支撑
- 各模块 client 只承载各自 DTO 与请求函数

### 风险

- 若在拆分过程中把通用请求层抽成 `src/shared/api` 之类目录，会直接制造新的无边界桶文件。
- 若把各模块 DTO 再次复制到多个文件，会形成新一轮重复 owner。

### 退出标准

- `platform-api.ts` 不再承担全模块 client 汇流。
- 认证 transport 与业务模块 client 已分离。
- 外部调用面仍可通过本地 `index.ts` 保持过渡兼容。

### 验证

- `bun run typecheck`
- `bun run build:vue`
- `bun test apps/example-vue/src/lib`

## Workstream C：拆分 `packages/persistence` 内部宽边界 `auth` 文件

### 目标

- 修复 `auth` 命名失真问题，让文件结构更贴近真实关系域，但不改变 package owner。

### 作用域

- `packages/persistence/src/auth.ts`
- `packages/persistence/src/schema/auth.ts`
- 直接消费这些文件的 `apps/server/src/modules/*`

### 推荐分段

第一段先拆 schema：

- `src/schema/user.ts`
- `src/schema/role.ts`
- `src/schema/menu.ts`
- `src/schema/department.ts`
- `src/schema/post.ts`
- `src/schema/session.ts`
- `src/schema/audit-log.ts`

第二段再拆查询 helper：

- `src/user.ts`
- `src/role.ts`
- `src/menu.ts`
- `src/department.ts`
- `src/post.ts`
- `src/session.ts`
- `src/audit-log.ts`

### 执行原则

- 先补中间 re-export，避免一次性打断 `apps/server` 消费面。
- 允许保留一个短期兼容入口文件，但该入口只做 re-export，不再继续增长。
- `data scope` 相关 helper 暂按与 `role / department / user` 的关系就近收纳，不单独抽成新的平台 owner。

### 风险

- 若直接跨 package 改 `apps/server` 模块导入且无过渡层，回归面会偏大。
- 若把拆分目标做成“所有模块都绝对对称”，容易为了形式美扩大范围。

### 退出标准

- `auth.ts` / `schema/auth.ts` 不再是继续堆叠的主入口。
- 新增系统关系域时，有明确的本地文件落点，不再默认塞进 `auth`。

### 验证

- `bun run typecheck`
- `bun test packages/persistence`
- `bun test apps/server/src/modules/auth`
- `bun test apps/server/src/modules/*`

## Workstream D：收敛 `apps/example-vue` 的 workspace 装配模式

### 目标

- 减少新增一个 workspace 时需要同时修改 `App.vue`、`ShellWorkspaceMainSwitch.vue`、`ShellWorkspaceSecondarySwitch.vue` 的同步成本。

### 作用域

- `apps/example-vue/src/App.vue`
- `apps/example-vue/src/app/*`
- `apps/example-vue/src/components/workspaces/shell/*`

### 约束

- 装配逻辑继续留在 `apps/example-vue` owner 内。
- 不把 registry 问题上推到 `packages/ui-enterprise-vue` 或 `packages/frontend-vue`。

### 推荐方向

引入本地 `workspace descriptor` 概念，只用于示例应用内部：

- 描述字段示例：
  - `workspaceKind`
  - `mainComponent`
  - `panelComponent`
  - `pageDefinition`
  - `gate`
  - `bindings selector`

### 分两步走

1. 先把 main/panel switch 的组件映射收口到本地 descriptor 表
2. 再评估 `App.vue` 中 page definition 与 workspace hook 装配能否进一步按 descriptor 分组

### 风险

- 如果把 hook 创建也完全做成动态元编程，会降低可读性和可验证性。
- 本地 registry 应服务于“少改三处”，而不是变成另一套框架。

### 退出标准

- 新增一个 workspace 时，不再默认需要手工同步改三处大文件。
- `ShellWorkspaceMainSwitch.vue` 与 `ShellWorkspaceSecondarySwitch.vue` 的 switch/if-else 链明显缩短。

### 验证

- `bun run typecheck`
- `bun run build:vue`
- 浏览器 smoke：至少覆盖 `customers / notifications / tenants / workflow / sessions`

## Workstream E：治理验证层单文件汇流

### 目标

- 降低 smoke 与 server 合约验证文件的维护成本，但不改变既有验证语义。

### 作用域

- `scripts/e2e-smoke.ts`
- `apps/server/src/app.test.ts`

### 推荐方向

`scripts/e2e-smoke.ts`：

- 按 `env/bootstrap`、`helpers`、`cases`、`report` 拆本地文件

`apps/server/src/app.test.ts`：

- 按模块或能力主题拆分，例如：
  - `app.auth.test.ts`
  - `app.customer.test.ts`
  - `app.system-modules.test.ts`
  - `app.workflow.test.ts`

### 风险

- 若边拆边改断言语义，会把“结构治理”混成“行为调整”。
- 应保持测试行为先不变，先做文件组织收敛。

### 退出标准

- `e2e-smoke.ts` 不再同时承担完整编排和全部辅助逻辑。
- `app.test.ts` 不再是唯一 server 合约总测文件。

### 验证

- `bun run test`
- 关键验证命令保持可用：
  - `bun run e2e:smoke`
  - `bun run check`

## 推荐批次

### Batch 1：低风险止损

- Workstream A
- Workstream B 的 transport/auth 首轮拆分

目标：

- 先修正错误依赖方式
- 先降低前端 API 汇流点增长速度

### Batch 2：局部结构收口

- Workstream B 剩余模块 client
- Workstream D 第一阶段

目标：

- 先把 `apps/example-vue` 的新增模块改动面降下来

### Batch 3：持久化内部治理

- Workstream C

目标：

- 修正 persistence 内部文件边界与命名失真

### Batch 4：验证层收尾

- Workstream E

目标：

- 把验证层的维护成本降下来，为后续持续迭代减压

## 每批次统一检查项

每个批次提交前至少检查：

1. 是否仍守住 canonical owner
2. 是否新增了无边界 shared 桶目录
3. 是否通过最小验证命令
4. 是否需要同步 `MODULE.md`
5. 是否只是“把大文件拆成更多大文件”

## 文档同步触发条件

以下情况再同步长期文档：

- 若 `packages/schema` 的 public export 规则发生长期变化，同步 `packages/schema/MODULE.md`
- 若 `apps/example-vue` 的本地装配边界发生长期变化，同步 `apps/example-vue/src/MODULE.md`
- 若 `packages/persistence` 的内部关系型 schema 组织方式发生长期变化，同步 `packages/persistence/MODULE.md`
- 若治理过程中需要改变 canonical owner 或依赖方向，再补 `ARCHITECTURE_GUARDRAILS.md` 或 ADR

## 风险与回滚

### 主要风险

- 治理过程中顺手扩大到“重构整个应用”
- 为了形式统一引入新的抽象层
- 在 `apps/example-vue` 与 `packages/frontend-vue` 之间错误搬运职责
- 在 `packages/persistence` 内部拆分时打断 `apps/server` 消费链路

### 回滚策略

- 每个 workstream 独立提交，避免多类治理混在一个 commit
- 先加 re-export 兼容层，再逐步迁移引用
- 若某一批次验证失败，仅回滚该批次，不回退已验证通过的前序批次

## 阶段出口

满足以下条件，可认为本轮架构债务治理已完成首轮收口：

- `apps/example-vue` 不再深引 `packages/schema/src/*`
- `platform-api.ts` 已拆成可维护的本地 client 结构
- `packages/persistence` 不再以 `auth.ts` / `schema/auth.ts` 作为继续膨胀的默认入口
- `example-vue` 新增 workspace 的改动面下降
- smoke / server 合约测试不再依赖单个超大文件继续增长

## 结果摘要

- 本方案把 6 项债务整理为 5 个 workstream、4 个批次。
- 优先级核心不是“大拆特拆”，而是先止损错误依赖，再收敛局部 owner 内部的汇流点。
- 后续实施时，应优先追求边界更稳、改动面更小、验证更明确，而不是追求形式上的绝对整齐。
