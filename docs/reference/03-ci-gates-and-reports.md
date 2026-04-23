# CI 门禁与报告

## 门禁链路

- `validate -> e2e-smoke -> smoke reports gate`
- `validate -> e2e-generator-(matrix|cli|safe-apply) -> reports:index -> reports:gate`
- `validate -> p5a-handoff-corpus -> p5a-acceptance -> p5a-acceptance:gate`

## 报告文件

| 文件 | 说明 | 生产步骤 |
|---|---|---|
| `e2e-smoke-report*.json` | 冒烟结果 | `e2e:smoke` |
| `e2e-smoke-reports-index.json` | smoke attempt 汇总索引 | `e2e:smoke:reports:index` |
| `e2e-smoke-reports-gate.json` | smoke 门禁结论 | `e2e:smoke:reports:gate` |
| `e2e-generator-*.json` | generator matrix / cli 报告 | `e2e:generator:*` |
| `e2e-generator-reports-index.json` | generator 汇总索引 | `e2e:generator:reports:index` |
| `e2e-generator-reports-gate.json` | generator 门禁结论 | `e2e:generator:reports:gate` |
| `p5a-handoff-corpus-report.json` | P5A 语料分类回归结果 | `p5a:handoff:corpus` |
| `p5a-acceptance-report.json` | P5A acceptance 执行结果 | `p5a:acceptance` |
| `p5a-acceptance-gate.json` | P5A acceptance 门禁结论 | `p5a:acceptance:gate` |

## 阶段收尾链路

- smoke：`collect -> evidence -> decision -> phase-gate -> finalize`
- P5A：`acceptance -> acceptance-gate -> acceptance-finalize`

## 常见失败定位

- `validate` 失败：先本地执行 `bun run check` 与 `bun run build:vue`
- smoke gate 失败：先看 `e2e-smoke-reports-index.json` 与 attempt 级 diagnosis
- generator gate 失败：先看 `e2e-generator-reports-index.json`，按 `source=matrix|cli` 回到对应入口
- P5A corpus 失败：先看 `p5a-handoff-corpus-summary.md`，确认 `retry_ai_generation` / `manual_fix_required` 分界是否漂移
- P5A acceptance gate 失败：先看 `p5a-acceptance-report.json` 与对应 replay summary，再核对 gate policy 是否被手工覆盖
