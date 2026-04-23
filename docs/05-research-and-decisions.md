# 调研与技术决策

更新时间：`2026-04-21`

## 已确认的技术事实

### `Elysia`

- 官方提供 OpenAPI 插件，可作为接口契约输出源。
- 官方提供 Eden Treaty，可作为类型安全客户端方案。
- 官方提供 AI SDK 集成文档，说明其适合作为 AI 服务接口层。
- 官方存在全栈开发与 HTML 插件方向，但主路径更偏 `Bun` 生态，并不天然围绕 `Vue SFC` 多前端平台设计。

### `Vue`

- 官方提供 `create-vue` 初始化方式，适合单独作为前端应用。
- 官方有标准 SSR 文档，但 SSR 会显著增加工程复杂度。

### `Tailwind`

- 官方提供基于 `Vite` 的标准安装方式，适合作为前端适配层的样式基础设施。

### `AI SDK`

- 官方支持结构化输出和流式文本生成。
- 这非常适合“AI 生成 schema，再由代码生成器落代码”的链路。

## 关键判断

### 1. 前端不应绑定单一路线

如果平台目标是类似 `RuoYi` 这种可快速落地企业项目的底座，那么把 `Vue` 固定为唯一前端会过早收窄适用面。

更合理的方式是：

- 内核只定义契约与生成规范
- 前端通过适配层分别支持 `Vue` 和 `React`

### 2. 首版不把 SSR 作为必选能力

企业后台的核心问题是交付效率和治理能力，而不是 SEO。

因此首版推荐：

- `SPA + API`
- 静态资源构建部署
- 后续再评估 SSR 或同构方案

### 3. 不做“AI 直接写完整项目”

这类方案短期看起来快，长期维护成本极高。

平台应坚持：

- schema 为中心
- generator 为主
- AI 为辅

### 4. 生成结果必须是正常代码

目标是让团队把平台当成“企业项目生产线”，而不是黑盒 SaaS。

因此生成产物必须：

- 进入 git
- 支持人工维护
- 支持重新生成
- 支持测试与部署

## 当前建议的技术路线

- 后端：`Elysia`
- 运行时：`Bun` 优先，保留 `Node.js` 兼容评估
- 前端：`Vue` 与 `React` 双适配
- 样式：`Tailwind CSS`
- Vue 官方预设：`Arco Design Vue` 作为企业预设底座，Tailwind + 自建组件作为自由风格预设路线
- 契约：`OpenAPI` + 类型安全客户端
- AI：结构化输出优先
- 生成：schema 驱动模板生成

## 已确认的新决策

### 5. Vue 企业预设底座固定为 `Arco Design Vue`

当前已经不再把 Vue 企业预设的组件库选型作为开放问题处理。

固定理由：

- 更贴近“企业简洁、优雅”的目标风格
- 同一设计体系同时覆盖 `Vue` 与 `React`，更适合平台长期双前端路线
- 更适合作为平台级企业预设底座，而不是只解决单项目组件复用

保留策略：

- `Arco Design Vue` 负责企业预设
- 当前手写 `Vue + Tailwind` 路线继续作为自建风格预设
- 第三方 UI Adapter 延后到后续平台扩展阶段

## 官方资料

- Elysia OpenAPI: https://elysiajs.com/plugins/openapi
- Elysia Eden Treaty: https://elysiajs.com/eden/treaty/overview
- Elysia AI SDK: https://elysiajs.com/integrations/ai-sdk
- Elysia Fullstack Dev Server: https://elysiajs.com/patterns/fullstack-dev-server
- Vue Quick Start: https://vuejs.org/guide/quick-start.html
- Vue SSR: https://vuejs.org/guide/scaling-up/ssr.html
- Tailwind with Vite: https://tailwindcss.com/docs/installation/using-vite
- Vite Backend Integration: https://vite.dev/guide/backend-integration
- AI SDK Introduction: https://ai-sdk.dev/docs/introduction
- AI SDK Structured Data: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
