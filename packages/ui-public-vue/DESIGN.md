# ui-public-vue DESIGN

本文件是 `@elysian/ui-public-vue` 的可执行设计宪法。它定义 `public-luxe` 预设的主题、token、组件气质、Storybook 验收规则和禁止事项；组件实现、文档元数据与预览样式都必须回到这里对齐。

`public-luxe` 的目标不是“换一套颜色的企业后台”，也不是复制任何游戏 UI。它承接 Elysian 面向 C 端、品牌展示、创作者中心、会员权益和高风格化前台场景的默认个性化体验；用户仍可选择 `enterprise-tdesign` 等其他组件预设，或在 public 预设内选择更花哨、更清透或更克制的主题家族。

## 1. 边界与 Owner

- 预设 key 固定为 `public-luxe`。
- `packages/ui-public-vue` 拥有主题 token、theme pack、runtime data attribute、组件实现、组件文档元数据和预览辅助样式。
- `apps/storybook-vue` 只负责展示、评审和视觉回归，不拥有主题真相。
- `packages/ui-enterprise-vue` 继续拥有企业 TDesign 预设，不承接华美个性化默认风格。
- `apps/example-vue` / `demohub` 可消费 public 组件做页面试稿，但不反向定义 public token。
- `ui-core` 不得引入品牌颜色、Tailwind 类名或 public 组件视觉语义。

非目标：

- 不实现开放式主题编辑器。
- 不承诺任意 preset 与任意 theme 的自动兼容。
- 不复制崩坏三、Elysia 角色或任何游戏资产；只保留“晶莹、华美、轻神性、乐章感”的抽象气质。
- 不把组件库扩成完整业务应用壳层。

## 2. 设计命题

`public-luxe` 的核心气质是“月辉晶面”：珍珠白作为空间底色，花瓣粉承担默认主操作，薄蓝表达清澈与结构，香槟金作为克制点睛，表面像丝绸和切面宝石一样有轻微层次，但交互边界仍然清楚。

默认 `elysia-default` 应更像二次元角色主题的产品化转译：轻快、明亮、带一点舞台感和花瓣感，而不是冷静企业蓝。它只能抽象表达“粉发、蓝眼、白色礼服、金色饰点”这一类角色色彩印象，不复制角色服装、图形、构图或任何专有资产。

必须同时满足：

- 有辨识度：一眼区别于企业蓝灰后台。
- 可维护：所有视觉变化通过 token 与 theme pack 控制。
- 可读：正文、表单、错误态和 dark mode 的对比优先于装饰。
- 克制华美：允许边框光、细纹理、渐变和轻辉光；禁止厚玻璃、大光球、重阴影和过大圆角。
- 优雅：以清晰层级、稳定留白、精确比例和少量高质量细节取胜，不靠堆叠装饰制造“高级感”。

优雅判断标准：

- 一个视图只允许一个主要视觉焦点；其余装饰必须降低层级。
- 主题色先服务层级和状态，再服务氛围；同屏不得让 `primary / secondary / accent` 同时争抢主位。
- 大面积区域使用低饱和 neutral / surface，华美感落在边框、局部高光、标题数字和关键 action。
- 组件形态保持挺拔与清楚，避免过软、过甜、过圆导致“玩具感”。
- 文案、排版、间距和焦点态必须比背景纹理更稳定；内容可读性永远优先。
- 如果一个效果无法解释它承担的层级、状态或品牌语义，应删除而不是继续调参。

## 3. 外部设计依据

配色与主题体系参考三类成熟共识，但不引入它们作为实现依赖：

- Tailwind CSS v4：使用 CSS-first 变量与 OKLCH 色彩表达，适合通过 `data-theme` / `data-*` 做多主题切换。
- Material 3：使用 `primary / secondary / tertiary` 和 `on-* / container` 配对角色，避免暗色和高饱和背景中的文字对比失控。
- Radix Colors：主题可绑定 tinted neutral，而不是所有主题共用纯灰；暗色模式中尤其要避免背景灰过饱和。

落地结论：

