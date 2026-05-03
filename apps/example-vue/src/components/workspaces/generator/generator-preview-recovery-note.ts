import type { GeneratorPreviewSqlProposalHandoff } from "./types"

export interface GeneratorPreviewRecoveryNote {
  text: string
  tone: "info" | "warning"
}

export const resolveGeneratorPreviewRecoveryNote = (
  recovery: GeneratorPreviewSqlProposalHandoff["migrationProposalSnapshotRecovery"],
): GeneratorPreviewRecoveryNote | null => {
  if (!recovery || recovery.status === "none") {
    return null
  }

  if (recovery.status === "rebuilt-from-corrupt") {
    return {
      tone: "warning",
      text: recovery.archivedSnapshotPath
        ? `快照已从损坏副本重建，原始文件已归档到 ${recovery.archivedSnapshotPath}`
        : "快照已从损坏副本重建。",
    }
  }

  return {
    tone: "info",
    text: "快照缺失，已按当前 report 重新生成并落盘。",
  }
}
