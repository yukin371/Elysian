import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type {
  GeneratorPreviewConflictStrategy,
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReport,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
} from "../lib/platform-api"
import { useGeneratorPreviewWorkspace } from "./use-generator-preview-workspace"

const originalFetch = globalThis.fetch
const originalLocalStorage = globalThis.localStorage

const createLocalStorage = () => {
  const entries = new Map<string, string>()

  return {
    clear: () => {
      entries.clear()
    },
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value)
    },
    get length() {
      return entries.size
    },
  } satisfies Storage
}

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

const createReport = (
  overrides?: Partial<GeneratorPreviewReport>,
): GeneratorPreviewReport => ({
  conflictStrategy: overrides?.conflictStrategy ?? "fail",
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
  frontendTarget: overrides?.frontendTarget ?? "vue",
  generatedAt: "2026-05-02T12:00:00.000Z",
  outputDir: "generated",
  schemaName: overrides?.schemaName ?? "customer",
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
): GeneratorPreviewSessionDetail => {
  const session = {
    ...createSession(),
    ...overrides,
  }

  return {
    ...session,
    diffSummary: overrides?.diffSummary ?? createDiffSummary(),
    report:
      overrides?.report ??
      createReport({
        conflictStrategy: session.conflictStrategy,
        frontendTarget: session.frontendTarget,
        schemaName: session.schemaName,
      }),
    sqlProposal: overrides?.sqlProposal ?? createSqlProposal(),
    sqlProposalHandoff:
      overrides?.sqlProposalHandoff ?? createSqlProposalHandoff(),
  }
}

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
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: createLocalStorage(),
      writable: true,
    })
  })

  afterEach(() => {
    clearAccessToken()
    globalThis.fetch = originalFetch
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
      writable: true,
    })
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
    expect(workspace.recentSessionOptions.value[0]?.value).toBe("preview-session-2")

    await workspace.restorePreviewSession("preview-session-2")

    expect(workspace.currentSession.value?.id).toBe("preview-session-2")
    expect(workspace.selectedRecentSessionId.value).toBe("preview-session-2")
    expect(workspace.selectedFrontendTarget.value).toBe("react")
    expect(workspace.sqlProposal.value?.tableName).toBe("customers")
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
        url.endsWith("/studio/generator/sessions/preview-session-match-pending") &&
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
        url.endsWith("/studio/generator/sessions/preview-session-match-ready") &&
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

  test("updates recent sessions locally after preview review and apply", async () => {
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
        url.endsWith("/studio/generator/sessions/preview-session-created/review") &&
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
                reportPath: "generated/reports/preview-session-created.preview.json",
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
        url.endsWith("/studio/generator/sessions/preview-session-created/apply") &&
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
                manifestPath: "generated/manifests/preview-session-created.json",
                reportPath: "generated/reports/preview-session-created.preview.json",
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
                manifestPath: "generated/manifests/preview-session-created.json",
                reportPath: "generated/reports/preview-session-created.preview.json",
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
        url.endsWith("/studio/generator/sessions/preview-session-inconsistent") &&
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
            report: createReport(),
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
    enabled.value = true

    await waitForAsyncWork()

    expect(submittedConflictStrategy).toBe("overwrite-generated-only")
    expect(workspace.currentSession.value?.conflictStrategy).toBe(
      "overwrite-generated-only",
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
