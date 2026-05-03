import { resolveGeneratorPreviewConfirmationEvidenceSummary } from "./generator-preview-confirmation-evidence"

const t = (key: string, params?: Record<string, unknown>) =>
  key === "app.generatorPreview.message.confirmationEvidenceCaptured" &&
  typeof params?.count === "number"
    ? `captured:${params.count}`
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
})
