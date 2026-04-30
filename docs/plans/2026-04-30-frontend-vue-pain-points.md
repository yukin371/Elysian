# 前端 Vue 架构痛点与改进方案

> 记录日期：2026-04-30
> 触发场景：梳理 example-vue 前端架构时，发现 App.vue 职责过重只是表象，根因是缺少 workspace 注册/协议机制，每新增一个 workspace 需要改动 7+ 个文件

---

## 痛点 1：App.vue 职责过重，是 7+ 处手动接线的汇聚点

### 现状

`App.vue` 当前 39KB，同时承担：

- locale 运行时初始化
- 15 个 `xxxModuleReady` ref 声明（第 119-132 行）
- 12 个 `xxxExportLoading` ref 声明（第 133-144 行）
- 16 个 workspace composable 初始化
- navigation / gates / shell bindings / csv exports / session orchestration 组装
- 50+ 个 localize 函数解构（第 76-109 行）

MODULE.md 已记录了临时豁免，但问题是 App.vue 不是"一个大文件"，而是"所有手动接线的唯一汇聚点"。

### 问题

- 新增 workspace 必须改 App.vue，且改动分散在 import、ref 声明、composable 调用、template 绑定多处
- App.vue 改动频率最高，多人协作时合并冲突集中
- 阅读者无法快速理解"一个 workspace 从注册到渲染经过了哪些步骤"

### 决策：随痛点 3/6 落地自然缓解

App.vue 膨胀是表象，不是根因。当 workspace 注册表（痛点 6）接管了路由/导航/gates 的统一推导，CRUD 工厂（痛点 3）接管了 composable 的标准化创建，provide/inject（痛点 4）消除了 props 透传后，App.vue 的职责自然收敛为：

1. locale 初始化
2. 消费注册表创建 shell
3. 路由匹配 → workspace factory → provide

预计从 39KB 降到 5KB 以内。不需要对 App.vue 单独做拆分。

---

## 痛点 2：前端类型定义与后端 OpenAPI 手动同步

### 现状

`lib/platform-api/` 下每个模块手写了 Record、Response、ListQuery 类型：

```ts
// lib/platform-api/customer.ts — 手写
export interface CustomerRecord {
  id: string; name: string; status: "active" | "inactive"; ...
}
export interface CustomersResponse {
  items: CustomerRecord[]; total: number; page: number; ...
}
```

后端 Elysia 已通过 `@elysianjs/openapi` 暴露完整 OpenAPI spec，前端没有消费。

### 问题

- 后端改字段，前端不知道，运行时才发现类型不匹配
- 每个模块的 Record 类型在后端 schema、后端 repository、前端 platform-api 三处各写一遍
- 违反"前后端契约单一来源"原则

### 决策：短期引入类型网关复用 schema，中期切换 OpenAPI 自动生成

#### 短期（立即）

建立类型网关，所有 composable 和组件统一从 `types/api.ts` 导入类型：

```ts
// lib/platform-api/types.ts
export type { CustomerRecord, CustomerStatus } from "@elysian/schema"
export type { RoleRecord, RoleStatus } from "@elysian/schema"
// ... 其他模块
```

所有消费方只 import 这一个文件。schema 包已经定义了 Record 类型，直接复用，不重复定义。

#### 中期（API 稳定后）

接入 OpenAPI 自动生成：

```bash
npx openapi-typescript http://localhost:3000/openapi -o lib/platform-api/generated.ts
```

切换类型网关的导入源：

```ts
// lib/platform-api/types.ts — 只改这一处
// export type { CustomerRecord } from "@elysian/schema"          // 旧
export type { CustomerRecord } from "./generated"                  // 新
```

所有消费方的 import 路径不变，平滑迁移。

### 影响面

- 新增 `lib/platform-api/types.ts`
- 逐个替换现有 platform-api 子模块的类型导出
- 消费方 import 路径统一收敛

---

## 痛点 3：workspace composable 存在大量同构样板

### 现状

