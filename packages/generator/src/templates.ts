import type { ModuleField, ModuleSchema } from "@elysian/schema"

import type { DatabaseColumnPlan } from "./database-change-plan"
import { buildModuleDatabaseChangePlan } from "./database-change-plan"
import {
  pluralizeIdentifier,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
} from "./naming"
import type { GenerationTargetPreset } from "./shared-conventions"
import { isStandardCrudSchema } from "./standard-crud"
import {
  renderModuleBasePath,
  renderPagePanelPath,
  renderWorkspaceTemplatePath,
} from "./vue-enterprise-crud-templates"

export type FrontendTarget = "vue" | "react"

export interface RenderModuleTemplatesOptions {
  frontendTarget?: FrontendTarget
  schemaArtifactSource?: "package" | "inline"
  targetPreset?: GenerationTargetPreset
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
    case "json":
      return "Record<string, unknown>"
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
      case "json":
        return "t.Record(t.String(), t.Unknown())"
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
  const collectionPath = `/${pluralizeIdentifier(schema.name)}`
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
      .get("${collectionPath}", async () => ({
        items: await service.list(),
      }))
      .get(
        "${collectionPath}/:id",
        async ({ params }) => service.getById(params.id),
        {
          params: t.Object({
            id: t.String(),
          }),
        },
      )
      .post(
        "${collectionPath}",
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
  const endpoint = `/${pluralizeIdentifier(schema.name)}`
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
  const endpoint = `/${pluralizeIdentifier(schema.name)}`
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
  targetPreset?: GenerationTargetPreset,
) =>
  `${renderModuleBasePath(schema, targetPreset)}/${schema.name}.page.${getPageExtension(frontendTarget)}`

export const renderFrontendArtifactPath = (
  schema: ModuleSchema,
  targetPreset?: GenerationTargetPreset,
) => `${renderModuleBasePath(schema, targetPreset)}/${schema.name}.frontend.ts`

export const renderModuleRegistrationPath = (
  schema: ModuleSchema,
  targetPreset?: GenerationTargetPreset,
) => `${renderModuleBasePath(schema, targetPreset)}/${schema.name}.module.ts`

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
  targetPreset?: GenerationTargetPreset,
) => {
  const artifactName = renderFrontendArtifactName(schema)
  const pageComponentPath = renderPagePath(schema, frontendTarget, targetPreset)
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
    standardCrudSurface ? renderPagePanelPath(schema, targetPreset) : null,
  )},
  workspaceComponentPath: ${JSON.stringify(
    standardCrudSurface
      ? renderWorkspaceTemplatePath(schema, targetPreset)
      : null,
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
  targetPreset?: GenerationTargetPreset,
): RenderedFrontendArtifactModule => ({
  artifactName: renderFrontendArtifactName(schema),
  path: renderFrontendArtifactPath(schema, targetPreset),
  contents: renderFrontendArtifactTemplate(
    schema,
    frontendTarget,
    targetPreset,
  ),
})

const getPersistenceEnumName = (
  schema: ModuleSchema,
  column: DatabaseColumnPlan,
) => `${toCamelCase(schema.name)}${toPascalCase(column.sourceFieldKey)}`

const getPersistenceColumnBase = (
  schema: ModuleSchema,
  column: DatabaseColumnPlan,
) => {
  switch (column.sqlType) {
    case "uuid":
      return `uuid("${column.name}")`
    case "integer":
      return `integer("${column.name}")`
    case "boolean":
      return `boolean("${column.name}")`
    case "jsonb":
      return `jsonb("${column.name}")`
    case "timestamptz":
      return `timestamp("${column.name}", { withTimezone: true })`
    default:
      if (
        column.sourceFieldKind === "enum" &&
        column.dictionaryTypeCode !== null
      ) {
        return `text("${column.name}")`
      }

      if (column.sourceFieldKind === "enum" && column.enumOptions.length > 0) {
        return `${getPersistenceEnumName(schema, column)}("${column.name}")`
      }

      return `text("${column.name}")`
  }
}

export const renderPersistenceSchemaTemplate = (schema: ModuleSchema) => {
  const plan = buildModuleDatabaseChangePlan(schema)
  const operation = plan.operations[0]

  if (!operation) {
    throw new Error(`No table plan available for schema "${schema.name}".`)
  }

  const tableName = operation.tableName
  const tableConstName = toCamelCase(tableName)
  const pascalName = toPascalCase(schema.name)
  const requiredImports = new Set(["pgTable"])

  for (const column of operation.columns) {
    switch (column.sqlType) {
      case "uuid":
        requiredImports.add("uuid")
        break
      case "integer":
        requiredImports.add("integer")
        break
      case "boolean":
        requiredImports.add("boolean")
        break
      case "jsonb":
        requiredImports.add("jsonb")
        break
      case "timestamptz":
        requiredImports.add("timestamp")
        break
      default:
        requiredImports.add("text")
        break
    }

    if (
      column.sourceFieldKind === "enum" &&
      column.enumOptions.length > 0 &&
      column.dictionaryTypeCode === null
    ) {
      requiredImports.add("pgEnum")
    }
  }

  const enumLines = operation.columns.flatMap((column) => {
    if (
      column.sourceFieldKind !== "enum" ||
      column.enumOptions.length === 0 ||
      column.dictionaryTypeCode !== null
    ) {
      return []
    }

    const options = column.enumOptions.map((option) => `"${option}"`).join(", ")

    return [
      `export const ${getPersistenceEnumName(schema, column)} = pgEnum("${toSnakeCase(schema.name)}_${column.name}", [${options}])`,
    ]
  })

  const columnLines = operation.columns.map((column) => {
    const modifiers: string[] = []

    if (column.defaultExpression === "gen_random_uuid()") {
      modifiers.push(".defaultRandom()")
    }

    if (column.primaryKey) {
      modifiers.push(".primaryKey()")
    }

    if (column.required && !column.primaryKey) {
      modifiers.push(".notNull()")
    }

    return `  ${column.sourceFieldKey}: ${getPersistenceColumnBase(schema, column)}${modifiers.join("")},`
  })

  return [
    'import type { InferInsertModel, InferSelectModel } from "drizzle-orm"',
    `import { ${[...requiredImports].sort().join(", ")} } from "drizzle-orm/pg-core"`,
    "",
    ...(enumLines.length > 0 ? [...enumLines, ""] : []),
    `export const ${tableConstName} = pgTable("${tableName}", {`,
    ...columnLines,
    "})",
    "",
    `export type ${pascalName}Row = InferSelectModel<typeof ${tableConstName}>`,
    `export type New${pascalName}Row = InferInsertModel<typeof ${tableConstName}>`,
    "",
  ].join("\n")
}

export const renderModuleRegistrationTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)

  return `import type { DatabaseClient } from "@elysian/persistence"

import type { AuthGuard } from "../auth"
import type { ServerModule } from "../module"
import type { ${pascalName}Repository, Create${pascalName}Input } from "./${schema.name}.repository"
import type { ${pascalName}Record } from "./${schema.name}.schema"
import { create${pascalName}Module as create${pascalName}RoutesModule } from "./${schema.name}.routes"

export interface ${pascalName}ModuleOptions {
  authGuard?: AuthGuard
}

export const create${pascalName}Repository = (
  _db: DatabaseClient,
): ${pascalName}Repository => ({
  list: async () => {
    // TODO: implement list query with the canonical persistence owner.
    return [] as ${pascalName}Record[]
  },
  getById: async (_id: string) => {
    // TODO: implement detail query with the canonical persistence owner.
    return null
  },
  create: async (_input: Create${pascalName}Input) => {
    // TODO: implement create mutation with the canonical persistence owner.
    throw new Error("TODO: implement create${pascalName}Repository.create")
  },
})

export const create${pascalName}Module = (
  db: DatabaseClient,
  options: ${pascalName}ModuleOptions = {},
): ServerModule => {
  const repository = create${pascalName}Repository(db)

  return create${pascalName}RoutesModule(repository, options)
}
`
}

export const getTemplateReason = (
  path: string,
  options?: { enterprise?: boolean },
) => {
  if (path.endsWith(".schema.ts")) {
    return "Persist the module schema alongside generated module artifacts."
  }

  if (path.endsWith(".persistence.ts")) {
    return "Emit a Drizzle persistence schema template for manual integration into packages/persistence."
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

  if (path.endsWith(".module.ts")) {
    return "Emit a server module assembly stub that bridges repository wiring into generated routes."
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
