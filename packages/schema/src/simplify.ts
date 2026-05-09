import {
  type ModuleField,
  type ModuleFieldKind,
  type ModuleFieldOption,
  type ModuleFrontendSchema,
  type ModuleSchema,
  formatValidationIssues,
  isModuleSchema,
  validateModuleSchema,
} from "./index"

export interface SimplifiedField {
  key: string
  kind: ModuleFieldKind | string
  label?: string
  required?: boolean
  searchable?: boolean
  options?: string[] | ModuleFieldOption[]
  dictionaryTypeCode?: string
  validation?: Record<string, unknown>
}

export interface SimplifiedModuleSchema {
  name: string
  label?: string
  fields: SimplifiedField[]
  frontend?: ModuleFrontendSchema
}

const toAutoLabel = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[-_\s]+/)
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const normalizeOptions = (
  options: SimplifiedField["options"],
): ModuleFieldOption[] | undefined => {
  if (!options || options.length === 0) {
    return undefined
  }

  if (typeof options[0] === "string") {
    return (options as string[]).map((value) => ({
      label: value,
      value,
    }))
  }

  return options as ModuleFieldOption[]
}

const buildDefaultFrontend = (name: string): ModuleFrontendSchema => ({
  workspaceDomain: "business",
  routePath: `/business/${name}`,
  permissionPrefix: `business:${name}`,
  moduleCode: name,
  workspaceKind: "standard-crud",
  permissionActions: {
    list: true,
    create: true,
    update: true,
    delete: true,
    export: true,
  },
})

const toModuleField = (field: SimplifiedField): ModuleField => {
  const normalizedOptions = normalizeOptions(field.options)

  return {
    key: field.key,
    label:
      field.key === "id"
        ? (field.label ?? "ID")
        : (field.label ?? toAutoLabel(field.key)),
    kind: field.kind as ModuleFieldKind,
    ...(field.key === "id"
      ? { required: true }
      : field.required !== undefined
        ? { required: field.required }
        : {}),
    ...(field.searchable !== undefined ? { searchable: field.searchable } : {}),
    ...(normalizedOptions ? { options: normalizedOptions } : {}),
    ...(field.dictionaryTypeCode
      ? { dictionaryTypeCode: field.dictionaryTypeCode }
      : {}),
    ...(field.validation
      ? { validation: field.validation as ModuleField["validation"] }
      : {}),
  }
}

export const expandSimplifiedSchema = (input: unknown): ModuleSchema => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Schema must be a non-null object.")
  }

  if (isModuleSchema(input)) {
    return input
  }

  const raw = input as Partial<SimplifiedModuleSchema>

  if (typeof raw.name !== "string" || raw.name.trim().length === 0) {
    throw new Error("Schema 'name' is required and must be a non-empty string.")
  }

  if (!Array.isArray(raw.fields) || raw.fields.length === 0) {
    throw new Error("Schema 'fields' must be a non-empty array.")
  }

  const hasIdField = raw.fields.some(
    (field) => field && typeof field === "object" && field.key === "id",
  )
  const fields: ModuleField[] = hasIdField
    ? []
    : [{ key: "id", label: "ID", kind: "id", required: true }]

  for (const field of raw.fields) {
    fields.push(toModuleField(field))
  }

  const schema: ModuleSchema = {
    name: raw.name,
    label: raw.label?.trim() || toAutoLabel(raw.name),
    fields,
    frontend: raw.frontend ?? buildDefaultFrontend(raw.name),
  }
  const issues = validateModuleSchema(schema)

  if (issues.length > 0) {
    throw new Error(formatValidationIssues(issues))
  }

  return schema
}
