import type { GeneratorPreviewTranslation } from "./types"

interface GeneratorPreviewConfirmationEvidenceRecord {
  checklist?: unknown
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

  return t("app.generatorPreview.message.confirmationEvidenceCaptured", {
    count: evidence.checklist.length,
  })
}