- 每个主题必须先定义中性表面，再定义强调色。
- 每个主题必须有 `light` 与 `dark` 成对 token，不允许只把背景改黑。
- 每个 launch theme 必须在 `theme.css` 中显式提供 light/dark 两个选择器，并覆盖背景、surface、文本、线框、primary、secondary、accent 与 shadow 等核心审美 token。
- 状态色语义固定，主题只调整明度与饱和度，不改变含义。

## 4. 主题家族

第一阶段正式提供四个主题家族：

- `elysia-default`
  定位：默认角色转译主题。
  气质：花瓣、月光、晶面、轻神性、女主角式舞台活力。
  配色轴：花瓣粉 primary、薄蓝 secondary、香槟金 accent、珍珠粉白 neutral。
  适用：默认首页、Creator Center、品牌展示、角色感入口、通用 C 端页面。
  风险控制：活力来自更明确的粉蓝金角色色谱、局部高光和清澈表面，不来自大面积高饱和背景、过多动效或所有组件同时发光。

- `rose-nocturne`
  定位：华丽叙事与夜宴感主题。
  气质：玫瑰、绸缎、夜幕、柔金。
  配色轴：玫瑰粉 primary、葡萄紫灰 secondary、柔金 tertiary、轻紫灰 neutral。
  适用：活动页、内容专题、角色页、节日主题。
  风险控制：紫色只做低饱和底色或辅轴，不做全页高饱和紫。

- `azure-aria`
  定位：清透、简约、带乐章感的信息主题。
  气质：晨雾、星海、玻璃弦乐。
  配色轴：青蓝 primary、银灰蓝 secondary、薄荷青 tertiary、蓝灰/青灰 neutral。
  适用：信息密度较高的前台工作区、仪表卡片、轻运营界面。
  风险控制：避免退化成企业科技蓝。

- `enterprise-calm`
  定位：企业 fallback 主题。
  气质：克制、稳态、低风险。
  配色轴：稳态蓝 primary、青灰 secondary、低饱和金或青 tertiary、纯净灰/轻蓝灰 neutral。
  适用：需要降低装饰度、贴近企业场景但仍消费 public 组件的页面。

设计保留主题：

- `amber-seraph`
  定位：会员、权益、付费、礼赠场景。
  当前只作为设计储备，不进入第一阶段代码承诺。

禁止自由拼色：

- 业务页面不得绕过 theme pack 自行指定主色。
- 一个主题内不得同时使用两个竞争性的高饱和主色。
- `badge / tag / status / alert` 不得使用未纳入语义 token 的任意颜色。
- dark mode 不得继续使用 light mode 的高亮 surface 色阶。
- 主题评审必须先选择完整 theme family，再讨论局部组件状态；不得以单页“更好看”为理由临时混用另一个 theme family 的 accent 或 neutral surface。

主题组合评审顺序：

- 先确认当前页面适合哪个 theme family。
- 再确认该 family 的 light/dark 配对是否都能承载页面主流程。
- 再确认 `primary / secondary / accent / neutral` 是否各司其职。
- 最后才讨论局部组件是否需要状态或密度调整。

## 5. Runtime 契约

根节点必须通过 data attribute 表达 preset、theme 与模式：

```html
<html
  data-preset="public-luxe"
  data-theme="elysia-default"
  data-mode="system"
  data-resolved-mode="light"
>
```

- `data-preset` 决定组件实现 owner。
- `data-theme` 决定主题家族。
- `data-mode` 表达用户选择：`light | dark | system`。
- `data-resolved-mode` 表达实际生效模式：`light | dark`。

组件 CSS 只读取语义 token 与组件 token，不直接判断业务页面，也不依赖 Storybook class。

## 6. Token 契约

Token 分四层，禁止组件越层消费未稳定值。

Foundation tokens：

- 字体：`--ely-public-font-display`、`--ely-public-font-sans`
- 半径：`--ely-public-radius-sm/md/lg`
- 阴影：`--ely-public-shadow-card`、`--ely-public-shadow-soft`
- 页面宽度、动效时长、基础间距

Semantic tokens：

