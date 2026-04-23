# 2026-04-20 Persistence Decision Plan

## 目标

确定首版持久化方案、数据库访问 owner 和最小数据建模路径，为第一个业务模块落地扫清阻塞。

## 当前结论

- persistence owner：`packages/persistence`
- 数据库：`PostgreSQL`
- 访问层：`Drizzle ORM`
- 运行时驱动：`Bun SQL`
- 迁移：`drizzle-kit`

## 范围

- 明确 persistence owner
- 选择首版数据库类型
- 选择 ORM / query builder / 直接 SQL 路线
- 定义迁移、种子、测试数据的最小流程

## 非目标

- 不实现完整业务表
- 不引入多数据库兼容层
- 不做分库分表或复杂读写分离

## 当前实施重点

- 建立 `packages/persistence`
- 固定 `DATABASE_URL` 约束
- 建立迁移目录与首个 schema 入口
- 为首个业务实体准备表定义落点

## 评估维度

- 与 `Elysia` 和 `Bun` 的兼容度
- 类型安全与迁移体验
- 对 generator 的友好度
- 测试与本地开发成本
- 企业项目可维护性

## 实施拆分

1. 落最小持久化接入骨架。
2. 形成 ADR。
3. 确定首个真实表定义。
4. 让 `apps/server` 通过 `packages/persistence` 接入数据库。

## 影响面

- `apps/server`
- `packages/schema`
- 未来的 persistence 模块
- `docs/ARCHITECTURE_GUARDRAILS.md`
- `docs/PROJECT_PROFILE.md`

## 验证

- 已形成 ADR
- 路线能支持首个 CRUD 模块
- 方案不会逼迫前端或 generator 直接依赖数据库细节

## 完成标准

- persistence owner 不再是 `TBD`
- 首版数据库与访问策略不再是 `TBD`
- 能开始实现首个业务实体的数据链路
