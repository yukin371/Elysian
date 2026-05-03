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
  waitForAsyncWork,
} from "./use-generator-preview-workspace.test-helpers"

describe("useGeneratorPreviewWorkspace restore flows", () => {
  beforeEach(() => {
    installGeneratorPreviewWorkspaceTestEnv()
  })

  afterEach(() => {
    restoreGeneratorPreviewWorkspaceTestEnv()
  })

  test("loads recent session options and restores session detail", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              createSession({
                createdAt: "2026-05-02T13:00:00.000Z",
                id: "preview-session-2",
                schemaName: "customer",
                status: "ready",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-2") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              createdAt: "2026-05-02T13:00:00.000Z",
              frontendTarget: "react",
              id: "preview-session-2",
              report: createReport({ frontendTarget: "react" }),
              schemaName: "customer",
              status: "ready",
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

    const { enabled, workspace } = createWorkspace()
    enabled.value = true
    await waitForAsyncWork()

    expect(workspace.recentSessionOptions.value).toHaveLength(1)
    expect(workspace.recentSessionOptions.value[0]?.value).toBe(
      "preview-session-2",
    )

    await workspace.restorePreviewSession("preview-session-2")

    expect(workspace.currentSession.value?.id).toBe("preview-session-2")
    expect(workspace.selectedRecentSessionId.value).toBe("preview-session-2")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
    expect(
      workspace.sqlProposalHandoff.value?.migrationProposalSnapshotRecovery
        ?.status,
    ).toBe("none")
  })

  test("restores latest matching session before creating a new preview", async () => {
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              createSession({
                conflictStrategy: "overwrite-generated-only",
                createdAt: "2026-05-02T14:30:00.000Z",
                id: "preview-session-pending",
                schemaName: "customer",
                status: "pending_review",
              }),
              createSession({
                conflictStrategy: "overwrite-generated-only",
                createdAt: "2026-05-02T14:00:00.000Z",
                id: "preview-session-ready",
                schemaName: "customer",
                status: "ready",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-pending") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:30:00.000Z",
              id: "preview-session-pending",
              status: "pending_review",
            }),
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-ready") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:00:00.000Z",
              id: "preview-session-ready",
              status: "ready",
            }),
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { enabled, workspace } = createWorkspace()
    workspace.selectedConflictStrategy.value = "overwrite-generated-only"
    enabled.value = true

    await waitForAsyncWork()

    expect(previewRequestCount).toBe(0)
    expect(workspace.currentSession.value?.id).toBe("preview-session-pending")
    expect(workspace.selectedRecentSessionId.value).toBe(
      "preview-session-pending",
    )
  })

  test("skips stale matching session detail before creating a new preview", async () => {
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              createSession({
                conflictStrategy: "fail",
                frontendTarget: "vue",
                id: "preview-session-stale",
                schemaName: "customer",
                status: "ready",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-stale") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              frontendTarget: "react",
              id: "preview-session-stale",
              status: "ready",
            }),
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession({
              id: "preview-session-new",
              status: "pending_review",
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

    const { enabled, workspace } = createWorkspace()
    enabled.value = true

    await waitForAsyncWork()

    expect(previewRequestCount).toBe(1)
    expect(workspace.currentSession.value?.id).toBe("preview-session-new")
    expect(workspace.selectedRecentSessionId.value).toBe("preview-session-new")
    expect(workspace.selectedFrontendTarget.value).toBe("vue")
  })

  test("reuses cached matching session when switching back to a previous selection", async () => {
    let listRequestCount = 0
    let detailRequestCount = 0
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        listRequestCount += 1

        return new Response(
          JSON.stringify({
            items: [
              createSession({
                conflictStrategy: "overwrite-generated-only",
                createdAt: "2026-05-02T14:00:00.000Z",
                id: "preview-session-3",
                schemaName: "customer",
                status: "ready",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-3") &&
        method === "GET"
      ) {
        detailRequestCount += 1

        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:00:00.000Z",
              id: "preview-session-3",
              status: "ready",
            }),
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession({
              conflictStrategy: "fail",
              id: `preview-session-fail-${previewRequestCount}`,
              status: "pending_review",
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

    const { enabled, workspace } = createWorkspace()
    workspace.selectedConflictStrategy.value = "overwrite-generated-only"
    enabled.value = true

    await waitForAsyncWork()

    expect(listRequestCount).toBe(1)
    expect(detailRequestCount).toBe(1)

    workspace.selectedConflictStrategy.value = "fail"
    await waitForAsyncWork()

    expect(previewRequestCount).toBe(1)
    expect(listRequestCount).toBe(2)

    workspace.selectedConflictStrategy.value = "overwrite-generated-only"
    await waitForAsyncWork()

    expect(workspace.currentSession.value?.id).toBe("preview-session-3")
    expect(listRequestCount).toBe(2)
    expect(detailRequestCount).toBe(1)
  })

  test("reuses cached session detail when restoring the same session twice", async () => {
    let detailRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-2") &&
        method === "GET"
      ) {
        detailRequestCount += 1

        return new Response(
          JSON.stringify(
            createSessionDetail({
              id: "preview-session-2",
              status: "ready",
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

    const { workspace } = createWorkspace()

    await workspace.restorePreviewSession("preview-session-2")
    await workspace.restorePreviewSession("preview-session-2")

    expect(detailRequestCount).toBe(1)
    expect(workspace.currentSession.value?.id).toBe("preview-session-2")
  })

  test("clears stale preview when restored session detail is inconsistent", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-broken") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              frontendTarget: "vue",
              id: "preview-session-broken",
              report: createReport({ frontendTarget: "react" }),
              status: "ready",
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

    const { workspace } = createWorkspace()
    workspace.currentSession.value = createSession({
      id: "preview-session-current",
      status: "ready",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.selectedRecentSessionId.value = "preview-session-current"

    await workspace.restorePreviewSession("preview-session-broken")

    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
    expect(workspace.sqlPreview.value).toBeNull()
    expect(workspace.selectedRecentSessionId.value).toBe("")
    expect(workspace.errorMessage.value).toBe(
      "Generator session detail does not match its report",
    )
  })

  test("does not restore the current session again when already selected", async () => {
    let detailRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession({
              id: "preview-session-2",
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
        url.endsWith("/studio/generator/sessions/preview-session-2") &&
        method === "GET"
      ) {
        detailRequestCount += 1
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { enabled, workspace } = createWorkspace()
    enabled.value = true

    await waitForAsyncWork()

    await workspace.restorePreviewSession("preview-session-2")

    expect(detailRequestCount).toBe(0)
    expect(workspace.errorMessage.value).toBe("")
    expect(workspace.currentSession.value?.id).toBe("preview-session-2")
  })

  test("prioritizes matching recent sessions in session options", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(
          JSON.stringify({
            items: [
              createSession({
                conflictStrategy: "fail",
                createdAt: "2026-05-02T15:00:00.000Z",
                id: "preview-session-other",
                schemaName: "customer",
                status: "ready",
              }),
              createSession({
                conflictStrategy: "overwrite-generated-only",
                createdAt: "2026-05-02T14:30:00.000Z",
                id: "preview-session-match-pending",
                schemaName: "customer",
                status: "pending_review",
              }),
              createSession({
                conflictStrategy: "overwrite-generated-only",
                createdAt: "2026-05-02T14:00:00.000Z",
                id: "preview-session-match-ready",
                schemaName: "customer",
                status: "ready",
              }),
            ],
          }),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith(
          "/studio/generator/sessions/preview-session-match-pending",
        ) &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:30:00.000Z",
              id: "preview-session-match-pending",
              status: "pending_review",
            }),
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (
        url.endsWith(
          "/studio/generator/sessions/preview-session-match-ready",
        ) &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:00:00.000Z",
              id: "preview-session-match-ready",
              status: "ready",
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

    const { enabled, workspace } = createWorkspace()
    workspace.selectedConflictStrategy.value = "overwrite-generated-only"
    enabled.value = true

    await waitForAsyncWork()

    expect(workspace.recentSessionOptions.value[0]?.value).toBe(
      "preview-session-match-pending",
    )
    expect(workspace.recentSessionOptions.value[1]?.value).toBe(
      "preview-session-match-ready",
    )
    expect(workspace.recentSessionOptions.value[2]?.value).toBe(
      "preview-session-other",
    )
    expect(workspace.recentSessionOptions.value[0]?.label).toContain(
      "app.generatorPreview.conflictStrategy.overwrite-generated-only",
    )
    expect(workspace.recentSessionOptions.value[2]?.label).toContain(
      "app.generatorPreview.conflictStrategy.fail",
    )
  })
})
