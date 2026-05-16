import type { WorkflowDefinitionRecord } from "./types"

import { requestJson } from "./core"
export type { WorkflowDefinitionRecord } from "./types"

export interface WorkflowDefinitionsResponse {
  items: WorkflowDefinitionRecord[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface WorkflowDefinitionListQuery {
  q?: string
  status?: "active" | "disabled"
  page?: number
  pageSize?: number
}

export type GeneratorPreviewConflictStrategy =
  | "skip"
  | "overwrite"
  | "overwrite-generated-only"
  | "fail"

export type GeneratorPreviewPlannedAction =
  | "create"
  | "overwrite"
  | "skip"
  | "block"

export interface GeneratorPreviewDiffSummary {
  totalFileCount: number
  changedFileCount: number
  unchangedFileCount: number
  actionCounts: {
    create: number
    overwrite: number
    skip: number
    block: number
  }
}

export interface GeneratorPreviewApplyEvidence {
  sessionId: string
  reportPath: string
  manifestPath: string | null
  appliedAt: string | null
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  requestId: string | null
}

export type GeneratorPreviewRecoveryStatus =
  | "none"
  | "rebuilt-from-corrupt"
  | "rebuilt-from-missing"

export type GeneratorPreviewDriftStatus = "clean" | "stale" | "apply-conflict"

export type GeneratorPreviewBlockerReasonCode =
  | "review-required"
  | "rejected"
  | "blocking-conflicts"
  | "confirmation-required"

export interface GeneratorPreviewBlockerReason {
  code: GeneratorPreviewBlockerReasonCode
  message: string
  stage: "review" | "confirm" | "apply"
}

export interface GeneratorPreviewReviewEvidence {
  sessionId: string
  reportPath: string
  reviewedAt: string | null
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  comment: string | null
  decision: "approve" | "reject"
}

export interface GeneratorPreviewConfirmationEvidence {
  sessionId: string
  reportPath: string
  snapshotPath: string
  recoveryStatus: GeneratorPreviewRecoveryStatus
  archivedSnapshotPath: string | null
  confirmedAt: string | null
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  checklist: string[]
}

export interface GeneratorPreviewReportFile {
  absolutePath: string
  contents: string
  currentContents: string | null
  exists: boolean
  hasChanges: boolean
  isManaged: boolean | null
  mergeStrategy: string
  path: string
  plannedAction: GeneratorPreviewPlannedAction
  plannedReason: string
  reason: string
}

export interface GeneratorPreviewSqlPreview {
  tableName: string
  contents: string
}

export type GeneratorPreviewSqlProposalRiskCode =
  | "canonical-owner-mismatch"
  | "dictionary-review-required"
  | "enum-review-required"
  | "review-required"

export interface GeneratorPreviewSqlProposalRisk {
  code: GeneratorPreviewSqlProposalRiskCode
  message: string
  severity: "warning"
}

export interface GeneratorPreviewSqlProposal {
  canonicalMigrationOwner: "packages/persistence"
  dialect: "postgresql"
  drizzleImportSnippet: string
  drizzleSchemaSnippet: string
  operationCount: number
  risks: GeneratorPreviewSqlProposalRisk[]
  sourceSchemaName: string
  sqlDraft: string
  tableName: string
}

export interface GeneratorPreviewMigrationProposalSnapshot {
  generatedAt: string
  migrationProposalResolution: {
    proposal: GeneratorPreviewSqlProposal | null
    unsupportedReason: string | null
  }
  reportPath: string
  schemaName: string
  sessionId: string
  snapshotPath: string
}

export interface GeneratorPreviewMigrationProposalSnapshotRecovery {
  archivedSnapshotPath: string | null
  status: GeneratorPreviewRecoveryStatus
}

export interface GeneratorPreviewSqlProposalHandoff {
  proposalStatus: "ready" | "unsupported"
  reviewMode: "manual"
  canonicalMigrationOwner: "packages/persistence"
  confirmationChecklist: string[]
  migrationProposalSnapshotRecovery?: GeneratorPreviewMigrationProposalSnapshotRecovery | null
  migrationProposalSnapshot: GeneratorPreviewMigrationProposalSnapshot
  migrationProposalSnapshotPath: string
  targetPaths: {
    drizzleDir: string
    schemaDir: string
    schemaIndexFile: string
    persistenceIndexFile: string
  }
  steps: string[]
  suggestedCommands: string[]
  unsupportedReason: string | null
  sourceSchemaName: string
}

export interface GeneratorPreviewReport {
  conflictStrategy: GeneratorPreviewConflictStrategy
  databaseChangePlan: {
    operations: Array<Record<string, unknown>>
  }
  files: GeneratorPreviewReportFile[]
  frontendTarget: "vue" | "react"
  generatedAt: string
  outputDir: string
  schemaName: string
  sqlPreview: GeneratorPreviewSqlPreview
  targetPreset: "staging" | "custom"
}

export interface GeneratorPreviewSessionRecord {
  id: string
  actorDisplayName: string | null
  actorUserId: string | null
  actorUsername: string | null
  appliedAt: string | null
  appliedFileCount: number | null
  appliedByDisplayName: string | null
  appliedByUserId: string | null
  appliedByUsername: string | null
  applyManifestPath: string | null
  applyRequestId: string | null
  applyEvidence: GeneratorPreviewApplyEvidence | null
  conflictStrategy: GeneratorPreviewConflictStrategy
  createdAt: string
  frontendTarget: "vue" | "react"
  hasBlockingConflicts: boolean
  outputDir: string
  previewFileCount: number
  reportPath: string
  reviewComment: string | null
  reviewedAt: string | null
  reviewedByDisplayName: string | null
  reviewedByUserId: string | null
  reviewedByUsername: string | null
  reviewEvidence: GeneratorPreviewReviewEvidence | null
  confirmedAt: string | null
  confirmedByDisplayName: string | null
  confirmedByUserId: string | null
  confirmedByUsername: string | null
  confirmationEvidence: GeneratorPreviewConfirmationEvidence | null
  blockerReasons: GeneratorPreviewBlockerReason[]
  recoveryStatus: GeneratorPreviewRecoveryStatus
  driftStatus: GeneratorPreviewDriftStatus
  schemaName: string
  skippedFileCount: number | null
  sourceType: "registered-schema" | "manual-schema-json"
  sourceValue: string
  status: "pending_review" | "ready" | "rejected" | "applied"
  targetPreset: "staging" | "module" | "default"
  tenantId: string | null
}

export interface GeneratorPreviewSessionDetail
  extends GeneratorPreviewSessionRecord {
  diffSummary: GeneratorPreviewDiffSummary
  report: GeneratorPreviewReport
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
}

export interface GeneratorPreviewSessionsResponse {
  items: GeneratorPreviewSessionRecord[]
}

export interface CreateGeneratorPreviewSessionRequest {
  schemaName: string
  frontendTarget?: "vue" | "react"
  conflictStrategy?: GeneratorPreviewConflictStrategy
  sourceType?: "registered-schema" | "manual-schema-json"
  sourceValue?: string
  targetPreset?: "staging"
}

export interface CreateGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  diff: GeneratorPreviewDiffSummary
  report: GeneratorPreviewReport
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
}

export interface ReviewGeneratorPreviewSessionRequest {
  decision: "approve" | "reject"
  comment?: string
}

export interface ReviewGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  diff: GeneratorPreviewDiffSummary
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
}

