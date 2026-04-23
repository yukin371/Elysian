# MODULE: packages/persistence

## 模块职责

- 持有数据库访问 canonical owner
- 持有 Drizzle schema、client、迁移配置
- 为 `apps/server` 提供数据库连接与持久化基线

## Owns

- 数据库连接配置
- Drizzle client 初始化
- 迁移目录与配置
- 关系型 schema 定义
- `customer` 表查询 helper 与插入 helper

## Must Not Own

- HTTP 路由
- 前端调用逻辑
- 页面 schema / 表单 DSL
- 业务模块的 HTTP 鉴权规则

## 关键依赖

- `packages/core`
- `drizzle-orm`
- `drizzle-kit`
- `Bun SQL`

## 不变量

- 生产数据库默认以 `PostgreSQL` 为基线
- 迁移产物必须进入版本控制
- 关系型 schema 不得散落到各个 server 模块中各自维护
- Drizzle 查询细节优先收敛在 persistence owner 内，而不是向 server 外泄

## 常见坑

- 在 `apps/server` 中直接 new 数据库 client，绕开 canonical owner
- 同时维护业务 schema 和关系表 schema 的两套真实来源
- 用开发期快捷方式替代正式迁移链路

## 文档同步触发条件

- 持久化 owner 变化
- 数据库类型变化
- ORM / migration 工具变化
- 关系型 schema 组织方式变化