- 背景：`--color-bg`、`--color-bg-subtle`
- 表面：`--color-surface`、`--color-surface-elevated`、`--color-surface-overlay`
- 文本：`--color-text`、`--color-text-muted`、`--color-text-soft`
- 线框：`--color-line`、`--color-line-strong`
- 强调：`--color-primary`、`--color-secondary`、`--color-accent`
- 状态：`--color-success`、`--color-warning`、`--color-danger`、`--color-info`

Paired tokens 后续新增时必须成对：

- `--color-on-primary`
- `--color-primary-container`
- `--color-on-primary-container`
- `--color-on-secondary`
- `--color-secondary-container`
- `--color-on-secondary-container`
- `--color-accent-container`
- `--color-on-accent-container`
- `--color-on-tertiary`
- `--color-tertiary-container`
- `--color-on-tertiary-container`
- `--color-info-container`
- `--color-on-info-container`
- `--color-success-container`
- `--color-on-success-container`
- `--color-warning-container`
- `--color-on-warning-container`
- `--color-danger-container`
- `--color-on-danger-container`

Component tokens：

- `--button-glow`
- `--card-overlay`
- `--chip-bg`
- `--hero-gradient`
- `--focus-ring`
- `--color-material-sheen`
- `--color-material-sheen-strong`
- `--color-material-line-glint`

规则：

- 组件优先消费 semantic/component tokens，不直接写死主题色。
- 除 `theme.css` 的 theme token 定义外，组件 CSS 与 preview CSS 不允许直接写十六进制、RGB/HSL/OKLCH 或 `white/black` 静态色值。
- 主题色职责固定：
- `primary`：主操作、焦点态、选中态和关键路径。
- `secondary`：品牌质感、辅助高光、低频强调和局部层次。
- `accent`：玫瑰/金/薄荷等记忆点，只做点睛和少量标签，不承担主操作。
- `status`：`success / warning / danger / info` 只表达状态，不参与品牌拼色。
- 状态色固定语义：success 绿/青绿，warning 黄橙，danger 红，info 蓝青。
- `accent` 只做点睛，不替代 `primary` 成为大面积操作色。

## 7. Light / Dark 模式

Dark mode 不是反色。每个主题必须重新定义：

- 背景层级
- surface 层级
- 文本强弱对比
- 线框与 focus ring
- primary / secondary / accent 在暗色下的明度
- 阴影、辉光与 overlay 强度

暗色规则：

- 先压低背景饱和度，再抬高强调色。
- 高彩度只留给主按钮、激活状态、重要标签和稀有点睛内容。
- 正文使用 neutral text，不使用品牌主色文本。
- 大面积容器不得使用高饱和彩色背景。
- 彩色容器必须配对 `on-*` 文本 token 或明确保证对比。

## 8. 字体与排版

- Display 字体用于品牌标题、卡片标题、关键数字和章节标题。
- Sans 字体用于正文、表单、按钮、辅助说明和高密度信息。
- Eyebrow 只用于短促分组、品牌节奏和导航提示，不能替代主标题或行动文案。
- 标题可以有气质，但不能做营销页巨幅封面字号；Storybook 和组件文档标题要服务浏览。
- 正文行高默认保持 `1.6 ~ 1.75`。
- 低强调文本仍必须可读，不允许为了氛围把正文压到过低对比。
- 英文大写 eyebrow 可用于品牌感，但不能替代主文案。
- 可见文案不得暴露 `POC`、`preview skeleton`、`runtime state` 等研发态词汇；必要技术事实应转换为用户可理解的动作、结果或风险。
- 华美表达必须服务含义：可以有月辉、晶面、乐章感，但不能用诗性词汇隐藏下一步操作。
- 链接和按钮文案必须命名目的地或动作，不使用只有 `click here` / `learn more` 这类无法独立理解的表达。

## 9. 圆角、阴影与材质

圆角尺度：

- 小控件：`6px`
- 输入、按钮、badge、局部容器：`8px ~ 10px`
- 卡片、tabs panel、dialog：`10px ~ 14px`
- 头像 circle、switch track、progress track 可使用 `999px`
- CSS 中只能使用 `--ely-public-radius-sm/md/lg`、`999px` 或 `inherit`；不得再写临时 `7px / 12px / 16px` 等局部圆角。
- 普通圆角不得超过 `14px`；`999px` 只作为 circle、pill、track 等明确语义例外。