export interface ConfirmGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
}

export interface ConfirmGeneratorPreviewSessionRequest {
  displayedRecoveryStatus: GeneratorPreviewRecoveryStatus
  displayedSnapshotPath: string
}

export interface AppliedGeneratorPreviewFile {
  absolutePath: string
  mergeStrategy: string
  path: string
  reason: string
  written: boolean
}

export interface ApplyGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  diff: GeneratorPreviewDiffSummary
  sqlProposal: GeneratorPreviewSqlProposal | null
  sqlProposalHandoff: GeneratorPreviewSqlProposalHandoff
  apply: {
    files: AppliedGeneratorPreviewFile[]
    evidence: GeneratorPreviewApplyEvidence | null
    manifestPath: string | null
  }
}

interface ExampleApiOverrides {
  workflowDefinitions?: WorkflowDefinitionRecord[]
}

declare global {
  var __ELYSIAN_EXAMPLE_API_OVERRIDES__: ExampleApiOverrides | undefined
}

export const listGeneratorPreviewSessions =
  async (): Promise<GeneratorPreviewSessionsResponse> =>
    requestJson<GeneratorPreviewSessionsResponse>(
      "/studio/generator/sessions",
      {
        auth: true,
      },
    )

export const fetchGeneratorPreviewSession = async (
  id: string,
): Promise<GeneratorPreviewSessionDetail> =>
  requestJson<GeneratorPreviewSessionDetail>(
    `/studio/generator/sessions/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createGeneratorPreviewSession = async (
  input: CreateGeneratorPreviewSessionRequest,
): Promise<CreateGeneratorPreviewSessionResponse> =>
  requestJson<CreateGeneratorPreviewSessionResponse>(
    "/studio/generator/sessions/preview",
    {
      method: "POST",
      body: input,
      auth: true,
    },
  )

export const applyGeneratorPreviewSession = async (
  id: string,
): Promise<ApplyGeneratorPreviewSessionResponse> =>
  requestJson<ApplyGeneratorPreviewSessionResponse>(
    `/studio/generator/sessions/${encodeURIComponent(id)}/apply`,
    {
      method: "POST",
      auth: true,
    },
  )

export const reviewGeneratorPreviewSession = async (
  id: string,
  input: ReviewGeneratorPreviewSessionRequest,
): Promise<ReviewGeneratorPreviewSessionResponse> =>
  requestJson<ReviewGeneratorPreviewSessionResponse>(
    `/studio/generator/sessions/${encodeURIComponent(id)}/review`,
    {
      method: "POST",
      body: input,
      auth: true,
    },
  )

export const confirmGeneratorPreviewSession = async (
  id: string,
  input: ConfirmGeneratorPreviewSessionRequest,
): Promise<ConfirmGeneratorPreviewSessionResponse> =>
  requestJson<ConfirmGeneratorPreviewSessionResponse>(
    `/studio/generator/sessions/${encodeURIComponent(id)}/confirm`,
    {
      method: "POST",
      body: input,
      auth: true,
    },
  )

const readWorkflowDefinitionOverrides = () => {
  return (
    globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__?.workflowDefinitions ?? null
  )
}

export const fetchWorkflowDefinitions = async (
  query: WorkflowDefinitionListQuery = {},
): Promise<WorkflowDefinitionsResponse> => {
  const overrides = readWorkflowDefinitionOverrides()

  if (overrides) {
    const pageSize =
      typeof query.pageSize === "number" && Number.isFinite(query.pageSize)
        ? Math.min(100, Math.max(1, Math.trunc(query.pageSize)))
        : overrides.length > 0
          ? 20
          : 20
    const page =
      typeof query.page === "number" && Number.isFinite(query.page)
        ? Math.max(1, Math.trunc(query.page))
        : 1
    const filtered = overrides.filter((definition) => {
      const normalizedQuery = query.q?.trim().toLowerCase()
      const matchesQuery =
        !normalizedQuery ||
        definition.name.toLowerCase().includes(normalizedQuery) ||
        definition.key.toLowerCase().includes(normalizedQuery) ||
        definition.id.toLowerCase().includes(normalizedQuery)
      const matchesStatus = !query.status || definition.status === query.status

      return matchesQuery && matchesStatus
    })
    const total = filtered.length
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
    const resolvedPage = Math.min(page, totalPages)
    const items = filtered.slice(
      (resolvedPage - 1) * pageSize,
      resolvedPage * pageSize,
    )

    return {
      items,
      page: resolvedPage,
      pageSize,
      total,
      totalPages,
    }
  }

  const searchParams = new URLSearchParams()

  if (query.q?.trim()) {
    searchParams.set("q", query.q.trim())
  }

  if (query.status) {
    searchParams.set("status", query.status)
  }

  if (typeof query.page === "number") {
    searchParams.set("page", String(Math.trunc(query.page)))
  }

  if (typeof query.pageSize === "number") {
    searchParams.set("pageSize", String(Math.trunc(query.pageSize)))
  }

  const queryString = searchParams.toString()

  const payload = await requestJson<Partial<WorkflowDefinitionsResponse>>(
    `/workflow/definitions${queryString ? `?${queryString}` : ""}`,
    {
      auth: true,
    },
  )

  return normalizeWorkflowDefinitionsResponse(payload, query)
}

const normalizeWorkflowDefinitionsResponse = (
  payload: Partial<WorkflowDefinitionsResponse>,
  query: WorkflowDefinitionListQuery,
): WorkflowDefinitionsResponse => {
  const items = Array.isArray(payload.items) ? payload.items : []
  const pageSize =
    typeof payload.pageSize === "number" && Number.isFinite(payload.pageSize)
      ? payload.pageSize
      : typeof query.pageSize === "number" && Number.isFinite(query.pageSize)
        ? Math.max(1, Math.trunc(query.pageSize))
        : items.length > 0
          ? items.length
          : 20
  const total =
    typeof payload.total === "number" && Number.isFinite(payload.total)
      ? payload.total
      : items.length
  const totalPages =
    typeof payload.totalPages === "number" &&
    Number.isFinite(payload.totalPages)
      ? payload.totalPages
      : total === 0
        ? 1
        : Math.ceil(total / pageSize)
  const page =
    typeof payload.page === "number" && Number.isFinite(payload.page)
      ? payload.page
      : typeof query.page === "number" && Number.isFinite(query.page)
        ? Math.min(Math.max(1, Math.trunc(query.page)), totalPages)
        : 1

  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
  }
}

export const fetchWorkflowDefinitionById = async (
  id: string,
): Promise<WorkflowDefinitionRecord> => {
  const overrides = readWorkflowDefinitionOverrides()

  if (overrides) {
    const definition = overrides.find(
      (item: WorkflowDefinitionRecord) => item.id === id,
    )

    if (definition) {
      return definition
    }
  }

  return requestJson<WorkflowDefinitionRecord>(`/workflow/definitions/${id}`, {
    auth: true,
  })
}