16 个 `workspaces/use-xxx-workspace.ts`，每个 7-20KB，结构高度雷同：

```
ref: items, loading, errorMessage, form, editForm, editingId, deleteConfirmId
ref: queryValues, listPage, listPageSize, listSortValue, pageInputValue, listTotal, listTotalPages
watch: listPage → fetch
method: fetch, create, update, delete, search, reset, changePage, changePageSize, changeSort, ...
```

customer 20KB、dictionary 16KB、menu 18KB、role 15KB、notification 19KB... 加起来超过 200KB 的 composable 代码，其中分页、排序、loading 状态管理逻辑几乎完全一样。

### 问题

- 新增一个标准 CRUD workspace 需要手写 10-20KB composable，其中 80% 是重复的
- 修复一个分页 bug 需要改 16 个文件
- 不同 workspace 的分页/排序行为可能微妙不一致

### 决策：方案 A（CRUD 工厂）为主，extend 钩子覆盖差异，方案 B（composable 片段）补充非标场景

#### 工厂设计

```ts
// workspaces/create-crud-workspace.ts

export interface BaseCrudState<TRecord, TCreateInput, TListQuery> {
  kind: string
  loading: Ref<boolean>
  errorMessage: Ref<string>
  items: Ref<TRecord[]>
  listPage: Ref<number>
  listPageSize: Ref<number>
  listTotal: Ref<number>
  listTotalPages: Ref<number>
  listSortValue: Ref<string>
  queryValues: Ref<Record<string, unknown>>
  fetch: () => Promise<void>
  search: (values: Record<string, unknown>) => void
  reset: () => void
  changePage: (page: number) => void
  changePageSize: (size: number) => void
  changeSort: (sort: string) => void
  create: (input: TCreateInput) => Promise<void>
  update: (id: string, input: Partial<TCreateInput>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const createCrudWorkspace = <TRecord, TCreateInput, TListQuery>(config: {
  kind: string
  fetchList: (query: TListQuery) => Promise<PaginatedResponse<TRecord>>
  create?: (input: TCreateInput) => Promise<TRecord>
  update?: (id: string, input: Partial<TCreateInput>) => Promise<TRecord>
  delete?: (id: string) => Promise<void>
  defaultSort?: string
  extend?: (base: BaseCrudState<TRecord, TCreateInput, TListQuery>) => Record<string, unknown>
}): BaseCrudState<TRecord, TCreateInput, TListQuery> => {
  // 分页、排序、loading、CRUD 方法全部内置
  const base = { /* ... 标准实现 ... */ }
  const extensions = config.extend ? config.extend(base) : {}
  return { ...base, ...extensions }
}
```

标准 workspace 使用：

```ts
// workspaces/use-customer-workspace.ts — 从 20KB 缩减到 ~3KB
export const useCustomerWorkspace = createCrudWorkspace({
  kind: "customer",
  fetchList: fetchCustomers,
  create: createCustomer,
  update: updateCustomer,
  delete: deleteCustomer,
})
```

带扩展的 workspace：

```ts
// workspaces/use-customer-workspace.ts — 加自定义能力
export const useCustomerWorkspace = createCrudWorkspace({
  kind: "customer",
  fetchList: fetchCustomers,
  create: createCustomer,
  update: updateCustomer,
  delete: deleteCustomer,
  extend: (base) => ({
    exportExcel: async () => {
      const allItems = await fetchCustomers({ pageSize: 9999 })
      // 基于 allItems 生成 Excel
    },
  }),
})
```

非标准 workspace（如 generator-preview）不使用工厂，用独立 composable 片段组合：

```ts
// workspaces/use-generator-preview-workspace.ts — 保持独立
export const useGeneratorPreviewWorkspace = () => {
  const loading = useLoadingState()
  // 完全自定义的逻辑
}
```

#### 关键约束

所有 workspace（工厂创建或手写）必须实现 `WorkspaceState` 最小公共接口，保证 provide/inject（痛点 4）类型安全。

