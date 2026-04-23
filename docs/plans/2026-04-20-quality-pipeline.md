# 2026-04-20 Quality Pipeline Plan

## 目标

补齐最小质量保障链路，让后续代码迭代不只依赖手工验证。

## 范围

- lint / format
- CI 基础工作流
- 基础构建检查
- 测试命令的标准化执行顺序

## 非目标

- 不做复杂发布流水线
- 不做覆盖率门禁或多环境矩阵
- 不做 E2E 全量体系

## 关键问题

- 代码风格工具选型
- CI 是否先只跑 install + typecheck + test
- 是否补 `build` 脚本，还是先只做可运行与类型验证

## 实施拆分

1. 选择 lint / format 工具。
2. 定义根脚本。
3. 增加最小 CI workflow。
4. 把验证命令写回 README 和 PROJECT_PROFILE。

## 影响面

- 根 `package.json`
- 未来的 CI 配置目录
- `docs/PROJECT_PROFILE.md`
- `README.md`

## 验证

- 本地可跑统一质量命令
- CI 至少能验证 install、typecheck、test

## 完成标准

- 质量链路不再是 `TBD`
- 后续 task 可以复用固定验证路径
