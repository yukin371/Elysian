# MODULE

## 模块职责

- 本目录负责 `apps/example-vue` 的本地前端路由边界。
- 当前只承接示例应用内的轻量 route owner：
  - 未登录 / 已登录布局判断
  - workspace hash 路径读取、监听与替换
  - workspace 路由注册表与路径元数据，路径清单由 `workspaceRegistry` 自动导出
  - 导航树路径到 workspace menu key 的解析转接

## 当前边界

- 不引入平台级路由框架 owner。
- 不拥有真实后端菜单、权限、会话或 workspace 状态。
- 不直接渲染页面组件；页面渲染仍由 `App.vue` 装配和 `components/workspaces/*` 承担。

## 后续方向

- 若后续正式引入 `vue-router` 或文件自动路由，优先从本目录扩展。
- 自动路由注册应消费既有菜单 / workspace route registry / workspace descriptor，不应在 `App.vue` 继续新增路径分支。
- 新 workspace 只允许在 `workspaceRegistry` 补路径与元数据，不允许再手工复制一组独立路由常量。
