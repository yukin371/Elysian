import type {
  GeneratorPreviewApplyEvidence,
  GeneratorPreviewBlockerReason,
  GeneratorPreviewDriftStatus,
  GeneratorPreviewRecoveryStatus,
  GeneratorPreviewStep,
  GeneratorPreviewTranslation,
} from "./types"

export interface GeneratorStatusFact {
  label: string
  value: string
}

export interface BuildGeneratorStatusFactsInput {
  applyEvidence: GeneratorPreviewApplyEvidence | null
  currentStatusLabel: string
  draftModuleName: string
  driftStatus: GeneratorPreviewDriftStatus
  previewArtifactCount: number
  recoveryStatus: GeneratorPreviewRecoveryStatus
  selectedConflictStrategyLabel: string
  selectedFrontendTargetLabel: string
  selectedSchemaName: string
  t: GeneratorPreviewTranslation
}

export interface BuildGeneratorResultRecoveryStepsInput {
  blockerReasons: GeneratorPreviewBlockerReason[]
  currentStep: GeneratorPreviewStep
  driftStatus: GeneratorPreviewDriftStatus
  errorMessage: string
  hasBlockingConflicts: boolean
  hasCurrentResult: boolean
  t: GeneratorPreviewTranslation
}

export const resolveGeneratorDriftStatusLabel = (
  t: GeneratorPreviewTranslation,
  driftStatus: GeneratorPreviewDriftStatus,
) => {
  if (driftStatus === "stale") {
    return t("app.generatorPreview.driftStatus.stale")
  }

  if (driftStatus === "apply-conflict") {
    return t("app.generatorPreview.driftStatus.applyConflict")
  }

  return t("app.generatorPreview.driftStatus.clean")
}

export const resolveGeneratorRecoveryStatusLabel = (
  t: GeneratorPreviewTranslation,
  recoveryStatus: GeneratorPreviewRecoveryStatus,
) => {
  if (recoveryStatus === "rebuilt-from-corrupt") {
    return t("app.generatorPreview.recoveryStatus.rebuiltFromCorrupt")
  }

  if (recoveryStatus === "rebuilt-from-missing") {
    return t("app.generatorPreview.recoveryStatus.rebuiltFromMissing")
  }

  return t("app.generatorPreview.recoveryStatus.none")
}

export const buildGeneratorStatusFacts = (
  input: BuildGeneratorStatusFactsInput,
): GeneratorStatusFact[] => {
  const facts: GeneratorStatusFact[] = [
    {
      label: input.t("app.generatorPreview.filter.schemaLabel"),
      value: input.selectedSchemaName || input.draftModuleName || "-",
    },
    {
      label: input.t("app.generatorPreview.meta.frontendTarget"),
      value: input.selectedFrontendTargetLabel,
    },
    {
      label: input.t("app.generatorPreview.meta.status"),
      value: input.currentStatusLabel,
    },
    {
      label: input.t("app.generatorPreview.statsHint"),
      value: String(input.previewArtifactCount),
    },
    {
      label: input.t("app.generatorPreview.filter.conflictLabel"),
      value: input.selectedConflictStrategyLabel || "-",
    },
    {
      label: input.t("app.generatorPreview.meta.targetPreset"),
      value: "staging",
    },
  ]

  if (input.driftStatus !== "clean") {
    facts.push({
      label: input.t("app.generatorPreview.meta.driftStatus"),
      value: resolveGeneratorDriftStatusLabel(input.t, input.driftStatus),
    })
  }

  if (input.recoveryStatus !== "none") {
    facts.push({
      label: input.t("app.generatorPreview.meta.recoveryStatus"),
      value: resolveGeneratorRecoveryStatusLabel(input.t, input.recoveryStatus),
    })
  }

  if (input.applyEvidence) {
    facts.push(
      {
        label: input.t("app.generatorPreview.meta.appliedAt"),
        value: input.applyEvidence.appliedAt ?? "-",
      },
      {
        label: input.t("app.generatorPreview.meta.manifestPath"),
        value: input.applyEvidence.manifestPath ?? "-",
      },
    )
  }

  return facts
}

export const buildGeneratorResultRecoverySteps = (
  input: BuildGeneratorResultRecoveryStepsInput,
) => {
  if (
    !input.hasCurrentResult ||
    (input.errorMessage.trim().length === 0 &&
      input.driftStatus === "clean" &&
      input.blockerReasons.length === 0)
  ) {
    return []
  }

  const steps = new Set<string>()
  const normalizedError = input.errorMessage.toLowerCase()
  const blockerReasonCodes = new Set(
    input.blockerReasons.map((reason) => reason.code),
  )

  if (
    input.driftStatus === "stale" ||
    input.driftStatus === "apply-conflict" ||
    normalizedError.includes("stale") ||
    normalizedError.includes("drift") ||
    normalizedError.includes("apply conflict")
  ) {
    steps.add(input.t("app.generatorPreview.resultRecoveryStep.refreshDrift"))
  }

  if (
    input.hasBlockingConflicts ||
    blockerReasonCodes.has("blocking-conflicts") ||
    normalizedError.includes("blocking conflict") ||
    normalizedError.includes("cannot be applied directly")
  ) {
    steps.add(
      input.t("app.generatorPreview.resultRecoveryStep.reviewBlockedFiles"),
    )
  }

  if (
    input.currentStep === "apply" ||
    blockerReasonCodes.has("confirmation-required") ||
    normalizedError.includes("apply") ||
    normalizedError.includes("confirmation")
  ) {
    steps.add(
      input.t("app.generatorPreview.resultRecoveryStep.recheckChecklist"),
    )
  }

  steps.add(input.t("app.generatorPreview.resultRecoveryStep.restoreSession"))
  steps.add(input.t("app.generatorPreview.resultRecoveryStep.regenerate"))

  return Array.from(steps)
}
