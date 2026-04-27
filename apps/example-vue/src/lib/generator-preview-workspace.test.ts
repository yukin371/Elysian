import { describe, expect, it } from "bun:test"

import {
  filterGeneratorPreviewFiles,
  resolveGeneratorPreviewSelection,
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
})
