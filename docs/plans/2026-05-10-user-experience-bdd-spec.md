# 2026-05-10 用户体验打磨 BDD 规格

> 状态：计划态规格
> 范围：`apps/example-vue` 的企业后台工作区与 Generator Studio 使用路径
> 目标：从用户角度定义“好用”的验收场景，作为后续实现与 review 的输入

## 1. 边界与假设

本文件只定义用户体验行为，不声明功能已实现，不替代 `DESIGN.md`、`PAGE_DESIGN.md` 或模块 `MODULE.md`。

当前主线仍是 generator 自举闭环与企业后台日常可用性打磨。因此本 BDD 只覆盖：

- 用户进入系统、找模块、完成日常后台操作的基础路径
- Generator Studio 从“开始生成”到“审查结果、确认、应用”的路径
- 错误、权限、空状态、历史结果、回退路径等用户可感知行为

本文件不覆盖：

- 通用低代码平台、完整在线设计器、在线 SQL 工作台
- workflow 的 `transfer / delegate` 等当前未进入主线的复杂任务语义
- 第二套前端框架体验规范
- 正式 migration 自动落地机制

关键假设：

- 用户默认是国内企业后台用户，默认语言为 `zh-CN`。
- 用户不需要理解 generator 内部实现词，页面必须用业务动作表达流程。
- 竞品只作为体验参考，不复刻技术结构、视觉细节或模块边界。
- 若后续实现发现 owner 不清，必须先回到 `MODULE.md` / guardrails 判断，而不是按本文强行实现。

## 2. 对标抽象

参考对象：

- 若依：系统管理、权限、日志、代码生成等基础后台能力，重点参考“模块可找、操作路径短、代码生成与权限联动可见”的后台使用习惯。
- JEECG Boot：Online 表单与代码生成路径，重点参考“配置表单、同步数据库、生成代码、菜单/权限后续处理”的渐进式确认体验。
- Amplication：实体、角色、权限和代码生成配置，重点参考“实体结构、权限粒度、提交/生成动作可审查”的产品化表达。
- Retool：内部工具构建、数据源、组件、工作流入口，重点参考“用户从任务进入，而不是先学习系统结构”的工作台体验。

抽象后的体验原则：

1. 首屏先回答“我现在能做什么”，不要先解释系统是什么。
2. 生成类功能必须先给安全预览，再给确认、应用和证据。
3. 权限、菜单、数据范围和生成结果必须在用户操作前后可感知。
4. 错误必须能让用户知道下一步该改什么，而不是只暴露技术异常。
5. 历史结果、审计证据和回放信息必须服务当前决策，不抢首屏主任务。

参考来源：

- RuoYi 文档：https://doc.ruoyi.vip/
- JEECG Online 代码生成：https://help.jeecg.com/java/codegen/onlineGenerateOneToMany
- JEECG AI Online 表单 Skill：https://help.jeecg.com/java/ai/skills/skill-onlform
- Amplication 角色与权限：https://docs.amplication.com/day-one/roles-permissions
- Amplication 实体：https://docs.amplication.com/day-one/entities
- Retool 文档：https://docs.retool.com/

## 3. 用户画像

### 3.1 平台管理员

目标：

- 登录后台
- 管理用户、角色、菜单、部门、岗位、字典、配置、租户
- 追踪操作日志和登录异常
- 判断系统是否具备日常可用性

痛点：

- 菜单不清楚时找不到模块
- 权限错误如果只显示 403，无法知道缺什么权限
- 操作入口太多时不知道下一步点哪里

### 3.2 业务配置人员

目标：

- 新增或维护业务主数据
- 导出当前筛选结果
- 处理通知、文件和字典项

痛点：

- 查询、列表、详情、编辑互相打断
- 批量动作与当前筛选条件关系不清
- 空状态没有告诉用户下一步动作

### 3.3 生成器使用者

目标：

- 从模板或现有模块快速起稿
- 修改模块标识、模块名称和字段
- 生成预览
- 审查文件差异、SQL proposal、权限/menu 影响
- 确认后应用到 staging

