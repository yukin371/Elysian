# MODULE: packages/core

## 模块职责

- 提供平台级共享基础能力
- 承载无业务语义的常量、类型和轻量工具
- 作为其他 packages 的最小共享依赖

## Owns

- 平台级 manifest
- 基础类型
- 文件与路径工具的未来 canonical owner

## Must Not Own

- 业务 schema
- 运行时数据库访问
- UI 组件实现
- 生成器模板逻辑

## 关键依赖

- 应尽量保持零依赖或极少依赖

## 不变量

- 进入 `packages/core` 的能力必须是跨模块稳定共享的
- 不得把“暂时没地方放”的代码塞进 core

## 常见坑

- 让 core 变成无边界的杂物间
- 在 core 中偷偷持有业务或框架绑定语义

## 文档同步触发条件

- 新增或调整 core owner
- 把某个跨切关注点正式收敛到 core
