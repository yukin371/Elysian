import type { ModuleField, ModuleSchema } from "@elysian/schema"

import { toCamelCase, toPascalCase } from "./naming"
import { isStandardCrudSchema } from "./standard-crud"
import {
  renderPagePanelPath,
  renderWorkspaceTemplatePath,
} from "./vue-enterprise-crud-templates"

export type FrontendTarget = "vue" | "react"

export interface RenderModuleTemplatesOptions {
  frontendTarget?: FrontendTarget
  schemaArtifactSource?: "package" | "inline"
}

export interface GeneratedFrontendModuleArtifact {
  fieldKeys: string[]
  frontendTarget: FrontendTarget
  i18nKeys: {
    sectionCopy: string
    sectionTitle: string
    shellDescription: string
    shellTitle: string
  }
  kind: string
  moduleCode: string
  pageComponentPath: string
  permissionPrefix: string | null
  permissions: Record<string, string>
  primaryFieldKey: string
  routePath: string | null
  searchableFieldKeys: string[]
  workspaceDomain: "business" | "system" | null
}

const getPageExtension = (frontendTarget: FrontendTarget) =>
  frontendTarget === "vue" ? "vue" : "tsx"

const SYSTEM_FIELD_KEYS = new Set(["id", "createdAt", "updatedAt"])

const getInputFields = (schema: ModuleSchema) =>
  schema.fields.filter((field) => !SYSTEM_FIELD_KEYS.has(field.key))

const getEnumTypeName = (schema: ModuleSchema, field: ModuleField) =>
  `${toPascalCase(schema.name)}${toPascalCase(field.key)}`

const getRecordTypeName = (schema: ModuleSchema) =>
  `${toPascalCase(schema.name)}Record`

const getFieldTypeAnnotation = (schema: ModuleSchema, field: ModuleField) => {
  switch (field.kind) {
    case "boolean":
      return "boolean"
    case "number":
      return "number"
    case "enum":
      return getEnumTypeName(schema, field)
    default:
      return "string"
  }
}

const renderCreateInputFields = (schema: ModuleSchema) =>
  getInputFields(schema)
    .map(
      (field) =>
        `  ${field.key}${field.required ? "" : "?"}: ${getFieldTypeAnnotation(schema, field)}`,
    )
    .join("\n")

const renderBodyFieldValidator = (field: ModuleField) => {
  const validator = (() => {
    switch (field.kind) {
      case "boolean":
        return "t.Boolean()"
      case "number":
        return "t.Number()"
      default:
        return "t.String({ minLength: 1 })"
    }
  })()

  return field.required
    ? `            ${field.key}: ${validator},`
    : `            ${field.key}: t.Optional(${validator}),`
}

const getPrimaryDisplayField = (schema: ModuleSchema) =>
  schema.fields.find((field) => field.key === "name") ??
  schema.fields.find(
    (field) =>
      !SYSTEM_FIELD_KEYS.has(field.key) &&
      (field.kind === "string" || field.kind === "id"),
  ) ??
  schema.fields.find((field) => !SYSTEM_FIELD_KEYS.has(field.key)) ??
  schema.fields[0]

const renderSchemaTypeSection = (schema: ModuleSchema) => {
  const enumTypeDeclarations = schema.fields
    .filter((field) => field.kind === "enum")
    .map((field) => {
      const optionValues =
        field.options && field.options.length > 0
          ? field.options
              .map((option) => JSON.stringify(option.value))
              .join(" | ")
          : "string"

      return `export type ${getEnumTypeName(schema, field)} = ${optionValues}`
    })
    .join("\n\n")
  const recordTypeName = getRecordTypeName(schema)
  const recordDeclaration = `export interface ${recordTypeName} {\n${schema.fields
    .map((field) => `  ${field.key}: ${getFieldTypeAnnotation(schema, field)}`)
    .join("\n")}\n}`

  return [enumTypeDeclarations, recordDeclaration]
    .filter((section) => section.trim().length > 0)
    .join("\n\n")
}

