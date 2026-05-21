import { describe, expect, test } from "bun:test"

import {
  copyGeneratorPreviewSuggestedCommands,
  copyGeneratorPreviewText,
  joinGeneratorPreviewSuggestedCommands,
  resolveGeneratorPreviewPreferredSqlView,
} from "./generator-preview-handoff"

describe("generator preview handoff helpers", () => {
  const restoreNavigator = (value: Navigator | undefined) => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value,
    })
  }

  test("joins suggested commands for display and copy", () => {
    expect(
      joinGeneratorPreviewSuggestedCommands([
        "bun run db:generate",
        "bun run db:migrate",
      ]),
    ).toBe("bun run db:generate\nbun run db:migrate")
  })

  test("omits blank suggested commands before display and copy", () => {
    expect(
      joinGeneratorPreviewSuggestedCommands([
        " bun run db:generate ",
        "   ",
        "",
        "bun run db:migrate",
      ]),
    ).toBe("bun run db:generate\nbun run db:migrate")
  })

  test("prefers the handoff view after apply when manual integration is still pending", () => {
    expect(
      resolveGeneratorPreviewPreferredSqlView({
        hasApplyEvidence: true,
        hasSqlProposal: true,
        pendingManualIntegrationStepCount: 2,
      }),
    ).toBe("handoff")
  })

  test("keeps the proposal view before apply when a sql proposal is available", () => {
    expect(
      resolveGeneratorPreviewPreferredSqlView({
        hasApplyEvidence: false,
        hasSqlProposal: true,
        pendingManualIntegrationStepCount: 2,
      }),
    ).toBe("proposal")
  })

  test("falls back to the handoff view when no sql proposal is available", () => {
    expect(
      resolveGeneratorPreviewPreferredSqlView({
        hasApplyEvidence: false,
        hasSqlProposal: false,
        pendingManualIntegrationStepCount: 1,
      }),
    ).toBe("handoff")
  })

  test("returns false when clipboard is unavailable", async () => {
    const originalNavigator = globalThis.navigator

    try {
      restoreNavigator(undefined)
      await expect(
        copyGeneratorPreviewSuggestedCommands(["bun run db:generate"]),
      ).resolves.toBe(false)
    } finally {
      restoreNavigator(originalNavigator)
    }
  })

  test("returns false when copied text is empty", async () => {
    await expect(copyGeneratorPreviewText("   ")).resolves.toBe(false)
  })

  test("returns false when clipboard write fails", async () => {
    await expect(
      copyGeneratorPreviewText("create table customers (...);", {
        writeText: async () => {
          throw new Error("clipboard denied")
        },
      }),
    ).resolves.toBe(false)
  })

  test("copies suggested commands into clipboard", async () => {
    const writes: string[] = []

    await expect(
      copyGeneratorPreviewSuggestedCommands(
        ["bun run db:generate", "bun run db:migrate"],
        {
          writeText: async (value: string) => {
            writes.push(value)
          },
        },
      ),
    ).resolves.toBe(true)

    expect(writes).toEqual(["bun run db:generate\nbun run db:migrate"])
  })

  test("copies arbitrary generator preview text into clipboard", async () => {
    const writes: string[] = []

    await expect(
      copyGeneratorPreviewText("create table customers (...);", {
        writeText: async (value: string) => {
          writes.push(value)
        },
      }),
    ).resolves.toBe(true)

    expect(writes).toEqual(["create table customers (...);"])
  })
})
