import { describe, expect, test } from "bun:test"

import { buildGeneratorPreviewRecentSessionOptions } from "./generator-preview-session-presentation"
import { createSession } from "./use-generator-preview-workspace.test-helpers"

const t = (key: string) => key

describe("generator-preview-session-presentation", () => {
  test("adds current-setup and blocking badges to recent session labels", () => {
    const options = buildGeneratorPreviewRecentSessionOptions(
      t,
      [
        createSession({
          createdAt: "2026-05-02T14:30:00.000Z",
          frontendTarget: "react",
          hasBlockingConflicts: true,
          id: "preview-session-1",
          schemaName: "supplier",
          status: "pending_review",
        }),
      ],
      (session) => session.id === "preview-session-1",
    )

    expect(options).toEqual([
      {
        label:
          "app.generatorPreview.recentSessionBadge.current · app.generatorPreview.recentSessionBadge.blocking · supplier · React · app.generatorPreview.status.pendingReview · 05-02 14:30",
        value: "preview-session-1",
      },
    ])
  })
})
