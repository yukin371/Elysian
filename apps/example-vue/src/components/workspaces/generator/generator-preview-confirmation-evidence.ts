import type {
  GeneratorPreviewConfirmationEvidence,
  GeneratorPreviewTranslation,
} from "./types"

export const resolveGeneratorPreviewConfirmationEvidenceSummary = (
  t: GeneratorPreviewTranslation,
  confirmationEvidence: GeneratorPreviewConfirmationEvidence | null,
) => {
  if (
    !confirmationEvidence ||
    !Array.isArray(confirmationEvidence.checklist) ||
    confirmationEvidence.checklist.length === 0
  ) {
    return null
  }

  if (
    confirmationEvidence.reportPath.trim().length > 0 &&
    confirmationEvidence.snapshotPath.trim().length > 0
  ) {
    return t("app.generatorPreview.message.confirmationEvidenceDetailed", {
      count: confirmationEvidence.checklist.length,
      recoveryStatus: confirmationEvidence.recoveryStatus,
      reportPath: confirmationEvidence.reportPath,
      snapshotPath: confirmationEvidence.snapshotPath,
    })
  }

  return t("app.generatorPreview.message.confirmationEvidenceCaptured", {
    count: confirmationEvidence.checklist.length,
  })
}
