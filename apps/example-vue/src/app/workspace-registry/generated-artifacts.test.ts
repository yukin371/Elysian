import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import {
  buildWorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact,
} from "@elysian/frontend-vue"
import { renderFrontendArtifactModule } from "@elysian/generator"
import { isStandardCrudSchema } from "@elysian/generator"
import {
  customerModuleSchema,
  departmentModuleSchema,
  dictionaryModuleSchema,
  fileModuleSchema,
  menuModuleSchema,
  notificationModuleSchema,
  operationLogModuleSchema,
  postModuleSchema,
  roleModuleSchema,
  settingModuleSchema,
  tenantModuleSchema,
  userModuleSchema,
  workflowModuleSchema,
} from "@elysian/schema"

import {
  customerFrontendModuleArtifact,
  departmentFrontendModuleArtifact,
  dictionaryFrontendModuleArtifact,
  fileFrontendModuleArtifact,
  generatedStandardCrudFrontendModuleArtifacts,
  generatedStandardCrudWorkspaceKinds,
  menuFrontendModuleArtifact,
  notificationFrontendModuleArtifact,
  operationLogFrontendModuleArtifact,
  postFrontendModuleArtifact,
  roleFrontendModuleArtifact,
  settingFrontendModuleArtifact,
  tenantFrontendModuleArtifact,
  userFrontendModuleArtifact,
  workflowDefinitionFrontendModuleArtifact,
} from "./generated"

const artifactFixtures = [
  {
    schema: customerModuleSchema,
    artifact: customerFrontendModuleArtifact,
    exportName: "customerFrontendModuleArtifact",
  },
  {
    schema: departmentModuleSchema,
    artifact: departmentFrontendModuleArtifact,
    exportName: "departmentFrontendModuleArtifact",
  },
  {
    schema: dictionaryModuleSchema,
    artifact: dictionaryFrontendModuleArtifact,
    exportName: "dictionaryFrontendModuleArtifact",
  },
  {
    schema: fileModuleSchema,
    artifact: fileFrontendModuleArtifact,
    exportName: "fileFrontendModuleArtifact",
  },
  {
    schema: menuModuleSchema,
    artifact: menuFrontendModuleArtifact,
    exportName: "menuFrontendModuleArtifact",
  },
  {
    schema: notificationModuleSchema,
    artifact: notificationFrontendModuleArtifact,
    exportName: "notificationFrontendModuleArtifact",
  },
  {
    schema: operationLogModuleSchema,
    artifact: operationLogFrontendModuleArtifact,
    exportName: "operationLogFrontendModuleArtifact",
  },
  {
    schema: postModuleSchema,
    artifact: postFrontendModuleArtifact,
    exportName: "postFrontendModuleArtifact",
  },
  {
    schema: roleModuleSchema,
    artifact: roleFrontendModuleArtifact,
    exportName: "roleFrontendModuleArtifact",
  },
  {
    schema: settingModuleSchema,
    artifact: settingFrontendModuleArtifact,
    exportName: "settingFrontendModuleArtifact",
  },
  {
    schema: tenantModuleSchema,
    artifact: tenantFrontendModuleArtifact,
    exportName: "tenantFrontendModuleArtifact",
  },
  {
    schema: userModuleSchema,
    artifact: userFrontendModuleArtifact,
    exportName: "userFrontendModuleArtifact",
  },
  {
    schema: workflowModuleSchema,
    artifact: workflowDefinitionFrontendModuleArtifact,
    exportName: "workflowDefinitionFrontendModuleArtifact",
  },
] as const

const generatedArtifactPath = (schemaName: string) =>
  fileURLToPath(
    new URL(`./generated/${schemaName}.frontend.generated.ts`, import.meta.url),
  )

const generatedIndexPath = fileURLToPath(
  new URL("./generated/index.ts", import.meta.url),
)

describe("workspace registry generated artifacts", () => {
  test("keep generated registrations aligned with source schemas", () => {
    for (const fixture of artifactFixtures) {
      expect(buildWorkspaceRegistrationFromArtifact(fixture.artifact)).toEqual(
        buildWorkspaceRegistration(fixture.schema),
      )
    }
  })

  test("keep generated frontend surface metadata aligned with CRUD boundaries", () => {
    for (const fixture of artifactFixtures) {
      const standardCrud = isStandardCrudSchema(fixture.schema)
      const expectedPagePath = `modules/${fixture.schema.name}/${fixture.schema.name}.page.vue`

      expect(fixture.artifact.pageComponentPath).toBe(expectedPagePath)
      expect(fixture.artifact.fieldKeys).toEqual(
        fixture.schema.fields.map((field) => field.key),
      )
      expect(fixture.artifact.searchableFieldKeys).toEqual(
        fixture.schema.fields
          .filter((field) => field.searchable === true)
          .map((field) => field.key),
      )

      if (standardCrud) {
        expect(fixture.artifact.surfaceKind).toBe("standard-crud-enterprise")
        expect(fixture.artifact.panelComponentPath).toBe(
          `modules/${fixture.schema.name}/${fixture.schema.name}-panel.vue`,
        )
        expect(fixture.artifact.workspaceComponentPath).toBe(
          `modules/${fixture.schema.name}/${fixture.schema.name}-workspace.ts`,
        )
      } else {
        expect(fixture.artifact.surfaceKind).toBe("page-only")
        expect(fixture.artifact.panelComponentPath).toBeNull()
        expect(fixture.artifact.workspaceComponentPath).toBeNull()
      }
    }
  })

  test("keep committed generated files in sync with the current generator output", async () => {
    for (const fixture of artifactFixtures) {
      const generatedFile = await readFile(
        generatedArtifactPath(fixture.schema.name),
        "utf8",
      )
      const renderedFile = renderFrontendArtifactModule(
        fixture.schema,
        "vue",
      ).contents

      expect(generatedFile).toContain(renderedFile)
    }

    const generatedIndex = await readFile(generatedIndexPath, "utf8")

    for (const fixture of artifactFixtures) {
      expect(generatedIndex).toContain(`export { ${fixture.exportName} }`)
    }

    const expectedStandardCrudArtifacts = artifactFixtures
      .filter((fixture) => isStandardCrudSchema(fixture.schema))
      .map((fixture) => fixture.artifact)
    const expectedStandardCrudWorkspaceKinds =
      expectedStandardCrudArtifacts.map((artifact) => artifact.kind)

    expect([...generatedStandardCrudFrontendModuleArtifacts]).toEqual(
      expectedStandardCrudArtifacts,
    )
    expect([...generatedStandardCrudWorkspaceKinds]).toEqual(
      expectedStandardCrudWorkspaceKinds,
    )
  })
})
