# ui-public-vue

## 模块职责

- 作为 `public-luxe` Vue 品牌预设的 canonical owner。
- 负责公共个性化主题系统的 token、CSS runtime 契约、组件文档元数据与最小展示组件基线。
- 负责 `data-preset / data-theme / data-mode / data-resolved-mode` 的运行时读写。

## 明确不负责

- 不负责 `TDesign` 企业预设运行时。
- 不负责业务页面、真实工作区路由与应用级状态。
- 不负责把主题真相放进 Storybook 或 `apps/example-vue`。

## 允许依赖

- `@elysian/ui-core`

## 当前阶段边界

- 第一阶段提供受控 theme pack、样式 token 与高频公共组件基线。
- 当前样式边界拆为 `theme.css`（theme token 与 runtime base）、`components-core.css`（基础内容与核心表单/媒体样式）、`components-interaction.css`（头像、选择、tabs、tooltip、dialog、空态、骨架与布局辅助样式）、`components-feedback.css`（反馈与轻量 token 组件样式）与 `preview-layout.css`（Storybook/预览布局辅助类），仍全部归本 package owner。
- 当前组件范围收敛为 `Button / Avatar / Input / Card / Badge / Tabs / Dialog`。
- 当前已扩到第二批受控组件：`Select / Switch / Empty State`。
- 当前已扩到第三批受控组件：`Checkbox / Radio Group / Skeleton`。
- 当前已扩到第四批轻量反馈组件：`Alert / Divider`。
- 当前已新增 `Progress`，用于上传、阶段完成度和前台任务推进的线性状态表达。
- 当前已新增 `Image`，用于卡片预览、图文内容与主题化媒体框架，不把媒体展示退回原始 `img` 标签。
- 当前已新增 `Link`，用于前台正文、说明动作与轻量导航，不把大量内联动作退回裸 `<a>`。
- 当前已新增 `List`，用于设置项、内容索引、活动摘要和轻量导航行，减少为了重复信息继续堆叠卡片。
- 当前已新增 `DescriptionList`，用于资料事实、订单摘要、活动规则和规格说明的 label/value 信息块，不把每个事实拆成独立小卡片。
- 当前已新增 `Breadcrumb`，用于前台详情页、专题页和账户层级的路线导览，并支持深路径中段折叠，不把父级路径误塞进 `Tabs`、普通 `Link` 列表或下拉导航。
- 当前已新增 `Pagination`，用于分页列表、搜索结果、专题归档和历史记录的有界翻页，并支持页码、当前页与省略号的可访问文案本地化，不把页码误用为 `Progress`、筛选器或 `Tabs`。
- 当前已新增 `Stepper`，用于 onboarding、发布、下单、审核等小规模有序流程，不把流程步骤误用为 `Pagination`、`Tabs` 或 `Progress`。
- 当前已新增 `Timeline`，用于发布记录、活动日程、会员历程和内容编年，不把时间叙事误用为 `Stepper`、`Progress` 或嵌套卡片流。
- 当前已新增 `Accordion`，用于 FAQ、政策说明、设置解释和可选内容披露，减少用嵌套卡片承载次级说明。
- 当前已新增 `Tooltip`，用于短上下文解释、术语提示和标签辅助说明，减少为了说明文字继续增加嵌套卡片。
- 当前已新增 `Chip`，用于已选筛选、可移除标签和轻量偏好 token，避免把 `Badge` 或 `Button` 错用为 selected/removable item。
- 当前已新增 `Toast`，用于短时动作反馈、保存确认、可关闭提示和单个安全局部动作，避免把瞬态反馈塞进 `Alert`、通知中心或页面卡片。
- 当前 `Alert` 已支持 advisory 场景的可关闭反馈；`dismissible / dismissLabel / dismiss` 只用于可安全移除的非阻断提示，不用于隐藏必需修复路径、法务说明或发布 blocker。
- 当前已新增 `Stat`，用于主题系统里的摘要数据块、卡片指标与轻量概览，不再依赖 story 层散落的统计结构。
- 当前已新增 `Text`，用于前台正文、说明文与辅助语句的统一排版 owner，不再依赖零散段落类名。
- 当前已新增 `Kbd`，用于快捷键、键盘帮助和命令提示的内联键帽表达，不承担快捷键注册、命令面板或全局 keyboard listener。
- 当前已新增 `Menu`，用于局部次级动作、单层溢出菜单和紧凑支持出口，不承担全局导航、命令面板、多级菜单或主操作隐藏。
- 当前已新增 `Toolbar`，用于把同一 surface 内的主动作、次级动作、视图偏好和支持出口收束为扁平 action lane，不承担应用壳层、全局导航、表格命令栏或完整表单布局。
- 当前已新增 `Table`，用于只读规格、权益、对照和紧凑审查矩阵，不承担排序、筛选、选择、编辑、行操作或企业数据网格。
- 当前已新增 `Slider`，用于主题强度、装饰预算、密度/音量一类有界连续偏好调节，不承担范围滑块、价格输入、颜色选择器或主题编辑器。
- 当前已新增 `Rating`，用于内容质量、满意度、主题契合度等小规模有序反馈，不承担评论系统、评分聚合、情绪分析或游戏化奖励机制。
- 当前已新增 `DateInput`，用于活动日期、会员有效期、发布时间和恢复截止日等单日期输入，不承担日历弹层、日期范围、时区转换、复发规则、可用性搜索或排期系统。
- 当前已新增 `FileInput`，用于头像、凭证、投稿附件和支持证据等本地文件选择，不承担上传传输、拖拽队列、预览编辑、病毒扫描、文档解析或存储策略。
- 当前已新增 `Fieldset`，用于表单控件的原生语义分组、共享说明和组级修复提示，不承担表单模型、校验框架、布局系统、卡片容器或业务提交流程。
- 当前已新增 `Textarea`，用于评论、简介、投稿说明和支持消息等长文本输入，不承担富文本编辑器、评论线程、markdown 预览、AI 写作、审核系统或发布工作流。
- 当前已新增 `Spinner`，用于局部动作、短等待和无确定百分比的紧凑加载反馈，不承担全页遮罩、上传进度、骨架替代、轮询状态机或装饰动效。
- 当前已新增 `Popover`，用于局部结构化上下文、小预览和少量支持动作，不承担全局导航、命令菜单、模态确认、表单抽屉或完整帮助中心。
- 当前已新增 `Meter`，用于容量、健康度、质量、契合度等有界指标表达，不承担任务完成进度、等待状态、单数字摘要、数据表格、排行榜或图表。
- 当前已新增 `Segmented Control`，用于紧凑视图、密度、语气或模式切换，不承担 Tabs 内容分区、Radio Group 表单说明、路由导航、长选项列表或提交确认。
- 当前已新增 `Search Input`，用于单行查询输入、显式提交和清空恢复，不承担 autocomplete、filter builder、命令面板、全局搜索、结果页、排序或 saved search。
- 当前已新增 `Icon Button`，用于局部工具栏、媒体控制、低频紧凑动作和有限的开关式图标动作，强制可访问名称；`pressed / aria-pressed` 只表达收藏、静音、固定等本地 on/off 状态，不承担隐藏主 CTA、全局导航、命令面板、收藏系统、快捷键注册或纯装饰按钮。
- 当前组件文档契约已从单纯 Storybook 展示下沉到本包 owner，覆盖 `Accordion / Button / Icon Button / Link / Menu / Toolbar / List / DescriptionList / Table / Breadcrumb / Pagination / Stepper / Timeline / Tooltip / Popover / Stat / Meter / Text / Kbd / Avatar / Image / Input / Search Input / Fieldset / Textarea / NumberInput / DateInput / FileInput / Card / Badge / Chip / Toast / Tabs / Dialog / Progress / Spinner / Select / Slider / Rating / Switch / Empty State / Checkbox / Radio Group / Segmented Control / Skeleton / Alert / Divider` 的用途、选择依据、组合建议、反模式、props、状态矩阵、使用规则与可访问性说明。
- 当前已补 [README.md](/E:/Github/Elysian/packages/ui-public-vue/README.md) 作为 public preset 的使用入口与文档契约说明。
- 当前已补组件文档覆盖测试与 Markdown 同步测试，确保新增或调整 public 组件时必须保留 `usage / decision / composition / antiPatterns / props / states / accessibility` 元数据，并同步生成 `docs/components/*.md`。
- 当前 `themes.ts` 已导出 `publicThemeSemanticTokenDefinitions`，作为 theme token 分组、角色说明和成对文本 token 的 owner 契约；Storybook 只能消费它展示 Theme System Spec，不维护第二份主题语义说明。
- 当前不承诺开放式主题编辑器，不承诺完整组件库替换能力。
