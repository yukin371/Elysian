import { describe, expect, test } from "bun:test"

import { toGeneratorPreviewFileCard } from "../../../lib/generator-preview-workspace"
import type { GeneratorPreviewReportFile } from "../../../lib/platform-api/workflow"
import type { GeneratorPreviewSqlProposalHandoff } from "./types"
import {
  type GeneratorPreviewWorkspaceMainEmit,
  type GeneratorPreviewWorkspaceMainProps,
  useGeneratorPreviewWorkspaceMainState,
} from "./use-generator-preview-workspace-main-state"

const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key} ${JSON.stringify(params)}` : key

const createSqlProposalHandoff = (
  overrides: Partial<GeneratorPreviewSqlProposalHandoff> = {},
): GeneratorPreviewSqlProposalHandoff => ({
  canonicalMigrationOwner: "packages/persistence",
  confirmationChecklist: [],
  migrationProposalSnapshot: {
    generatedAt: "2026-05-10T00:00:00.000Z",
    migrationProposalResolution: {
      proposal: null,
      unsupportedReason: null,
    },
    reportPath: "reports/session-1.json",
    schemaName: "supplier",
    sessionId: "session-1",
    snapshotPath: "reports/session-1.migration-proposal.json",
  },
  migrationProposalSnapshotPath: "reports/session-1.migration-proposal.json",
  proposalStatus: "ready",
  reviewMode: "manual",
  sourceSchemaName: "supplier",
  steps: [],
  suggestedCommands: [],
  targetPaths: {
    drizzleDir: "packages/persistence/src/drizzle",
    persistenceIndexFile: "packages/persistence/src/index.ts",
    schemaDir: "packages/persistence/src/schema",
    schemaIndexFile: "packages/persistence/src/schema/index.ts",
  },
  unsupportedReason: null,
  ...overrides,
})

const createFileCard = (overrides: Partial<GeneratorPreviewReportFile> = {}) =>
  toGeneratorPreviewFileCard({
    absolutePath:
      "E:/Github/Elysian/apps/example-vue/src/routes/supplier/index.ts",
    contents: "export const supplier = true\n",
    currentContents: null,
    exists: false,
    hasChanges: true,
    isManaged: true,
    mergeStrategy: "create",
    path: "apps/example-vue/src/routes/supplier/index.ts",
    plannedAction: "create",
    plannedReason: "new file",
    reason: "new file",
    ...overrides,
  })

const createProps = (
  overrides: Partial<GeneratorPreviewWorkspaceMainProps> = {},
): GeneratorPreviewWorkspaceMainProps => ({
  t,
  loading: false,
  reviewLoading: false,
  applyLoading: false,
  errorMessage: "",
  schemaOptions: [],
  conflictStrategyOptions: [],
  selectedInputMode: "manual-schema-json",
  selectedConflictStrategy: "fail",
  recentSessionOptions: [],
  selectedRecentSessionId: "session-1",
  selectedSchemaName: "supplier",
  selectedFrontendTarget: "vue",
  currentStep: "review",
  manualSchemaDraft: "",
  manualSchemaDraftError: null,
  manualSchemaDraftErrorDetails: null,
  manualSchemaDraftErrorSuggestion: null,
  query: "",
  files: [],
  selectedFilePath: null,
  canApprove: true,
  canReject: true,
  canApply: false,
  canConfirm: false,
  diffSummary: null,
  sqlProposalHandoff: null,
  sessionStatus: "pending_review",
  reviewEvidence: null,
  applyEvidence: null,
  hasBlockingConflicts: false,
  ...overrides,
})

describe("useGeneratorPreviewWorkspaceMainState review actions", () => {
  test("requires a rejection reason before submitting reject", () => {
    const emitted: Array<{ event: string; value?: unknown }> = []
    const state = useGeneratorPreviewWorkspaceMainState(createProps(), ((
      event: string,
      value?: unknown,
    ) => {
      emitted.push({ event, value })
    }) as GeneratorPreviewWorkspaceMainEmit)

    state.handleReviewPreview("reject")

    expect(state.isRejectConfirming.value).toBe(true)
    expect(state.rejectCommentRequired.value).toBe(true)
    expect(state.canSubmitReject.value).toBe(false)

    state.handleReviewPreview("reject")

    expect(emitted).toEqual([])
  })

  test("submits reject after a reason is provided", () => {
    const emitted: Array<{ event: string; value?: unknown }> = []
    const state = useGeneratorPreviewWorkspaceMainState(createProps(), ((
      event: string,
      value?: unknown,
    ) => {
      emitted.push({ event, value })
    }) as GeneratorPreviewWorkspaceMainEmit)

    state.handleReviewPreview("reject")
    state.handleReviewCommentInput("字段语义不清，需要补状态字段。")
    state.handleReviewPreview("reject")

    expect(state.rejectCommentRequired.value).toBe(false)
    expect(state.canSubmitReject.value).toBe(true)
    expect(emitted).toEqual([
      {
        event: "review-preview",
        value: {
          comment: "字段语义不清，需要补状态字段。",
          decision: "reject",
        },
      },
    ])
  })
})

describe("useGeneratorPreviewWorkspaceMainState status facts", () => {
  test("shows conflict strategy and target in status facts", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        conflictStrategyOptions: [
          { label: "跳过已有文件", value: "skip" },
          { label: "遇冲突停止", value: "fail" },
        ],
        selectedConflictStrategy: "skip",
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.statusFacts.value).toEqual([
      {
        label: "app.generatorPreview.filter.schemaLabel",
        value: "supplier",
      },
      {
        label: "app.generatorPreview.meta.frontendTarget",
        value: "Vue",
      },
      {
        label: "app.generatorPreview.meta.status",
        value: "app.generatorPreview.status.pendingReview",
      },
      {
        label: "app.generatorPreview.statsHint",
        value: "0",
      },
      {
        label: "app.generatorPreview.filter.conflictLabel",
        value: "跳过已有文件",
      },
      {
        label: "app.generatorPreview.meta.targetPreset",
        value: "staging",
      },
    ])
  })

  test("exposes the first blocked file for quick recovery", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        files: [
          createFileCard({
            path: "apps/example-vue/src/routes/supplier/index.ts",
            plannedAction: "overwrite",
            mergeStrategy: "overwrite",
            reason: "managed file",
            plannedReason: "managed file",
            exists: true,
            currentContents: "export const supplier = false\n",
          }),
          createFileCard({
            path: "apps/example-vue/src/routes/supplier/detail.ts",
            plannedAction: "block",
            mergeStrategy: "fail",
            reason: "manual edits found",
            plannedReason: "manual edits found",
            exists: true,
            currentContents: "export const supplierDetail = false\n",
          }),
          createFileCard({
            path: "apps/example-vue/src/routes/supplier/list.ts",
            plannedAction: "block",
            mergeStrategy: "fail",
            reason: "manual edits found",
            plannedReason: "manual edits found",
            exists: true,
            currentContents: "export const supplierList = false\n",
          }),
        ],
        hasBlockingConflicts: true,
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.blockedFileCount.value).toBe(2)
    expect(state.firstBlockedFilePath.value).toBe(
      "apps/example-vue/src/routes/supplier/detail.ts",
    )
  })

  test("builds actionable recovery steps for schema validation errors", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        errorMessage:
          'app.generatorPreview.input.manualSchemaDraftInvalid {"value":"fields[0].kind"}',
        manualSchemaDraftError:
          'app.generatorPreview.input.manualSchemaDraftInvalid {"value":"fields[0].kind"}',
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.configErrorRecoverySteps.value).toEqual([
      "app.generatorPreview.errorRecoveryStep.fixSchema",
      "app.generatorPreview.errorRecoveryStep.retryPreview",
      "app.generatorPreview.errorRecoveryStep.manualReview",
    ])
  })

  test("adds conflict-strategy guidance when the failure points to blocking conflicts", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        errorMessage: "Blocking conflict found in existing files",
        hasBlockingConflicts: true,
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.configErrorRecoverySteps.value).toEqual([
      "app.generatorPreview.errorRecoveryStep.changeConflictStrategy",
      "app.generatorPreview.errorRecoveryStep.retryPreview",
      "app.generatorPreview.errorRecoveryStep.manualReview",
    ])
  })

  test("describes the current long-running stage while regenerating", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        files: [
          createFileCard({
            path: "apps/example-vue/src/routes/supplier/index.ts",
            plannedAction: "create",
            mergeStrategy: "create",
            reason: "new file",
          }),
        ],
        loading: true,
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.operationProgressMessage.value).toEqual({
      description: "app.generatorPreview.progress.generatingDescription",
      title: "app.generatorPreview.progress.regeneratingTitle",
    })
  })

  test("describes confirmation progress separately from review and apply", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        currentStep: "confirm",
        reviewLoading: true,
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.operationProgressMessage.value).toEqual({
      description: "app.generatorPreview.progress.confirmingDescription",
      title: "app.generatorPreview.progress.confirmingTitle",
    })
  })

  test("builds result recovery steps for stale apply failures", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        currentStep: "apply",
        errorMessage: "Generator session stale because target files drifted",
        files: [
          createFileCard({
            path: "apps/example-vue/src/routes/supplier/index.ts",
            plannedAction: "overwrite",
            mergeStrategy: "overwrite",
            reason: "managed file",
            plannedReason: "managed file",
            exists: true,
            currentContents: "export const supplier = false\n",
          }),
        ],
        sessionStatus: "ready",
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.resultErrorRecoverySteps.value).toEqual([
      "app.generatorPreview.resultRecoveryStep.refreshDrift",
      "app.generatorPreview.resultRecoveryStep.recheckChecklist",
      "app.generatorPreview.resultRecoveryStep.restoreSession",
      "app.generatorPreview.resultRecoveryStep.regenerate",
    ])
  })

  test("prioritizes blocked-file recovery when current result still has blocking conflicts", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        errorMessage: "blocking conflict prevents apply",
        files: [
          createFileCard({
            path: "apps/example-vue/src/routes/supplier/detail.ts",
            plannedAction: "block",
            mergeStrategy: "fail",
            reason: "manual edits found",
            plannedReason: "manual edits found",
            exists: true,
            currentContents: "export const supplierDetail = false\n",
          }),
        ],
        hasBlockingConflicts: true,
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.resultErrorRecoverySteps.value).toEqual([
      "app.generatorPreview.resultRecoveryStep.reviewBlockedFiles",
      "app.generatorPreview.resultRecoveryStep.recheckChecklist",
      "app.generatorPreview.resultRecoveryStep.restoreSession",
      "app.generatorPreview.resultRecoveryStep.regenerate",
    ])
  })

  test("restores the current result from the result recovery block", () => {
    const emitted: Array<{ event: string; value?: unknown }> = []
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        errorMessage: "Generator session stale because target files drifted",
        sessionStatus: "ready",
      }),
      ((event: string, value?: unknown) => {
        emitted.push({ event, value })
      }) as GeneratorPreviewWorkspaceMainEmit,
    )

    state.handleRestoreCurrentResult()

    expect(emitted).toEqual([{ event: "restore-current-result" }])
  })

  test("regenerates from the current result without opening reject confirmation", () => {
    const emitted: Array<{ event: string; value?: unknown }> = []
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        errorMessage: "Generator session stale because target files drifted",
        sessionStatus: "ready",
      }),
      ((event: string, value?: unknown) => {
        emitted.push({ event, value })
      }) as GeneratorPreviewWorkspaceMainEmit,
    )

    state.handleReviewPreview("reject")
    state.handleRefreshPreview()

    expect(state.isRejectConfirming.value).toBe(false)
    expect(emitted).toEqual([{ event: "refresh-preview" }])
  })
})

describe("useGeneratorPreviewWorkspaceMainState confirmation checklist", () => {
  test("summarizes file actions, target, conflict strategy, and SQL proposal before apply", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        canConfirm: true,
        conflictStrategyOptions: [
          { label: "仅覆盖生成文件", value: "overwrite-generated-only" },
        ],
        currentStep: "confirm",
        diffSummary: {
          actionCounts: {
            block: 0,
            create: 3,
            overwrite: 1,
            skip: 2,
          },
          changedFileCount: 4,
          totalFileCount: 6,
          unchangedFileCount: 2,
        },
        selectedConflictStrategy: "overwrite-generated-only",
        sessionStatus: "ready",
        sqlProposalHandoff: createSqlProposalHandoff(),
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.confirmationChecklist.value).toEqual([
      'app.generatorPreview.checklist.fileActions {"block":0,"changed":4,"create":3,"overwrite":1,"skip":2,"total":6}',
      "app.generatorPreview.checklist.conflictClear",
      "app.generatorPreview.checklist.targetStaging",
      'app.generatorPreview.checklist.conflictStrategy {"value":"仅覆盖生成文件"}',
      "app.generatorPreview.checklist.sqlProposalReady",
      "app.generatorPreview.checklist.manualConfirmation",
    ])
  })

  test("keeps checklist hidden outside confirm or apply steps", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        currentStep: "review",
        sqlProposalHandoff: createSqlProposalHandoff(),
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.confirmationChecklist.value).toEqual([])
  })
})

describe("useGeneratorPreviewWorkspaceMainState draft summary", () => {
  test("summarizes current draft mode, field count, frontend, and conflict strategy", () => {
    const state = useGeneratorPreviewWorkspaceMainState(
      createProps({
        conflictStrategyOptions: [
          { label: "覆盖已有文件", value: "overwrite" },
        ],
        manualSchemaDraft: JSON.stringify({
          fields: [
            { key: "id", kind: "id", required: true },
            { key: "name", kind: "string", required: true },
            { key: "status", kind: "enum", options: ["active"] },
          ],
          label: "供应商",
          name: "supplier",
        }),
        selectedConflictStrategy: "overwrite",
        selectedFrontendTarget: "react",
      }),
      (() => {}) as GeneratorPreviewWorkspaceMainEmit,
    )

    expect(state.draftSummaryFacts.value).toEqual([
      {
        label: "app.generatorPreview.inputModeLabel",
        value: "app.generatorPreview.draftSource.template",
      },
      {
        label: "app.generatorPreview.input.schemaFieldCountLabel",
        value: "3",
      },
      {
        label: "app.generatorPreview.filter.frontendLabel",
        value: "React",
      },
      {
        label: "app.generatorPreview.filter.conflictLabel",
        value: "覆盖已有文件",
      },
    ])
  })
})