```ts
// app/workspace-registry/types.ts
export interface WorkspaceState {
  kind: string
  loading: Ref<boolean>
  errorMessage: Ref<string>
}
```

工厂返回的 `BaseCrudState` 天然满足 `WorkspaceState`。非标准 workspace 也必须满足。

### 影响面

- 新增 `workspaces/create-crud-workspace.ts`
- 新增 `workspaces/shared/use-loading-state.ts`（可选片段）
- 逐个重构标准 CRUD workspace，每个从 10-20KB 降到 2-4KB
- 非标准 workspace 保持独立，只补充 `WorkspaceState` 接口实现

---

## 痛点 4：workspace 组件 props 爆炸，无状态管理

### 现状

`CustomerWorkspaceMain.vue` 接收 20+ props，从 App.vue → shell bindings → shell workspace descriptors → workspace 组件逐层透传。

### 问题

- 中间层组件被迫声明并转发大量不关心的 props
- 增加一个状态要改整条 props 链
- 组件签名和实际渲染逻辑的信号比很低

### 决策：provide/inject 替代 props 透传，依赖痛点 3 的 WorkspaceState 接口

#### 实现方式

```ts
// app/workspace-registry/injection-keys.ts
import type { InjectionKey } from "vue"
import type { WorkspaceState } from "./types"

export const WORKSPACE_STATE_KEY: InjectionKey<WorkspaceState> = Symbol("workspace-state")
```

路由级别的 wrapper 组件（或 App.vue 的 shell 层）根据当前路由匹配注册表项，调用 `workspaceFactory()` 并 provide：

```ts
// 路由匹配后
const registration = workspaceRegistry.find(r => r.path === currentPath)
const workspaceState = registration.workspaceFactory()
provide(WORKSPACE_STATE_KEY, workspaceState)
```

所有子组件统一 inject，不再通过 props 层层传递：

```ts
// CustomerWorkspaceMain.vue
const workspace = inject(WORKSPACE_STATE_KEY)!
```

### 影响面

- 新增 `app/workspace-registry/injection-keys.ts`
- workspace 组件的 props 大幅减少（只保留渲染配置类 props）
- 中间层组件不再转发 workspace 状态

---

## 痛点 5：样式未收敛到共享层

### 现状

`CustomerWorkspaceMain.vue` 的 `<style scoped>` 包含 `.enterprise-message`、`.enterprise-footer-grid` 等样式，在多个 workspace 组件中重复出现。DESIGN.md 规定主面板圆角 `6px`，但组件中使用了 `border-radius: 12px`。

### 问题

- 同一组件中视觉 token 与 DESIGN.md 规范不一致
- 重复样式散落在 16 个 workspace 组件中
- 没有利用 `packages/ui-enterprise-vue` 的共享样式能力

### 决策：workspace 共用样式下沉到 ui-enterprise-vue，按功能域拆分

```
packages/ui-enterprise-vue/src/styles/
  workspace-base.css        // 所有 workspace 共用：消息提示、栅格布局
  workspace-crud.css        // CRUD workspace 共用：表格、表单、分页
```

各 workspace 组件的 `<style scoped>` 改为使用共享 class。圆角/间距等 token 统一到 DESIGN.md 规范。

日常迭代逐步收敛，不要求一次性改完。

### 影响面

- `packages/ui-enterprise-vue/src/styles/` 新增共享样式文件
- 逐个 workspace 组件替换重复样式为共享 class

---

## 痛点 6：路由、导航、workspace kind、moduleReady 四处独立维护

### 现状

新增一个 workspace 需要改 7 个文件：路由、导航、gates、App.vue、composable、platform-api、i18n。

### 问题

- 新增标准 CRUD workspace 的边际成本过高
- 路由 path、kind 名称、moduleCode 在多处重复声明
- 忘记在某一处添加会导致 workspace 静默不工作

### 决策：单一 workspace 注册表，按领域分文件聚合

#### 注册表类型定义

