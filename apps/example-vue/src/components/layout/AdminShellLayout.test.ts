import { readFile } from "node:fs/promises"

import { describe, expect, test } from "bun:test"

describe("AdminShellLayout", () => {
  test("keeps a visible fallback while async workspaces load", async () => {
    const source = await readFile(
      new URL("./AdminShellLayout.vue", import.meta.url),
      "utf8",
    )

    expect(source).toContain("<Suspense>")
    expect(source).toContain("<template #fallback>")
    expect(source).toContain("app.loading.workspace")
    expect(source).toContain("workspace-loading-panel")
  })
})
