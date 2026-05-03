import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import {
  createDiffSummary,
  createReport,
  createSession,
  createSessionDetail,
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

  test("approves pending preview sessions before confirm and apply", async () => {
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

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            session: createSession({
              confirmedAt: "2026-05-02T12:10:00.000Z",
              confirmationEvidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                checklist: ["Review the SQL draft."],
                confirmedAt: "2026-05-02T12:10:00.000Z",
                reportPath: "generated/reports/preview-session-1.preview.json",
                sessionId: "preview-session-1",
              },
              confirmedByDisplayName: "Admin",
              confirmedByUserId: "user-1",
              confirmedByUsername: "admin",
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
    await workspace.confirmPreview()

    expect(workspace.currentSession.value?.confirmedAt).toBe(
      "2026-05-02T12:10:00.000Z",
    )
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

    const { enabled, workspace } = createWorkspace()
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = createSqlProposalHandoff()
    enabled.value = true

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

  test("refreshes current detail when confirmation handoff becomes stale", async () => {
    let detailRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_SESSION_CONFIRMATION_HANDOFF_MISMATCH",
              message:
                "Generator session confirmation does not match the displayed SQL handoff",
              status: 409,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 409,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1") &&
        method === "GET"
      ) {
        detailRequestCount += 1

        const refreshedDetail = createSessionDetail({
          confirmedAt: null,
          id: "preview-session-1",
          sqlProposalHandoff: {
            ...createSqlProposalHandoff(),
            migrationProposalSnapshotPath:
              "/tmp/generator-session-report/customer.migration-proposal.v2.json",
          },
          status: "ready",
        })

        return new Response(
          JSON.stringify(refreshedDetail),
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

    expect(detailRequestCount).toBe(1)
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentSession.value?.confirmedAt).toBeNull()
    expect(workspace.errorMessage.value).toContain(
      "GENERATOR_SESSION_CONFIRMATION_HANDOFF_MISMATCH",
    )
    expect(workspace.canConfirmPreview.value).toBe(true)
  })

  test("reports refetch auth error when stale confirmation handoff cannot be refreshed", async () => {
    const recoverableErrors: unknown[] = []
    let detailRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_SESSION_CONFIRMATION_HANDOFF_MISMATCH",
              message:
                "Generator session confirmation does not match the displayed SQL handoff",
              status: 409,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 409,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1") &&
        method === "GET"
      ) {
        detailRequestCount += 1

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

    expect(detailRequestCount).toBe(1)
    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentSession.value?.confirmedAt).toBeNull()
    expect(workspace.canConfirmPreview.value).toBe(true)
  })

  test("refreshes current detail when confirmation is no longer ready on the server", async () => {
    let detailRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1/confirm") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_SESSION_CONFIRMATION_NOT_READY",
              message: "Generator session is not ready for confirmation",
              status: 409,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 409,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-1") &&
        method === "GET"
      ) {
        detailRequestCount += 1

        return new Response(
          JSON.stringify(
            createSessionDetail({
              appliedAt: "2026-05-02T12:20:00.000Z",
              appliedByDisplayName: "Admin",
              appliedByUserId: "user-1",
              appliedByUsername: "admin",
              appliedFileCount: 1,
              id: "preview-session-1",
              status: "applied",
            }),
          ),
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

    expect(detailRequestCount).toBe(1)
    expect(workspace.currentSession.value?.status).toBe("applied")
    expect(workspace.currentSession.value?.appliedAt).toBe(
      "2026-05-02T12:20:00.000Z",
    )
    expect(workspace.errorMessage.value).toContain(
      "GENERATOR_SESSION_CONFIRMATION_NOT_READY",
    )
    expect(workspace.canConfirmPreview.value).toBe(false)
  })

  test("does not expose confirmation when sql proposal handoff is missing", async () => {
    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = null

    expect(workspace.canConfirmPreview.value).toBe(false)
  })

  test("does not expose confirmation when sql proposal is not ready", async () => {
    const { workspace } = createWorkspace({ enabled: true })
    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.sqlProposalHandoff.value = {
      ...createSqlProposalHandoff(),
      proposalStatus: "unsupported",
      unsupportedReason: "Manual migration planning required.",
    }

    expect(workspace.canConfirmPreview.value).toBe(false)
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
