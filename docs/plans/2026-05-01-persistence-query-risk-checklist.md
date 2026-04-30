# 2026-05-01 Persistence 查询风险清单

## 目标

- 回答“当前项目用 ORM 还是 SQL，是否会有性能问题”这个问题在仓库内的真实落点。
- 只输出本轮文档版风险清单，不改实现。
- 给下轮 persistence 查询治理提供明确入口，并挂到 `roadmap` 避免遗忘。

## 当前技术结论

当前仓库不是 `sqlx` 路线，也不是“纯 ORM”路线。

当前真实栈是：

- `PostgreSQL`
- `Drizzle ORM`
- `Bun SQL`
- `drizzle-kit`

证据：

- [docs/PROJECT_PROFILE.md](/E:/Github/Elysian/docs/PROJECT_PROFILE.md:53)
- [packages/persistence/MODULE.md](/E:/Github/Elysian/packages/persistence/MODULE.md:1)
- [packages/persistence/src/client.ts](/E:/Github/Elysian/packages/persistence/src/client.ts:1)

当前仓库的约定也已经比较明确：

1. 简单 CRUD、单表查询、常规 join：优先用 Drizzle 链式 API
2. 聚合、窗口函数、递归 CTE：允许直接用 `sql` 模板
3. 复杂跨模块查询：优先下沉到 persistence owner 内部

证据：

- [docs/plans/2026-04-30-backend-query-pain-points.md](/E:/Github/Elysian/docs/plans/2026-04-30-backend-query-pain-points.md:187)

因此，当前风险判断不应落在“用了 ORM 所以会慢”，而应落在：

- 某些查询实现是否已经暴露出全表扫描、双查询、JS 内存组装、模糊查询无索引友好等问题

## 风险分级口径

- `高`：已有明确代码证据，且文档中已经确认是痛点，随数据增长很容易出问题
- `中`：实现方式存在明显扩展风险，但当前还缺真实数据量或 profile 证据
- `低`：当前实现大体可接受，更多是后续关注点，不构成最近一轮的优先治理对象

## 高风险清单

### H1. 部门后代查询在应用层做全表拉取与内存过滤

文件：

- [packages/persistence/src/data-scope.ts](/E:/Github/Elysian/packages/persistence/src/data-scope.ts:124)

现状：

- 先把 `departments` 全表查出
- 再在 JS 中拆分 `ancestors`
- 再做 `includes` 匹配

风险原因：

1. 数据量增长后会退化成稳定的全表扫描
2. 结果过滤发生在 Node 进程内，不在数据库执行
3. 每次数据权限判定都会重复这条路径

风险等级依据：

- 已在 [2026-04-30-backend-query-pain-points.md](/E:/Github/Elysian/docs/plans/2026-04-30-backend-query-pain-points.md:7) 被明确列为痛点 1

建议顺序：

- 当前应视为 persistence 查询层第一优先级

建议方向：

1. 短期：递归 CTE 或 SQL 函数
2. 中长期：`ltree` 路径列 + 索引

### H2. 用户数据范围查询使用“两次查库 + JS Map 组装”

文件：

- [packages/persistence/src/auth.ts](/E:/Github/Elysian/packages/persistence/src/auth.ts:138)

现状：

- 先查 `userRoles + roles`
- 再查 `roleDepts`
- 最后用 `Map<string, string[]>` 组装 `customDeptIds`

风险原因：

1. 一次业务读取要走两次数据库往返
2. 组装逻辑在 JS 侧完成，不利于数据库一次完成 join / aggregate
3. 当角色和部门关联增多时，往返和内存组装成本同步上涨

风险等级依据：

- 已在 [2026-04-30-backend-query-pain-points.md](/E:/Github/Elysian/docs/plans/2026-04-30-backend-query-pain-points.md:57) 被明确列为痛点 2

建议顺序：

- 紧随 `H1`

建议方向：

- 合并为单条查询，使用子查询或聚合表达 `customDeptIds`

## 中风险清单

### M1. 多个列表 repository 重复实现分页归一化与 count/data 双查询

文件代表：

- [packages/persistence/src/customer.ts](/E:/Github/Elysian/packages/persistence/src/customer.ts:31)
- [packages/persistence/src/dictionary.ts](/E:/Github/Elysian/packages/persistence/src/dictionary.ts:134)
- [packages/persistence/src/notification.ts](/E:/Github/Elysian/packages/persistence/src/notification.ts:1)
- [packages/persistence/src/file.ts](/E:/Github/Elysian/packages/persistence/src/file.ts:1)

现状：

- 每个 repository 各自维护分页归一化
- 许多列表查询先 `count(*)`，再查数据
- 查询条件构造模式相似，但没有统一抽象

风险原因：

1. 这类实现本身不是错，但会放大维护成本和行为漂移
2. 后续一旦要做更复杂过滤、排序或 tenant/data-scope 叠加，重复逻辑会继续膨胀
3. 某些场景会形成稳定的“双查询”成本

风险等级依据：