痛点：

- 完整 Schema 门槛高
- 内部术语太多
- 失败后不知道该修字段、改 JSON、换冲突策略，还是找开发介入

### 3.4 审核者 / Reviewer

目标：

- 判断一次生成是否安全
- 看清文件动作、差异、冲突、权限点、菜单和 migration proposal
- 决定通过、拒绝或要求修改

痛点：

- 只有“成功/失败”没有证据
- 文件和 SQL 影响分散
- 历史结果无法回放

## 4. 全局体验规则

### Feature: 会话进入

Scenario: 未登录用户进入系统时只看到登录任务

Given 用户没有有效会话
When 用户访问后台地址
Then 页面应展示登录表单、当前会话状态和失败反馈区域
And 页面不应展示后台侧边栏、系统菜单、工作区页签或伪模块入口

Scenario: 登录失败时反馈贴近输入区

Given 用户位于登录页
When 用户输入错误账号、密码或租户信息并提交
Then 页面应在登录表单附近展示失败原因
And 主按钮应恢复可点击
And 不应跳转到后台壳层

Scenario: 会话恢复成功后直接进入可用工作区

Given 浏览器存在可恢复会话
When 用户打开后台
Then 系统应恢复身份、权限和菜单
And 用户应看到最近或默认工作区
And 首屏不应出现欢迎 hero 或研发态说明

### Feature: 后台壳层导航

Scenario: 用户能通过真实菜单找到模块

Given 用户已经登录
And 后端返回该用户可见菜单
When 用户查看左侧导航
Then 导航只展示该用户有权限访问的菜单
And 当前模块应有明确选中态
And 菜单文案应为中文业务名

Scenario: 用户切换模块时主任务立即可见

Given 用户位于任意工作区
When 用户点击另一个菜单
Then 主区应切换到目标模块的任务页面
And 首屏应优先展示查询、主列表或新建入口
And 不应先展示模块说明卡片

Scenario: 无权限模块不可被伪装成可用入口

Given 用户缺少某模块权限
When 用户查看导航或工作区动作
Then 不应展示不可用模块入口
And 如用户通过 URL 直接访问，应看到缺少权限的明确反馈
And 反馈应说明缺少访问能力，不暴露内部权限实现细节

## 5. 标准 CRUD 工作区

适用模块：

- 用户、角色、菜单、部门、岗位、字典、配置、通知、租户、客户

### Feature: 查找记录

Scenario: 用户进入列表页后第一步能直接查询

Given 用户进入标准 CRUD 工作区
When 页面加载完成
Then 首屏应展示查询入口、主列表和新增入口
And 查询控件应紧贴列表
And 页面不应在列表上方堆叠说明卡、无关统计卡或研发态标签

Scenario: 查询结果与筛选条件关系清楚

Given 用户输入关键词或选择筛选条件
When 用户点击查询
Then 列表应只展示匹配结果
And 页面应保留当前筛选条件
And 导出或批量动作应明确作用于当前筛选结果或当前选中结果

Scenario: 查询无结果时给出下一步

Given 用户已经设置筛选条件
When 查询结果为空
Then 页面应展示空状态
And 空状态应提供清除筛选或新建记录的入口
And 不应只显示“暂无数据”

### Feature: 新增记录

Scenario: 用户能从列表直接开始新增

Given 用户拥有创建权限
When 用户点击新增
Then 页面应展示创建表单
And 表单标题应使用业务对象名，例如“新增用户”
And 主动作应是保存，取消应为辅助动作

Scenario: 用户缺少创建权限时不展示新增主按钮

Given 用户缺少创建权限
When 用户进入该模块
Then 页面不应展示新增主按钮
And 如存在批量导入等创建类入口，也应被隐藏或置为不可用并解释原因

Scenario: 创建失败时字段错误可定位

Given 用户正在创建记录
When 用户提交非法字段
Then 页面应在对应字段附近展示错误
And 顶部只保留简短失败摘要
And 不应只展示原始 server error 或 validation dump

### Feature: 查看与编辑记录

Scenario: 用户点击行后看到当前对象详情

