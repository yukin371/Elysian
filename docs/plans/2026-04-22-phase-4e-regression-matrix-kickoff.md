# 2026-04-22 Phase 4E Regression Matrix Kickoff

## 背景

- `P4D` 已完成安全写入基线（冲突预检、受管覆盖、原子写入）。
- 当前仍缺少可重复执行的“生成一致性回归矩阵”验证入口。

## 目标

建立 `P4E` 首轮回归基线：在多 schema、多前端目标、多冲突策略下验证生成行为稳定且可预测。

## 本轮范围

- 新增 `scripts/e2e-generator-regression-matrix.ts`。
- 覆盖维度：
  - schema：`customer`、`product`、`sample`（当前 generator 注册全集）
  - frontend：`vue`、`react`
  - conflict strategy：`skip`、`overwrite-generated-only`、`fail`
- 校验点：
  - 首次生成文件数正确且全部写入
  - 二次 `overwrite-generated-only` 对受管文件可覆盖
  - `skip` 对已存在文件全部跳过
  - `fail` 在存在冲突时稳定失败
  - `fail` 失败后 manifest 不漂移
  - 连续两次 `overwrite-generated-only` 结果一致（无漂移）
  - 并发 `overwrite-generated-only` 触发下仍可稳定完成且不残留临时文件
  - manifest 字段与输出文件列表一致
  - CLI 真实执行路径下，`fail` 与 `overwrite-generated-only` 行为和写入层一致

## 验证

- `bun run e2e:generator:matrix` 通过
- `bun run e2e:generator:cli` 通过
- 全量 `bun run check` 通过
- `packages/generator/src/write.test.ts` 已补并发覆盖回归用例
- CI 已拆分 `e2e-generator-matrix` 与 `e2e-generator-cli`，避免单 job 失败掩盖另一类回归信号
- `matrix/cli` 脚本已输出 JSON 报告，并在 CI 以 artifact 归档（支持 `ELYSIAN_REPORT_DIR` 指定输出目录）
- 报告已补充可追溯元数据：`gitSha`、`runtime(platform/arch)`、`durationMs`
- 已新增报告索引：`e2e:generator:reports:index` 汇总 matrix/cli 报告为单一 JSON 索引，CI 对应 `e2e-generator-report-index` 作业
- 已新增报告门禁：`e2e:generator:reports:gate` 支持 `maxFailedReports` 与 `allowFailedSources` 策略，CI 对应 `e2e-generator-report-gate` 作业
- CI `workflow_dispatch` 已支持手动输入 gate 参数（失败阈值、允许失败来源）

## 不在范围

- 三向语义合并
- section-level merge
- 正式 apply 到业务模块目录的自动合并流程
