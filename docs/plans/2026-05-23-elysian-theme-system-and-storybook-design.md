# 2026-05-23 Elysian 主题系统与 Storybook 设计方案

## 背景

- 当前仓库已经有稳定的企业预设 owner：`packages/ui-enterprise-vue`，并且该预设已通过 [ADR-0010](../decisions/ADR-0010-vue-enterprise-preset-tdesign-migration.md) 固定为 `TDesign Vue Next` 路线。
- 当前仓库也已经存在“自建预设 / 企业预设”并行的早期语义：`packages/frontend-vue/src/index.ts` 中保留了 `vueCustomPresetManifest` 与 `vueEnterprisePresetTarget` 两个方向。
- 本次目标不是推翻企业预设，也不是把所有前端统一成企业后台风格，而是补一条“Elysian 自带品牌气质的个性化预设”设计路径。
- 该个性化预设默认面向更偏 C 端、品牌展示和高风格化页面，但仍需保持工程边界稳定，不能反向污染 `ui-core`、`frontend-vue` 与既有企业预设 owner。

## 当前状态

- `2026-05-23` 第一阶段已启动。
- 已正式创建 `packages/ui-public-vue`，承接 `public-luxe` 品牌预设、theme pack 元数据与 `data-theme` runtime。
- 已正式创建 `apps/storybook-vue`，作为最小展示与视觉回归入口。
- `packages/ui-enterprise-vue` 保持原有 `TDesign` 企业预设 owner，不承接 public preset。

## 边界摘要

```text
目标模块：
- 设计层：Elysian 个性化预设方案
- 预设层：`packages/ui-public-vue`
- 展示层：`apps/storybook-vue`

现有 owner：
- `packages/ui-core`：中立 UI 协议
- `packages/frontend-vue`：Vue 适配层、preset manifest 语义
- `packages/ui-enterprise-vue`：企业 TDesign 预设
- `apps/example-vue`：当前真实消费端与 demohub 原型页

影响面：
- 新增“品牌默认预设 + 企业可选预设”的双轨前端设计模型
- 明确 `preset` 与 `theme` 不是同一层概念
- 后续 Storybook 从“组件目录”升级为“预设与主题的验收面”

计划改动：
- 第一阶段新增 `ui-public-vue` 与 `storybook-vue` 最小骨架
- 锁定 `preset + theme + mode` runtime 契约与首批主题家族

验证方式：
- 设计文档评审
- `ui-public-vue` runtime 测试
- Storybook 预览与后续视觉回归

需要同步的文档：
- `docs/roadmap.md`
- `docs/PROJECT_PROFILE.md`
- `docs/ARCHITECTURE_GUARDRAILS.md`
- 本设计方案文档
```

## 关键假设

1. `Elysian` 的品牌特色应体现在“默认个性化预设 + 主题包”上，而不是强迫所有消费端都使用同一套企业组件库。
2. 用户可“选择其他组件”的核心含义，是可切换 `preset`，而不是只切换一套颜色 token。
3. 第一阶段只支持受控主题包（theme pack），不直接承诺开放式可视化主题编辑器。
4. “Elysia” 的灵感来源可以体现在气质、配色、材质和动效上，但不直接复制具体游戏 UI 或角色视觉资产。

## 当前问题

当前仓库已经有稳定的企业预设，但缺少以下几个关键设计判断：

1. 默认品牌预设是否继续走企业风格
2. 个性化主题和企业预设的边界如何拆
3. “用户可选 TDesign”到底是换主题还是换预设
4. Storybook 应该展示什么，谁才是视觉 canonical owner

如果不先把这几个问题定清楚，后续非常容易出现：

- 把 `TDesign` 的语义硬塞回 `ui-core`
- 在 `apps/example-vue` 或 `demohub` 里堆第二套共享样式
- 把“品牌主题”和“组件库切换”混成一个概念
- 为了追求统一而做出难以验证的跨层抽象

## 设计结论

## 1. 采用“双预设 + 多主题包”模型

