import type { ElyFormCopy, ElyFormField } from "./contracts"

export const formatReadonlyFieldValue = (
  field: ElyFormField,
  value: unknown,
  copy?: ElyFormCopy,
) => {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  if (field.input === "switch") {
    return value
      ? (field.readonlyTrueLabel ?? copy?.switchEnabled ?? "启用")
      : (field.readonlyFalseLabel ?? copy?.switchDisabled ?? "停用")
  }

  if (field.input === "select" && field.options) {
    return (
      field.options.find((option) => option.value === value)?.label ??
      String(value)
    )
  }

  if (field.input === "date" || field.input === "datetime") {
    return new Date(String(value)).toLocaleString()
  }

  if (
    field.input === "textarea" &&
    typeof value === "object" &&
    value !== null
  ) {
    return JSON.stringify(value, null, 2)
  }

  return String(value)
}
