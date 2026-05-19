import type {
  GeneratorPreviewConfirmationEvidence,
  GeneratorPreviewRecoveryStatus,
  GeneratorPreviewTranslation,
} from "./types"

export interface GeneratorPreviewConfirmationEvidenceFact {
  label: string
  value: string
}

const resolveRecoveryStatusLabel = (
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

export const resolveGeneratorPreviewConfirmationEvidenceFacts = (
  t: GeneratorPreviewTranslation,
  confirmationEvidence: GeneratorPreviewConfirmationEvidence | null,
): GeneratorPreviewConfirmationEvidenceFact[] => {
  if (!confirmationEvidence) {
    return []
  }

  const facts: GeneratorPreviewConfirmationEvidenceFact[] = [
    {
      label: t("app.generatorPreview.meta.confirmedAt"),
      value: confirmationEvidence.confirmedAt ?? "-",
    },
    {
      label: t("app.generatorPreview.meta.reportPath"),
      value: confirmationEvidence.reportPath || "-",
    },
    {
      label: t("app.generatorPreview.meta.snapshotPath"),
      value: confirmationEvidence.snapshotPath || "-",
    },
    {
      label: t("app.generatorPreview.meta.recoveryStatus"),
      value: resolveRecoveryStatusLabel(t, confirmationEvidence.recoveryStatus),
    },
    {
      label: t("app.generatorPreview.meta.confirmationChecklistCount"),
      value: String(confirmationEvidence.checklist.length),
    },
  ]

  if (confirmationEvidence.archivedSnapshotPath) {
    facts.push({
      label: t("app.generatorPreview.meta.archivedSnapshotPath"),
      value: confirmationEvidence.archivedSnapshotPath,
    })
  }

  return facts
}
