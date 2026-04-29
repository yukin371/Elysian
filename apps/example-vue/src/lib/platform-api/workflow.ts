import type { WorkflowDefinitionRecord } from "@elysian/schema"

import { requestJson } from "./core"

export interface WorkflowDefinitionsResponse {
  items: WorkflowDefinitionRecord[]
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
  schemaName: string
  skippedFileCount: number | null
  sourceType: "registered-schema"
  sourceValue: string
  status: "ready" | "applied"
  targetPreset: "staging"
  tenantId: string | null
}

export interface GeneratorPreviewSessionDetail
  extends GeneratorPreviewSessionRecord {
  diffSummary: GeneratorPreviewDiffSummary
  report: GeneratorPreviewReport
}

export interface GeneratorPreviewSessionsResponse {
  items: GeneratorPreviewSessionRecord[]
}

export interface CreateGeneratorPreviewSessionRequest {
  schemaName: string
  frontendTarget?: "vue" | "react"
  conflictStrategy?: GeneratorPreviewConflictStrategy
  targetPreset?: "staging"
}

export interface CreateGeneratorPreviewSessionResponse {
  session: GeneratorPreviewSessionRecord
  diff: GeneratorPreviewDiffSummary
  report: GeneratorPreviewReport
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

const readWorkflowDefinitionOverrides = () => {
  return (
    globalThis.__ELYSIAN_EXAMPLE_API_OVERRIDES__?.workflowDefinitions ?? null
  )
}

export const fetchWorkflowDefinitions =
  async (): Promise<WorkflowDefinitionsResponse> => {
    const overrides = readWorkflowDefinitionOverrides()

    if (overrides) {
      return {
        items: overrides,
      }
    }

    return requestJson<WorkflowDefinitionsResponse>("/workflow/definitions", {
      auth: true,
    })
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
