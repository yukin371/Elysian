import { describe, expect, test } from "bun:test"

import { validatePrMetadata } from "./validate-pr-metadata"

const validBody = `## Summary

- 变更目标：修复 PR 校验逻辑
- 关键改动：允许已勾选 checklist 通过
- 边界说明：仅限仓库治理脚本

## Validation

- [x] \`bun run check\`
- [ ] \`bun run build:vue\`
- [X] 文档已同步或确认无需同步

## Risk

- 风险点：校验规则过严会阻断正常 PR
- 回滚方式：回退本次 PR 元数据校验逻辑

## Notes

- 关联 issue / ADR / 计划：无`

describe("validatePrMetadata", () => {
  test("accepts checked and unchecked validation checklist items", () => {
    expect(
      validatePrMetadata("fix(ci): allow checked validation items", validBody),
    ).toEqual([])
  })

  test("rejects watermark content in title or body", () => {
    const failures = validatePrMetadata(
      "fix(ci): Generated with Claude Code",
      validBody,
    )

    expect(failures).toContain("PR 标题或描述包含协作者标识/水印，请移除")
  })

  test("rejects missing validation checklist item", () => {
    const failures = validatePrMetadata(
      "fix(ci): require validation checklist",
      validBody.replace("- [ ] `bun run build:vue`\n", ""),
    )

    expect(failures).toContain("PR 描述缺少校验项: `bun run build:vue`")
  })
})