不把所有前端风格统一成一套组件实现，而是明确拆成两个正交维度：

### 1.1 Component Preset（组件预设）

组件预设决定：

- 使用哪一套组件实现
- 表单、按钮、表格、弹层等交互结构如何落地
- 哪个 package 拥有具体渲染逻辑

首批预设建议：

- `enterprise-tdesign`
  - canonical owner：`packages/ui-enterprise-vue`
  - 目标场景：企业后台、管理台、系统工作区
- `public-luxe`
  - canonical owner：候选 `packages/ui-public-vue`
  - 目标场景：品牌展示、C 端页面、个性化前台、体验导向工作区

### 1.2 Theme Pack（主题包）

主题包决定：

- 颜色
- 字体
- 圆角尺度
- 阴影、边框、发光、背景纹理
- 页面氛围和品牌气质

首批主题包建议：

- `elysia-default`
- `moon-gold`
- `crystal-pink`
- `starlit-night`
- `enterprise-calm`

最终用户选择的是：

```text
preset + theme
```

例如：

- `enterprise-tdesign + enterprise-calm`
- `public-luxe + elysia-default`
- `public-luxe + crystal-pink`

## 2. 不把个性化默认预设放进 `ui-enterprise-vue`

### 2.1 为什么不能直接扩 `ui-enterprise-vue`

`packages/ui-enterprise-vue` 的 owner 已经被文档与 ADR 固定为：

- 企业预设
- TDesign runtime 绑定
- 后台壳层与 CRUD 工作区

如果继续把“华美、绚丽、品牌化”的默认体验塞进这个 owner，会带来三个问题：

1. 企业后台预设会失去边界，变成“什么都能做”的混合视觉层。
2. 后续用户想保留 TDesign 企业后台时，会被默认品牌气质牵连。
3. `TDesign` 本身适合高效率后台，不适合承载完整品牌表现上限。

### 2.2 推荐 owner

- `packages/ui-enterprise-vue`
  - 保持企业 TDesign 预设 owner 不变
- `packages/ui-public-vue`
  - 作为候选新增 owner，负责 Elysian 的个性化默认预设
- `apps/storybook-vue`
  - 作为候选新增展示与验证入口，不拥有主题真相

## 3. `ui-core` 和 `frontend-vue` 只保留中立与适配职责

### 3.1 `ui-core`

继续只拥有：

- 页面协议
- 字段定义
- 动作契约
- 导航和权限中立结构

明确不拥有：

- 颜色 token
- TDesign 组件语义
- Tailwind 类名
- 某个品牌主题的视觉定义

### 3.2 `frontend-vue`

继续只拥有：

- Vue 侧页面适配
- locale runtime
- workspace registration
- preset manifest 的中立描述

可新增但仍保持中立的部分：

- `PresetManifest`
- `ThemePackManifest`
- `AppSurfacePreference`

不应新增：

- 某个预设的具体 Button / Card / Shell 实现
- 某个主题包的具体 CSS

## 4. Token 分层采用四层结构

个性化预设推荐采用以下四层 token 模型：

### 4.1 Foundation Tokens

只承载物理设计值：

- 基础色阶
- 字体族
- 字号
- 半径
- 阴影
- 间距
- 动效时长

示例：

- `--palette-rose-500`
- `--palette-gold-400`
- `--font-display`
- `--radius-md`
- `--shadow-soft-xl`

### 4.2 Semantic Tokens

承载可被组件消费的语义槽位：

- `--color-bg`
- `--color-surface`
- `--color-surface-elevated`
- `--color-text`
- `--color-text-muted`
- `--color-line`
- `--color-primary`
- `--color-accent`
- `--color-danger`

### 4.3 Component Tokens

承载组件层槽位：

- `--button-primary-bg`
- `--button-primary-glow`
- `--card-border`
- `--card-overlay`
- `--input-ring`
- `--shell-nav-active-bg`
- `--hero-title-gradient`

### 4.4 Theme Pack Overrides

主题包只做覆写，不直接重写组件结构：