export const renderSchemaTemplate = (
  schema: ModuleSchema,
  options: RenderModuleTemplatesOptions = {},
) => {
  const symbolName = `${toCamelCase(schema.name)}ModuleSchema`
  const typeSection = renderSchemaTypeSection(schema)

  if (options.schemaArtifactSource === "inline") {
    return `import type { ModuleSchema } from "@elysian/schema"

${typeSection}

export const ${symbolName}: ModuleSchema = ${JSON.stringify(schema, null, 2)}

export const moduleSchema = ${symbolName}
`
  }

  return `import { ${symbolName} as sourceModuleSchema } from "@elysian/schema"
import type { ModuleSchema } from "@elysian/schema"

${typeSection}

export const ${symbolName}: ModuleSchema = sourceModuleSchema

export const moduleSchema = ${symbolName}
`
}

export const renderRepositoryTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const recordTypeName = getRecordTypeName(schema)
  const repositoryName = `${pascalName}Repository`
  const createInputName = `Create${pascalName}Input`
  const createFields = renderCreateInputFields(schema)
  const importedTypes = [
    recordTypeName,
    ...schema.fields
      .filter((field) => field.kind === "enum")
      .map((field) => getEnumTypeName(schema, field)),
  ]

  return `import type { ${importedTypes.join(", ")} } from "./${schema.name}.schema"

export interface ${createInputName} {
${createFields}
}

export interface ${repositoryName} {
  list: () => Promise<${recordTypeName}[]>
  getById: (id: string) => Promise<${recordTypeName} | null>
  create: (input: ${createInputName}) => Promise<${recordTypeName}>
}
`
}

export const renderServiceTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const repositoryName = `${pascalName}Repository`
  const createInputName = `Create${pascalName}Input`
  const inputFields = getInputFields(schema)
  const textLikeFields = inputFields.filter(
    (field) => field.kind === "string" || field.kind === "id",
  )
  const normalizationBlock =
    textLikeFields.length > 0
      ? `${textLikeFields
          .map((field) => {
            const valueName = `${toCamelCase(field.key)}Value`

            if (field.required) {
              return `    const ${valueName} = input.${field.key}.trim()

    if (${valueName}.length === 0) {
      throw new AppError({
        code: "${schema.name.toUpperCase()}_${field.key.toUpperCase()}_REQUIRED",
        message: "${pascalName} ${field.key} is required",
        status: 400,
        expose: true,
      })
    }
`
            }

            return `    const ${valueName} = input.${field.key}?.trim()
`
          })
          .join("\n")}    const normalizedInput: ${createInputName} = {
      ...input,
${inputFields
  .map((field) => {
    if (field.kind === "string" || field.kind === "id") {
      return `      ${field.key}: ${toCamelCase(field.key)}Value,`
    }

    return `      ${field.key}: input.${field.key},`
  })
  .join("\n")}
    }

    return repository.create(normalizedInput)`
      : "return repository.create(input)"

  return `import { AppError } from "../../errors"

import type { ${createInputName}, ${repositoryName} } from "./${schema.name}.repository"

export const create${pascalName}Service = (repository: ${repositoryName}) => ({
  list: () => repository.list(),
  async getById(id: string) {
    const item = await repository.getById(id)

    if (!item) {
      throw new AppError({
        code: "${schema.name.toUpperCase()}_NOT_FOUND",
        message: "${pascalName} not found",
        status: 404,
        expose: true,
        details: { id },
      })
    }

    return item
  },
  async create(input: ${createInputName}) {${normalizationBlock}
  },
})
`
}

export const renderRoutesTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const bodyFields = getInputFields(schema)
    .map(renderBodyFieldValidator)
    .join("\n")

  return `import { t } from "elysia"

import type { ServerModule } from "../module"
import type { ${pascalName}Repository } from "./${schema.name}.repository"
import { create${pascalName}Service } from "./${schema.name}.service"

export const create${pascalName}Module = (
  repository: ${pascalName}Repository,
): ServerModule => ({
  name: "${schema.name}",
  register: (app) => {
    const service = create${pascalName}Service(repository)

    return app
      .get("/${schema.name}s", async () => ({
        items: await service.list(),
      }))
      .get(
        "/${schema.name}s/:id",
        async ({ params }) => service.getById(params.id),
        {
          params: t.Object({
            id: t.String(),
          }),
        },
      )
      .post(
        "/${schema.name}s",
        async ({ body, set }) => {
          set.status = 201
          return service.create(body)
        },
        {
          body: t.Object({
${bodyFields}
          }),
        },
      )
  },
})
`
}