禁止：

- 大面积 `20px+` 圆角。
- 所有组件都胶囊化。
- 同一页面混用多套半径体系。
- 为了单个组件“更可爱”新增局部圆角刻度。

材质规则：

- 使用细边框、浅渐变、低透明 overlay 和轻辉光建立层级。
- 允许晶面、珠光、丝绸感，但必须由 token 控制。
- 禁止厚重毛玻璃、大面积 blur、独立漂浮光球、强 bokeh、重投影。
- 表单和交互控件的边界必须比装饰更明确。

Surface rhythm：

- 页面默认按 `背景层 -> 主面层 -> 局部分组 -> 状态层` 判断层级。
- 一个视口最多允许一个高强调主面层；其他 surface 应通过更低对比、分隔线或留白退后。
- 局部分组优先使用间距、`Divider`、`Badge`、低对比 panel 和排版对齐，不优先新增完整卡片。
- 当页面出现卡片套卡片倾向时，先降低内层容器语义，而不是继续增加阴影、边框光或圆角。
- 密度分为 `ceremonial / comfortable / compact` 三类使用语境；密度变化只能改变节奏，不改变主题色职责和圆角尺度。
- 需要提升层级时，先调整结构和留白，再调整色彩或材质。

Responsive rhythm：

- 桌面端可以承载对照、辅助事实和局部侧栏；移动端必须保留同一决策顺序，而不是机械缩小网格。
- 移动端首个有效视口应优先保留当前状态、主操作和恢复路径；装饰性侧栏、主题插画和额外统计应先后移或删除。
- `ceremonial / comfortable / compact` 只改变留白、列数和分组节奏，不改变主题色职责、圆角尺度、组件语义或状态表达。
- 紧凑密度不得牺牲触控目标、焦点可见性和错误反馈。
- 当布局空间不足时，先裁剪装饰，再折叠辅助内容，最后才考虑隐藏低频操作。

Imagery & iconography：

- 视觉资产只能抽象表达“月光、晶面、丝绸、乐章、atelier、轻神性”等气质，不得复制游戏角色、服装、UI 框架、专有标识或可识别构图。
- 图像先确认角色：氛围图、身份图、说明图或状态图；无法说明角色的图片应删除。
- 媒体展示优先使用 `Image / Avatar` 等受控组件，保持比例、fallback、alt text 和边界一致。
- 有意义图片必须提供可理解的 alt text；纯装饰纹理应由 CSS token 控制或对辅助技术隐藏。
- 图标只用于状态、类别、方向或稀有品牌点睛；不得在同一局部 surface 混用多套图标重量、emoji 和插画符号。

Accessibility & inclusion：

- 华美效果不能削弱键盘路径、焦点可见性、文本对比、错误文案、媒体替代文本和 reduced-motion 降级。
- 焦点态必须可见且与当前控件边界绑定；辉光、渐变和材质只能增强焦点，不能替代 focus ring。
- 错误、警告、选中、禁用和加载状态不得只靠颜色表达，必须配合结构、文案、边框、图标或 ARIA 语义。
- 校验文案必须说明下一步修复动作，不用含糊的诗性表达隐藏用户该做什么。
- 暗色模式、低强调文本和 muted copy 仍必须优先满足阅读与判断，不得为了氛围降低到不可读。
- 动效、图片和装饰不能承载唯一语义；reduced-motion 下应保留同等信息层级与操作路径。

## 10. Motion

动效关键词：`reveal`、`shimmer`、`soft glow`、`layered fade`、`slow focus`。

动效与材质规则：

- `reveal` 用于页面或局部 surface 入场，必须同向、轻量、有编排，不允许多个元素各自漂移。
- `shimmer` 只属于加载、骨架和少量材质高光，不用于让静态卡片持续闪动。
- `soft glow` 只属于 focus、active、progress 和单一仪式性焦点，不得成为所有卡片的默认阴影。
- reduced-motion 下内容、状态和层级仍必须完整可读，动画不能承载唯一语义。
- 晶面、丝绸感和珠光必须由 token、border、overlay、shadow 控制，不允许在组件或 Storybook 展示层写本地色值。

