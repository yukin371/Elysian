type ScaffoldField = {
  key: string
  kind: "string" | "text" | "number" | "boolean" | "enum" | "json" | "datetime"
  options?: string[]
  required?: boolean
  searchable?: boolean
}

type ScaffoldSchema = {
  fields: ScaffoldField[]
  name: string
}

export function generateScaffoldSchema(moduleName: string): string {
  const trimmedModuleName = moduleName.trim()
  const scaffold: ScaffoldSchema = {
    name: trimmedModuleName,
    fields: [
      { key: "name", kind: "string", required: true, searchable: true },
      { key: "code", kind: "string", searchable: true },
      { key: "description", kind: "text" },
      { key: "metadata", kind: "json" },
      { key: "sort", kind: "number" },
      { key: "enabled", kind: "boolean" },
      {
        key: "status",
        kind: "enum",
        options: ["draft", "active", "archived"],
      },
      { key: "createdAt", kind: "datetime" },
    ],
  }

  return JSON.stringify(scaffold, null, 2)
}
