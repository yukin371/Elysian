# 2026-04-28 uniapp P1 Scaffold Draft

## 目标

- 为 `apps/example-uniapp` 提供首轮最小脚手架草案。
- 固定首轮目录边界、文件分层和本地 owner 收口方式。
- 避免一启动就把 `uniapp` 做成第二套 shared 前端层。

## 当前结论

- 首轮只为 `apps/example-uniapp` 设计最小应用骨架。
- 首轮不默认创建 `packages/frontend-uniapp`。
- 首轮目录设计服务于 `认证 + 个人中心 + 通知`，不提前适配后台工作区、多模块路由或复杂平台能力。

## 目录边界

建议首轮目录：

```text
apps/example-uniapp/
  package.json
  src/
    App.vue
    main.ts
    pages/
      login/
      home/
      notifications/
      notification-detail/
    app/
      routes/
      session/
      bootstrap/
    lib/
      api/
      auth/
      notifications/
      storage/
    components/
      auth/
      notifications/
      common/
```

说明：

- `pages/` 只放页面入口，不堆复杂状态逻辑。
- `app/` 只放应用级装配、路由、session 启动编排。
- `lib/` 只放当前 app 内部的请求、auth、通知、存储辅助，不把它命名成 shared owner。
- `components/` 只放页面复用展示块，不放平台级组件体系。

## 各目录职责

### 1. `src/pages/*`

owner：

- 登录页
- 首页/个人中心页
- 通知列表页
- 通知详情页

不拥有：

- 全局请求封装
- auth 状态机
- 跨页面缓存策略

### 2. `src/app/*`

owner：

- 应用启动编排
- 初始 session 恢复
- 路由跳转守卫
- 页面壳级别状态切换

不拥有：

- 业务数据请求细节
- 通用组件库
- 服务端契约定义

建议子目录：

```text
src/app/
  bootstrap/
    use-app-bootstrap.ts
  routes/
    index.ts
  session/
    use-session-bootstrap.ts
```

### 3. `src/lib/*`

owner：

- 面向 `uniapp` 首轮运行时的本地 helper
- API 调用封装
- auth 请求与恢复逻辑
- 通知数据读取与已读动作
- 设备端最小存储策略

不拥有：

- shared package 级公共抽象
- 与 `Vue` 共用的框架无关库名义

建议子目录：

```text
src/lib/
  api/
    client.ts
  auth/
    session.ts
    login.ts
  notifications/
    list.ts
    read.ts
  storage/
    session-storage.ts
```

### 4. `src/components/*`

owner：

- 首轮页面内可复用展示块
- loading / empty / error 基础视图
- 通知列表项、会话卡片、错误提示等轻组件

不拥有：

- 企业后台通用组件体系
- 第二套 `ui-core`
- 可供所有前端复用的 shared primitives

## `App.vue` 预期职责

首轮 `App.vue` 应保持最薄：

- 挂载应用入口
- 接入最小 bootstrap
- 不直接承担通知列表逻辑
- 不直接承担 auth 请求实现

若 `App.vue` 变大，优先下沉到：

- `src/app/*` 的启动编排
- `src/pages/*` 的页面级逻辑
- `src/components/*` 的展示块

不要把问题下沉到错误 owner 的 shared 目录。

## 首轮文件分层建议

### 登录链路

- 页面：`src/pages/login/*`
- 页面状态：可先留在页面目录
- 请求：`src/lib/auth/login.ts`
- 登录恢复：`src/app/session/use-session-bootstrap.ts`

### 个人中心链路

- 页面：`src/pages/home/*`
- 用户态读取：`src/lib/auth/session.ts`
- 退出登录：`src/lib/auth/session.ts`

### 通知链路

- 页面：`src/pages/notifications/*`
- 详情页：`src/pages/notification-detail/*`
- 通知请求：`src/lib/notifications/*`
- 展示组件：`src/components/notifications/*`

## 首轮不建议出现的目录

以下目录在 `P1` 默认不建议创建：

- `src/shared/`
- `src/utils/` 作为无边界桶文件
- `src/platform/` 如果只是为了显得更抽象
- `packages/frontend-uniapp/`
- `packages/ui-uniapp/`

原因：

- 当前范围太小，提前抽这些目录只会模糊 owner。

## 首轮脚手架约束

### 可以提前做的

- 页面目录
- 启动编排目录
- 本地 API/auth/notification helper
- 基础 common 组件目录

### 不应该提前做的

- 多端差异适配框架
- 全局插件体系
- 跨前端共享状态层
- 面向未来业务模块的预留空目录

## 与 P1 checklist 的映射

### 可视为已明确方向的项

- `P1-1 / 固定基础目录结构，不提前分裂过多本地模块`
- `P1-2 / 页面壳组成`
- `P1-3 / API 与会话骨架的落点`
- `P1-4 / 基础状态 UI 的组件落点`

### 仍未完成的项

- notification 真实业务接线
- loading / empty / error / toast 的统一 UI 收口

当前状态：

- `apps/example-uniapp`、`package.json`、`dev:uniapp` / `build:uniapp` 以及首轮页面占位已落地
- auth 与 session 恢复已接入真实 `login / refresh / me / logout` 链路
- 通知真实业务接线仍未开始

## 结论

`uniapp` 的 `P1` 首轮脚手架应收口为：

- 以 `apps/example-uniapp` 为唯一 app owner
- 目录按 `pages / app / lib / components` 四层收口
- auth、通知、session 逻辑先留在 app 内部
- 不提前新增 `packages/frontend-uniapp` 或任何 shared 桶文件
