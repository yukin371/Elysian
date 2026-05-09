# 2026-05-09 setting 边界与命名澄清草案

## 背景

当前仓库中的 `setting` 模块已经具备最小 CRUD 闭环，但“系统配置”这个中文命名容易让使用者误解为：

- 它是 server runtime 配置 owner
- 它是完整的系统设置中心
- 新建一条记录后系统会自动识别并生效

这些理解都超出了当前实现边界。

## 当前结论

当前 `setting` 的准确定位是：

`租户可覆盖的配置项仓库 / 配置项管理面`

它负责：

- 配置项列表、详情、创建、更新
- `key/value` 的最小非空与唯一性校验
- `tenant -> default tenant` 的仓库层回退读取辅助能力

它不负责：

- `apps/server/config` 的运行时配置
- 配置缓存、热更新、分布式配置中心
- 配置消费方注册与自动生效
- 完整的系统设置中心

## 三层边界

### 1. Runtime Config

owner: `apps/server/config`

示例：

- `DATABASE_URL`
- `ACCESS_TOKEN_SECRET`
- CORS / rate limit / deploy-time environment variables

特点：

- 影响服务启动和基础设施行为
- 通常依赖部署环境注入
- 不通过后台 `setting` CRUD 管理

### 2. Setting 配置项仓库

owner: `apps/server/src/modules/setting` + `packages/persistence/src/setting.ts`

示例：

- 品牌名
- 支持邮箱
- 默认时区
- 简单阈值
- 帮助链接
- 可文本化的轻量策略码

特点：

- 后台可 CRUD
- 本质上是 `tenant_id + key` 的配置项存储
- 是否生效，取决于具体业务模块是否显式读取该 key

### 3. System Settings Center

当前未实现。

若未来需要建设，应额外具备：

- 配置分组与稳定信息架构
- 固定 schema 与类型校验
- 默认值与作用域语义
- 消费方注册机制
- 生效时机说明
- 敏感值处理
- 审批、审计、回滚或热更新策略

## 命名建议

为避免误解，当前阶段建议统一采用以下命名：

- 中文页面名：`配置项管理`
- 中文对象名：`配置项`
- 英文页面名：`Config Entries`
- 英文对象名：`Config Entry`

保留不变的内部标识：

- 模块 code：`setting`
- 路由：`/system/settings`
- 权限前缀：`system:setting:*`
- 持久化表：`system_settings`

原因：

- 这些内部标识已进入接口、测试和 seed 契约
- 当前问题是“产品语义误解”，不是“canonical owner 迁移”

## 当前适合放入 setting 的内容

- 平台品牌信息
- 联系方式
- 默认语言 / 默认时区
- 轻量级开关
- 纯文本 URL
- 简单阈值与默认策略码

## 当前不应放入 setting 的内容

- 鉴权模型
- 支付配置编排
- 文件存储供应商切换
- 复杂通知模板设计
- 需要加密、审批、热更新的敏感配置
- 强结构业务规则

## 本轮落地范围

- 调整前端用户可见命名
- 调整 seed 中的菜单与权限显示名
- 调整活跃文档中的当前表述
- 明确 `setting != runtime config != system settings center`

## 本轮不做

- 不改路由、权限码、表名、模块名
- 不新增配置消费注册中心
- 不承诺“新建配置项自动生效”
- 不把未来系统设置中心写成已实现事实
