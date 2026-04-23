# ADR-0006 First Vertical Slice Uses Customer

状态：`accepted`

日期：`2026-04-20`

## 背景

首个垂直切片必须选一个足够简单、又能体现列表、表单、状态字段和基础管理能力的实体。若继续并列保留多个候选实体，会阻塞 persistence、server 和 frontend 的并行推进。

## 决策

1. 首个垂直切片实体定为 `customer`。
2. 首版字段控制在最小集合：
   - `id`
   - `name`
   - `status`
   - `createdAt`
   - `updatedAt`
3. 该实体优先用于打通 `schema -> persistence -> server -> generator -> frontend example` 闭环，而不是承载复杂业务流程。

## 理由

- `customer` 足够通用，便于解释和扩展。
- 字段简单，适合先验证表定义、列表、表单、状态枚举和更新时间等基础能力。
- 不会过早把平台拖进复杂领域建模。

## 影响

- `packages/schema`、`packages/persistence`、`apps/server`、`packages/generator` 的第一条真实业务链路都围绕 `customer`
- 后续新增实体可以参考 `customer` 作为样板

## 暂不决策项

- `customer` 的扩展字段
- 数据权限与复杂状态流转
- 客户分层、标签、联系人等增强模型
