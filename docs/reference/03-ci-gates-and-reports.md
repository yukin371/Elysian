# CI 门禁与报告（模板）

## 门禁链路

- 待补

## 报告文件

| 文件 | 说明 | 生产步骤 |
|---|---|---|
| `e2e-smoke-report*.json` | 冒烟结果 | smoke |
| `e2e-smoke-reports-index.json` | 汇总索引 | reports:index |
| `e2e-smoke-reports-gate.json` | 门禁结论 | reports:gate |

## 阶段收尾链路

- `collect -> evidence -> decision -> phase-gate -> finalize`

## 常见失败定位

- 待补
