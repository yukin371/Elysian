import { afterEach, beforeEach, describe, expect, test } from "bun:test"

import type { GeneratorPreviewConflictStrategy } from "../lib/platform-api"
import {
  createDiffSummary,
  createReport,
  createSession,
  createSqlProposal,
  createSqlProposalHandoff,
  createWorkspace,
  installGeneratorPreviewWorkspaceTestEnv,
  restoreGeneratorPreviewWorkspaceTestEnv,
  waitForAsyncWork,
} from "./use-generator-preview-workspace.test-helpers"

describe("useGeneratorPreviewWorkspace refresh flows", () => {
  beforeEach(() => {
    installGeneratorPreviewWorkspaceTestEnv()
  })

  afterEach(() => {
    restoreGeneratorPreviewWorkspaceTestEnv()
  })

  test("reports recoverable auth errors when preview refresh fails", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
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

    await waitForAsyncWork()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("unauthorized")
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
  })

  test("does not report auth recovery when preview refresh fails with non-auth error", async () => {
    const recoverableErrors: unknown[] = []

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_PREVIEW_CREATE_FAILED",
              message: "Generator preview create failed",
              status: 500,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({
      enabled: true,
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await waitForAsyncWork()

    expect(recoverableErrors).toHaveLength(0)
    expect(workspace.errorMessage.value).toContain(
      "GENERATOR_PREVIEW_CREATE_FAILED",
    )
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
  })

  test("sends selected conflict strategy when refreshing preview", async () => {
    let submittedConflictStrategy: GeneratorPreviewConflictStrategy | undefined

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        submittedConflictStrategy = JSON.parse(
          String(init?.body ?? "{}"),
        ).conflictStrategy

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport({
              conflictStrategy: submittedConflictStrategy ?? "fail",
            }),
            session: createSession({
              conflictStrategy: submittedConflictStrategy ?? "fail",
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

    await waitForAsyncWork()

    enabled.value = true

    await waitForAsyncWork()

    expect(submittedConflictStrategy).toBe("overwrite-generated-only")
    expect(workspace.currentSession.value?.conflictStrategy).toBe(
      "overwrite-generated-only",
    )
  })

  test("accepts simplified manual schema when refreshing preview", async () => {
    let submittedSchemaName: string | undefined
    let submittedSourceValue: string | undefined

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "content-type": "application/json" },
          status: 200,
        })
      }

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        const body = JSON.parse(String(init?.body ?? "{}")) as {
          schemaName?: string
          sourceValue?: string
        }

        submittedSchemaName = body.schemaName
        submittedSourceValue = body.sourceValue

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport({
              schemaName: submittedSchemaName ?? "supplier",
            }),
            session: createSession({
              id: "preview-session-simplified",
              schemaName: submittedSchemaName ?? "supplier",
              sourceType: "manual-schema-json",
              sourceValue: submittedSourceValue ?? "",
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
    workspace.selectedInputMode.value = "manual-schema-json"
    workspace.manualSchemaDraft.value = JSON.stringify({
      name: "supplier",
      fields: [
        { key: "name", kind: "string", required: true },
        { key: "status", kind: "enum", options: ["active", "inactive"] },
      ],
    })
    enabled.value = true

    await waitForAsyncWork()

    expect(submittedSchemaName).toBe("supplier")
    expect(submittedSourceValue).toContain('"name":"supplier"')
    expect(workspace.manualSchemaDraftError.value).toBeNull()
    expect(workspace.currentSession.value?.schemaName).toBe("supplier")
  })

  test("loads schema templates into the manual draft", async () => {
    const { workspace } = createWorkspace()

    workspace.loadSchemaTemplate("with-status")

    expect(workspace.selectedInputMode.value).toBe("manual-schema-json")
    expect(workspace.manualSchemaDraft.value).toContain('"key": "status"')
    expect(workspace.manualSchemaDraft.value).toContain('"kind": "enum"')
  })

  test("exposes detailed validation guidance for invalid manual schema", async () => {
    const { workspace } = createWorkspace()

    workspace.selectedInputMode.value = "manual-schema-json"
    workspace.manualSchemaDraft.value = JSON.stringify({
      name: "supplier",
      fields: [
        {
          key: "status",
          kind: "enum",
        },
      ],
    })

    expect(workspace.manualSchemaDraftError.value).toContain(
      "app.generatorPreview.input.manualSchemaDraftInvalid",
    )
    expect(workspace.manualSchemaDraftError.value).toContain(
      "fields[1]: Enum field must provide non-empty options or dictionaryTypeCode.",
    )
    expect(workspace.manualSchemaDraftErrorDetails.value).toContain(
      "Schema validation failed with",
    )
    expect(workspace.manualSchemaDraftErrorDetails.value).toContain("options")
    expect(workspace.manualSchemaDraftErrorSuggestion.value).toBe(
      "app.generatorPreview.input.manualSchemaDraftSuggestionEnum",
    )
  })

  test("does not apply inconsistent preview response", async () => {
    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (url.endsWith("/studio/generator/sessions") && method === "GET") {
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
            report: createReport({ frontendTarget: "react" }),
            session: createSession({
              frontendTarget: "vue",
              id: "preview-session-inconsistent-response",
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

    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.errorMessage.value).toBe(
      "Generator session detail does not match its report",
    )
  })

  test("clears stale preview when refreshed response is inconsistent", async () => {
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport({ frontendTarget: "react" }),
            session: createSession({
              frontendTarget: "vue",
              id: "preview-session-inconsistent-refresh",
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

    const { workspace } = createWorkspace({ enabled: true })

    await waitForAsyncWork()
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")

    await workspace.refreshPreview()

    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
    expect(workspace.sqlPreview.value).toBeNull()
    expect(workspace.selectedRecentSessionId.value).toBe("")
    expect(workspace.errorMessage.value).toBe(
      "Generator session detail does not match its report",
    )
  })

  test("preserves current preview when same-context refresh fails", async () => {
    const recoverableErrors: unknown[] = []
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

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

    await waitForAsyncWork()

    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
    expect(workspace.filteredPreviewFiles.value).toHaveLength(1)
    expect(workspace.sqlPreview.value?.tableName).toBe("customers")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
    expect(workspace.sqlProposalHandoff.value?.proposalStatus).toBe("ready")
    expect(workspace.selectedFilePath.value).toBe("generated/customer.ts")

    await workspace.refreshPreview()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("unauthorized")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
    expect(workspace.filteredPreviewFiles.value).toHaveLength(1)
    expect(workspace.sqlPreview.value?.tableName).toBe("customers")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
    expect(workspace.selectedFilePath.value).toBe("generated/customer.ts")
  })

  test("preserves current preview without auth recovery when same-context refresh fails with non-auth error", async () => {
    const recoverableErrors: unknown[] = []
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_PREVIEW_CREATE_FAILED",
              message: "Generator preview create failed",
              status: 500,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({
      enabled: true,
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await waitForAsyncWork()

    expect(workspace.currentSession.value?.id).toBe("preview-session-1")

    await workspace.refreshPreview()

    expect(recoverableErrors).toHaveLength(0)
    expect(workspace.errorMessage.value).toContain(
      "GENERATOR_PREVIEW_CREATE_FAILED",
    )
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
    expect(workspace.filteredPreviewFiles.value).toHaveLength(1)
    expect(workspace.sqlPreview.value?.tableName).toBe("customers")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
    expect(workspace.selectedFilePath.value).toBe("generated/customer.ts")
  })

  test("clears current preview when same-context refresh reports missing schema", async () => {
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_SCHEMA_NOT_FOUND",
              message: "Generator schema not found",
              status: 404,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 404,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({ enabled: true })

    await waitForAsyncWork()
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")

    await workspace.refreshPreview()

    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
    expect(workspace.sqlPreview.value).toBeNull()
    expect(workspace.selectedRecentSessionId.value).toBe("")
    expect(workspace.errorMessage.value).toContain("GENERATOR_SCHEMA_NOT_FOUND")
  })

  test("clears current preview when context changes before refresh fails", async () => {
    const recoverableErrors: unknown[] = []
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

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

    await waitForAsyncWork()

    workspace.selectedFrontendTarget.value = "react"
    await waitForAsyncWork()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("unauthorized")
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
    expect(workspace.sqlPreview.value).toBeNull()
    expect(workspace.sqlProposal.value).toBeNull()
    expect(workspace.sqlProposalHandoff.value).toBeNull()
    expect(workspace.selectedFilePath.value).toBeNull()
  })

  test("clears current preview without auth recovery when context changes before refresh fails with non-auth error", async () => {
    const recoverableErrors: unknown[] = []
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

        return new Response(
          JSON.stringify({
            error: {
              code: "GENERATOR_PREVIEW_CREATE_FAILED",
              message: "Generator preview create failed",
              status: 500,
            },
          }),
          {
            headers: { "content-type": "application/json" },
            status: 500,
          },
        )
      }

      return new Response("not found", { status: 404 })
    }) as typeof fetch

    const { workspace } = createWorkspace({
      enabled: true,
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    await waitForAsyncWork()

    workspace.selectedFrontendTarget.value = "react"
    await waitForAsyncWork()

    expect(recoverableErrors).toHaveLength(0)
    expect(workspace.errorMessage.value).toContain(
      "GENERATOR_PREVIEW_CREATE_FAILED",
    )
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
    expect(workspace.sqlPreview.value).toBeNull()
    expect(workspace.sqlProposal.value).toBeNull()
    expect(workspace.sqlProposalHandoff.value).toBeNull()
    expect(workspace.selectedFilePath.value).toBeNull()
  })

  test("clears current preview when conflict strategy changes before refresh fails", async () => {
    const recoverableErrors: unknown[] = []
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        if (previewRequestCount === 1) {
          return new Response(
            JSON.stringify({
              diff: createDiffSummary(),
              report: createReport(),
              session: createSession(),
              sqlProposal: createSqlProposal(),
              sqlProposalHandoff: createSqlProposalHandoff(),
            }),
            {
              headers: { "content-type": "application/json" },
              status: 200,
            },
          )
        }

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

    await waitForAsyncWork()

    workspace.selectedConflictStrategy.value = "overwrite"
    await waitForAsyncWork()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
  })

  test("does not start another preview refresh while loading", async () => {
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession(),
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

    const { workspace } = createWorkspace({
      enabled: true,
    })

    workspace.loading.value = true
    await workspace.refreshPreview()

    expect(previewRequestCount).toBe(0)
  })

  test("does not refresh preview context while apply is in progress", async () => {
    let previewRequestCount = 0

    globalThis.fetch = (async (input, init) => {
      const url = String(input)
      const method = init?.method ?? "GET"

      if (
        url.endsWith("/studio/generator/sessions/preview") &&
        method === "POST"
      ) {
        previewRequestCount += 1

        return new Response(
          JSON.stringify({
            diff: createDiffSummary(),
            report: createReport(),
            session: createSession(),
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

    const { workspace } = createWorkspace({
      enabled: true,
    })

    await waitForAsyncWork()
    expect(previewRequestCount).toBe(1)

    workspace.applyLoading.value = true
    workspace.selectedFrontendTarget.value = "react"
    await waitForAsyncWork()

    expect(previewRequestCount).toBe(1)
    expect(workspace.currentSession.value?.frontendTarget).toBe("vue")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
  })
})
