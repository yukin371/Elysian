export const toPascalCase = (value: string) =>
  value
    .split(/[^a-zA-Z0-9]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("")

export const toCamelCase = (value: string) => {
  const pascal = toPascalCase(value)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

export const toSnakeCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