```ts
// app/workspace-registry/types.ts
import type { Ref, InjectionKey } from "vue"

export interface WorkspaceState {
  kind: string
  loading: Ref<boolean>
  errorMessage: Ref<string>
}

export interface WorkspaceRegistration<TState extends WorkspaceState = WorkspaceState> {
  kind: string
  path: string
  moduleCode: string
  permissionPrefix: string
  i18nKeys: {
    sectionTitle: string
    sectionCopy: string
    shellTitle: string
    shellDescription: string
  }
  workspaceFactory: () => TState
  mainComponent: () => Promise<any>
  panelComponent?: () => Promise<any>
}
```

`workspaceFactory` 返回 `WorkspaceState`（或其子类型），不再是 `unknown`。这是痛点 3 工厂和痛点 4 provide/inject 的类型桥梁。

#### 按领域分文件

```
app/workspace-registry/
  ├─ types.ts                 // WorkspaceState, WorkspaceRegistration 接口
  ├─ injection-keys.ts        // WORKSPACE_STATE_KEY
  ├─ auth-registry.ts         // auth, user, role, session
  ├─ system-registry.ts       // dictionary, menu, department, setting, post
  ├─ business-registry.ts     // customer, file, notification, tenant, workflow, generator-preview, operation-log
  └─ index.ts                 // 聚合并导出完整数组
```

```ts
// app/workspace-registry/index.ts
import { authWorkspaceRegistrations } from "./auth-registry"
import { systemWorkspaceRegistrations } from "./system-registry"
import { businessWorkspaceRegistrations } from "./business-registry"

export const workspaceRegistry: WorkspaceRegistration[] = [
  ...authWorkspaceRegistrations,
  ...systemWorkspaceRegistrations,
  ...businessWorkspaceRegistrations,
]

export { WORKSPACE_STATE_KEY } from "./injection-keys"
export type { WorkspaceState, WorkspaceRegistration } from "./types"
```

与后端 `compose-auth / compose-system / compose-business` 的分桶策略完全同构。

#### 路由、导航、gates 从注册表推导

```ts
// 路由：从注册表生成
export const exampleWorkspaceRoutes = workspaceRegistry.map(r => ({
  path: r.path,
  kind: r.kind,
  moduleCode: r.moduleCode,
  ...r.i18nKeys,
}))

// 导航：从注册表 + 当前用户权限过滤
export const buildNavigation = (identity, moduleCodes, t) =>
  workspaceRegistry
    .filter(r => moduleCodes.includes(r.moduleCode))
    .filter(r => hasAnyPermission(identity, r.permissionPrefix))
    .map(r => ({ key: r.kind, path: r.path, title: t(r.i18nKeys.shellTitle) }))

// moduleReady：Map<string, Ref> 替代 15 个独立 ref
const moduleReadyMap = reactive(new Map<string, boolean>())
// 注册表中 moduleCode 去重后的列表就是需要监听的模块集合
```

#### 新增 workspace 的边际成本

标准 CRUD workspace：在对应领域注册文件中加一条记录 + 准备 main/panel 组件文件 → 改 2-3 个文件。

### 影响面

- 新增 `app/workspace-registry/` 目录（5 个文件）
- `router/example-workspace-routes.ts` 改为从注册表推导
- `use-example-navigation.ts` 改为从注册表推导
- `use-example-workspace-gates.ts` 的 15 个独立 ref 改为 `Map<string, Ref>`
- App.vue 的 workspace 初始化改为消费注册表

---

## 痛点 7：i18n 按 locale 分大文件

### 现状

- `zh-CN.modules.ts` — 35KB，所有模块翻译堆在一个文件
- `en-US.modules.ts` — 35KB，同上
- workflow 已拆出但其余 14 个模块未推广

### 问题

- 新增模块翻译要在 35KB 文件末尾追加，定位困难
- 多人同时修改不同模块的翻译时产生合并冲突

### 决策：按模块拆分，注册表 i18nKeys 双重保险

