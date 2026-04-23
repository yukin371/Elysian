# AI 快速开发（模板）

## 适用场景

- 使用 Claude Code / Codex 进行“需求明确”的快速开发。

## 输入模板

```text
业务目标：
范围边界：
验收标准：
限制条件：
```

## 标准流程

1. 读取项目边界文档（PROJECT_PROFILE / roadmap / guardrails）。
2. 生成或修改代码（优先复用，禁止重复 owner）。
3. 运行验证命令（至少 `bun run check`）。
4. 同步必要文档（roadmap / profile / plans）。
5. 输出结果摘要（已完成、未验证、残留风险）。

## 最小命令集

```bash
bun run check
```

## 交付清单

- [ ] 代码变更完成
- [ ] 验证通过
- [ ] 文档同步
- [ ] 风险说明
