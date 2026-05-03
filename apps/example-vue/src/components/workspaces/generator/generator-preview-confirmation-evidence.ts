import type { GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewConfirmationEvidenceRecord {
  recoveryStatus?: unknown
  checklist?: unknown
  reportPath?: unknown
  snapshotPath?: unknown
}

export const resolveGeneratorPreviewConfirmationEvidenceSummary = (
  t: GeneratorPreviewTranslation,
  confirmationEvidence: Record<string, unknown> | null,
) => {
  if (!confirmationEvidence) {
    return null
  }

  const evidence =
    confirmationEvidence as GeneratorPreviewConfirmationEvidenceRecord

  if (!Array.isArray(evidence.checklist)) {
    return null
  }

  if (
    typeof evidence.reportPath === "string" &&
    typeof evidence.snapshotPath === "string"
  ) {
    return t("app.generatorPreview.message.confirmationEvidenceDetailed", {
      count: evidence.checklist.length,
      recoveryStatus:
        typeof evidence.recoveryStatus === "string"
          ? evidence.recoveryStatus
          : "unknown",
      reportPath: evidence.reportPath,
      snapshotPath: evidence.snapshotPath,
    })
  }

  return t("app.generatorPreview.message.confirmationEvidenceCaptured", {
    count: evidence.checklist.length,
  })
}