Given 列表中存在记录
When 用户点击某一行
Then 页面应展示该记录详情
And 详情只解释当前对象
And 不应重复展示列表中已经足够清楚的字段

Scenario: 用户编辑记录后回到详情

Given 用户正在查看某条记录详情
When 用户点击编辑并保存成功
Then 页面应回到该记录详情
And 列表中的该行应同步更新
And 页面应显示保存成功反馈

Scenario: 用户取消编辑时不丢失原详情上下文

Given 用户正在编辑某条记录
When 用户点击取消
Then 页面应回到该记录详情
And 未保存修改不应污染列表

### Feature: 删除与危险动作

Scenario: 删除前必须确认对象

Given 用户拥有删除权限
And 用户选中一条记录
When 用户点击删除
Then 页面应展示危险确认区
And 确认区应显示对象名称或关键字段
And 确认按钮应使用危险语义

Scenario: 删除成功后列表回到可继续操作状态

Given 用户确认删除某条记录
When 删除成功
Then 该记录应从列表移除
And 详情区应关闭或切换到下一条可用记录
And 页面应显示删除成功反馈

Scenario: 受保护记录不可删除时给出原因

Given 用户尝试删除系统保护记录
When 服务端拒绝删除
Then 页面应展示业务原因
And 不应把该错误表现为网络失败或未知异常

## 6. 树形与组织类工作区

适用模块：

- 菜单、部门

### Feature: 树形定位

Scenario: 用户先定位节点再处理子项

Given 用户进入树形管理页
When 页面加载完成
Then 页面应展示树结构和当前节点的子项列表
And 默认选中根节点或第一个可用节点
And 主区不应先展示树结构说明文字

Scenario: 用户切换树节点后列表随之变化

Given 用户已选中某个树节点
When 用户点击另一个节点
Then 子项列表应更新为该节点范围
And 新增动作应默认带入当前父节点语义

Scenario: 父子关系错误时反馈明确

Given 用户正在新增或编辑树节点
When 用户选择非法父节点
Then 页面应提示父子关系不合法
And 不应保存造成循环或孤立关系的数据

## 7. 文件管理

### Feature: 上传文件

Scenario: 用户进入文件页后能直接上传或查找

Given 用户进入文件管理页
When 页面加载完成
Then 首屏应展示搜索入口、上传入口和文件列表
And 上传入口应比文件机制说明更显眼

Scenario: 上传成功后文件进入列表

Given 用户选择一个合法文件
When 用户提交上传
Then 页面应显示上传进度或处理中状态
And 上传成功后新文件应出现在列表中
And 用户可以继续下载、查看详情或删除

Scenario: 上传失败时说明失败类型

Given 用户上传文件
When 上传因类型、大小、权限或网络失败被拒绝
Then 页面应显示对应失败原因
And 用户应知道是换文件、联系管理员还是重试

### Feature: 批量删除与导出

Scenario: 用户批量删除前知道影响范围

Given 用户选中多个文件
When 用户点击批量删除
Then 确认区应显示选中文件数量
And 删除动作只作用于选中项

Scenario: 用户导出当前筛选文件元数据

Given 用户设置了文件筛选条件
When 用户点击导出
Then 导出的结果应与当前筛选条件一致
And 页面应避免让用户误以为导出全部文件

## 8. 操作日志与会话治理

### Feature: 操作日志定位

Scenario: 用户用时间和关键词缩小日志范围

Given 用户进入操作日志页
When 页面加载完成
Then 首屏应展示时间筛选、关键词筛选和日志列表
And 不应展示装饰性统计图表

Scenario: 用户查看单条日志详情

Given 日志列表存在记录
When 用户选择某条日志
Then 页面应展示请求时间、操作者、目标、结果、IP、User-Agent 和 requestId
And 技术字段应按排查价值排序

Scenario: 登录失败日志能被业务化理解

Given 日志包含认证失败事件
When 用户查看该日志
Then 页面应展示失败类型的中文含义
And 不应只展示内部错误码

### Feature: 在线会话治理

Scenario: 用户能识别当前会话

