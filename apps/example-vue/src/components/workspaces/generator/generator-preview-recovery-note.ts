import type {
  GeneratorPreviewSqlProposalHandoff,
  GeneratorPreviewTranslation,
} from "./types"

export interface GeneratorPreviewRecoveryNote {
  text: string
  tone: "info" | "warning"
}

export const resolveGeneratorPreviewRecoveryNote = (
  t: GeneratorPreviewTranslation,
  recovery: GeneratorPreviewSqlProposalHandoff["migrationProposalSnapshotRecovery"],
): GeneratorPreviewRecoveryNote | null => {
  if (!recovery || recovery.status === "none") {
    return null
  }

  if (recovery.status === "rebuilt-from-corrupt") {
    return {
      tone: "warning",
      text: recovery.archivedSnapshotPath
        ? `${t("app.generatorPreview.migrationProposalRecovery.rebuiltFromCorrupt")} ${recovery.archivedSnapshotPath}`
        : t(
            "app.generatorPreview.migrationProposalRecovery.rebuiltFromCorrupt",
          ),
    }
  }

  return {
    tone: "info",
    text: t(
      "app.generatorPreview.migrationProposalRecovery.rebuiltFromMissing",
    ),
  }
}
