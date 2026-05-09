export interface GeneratorPreviewSchemaTemplate {
  id: string
  label: string
  description: string
  schema: Record<string, unknown>
}

const schemaTemplates: GeneratorPreviewSchemaTemplate[] = [
  {
    id: "simple-crud",
    label: "Simple CRUD",
    description: "Basic CRUD with name, code, sort, and lifecycle fields",
    schema: {
      name: "module_name",
      fields: [
        { key: "name", kind: "string", required: true, searchable: true },
        { key: "description", kind: "string" },
        { key: "code", kind: "string", searchable: true },
        { key: "sort", kind: "number" },
        { key: "enabled", kind: "boolean" },
        { key: "createdAt", kind: "datetime" },
        { key: "updatedAt", kind: "datetime" },
      ],
    },
  },
  {
    id: "with-status",
    label: "CRUD with Status",
    description: "CRUD scaffold with a status enum field",
    schema: {
      name: "module_name",
      fields: [
        { key: "name", kind: "string", required: true, searchable: true },
        { key: "code", kind: "string", searchable: true },
        {
          key: "status",
          kind: "enum",
          required: true,
          searchable: true,
          options: ["draft", "active", "archived"],
        },
        { key: "enabled", kind: "boolean" },
        { key: "createdAt", kind: "datetime" },
        { key: "updatedAt", kind: "datetime" },
      ],
    },
  },
  {
    id: "with-dictionary",
    label: "CRUD with Dictionary",
    description: "CRUD scaffold with a dictionary-backed enum field",
    schema: {
      name: "module_name",
      fields: [
        { key: "name", kind: "string", required: true, searchable: true },
        {
          key: "type",
          kind: "enum",
          required: true,
          searchable: true,
          dictionaryTypeCode: "module_type",
        },
        { key: "sort", kind: "number" },
        { key: "enabled", kind: "boolean" },
        { key: "createdAt", kind: "datetime" },
        { key: "updatedAt", kind: "datetime" },
      ],
    },
  },
]

export const listSchemaTemplateIds = (): string[] =>
  schemaTemplates.map((template) => template.id)

export const listSchemaTemplates = (): GeneratorPreviewSchemaTemplate[] =>
  schemaTemplates

export const getSchemaTemplate = (id: string): string => {
  const template = schemaTemplates.find((candidate) => candidate.id === id)

  if (!template) {
    throw new Error(`Unknown schema template: ${id}`)
  }

  return JSON.stringify(template.schema, null, 2)
}