- `elysia-default` 覆写主色、背景、高光、标题渐变
- `moon-gold` 覆写暖色、香槟金、珠光面
- `starlit-night` 覆写夜空系表面与弱发光

## 5. 视觉方向：默认品牌主题不是企业蓝灰，也不是厚玻璃大圆角

### 5.1 默认品牌气质

`elysia-default` 建议采用：

- 气质：华美、轻神性、乐章感、晶体感、柔光感
- 结构：规整、克制，不做夸张游戏 HUD
- 材质：珠光、丝绸、晶面、轻雾，不做厚重毛玻璃

### 5.2 颜色方向

建议主轴：

- 月光白
- 香槟金
- 冷天青
- 玫瑰粉
- 深星夜作为局部对比背景

不建议：

- 大面积企业蓝灰
- 高饱和紫色作为默认主色
- 过多荧光赛博色并列竞争

### 5.3 圆角与层级

默认半径建议：

- 小控件：`6px`
- 输入框 / 按钮：`8px`
- 卡片 / 面板：`10px` 到 `12px`
- 大容器：`14px`

明确禁止：

- 大面积 `20px+` 圆角
- 以厚玻璃和重阴影制造“高级感”

### 5.4 动效方向

建议动效关键词：

- reveal
- shimmer
- slow focus
- soft glow
- layered fade

不建议：

- 弹跳卡通感
- 重粒子特效
- 高频缩放和大幅位移

## 5.5 配色体系设计依据

本方案在颜色分层上参考了几类成熟体系的共识，再结合 `Elysian` 的品牌定位做收敛：

- `Tailwind CSS` 当前以 `OKLCH` 公开默认色阶，并支持通过 CSS 变量与 `data-theme` / `dark` 变体做主题切换，适合作为多主题实现底座。
- `Material 3` 的颜色角色强调 `primary / secondary / tertiary` 三层强调色，再配两层中性 surface，用 token 保持层级与可访问性。
- `Radix Colors` 在组合调色板时强调：
  - 中性色可以选择纯灰，也可以选择与强调色接近色相的 tinted gray，以获得更自然的和谐感。
  - 暗色模式下若背景灰本身过饱和，彩色 badge、tag、状态块会和背景冲突。

这意味着 `Elysian` 不能只定义“主色”：

1. 必须先决定每个主题包的中性表面倾向。
2. 必须给每个主题包同时定义 `primary / secondary / tertiary`。
3. 必须在 light / dark 两套 surface 中保持同一主题家族气质，而不是只做“背景变黑”。

## 5.6 默认主题家族结论

为避免后续颜色漂移，默认只开放少量高完成度主题家族，而不是一开始就允许任意配色自由组合。

首批建议固定为 `4 + 1`：

### 1. `elysia-default`

- 定位：默认品牌主题
- 气质：月光、晶面、圣咏感、轻华美
- 适用：默认首页、会员页、品牌展示页、Creator Center
- 主强调（primary）：冷天青 / 月辉蓝
- 辅强调（secondary）：香槟金
- 对比强调（tertiary）：玫瑰粉
- 中性表面：偏冷白与浅雾蓝灰
- 推荐中性色倾向：接近 `slate / mist` 而非纯灰

### 2. `rose-nocturne`

- 定位：更偏浪漫与叙事感的高风格主题
- 气质：玫瑰、绸缎、夜宴感
- 适用：活动页、内容专题、角色页、节日主题
- 主强调（primary）：玫瑰粉
- 辅强调（secondary）：葡萄紫灰
- 对比强调（tertiary）：柔金
- 中性表面：偏 `mauve` 倾向的暖灰紫
- 风险控制：紫色只做辅轴，不与主粉同时高饱和满铺

### 3. `azure-aria`

