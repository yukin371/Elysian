# ADR-0008 采用 Arco Design 作为 Vue 企业预设底座

状态：`superseded by ADR-0010`

日期：`2026-04-21`

## 背景

`Elysian` 已经明确 UI 要走“协议层 + 官方预设层”的路线：

- `ui-core` 负责页面、菜单、表格、表单、动作和权限的中立协议
- 官方预设层负责把同一套协议渲染成不同风格的前端界面
- 当前仓库已经有自建风格预设雏形，下一步需要固定 Vue 企业预设的组件库底座

如果这一层迟迟不定，会直接影响：

- 后续 `ui-enterprise-vue` 的目录与封装边界
- 标准列表页、表单页、详情页的组件映射方式
- 主题 token 和布局抽象
- 未来 `React` 适配路线的视觉一致性和迁移成本

因此需要先把 Vue 企业预设的官方底座定下来，避免在实施阶段反复摇摆。

## 决策

### 1. Vue 企业预设底座采用 `Arco Design Vue`

- 本 ADR 在 `2026-04-21` 至 `2026-04-25` 期间作为 `ui-enterprise-vue` 的首版基线决策
- 该基线已在后续被 [ADR-0010](./ADR-0010-vue-enterprise-preset-tdesign-migration.md) 替代
- `ui-enterprise-vue` 当前官方组件库底座不再是 `Arco Design Vue`

### 2. 自建风格预设继续独立维护

- 当前 `frontend-vue` 中的自建风格预设继续保留
- 它服务于更自由、更适合个人开发者或小团队产品的风格路线
- 企业预设与自建预设共用 `ui-core` 协议，但不共用具体视觉实现

### 3. 官方支持先收敛为“两套预设”

当前阶段官方只承诺两套 Vue 路线：

- `Vue Custom`：自建风格预设
- `Vue Enterprise`：基于 `Arco Design Vue` 的企业预设

第三方组件库的自由接入先不作为第一阶段承诺能力，只保留后续 Adapter 扩展空间。

## 理由

### 选择 `Arco Design Vue`

- 它更符合当前对“企业简洁、优雅”的视觉目标
- `Arco` 同时维护 `React` 和 `Vue` 两条官方路线，更契合 `Elysian` 的双前端长期方向
- 它更适合作为平台级设计系统底座，而不仅仅是单项目组件集合

### 不选择 `Element Plus` 作为首选

- `Element Plus` 维护成熟、上手成本低，确实是强备选
- 但它更偏 Vue 单栈后台快速交付，对后续 `React` 对齐帮助较弱

### 不选择 `Naive UI` 作为首选

- `Naive UI` 的主题能力和 TypeScript 体验都很强
- 但它更适合高自由度自建风格路线，不如 `Arco` 适合做“官方企业设计系统底座”

### 不选择 `Ant Design Vue` 作为首选

- `Ant Design Vue` 仍然是可靠方案
- 但综合视觉气质、双栈延展和平台级统一性，当前阶段不如 `Arco` 更贴合目标

## 影响

### 对前端包结构

- 新增 `packages/ui-enterprise-vue` 作为企业预设承载包
- `packages/frontend-vue` 继续承担自建风格预设与 Vue 端通用预设逻辑

### 对生成器

- 后续 generator 需要支持“同一页面协议映射到不同 Vue 预设”
- 企业预设的表格、表单、筛选区、动作栏会以 `Arco` 组件能力为主进行映射

### 对文档与路线图

- Vue 企业预设的组件库选型不再处于待验证状态
- 后续 roadmap 应从“选择组件库”切换为“封装规范与页面模板实现”

## 暂不决策项

- `ui-enterprise-vue` 首批是否直接安装并接入 `Arco` 依赖
- `Arco` 在主题 token 层的二次封装粒度
- 是否在 React 企业预设阶段强制与 Vue 企业预设视觉严格一致
- 第三方 UI Adapter 的开放协议

这些内容会在企业预设的实施文档中继续细化，但不影响当前先固定底座。
