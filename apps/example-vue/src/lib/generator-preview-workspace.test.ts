import { describe, expect, it } from "bun:test"

import {
  filterGeneratorPreviewFiles,
  resolveGeneratorPreviewSelection,
  shouldSelectGeneratorPreviewFile,
  toGeneratorPreviewFileCard,
} from "./generator-preview-workspace"

const previewFiles = [
  toGeneratorPreviewFileCard({
    absolutePath: "E:/generated/modules/customer/customer.schema.ts",
    path: "modules/customer/customer.schema.ts",
    reason: "Persist the module schema alongside generated module artifacts.",
    plannedAction: "create",
    plannedReason: "File does not exist yet.",
    exists: false,
    hasChanges: true,
    mergeStrategy: "replace-whole-file",
    contents: "export const customerModuleSchema = {}",
    currentContents: null,
    isManaged: null,
  }),
  toGeneratorPreviewFileCard({
    absolutePath: "E:/generated/modules/customer/customer.page.vue",
    path: "modules/customer/customer.page.vue",
    reason: "Provide a generated management page implementation.",
    plannedAction: "create",
    plannedReason: "File does not exist yet.",
    exists: false,
    hasChanges: true,
    mergeStrategy: "replace-whole-file",
    contents: "<template><div>customer page</div></template>",
    currentContents: null,
    isManaged: null,
  }),
]

