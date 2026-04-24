export const moduleSchemaVersion = 1

export const moduleFieldKinds = [
  "id",
  "string",
  "number",
  "boolean",
  "enum",
  "datetime",
] as const

export type ModuleFieldKind = (typeof moduleFieldKinds)[number]

export interface ModuleSchemaValidationIssue {
  path: string
  message: string
}

const moduleFieldKindSet = new Set<ModuleFieldKind>(moduleFieldKinds)
const moduleSchemaKeySet = new Set<keyof ModuleSchema>([
  "name",
  "label",
  "fields",
])
const moduleFieldKeySet = new Set<keyof ModuleField>([
  "key",
  "label",
  "kind",
  "required",
  "searchable",
  "options",
  "dictionaryTypeCode",
])
const moduleFieldOptionKeySet = new Set<keyof ModuleFieldOption>([
  "label",
  "value",
])

const isRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null && !Array.isArray(input)

const isNonEmptyString = (input: unknown): input is string =>
  typeof input === "string" && input.trim().length > 0

const pushUnknownKeyIssues = (
  issues: ModuleSchemaValidationIssue[],
  input: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
  pathPrefix: string,
  ownerName: string,
) => {
  for (const key of Object.keys(input)) {
    if (!allowedKeys.has(key)) {
      issues.push({
        path: pathPrefix ? `${pathPrefix}.${key}` : key,
        message: `${ownerName} does not allow unknown property "${key}".`,
      })
    }
  }
}

export interface ModuleFieldOption {
  label: string
  value: string
}

export interface ModuleField {
  key: string
  label: string
  kind: ModuleFieldKind
  required?: boolean
  searchable?: boolean
  options?: ModuleFieldOption[]
  dictionaryTypeCode?: string
}

export interface ModuleSchema {
  name: string
  label: string
  fields: ModuleField[]
}

