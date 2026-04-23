# ADR-0004 Persistence Route

状态：`accepted`

日期：`2026-04-20`

## 背景

server foundation 已经完成，下一阶段需要为首个真实业务模块建立持久化底座。此前 `persistence` owner、数据库类型和访问层方案都还是 `TBD`，这会阻塞模块实现、迁移策略和 generator 的后续落地。

## 决策

1. `persistence` 的 canonical owner 设为 `packages/persistence`。
2. 首版生产数据库基线设为 `PostgreSQL`。
3. 持久化访问层采用 `Drizzle ORM`。
4. 运行时驱动采用 `Bun SQL`。
5. 迁移采用 `drizzle-kit` 生成并提交到版本控制的 SQL migrations。

## 理由

- `PostgreSQL` 适合作为企业级业务系统的默认关系型数据库基线。
- `Drizzle ORM` 更贴近 TypeScript-first 和 schema-first 工作方式，适合后续 generator 参与。
- `Bun SQL` 与当前 `Bun + Elysia` 基线天然匹配，运行时链路更轻。
- 把持久化放进独立 `packages/persistence`，可以避免数据库连接、schema、迁移逻辑重新散落到 `apps/server` 各处。

## 不选其他路线的原因

- 不选择 `apps/server` 直接持有 persistence：
  数据库 client、schema、迁移配置是跨模块共享能力，应有独立 canonical owner。
- 不优先选择纯 query builder 路线：
  虽然更轻，但在 schema 声明、迁移和后续平台化生成上约束不够强。
- 不优先选择更重的 ORM/client 生成路线：
  会引入额外运行时与生成负担，不符合当前仓库的轻量基线。

## 影响

- `ARCHITECTURE_GUARDRAILS` 中 `persistence` 不再是 `TBD`
- `packages/persistence` 成为 server 唯一的数据库访问入口
- 关系型 schema、database client、迁移配置与生成物都进入 `packages/persistence`
- 后续需要补 `DATABASE_URL`、迁移目录和首个业务实体表定义

## 暂不决策项

- 本地开发数据库交付方式
- 测试数据库策略
- repository/service 的最终拆分粒度
- 是否需要读写分离或多数据源

## 官方资料

- Drizzle ORM + Bun SQL: https://orm.drizzle.team/docs/connect-bun-sql
- Bun SQL: https://bun.sh/docs/runtime/sql
- Prisma with Bun: https://www.prisma.io/docs/guides/bun
- Kysely docs: https://kysely.dev/docs/intro
