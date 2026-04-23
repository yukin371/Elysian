# 2026-04-20 First Vertical Slice Plan

## 目标

实现首个可贯通 `schema -> server -> generator -> frontend example` 的标准业务模块切片。

## 当前结论

- 首个实体：`customer`
- 前端承载：`apps/example-vue`
- 目标是先打通最小 CRUD，而不是引入复杂业务语义

## 范围

- 选择一个简单业务实体
- 定义实体 schema
- 生成或手写最小 server 模块
- 生成器输出最小文件计划
- 前端示例承载列表 / 表单的最小闭环

## 非目标

- 不做复杂业务流程
- 不做多角色细粒度数据权限
- 不做 AI 自由生成整模块

## 当前实体范围

- `id`
- `name`
- `status`
- `createdAt`
- `updatedAt`

## 依赖前置

- server foundation 完成
- persistence 方案明确
- 首个前端示例方向明确

## 实施拆分

1. 在 schema、persistence、server 中统一 `customer` 模型。
2. 在 `packages/schema` 定义模块 schema。
3. 在 server 建立模块注册与最小 CRUD 入口。
4. 在 generator 输出模块文件计划与最小模板。
5. 在前端示例实现列表 / 新建 / 编辑的最小路径。
6. 补模块级测试。

## 影响面

- `packages/schema`
- `packages/generator`
- `apps/server`
- 未来的 `apps/example-*`

## 验证

- 新增一个示例实体后，能从 API 到 UI 跑通
- schema 变化能影响 generator 输出
- 最小 CRUD 路径可被测试覆盖

## 完成标准

- 仓库第一次出现真正的业务垂直切片
- 后续新增模块的实现方式有了样板