export const validateModuleSchema = (
  input: unknown,
): ModuleSchemaValidationIssue[] => {
  const issues: ModuleSchemaValidationIssue[] = []

  if (!isRecord(input)) {
    return [
      {
        path: "$",
        message: "Module schema must be a JSON object.",
      },
    ]
  }

  pushUnknownKeyIssues(issues, input, moduleSchemaKeySet, "", "Module schema")

  if (!isNonEmptyString(input.name)) {
    issues.push({
      path: "name",
      message: "Module name must be a non-empty string.",
    })
  }

  if (!isNonEmptyString(input.label)) {
    issues.push({
      path: "label",
      message: "Module label must be a non-empty string.",
    })
  }

  if (!Array.isArray(input.fields) || input.fields.length === 0) {
    issues.push({
      path: "fields",
      message: "Module fields must be a non-empty array.",
    })
    return issues
  }

  const seenKeys = new Map<string, number>()
  const idFieldIndexes: number[] = []

  for (const [index, field] of input.fields.entries()) {
    const fieldPath = `fields[${index}]`

    if (!isRecord(field)) {
      issues.push({
        path: fieldPath,
        message: "Field must be an object.",
      })
      continue
    }

    pushUnknownKeyIssues(issues, field, moduleFieldKeySet, fieldPath, "Field")

    if (!isNonEmptyString(field.key)) {
      issues.push({
        path: `${fieldPath}.key`,
        message: "Field key must be a non-empty string.",
      })
    } else {
      const previousIndex = seenKeys.get(field.key)

      if (previousIndex !== undefined) {
        issues.push({
          path: `${fieldPath}.key`,
          message: `Field key "${field.key}" duplicates fields[${previousIndex}].key.`,
        })
      } else {
        seenKeys.set(field.key, index)
      }

      if (field.key === "id") {
        idFieldIndexes.push(index)
      }
    }

    if (!isNonEmptyString(field.label)) {
      issues.push({
        path: `${fieldPath}.label`,
        message: "Field label must be a non-empty string.",
      })
    }

    if (
      typeof field.kind !== "string" ||
      !moduleFieldKindSet.has(field.kind as ModuleFieldKind)
    ) {
      issues.push({
        path: `${fieldPath}.kind`,
        message: `Field kind must be one of: ${moduleFieldKinds.join(", ")}.`,
      })
    }

    if (
      "required" in field &&
      field.required !== undefined &&
      typeof field.required !== "boolean"
    ) {
      issues.push({
        path: `${fieldPath}.required`,
        message: "Field required flag must be a boolean when provided.",
      })
    }

    if (
      "searchable" in field &&
      field.searchable !== undefined &&
      typeof field.searchable !== "boolean"
    ) {
      issues.push({
        path: `${fieldPath}.searchable`,
        message: "Field searchable flag must be a boolean when provided.",
      })
    }

    if (
      "dictionaryTypeCode" in field &&
      field.dictionaryTypeCode !== undefined &&
      !isNonEmptyString(field.dictionaryTypeCode)
    ) {
      issues.push({
        path: `${fieldPath}.dictionaryTypeCode`,
        message: "dictionaryTypeCode must be a non-empty string when provided.",
      })
    }

    if ("options" in field && field.options !== undefined) {
      if (!Array.isArray(field.options)) {
        issues.push({
          path: `${fieldPath}.options`,
          message: "Field options must be an array when provided.",
        })
      } else {
        for (const [optionIndex, option] of field.options.entries()) {
          const optionPath = `${fieldPath}.options[${optionIndex}]`

          if (!isRecord(option)) {
            issues.push({
              path: optionPath,
              message: "Field option must be an object.",
            })
            continue
          }

          pushUnknownKeyIssues(
            issues,
            option,
            moduleFieldOptionKeySet,
            optionPath,
            "Field option",
          )

          if (!isNonEmptyString(option.label)) {
            issues.push({
              path: `${optionPath}.label`,
              message: "Field option label must be a non-empty string.",
            })
          }

          if (!isNonEmptyString(option.value)) {
            issues.push({
              path: `${optionPath}.value`,
              message: "Field option value must be a non-empty string.",
            })
          }
        }
      }
    }

    if (field.kind === "enum") {
      const hasDictionaryTypeCode = isNonEmptyString(field.dictionaryTypeCode)
      const hasStaticOptions =
        Array.isArray(field.options) && field.options.length > 0

      if (!hasDictionaryTypeCode && !hasStaticOptions) {
        issues.push({
          path: fieldPath,
          message:
            "Enum field must provide non-empty options or dictionaryTypeCode.",
        })
      }
    }
  }

  if (idFieldIndexes.length === 0) {
    issues.push({
      path: "fields",
      message: 'Module schema must contain exactly one "id" field.',
    })
  }

  if (idFieldIndexes.length > 1) {
    issues.push({
      path: "fields",
      message: 'Module schema must not contain more than one "id" field.',
    })
  }

  if (idFieldIndexes.length === 1) {
    const idFieldIndex = idFieldIndexes[0] as number
    const idField = input.fields[idFieldIndex]

    if (isRecord(idField) && idField.kind !== "id") {
      issues.push({
        path: `fields[${idFieldIndex}].kind`,
        message: 'The "id" field must use kind "id".',
      })
    }

    if (isRecord(idField) && idField.required !== true) {
      issues.push({
        path: `fields[${idFieldIndex}].required`,
        message: 'The "id" field must set required=true.',
      })
    }
  }

  return issues
}

export const isModuleSchema = (input: unknown): input is ModuleSchema =>
  validateModuleSchema(input).length === 0

export {
  customerModuleSchema,
  type CustomerRecord,
  type CustomerStatus,
} from "./customer"
export { fileModuleSchema, type FileRecord } from "./file"
export {
  dictionaryModuleSchema,
  type DictionaryItemRecord,
  type DictionaryStatus,
  type DictionaryTypeDetailRecord,
  type DictionaryTypeRecord,
} from "./dictionary"
export {
  departmentModuleSchema,
  type DepartmentDetailRecord,
  type DepartmentRecord,
  type DepartmentStatus,
} from "./department"
export {
  menuModuleSchema,
  type MenuDetailRecord,
  type MenuRecord,
  type MenuStatus,
  type MenuType,
} from "./menu"
export {
  notificationModuleSchema,
  type NotificationLevel,
  type NotificationRecord,
  type NotificationStatus,
} from "./notification"
export {
  operationLogModuleSchema,
  type OperationLogRecord,
  type OperationLogResult,
} from "./operation-log"
export {
  productModuleSchema,
  type ProductRecord,
  type ProductStatus,
} from "./product"
export {
  roleModuleSchema,
  type RoleDataScope,
  type RoleDetailRecord,
  type RoleRecord,
  type RoleStatus,
} from "./role"
export {
  settingModuleSchema,
  type SettingRecord,
  type SettingStatus,
} from "./setting"
export {
  userModuleSchema,
  type UserRecord,
  type UserStatus,
} from "./user"

export const sampleModuleSchema: ModuleSchema = {
  name: "sample",
  label: "Sample",
  fields: [{ key: "id", label: "ID", kind: "id", required: true }],
}