```
i18n/
  index.ts                         ← 聚合器
  zh-CN.ts / en-US.ts              ← locale 入口
  zh-CN.core.ts / en-US.core.ts    ← 壳层 + 全局
  zh-CN.customer.ts / en-US.customer.ts
  zh-CN.role.ts / en-US.role.ts
  zh-CN.menu.ts / en-US.menu.ts
  zh-CN.department.ts / en-US.department.ts
  ... 其余模块各自一个文件
```

注册表中的 i18nKeys 引用拆分后的翻译 key，形成双重保险——注册表里写了但翻译没加的情况能快速发现。

### 影响面

- 现有 `zh-CN.modules.ts` 拆成 14+ 个模块文件
- `index.ts` 聚合逻辑更新
- 不影响运行时行为

---

## 实施路线图

### 第一阶段：脊柱搭建（痛点 3 + 痛点 6）

| 工作内容 | 产出 |
|---------|------|
| 痛点 6：实现 workspace 注册表（按领域拆分版本） | `app/workspace-registry/` 目录 |
| 痛点 3：创建 CRUD 工厂，重构 2-3 个标准 workspace 验证 | `workspaces/create-crud-workspace.ts` |
| 路由、导航、gates 从注册表推导 | 消除 3 处独立维护 |

奠定统一的 workspace 创建和发现机制，所有后续工作都建立在这个骨架上。

### 第二阶段：体验升级（痛点 4）

| 工作内容 | 产出 |
|---------|------|
| 痛点 4：引入 provide/inject，基于注册表提供的 workspaceFactory 和统一 WorkspaceState 注入 | `injection-keys.ts` + workspace 组件 props 精简 |

消除 props 爆炸，组件之间耦合大幅下降。

### 第三阶段：并行优化（痛点 2/5/7）

| 工作内容 | 产出 |
|---------|------|
| 痛点 7：拆分 i18n 文件 | 每个模块一个翻译文件 |
| 痛点 5：下沉共享样式 | `ui-enterprise-vue/styles/workspace-*.css` |
| 痛点 2：短期方案落地（类型网关） | `lib/platform-api/types.ts` |

这三个互不依赖，可同时进行，风险低，收益立竿见影。

### 第四阶段：类型自动化（痛点 2 中期）

| 工作内容 | 产出 |
|---------|------|
| 痛点 2：接入 OpenAPI 自动生成，切换类型网关导入源 | 仅替换 `types.ts` 一层 |

---

## 优先级总表

| 痛点 | 类别 | 决策 | 阶段 |
|------|------|------|------|
| 痛点 1：App.vue 汇聚过重 | 架构层 | 随痛点 3/6 落地自然缓解 | 第一阶段后自动收敛 |
| 痛点 2：类型手动同步 | 契约层 | 短期：类型网关复用 schema；中期：OpenAPI 自动生成 | 第三阶段 / 第四阶段 |
| 痛点 3：composable 同构样板 | 架构层 | CRUD 工厂 + extend 钩子；非标场景用片段组合 | 第一阶段 |
| 痛点 4：props 爆炸 | 组件层 | provide/inject，基于 WorkspaceState 类型安全注入 | 第二阶段 |
| 痛点 5：样式未收敛 | 视觉层 | 共用样式下沉到 ui-enterprise-vue | 第三阶段 |
| 痛点 6：四处独立维护 | 架构层 | 单一注册表，按领域分文件聚合 | 第一阶段 |
| 痛点 7：i18n 大文件 | 工程效率 | 按模块拆分翻译文件 | 第三阶段 |

---

## 原则

- 前端架构改进不引入新状态管理库（如 Pinia），优先用 composable + provide/inject 解决
- workspace 注册机制应与后端 ModuleSchema 对齐，新增标准 CRUD workspace 应接近零配置
- 样式收敛方向是 `packages/ui-enterprise-vue`，不在 `apps/example-vue` 里建第二套
- 所有 workspace（工厂创建或手写）必须满足 `WorkspaceState` 最小公共接口，保证注入类型安全
- 前后端分桶策略保持同构：auth / system / business，降低团队认知成本
