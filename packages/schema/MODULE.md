# MODULE: packages/schema

## 模块职责

- 定义实体 schema
- 定义模块 schema
- 定义页面、表单、表格等结构化 DSL
- 作为 generator 和 AI 的共同输入契约

## Owns

- 字段定义
- 校验约束元数据
- 页面元数据
- 权限点元数据
- 首个垂直切片 `customer` 的结构化模块定义

## Must Not Own

- 数据库访问
- UI 组件实现
- HTTP 调用
- 生成器模板渲染

## 关键依赖

- 可依赖最小的共享基础类型
- 不应依赖前端适配层或服务端运行时代码

## 不变量

- schema 必须可序列化、可校验、可供 AI 结构化输出约束使用
- schema 必须保持框架中立，不嵌入 Vue 或 React 特有实现细节

## 常见坑

- 在 schema 里混入运行时逻辑
- 把页面 schema 写成某个组件库的私有配置格式

## 文档同步触发条件

- schema 形态变化
- 引入新的 DSL 种类
- 允许的依赖范围变化
