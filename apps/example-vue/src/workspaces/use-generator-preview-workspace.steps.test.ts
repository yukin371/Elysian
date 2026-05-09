import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import {
  createDiffSummary,
  createSession,
  createSqlProposalHandoff,
  createWorkspace,
  installGeneratorPreviewWorkspaceTestEnv,
  restoreGeneratorPreviewWorkspaceTestEnv,
} from "./use-generator-preview-workspace.test-helpers"

describe("useGeneratorPreviewWorkspace step flows", () => {
  beforeEach(() => {
    installGeneratorPreviewWorkspaceTestEnv()
  })

  afterEach(() => {
    restoreGeneratorPreviewWorkspaceTestEnv()
  })

  test('starts in "configure" step without an active preview session', () => {
    const { workspace } = createWorkspace()

    expect(workspace.currentStep.value).toBe("configure")
  })

  test('maps pending review sessions to the "review" step', () => {
    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession({
      status: "pending_review",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    expect(workspace.currentStep.value).toBe("review")
  })

  test('maps ready unconfirmed sessions with a ready sql handoff to the "confirm" step', () => {
    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession({
      confirmedAt: null,
      status: "ready",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    expect(workspace.currentStep.value).toBe("confirm")
  })

  test('maps confirmed ready sessions to the "apply" step', () => {
    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession({
      confirmedAt: "2026-05-09T10:00:00.000Z",
      status: "ready",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    expect(workspace.currentStep.value).toBe("apply")
  })

  test('maps applied sessions to the "done" step', () => {
    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession({
      appliedAt: "2026-05-09T10:30:00.000Z",
      confirmedAt: "2026-05-09T10:00:00.000Z",
      status: "applied",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    expect(workspace.currentStep.value).toBe("done")
  })
})