规则：

- hover 位移不超过 `1px ~ 2px`。
- 主要交互动效控制在 `160ms ~ 240ms`。
- skeleton shimmer 可以存在，但不能抢过内容。
- Dialog 动效应聚焦内容进入，不做夸张缩放。
- 必须尊重 `prefers-reduced-motion`；复杂动效后续新增时先补降级规则。

禁止：

- 弹跳卡通感。
- 高频缩放。
- 粒子雨或持续闪烁。
- 让装饰动效影响表单输入与阅读稳定性。

## 11. 组件分层模型

Public 组件分为四层：

- Foundation primitives：`Text / Link / List / DescriptionList / Table / Kbd / Image / Avatar / Divider / Meter`
- Action and input：`Button / Icon Button / Menu / Toolbar / Input / Search Input / NumberInput / Select / Slider / Rating / Switch / Checkbox / Radio Group / Segmented Control`
- Surface and structure：`Card / Tabs / Dialog / Stat / Timeline`
- Feedback and state：`Badge / Alert / Progress / Spinner / Popover / Skeleton / Empty State`

组件 Anatomy 统一判断：

- Token contract：主题、模式、surface、文本、强调、状态、圆角与材质 token 必须来自本 package。
- Component shell：组件只消费 semantic/component tokens，不在组件内重新发明主题色、临时圆角或独立阴影。
- Local state：hover、focus、selected、invalid、disabled、loading、empty 与 feedback 状态必须使用组件已有语义或状态 token。
- Pattern assembly：页面级 pattern 只能组合 public primitives，不反向定义组件 API、主题 token 或展示层专用视觉真相。

新增组件前必须回答：

- 是否属于 public-luxe 组件 owner，而不是业务页面。
- 是否已有组件可组合完成。
- 是否需要组件级文档元数据。
- 是否有状态矩阵与可访问性说明。
- 是否会使单文件接近不可审查体量。

## 12. 高频组件规则