Given 用户进入在线会话页
When 会话列表加载完成
Then 页面应标识当前会话
And 应展示设备、IP、最近活动时间和状态

Scenario: 用户下线异常会话前需要确认

Given 用户选中非当前会话
When 用户点击下线
Then 页面应展示确认区
And 确认区应说明被下线会话的用户、设备或 IP

Scenario: 用户不能误下线当前会话

Given 用户选中当前会话
When 用户查看可用操作
Then 强制下线动作应隐藏或禁用
And 页面应说明这是当前会话

## 9. Generator Studio

### Feature: 开始一次生成

Scenario: 首次进入 Generator Studio 时先看到新建生成

Given 用户进入 Generator Studio
And 还没有生成结果
When 页面加载完成
Then 首屏第一块应是“新建生成”
And 主按钮应是“生成预览”
And 页面不应要求用户先理解 session、step、workflow 或内部状态机

Scenario: 用户从公共模板开始

Given 用户位于“新建生成”
When 用户选择“从空白模板开始”
Then 页面应展示模块标识、模块名称、字段草稿、前端目标和已有文件处理方式
And `Schema JSON` 应作为高级输入可展开
And 默认不应把完整 JSON 编辑器作为唯一入口

Scenario: 用户复制现有模块结构起稿

Given 用户位于“新建生成”
When 用户选择“复制现有模块结构”
Then 页面应展示可选择的现有模块
And 选择后应把结构复制到当前草稿
And 页面应明确这不是直接重新生成原模块

Scenario: 模块候选过多时可搜索

Given 可复制的现有模块数量较多
When 用户进入复制现有模块结构模式
Then 页面应提供搜索或受控结果集
And 不应把全部模块长期铺满首屏

Scenario: 用户必须知道每个字段控制什么

Given 用户编辑生成配置
When 页面展示输入控件
Then 每个控件都应有业务化字段名
And 不应只展示一排无字段语义的模式按钮

### Feature: Schema 草稿校验

Scenario: 用户输入简化 Schema 能获得实时反馈

Given 用户展开 `Schema JSON`
When 用户输入合法简化 schema
Then 页面应显示校验通过状态
And 应说明将自动补齐的结构范围，例如 id、label、frontend metadata

Scenario: JSON 语法错误时先提示语法问题

Given 用户正在编辑 `Schema JSON`
When JSON 无法解析
Then 页面应提示 JSON 格式无效
And 不应继续展示字段级 schema 校验错误

Scenario: 字段级错误可定位

Given 用户输入可解析但不合法的 schema
When 校验失败
Then 页面应展示错误路径、错误含义和修复建议
And 常见 enum 错误应提示补 `options` 或 `dictionaryTypeCode`

Scenario: 用户保留草稿时不丢失输入

Given 用户正在编辑 schema 草稿
When 校验失败或切换查看最近结果
Then 页面不应丢失未提交草稿
And 返回新建生成时应保留输入内容

### Feature: 生成预览

Scenario: 用户点击生成预览后看到结果概览

Given 用户完成必要生成配置
When 用户点击“生成预览”
Then 页面应创建或刷新生成结果
And 下方应展示“最近结果”
And 文件级结果应展示在“生成结果”

Scenario: 生成过程中主按钮防止重复提交

Given 生成请求正在处理中
When 用户再次点击生成预览
Then 页面应阻止重复提交
And 展示处理中状态

Scenario: 生成失败时给出恢复路径

Given 用户发起生成预览
When 生成失败
Then 页面应展示失败阶段
And 给出下一步建议：修改输入、调整冲突策略、重试或人工介入
And 不应只展示堆栈或内部异常

Scenario: 重新生成不覆盖历史判断证据

Given 页面已有最近结果
When 用户修改配置并重新生成预览
Then 新结果应成为最近结果
And 旧结果应仍可从历史或会话列表中回放
And 页面应避免让用户误以为旧结果已应用

### Feature: 审查生成结果

Scenario: 用户能看清文件动作

