import { describe, expect, test } from "bun:test"

import type { FileRecord } from "./platform-api"

import {
  createFileTableItems,
  filterFiles,
  formatFileSize,
  resolveFileSelection,
} from "./file-workspace"

const createFileRecord = (
  overrides: Partial<FileRecord> & Pick<FileRecord, "id">,
): FileRecord => ({
  id: overrides.id,
  originalName: overrides.originalName ?? `${overrides.id}.txt`,
  mimeType: overrides.mimeType ?? "text/plain",
  size: overrides.size ?? 1536,
  uploaderUserId: overrides.uploaderUserId ?? "user_admin_1",
  createdAt: overrides.createdAt ?? "2026-04-27T08:00:00.000Z",
})

describe("file workspace helpers", () => {
  const files = [
    createFileRecord({
      id: "file_alpha",
      originalName: "alpha-guide.txt",
      mimeType: "text/plain",
      uploaderUserId: "user_alpha",
      size: 1536,
    }),
    createFileRecord({
      id: "file_beta",
      originalName: "beta-report.pdf",
      mimeType: "application/pdf",
      uploaderUserId: "user_beta",
      size: 2_097_152,
    }),
  ]
  const betaFile = files[1]

  test("filters files by multiple local query fields", () => {
    if (!betaFile) {
      throw new Error("Missing beta file fixture")
    }

    expect(
      filterFiles(files, {
        originalName: " report ",
        mimeType: "pdf",
        uploaderUserId: "BETA",
      }),
    ).toEqual([betaFile])
  })

  test("keeps the current selection when it is still visible", () => {
    expect(resolveFileSelection(files, "file_beta")).toBe("file_beta")
  })

  test("falls back to the first visible file when selection disappears", () => {
    expect(resolveFileSelection(files, "file_missing")).toBe("file_alpha")
  })

  test("returns null when the file list is empty", () => {
    expect(resolveFileSelection([], null)).toBeNull()
  })

  test("formats file sizes across common thresholds", () => {
    expect(formatFileSize(512)).toBe("512 B")
    expect(formatFileSize(1536)).toBe("1.5 KB")
    expect(formatFileSize(2_097_152)).toBe("2.0 MB")
  })

  test("maps file rows for table display", () => {
    expect(
      createFileTableItems(
        [
          createFileRecord({
            id: "file_empty_meta",
            mimeType: "",
            uploaderUserId: "",
            size: 10_240,
          }),
        ],
        {
          formatDateTime: (value) => `time:${value}`,
          mimeTypeEmptyLabel: "Unknown MIME",
          uploaderEmptyLabel: "System",
        },
      ),
    ).toEqual([
      expect.objectContaining({
        id: "file_empty_meta",
        mimeType: "Unknown MIME",
        uploaderUserId: "System",
        createdAt: "time:2026-04-27T08:00:00.000Z",
        sizeLabel: "10 KB",
      }),
    ])
  })
})
