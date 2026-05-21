import { readFile } from "node:fs/promises"

import { describe, expect, test } from "bun:test"

describe("ShellWorkspaceMainSwitch", () => {
  test("keeps shell-level listeners from falling through to inactive workspaces", async () => {
    const source = await readFile(
      new URL("./ShellWorkspaceMainSwitch.vue", import.meta.url),
      "utf8",
    )

    expect(source).toContain("defineOptions({ inheritAttrs: false })")
    expect(source).toContain('v-on="activeWorkspaceListeners"')
  })
})