Given 生成预览成功
When 用户查看“生成结果”
Then 每个文件应展示动作类型，例如新增、跳过、覆盖、冲突、仅预览
And 文件路径应可扫读
And 高风险动作应有明显标识

Scenario: 用户选择文件后查看差异证据

Given 生成结果包含文件
When 用户选择某个文件
Then 页面应展示该文件的差异、内容快照或冲突说明
And 高密度证据应在足够宽的详情视图中展示
And 不应把长 diff 塞进难读的窄侧栏

Scenario: 用户能区分代码结果与 SQL proposal

Given 生成结果包含 migration proposal snapshot
When 用户查看最近结果
Then 页面应单独展示 SQL proposal 或数据库变更摘要
And 明确其为 review-only
And 不应暗示正式 migration 已自动落地

Scenario: 用户能看到权限和菜单影响

Given 生成结果包含前端注册 artifact 或权限信息
When 用户查看结果概览
Then 页面应展示 route、moduleCode、permissionPrefix 和主要动作权限
And 用户应能判断菜单/权限后续处理范围

### Feature: 审核确认

Scenario: Reviewer 审核通过前能看到确认清单

Given 生成预览成功
When Reviewer 点击“审核通过”
Then 页面应展示确认清单
And 清单至少包含文件动作、冲突状态、SQL proposal、目标目录和人工确认项

Scenario: Reviewer 拒绝结果时必须留下原因

Given Reviewer 正在审查生成结果
When Reviewer 点击“拒绝”
Then 页面应要求填写拒绝原因
And 结果状态应变为已拒绝
And 后续重新生成应能参考该原因

Scenario: 审核通过后仍不等于应用

Given Reviewer 已审核通过
When 用户查看结果状态
Then 页面应显示“已审核，可应用”
And 不应显示“已完成”或“已发布”

### Feature: 应用到 staging

Scenario: 用户应用前看到目标和冲突策略

Given 生成结果已审核通过
When 用户点击“应用到 staging”
Then 页面应展示目标目录、已有文件处理方式和将要写入的文件数量
And 用户确认后才执行写入

Scenario: 应用时检测文件漂移

Given 预览生成后目标文件发生变化
When 用户执行 apply
Then 系统应阻止应用或要求重新预览
And 页面应说明哪些文件发生漂移

Scenario: 应用成功后展示证据

Given 用户确认应用到 staging
When 应用成功
Then 页面应展示 staging manifest、写入文件数量、跳过文件数量和时间
And 最近结果状态应更新为已应用

Scenario: 应用失败后保留可恢复信息

Given 用户执行 apply
When apply 失败
Then 页面应展示失败文件、失败原因和建议动作
And 已成功写入或未写入的状态应可区分

## 10. 导入导出体验

### Feature: 导出

Scenario: 用户导出当前筛选结果

Given 用户位于支持导出的列表页
And 用户设置了筛选条件
When 用户点击导出
Then 页面应提示导出范围是当前筛选结果
And 导出文件内容应与当前筛选结果一致

Scenario: 无权限用户看不到导出入口

Given 用户缺少导出权限
When 用户进入该列表页
Then 页面不应展示导出动作

### Feature: 导入边界判断

Scenario: 当前阶段不默认承诺统一导入平台

Given 用户进入支持导入规划的模块
When 页面展示导入相关入口
Then 页面只应展示已经实现的导入能力
And 未实现的导入模板、错误报告、批量治理不应作为可用功能展示

## 11. 空状态、加载与异常

### Feature: 空状态

Scenario: 初始空状态引导创建

Given 模块暂无数据
When 用户进入列表页
Then 页面应展示空状态
And 若用户有创建权限，应提供新增入口
And 若用户无创建权限，应说明当前无数据且不可创建

Scenario: 筛选空状态引导清除条件

Given 模块存在数据
And 用户设置筛选条件
When 查询结果为空
Then 页面应优先提供清除筛选入口
And 新增入口只能作为辅助动作

### Feature: 加载状态

Scenario: 列表加载不遮挡导航

Given 用户切换到某模块
When 列表正在加载
Then 导航和顶栏应保持可用
And 主区应显示紧凑加载状态

