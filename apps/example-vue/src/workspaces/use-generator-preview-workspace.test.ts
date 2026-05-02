import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReport,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
} from "../lib/platform-api"
import { useGeneratorPreviewWorkspace } from "./use-generator-preview-workspace"

const originalFetch = globalThis.fetch

const createDiffSummary = (): GeneratorPreviewDiffSummary => ({
  actionCounts: {
    block: 0,
    create: 1,
    overwrite: 0,
    skip: 0,
  },
  changedFileCount: 1,
  totalFileCount: 1,
  unchangedFileCount: 0,
})

const createReport = (): GeneratorPreviewReport => ({
  conflictStrategy: "fail",
  databaseChangePlan: {
    operations: [],
  },
  files: [
    {
      absolutePath: "E:/Github/Elysian/generated/customer.ts",
      contents: "export const customer = true\n",
      currentContents: null,
      exists: false,
      hasChanges: true,
      isManaged: true,
      mergeStrategy: "create",
      path: "generated/customer.ts",
      plannedAction: "create",
      plannedReason: "new file",
      reason: "new file",
    },
  ],
  frontendTarget: "vue",
  generatedAt: "2026-05-02T12:00:00.000Z",
  outputDir: "generated",
  schemaName: "customer",
  sqlPreview: {
    contents: "create table customers (...);",
    tableName: "customers",
  },
  targetPreset: "staging",
})

const createSqlProposal = () => ({
  canonicalMigrationOwner: "packages/persistence" as const,
  dialect: "postgresql" as const,
  drizzleImportSnippet:
    'import { pgTable, text, uuid } from "drizzle-orm/pg-core"',
  drizzleSchemaSnippet:
    'export const customers = pgTable("customers", { id: uuid("id").primaryKey() })',
  operationCount: 1,
  risks: [
    {
      code: "review-required" as const,
      message: "Review manually.",
      severity: "warning" as const,
    },
  ],
  sourceSchemaName: "customer",
  sqlDraft: "create table customers (...);",
  tableName: "customers",
})

const createSqlProposalHandoff = () => ({
  canonicalMigrationOwner: "packages/persistence" as const,
  proposalStatus: "ready" as const,
  reviewMode: "manual" as const,
  sourceSchemaName: "customer",
  suggestedCommands: ["bun run db:generate", "bun run db:migrate"],
  steps: ["Review draft", "Update schema", "Run migration"],
  targetPaths: {
    drizzleDir: "packages/persistence/drizzle",
    persistenceIndexFile: "packages/persistence/src/index.ts",
    schemaDir: "packages/persistence/src/schema",
    schemaIndexFile: "packages/persistence/src/schema/index.ts",
  },
  unsupportedReason: null,
})

const createSession = (
  overrides?: Partial<GeneratorPreviewSessionRecord>,
): GeneratorPreviewSessionRecord => ({
  actorDisplayName: "Admin",
  actorUserId: "user-1",
  actorUsername: "admin",
  appliedAt: null,
  appliedByDisplayName: null,
  appliedByUserId: null,
  appliedByUsername: null,
  appliedFileCount: null,
  applyEvidence: null,
  applyManifestPath: null,
  applyRequestId: null,
  conflictStrategy: "fail",
  createdAt: "2026-05-02T12:00:00.000Z",
  frontendTarget: "vue",
  hasBlockingConflicts: false,
  id: "preview-session-1",
  outputDir: "generated",
  previewFileCount: 1,
  reportPath: "generated/reports/preview-session-1.preview.json",
  reviewComment: null,
  reviewedAt: null,
  reviewedByDisplayName: null,
  reviewedByUserId: null,
  reviewedByUsername: null,
  reviewEvidence: null,
  schemaName: "customer",
  skippedFileCount: null,
  sourceType: "registered-schema",
  sourceValue: "customer",
  status: "pending_review",
  targetPreset: "staging",
  tenantId: null,
  ...overrides,
})

const createSessionDetail = (
  overrides?: Partial<GeneratorPreviewSessionDetail>,
): GeneratorPreviewSessionDetail => ({
  ...createSession(),
  diffSummary: createDiffSummary(),
  report: createReport(),
  sqlProposal: createSqlProposal(),
  sqlProposalHandoff: createSqlProposalHandoff(),
  ...overrides,
})

const createWorkspace = (options?: {
  enabled?: boolean
  onRecoverableAuthError?: (error: unknown) => void
}) => {
  const enabled = ref(options?.enabled ?? false)
  const workspace = useGeneratorPreviewWorkspace(
    (key, params) =>
      params
        ? `${key}:${Object.entries(params)
            .map(([name, value]) => `${name}=${String(value)}`)
            .join(",")}`
        : key,
    enabled,
    options?.onRecoverableAuthError ?? (() => {}),
  )

  return { enabled, workspace }
}

const waitForAsyncWork = () =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0)
  })

describe("useGeneratorPreviewWorkspace", () => {
  beforeEach(() => {
    setAccessToken("test-token")
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
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
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
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
    expect(workspace.recentSessionOptions.value[0]?.value).toBe("preview-session-2")

    await workspace.restorePreviewSession("preview-session-2")

    expect(workspace.currentSession.value?.id).toBe("preview-session-2")
    expect(workspace.selectedRecentSessionId.value).toBe("preview-session-2")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
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
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
    expect(workspace.filteredPreviewFiles.value).toHaveLength(1)
    expect(workspace.sqlPreview.value?.tableName).toBe("customers")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
    expect(workspace.selectedFilePath.value).toBe("generated/customer.ts")
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
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
    expect(workspace.filteredPreviewFiles.value).toHaveLength(0)
    expect(workspace.sqlPreview.value).toBeNull()
    expect(workspace.sqlProposal.value).toBeNull()
    expect(workspace.sqlProposalHandoff.value).toBeNull()
    expect(workspace.selectedFilePath.value).toBeNull()
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
      onRecoverableAuthError: (error) => {
        recoverableErrors.push(error)
      },
    })

    workspace.currentSession.value = createSession({ status: "ready" })
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.selectedFilePath.value = createReport().files[0]?.path ?? null

    await workspace.applyPreview()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
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

    const { workspace } = createWorkspace()
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
    expect(workspace.canApplyPreview.value).toBe(true)
    expect(workspace.canApprovePreview.value).toBe(false)
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