describe("generator-preview-workspace", () => {
  it("filters preview files by path and contents", () => {
    expect(
      filterGeneratorPreviewFiles(previewFiles, "customer.page.vue"),
    ).toHaveLength(1)
    expect(filterGeneratorPreviewFiles(previewFiles, "template")).toHaveLength(
      1,
    )
    expect(filterGeneratorPreviewFiles(previewFiles, "")).toHaveLength(2)
  })

  it("prioritizes blocking and overwrite files in the filtered list", () => {
    const prioritizedFiles = filterGeneratorPreviewFiles(
      [
        {
          ...previewFiles[0]!,
          path: "modules/customer/customer.skip.ts",
          plannedAction: "skip",
        },
        {
          ...previewFiles[1]!,
          path: "modules/customer/customer.create.ts",
          plannedAction: "create",
        },
        {
          ...previewFiles[0]!,
          path: "modules/customer/customer.block.ts",
          plannedAction: "block",
        },
        {
          ...previewFiles[1]!,
          path: "modules/customer/customer.overwrite.ts",
          plannedAction: "overwrite",
        },
      ],
      "",
    )

    expect(prioritizedFiles.map((file) => file.path)).toEqual([
      "modules/customer/customer.block.ts",
      "modules/customer/customer.overwrite.ts",
      "modules/customer/customer.create.ts",
      "modules/customer/customer.skip.ts",
    ])
  })

  it("resolves a stable selected file path", () => {
    expect(
      resolveGeneratorPreviewSelection(
        previewFiles,
        "modules/customer/customer.page.vue",
      ),
    ).toBe("modules/customer/customer.page.vue")
    expect(resolveGeneratorPreviewSelection(previewFiles, "missing")).toBe(
      "modules/customer/customer.schema.ts",
    )
    expect(resolveGeneratorPreviewSelection([], "missing")).toBeNull()
  })

  it("prioritizes blocking files when choosing a fallback selection", () => {
    const conflictFiles = [
      toGeneratorPreviewFileCard({
        absolutePath: "E:/generated/modules/customer/customer.schema.ts",
        path: "modules/customer/customer.schema.ts",
        reason: "Persist the module schema alongside generated module artifacts.",
        plannedAction: "create",
        plannedReason: "File does not exist yet.",
        exists: false,
        hasChanges: true,
        mergeStrategy: "replace-whole-file",
        contents: "export const customerModuleSchema = {}",
        currentContents: null,
        isManaged: null,
      }),
      toGeneratorPreviewFileCard({
        absolutePath: "E:/generated/modules/customer/customer.page.vue",
        path: "modules/customer/customer.page.vue",
        reason: "File drift blocks safe apply.",
        plannedAction: "block",
        plannedReason: "File has unmanaged local edits.",
        exists: true,
        hasChanges: true,
        mergeStrategy: "replace-whole-file",
        contents: "<template><div>customer page</div></template>",
        currentContents: "<template><div>customized page</div></template>",
        isManaged: false,
      }),
    ]

    expect(resolveGeneratorPreviewSelection(conflictFiles, null)).toBe(
      "modules/customer/customer.page.vue",
    )
  })

  it("prioritizes overwrite files ahead of new creates when no conflict exists", () => {
    const overwriteFiles = [
      toGeneratorPreviewFileCard({
        absolutePath: "E:/generated/modules/customer/customer.schema.ts",
        path: "modules/customer/customer.schema.ts",
        reason: "Persist the module schema alongside generated module artifacts.",
        plannedAction: "create",
        plannedReason: "File does not exist yet.",
        exists: false,
        hasChanges: true,
        mergeStrategy: "replace-whole-file",
        contents: "export const customerModuleSchema = {}",
        currentContents: null,
        isManaged: null,
      }),
      toGeneratorPreviewFileCard({
        absolutePath: "E:/generated/modules/customer/customer.page.vue",
        path: "modules/customer/customer.page.vue",
        reason: "Update generated management page implementation.",
        plannedAction: "overwrite",
        plannedReason: "Managed file can be regenerated safely.",
        exists: true,
        hasChanges: true,
        mergeStrategy: "replace-whole-file",
        contents: "<template><div>next page</div></template>",
        currentContents: "<template><div>current page</div></template>",
        isManaged: true,
      }),
    ]

    expect(resolveGeneratorPreviewSelection(overwriteFiles, null)).toBe(
      "modules/customer/customer.page.vue",
    )
  })

  it("skips redundant file selection emits for the current file", () => {
    expect(
      shouldSelectGeneratorPreviewFile(
        "modules/customer/customer.page.vue",
        "modules/customer/customer.page.vue",
      ),
    ).toBeFalse()
    expect(
      shouldSelectGeneratorPreviewFile(
        "modules/customer/customer.schema.ts",
        "modules/customer/customer.page.vue",
      ),
    ).toBeTrue()
    expect(shouldSelectGeneratorPreviewFile(null, "")).toBeFalse()
  })

  it("derives line-level diff stats for changed files", () => {
    const changedFile = toGeneratorPreviewFileCard({
      absolutePath: "E:/generated/modules/customer/customer.page.vue",
      path: "modules/customer/customer.page.vue",
      reason: "Provide a generated management page implementation.",
      plannedAction: "overwrite",
      plannedReason: "File would be replaced.",
      exists: true,
      hasChanges: true,
      mergeStrategy: "replace-whole-file",
      contents: ["<template>", "<div>next</div>", "</template>"].join("\n"),
      currentContents: ["<template>", "<div>current</div>", "</template>"].join(
        "\n",
      ),
      isManaged: true,
    })

    expect(changedFile.diffStats).toEqual({
      addedLineCount: 1,
      changedLineCount: 2,
      removedLineCount: 1,
      unchangedLineCount: 2,
    })
    expect(changedFile.diffLines).toEqual([
      {
        kind: "unchanged",
        oldLineNumber: 1,
        newLineNumber: 1,
        value: "<template>",
      },
      {
        kind: "removed",
        oldLineNumber: 2,
        newLineNumber: null,
        value: "<div>current</div>",
      },
      {
        kind: "added",
        oldLineNumber: null,
        newLineNumber: 2,
        value: "<div>next</div>",
      },
      {
        kind: "unchanged",
        oldLineNumber: 3,
        newLineNumber: 3,
        value: "</template>",
      },
    ])
  })

  it("treats new files as fully added in line-level diff stats", () => {
    expect(previewFiles[0]?.diffStats).toEqual({
      addedLineCount: 1,
      changedLineCount: 1,
      removedLineCount: 0,
      unchangedLineCount: 0,
    })
    expect(previewFiles[0]?.diffLines).toEqual([
      {
        kind: "added",
        oldLineNumber: null,
        newLineNumber: 1,
        value: "export const customerModuleSchema = {}",
      },
    ])
  })
})