- `Button`：主按钮允许柔和渐变与轻辉光；secondary/ghost 必须保留边界；hover 不靠夸张位移。
- `Icon Button`：承接局部紧凑图标动作，必须有明确 `aria-label`；只有收藏、静音、固定等开关式图标动作可使用 `pressed / aria-pressed`；不得隐藏主 CTA、替代全局导航、承接命令面板或成为纯装饰按钮。
- `Menu`：承接局部次级动作与紧凑溢出选择，必须保持单层、短文案和明确触发器；不得替代全局导航、命令面板、多级菜单或主按钮。
- `Toolbar`：承接同一 surface 内的局部动作 lane；必须保持一个主行动、低频动作收进 Menu 或 Link，不得替代应用壳层、全局导航、表格命令栏或完整表单布局。
- `Link`：保持链接识别度，不冒充按钮；正文中默认可通过下划线或细微色差识别。
- `Breadcrumb`：只表达稳定路由祖先；深路径可折叠中段，但不得变成下拉导航、筛选器或流程步骤。
- `Pagination`：只表达有界集合翻页；页码、当前页和省略号必须可本地化并保持可访问，不得替代进度、筛选或 tabs。
- `List`：承接重复信息行、轻量入口和内容索引，优先用分隔线与留白建立节奏，不把每行做成独立卡片。
- `DescriptionList`：承接 label/value 事实组，优先用语义化 `dl`、短标签和细分隔建立可读性，不用小卡片网格替代。
- `Table`：承接只读规格、权益、对照和紧凑审查矩阵；不得做排序、筛选、选择、编辑、行操作或企业数据网格。
- `Kbd`：承接快捷键、键盘帮助和内联命令提示，只表达键名，不注册快捷键、不替代按钮、Badge 或 Chip。
- `Text`：承担阅读节奏，禁止页面散落段落类名替代系统正文语义。
- `Image`：提供受控比例、加载骨架、失败回退；媒体框架不能抢过标题和主动作。
- `Avatar`：只表达身份与协作状态；circle 只服务头像语义，不扩大整体圆角体系。
- `Input / Select`：共享表面语言；错误态必须通过边框、文案和表面变化共同表达。
- `Search Input`：承接单行查询、显式提交和清空恢复；不得扩成 autocomplete、filter builder、命令面板、全局搜索或结果系统。
- `Slider`：承接有界连续偏好调节；必须展示标签、范围含义和可读值，不能作为装饰进度条或主题编辑器入口。
- `Rating`：承接小规模有序反馈；必须说明评分对象和尺度含义，不得扩成评论系统、排行榜或奖励机制。
- `Switch`：先表达开关状态，再表达装饰；开启态可有辉光但不牺牲标签可读性。
- `Checkbox`：表达选择/确认，视觉语义与 switch 区分。
- `Radio Group`：表达单选决策，不做成 tabs 的替代品。
- `Segmented Control`：表达紧凑视图、密度、语气或模式切换；不得替代 Tabs、Radio Group、路由导航或提交确认。
- `Card`：是主题气质主要载体，允许 overlay 和边框光，但内容排版必须稳定。
- `Tabs`：表达分区切换，必须支持方向键、`Home`、`End`。
- `Dialog`：精致面板而非压迫式全屏遮罩；至少支持 `Escape`、初始焦点与关闭后焦点恢复。
- `Stat`：服务摘要与判断，不做装饰性数字海报。
- `Meter`：承接容量、健康度、质量、契合度等有界指标；不得替代 Progress、Spinner、Stat、Table 或图表。
- `Badge`：只承担状态与标签强调，不抢主层级。
- `Alert`：承担状态解释和下一步引导；只有 advisory 或已解决反馈可使用 dismissible，阻断性修复提示必须保持可见，不退化成厚重系统横幅或可随手忽略的装饰。
- `Toast`：承担短时动作反馈，可带一个安全的局部文字动作；不得承接多动作决策、必读修复说明、通知中心或持久状态解释。
- `Progress`：必须配对语义文本，不允许只留彩色条。
- `Spinner`：只表达局部短等待或无确定百分比的等待状态；必须有可访问 label，不能替代 Skeleton、Progress、全页遮罩或装饰动效。
- `Popover`：承接局部结构化上下文和小预览；不得替代 Tooltip、Menu、Dialog、表单 lane 或全局导航。
- `Timeline`：表达发布记录、活动日程、会员历程和内容编年；它是时间叙事，不是流程导航或进度条。
- `Skeleton`：服务加载节奏，不成为动画装饰。
- `Empty State`：表达缺失原因和下一步入口。
- `Divider`：用于节奏和分区，不抢标题层级。
- `NumberInput`：用于精确数量、阈值、席位、周期等可输入数值；单位必须可见，边界和错误说明必须通过 label、description 或 invalid message 表达，不把价格计算、库存锁定或业务校验藏进组件。

交互状态统一规则：

- Hover / active：位移不超过 `1px ~ 2px`，不得用大幅移动或缩放制造反馈。
- Focus：必须有可见 focus ring，不能只依赖颜色变化或阴影暗示。
- Disabled：保留布局和文本可读性，同时明确阻断交互。
- Loading：保留组件轮廓与尺寸，避免按钮、卡片或列表在等待时跳动。
- Invalid：必须同时提供边界变化、语义文案和辅助技术可读状态，不只靠颜色。
- Selected：表达当前选择，不替代页面主 CTA。
- Feedback：`Alert / Progress / Skeleton / Empty State` 先服务状态解释，再服务氛围。

动作层级统一规则：

- 一个 surface 默认只能有一个 primary 下一步；如果出现多个 primary，应先拆分流程或重排信息，而不是继续调色。
- `secondary` 只用于同级安全替代动作，`ghost` 用于取消、预览、恢复、查看详情或低强调出口。
- `Link` 只负责导航、披露和支持信息，不应伪装成按钮来争夺主行动层级。
- `Badge` 只解释状态、类别或选择结果，不承接点击行为，不替代按钮。
- `Alert` 和 `Empty State` 的 action slot 也必须遵守一个主恢复动作 + 一个低强调辅助动作的节奏。
- 危险、阻断和警告必须先由文案解释，再给动作；不得用 danger/warning 颜色本身替代决策说明。

