import { describe, expect, it } from "bun:test"

import { resolveGeneratorPreviewRecoveryNote } from "./generator-preview-recovery-note"

describe("resolveGeneratorPreviewRecoveryNote", () => {
  it("returns null when recovery is none", () => {
    expect(
      resolveGeneratorPreviewRecoveryNote({
        archivedSnapshotPath: null,
        status: "none",
      }),
    ).toBeNull()
  })

  it("describes a rebuilt missing snapshot", () => {
    expect(
      resolveGeneratorPreviewRecoveryNote({
        archivedSnapshotPath: null,
        status: "rebuilt-from-missing",
      }),
    ).toEqual({
      tone: "info",
      text: "快照缺失，已按当前 report 重新生成并落盘。",
    })
  })

  it("describes a rebuilt corrupted snapshot", () => {
    expect(
      resolveGeneratorPreviewRecoveryNote({
        archivedSnapshotPath: "/tmp/report.migration-proposal.corrupt-123.json",
        status: "rebuilt-from-corrupt",
      }),
    ).toEqual({
      tone: "warning",
      text: "快照已从损坏副本重建，原始文件已归档到 /tmp/report.migration-proposal.corrupt-123.json",
    })
  })
})
