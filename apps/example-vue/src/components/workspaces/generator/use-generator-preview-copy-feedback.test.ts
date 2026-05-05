import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import type { GeneratorPreviewClipboard } from "./generator-preview-handoff"
import { useGeneratorPreviewCopyFeedback } from "./use-generator-preview-copy-feedback"

const t = (key: string) => key
type NavigatorWithClipboard = { clipboard?: GeneratorPreviewClipboard }

describe("useGeneratorPreviewCopyFeedback", () => {
  const originalClipboard = (
    globalThis.navigator as NavigatorWithClipboard | undefined
  )?.clipboard
  const originalSetTimeout = globalThis.setTimeout
  const originalClearTimeout = globalThis.clearTimeout

  let nextTimerId = 1
  let clearedTimerIds: number[]
  let scheduledTimers: Array<{ callback: () => void; id: number }>

  beforeEach(() => {
    nextTimerId = 1
    clearedTimerIds = []
    scheduledTimers = []

    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        ...(globalThis.navigator ?? {}),
        clipboard: {
          writeText: async () => {},
        },
      },
    })

    globalThis.setTimeout = ((callback: () => void) => {
      const id = nextTimerId
      nextTimerId += 1
      scheduledTimers.push({ callback, id })
      return id as unknown as ReturnType<typeof setTimeout>
    }) as typeof setTimeout

    globalThis.clearTimeout = ((timerId: number) => {
      clearedTimerIds.push(timerId)
    }) as typeof clearTimeout
  })

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value:
        originalClipboard === undefined
          ? globalThis.navigator
          : {
              ...(globalThis.navigator ?? {}),
              clipboard: originalClipboard,
            },
    })

    globalThis.setTimeout = originalSetTimeout
    globalThis.clearTimeout = originalClearTimeout
  })

  test("updates snippet copy label on success and resets after timeout", async () => {
    const { copyTextByKey, resolveCopyLabel } =
      useGeneratorPreviewCopyFeedback(t)

    expect(
      resolveCopyLabel(
        "migrationProposalSnapshotPath",
        "app.generatorPreview.action.copySnippet",
      ),
    ).toBe("app.generatorPreview.action.copySnippet")

    await copyTextByKey(
      "migrationProposalSnapshotPath",
      "/tmp/customer.migration-proposal.json",
    )

    expect(
      resolveCopyLabel(
        "migrationProposalSnapshotPath",
        "app.generatorPreview.action.copySnippet",
      ),
    ).toBe("app.generatorPreview.action.copySnippetDone")
    expect(scheduledTimers).toHaveLength(1)

    scheduledTimers[0]?.callback()

    expect(
      resolveCopyLabel(
        "migrationProposalSnapshotPath",
        "app.generatorPreview.action.copySnippet",
      ),
    ).toBe("app.generatorPreview.action.copySnippet")
  })

  test("updates commands copy label on failure and resets after timeout", async () => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        ...(globalThis.navigator ?? {}),
        clipboard: {
          writeText: async () => {
            throw new Error("clipboard denied")
          },
        },
      },
    })

    const { copySuggestedCommandsByKey, resolveCopyLabel } =
      useGeneratorPreviewCopyFeedback(t)

    await copySuggestedCommandsByKey(["bun run db:generate"])

    expect(
      resolveCopyLabel("commands", "app.generatorPreview.action.copyCommands"),
    ).toBe("app.generatorPreview.action.copyCommandsFailed")
    expect(scheduledTimers).toHaveLength(1)

    scheduledTimers[0]?.callback()

    expect(
      resolveCopyLabel("commands", "app.generatorPreview.action.copyCommands"),
    ).toBe("app.generatorPreview.action.copyCommands")
  })

  test("clears previous timer before scheduling a new copy reset", async () => {
    const { copyTextByKey } = useGeneratorPreviewCopyFeedback(t)

    await copyTextByKey("unsupportedReason", "manual review required")
    await copyTextByKey("unsupportedReason", "manual review required")

    expect(clearedTimerIds).toContain(1)
    expect(scheduledTimers).toHaveLength(2)
  })

  test("disposes all pending feedback reset timers", async () => {
    const {
      copySuggestedCommandsByKey,
      copyTextByKey,
      disposeCopyFeedbackTimers,
    } = useGeneratorPreviewCopyFeedback(t)

    await copyTextByKey("sqlDraft", "create table customer ();")
    await copySuggestedCommandsByKey(["bun run db:generate"])

    disposeCopyFeedbackTimers()

    expect(clearedTimerIds).toContain(1)
    expect(clearedTimerIds).toContain(2)
  })
})
