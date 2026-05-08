# MODULE: packages/generator

## 模块职责

- 根据 schema 生成代码
- 管理模板
- 处理可再生文件与可手改文件的边界
- 提供安全合并和再生成机制

## Owns

- 模板组织
- 输出目录约定
- 文件覆盖策略
- 生成日志与元数据
- 标准模块的文件计划与模块边界约定
- 标准 CRUD 模块的 Main / Panel / Workspace 模板骨架
- `customer` 模块的首批 server / page 模板渲染入口
- `example-vue/src/modules/*` 所消费的标准 CRUD 前端 surface 生成产物

## Must Not Own

- 业务领域推理
- 服务端运行时鉴权
- 前端运行时状态管理

## 关键依赖

- `packages/schema`
- `packages/core`

## 不变量

- 生成结果必须进入版本控制
- 生成结果必须支持二次维护
- 再生成必须可预测，不能静默破坏手工代码
- 模板输出必须和当前架构 owner 保持一致，不能把 persistence / server / frontend 边界重新搅乱
- 标准 CRUD 前端 surface 产物必须可被 `apps/example-vue` 直接提交、校验并消费，不能只停留在预览态
- 当前生成输入只收两类边界：`registered-schema` 和 `manual-schema-json`；它们可以共享同一条 preview / apply 链路，但不能混成一套隐式输入规则

## 常见坑

- 模板直接绑定某个业务实体的特殊规则
- 把 AI 输出当最终代码而不是生成输入
- 没有定义覆盖边界就直接重写文件

## 文档同步触发条件

- 模板体系变化
- 文件合并策略变化
- 生成输入或输出边界变化