- 定位：更清透、理性、科技感但仍保留华美度
- 气质：晨雾、星海、玻璃弦乐
- 适用：信息密度较高的前台工作区、仪表卡片、轻运营后台
- 主强调（primary）：青蓝
- 辅强调（secondary）：银灰蓝
- 对比强调（tertiary）：薄荷青
- 中性表面：偏 `slate / sage` 倾向的低饱和冷灰
- 风险控制：不叠加第二个高饱和蓝，避免整个页面变成“企业科技蓝”

### 4. `amber-seraph`

- 定位：偏礼仪感、尊贵感、会员感
- 气质：香槟、金箔、乳白、柔金边
- 适用：会员、权益、付费、升级、礼赠场景
- 主强调（primary）：琥珀金
- 辅强调（secondary）：暖象牙
- 对比强调（tertiary）：深酒红
- 中性表面：偏 `sand / taupe` 倾向的暖浅灰
- 风险控制：金色只用于重点操作、价格与高阶状态，不做全页高亮

### 5. `enterprise-calm`

- 定位：企业 fallback 主题
- 气质：克制、稳态、低风险
- 适用：`enterprise-tdesign` 默认搭配
- 主强调（primary）：稳态蓝
- 辅强调（secondary）：青灰
- 对比强调（tertiary）：浅金或低饱和青
- 中性表面：偏纯净灰与轻蓝灰
- 风险控制：不使用品牌主题中的高装饰高光、珠光和发光表现

## 5.7 默认主题不要自由拼色

为避免颜色冲突与长期漂移，明确禁止以下做法：

- 业务页面自由指定主色，不走主题包
- 一个主题内同时使用两个竞争性的高饱和主色
- 为了“更华丽”给所有 surface 加彩色边框和发光
- `badge / tag / status` 使用未纳入主题语义的任意颜色
- dark mode 里继续使用 light mode 的高亮 surface 色阶

换句话说，允许用户选择的是：

- 主题家族
- light / dark / system

而不是：

- 任意主色 + 任意次色 + 任意中性灰的拼盘式组合

## 5.8 主题包内部必须固定三层强调色

参考多主题设计体系的稳定做法，后续每个主题包都必须显式定义：

### Primary

- 最重要操作
- 主要 CTA
- 当前激活导航
- 品牌核心强调

### Secondary

- 辅助操作
- 关键但非第一优先级的信息块
- 页面中的结构性分区强调

### Tertiary

- 点睛色
- 勋章、标签、特殊卡片、稀有状态
- 不能替代 primary 成为大面积操作色

### Neutral surfaces

- `bg/base`
- `surface/subtle`
- `surface/elevated`
- `surface-overlay`
- `line/soft`
- `line/strong`

只有这样，后续组件层才能稳定映射 token，而不会每个页面重新发明自己的“强调色 2 号”和“浅背景紫 3 号”。

## 5.9 主题家族与中性表面绑定规则

参考 Radix 的调色板组合思路，`Elysian` 后续不建议所有主题共用一套完全相同的中性灰，而应允许“带轻微色相倾向的中性色”，但必须跟主题家族绑定：

- `elysia-default`：冷雾蓝灰
- `rose-nocturne`：轻紫灰
- `azure-aria`：蓝灰 / 青灰
- `amber-seraph`：暖砂灰
- `enterprise-calm`：纯净灰 / 轻蓝灰

这样做的好处：

- light mode 中主题气质更完整
- 深色模式中可保留家族辨识度
- 不需要靠大面积彩色背景去体现主题

风险控制：

- 中性表面的色相偏移必须非常轻
- 页面背景与卡片背景的饱和度都要低于强调色
- 在高密度界面尤其是 dark mode 下，禁止把背景灰做得过饱和

## 5.10 暗色模式设计结论

后续默认采用三态：

- `light`
- `dark`
- `system`

实现方式建议沿用 Tailwind v4 的 `data-theme` / 自定义 `dark` variant 路线，而不是只依赖系统媒体查询。

推荐根节点约定：

```html
<html
  data-preset="public-luxe"
  data-theme="elysia-default"
  data-mode="dark"
>
```

说明：

- `data-theme` 决定主题家族
- `data-mode` 决定 light / dark / system
- `dark` 只是样式选择器，不应和主题家族名混在一起

