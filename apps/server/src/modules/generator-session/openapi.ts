import { t } from "elysia"

const sessionStatusSchema = t.Union([
  t.Literal("pending_review"),
  t.Literal("ready"),
  t.Literal("rejected"),
  t.Literal("applied"),
])

const frontendTargetSchema = t.Union([t.Literal("vue"), t.Literal("react")])

const conflictStrategySchema = t.Union([
  t.Literal("skip"),
  t.Literal("overwrite"),
  t.Literal("overwrite-generated-only"),
  t.Literal("fail"),
])

const targetPresetSchema = t.Union([
  t.Literal("staging"),
  // Legacy sessions created before the staging-only preset was enforced
  // can still be replayed and surfaced by the detail/list endpoints.
  t.Literal("default"),
])

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
  applyEvidence: t.Nullable(t.Record(t.String(), t.Unknown())),
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
  reviewEvidence: t.Nullable(t.Record(t.String(), t.Unknown())),
  confirmedAt: t.Nullable(
    t.String({
      format: "date-time",
    }),
  ),
  confirmedByDisplayName: t.Nullable(t.String()),
  confirmedByUserId: t.Nullable(t.String()),
  confirmedByUsername: t.Nullable(t.String()),
  confirmationEvidence: t.Nullable(t.Record(t.String(), t.Unknown())),
  schemaName: t.String(),
  skippedFileCount: t.Nullable(t.Number()),
  sourceType: t.Literal("registered-schema"),
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
