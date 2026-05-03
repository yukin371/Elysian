import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import {
  createDiffSummary,
  createReport,
  createSession,
  createSqlProposal,
  createSqlProposalHandoff,
  createWorkspace,
  installGeneratorPreviewWorkspaceTestEnv,
  restoreGeneratorPreviewWorkspaceTestEnv,
} from "./use-generator-preview-workspace.test-helpers"

describe("useGeneratorPreviewWorkspace action flows", () => {
  beforeEach(() => {
    installGeneratorPreviewWorkspaceTestEnv()
  })

  afterEach(() => {
    restoreGeneratorPreviewWorkspaceTestEnv()
  })

  test("reports recoverable auth errors when apply fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/apply") &&
        method === "POST"
      ) {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/auth/refresh") && method === "POST") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({
      enabled: true,
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    workspace.currentSession.value = createSession({
      confirmedAt: "2026-05-02T12:10:00.000Z",
      status: "ready",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.selectedFilePath.value = createReport().files[0]?.path ?? null

    await workspace.applyPreview()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
  })

  test("does not apply mismatched apply response session", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/apply") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            session: createSession({
              id: "preview-session-other",
              status: "applied",
            }),
            sqlProposal: createSqlProposal(),
            sqlProposalHandoff: createSqlProposalHandoff(),
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession({
      confirmedAt: "2026-05-02T12:10:00.000Z",
      status: "ready",
    })
    workspace.currentDiffSummary.value = createDiffSummary()

    await workspace.applyPreview()

    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentSession.value?.status).toBe("ready")
    expect(workspace.errorMessage.value).toBe(
      "Generator apply response does not match current session",
    )
  })

  test("approves pending preview sessions before apply", async () => {
    let submittedComment: string | undefined

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/review") &&
        method === "POST"
      ) {
        submittedComment = JSON.parse(String(init?.body ?? "{}")).comment

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            session: createSession({
              reviewEvidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                comment: null,
                decision: "approve",
                reportPath: "generated/reports/preview-session-1.preview.json",
                reviewedAt: "2026-05-02T12:05:00.000Z",
                sessionId: "preview-session-1",
              },
              reviewedAt: "2026-05-02T12:05:00.000Z",
              reviewedByDisplayName: "Admin",
              reviewedByUserId: "user-1",
              reviewedByUsername: "admin",
              status: "ready",
            }),
            sqlProposal: createSqlProposal(),
            sqlProposalHandoff: createSqlProposalHandoff(),
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession()
    workspace.currentDiffSummary.value = createDiffSummary()

    expect(workspace.canApplyPreview.value).toBe(false)
    expect(workspace.canApprovePreview.value).toBe(true)
    expect(workspace.canRejectPreview.value).toBe(true)

    await workspace.reviewPreview("approve", "ready for staging")

    expect(workspace.currentSession.value?.status).toBe("ready")
    expect(workspace.currentSession.value?.reviewEvidence?.decision).toBe(
      "approve",
    )
    expect(submittedComment).toBe("ready for staging")
    const currentSession = workspace.currentSession.value
    expect(currentSession).not.toBeNull()
    if (!currentSession) {
      throw new Error("Expected current session after approval")
    }
    workspace.currentSession.value = {
      ...currentSession,
      confirmedAt: "2026-05-02T12:10:00.000Z",
    }
    expect(workspace.canApplyPreview.value).toBe(true)
    expect(workspace.canApprovePreview.value).toBe(false)
  })

  test("does not apply mismatched review response session", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/review") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            session: createSession({
              id: "preview-session-other",
              status: "ready",
            }),
            sqlProposal: createSqlProposal(),
            sqlProposalHandoff: createSqlProposalHandoff(),
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession()
    workspace.currentDiffSummary.value = createDiffSummary()

    await workspace.reviewPreview("approve")

    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentSession.value?.status).toBe("pending_review")
    expect(workspace.errorMessage.value).toBe(
      "Generator review response does not match current session",
    )
  })

  test("reports recoverable auth errors when review fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/review") &&
        method === "POST"
      ) {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/auth/refresh") && method === "POST") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({
      enabled: true,
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    workspace.currentSession.value = createSession()
    workspace.currentDiffSummary.value = createDiffSummary()

    await workspace.reviewPreview("approve")

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.status).toBe("pending_review")
  })

  test("does not apply pending review preview sessions", async () => {
    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession()
    workspace.currentDiffSummary.value = createDiffSummary()

    expect(workspace.canApplyPreview.value).toBe(false)
  })

  test("confirms ready preview sessions before allowing apply", async () => {
    let confirmRequestCount = 0
    let confirmRequestBody: Record<string, unknown> | null = null

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        confirmRequestCount += 1
        confirmRequestBody = init?.body ? JSON.parse(String(init.body)) : null

        return new Response(
          JSON.stringify({
            session: createSession({
              confirmedAt: "2026-05-02T12:15:00.000Z",
              confirmationEvidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                checklist: ["Review the SQL draft."],
                confirmedAt: "2026-05-02T12:15:00.000Z",
                reportPath: "generated/reports/preview-session-1.preview.json",
                sessionId: "preview-session-1",
              },
              status: "ready",
            }),
            sqlProposalHandoff: createSqlProposalHandoff(),
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    expect(workspace.canConfirmPreview.value).toBe(true)
    expect(workspace.canApplyPreview.value).toBe(false)

    await workspace.confirmPreview()

    expect(confirmRequestCount).toBe(1)
    expect(confirmRequestBody).toEqual({
      displayedRecoveryStatus: "none",
      displayedSnapshotPath:
        "/tmp/generator-session-report/customer.migration-proposal.json",
    })
    expect(workspace.currentSession.value?.confirmedAt).toBe(
      "2026-05-02T12:15:00.000Z",
    )
    expect(
      workspace.currentSession.value?.confirmationEvidence?.checklist,
    ).toEqual(["Review the SQL draft."])
    expect(workspace.canConfirmPreview.value).toBe(false)
    expect(workspace.canApplyPreview.value).toBe(true)
  })

  test("does not accept mismatched confirmation response session", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            session: createSession({
              id: "preview-session-other",
              confirmedAt: "2026-05-02T12:15:00.000Z",
              status: "ready",
            }),
            sqlProposalHandoff: createSqlProposalHandoff(),
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    await workspace.confirmPreview()

    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentSession.value?.confirmedAt).toBeNull()
    expect(workspace.errorMessage.value).toBe(
      "Generator confirmation response does not match current session",
    )
  })

  test("reports recoverable auth errors when confirmation fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      if (url.endsWith("/auth/refresh") && method === "POST") {
        return new Response(JSON.stringify({ message: "unauthorized" }), {
          headers: { "content-type": "application/json" },
          status: 401,
        })
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({
      enabled: true,
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()

    await workspace.confirmPreview()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.confirmedAt).toBeNull()
    expect(workspace.canConfirmPreview.value).toBe(true)
  })

  test("does not expose review or apply actions while workspace is disabled", async () => {
    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()

    expect(workspace.canApplyPreview.value).toBe(false)

    workspace.currentSession.value = createSession()

    expect(workspace.canApprovePreview.value).toBe(false)
    expect(workspace.canRejectPreview.value).toBe(false)
  })

  test("does not apply while preview review is in progress", async () => {
    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.reviewLoading.value = true

    expect(workspace.canApplyPreview.value).toBe(false)

    await workspace.applyPreview()

    expect(workspace.applyLoading.value).toBe(false)
  })
})