## 5.11 Dark mode 不是简单反色

后续每个主题包必须提供成对的：

- `light` token set
- `dark` token set

而不是把 light token 全部做亮度反转。

每个 dark 主题至少要重新定义：

- 背景层级
- surface 层级
- 文本强弱对比
- 线框与 focus ring
- primary / secondary / tertiary 的可读性
- 阴影 / 发光 / overlay 强度

## 5.12 Dark mode 规则

### 规则 1：先压低背景饱和度，再抬高强调色

暗色下首先保证 surface 稳定，再决定主色有多亮。

### 规则 2：保留主题家族，但不保留同等亮度

例如 `rose-nocturne` 暗色下仍可偏紫玫瑰，但背景必须退到低饱和深紫灰，而不是直接用大面积粉紫黑。

### 规则 3：高彩度只留给交互点

在 dark mode 中，高彩度主要给：

- 主按钮
- 当前激活状态
- 重要标签
- 稀有点睛内容

不应给：

- 大面积容器背景
- 大块表格行底色
- 全页二级卡片背景

### 规则 4：文本优先用中性色，不用主色

正文和长文本默认使用 neutral text，而不是品牌强调色文本。

### 规则 5：彩色组件必须用配对 token

例如：

- `primary` 搭配 `on-primary`
- `primary-container` 搭配 `on-primary-container`

不能把 `primary-container` 文本直接压在 `primary` 背景上。后续组件实现必须沿用成对 token，避免对比失效。

## 5.13 主题包建议的 light / dark 语义映射

后续每个主题包建议都至少提供以下语义槽位：

```text
--color-bg
--color-bg-subtle
--color-surface
--color-surface-elevated
--color-surface-overlay
--color-text
--color-text-muted
--color-text-soft
--color-line
--color-line-strong
--color-primary
--color-on-primary
--color-primary-container
--color-on-primary-container
--color-secondary
--color-on-secondary
--color-secondary-container
--color-tertiary
--color-on-tertiary
--color-tertiary-container
--color-success
--color-warning
--color-danger
--color-info
```

这组槽位足够支撑：

- 基础组件
- marketing pattern
- 内容卡片
- 设置面板
- 对比展示
- dark mode

同时又不会过早扩写成庞大的设计 token 森林。

## 5.14 主题与语义色固定映射

为避免状态色后续失控，默认固定：

- `success`：绿系，优先 `teal / jade / mint` 路线
- `warning`：黄橙系，优先 `amber / orange`
- `danger`：红系，优先 `ruby / crimson / tomato`
- `info`：蓝青系，优先 `blue / indigo / cyan`

不建议每个主题自己重定义语义色的文化含义，例如：

- 不要把 `danger` 做成紫色
- 不要把 `success` 做成金色
- 不要把 `warning` 做成粉色

允许变化的是：

- 明度
- 饱和度
- 是否更偏冷或偏暖

不允许变化的是：

- 状态语义本身

## 5.15 首批实现时的配色收敛建议

第一轮实现只建议正式落：

1. `elysia-default`
2. `rose-nocturne`
3. `azure-aria`
4. `enterprise-calm`

`amber-seraph` 可以先作为设计保留主题，不一定首轮就进入代码。

原因：

- 首轮主题过多会让组件层和 Storybook 回归成本迅速膨胀
- `amber-seraph` 对会员、权益等页面有用，但不是所有基础组件的第一批必需主题
- 先用 3 个品牌主题 + 1 个企业 fallback，更容易控制质量和一致性

## 6. Tailwind v4 落地建议

### 6.1 继续采用 CSS-first

候选 `ui-public-vue` 内建议：

- `src/styles/theme.css`：基础 token 与语义 token
- `src/styles/themes/*.css`：每个 theme pack 的覆写
- 组件只消费 CSS variables 与少量语义化 Tailwind utility

### 6.2 运行时切换方式

建议以 `data-preset` 与 `data-theme` 驱动：

