# Contributing

`Elysian` 采用轻量但明确的分支流转，目标是让 `main` 始终保持可发布，`dev` 作为日常集成分支。

## 分支模型

- `main`
  生产候选分支，只接受已经完成验证的合并。
- `dev`
  日常开发集成分支，功能分支优先合并到这里。
- `feature/<topic>`
  常规功能分支，例如 `feature/auth-foundation`
- `fix/<topic>`
  缺陷修复分支，例如 `fix/customer-update`
- `docs/<topic>`
  文档或治理类改动，例如 `docs/workflow`

## 推荐流程

1. 从 `dev` 切出功能分支
2. 在功能分支完成实现和文档同步
3. 本地执行验证
4. 发起到 `dev` 的 Pull Request
5. 阶段性稳定后，再从 `dev` 合并到 `main`

详细发布节奏见 [docs/07-release-workflow.md](./docs/07-release-workflow.md)。

## 本地开发准备

首次 clone 后，建议执行：

```bash
bun install
```

`bun install` 会自动执行 `prepare`，由 `husky` 安装仓库 hooks。若本地 hooks 配置被其他工具覆盖，可手动补一次：

```bash
bun run hooks:install
```

开始实现前，先阅读：

- [docs/PROJECT_PROFILE.md](./docs/PROJECT_PROFILE.md)
- [docs/roadmap.md](./docs/roadmap.md)
- [docs/ARCHITECTURE_GUARDRAILS.md](./docs/ARCHITECTURE_GUARDRAILS.md)
- [docs/DEVELOPMENT_PRINCIPLES.md](./docs/DEVELOPMENT_PRINCIPLES.md)

默认按以下顺序做技术决策：

1. 先边界，后实现
2. 先验证，后扩展
3. 先复用，后新增
4. 先契约，后技巧

不要为了追求 `Clean Code` / `SOLID` 主动扩大重构范围，或提前引入当前阶段不需要的抽象层。

## 审查时机

默认在以下时点发生 review：

1. 开发前自审：确认边界、owner、复用路径、验证方式
2. 新增抽象前复审：确认不是为了风格而过早抽象
3. 提交前自审：确认验证、文档同步、风险和回滚路径
4. PR review：由 reviewer 正式检查 `Summary / Validation / Risk`

不要把 review 仅理解为“PR 发出后的代码审查”。

## 提交规范

提交信息遵循 Conventional Commits：

- `feat(scope): ...`
- `fix(scope): ...`
- `docs(scope): ...`
- `refactor(scope): ...`
- `ci(scope): ...`

示例：

```text
feat(auth): 增加登录接口骨架
refactor(generator): 收敛模板输出命名
docs(workflow): 补充分支流转说明
```

## 合并前最低要求

- `bun run check`
- `bun run build:vue`
- 变更前已确认 owner、边界、验证方式
- 变更影响文档时同步 `README.md`、`docs/roadmap.md`、`docs/PROJECT_PROFILE.md` 或对应计划文档

## Pull Request 规则

- PR 标题必须遵循 Conventional Commits，例如 `feat(auth): 收敛 refresh session 轮换`
- PR 描述必须使用仓库模板，并填写 `Summary / Validation / Risk` 三个区块
- `Summary` 必须填完“变更目标 / 关键改动 / 边界说明”
- `Risk` 必须填完“风险点 / 回滚方式”
- PR 标题与正文都不得携带 `Co-Authored-By`、`Generated with ...`、`For Claude` 一类协作者标识
- 涉及架构边界、owner 变化或长期规则时，补 ADR 或计划文档
- 若存在抽象提取、新增 shared helper、跨层重构，PR 描述中应明确说明“为什么不能复用现有实现”
- PR 发起前应已完成“开发前自审 / 新增抽象前复审 / 提交前自审”中的适用项

## GitHub 分支保护

当前仓库已在 GitHub 启用以下保护规则：

- `main`
  只能通过 Pull Request 合并，且必须通过 `validate` 检查并解决 review conversation
- `dev`
  也要求通过 `validate` 检查，但不强制要求 review，便于日常集成推进
- `main` 与 `dev`
  均禁止 force push 与直接删除分支

## 发布说明

- `dev -> main` 合并前，执行 [docs/release-checklist.md](./docs/release-checklist.md)
- 当前阶段采用“持续集成到 `dev`，节点发布到 `main`”的轻量节奏
- 若是线上紧急问题，允许从 `main` 走 hotfix，再回合并到 `dev`
