import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import {
  buildWorkspaceRegistration,
  buildWorkspaceRegistrationFromArtifact,
} from "@elysian/frontend-vue"
import { renderFrontendArtifactModule } from "@elysian/generator"
import { isStandardCrudSchema } from "@elysian/generator"
import { registeredModuleSchemas } from "@elysian/schema"

import {
  generatedFrontendModuleArtifacts,
  generatedStandardCrudFrontendModuleArtifacts,
  generatedStandardCrudWorkspaceKinds,
} from "./generated"

const frontendModuleSchemas = registeredModuleSchemas.filter(
  (schema) => schema.frontend !== undefined,
)

const resolveSchemaModuleCode = (
  schema: (typeof frontendModuleSchemas)[number],
) => schema.frontend?.moduleCode ?? schema.name

const artifactByModuleCode = new Map(
  generatedFrontendModuleArtifacts.map((artifact) => [
    artifact.moduleCode,
    artifact,
  ]),
)

const requireArtifact = (schema: (typeof frontendModuleSchemas)[number]) => {
  const artifact = artifactByModuleCode.get(resolveSchemaModuleCode(schema))

  expect(artifact).toBeDefined()

  if (!artifact) {
    throw new Error(`Missing generated artifact for schema ${schema.name}`)
  }

  return artifact
}

const generatedArtifactPath = (schemaName: string) =>
  fileURLToPath(
    new URL(`./generated/${schemaName}.frontend.generated.ts`, import.meta.url),
  )

const generatedIndexPath = fileURLToPath(
  new URL("./generated/index.ts", import.meta.url),
)

describe("workspace registry generated artifacts", () => {
  test("keep generated registrations aligned with source schemas", () => {
    expect(generatedFrontendModuleArtifacts).toHaveLength(
      frontendModuleSchemas.length,
    )

    for (const schema of frontendModuleSchemas) {
      const artifact = requireArtifact(schema)

      expect(buildWorkspaceRegistrationFromArtifact(artifact)).toEqual(
        buildWorkspaceRegistration(schema),
      )
    }
  })

  test("keep generated frontend surface metadata aligned with CRUD boundaries", () => {
    for (const schema of frontendModuleSchemas) {
      const artifact = requireArtifact(schema)
      const standardCrud = isStandardCrudSchema(schema)
      const expectedPagePath = `modules/${schema.name}/${schema.name}.page.vue`

      expect(artifact.pageComponentPath).toBe(expectedPagePath)
      expect(artifact.fieldKeys).toEqual(
        schema.fields.map((field) => field.key),
      )
      expect(artifact.searchableFieldKeys).toEqual(
        schema.fields
          .filter((field) => field.searchable === true)
          .map((field) => field.key),
      )

      if (standardCrud) {
        expect(artifact.surfaceKind).toBe("standard-crud-enterprise")
        expect(artifact.panelComponentPath).toBe(
          `modules/${schema.name}/${schema.name}-panel.vue`,
        )
        expect(artifact.workspaceComponentPath).toBe(
          `modules/${schema.name}/${schema.name}-workspace.ts`,
        )
      } else {
        expect(artifact.surfaceKind).toBe("page-only")
        expect(artifact.panelComponentPath).toBeNull()
        expect(artifact.workspaceComponentPath).toBeNull()
      }
    }
  })

  test("keep committed generated files in sync with the current generator output", async () => {
    for (const schema of frontendModuleSchemas) {
      const generatedFile = await readFile(
        generatedArtifactPath(schema.name),
        "utf8",
      )
      const renderedFile = renderFrontendArtifactModule(schema, "vue").contents

      expect(generatedFile).toContain(renderedFile)
    }

    const generatedIndex = await readFile(generatedIndexPath, "utf8")

    for (const schema of frontendModuleSchemas) {
      expect(generatedIndex).toContain(
        `export { ${renderFrontendArtifactModule(schema, "vue").artifactName} }`,
      )
    }

    const expectedStandardCrudArtifacts = frontendModuleSchemas
      .filter((schema) => isStandardCrudSchema(schema))
      .map((schema) => requireArtifact(schema))
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
