# 2026-04-20 Repo Bootstrap Plan

## 目标

按 `AI_REPO_BOOTSTRAP_PLAYBOOK.md` 为仓库建立最小治理骨架，并为后续工程骨架搭建准备边界与知识入口。

## 范围

- `docs/PROJECT_PROFILE.md`
- `AGENTS.md`
- `docs/roadmap.md`
- `docs/ARCHITECTURE_GUARDRAILS.md`
- 关键模块 `MODULE.md`
- `docs/decisions/ADR-0001-initial-platform-shape.md`

## 非目标

- 不创建可运行代码骨架
- 不拍板 ORM、数据库、CI、测试框架
- 不引入新依赖

## 验证

- 检查必需文档是否全部落地
- 检查内容是否区分已知事实与 TBD
- 检查关键模块是否已有 owner 边界

## 收敛去向

- 初始平台边界收敛到 ADR
- 当前工作面收敛到 `docs/roadmap.md`
