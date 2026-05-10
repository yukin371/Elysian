import { describe, expect, test } from "bun:test"

import { resolveGeneratorPreviewFrontendImpact } from "./generator-preview-frontend-impact"

describe("resolveGeneratorPreviewFrontendImpact", () => {
  test("extracts route, module, surface, and permission impact from frontend artifact", () => {
    const impact = resolveGeneratorPreviewFrontendImpact(
      "modules/supplier/supplier.frontend.ts",
      `
export const supplierFrontendModuleArtifact = {
  moduleCode: "supplier",
  frontendTarget: "vue",
  workspaceDomain: "business",
  routePath: "/business/supplier",
  permissionPrefix: "business:supplier",
  surfaceKind: "standard-crud-enterprise",
  permissions: {
    "list": "business:supplier:list",
    "create": "business:supplier:create",
    "update": "business:supplier:update",
    "delete": "business:supplier:delete"
  },
}
      `,
    )

    expect(impact).toEqual({
      moduleCode: "supplier",
      permissionCodes: [
        "business:supplier:list",
        "business:supplier:create",
        "business:supplier:update",
        "business:supplier:delete",
      ],
      permissionPrefix: "business:supplier",
      routePath: "/business/supplier",
      surfaceKind: "standard-crud-enterprise",
    })
  })

  test("returns null for non-frontend files", () => {
    expect(
      resolveGeneratorPreviewFrontendImpact("modules/supplier/page.vue", ""),
    ).toBeNull()
  })
})
