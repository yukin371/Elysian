import { describe, expect, test } from "bun:test"

import { resolveGeneratorPreviewConfirmationEvidenceSummary } from "./generator-preview-confirmation-evidence"

const t = (key: string, params?: Record<string, unknown>) =>
  key === "app.generatorPreview.message.confirmationEvidenceCaptured" &&
  typeof params?.count === "number"
    ? `captured:${params.count}`
    : key === "app.generatorPreview.message.confirmationEvidenceDetailed"
      ? `detailed:${params?.count}:${params?.reportPath}:${params?.snapshotPath}:${params?.recoveryStatus}`
      : key

describe("resolveGeneratorPreviewConfirmationEvidenceSummary", () => {
  test("returns null when confirmation evidence is missing", () => {
    expect(
      resolveGeneratorPreviewConfirmationEvidenceSummary(t, null),
    ).toBeNull()
  })

  test("returns null when confirmation checklist is missing", () => {
    expect(
      resolveGeneratorPreviewConfirmationEvidenceSummary(t, {
        confirmedAt: "2026-05-02T12:15:00.000Z",
      }),
    ).toBeNull()
  })

  test("summarizes confirmation checklist size", () => {
    expect(
      resolveGeneratorPreviewConfirmationEvidenceSummary(t, {
        checklist: ["Review the SQL draft.", "Confirm the snapshot path."],
      }),
    ).toBe("captured:2")
  })

  test("summarizes confirmation report, snapshot, and recovery status", () => {
    expect(
      resolveGeneratorPreviewConfirmationEvidenceSummary(t, {
        checklist: ["Review the SQL draft.", "Confirm the snapshot path."],
        recoveryStatus: "rebuilt-from-missing",
        reportPath: "generated/reports/customer.preview.json",
        snapshotPath: "generated/reports/customer.migration-proposal.json",
      }),
    ).toBe(
      "detailed:2:generated/reports/customer.preview.json:generated/reports/customer.migration-proposal.json:rebuilt-from-missing",
    )
  })
})
