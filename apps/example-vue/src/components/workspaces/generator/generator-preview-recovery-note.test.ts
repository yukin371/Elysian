import { describe, expect, it } from "bun:test"

import { resolveGeneratorPreviewRecoveryNote } from "./generator-preview-recovery-note"

const t = (key: string) => key

describe("resolveGeneratorPreviewRecoveryNote", () => {
  it("returns null when recovery is none", () => {
    expect(
      resolveGeneratorPreviewRecoveryNote(t, {
        archivedSnapshotPath: null,
        status: "none",
      }),
    ).toBeNull()
  })

  it("describes a rebuilt missing snapshot", () => {
    expect(
      resolveGeneratorPreviewRecoveryNote(t, {
        archivedSnapshotPath: null,
        status: "rebuilt-from-missing",
      }),
    ).toEqual({
      tone: "info",
      text: "app.generatorPreview.migrationProposalRecovery.rebuiltFromMissing",
    })
  })

  it("describes a rebuilt corrupted snapshot", () => {
    expect(
      resolveGeneratorPreviewRecoveryNote(t, {
        archivedSnapshotPath: "/tmp/report.migration-proposal.corrupt-123.json",
        status: "rebuilt-from-corrupt",
      }),
    ).toEqual({
      tone: "warning",
      text: "app.generatorPreview.migrationProposalRecovery.rebuiltFromCorrupt /tmp/report.migration-proposal.corrupt-123.json",
    })
  })
})
