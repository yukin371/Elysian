import { t } from "elysia"

const sessionStatusSchema = t.Union([
  t.Literal("pending_review"),
  t.Literal("ready"),
  t.Literal("rejected"),
  t.Literal("applied"),
])

const frontendTargetSchema = t.Union([t.Literal("vue"), t.Literal("react")])
const generatorPreviewSourceTypeSchema = t.Union([
  t.Literal("registered-schema"),
  t.Literal("manual-schema-json"),
])

const conflictStrategySchema = t.Union([
  t.Literal("skip"),
  t.Literal("overwrite"),
  t.Literal("overwrite-generated-only"),
  t.Literal("fail"),
])

const targetPresetSchema = t.Union([
  t.Literal("staging"),
  t.Literal("module"),
  // Legacy sessions created before the staging-only preset was enforced
  // can still be replayed and surfaced by the detail/list endpoints.
  t.Literal("default"),
])

const recoveryStatusSchema = t.Union([
  t.Literal("none"),
  t.Literal("rebuilt-from-corrupt"),
  t.Literal("rebuilt-from-missing"),
])

const driftStatusSchema = t.Union([
  t.Literal("clean"),
  t.Literal("stale"),
  t.Literal("apply-conflict"),
])

const blockerReasonSchema = t.Object({
  code: t.Union([
    t.Literal("review-required"),
    t.Literal("rejected"),
    t.Literal("blocking-conflicts"),
    t.Literal("confirmation-required"),
  ]),
  message: t.String(),
  stage: t.Union([
    t.Literal("review"),
    t.Literal("confirm"),
    t.Literal("apply"),
  ]),
})

const reviewEvidenceSchema = t.Object({
  sessionId: t.String(),
  reportPath: t.String(),
  reviewedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  actorDisplayName: t.Nullable(t.String()),
  actorUserId: t.Nullable(t.String()),
  actorUsername: t.Nullable(t.String()),
  comment: t.Nullable(t.String()),
  decision: t.Union([t.Literal("approve"), t.Literal("reject")]),
})

const confirmationEvidenceSchema = t.Object({
  sessionId: t.String(),
  reportPath: t.String(),
  snapshotPath: t.String(),
  recoveryStatus: recoveryStatusSchema,
  archivedSnapshotPath: t.Nullable(t.String()),
  confirmedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  actorDisplayName: t.Nullable(t.String()),
  actorUserId: t.Nullable(t.String()),
  actorUsername: t.Nullable(t.String()),
  checklist: t.Array(t.String()),
})

const applyEvidenceSchema = t.Object({
  sessionId: t.String(),
  reportPath: t.String(),
  manifestPath: t.Nullable(t.String()),
  appliedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  actorDisplayName: t.Nullable(t.String()),
  actorUserId: t.Nullable(t.String()),
  actorUsername: t.Nullable(t.String()),
  requestId: t.Nullable(t.String()),
})

export const generatorSessionResponseSchema = t.Object({
  id: t.String(),
  actorDisplayName: t.Nullable(t.String()),
  actorUserId: t.Nullable(t.String()),
  actorUsername: t.Nullable(t.String()),
  appliedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  appliedFileCount: t.Nullable(t.Number()),
  appliedByDisplayName: t.Nullable(t.String()),
  appliedByUserId: t.Nullable(t.String()),
  appliedByUsername: t.Nullable(t.String()),
  applyManifestPath: t.Nullable(t.String()),
  applyRequestId: t.Nullable(t.String()),
  applyEvidence: t.Nullable(applyEvidenceSchema),
  conflictStrategy: conflictStrategySchema,
  createdAt: t.String({
    format: "date-time",
  }),
  frontendTarget: frontendTargetSchema,
  hasBlockingConflicts: t.Boolean(),
  outputDir: t.String(),
  previewFileCount: t.Number(),
  reportPath: t.String(),
  reviewComment: t.Nullable(t.String()),
  reviewedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  reviewedByDisplayName: t.Nullable(t.String()),
  reviewedByUserId: t.Nullable(t.String()),
  reviewedByUsername: t.Nullable(t.String()),
  reviewEvidence: t.Nullable(reviewEvidenceSchema),
  confirmedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  confirmedByDisplayName: t.Nullable(t.String()),
  confirmedByUserId: t.Nullable(t.String()),
  confirmedByUsername: t.Nullable(t.String()),
  confirmationEvidence: t.Nullable(confirmationEvidenceSchema),
  blockerReasons: t.Array(blockerReasonSchema),
  recoveryStatus: recoveryStatusSchema,
  driftStatus: driftStatusSchema,
  schemaName: t.String(),
  skippedFileCount: t.Nullable(t.Number()),
  sourceType: generatorPreviewSourceTypeSchema,
  sourceValue: t.String(),
  status: sessionStatusSchema,
  targetPreset: targetPresetSchema,
  tenantId: t.Nullable(t.String()),
})

export const generatorSessionListResponseSchema = t.Object({
  items: t.Array(generatorSessionResponseSchema),
})

export const generatorSessionDetailResponseSchema = t.Object({
  ...generatorSessionResponseSchema.properties,
  diffSummary: t.Any(),
  targetDirectoryDiff: t.Any(),
  conflictExplanations: t.Any(),
  report: t.Any(),
  sqlProposal: t.Any(),
  sqlProposalHandoff: t.Any(),
})

export const generatorSessionPreviewResponseSchema = t.Object({
  session: generatorSessionResponseSchema,
  diff: t.Any(),
  targetDirectoryDiff: t.Any(),
  conflictExplanations: t.Any(),
  report: t.Any(),
  sqlProposal: t.Any(),
  sqlProposalHandoff: t.Any(),
})

export const generatorSessionConfirmResponseSchema = t.Object({
  session: generatorSessionResponseSchema,
  sqlProposalHandoff: t.Any(),
})

export const generatorSessionApplyResponseSchema = t.Object({
  session: generatorSessionResponseSchema,
  diff: t.Any(),
  targetDirectoryDiff: t.Any(),
  conflictExplanations: t.Any(),
  sqlProposal: t.Any(),
  sqlProposalHandoff: t.Any(),
  apply: t.Any(),
})

const generatorSchemaValidationIssueSchema = t.Object({
  path: t.String(),
  message: t.String(),
})

export const generatorSchemaValidationResponseSchema = t.Union([
  t.Object({
    valid: t.Literal(true),
    expandedSchema: t.Any(),
  }),
  t.Object({
    valid: t.Literal(false),
    issues: t.Array(generatorSchemaValidationIssueSchema),
    formattedMessage: t.String(),
  }),
])