export const renderVuePageTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const recordTypeName = getRecordTypeName(schema)
  const collectionName = `${toCamelCase(schema.name)}Items`
  const endpoint = `/${schema.name}s`
  const primaryDisplayField = getPrimaryDisplayField(schema)?.key ?? "id"

  return `<script setup lang="ts">
import { onMounted, ref } from "vue"

import type { ${recordTypeName} } from "./${schema.name}.schema"

const ${collectionName} = ref<${recordTypeName}[]>([])
const loading = ref(true)
const errorMessage = ref("")

const loadItems = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const response = await fetch("${endpoint}")

    if (!response.ok) {
      throw new Error("${pascalName} request failed")
    }

    const payload = (await response.json()) as { items: ${recordTypeName}[] }
    ${collectionName}.value = payload.items
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Failed to load ${schema.label}"
  } finally {
    loading.value = false
  }
}

onMounted(loadItems)
</script>

<template>
  <section>
    <h1>${schema.label} Module</h1>
    <p v-if="loading">Loading...</p>
    <p v-else-if="errorMessage">{{ errorMessage }}</p>
    <ul v-else>
      <li v-for="item in ${collectionName}" :key="item.id">
        {{ item.${primaryDisplayField} }}
      </li>
    </ul>
  </section>
</template>
`
}

export const renderReactPageTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const recordTypeName = getRecordTypeName(schema)
  const endpoint = `/${schema.name}s`
  const primaryDisplayField = getPrimaryDisplayField(schema)?.key ?? "id"

  return `import { useEffect, useState } from "react"

import type { ${recordTypeName} } from "./${schema.name}.schema"

export const ${pascalName}Page = () => {
  const [items, setItems] = useState<${recordTypeName}[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("${endpoint}")

        if (!response.ok) {
          throw new Error("${pascalName} request failed")
        }

        const payload = (await response.json()) as { items: ${recordTypeName}[] }
        setItems(payload.items)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load ${schema.label}",
        )
      } finally {
        setLoading(false)
      }
    }

    void loadItems()
  }, [])

  if (loading) return <p>Loading...</p>
  if (errorMessage) return <p>{errorMessage}</p>

  return (
    <section>
      <h1>${schema.label} Module</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{String(item.${primaryDisplayField})}</li>
        ))}
      </ul>
    </section>
  )
}
`
}

export const renderPageTemplate = (
  schema: ModuleSchema,
  frontendTarget: FrontendTarget,
) =>
  frontendTarget === "vue"
    ? renderVuePageTemplate(schema)
    : renderReactPageTemplate(schema)

export const renderPagePath = (
  schema: ModuleSchema,
  frontendTarget: FrontendTarget,
) =>
  `modules/${schema.name}/${schema.name}.page.${getPageExtension(frontendTarget)}`

export const renderFrontendArtifactPath = (schema: ModuleSchema) =>
  `modules/${schema.name}/${schema.name}.frontend.ts`

export const renderFrontendArtifactName = (schema: ModuleSchema) =>
  `${toCamelCase(schema.name)}FrontendModuleArtifact`

const deriveArtifactPermissions = (
  schema: ModuleSchema,
): Record<string, string> => {
  const prefix = schema.frontend?.permissionPrefix ?? schema.name
  const actions = schema.frontend?.permissionActions ?? {
    list: true,
    create: true,
    update: true,
  }
  const permissions: Record<string, string> = {}

  if (actions.list) permissions.list = `${prefix}:list`
  if (actions.create) permissions.create = `${prefix}:create`
  if (actions.update) permissions.update = `${prefix}:update`
  if (actions.delete) permissions.delete = `${prefix}:delete`
  if (actions.export) permissions.export = `${prefix}:export`

  return permissions
}

const deriveArtifactI18nKeys = (moduleName: string) => ({
  sectionTitle: `app.${moduleName}.sectionTitle`,
  sectionCopy: `app.${moduleName}.sectionCopy`,
  shellTitle: `app.${moduleName}.shellTitle`,
  shellDescription: `app.${moduleName}.shellDescription`,
})