导航与导览统一规则：

- 全局导航只表达当前信息架构 lane，不承接页面主决策。
- `Tabs` 只用于同一 surface 内的平级 section；如果目标跨 owner、跨 route 或跨工作流，应使用 `Link`。
- breadcrumb、support link 和版本/政策类链接应保持低强调，但必须可发现。
- 当前路径、当前 section、当前状态和下一步 action 必须能同时被用户识别，且 action 层级高于导航层级。
- `Badge` 可作为当前 lane 或状态证据，不得成为伪导航或第二菜单。
- 移动端必须保留 route -> section -> primary action -> support link 的判断顺序，不得为了装饰先展示无关入口。

数据展示统一规则：

- `Stat` 服务摘要判断，不做装饰性数字海报；value 必须短，label/helper 必须解释数字含义。
- `Progress` 必须配对任务标签与可读进度，不能只留下彩色条或动效。
- `Slider` 必须表达用户可调的有界输入，不能用于只读完成度、价格承诺、法律同意、颜色选择或破坏可访问性底线的装饰调参。
- `Rating` 必须表达用户或系统给出的离散反馈，不得替代进度、统计图、完整评论、审核结论或业务评分模型。
- `Badge` 在数据场景中只表示状态、类别或筛选结果，不替代数据摘要或 action。
- `Divider` 可用于标记摘要节奏变化，但 label 不应抢过真实标题。
- `Table` 可用于小规模对照矩阵；如果数据需要操作、排序、筛选、批量选择或实时刷新，应进入企业表格或后续专用数据网格。
- 数据面板默认只突出一个主信号；其他指标应通过 muted 文案、分组和低对比 surface 降级。
- 如果数据需要精确比较、排序或审计，应进入表格/图表等后续专用组件，不要强塞进 `Stat`。

## 13. Preview 与 Storybook 规则

预览辅助类归 `packages/ui-public-vue/src/styles/preview-layout.css`，只能服务 Storybook/设计评审布局，不得伪装为生产组件。

Theme pack 预览元数据归 `packages/ui-public-vue/src/themes.ts`：

- `preview.heroFrom / heroTo / accent / surface` 表达 light mode 的缩略预览色。
- `preview.dark.heroFrom / heroTo / accent / surface` 表达 dark mode 的缩略预览色。
- `publicThemeSemanticTokenDefinitions` 表达 theme token 的分组、角色和成对文本关系，供 Storybook 和文档消费；新增语义 token 时必须先补这里，避免 Storybook 自行解释主题系统。
- Storybook 可以用这些元数据生成 demo artwork、色卡和主题卡片，但不得在 story 文件里维护第二套主题色。
- 预览元数据只服务展示与选择器，不替代 CSS semantic token。

命名约束：

- 组件 class 使用 `.ely-public-{component}`。
- 预览布局 class 应优先使用 `.ely-public-preview-*` 或 `.ely-public-showcase-*`。
- 禁止预览 class 与真实组件 class 同名，例如预览统计块不得继续占用 `.ely-public-stat`。

Storybook 信息架构固定：

- `Foundations`：主题、token、主题家族说明。
- `Components`：组件级 stories、props、状态、可访问性。
- `Patterns`：Creator Center、Theme Atelier、会员/权益等页面组合验证。
- `Showcase`：品牌入口和导览，不作为组件文档真相。

Pattern 规则：

