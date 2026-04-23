# AGENTS

本仓库优先建立稳定的工程边界，再推进代码实现。

## 修改前必读顺序

1. [docs/PROJECT_PROFILE.md](/E:/Github/Elysian/docs/PROJECT_PROFILE.md)
2. [docs/roadmap.md](/E:/Github/Elysian/docs/roadmap.md)
3. [docs/ARCHITECTURE_GUARDRAILS.md](/E:/Github/Elysian/docs/ARCHITECTURE_GUARDRAILS.md)
4. 目标目录下的 `MODULE.md`
5. 若当前任务已有计划文档，再读对应 `docs/plans/*.md`
6. 若当前任务触及长期边界决策，再读相关 `docs/decisions/ADR-*.md`

## 强制规则

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
