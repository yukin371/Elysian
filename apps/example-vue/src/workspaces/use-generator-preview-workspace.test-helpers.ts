import { ref } from "vue"

import { clearAccessToken, setAccessToken } from "../lib/platform-api"
import type {
  GeneratorPreviewDiffSummary,
  GeneratorPreviewReport,
  GeneratorPreviewSessionDetail,
  GeneratorPreviewSessionRecord,
  GeneratorPreviewSqlProposalHandoff,
} from "../lib/platform-api"
import { useGeneratorPreviewWorkspace } from "./use-generator-preview-workspace"

const originalFetch = globalThis.fetch
const originalLocalStorage = globalThis.localStorage

export const createLocalStorage = () => {
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

export const installGeneratorPreviewWorkspaceTestEnv = () => {
  setAccessToken("test-token")
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: createLocalStorage(),
    writable: true,
  })
}

export const restoreGeneratorPreviewWorkspaceTestEnv = () => {
  clearAccessToken()
  globalThis.fetch = originalFetch
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: originalLocalStorage,
    writable: true,
  })
}

export const createDiffSummary = (): GeneratorPreviewDiffSummary => ({
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

export const createReport = (
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

export const createSqlProposal = () => ({
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

export const createSqlProposalHandoff =
  (): GeneratorPreviewSqlProposalHandoff => ({
    canonicalMigrationOwner: "packages/persistence" as const,
    confirmationChecklist: [
      "Review the SQL draft.",
      "Review the target-directory diff.",
      "Run db:generate before db:migrate.",
    ],
    migrationProposalSnapshotPath:
      "/tmp/generator-session-report/customer.migration-proposal.json",
    migrationProposalSnapshotRecovery: {
      archivedSnapshotPath: null,
      status: "none",
    },
    migrationProposalSnapshot: {
      generatedAt: "2026-05-03T00:00:00.000Z",
      migrationProposalResolution: {
        proposal: {
          canonicalMigrationOwner: "packages/persistence",
          dialect: "postgresql",
          drizzleImportSnippet: 'import { pgTable } from "drizzle-orm/pg-core"',
          drizzleSchemaSnippet:
            'export const customers = pgTable("customers", {})',
          operationCount: 1,
          risks: [],
          sourceSchemaName: "customer",
          sqlDraft: "CREATE TABLE customers ();",
          tableName: "customers",
        },
        unsupportedReason: null,
      },
      reportPath: "/tmp/generator-session-report/customer.preview.json",
      schemaName: "customer",
      sessionId: "session-1",
      snapshotPath:
        "/tmp/generator-session-report/customer.migration-proposal.json",
    },
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

export const createSession = (
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
  confirmedAt: null,
  confirmedByDisplayName: null,
  confirmedByUserId: null,
  confirmedByUsername: null,
  confirmationEvidence: null,
  blockerReasons: [],
  recoveryStatus: "none",
  driftStatus: "clean",
  schemaName: "customer",
  skippedFileCount: null,
  sourceType: "manual-schema-json",
  sourceValue:
    '{"name":"customer","label":"客户","fields":[{"key":"id","label":"ID","kind":"id","required":true}]}',
  status: "pending_review",
  targetPreset: "staging",
  tenantId: null,
  ...overrides,
})

export const createSessionDetail = (
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

export const createWorkspace = (options?: {
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

  workspace.loadSelectedSchemaDraft()

  return { enabled, workspace }
}

export const waitForAsyncWork = () =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, 0)
  })