```html
<html data-preset="public-luxe" data-theme="elysia-default">
```

说明：

- `preset` 决定组件实现 owner
- `theme` 决定当前视觉包

### 6.3 不直接承诺自由编辑器

第一阶段只支持：

- 预设切换
- 主题包切换

不直接支持：

- 任意用户自定义 token 编辑器
- 主题 JSON 导入导出
- 预设与主题的任意跨乘积自动兼容保证

## 7. Storybook 不是 owner，而是验收面

Storybook 的职责应明确为：

- 展示 token
- 展示组件状态
- 展示 preset/theme 组合差异
- 作为视觉回归基线

不应承担：

- 第二套组件文档体系 owner
- 页面运行时逻辑 owner
- 主题事实的唯一来源

### 7.1 推荐 Storybook 信息架构

更接近 Storybook 官方组件驱动方式的做法，不是让使用者先进入整页 showcase，而是先能按基础设计与单组件快速浏览，再逐步上升到模式和导览页。当前更推荐固定为：

- `Foundations`
  - Theme Tokens
  - Theme Gallery
- `Components`
  - Button
  - Input
  - Card
  - Badge
  - Tabs
  - Dialog
  - Select
  - Switch
  - Empty State
  - Checkbox
  - Radio Group
  - Skeleton
  - Alert
  - Divider
- `Patterns`
  - Creator Center
  - Theme Atelier
- `Showcase`
  - Brand Showcase
  - Component Gallery
  - Showcase Hub

原则：

- `Foundations` 先解释主题 family、语义 token 与色板边界。
- `Components` 是默认主浏览层，按组件粒度查看状态、可达性与交互。
- `Patterns` 只验证组合后的真实页面气质与协同，不代替组件 stories。
- `Showcase` 保留品牌入口、系统导览与总览页，但不作为默认主入口。

### 7.2 Storybook Toolbar 建议

- `preset`
- `theme`
- `locale`
- `density`
- `reduced-motion`

## 8. `demohub` 的位置

`demohub` 仍然是 prototype-only owner，适合承接：

- 华美展示页试稿
- 品牌主题落地后的页面信息架构验证
- 高风格化 C 端页面的结构实验

但 `demohub` 不应直接承担：

- 基础组件 canonical owner
- 全局主题真相
- 企业预设 fallback

换句话说：

- `ui-public-vue` 负责组件和 token
- `demohub` 负责先把这些东西拼成真实页面原型

## 9. 候选目录结构

本轮不新增代码，但建议后续若实施，目录优先采用：

```text
packages/
  ui-public-vue/
    DESIGN.md
    package.json
    src/
      index.ts
      manifest.ts
      styles/
        theme.css
        themes/
          elysia-default.css
          rose-nocturne.css
          azure-aria.css
          enterprise-calm.css
      tokens/
        foundation.ts
        semantic.ts
        component.ts
        themes.ts
      components/
        button/
        input/
        card/
        badge/
        tabs/
        dialog/

apps/
  storybook-vue/
    package.json
    .storybook/
    stories/
```

## 10. Manifest 建议

为了支撑“可切换预设 + 可切换主题”，建议后续新增中立 manifest 形状：

```ts
interface PresetManifest {
  key: string
  framework: "vue"
  kind: "enterprise" | "public"
  status: "prototype" | "active" | "planned"
  displayName: string
  description: string
  supportedThemes: string[]
  defaultTheme: string
}

interface ThemePackManifest {
  key: string
  presetKey: string
  displayName: string
  tone: "luxe" | "calm" | "night" | "romantic"
  density: "comfortable" | "compact"
}
```

说明：

- `frontend-vue` 只拥有 manifest 类型和消费逻辑
- `ui-public-vue` / `ui-enterprise-vue` 各自拥有自己的具体 manifest 常量与实现

## 11. 实施分期建议

### Phase A：仅文档与边界

- 固定 `preset / theme` 分离模型
- 固定 owner 与非目标
- 已完成

### Phase B：最小个性化预设

