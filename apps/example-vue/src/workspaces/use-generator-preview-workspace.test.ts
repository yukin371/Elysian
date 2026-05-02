import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReport,
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
  schemaName: "customer",
  skippedFileCount: null,
  sourceType: "registered-schema",
  sourceValue: "customer",
  status: "ready",
  targetPreset: "staging",
  tenantId: null,
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

    await new Promise((resolve) => {
      globalThis.setTimeout(resolve, 0)
    })

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value).toBeNull()
    expect(workspace.currentDiffSummary.value).toBeNull()
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

    workspace.currentSession.value = createSession()
    workspace.currentDiffSummary.value = createDiffSummary()
    workspace.selectedFilePath.value = createReport().files[0]?.path ?? null

    await workspace.applyPreview()

    expect(recoverableErrors).toHaveLength(1)
    expect(workspace.errorMessage.value).toContain("status 401")
    expect(workspace.currentSession.value?.id).toBe("preview-session-1")
    expect(workspace.currentDiffSummary.value?.changedFileCount).toBe(1)
  })
})
