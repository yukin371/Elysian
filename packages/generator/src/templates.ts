import type { ModuleField, ModuleSchema } from "@elysian/schema"

import { toCamelCase, toPascalCase } from "./naming"

export type FrontendTarget = "vue" | "react"

export interface RenderModuleTemplatesOptions {
  frontendTarget?: FrontendTarget
}

const getPageExtension = (frontendTarget: FrontendTarget) =>
  frontendTarget === "vue" ? "vue" : "tsx"

const SYSTEM_FIELD_KEYS = new Set(["id", "createdAt", "updatedAt"])

const getInputFields = (schema: ModuleSchema) =>
  schema.fields.filter((field) => !SYSTEM_FIELD_KEYS.has(field.key))

const getFieldTypeAnnotation = (schema: ModuleSchema, field: ModuleField) => {
  const pascalName = toPascalCase(schema.name)

  switch (field.kind) {
    case "boolean":
      return "boolean"
    case "number":
      return "number"
    case "enum":
      return field.key === "status" ? `${pascalName}Status` : "string"
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

export const renderSchemaTemplate = (schema: ModuleSchema) => {
  const symbolName = `${toCamelCase(schema.name)}ModuleSchema`

  return `import { ${symbolName} } from "@elysian/schema"

export const moduleSchema = ${symbolName}
`
}

export const renderRepositoryTemplate = (schema: ModuleSchema) => {
  const pascalName = toPascalCase(schema.name)
  const recordTypeName = `${pascalName}Record`
  const repositoryName = `${pascalName}Repository`
  const createInputName = `Create${pascalName}Input`
  const createFields = renderCreateInputFields(schema)
  const statusField = schema.fields.find((field) => field.key === "status")

  return `import type { ${recordTypeName}${
    statusField ? `, ${pascalName}Status` : ""
  } } from "@elysian/schema"

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
  const collectionName = `${toCamelCase(schema.name)}Items`
  const endpoint = `/${schema.name}s`
  const primaryDisplayField = getPrimaryDisplayField(schema)?.key ?? "id"

  return `<script setup lang="ts">
import { onMounted, ref } from "vue"

import type { ${pascalName}Record } from "@elysian/schema"

const ${collectionName} = ref<${pascalName}Record[]>([])
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

    const payload = (await response.json()) as { items: ${pascalName}Record[] }
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
  const endpoint = `/${schema.name}s`
  const primaryDisplayField = getPrimaryDisplayField(schema)?.key ?? "id"

  return `import { useEffect, useState } from "react"

import type { ${pascalName}Record } from "@elysian/schema"

export const ${pascalName}Page = () => {
  const [items, setItems] = useState<${pascalName}Record[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await fetch("${endpoint}")

        if (!response.ok) {
          throw new Error("${pascalName} request failed")
        }

        const payload = (await response.json()) as { items: ${pascalName}Record[] }
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

export const getTemplateReason = (path: string) => {
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

  return "Provide a generated management page implementation for the selected frontend target."
}

export const collectPageFields = (fields: ModuleField[]) =>
  fields.map((field) => field.key)