- Pattern composition 固定由 `hero / media / signal / action / recovery` 五类语法判断；不同 C 端场景可以调整内容密度和媒体角色，但不得绕过主题角色、圆角尺度、动作层级和恢复路径规则。
- 表单与反馈 pattern 必须同时展示标签、说明、校验、同意/确认、进度、反馈和恢复路径，不能只展示视觉上漂亮的输入框。
- 会员权益 pattern 必须同时展示主领取动作、权益摘要、进度解释、稀缺提示、历史/失败恢复路径和 support link；稀缺感只能作为 `accent` 点睛，不得重写主题主色或制造整页金色噪音。
- 内容专题 pattern 必须同时展示受控媒体比例、主阅读顺序、内容分区、support link、进度/状态和 archive recovery；专题氛围只能通过 theme artwork、surface rhythm 和排版建立，不得变成独立 CMS 视觉体系。
- 活动落地页 pattern 必须同时展示主报名动作、席位/进度解释、日程节奏、政策/support link 和 access recovery；活动仪式感只能通过 hero、受控媒体、surface rhythm 和排版建立，不得变成多主按钮促销页、倒计时压迫页或独立活动视觉体系。
- Pattern 只能组合 public primitives，不拥有业务表单模型、业务流程、路由或状态机真相。
- 页面组合样式只服务评审和回归，不得回流为组件 API 或主题 token。

组件文档规则：

- 文档真相来自 `packages/ui-public-vue` 的组件文档元数据。
- Storybook 只能消费并呈现，不维护第二份 API 说明。
- 每个 public 组件必须至少有 usage、decision guidance、composition guidance、anti-patterns、props、states、accessibility。

## 14. Do / Don't

Do：

- 用低饱和中性表面承托主题气质。
- 用 primary/secondary/accent 的固定职责控制视觉层级。
- 用细边框、轻渐变、局部辉光表达华美。
- 用少量准确的装饰建立记忆点，而不是让每张卡片都成为主角。
- 在 dark mode 中重新设计 surface，而不是反色。
- 用真实组件 primitive 组合页面 pattern。

Don't：

- 不用大面积紫色渐变当默认品牌。
- 不用过大圆角、厚玻璃和重阴影制造高级感。
- 不把“优雅”误解为低对比、过淡文本或没有焦点的灰白页面。
- 不同时堆叠强渐变、强阴影、强纹理和强高光。
- 不在 Storybook 或 demohub 里定义第二套 token。
- 不让每个页面自由挑颜色。
- 不把展示页 class 当组件 API。
- 不为了“组件更丰富”继续无设计地堆组件。

## 15. 当前组件清单

当前 public 组件范围：

- `Accordion`
- `Button`
- `Link`
- `List`
- `DescriptionList`
- `Breadcrumb`
- `Pagination`
- `Stepper`
- `Timeline`
- `Tooltip`
- `Stat`
- `Text`
- `Kbd`
- `Avatar`
- `Image`
- `Input`
- `Card`
- `Badge`
- `Chip`
- `Toast`
- `Tabs`
- `Dialog`
- `Progress`
- `Spinner`
- `Popover`
- `Meter`
- `Select`
- `Slider`
- `Rating`
- `Switch`
- `Empty State`
- `Checkbox`
- `Radio Group`
- `Segmented Control`
- `Toolbar`
- `Skeleton`
- `Alert`
- `Divider`
- `Menu`
- `Table`
- `Search Input`
- `Icon Button`

下一阶段优先级：

- 先修正 token 与预览/组件命名冲突。
- 再补组件状态一致性和可访问性缺口。
- 再考虑少量高价值 pattern。
- 暂停无设计依据的组件数量扩张。

## 16. 实现对齐清单

每次修改 public 主题或组件前检查：

- 是否仍属于 `packages/ui-public-vue` owner。
- 是否复用已有 semantic/component token。
- 是否同时考虑 light 与 dark。
- 是否只有一个主要视觉焦点，装饰是否服务层级、状态或品牌语义。
- 是否让每个 launch theme 的 light/dark CSS 覆盖核心审美 token，而不是只补 theme pack 元数据。
- 是否避免组件/preview CSS 直接写静态颜色，新增颜色应先回到 theme token。
- 是否遵守 `sm / md / lg / 999px / inherit` 的圆角尺度，避免新增临时 px 值。
- 是否保持 `primary / secondary / accent / status` 的职责分离，避免自由拼色。
- 是否避免 preview class 与组件 class 冲突。
- 是否同步组件文档元数据。
- 是否需要同步 `apps/storybook-vue/DESIGN.md` 或 `MODULE.md`。
- 是否需要运行 `bun run build:storybook:vue`、组件测试或 Storybook smoke。
