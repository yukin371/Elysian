# 2026-04-28 uniapp P0 决策稿

## 目标

- 固定 `uniapp` 首轮启动前必须先锁定的 `P0` 关键决策。
- 先解决 owner、认证承接和契约复用口径，再决定是否进入实现。

## 当前结论

### 1. app owner

- 决定：若后续启动 `uniapp`，首轮 app owner 固定为 `apps/example-uniapp`。
- 理由：
  - 当前仓库已经存在 `apps/example-vue` 作为真实前端示例 owner。
  - `uniapp` 首轮仍处于“验证产品范围与端能力”的阶段，更适合作为独立应用 owner，而不是先抽 package。
  - 这样可以避免在能力尚未稳定前把本地实现过早上提为 shared owner。

### 2. 是否立即创建 `packages/frontend-uniapp`

- 决定：首轮不预设必须创建 `packages/frontend-uniapp`。
- 理由：
  - 当前 `uniapp` 首轮只验证认证、个人中心和通知闭环，范围过小，尚不足以证明独立适配层已经必要。
  - 现有边界规则要求“先复用，后新增；先验证，后扩展”。
  - 若后续出现两个以上稳定复用点，再评估是否把运行时 API 封装或页面约定上提为独立 package。

### 3. 首轮代码 owner 收口方式

- 决定：首轮默认把以下能力留在 `apps/example-uniapp` 内部：
  - 请求封装
  - 登录态恢复
  - 页面路由
  - 通知页状态管理
  - 端内错误态与缓存处理
- 理由：
  - 这些能力当前都强绑定 `uniapp` 运行时与首轮移动端范围。
  - 若现在上提 shared owner，极易制造“为复用而复用”的错误边界。

## 服务端契约决策

### 4. auth contract

- 决定：`uniapp` 首轮直接复用现有 auth contract：
  - `POST /auth/login`
  - `POST /auth/refresh`
  - `POST /auth/logout`
  - `GET /auth/me`
- 决定：不为 `uniapp` 首轮新增专用 auth API。

依据：

- 当前 `apps/server` 已把 auth 固定为 canonical owner。
- `AuthLoginResponse` 已统一 `login / refresh` 返回体。
- `AuthIdentity` 已统一 `me / login / refresh` 的身份结构。

### 5. 通知 contract

- 决定：`uniapp` 首轮直接复用现有通知模块 contract，用于列表、详情和已读闭环。
- 决定：不为 `uniapp` 首轮新增“移动端专用通知 API”。

理由：

- 通知本身就符合 C 端查看/处理个人消息的语义。
- 当前通知能力已经是已落地后端 owner，适合作为 `uniapp` 首轮最小业务闭环。

### 6. tenantCode 输入位

- 决定：首轮登录页允许预留 `tenantCode` 输入位，但不要求强制展示为默认路径。
- 默认路径：
  - 若部署环境沿用当前默认租户收敛策略，可先走“用户名 + 密码”主路径。
  - 若业务环境存在显式多租户登录要求，再开启 `tenantCode` 输入位。

理由：

- 当前服务端已支持 `tenantCode` 可选输入，并在 tenant-context 场景下支持默认租户收敛。
- 因此 `uniapp` 不需要为首轮范围强行绑定“必须显式输租户码”的 UX。

## 认证承接决策

### 7. 标准路径

- 决定：`uniapp` 认证承接仍以现有标准路径为准：
  - `access token` 在前端内存态
  - `refresh token` 不进入普通 JS 可读持久化
  - 默认通过服务端 `HttpOnly` Cookie 承载 refresh session

依据：

- `ADR-0007` 已固定该策略为默认前端路径。
- 当前 server 实现也是按 `login/refresh` 写 refresh cookie、JSON 体返回 access token。

### 8. uniapp 首轮缓存策略

- 决定：首轮设备端只缓存最小必要状态：
  - 当前 access token 的短时内存态
  - 用户摘要的短时展示态
  - 必要的页面级轻量缓存
- 决定：不把长期 refresh 凭证写入普通本地存储。

### 9. 鉴权失效处理

- 决定：首轮统一采用以下处理语义：
  1. 业务请求返回 `401` 时，先尝试一次 `refresh`
  2. `refresh` 成功则重放原请求或重新拉取当前页面数据
  3. `refresh` 失败则清理本地用户态并回到登录页

理由：

- 这与现有 auth contract 的语义一致。
- 能避免 `uniapp` 首轮出现第二套独立鉴权状态机。

## 仍待验证但不阻断文档阶段的事项

以下问题已经收口方向，但仍需在真正启动实现前补实测：

1. `uniapp` H5 与 Android 对 refresh cookie 的承接差异
2. Android 真机与模拟器的最小验证路径
3. 首轮本地调试命令与 workspace 接线方式
4. 是否需要在请求层额外处理跨端 cookie 行为差异

说明：

这些项仍属于 `P0-4 / P0-5` 的实现前确认项；当前可以先定策略，不应把未验证链路写成已通过。

## 对 checklist 的回填建议

可以视为已完成或已基本完成的项：

- `P0-1` 边界确认
- `P0-2` owner 决策口径
- `P0-3` 服务端契约确认
- `P0-4` 认证标准路径决策

仍待后续补充的项：

- `P0-5` H5 / Android 具体验证路径
- `P0-4` 跨端 cookie 承接实测

## 结论

`uniapp` 的 `P0` 当前应收口为：

- 后续启动时 app owner 固定为 `apps/example-uniapp`
- 首轮不默认新建 `packages/frontend-uniapp`
- 认证与通知直接复用既有 server contract
- 认证承接继续沿用“内存 access token + HttpOnly refresh cookie”的标准路径
- `tenantCode` 作为可选输入位，而不是首轮强制门槛
