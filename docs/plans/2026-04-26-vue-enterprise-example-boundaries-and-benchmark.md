# 2026-04-26 Vue 企业预设示例页对标与功能边界

## 目标

- 明确 `packages/ui-enterprise-vue`、`apps/example-vue` 与当前客户工作区的职责边界。
- 说明当前示例页“不是纯样板，但也不是完整后台”的产品定位。
- 基于外部参考项目，固定下一轮前端实施顺序，避免把演示页误做成第二套平台 owner。

## 参考项目

### 1. 主参考：JeecgBoot / JeecgBoot Vue3

- 参考仓库：
  - `https://github.com/jeecgboot/JeecgBoot`
  - `https://github.com/jeecgboot/JeecgBoot-vue3`
- 适合借鉴：
  - 平台能力地图如何组织到“菜单 / 表单 / 流程 / 代码生成 / 权限”一条主线里。
  - 企业平台中“功能中心”与“业务模块”的分层方式。
  - 流程、低代码、权限等能力如何作为平台能力暴露，而不是散落在页面细节里。
- 不直接照搬：
  - 不引入其重型平台形态与历史包袱。
  - 不在当前仓库尚未确定 page registry / route registry / workspace registry owner 前，提前做全量平台式前端。

### 2. 壳层参考：vue-vben-admin

- 参考仓库：`https://github.com/vbenjs/vue-vben-admin`
- 适合借鉴：
  - 企业后台的真实导航、路由、标签页、页面切换关系。
  - 前端工程中的布局壳层与业务页面边界。
  - “可运行工作台”应具备的基础交互，不停留在展示性壳层。
- 不直接照搬：
  - 不把 `apps/example-vue` 扩写成独立后台框架。
  - 不把 schema / generator / preset contract 的 owner 转移到示例应用层。

### 3. 表单契约参考：Formily

- 参考仓库：`https://github.com/alibaba/formily`
- 适合借鉴：
  - schema 驱动表单的字段状态、联动、动态选项与长期 contract 稳定性。
  - 预设表单组件如何承接 schema，而不把页面逻辑硬编码进组件实现。
- 不直接照搬：
  - 不在当前轮引入完整动态表单引擎。
  - 不把 `ui-enterprise-vue` 变成另一套表单 DSL owner。

### 4. 边界参考：amis

- 参考仓库：`https://github.com/baidu/amis`
- 适合借鉴：
  - 配置驱动页面在“列表 / 表单 / 操作 / 组合页”上的上限形态。
  - 低代码 DSL 与运行时渲染器的能力边界。
- 不直接照搬：
  - 当前阶段不引入重量级页面 DSL。
  - 当前阶段不让示例页承担低代码平台运行时 owner。

## 当前边界结论

### 1. `packages/ui-enterprise-vue`

owner：

- 共享企业预设视觉与交互基线。
- `ElyShell`、`ElyCrudWorkspace`、`ElyTable`、`ElyQueryBar`、`ElyForm` 等预设组件实现。
- 组件输入输出 contract、slot 结构与最小事件语义。

当前不拥有：

- 业务模块路由编排。
- 具体模块的数据获取策略。
- 多页面注册中心。
- 应用级登录流、菜单装配策略与页面状态持久化策略。

### 2. `apps/example-vue`

owner：

- 示例应用装配。
- 预设组件的真实接入样例。
- 当前最小客户工作区闭环的演示与验证。

当前不拥有：

- 第二套企业预设组件实现。
- 平台级通用路由框架 owner。
- 通用 schema owner。
- 可覆盖所有模块的完整后台实现。

### 3. 当前“客户工作区”

当前已经具备：

- 会话恢复 / 登录 / 退出登录。
- 基于权限的客户列表读取。
- 客户创建 / 编辑 / 删除 / 详情查看。
- 查询栏输入与前端范围内筛选。
- 动态菜单与权限 gate 的最小接入。
- 字典项运行时装配的最小接入。

当前尚未具备：

- 真实多模块路由切换。
- 导航点击后进入不同业务页面。
- 壳层 tabs 的真实页面会话管理。
- 服务端分页 / 排序 / 条件查询协议。
- 通用页面注册中心。
- workflow、system 模块等页面的真实工作区闭环。

## 产品定位收口

当前 `apps/example-vue` 的正确定位是：

- 不是纯静态样板页。
- 是“企业预设 + schema 契约 + 最小客户模块”联调验证页。
- 不是完整多模块后台。
- 不是低代码平台前端主应用。

因此后续评审标准应改为：

- 优先判断“是否把一个真实模块闭环跑通”。
- 不再用“它看起来像完整后台吗”作为主要验收标准。
- 若要进入“完整后台”阶段，必须先显式定义路由、页面注册与模块切换的 canonical owner。

## 对标后的下一轮实施顺序

### P1. 先把“可切换”补齐

- 导航点击要产生真实页面切换，而不是只展示菜单树。
- 至少补齐 `customers / workflow / system-*` 的占位路由边界。
- 未实现的模块允许进入明确空态，但必须是“可切换的空态”，不是静态列表。

### P2. 再把“可工作的壳层动作”补齐

- tabs 要么具备真实切换语义，要么降级为非伪交互展示。
- `实时契约`、toolbar action、secondary panel action 都要有明确行为或明确移除。

### P3. 再把“客户模块从前端筛选页升级为真实工作区”

- 查询、分页、排序尽量收敛到服务端协议。
- 让 CRUD workspace 更接近真实后台列表页，而不是只承接内存态列表。

### P4. 最后才考虑“多模块后台化”

- 在 route/page registry owner 明确前，不扩写为完整系统后台。
- 在 workflow、system 模块没有最小页面 contract 前，不把示例页包装成“已完成的企业工作台”。

## 当前明确不做

- 不在 `apps/example-vue` 内新增第二套共享 UI owner。
- 不把页面演示逻辑反向沉淀进 `ui-core`。
- 不提前引入完整低代码 DSL 或页面编排器。
- 不把未来完整后台的能力写成当前已实现事实。

## 结论

当前最合理的方向不是继续堆展示信息，而是把示例页从“可看”推进到“可切换、可闭环、可验证”。

对标结论固定为：

- 平台形态参考 `JeecgBoot`
- 前端壳层参考 `vue-vben-admin`
- schema 表单稳定性参考 `Formily`
- DSL 上限与边界参考 `amis`

但当前仓库只采纳其中对下一轮最有价值的部分：先补真实路由切换与工作区交互闭环，不提前演化成重型低代码前端平台。

## 补充说明

- 默认开发样本现已由 `packages/persistence` 的 `db:seed` 提供（包含 `expense-approval v1/v2` 与 `expense-approval-condition v1`），workflow 示例页默认可验证版本历史与最小条件分支。
- `apps/example-vue` 可以保留最小的前端测试注入 seam，用于 Chrome MCP 或本地回归时稳定复现特定工作区样本。
- 这类 seam 只属于示例应用验证支撑，用于覆盖默认 seed 之外的特殊样本，不改变服务端 contract，也不构成共享 mock 基础设施 owner。
