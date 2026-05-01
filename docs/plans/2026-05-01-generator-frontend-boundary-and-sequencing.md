# 2026-05-01 Generator / Frontend 边界与执行顺序

## 目标

- 回答当前争议：`2026-04-30` 前端痛点文档与 generator 缺口之间是什么关系。
- 明确“继续手写标准 CRUD 页面”为什么会偏离仓库目标。
- 给出后续执行顺序，避免在 `apps/example-vue` 与 `packages/generator` 两侧重复建设。

## 触发背景

当前仓库已经完成：

- `apps/example-vue` 前端脊柱第一阶段收口
- 标准 CRUD workspace 本地工厂化
- generator preview / report / session / staging apply 最小闭环

但用户已明确指出一个方向性问题：

- 项目目标不是“长期手写后台 CRUD”
- 而是“代码生成器 + AI 辅助开发平台”

这意味着：

- `2026-04-30-frontend-vue-pain-points.md` 仍然有效，但它解决的是“前端手工维护成本过高”
- 它不能替代 generator 路线，也不能把本应进入 generator 的标准化能力永久留在 `apps/example-vue`

## 现状判断

### 1. 4.30 痛点文档解决的是什么

`docs/plans/2026-04-30-frontend-vue-pain-points.md` 主要解决：

- `App.vue` 装配过大
- workspace 注册与路由接线过度手写
- 标准 CRUD composable 大量重复
- props 透传和样式重复

这些问题的 canonical owner 仍然是：

- `apps/example-vue`

原因：

- 这是示例应用本地装配问题
- 属于运行时状态、路由、工作区渲染接线
- 不属于 generator 模板内核

### 2. 4.27 generator 缺口文档解决的是什么

`docs/plans/2026-04-27-codegen-sql-security-feature-matrix-and-gap-design.md` 主要定义：

- generator 内核已经具备哪些能力
- Studio 化、diff 审查、SQL proposal、preset、导入链路还差什么

这些问题的 canonical owner 分别是：

- `packages/generator`：模板、preview/report、安全写入、再生成规则
- `apps/server`：session、权限、apply 审计
- `apps/example-vue`：Studio 装配与展示

### 3. 当前真正的矛盾点

当前不是“generator 不存在”。

当前真实矛盾是：

- generator 底座已经明显进展
- 但标准 CRUD 的前端最终落地仍有较多本地手写装配
- 如果继续只在 `apps/example-vue` 做局部收口，长期会形成“生成器存在，但生成结果接不上平台”的双轨维护

## 边界裁剪

### 应继续留在 `apps/example-vue` 的内容

以下内容不应上推到 generator：

1. 示例应用本地壳层装配
2. 会话页、登录态恢复、访问门禁
3. 本地 workspace 路由同步
4. 工作区运行时 provide/inject
5. 示例页专用导览与展示差异
6. generator preview workspace 本身的 UI 编排

原因：

- 它们是运行时行为，不是模板产物
- `ARCHITECTURE_GUARDRAILS.md` 已明确 `packages/generator` 不拥有页面运行时状态管理

### 应逐步进入 `packages/generator` 的内容

以下内容不应长期靠手写维持：

1. 标准 CRUD 页面骨架
2. 标准 CRUD 查询表单 / 表格 / 详情区块的模板结构
3. 与 `ModuleSchema` 对齐的字段展示规则
4. 标准模块的路由 / 导航 / 权限注册产物
5. 标准生成结果进入前端注册中心所需的静态 artifact

原因：

- 这些内容具备高度重复模式
- 它们与 `schema -> page` 的生成关系稳定
- 继续靠 example-vue 手写，会削弱 generator 作为平台核心的价值

### 暂时不应进入 generator 的内容

以下能力目前不应抢先推进：

1. 通用页面运行时状态容器
2. 复杂交互编排器
3. 跨应用共享的前端路由框架
4. 非标准 workspace 的统一工厂
5. 直接写入正式业务模块目录的重型 Studio 流程

原因：

- 当前 owner 不稳定
- 现有验证链路主要覆盖标准 CRUD 与 preview/apply 闭环
- 过早平台化会把 `apps/example-vue` 的运行时职责错误迁入 generator

## 顺序判断

## 当前推荐顺序

### 第一顺序：先完成 example-vue 当前已经启动的本地收口 ✅ 已完成

范围：

- `M5 / provide-inject`
- `M5 / 共享样式下沉`
- `M6A / 类型网关`

原因：

- 这些工作直接降低当前 example-vue 的维护噪声
- 也能把“哪些是运行时装配，哪些是标准模板产物”切得更清楚
- 不先做这一步，后面抽 generator 协议时容易混入本地运行时细节

注意：

- 这一阶段只能继续做“本地壳层减手写”
- 不应继续扩写更多手写 CRUD 特例

### 第二顺序：定义 generator 到前端注册层的正式静态契约 ✅ 已完成

最小目标：

1. generator 生成标准 CRUD 模块时，产出可注册的前端 artifact
2. artifact 至少描述：
   - module code
   - route segment
   - permission code
   - 页面组件入口
   - 标准 CRUD 字段元数据
3. example-vue 只负责消费 artifact 并注册，不再手写同构记录

建议 owner：

- artifact 形状：`packages/generator`
- artifact 消费装配：`apps/example-vue`

### 第三顺序：把标准 CRUD main/panel 页面骨架回收到 generator 模板 🚧 当前活跃

最小目标：

1. 新增一个标准 CRUD 模块时，不再手写 main/panel 大体结构
2. 只保留少量本地扩展槽位
3. 非标准 workspace 继续独立实现

排除项：

- `customer`
- `operation-log`
- `workflow`
- `file`
- `auth-session`
- `generator-preview`

这些模块当前都不应被机械视为“标准 CRUD 模板”的验证对象。

### 第四顺序：再补 Studio 化缺口

包括：

1. 更细粒度 diff / 冲突解释
2. 正式人工确认流
3. preset / profile
4. 表结构导入反推 `ModuleSchema`
5. proposal 到正式 migration 的人工接入规范

原因：

- 这些能力是 generator 产品化增强
- 但它们不直接解决“标准 CRUD 仍在手写”的根问题

## 当前结论

一句话结论：

- `4.30` 文档解决的是 example-vue 本地维护成本
- `4.27` 文档解决的是 generator 能力缺口
- 当前下一步不该继续无边界手写 CRUD
- 但也不该把 example-vue 的运行时装配职责粗暴迁进 generator

更准确的执行口径应当是：

1. 先完成当前前端本地收口，只做减手写，不再扩写新手工模式
2. 紧接着定义 generator -> frontend registration artifact
3. 再把标准 CRUD 页面骨架与注册信息回收到 generator
4. 最后继续补 Studio 化和 SQL 产品化缺口

## 对现有计划的影响

- `2026-04-30-architecture-refactor-execution-plan.md`
  - `M5 / M6A` 继续有效
  - 但其后续不应默认继续留在 example-vue 手写层
- `2026-04-27-codegen-sql-security-feature-matrix-and-gap-design.md`
  - 仍然是 generator 缺口主文档
  - 本文档只补“与前端本地治理之间的边界和顺序”

## 后续实施入口

下一刀代码应优先从以下两类中二选一：

1. `apps/example-vue`
   - 收尾 `provide/inject`
   - 收尾共享样式下沉
   - 建立类型网关

2. `packages/generator` + `apps/example-vue`
   - 为标准 CRUD 模块定义前端注册 artifact
   - 先补契约与测试，再决定是否开始替换现有手写注册

当前更推荐先做第 1 类的收尾，再立即切到第 2 类，避免继续在手写 CRUD 页面上追加投资。