- 新建 `packages/ui-public-vue`
- 第一阶段先落 theme pack、runtime 与展示基础类
- 第一批高频组件收敛为 `Button / Input / Card / Badge / Tabs / Dialog`
- 第二批受控组件扩到 `Select / Switch / Empty State`
- 第三批受控组件扩到 `Checkbox / Radio Group / Skeleton`
- 第四批轻量反馈组件扩到 `Alert / Divider`

### Phase C：Storybook 真实验收面

- 新建 `apps/storybook-vue`
- 加入 preset/theme toolbar
- 第一阶段把 stories 固定组织为 `Foundations / Components / Patterns / Showcase`
- 第一阶段先补 `Theme Tokens / Theme Gallery` 作为 `Foundations`
- 第一阶段为受控公共组件补齐独立 `Components` stories，让 Storybook 先像设计系统，再像展示站
- 第一阶段继续补 `Brand Showcase / Component Gallery / Showcase Hub` 作为辅助入口与导览层
- 补一条浏览器烟测脚本，直接验证 `Tabs / Radio Group / Dialog` 的关键交互路径
- 补页面级 `Patterns` stories，验证 `Creator Center / Theme Atelier / 会员前台 / 内容专题 / 活动落地页` 一类真实布局样机
- 补 `Pattern Composition` Foundations 治理入口，把页面组合统一收敛为 `hero / media / signal / action / recovery`，避免后续 pattern 退回页面级自由发挥
- 当 `Patterns` stories 继续扩展时，按场景拆成独立 story 文件，并为高风险 pattern 补最小浏览器烟测；当前已覆盖 `Theme Atelier` 的主题选择、密度与同步联动，以及 `Creator Center` 的 tabs、开关与输入编辑路径

### Phase D：示例应用接线

- `apps/example-vue` 增加一个“public-luxe + elysia-default”真实演示入口
- 高风格页面先落 `demohub`
- 不把现有企业工作区切到品牌预设

### Phase E：用户选择与 fallback

- 支持应用级 `preset` 选择
- 支持应用级 `theme` 选择
- 支持用户保留 `enterprise-tdesign`

## 12. 非目标

本设计明确不包含：

- 直接重写 `ui-enterprise-vue`
- 直接替换 `TDesign` 为品牌默认预设
- 开放式用户主题编辑器
- 多框架共享同一套组件实现
- 在 `ui-core` 引入任何品牌视觉语义

## 13. 验证策略

当前阶段最低验证应包括：

1. Storybook 可按 `Foundations / Components / Patterns / Showcase` 浏览，并展示至少 1 个 preset 与 3 个 theme pack
2. 每个基础组件都有 stories
3. 至少 1 个真实 demo page 证明默认品牌预设可落页面
4. 企业 TDesign 预设不因公共主题能力引入而退化
5. `demohub` 原型与 shared 组件边界不混淆

## 14. 与现有决策的关系

- 与 [ADR-0010](../decisions/ADR-0010-vue-enterprise-preset-tdesign-migration.md) 一致：
  - 企业预设继续由 `ui-enterprise-vue` 拥有
  - 不新增第二个企业预设 owner
- 本方案新增的是“个性化默认预设” owner，而不是推翻企业预设决策
- 当前已通过长期文档把 `packages/ui-public-vue` 与 `apps/storybook-vue` 升格为正式边界事实；若后续继续扩大到跨应用主题选择或多预设运行时切换，再判断是否补新的 ADR

## 结论

本轮设计的最终结论是：

1. `Elysian` 的默认品牌体验不应被企业后台风格绑死。
2. “用户可选 TDesign”说明仓库需要的是 `preset` 切换，不只是 `theme` 切换。
3. 个性化默认体验应通过新的独立 owner 承接，而不是继续扩写 `ui-enterprise-vue`。
4. Storybook 应作为主题系统的展示与回归面，而不是视觉 owner。
5. 第一阶段先支持受控 theme pack，后续再决定是否开放更自由的主题编辑能力。
