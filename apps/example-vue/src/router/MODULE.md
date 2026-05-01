# MODULE

## 模块职责

- 本目录负责 `apps/example-vue` 的本地前端路由边界。
- 当前只承接示例应用内的轻量 route owner：
  - 未登录 / 已登录布局判断
  - workspace hash 路径读取、监听与替换
  - workspace 路由注册表与路径元数据，路径清单由 `workspaceRegistry` 自动导出
  - 基于路由注册表的默认 workspace、kind -> route/path 查找
  - 导航树路径 / menu key 到 workspace 选中态的解析与 fallback
  - route-derived workspace state 聚合：
    - workspace kind flags
    - module code / readiness / 状态文案
    - workspace 标题、描述与 placeholder 文案

## 当前边界

- 不引入平台级路由框架 owner。
- 不引入 `vue-router`；当前 canonical model 仍是 `hash / registry`。
- 不拥有真实后端菜单、权限、会话或 workspace 状态。
- 不直接渲染页面组件；页面渲染仍由 `App.vue` 装配和 `components/workspaces/*` 承担。
- `use-example-navigation.ts` 只应消费本目录暴露的路由派生结果，不应继续回退到手写 route/path/kind 分支。

## 后续方向

- 若后续继续做“自动路由收口”，优先继续扩展本目录，而不是把 route fallback 写回 `use-example-navigation.ts`。
- 若后续正式引入 `vue-router` 或文件自动路由，也必须从本目录演进，不能跳过现有 `hash / registry` owner 直接扩散到 `App.vue`。
- 自动路由注册应消费既有菜单 / workspace route registry / workspace descriptor，不应在 `App.vue` 或 app composable 继续新增路径分支。
- 新 workspace 只允许在 `workspaceRegistry` 补路径与元数据，不允许再手工复制一组独立路由常量。
