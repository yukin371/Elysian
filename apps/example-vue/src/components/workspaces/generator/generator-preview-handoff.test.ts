import { describe, expect, test } from "bun:test"

import {
  copyGeneratorPreviewSuggestedCommands,
  joinGeneratorPreviewSuggestedCommands,
} from "./generator-preview-handoff"

describe("generator preview handoff helpers", () => {
  test("joins suggested commands for display and copy", () => {
    expect(
      joinGeneratorPreviewSuggestedCommands([
        "bun run db:generate",
        "bun run db:migrate",
      ]),
    ).toBe("bun run db:generate\nbun run db:migrate")
  })

  test("returns false when clipboard is unavailable", async () => {
    await expect(
      copyGeneratorPreviewSuggestedCommands(["bun run db:generate"], undefined),
    ).resolves.toBe(false)
  })

  test("copies suggested commands into clipboard", async () => {
    const writes: string[] = []

    await expect(
      copyGeneratorPreviewSuggestedCommands(
        ["bun run db:generate", "bun run db:migrate"],
        {
          writeText: async (value) => {
            writes.push(value)
          },
        },
      ),
    ).resolves.toBe(true)

    expect(writes).toEqual(["bun run db:generate\nbun run db:migrate"])
  })
})
