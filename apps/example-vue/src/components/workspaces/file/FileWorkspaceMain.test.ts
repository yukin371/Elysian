import { readFile } from "node:fs/promises"

import { describe, expect, test } from "bun:test"

describe("FileWorkspaceMain", () => {
  test("keeps uploader ids out of the default file list", async () => {
    const source = await readFile(
      new URL("./FileWorkspaceMain.vue", import.meta.url),
      "utf8",
    )

    expect(source).toContain("app.file.field.originalName")
    expect(source).toContain("app.file.field.mimeType")
    expect(source).toContain("app.file.field.size")
    expect(source).toContain("app.file.field.createdAt")
    expect(source).not.toContain("{{ file.uploaderUserId }}")
  })
})
