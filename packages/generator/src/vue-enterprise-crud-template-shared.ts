import type { ModuleField, ModuleSchema } from "@elysian/schema"
export const renderPagePanelPath = (schema: ModuleSchema) =>
  `modules/${schema.name}/${schema.name}-panel.vue`

export const renderWorkspaceTemplatePath = (schema: ModuleSchema) =>
  `modules/${schema.name}/${schema.name}-workspace.ts`

export const SYSTEM_FIELD_KEYS = new Set(["id", "createdAt", "updatedAt"])

export const renderFieldDefaultValue = (field: ModuleField): string => {
  if (field.kind === "boolean") return "false"
  if (field.kind === "number") return "0"
  if (field.kind === "json") return "null"
  if (field.kind === "enum") {
    const firstOption = field.options?.[0]

    if (firstOption) {
      return JSON.stringify(firstOption.value)
    }
  }
  if (field.kind === "datetime") return '""'
  return '""'
}

export const renderFilterBody = (schema: ModuleSchema): string => {
  const searchableFields = schema.fields.filter(
    (field) => field.searchable === true,
  )

  if (searchableFields.length === 0) {
    return "  return items"
  }

  const normalizeLines = searchableFields
    .filter((f) => f.kind === "string" || f.kind === "id")
    .map(
      (f) =>
        `  const ${f.key} = String(query.${f.key} ?? "").trim().toLowerCase()`,
    )
    .join("\n")

  const filterConditions = searchableFields
    .map((f) => {
      if (f.kind === "string" || f.kind === "id") {
        return `    if (${f.key}.length > 0 && !String(item.${f.key} ?? "").toLowerCase().includes(${f.key})) return false`
      }
      if (f.kind === "enum" || f.kind === "boolean") {
        return `    if (query.${f.key} !== undefined && query.${f.key} !== null && query.${f.key} !== "" && item.${f.key} !== query.${f.key}) return false`
      }
      return `    if (query.${f.key} !== undefined && query.${f.key} !== null && query.${f.key} !== "" && item.${f.key} !== query.${f.key}) return false`
    })
    .join("\n")

  const hasTextFields = searchableFields.some(
    (f) => f.kind === "string" || f.kind === "id",
  )

  return `${hasTextFields ? `${normalizeLines}\n\n` : ""}  return items.filter((item) => {\n${filterConditions}\n\n    return true\n  })`
}

const pluralizePascalName = (value: string) =>
  /[^aeiou]y$/i.test(value) ? `${value.slice(0, -1)}ies` : `${value}s`

export const getViewPermissionPropName = (
  schemaName: string,
  pascalName: string,
) => {
  if (schemaName === "dictionary") {
    return "canViewDictionaries"
  }

  return `canView${pluralizePascalName(pascalName)}`
}

export const getCreatePermissionPropName = (
  schemaName: string,
  pascalName: string,
) => {
  if (schemaName === "dictionary") {
    return "canCreateDictionaryTypes"
  }

  return `canCreate${pluralizePascalName(pascalName)}`
}

export const getUpdatePermissionPropName = (
  schemaName: string,
  pascalName: string,
) => {
  if (schemaName === "dictionary") {
    return "canUpdateDictionaryTypes"
  }

  return `canUpdate${pluralizePascalName(pascalName)}`
}

export const getPanelModeType = (schemaName: string) => {
  if (schemaName === "notification") {
    return '"detail" | "create"'
  }

  if (schemaName === "user") {
    return '"detail" | "create" | "edit" | "reset"'
  }

  return '"detail" | "create" | "edit"'
}

export const getSelectedStateProperty = (
  schemaName: string,
  pascalName: string,
) => {
  if (schemaName === "dictionary") {
    return "selectedDictionaryType"
  }

  return `selected${pascalName}`
}

export const getWorkspacePanelExtraState = (schemaName: string) => {
  switch (schemaName) {
    case "department":
      return `  parentLookup?: { value: Map<string, unknown> }
  selectedDepartmentDetail?: { value: { userIds?: string[] } | null }
`
    case "dictionary":
      return `  selectedDictionaryTypeItems?: {
    value: Array<{
      id?: string
      value?: string
      label?: string
      status?: string
      sort?: number
      isDefault?: boolean
    }>
  }
`
    case "menu":
      return `  parentLookup?: { value: Map<string, unknown> }
  selectedMenuDetail?: { value: { roleIds?: string[] } | null }
`
    case "role":
      return `  selectedRoleDetail?: {
    value: {
      permissionCodes?: string[]
      userIds?: string[]
      deptIds?: string[]
    } | null
  }
`
    default:
      return ""
  }
}