- 已在 [2026-04-30-backend-query-pain-points.md](/E:/Github/Elysian/docs/plans/2026-04-30-backend-query-pain-points.md:98) 被明确列为痛点 3

建议顺序：

- 在 `H1/H2` 后进入

建议方向：

1. 先抽 `normalizePagination` / `buildPaginatedResult`
2. 再逐步统一列表 query helper

### M2. 多处 `ilike '%...%'` 模糊查询在数据量增大后可能失去索引友好性

文件代表：

- [packages/persistence/src/customer.ts](/E:/Github/Elysian/packages/persistence/src/customer.ts:196)
- [packages/persistence/src/file.ts](/E:/Github/Elysian/packages/persistence/src/file.ts:31)
- [packages/persistence/src/notification.ts](/E:/Github/Elysian/packages/persistence/src/notification.ts:38)

现状：

- 当前列表搜索大量使用 `%query%` 形式的 `ilike`

风险原因：

1. 前后通配的 `ilike` 在 PostgreSQL 下通常不走普通 B-Tree 索引
2. 数据量小时问题不大，数据量大后容易退化成顺序扫描
3. 文件名、通知内容、customer 名称这类字段都属于用户高频查询入口

当前判断：

- 这是典型的“现在能用，但以后会慢”的点
- 当前没有证据表明已经成为瓶颈，所以先列为中风险，不上升到高风险

建议顺序：

- 在通用分页收敛之后评估

建议方向：

1. 先测真实查询模式
2. 若需要，再评估 trigram / gin / 前缀搜索改写

### M3. 审计日志过滤含 JSON 字段条件，后续容易成为后台高频重列表热点

文件：

- [packages/persistence/src/audit-log.ts](/E:/Github/Elysian/packages/persistence/src/audit-log.ts:86)

现状：

- `details ->> 'reason'` 直接参与过滤
- 默认排序按 `createdAt desc, id desc`

风险原因：

1. 审计日志天然是持续增长表
2. 后台日志列表往往是长期高频页面
3. JSON 提取条件如果没有配套索引，会在规模上升后放大查询代价

当前判断：

- 当前实现功能上合理
- 但从表增长模型看，应提前列入观察名单

建议顺序：

- 放在列表统一治理和日志使用量观察之后

建议方向：

1. 先确认最常用筛选字段
2. 再决定是否做表达式索引或字段显式化

## 低风险清单

### L1. workflow 版本号查询使用 `max(version) + 1`

文件：

- [packages/persistence/src/workflow.ts](/E:/Github/Elysian/packages/persistence/src/workflow.ts:110)

现状：

- 使用 `sql<number>\`coalesce(max(version), 0) + 1\``

判断：

- 这是 ORM 表达力边界，不是立即的性能问题
- 当前 workflow definition 的数据规模远小于 customer / audit / notification 这类列表表

风险点：

- 更偏向并发一致性和表达力边界，而不是近期性能瓶颈

建议顺序：

- 当前不作为首批治理项

### L2. 常规单表 CRUD / 小表字典与设置读取

文件代表：

- [packages/persistence/src/post.ts](/E:/Github/Elysian/packages/persistence/src/post.ts:1)
- [packages/persistence/src/setting.ts](/E:/Github/Elysian/packages/persistence/src/setting.ts:1)
- [packages/persistence/src/tenant.ts](/E:/Github/Elysian/packages/persistence/src/tenant.ts:1)

判断：

- 当前大多是简单 select / getById / orderBy
- 没有看到明显的“错误实现方式导致性能先出问题”的证据

说明：

- 这些文件不代表永远没风险
- 只是按当前仓库状态，不应抢在前述高/中风险项之前治理

## 推荐执行顺序

### 第一批

1. `data-scope.ts` 的部门后代查询
2. `auth.ts` 的 data scope 双查询

### 第二批

1. 统一分页与列表 query helper
2. 复查 `customer / notification / file / dictionary` 这几类列表查询

### 第三批

1. 审计日志 JSON 过滤与索引策略
2. 模糊搜索的索引策略或搜索策略调整

## 一句话结论

当前项目的风险不是“用了 ORM 所以会慢”，而是：

- 少数查询已经明确存在不适合增长的数据访问方式
- 另一些列表查询虽然现在可用，但未来扩容时很可能先出问题

按当前证据，最该优先处理的是：

1. `packages/persistence/src/data-scope.ts`
2. `packages/persistence/src/auth.ts`

而不是先全面推翻 ORM 路线。

## 下次继续入口

若下轮要开始处理本清单，建议先读：

1. [docs/plans/2026-04-30-backend-query-pain-points.md](/E:/Github/Elysian/docs/plans/2026-04-30-backend-query-pain-points.md:1)
2. [docs/plans/2026-05-01-persistence-query-risk-checklist.md](/E:/Github/Elysian/docs/plans/2026-05-01-persistence-query-risk-checklist.md:1)
3. [packages/persistence/MODULE.md](/E:/Github/Elysian/packages/persistence/MODULE.md:1)
