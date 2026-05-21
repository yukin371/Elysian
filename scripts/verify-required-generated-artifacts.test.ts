import { describe, expect, test } from "bun:test"

import { validateRequiredGeneratedArtifacts } from "./verify-required-generated-artifacts"

describe("validateRequiredGeneratedArtifacts", () => {
  test("accepts tracked generated artifacts that exist and are not ignored", () => {
    const failures = validateRequiredGeneratedArtifacts(
      [
        {
          path: "apps/example-vue/src/modules/generated/index.ts",
          owner: "apps/example-vue standard CRUD surfaces",
        },
      ],
      {
        exists: () => true,
        isGitTracked: () => true,
        isGitIgnored: () => false,
      },
    )

    expect(failures).toEqual([])
  })

  test("reports ignored and untracked generated artifacts with owner context", () => {
    const failures = validateRequiredGeneratedArtifacts(
      [
        {
          path: "apps/example-vue/src/modules/generated/index.ts",
          owner: "apps/example-vue standard CRUD surfaces",
        },
      ],
      {
        exists: () => true,
        isGitTracked: () => false,
        isGitIgnored: () => true,
      },
    )

    expect(failures).toEqual([
      "关键 generated 产物异常: apps/example-vue/src/modules/generated/index.ts（owner: apps/example-vue standard CRUD surfaces；仍被 .gitignore 忽略，未被 Git 跟踪）",
    ])
  })

  test("reports missing generated artifacts", () => {
    const failures = validateRequiredGeneratedArtifacts(
      [
        {
          path: "apps/example-vue/src/lib/platform-api/generated/openapi-types.d.ts",
          owner: "apps/example-vue platform API types",
        },
      ],
      {
        exists: () => false,
        isGitTracked: () => false,
        isGitIgnored: () => false,
      },
    )

    expect(failures).toEqual([
      "关键 generated 产物异常: apps/example-vue/src/lib/platform-api/generated/openapi-types.d.ts（owner: apps/example-vue platform API types；文件不存在，未被 Git 跟踪）",
    ])
  })
})
