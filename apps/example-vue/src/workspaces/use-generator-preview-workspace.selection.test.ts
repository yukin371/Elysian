import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import {
  createDiffSummary,
  createLocalStorage,
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

describe("useGeneratorPreviewWorkspace selection flows", () => {
  beforeEach(() => {
    installGeneratorPreviewWorkspaceTestEnv()
  })

  afterEach(() => {
    restoreGeneratorPreviewWorkspaceTestEnv()
  })

  test("updates recent sessions locally after preview review, confirm, and apply", async () => {
    let listRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        listRequestCount += 1

        return new Response(JSON.stringify({ items: [] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession({
              id: "preview-session-created",
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

      if (
        url.endsWith(
          "/studio/generator/sessions/preview-session-created/review",
        ) &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            session: createSession({
              id: "preview-session-created",
              reviewEvidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                comment: "ready for staging",
                decision: "approve",
                reportPath:
                  "generated/reports/preview-session-created.preview.json",
                reviewedAt: "2026-05-02T16:05:00.000Z",
                sessionId: "preview-session-created",
              },
              reviewedAt: "2026-05-02T16:05:00.000Z",
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
        url.endsWith(
          "/studio/generator/sessions/preview-session-created/apply",
        ) &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            apply: {
              evidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                appliedAt: "2026-05-02T16:10:00.000Z",
                manifestPath:
                  "generated/manifests/preview-session-created.json",
                reportPath:
                  "generated/reports/preview-session-created.preview.json",
                requestId: "req-apply-preview-session-created",
                sessionId: "preview-session-created",
              },
              files: [],
              manifestPath: "generated/manifests/preview-session-created.json",
            },
            diff: createDiffSummary(),
            session: createSession({
              appliedAt: "2026-05-02T16:10:00.000Z",
              appliedByDisplayName: "Admin",
              appliedByUserId: "user-1",
              appliedByUsername: "admin",
              applyEvidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                appliedAt: "2026-05-02T16:10:00.000Z",
                manifestPath:
                  "generated/manifests/preview-session-created.json",
                reportPath:
                  "generated/reports/preview-session-created.preview.json",
                requestId: "req-apply-preview-session-created",
                sessionId: "preview-session-created",
              },
              applyManifestPath:
                "generated/manifests/preview-session-created.json",
              applyRequestId: "req-apply-preview-session-created",
              id: "preview-session-created",
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

      if (
        url.endsWith(
          "/studio/generator/sessions/preview-session-created/confirm",
        ) &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            session: createSession({
              confirmedAt: "2026-05-02T16:07:00.000Z",
              confirmationEvidence: {
                actorDisplayName: "Admin",
                actorUserId: "user-1",
                actorUsername: "admin",
                checklist: ["Review the SQL draft."],
                confirmedAt: "2026-05-02T16:07:00.000Z",
                reportPath:
                  "generated/reports/preview-session-created.preview.json",
                sessionId: "preview-session-created",
              },
              confirmedByDisplayName: "Admin",
              confirmedByUserId: "user-1",
              confirmedByUsername: "admin",
              id: "preview-session-created",
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
    enabled.value = true

    await waitForAsyncWork()

    expect(listRequestCount).toBe(1)
    expect(workspace.recentSessionOptions.value[0]?.value).toBe(
      "preview-session-created",
    )

    await workspace.reviewPreview("approve", "ready for staging")

    expect(listRequestCount).toBe(1)
    expect(workspace.currentSession.value?.status).toBe("ready")
    await workspace.confirmPreview()

    expect(workspace.currentSession.value?.confirmedAt).toBe(
      "2026-05-02T16:07:00.000Z",
    )
    expect(workspace.recentSessionOptions.value[0]?.value).toBe(
      "preview-session-created",
    )

    await workspace.applyPreview()

    expect(listRequestCount).toBe(1)
    expect(workspace.currentSession.value?.status).toBe("applied")
    expect(workspace.recentSessionOptions.value[0]?.value).toBe(
      "preview-session-created",
    )
  })

  test("restores persisted selection before loading matching session", async () => {
    let previewRequestCount = 0

    globalThis.localStorage.setItem(
      "elysian.example-vue.generator-preview.selection",
      JSON.stringify({
        conflictStrategy: "overwrite-generated-only",
        frontendTarget: "react",
        schemaName: "customer",
        sessionId: "preview-session-4",
      }),
    )

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
                frontendTarget: "react",
                id: "preview-session-4",
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
        url.endsWith("/studio/generator/sessions/preview-session-4") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:30:00.000Z",
              frontendTarget: "react",
              id: "preview-session-4",
              report: createReport({
                conflictStrategy: "overwrite-generated-only",
                frontendTarget: "react",
              }),
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
    enabled.value = true

    await waitForAsyncWork()

    expect(previewRequestCount).toBe(0)
    expect(workspace.selectedSchemaName.value).toBe("customer")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.selectedConflictStrategy.value).toBe(
      "overwrite-generated-only",
    )
    expect(workspace.currentSession.value?.id).toBe("preview-session-4")
  })

  test("skips inconsistent persisted session detail before refreshing preview", async () => {
    let listRequestCount = 0
    let previewRequestCount = 0

    globalThis.localStorage.setItem(
      "elysian.example-vue.generator-preview.selection",
      JSON.stringify({
        conflictStrategy: "overwrite-generated-only",
        frontendTarget: "react",
        schemaName: "customer",
        sessionId: "preview-session-inconsistent",
      }),
    )

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith(
          "/studio/generator/sessions/preview-session-inconsistent",
        ) &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              frontendTarget: "react",
              id: "preview-session-inconsistent",
              report: createReport({
                conflictStrategy: "overwrite-generated-only",
                frontendTarget: "vue",
              }),
              status: "ready",
            }),
          ),
          {
            headers: { "content-type": "application/json" },
            status: 200,
          },
        )
      }

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        listRequestCount += 1

        return new Response(JSON.stringify({ items: [] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport({
              conflictStrategy: "overwrite-generated-only",
              frontendTarget: "react",
            }),
            session: createSession({
              conflictStrategy: "overwrite-generated-only",
              frontendTarget: "react",
              id: "preview-session-fresh",
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

    expect(listRequestCount).toBe(1)
    expect(previewRequestCount).toBe(1)
    expect(workspace.currentSession.value?.id).toBe("preview-session-fresh")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
  })

  test("surfaces auth error instead of silently refreshing when persisted session restore fails", async () => {
    const recoverableErrors: unknown[] = []
    let previewRequestCount = 0

    globalThis.localStorage.setItem(
      "elysian.example-vue.generator-preview.selection",
      JSON.stringify({
        conflictStrategy: "overwrite-generated-only",
        frontendTarget: "react",
        schemaName: "customer",
        sessionId: "preview-session-protected",
      }),
    )

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-protected") &&
        method === "GET"
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

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { enabled, workspace } = createWorkspace({
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })
    enabled.value = true

    await waitForAsyncWork()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(previewRequestCount).toBe(0)
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.selectedSchemaName.value).toBe("customer")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.selectedConflictStrategy.value).toBe(
      "overwrite-generated-only",
    )
  })

  test("surfaces restore error instead of silently refreshing when persisted session restore fails", async () => {
    let previewRequestCount = 0

    globalThis.localStorage.setItem(
      "elysian.example-vue.generator-preview.selection",
      JSON.stringify({
        conflictStrategy: "overwrite-generated-only",
        frontendTarget: "react",
        schemaName: "customer",
        sessionId: "preview-session-broken",
      }),
    )

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-broken") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_SESSION_REPORT_READ_FAILED",
              message: "Generator session report read failed",
              status: 500,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
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
    enabled.value = true

    await waitForAsyncWork()

    expect(previewRequestCount).toBe(0)
    expect(workspace.errorMessage.value).toContain(
      "GENERATOR_SESSION_REPORT_READ_FAILED",
    )
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.selectedSchemaName.value).toBe("customer")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.selectedConflictStrategy.value).toBe(
      "overwrite-generated-only",
    )
  })

  test("falls through to matching recent session when persisted session is missing", async () => {
    let listRequestCount = 0
    let previewRequestCount = 0

    globalThis.localStorage.setItem(
      "elysian.example-vue.generator-preview.selection",
      JSON.stringify({
        conflictStrategy: "overwrite-generated-only",
        frontendTarget: "react",
        schemaName: "customer",
        sessionId: "preview-session-missing",
      }),
    )

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview-session-missing") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_SESSION_NOT_FOUND",
              message: "Generator session not found",
              status: 404,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 404,
          },
        )
      }

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        listRequestCount += 1

        return new Response(
          JSON.stringify({
            items: [
              createSession({
                conflictStrategy: "overwrite-generated-only",
                createdAt: "2026-05-02T14:30:00.000Z",
                frontendTarget: "react",
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
        url.endsWith("/studio/generator/sessions/preview-session-ready") &&
        method === "GET"
      ) {
        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:30:00.000Z",
              frontendTarget: "react",
              id: "preview-session-ready",
              report: createReport({
                conflictStrategy: "overwrite-generated-only",
                frontendTarget: "react",
              }),
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
    enabled.value = true

    await waitForAsyncWork()

    expect(listRequestCount).toBe(1)
    expect(previewRequestCount).toBe(0)
    expect(workspace.currentSession.value?.id).toBe("preview-session-ready")
    expect(workspace.selectedRecentSessionId.value).toBe("preview-session-ready")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.selectedConflictStrategy.value).toBe(
      "overwrite-generated-only",
    )
  })

  test("restores persisted session before loading recent sessions", async () => {
    let listRequestCount = 0
    let detailRequestCount = 0

    globalThis.localStorage.setItem(
      "elysian.example-vue.generator-preview.selection",
      JSON.stringify({
        conflictStrategy: "overwrite-generated-only",
        frontendTarget: "react",
        schemaName: "customer",
        sessionId: "preview-session-4",
      }),
    )

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        listRequestCount += 1
      }

      if (
        url.endsWith("/studio/generator/sessions/preview-session-4") &&
        method === "GET"
      ) {
        detailRequestCount += 1

        return new Response(
          JSON.stringify(
            createSessionDetail({
              conflictStrategy: "overwrite-generated-only",
              createdAt: "2026-05-02T14:30:00.000Z",
              frontendTarget: "react",
              id: "preview-session-4",
              report: createReport({
                conflictStrategy: "overwrite-generated-only",
                frontendTarget: "react",
              }),
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

    expect(detailRequestCount).toBe(1)
    expect(listRequestCount).toBe(0)
    expect(workspace.currentSession.value?.id).toBe("preview-session-4")
    expect(
      JSON.parse(
        globalThis.localStorage.getItem(
          "elysian.example-vue.generator-preview.selection",
        ) ?? "{}",
      ),
    ).toEqual({
      conflictStrategy: "overwrite-generated-only",
      frontendTarget: "react",
      schemaName: "customer",
      sessionId: "preview-session-4",
    })
  })

  test("persists latest generator preview selection locally", async () => {
    const { workspace } = createWorkspace()

    workspace.selectedFrontendTarget.value = "react"
    workspace.selectedConflictStrategy.value = "overwrite"

    await waitForAsyncWork()

    expect(
      JSON.parse(
        globalThis.localStorage.getItem(
          "elysian.example-vue.generator-preview.selection",
        ) ?? "{}",
      ),
    ).toEqual({
      conflictStrategy: "overwrite",
      frontendTarget: "react",
      schemaName: "customer",
      sessionId: null,
    })
  })

  test("does not throw when generator preview selection storage fails", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        ...createLocalStorage(),
        setItem: () => {
          throw new Error("quota exceeded")
        },
      },
      writable: true,
    })

    const { workspace } = createWorkspace()
    workspace.selectedFrontendTarget.value = "react"

    await waitForAsyncWork()

    expect(workspace.selectedFrontendTarget.value).toBe("react")
  })

  test("does not throw when generator preview selection storage is blocked", async () => {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get: () => {
        throw new Error("storage blocked")
      },
    })

    const { workspace } = createWorkspace()
    workspace.selectedFrontendTarget.value = "react"

    await waitForAsyncWork()

    expect(workspace.selectedFrontendTarget.value).toBe("react")
  })

  test("clears query when generator selection context changes", async () => {
    const { workspace } = createWorkspace()

    workspace.previewQuery.value = "generated/customer"
    workspace.selectedConflictStrategy.value = "overwrite"

    await waitForAsyncWork()

    expect(workspace.previewQuery.value).toBe("")

    workspace.previewQuery.value = "generated/customer"
    workspace.selectedFrontendTarget.value = "react"

    await waitForAsyncWork()

    expect(workspace.previewQuery.value).toBe("")
  })

  test("clears selected recent session while generator context is changing", async () => {
    const { workspace } = createWorkspace()

    workspace.currentSession.value = createSession({
      id: "preview-session-current",
    })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.selectedRecentSessionId.value = "preview-session-current"

    workspace.selectedConflictStrategy.value = "overwrite"

    await waitForAsyncWork()

    expect(workspace.selectedRecentSessionId.value).toBe("")
  })
})