Scenario: 长任务加载展示阶段

Given 用户发起生成预览或 apply
When 操作耗时较长
Then 页面应展示当前阶段
And 用户应知道是否可以离开页面或需要等待

### Feature: 异常状态

Scenario: 网络失败可重试

Given 用户执行查询或生成动作
When 网络请求失败
Then 页面应展示重试入口
And 不应丢失用户输入

Scenario: 权限失败不建议重试

Given 用户执行无权限动作
When 服务端返回权限拒绝
Then 页面应说明权限不足
And 不应把重试作为主建议

## 12. 可访问性与键盘效率

### Feature: 键盘操作

Scenario: 搜索可以被快速聚焦

Given 用户位于后台工作区
When 用户按下 `/`
Then 当前工作区搜索框应获得焦点
And 如果焦点已在输入框中，不应劫持输入

Scenario: Escape 关闭当前详情或取消编辑

Given 用户打开详情、证据视图或编辑表单
When 用户按下 `Esc`
Then 页面应关闭当前覆盖层或取消编辑
And 不应直接退出登录或切换模块

Scenario: 表格行可通过键盘移动

Given 用户位于列表页
When 用户使用方向键移动
Then 当前选中行应变化
And 详情视图应跟随选中行更新或等待确认打开

### Feature: 可读性

Scenario: 关键状态不能只靠颜色表达

Given 页面展示成功、失败、冲突、已审核、已应用等状态
When 用户查看状态
Then 状态应同时包含文字和视觉标识

Scenario: 主要动作文案直接表达结果

Given 页面展示操作按钮
When 用户阅读按钮
Then 按钮文案应使用“生成预览”“审核通过”“应用到 staging”“导出当前筛选”等结果型表达
And 不应使用 `submit`、`next`、`confirm` 等脱离上下文的词

## 13. 验收矩阵

| 能力域 | 必须满足 | 可后续增强 | 不进入当前范围 |
| --- | --- | --- | --- |
| 登录 | 只展示登录任务，失败反馈可理解 | 多租户入口更清晰 | 新认证体系 |
| 导航 | 菜单来自真实权限，当前态清楚 | 最近访问、收藏 | 自定义门户 |
| CRUD | 查询、列表、新增、详情、编辑、删除路径短 | 键盘批量操作 | 通用页面设计器 |
| 文件 | 搜索、上传、下载、删除、导出元数据 | 预览、拖拽上传 | 对象存储治理平台 |
| 日志 | 时间/关键词定位、详情可排查 | 统计视图 | 完整 SIEM |
| 会话 | 当前会话识别、异常会话下线 | 设备画像 | 复杂风控 |
| Generator 输入 | 模板起稿、复制现有模块、简化 schema 校验 | AI 辅助字段建议 | 自由 AI 改核心设施 |
| Generator 预览 | 文件动作、diff、SQL proposal、权限影响可审查 | 更强视觉 diff | 自动正式 migration |
| Generator apply | 漂移检测、manifest 证据 | 多环境 apply | 生产发布平台 |

## 14. Definition of Ready

进入实现前，任一体验改动至少满足：

1. 明确目标用户和第一步任务。
2. 明确 canonical owner。
3. 明确是否已有组件、接口、schema、模板可复用。
4. 明确验收场景对应的 Given/When/Then。
5. 明确验证方式，例如组件测试、workspace composable 测试、server 合约测试、E2E smoke 或人工浏览器 smoke。
6. 若涉及视觉或文案，已对照 `packages/ui-enterprise-vue/DESIGN.md`、`apps/example-vue/DESIGN.md` 和 `apps/example-vue/PAGE_DESIGN.md`。

## 15. Definition of Done

完成体验改动后，至少输出：

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```

并检查：

- 页面是否减少了用户完成第一步的阻力。
- 是否删除了研发态术语、重复状态和无关说明。
- 是否没有新增错误 owner 或 shared utils 桶。
- 是否没有把规划态能力写成已实现事实。
- 是否保留了失败、拒绝、漂移、无权限等非理想路径。