export const renderFrontendArtifactTemplate = (
  schema: ModuleSchema,
  frontendTarget: FrontendTarget,
) => {
  const artifactName = renderFrontendArtifactName(schema)
  const pageComponentPath = renderPagePath(schema, frontendTarget)
  const standardCrudSurface =
    frontendTarget === "vue" && isStandardCrudSchema(schema)
  const primaryFieldKey = getPrimaryDisplayField(schema)?.key ?? "id"
  const searchableFieldKeys = schema.fields
    .filter((field) => field.searchable === true)
    .map((field) => field.key)
  const kind = schema.frontend?.workspaceKind ?? schema.name
  const moduleCode = schema.frontend?.moduleCode ?? schema.name
  const permissions = deriveArtifactPermissions(schema)
  const i18nKeys = deriveArtifactI18nKeys(schema.name)

  return `export interface GeneratedFrontendModuleArtifact {
  fieldKeys: string[]
  frontendTarget: "vue" | "react"
  i18nKeys: {
    sectionCopy: string
    sectionTitle: string
    shellDescription: string
    shellTitle: string
  }
  kind: string
  moduleCode: string
  panelComponentPath: string | null
  pageComponentPath: string
  permissionPrefix: string | null
  permissions: Record<string, string>
  primaryFieldKey: string
  routePath: string | null
  searchableFieldKeys: string[]
  surfaceKind: "page-only" | "standard-crud-enterprise"
  workspaceComponentPath: string | null
  workspaceDomain: "business" | "system" | null
}

export const ${artifactName}: GeneratedFrontendModuleArtifact = {
  moduleCode: ${JSON.stringify(moduleCode)},
  frontendTarget: ${JSON.stringify(frontendTarget)},
  workspaceDomain: ${JSON.stringify(schema.frontend?.workspaceDomain ?? null)},
  routePath: ${JSON.stringify(schema.frontend?.routePath ?? null)},
  permissionPrefix: ${JSON.stringify(schema.frontend?.permissionPrefix ?? null)},
  surfaceKind: ${JSON.stringify(
    standardCrudSurface ? "standard-crud-enterprise" : "page-only",
  )},
  pageComponentPath: ${JSON.stringify(pageComponentPath)},
  panelComponentPath: ${JSON.stringify(
    standardCrudSurface ? renderPagePanelPath(schema) : null,
  )},
  workspaceComponentPath: ${JSON.stringify(
    standardCrudSurface ? renderWorkspaceTemplatePath(schema) : null,
  )},
  primaryFieldKey: ${JSON.stringify(primaryFieldKey)},
  fieldKeys: ${JSON.stringify(
    schema.fields.map((field) => field.key),
    null,
    2,
  )},
  searchableFieldKeys: ${JSON.stringify(searchableFieldKeys, null, 2)},
  kind: ${JSON.stringify(kind)},
  permissions: ${JSON.stringify(permissions, null, 2)},
  i18nKeys: ${JSON.stringify(i18nKeys, null, 2)},
}
`
}

export interface RenderedFrontendArtifactModule {
  artifactName: string
  contents: string
  path: string
}

export const renderFrontendArtifactModule = (
  schema: ModuleSchema,
  frontendTarget: FrontendTarget,
): RenderedFrontendArtifactModule => ({
  artifactName: renderFrontendArtifactName(schema),
  path: renderFrontendArtifactPath(schema),
  contents: renderFrontendArtifactTemplate(schema, frontendTarget),
})

export const getTemplateReason = (
  path: string,
  options?: { enterprise?: boolean },
) => {
  if (path.endsWith(".schema.ts")) {
    return "Persist the module schema alongside generated module artifacts."
  }

  if (path.endsWith(".repository.ts")) {
    return "Provide the persistence-facing module repository boundary."
  }

  if (path.endsWith(".service.ts")) {
    return "Host the generated application service entry for the module."
  }

  if (path.endsWith(".routes.ts")) {
    return "Expose the server-side route registration entry for the module."
  }

  if (path.endsWith(".frontend.ts")) {
    return "Emit a static frontend registration artifact for generated module integration."
  }

  if (path.endsWith("-panel.vue")) {
    return "Emit the enterprise CRUD workspace detail/form panel for the module."
  }

  if (path.endsWith("-workspace.ts")) {
    return "Emit the workspace composable wiring for the module's CRUD state machine."
  }

  if (options?.enterprise) {
    return "Emit the enterprise CRUD workspace main view for the module."
  }

  return "Provide a generated management page implementation for the selected frontend target."
}

export const collectPageFields = (fields: ModuleField[]) =>
  fields.map((field) => field.key)
