# AGENTS

本仓库优先建立稳定的工程边界，再推进代码实现。

## 修改前必读顺序

1. [docs/PROJECT_PROFILE.md](/E:/Github/Elysian/docs/PROJECT_PROFILE.md)
2. [docs/roadmap.md](/E:/Github/Elysian/docs/roadmap.md)
3. [docs/ARCHITECTURE_GUARDRAILS.md](/E:/Github/Elysian/docs/ARCHITECTURE_GUARDRAILS.md)
4. [docs/DEVELOPMENT_PRINCIPLES.md](/E:/Github/Elysian/docs/DEVELOPMENT_PRINCIPLES.md)
5. 若任务涉及前端视觉与交互，先读 [packages/ui-enterprise-vue/DESIGN.md](/E:/Github/Elysian/packages/ui-enterprise-vue/DESIGN.md)
   若任务涉及 `apps/example-vue` 的展示层，再读 [apps/example-vue/DESIGN.md](/E:/Github/Elysian/apps/example-vue/DESIGN.md)
6. 目标目录下的 `MODULE.md`
7. 若当前任务已有计划文档，再读对应 `docs/plans/*.md`
8. 若当前任务触及长期边界决策，再读相关 `docs/decisions/ADR-*.md`

## 强制规则

### 开发原则优先级

默认按以下顺序做技术决策，不得把 `Clean Code` 或 `SOLID` 放在这些规则之前：

1. 先边界，后实现
2. 先验证，后扩展
3. 先复用，后新增
4. 先契约，后技巧

简化为一句话：

`先边界，后抽象；先验证，后扩展；先复用，后新增；先契约，后技巧。`

### AI 开发与审查约束

AI 实施或 review 时，必须先判断：

1. 改动是否符合当前阶段边界
2. 改动是否落在正确 canonical owner
3. 是否已有现有实现可复用
4. 是否有更简单、更少抽象的做法
5. 是否已有明确验证方式

最后才判断代码是否足够“优雅”。

AI 不得因为追求 `Clean Code` / `SOLID` 而做以下行为：

- 主动扩大重构范围
- 提前新增当前阶段不需要的接口、基类、适配器、shared utils
- 为了消除局部重复而模糊 owner
- 为了“函数更短”切碎连续业务语义
- 为了“解耦”引入难以验证的间接层
- 把规划态能力写成已实现事实

若 `Clean Code` / `SOLID` 与边界稳定性冲突，优先边界稳定性。

### 审查时机要求

以下审查时机默认强制执行：

1. 开发前先做一次边界自审
2. 准备新增抽象、shared helper、adapter 或跨层重构前再审一次
3. 提交结果前做一次验证与文档同步自审
4. PR 阶段做正式 review

不要把这类审查推迟到“代码写完以后再看”。

### 先复用后新增

新增任何 shared helper / utility / service / adapter 前，必须先搜索现有实现，并回答：

1. 搜索了哪些现有实现
2. 为什么不能复用
3. 新能力的 canonical owner 是谁
4. 是否会形成重复 owner
5. 哪些文档必须同步
6. 是否需要 ADR

答不清就不要新增。

### 大改前必须输出边界摘要

实施前先输出：

```text
目标模块：
现有 owner：
影响面：
计划改动：
验证方式：
需要同步的文档：
```

若为高风险改动，再补：

```text
架构风险：
重复实现风险：
回滚路径：
```

### 完成后必须输出结果摘要

完成后输出：

```text
已完成改动：
验证结果：
未验证区域：
同步文档：
残留风险：
```

### 文档同步规则

- 技术栈、构建、测试、部署、拓扑变化时，同步 `docs/PROJECT_PROFILE.md`
- 当前版本目标、active tracks、下一步变化时，同步 `docs/roadmap.md`
- owner、依赖方向、跨切关注点变化时，同步 `docs/ARCHITECTURE_GUARDRAILS.md`
- 模块职责、依赖规则、不变量变化时，同步对应 `MODULE.md`
- 长期有效决策进入 `docs/decisions/ADR-*.md`
- 临时实施设计进入 `docs/plans/*.md`

## 必须停下并询问的情况

- 无法确认 canonical owner
- 需要改动多个层次且存在职责重叠风险
- 发现现有实现与文档冲突，且无法从代码或配置判断哪边为准
- 需要引入重型基础设施但仓库还没有相应验证和运维约束
- 发现会覆盖或推翻用户已明确的架构方向

## 当前仓库约束

- 当前仓库仍处于初始化阶段，不得把规划当作已实现事实写入项目画像。
- 在工作区、ORM、鉴权模型、测试链路未定前，不应新增大量基础设施代码。
- 优先补可持续治理骨架，再补实际工程骨架。
