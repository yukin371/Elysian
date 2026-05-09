export const moduleSchemaVersion = 1

import { customerModuleSchema } from "./customer"
import { departmentModuleSchema } from "./department"
import { dictionaryModuleSchema } from "./dictionary"
import { fileModuleSchema } from "./file"
import { menuModuleSchema } from "./menu"
import { notificationModuleSchema } from "./notification"
import { operationLogModuleSchema } from "./operation-log"
import { postModuleSchema } from "./post"
import { productModuleSchema } from "./product"
import { roleModuleSchema } from "./role"
import { settingModuleSchema } from "./setting"
import { tenantModuleSchema } from "./tenant"
import { userModuleSchema } from "./user"
import { workflowModuleSchema } from "./workflow"

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
  "frontend",
])
const moduleFieldKeySet = new Set<keyof ModuleField>([
  "key",
  "label",
  "kind",
  "required",
  "searchable",
  "options",
  "dictionaryTypeCode",
  "validation",
])
const moduleFieldOptionKeySet = new Set<keyof ModuleFieldOption>([
  "label",
  "value",
])
const moduleFieldValidationKeySet = new Set<keyof ModuleFieldValidation>([
  "maxLength",
  "maximum",
  "minLength",
  "minimum",
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

export interface ModuleFieldValidation {
  maxLength?: number
  maximum?: number
  minLength?: number
  minimum?: number
}

export interface ModuleField {
  key: string
  label: string
  kind: ModuleFieldKind
  required?: boolean
  searchable?: boolean
  options?: ModuleFieldOption[]
  dictionaryTypeCode?: string
  validation?: ModuleFieldValidation
}

export type ModuleFrontendWorkspaceDomain = "business" | "system"

export interface ModulePermissionActions {
  create?: boolean
  delete?: boolean
  export?: boolean
  list?: boolean
  update?: boolean
}

export interface ModuleFrontendSchema {
  moduleCode?: string
  permissionActions?: ModulePermissionActions
  permissionPrefix?: string
  routePath: string
  workspaceDomain: ModuleFrontendWorkspaceDomain
  workspaceKind?: string
}

export interface ModuleSchema {
  name: string
  label: string
  fields: ModuleField[]
  frontend?: ModuleFrontendSchema
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

  if ("frontend" in input && input.frontend !== undefined) {
    if (!isRecord(input.frontend)) {
      issues.push({
        path: "frontend",
        message: "Frontend metadata must be an object when provided.",
      })
    } else {
      const frontendKeySet = new Set<keyof ModuleFrontendSchema>([
        "moduleCode",
        "permissionActions",
        "permissionPrefix",
        "routePath",
        "workspaceDomain",
        "workspaceKind",
      ])

      pushUnknownKeyIssues(
        issues,
        input.frontend,
        frontendKeySet,
        "frontend",
        "Frontend metadata",
      )

      if (
        input.frontend.workspaceDomain !== "business" &&
        input.frontend.workspaceDomain !== "system"
      ) {
        issues.push({
          path: "frontend.workspaceDomain",
          message:
            'Frontend workspaceDomain must be either "business" or "system".',
        })
      }

      if (!isNonEmptyString(input.frontend.routePath)) {
        issues.push({
          path: "frontend.routePath",
          message: "Frontend routePath must be a non-empty string.",
        })
      } else if (!input.frontend.routePath.startsWith("/")) {
        issues.push({
          path: "frontend.routePath",
          message: 'Frontend routePath must start with "/".',
        })
      }

      if (
        "moduleCode" in input.frontend &&
        input.frontend.moduleCode !== undefined &&
        !isNonEmptyString(input.frontend.moduleCode)
      ) {
        issues.push({
          path: "frontend.moduleCode",
          message:
            "Frontend moduleCode must be a non-empty string when provided.",
        })
      }

      if (
        "permissionPrefix" in input.frontend &&
        input.frontend.permissionPrefix !== undefined &&
        !isNonEmptyString(input.frontend.permissionPrefix)
      ) {
        issues.push({
          path: "frontend.permissionPrefix",
          message:
            "Frontend permissionPrefix must be a non-empty string when provided.",
        })
      }

      if (
        "permissionActions" in input.frontend &&
        input.frontend.permissionActions !== undefined
      ) {
        if (!isRecord(input.frontend.permissionActions)) {
          issues.push({
            path: "frontend.permissionActions",
            message:
              "Frontend permissionActions must be an object when provided.",
          })
        } else {
          const validActionKeys = new Set([
            "list",
            "create",
            "update",
            "delete",
            "export",
          ])

          for (const key of Object.keys(input.frontend.permissionActions)) {
            if (!validActionKeys.has(key)) {
              issues.push({
                path: `frontend.permissionActions.${key}`,
                message: `Unknown permission action "${key}".`,
              })
            }
          }
        }
      }

      if (
        "workspaceKind" in input.frontend &&
        input.frontend.workspaceKind !== undefined &&
        !isNonEmptyString(input.frontend.workspaceKind)
      ) {
        issues.push({
          path: "frontend.workspaceKind",
          message:
            "Frontend workspaceKind must be a non-empty string when provided.",
        })
      }
    }
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

    if ("validation" in field && field.validation !== undefined) {
      if (!isRecord(field.validation)) {
        issues.push({
          path: `${fieldPath}.validation`,
          message: "Field validation must be an object when provided.",
        })
      } else {
        const minLength = field.validation.minLength
        const maxLength = field.validation.maxLength
        const minimum = field.validation.minimum
        const maximum = field.validation.maximum

        pushUnknownKeyIssues(
          issues,
          field.validation,
          moduleFieldValidationKeySet,
          `${fieldPath}.validation`,
          "Field validation",
        )

        if (
          "minLength" in field.validation &&
          minLength !== undefined &&
          (typeof minLength !== "number" ||
            !Number.isInteger(minLength) ||
            minLength < 0)
        ) {
          issues.push({
            path: `${fieldPath}.validation.minLength`,
            message:
              "Field validation minLength must be a non-negative integer when provided.",
          })
        }

        if (
          "maxLength" in field.validation &&
          maxLength !== undefined &&
          (typeof maxLength !== "number" ||
            !Number.isInteger(maxLength) ||
            maxLength < 0)
        ) {
          issues.push({
            path: `${fieldPath}.validation.maxLength`,
            message:
              "Field validation maxLength must be a non-negative integer when provided.",
          })
        }

        if (
          "minimum" in field.validation &&
          minimum !== undefined &&
          (typeof minimum !== "number" || !Number.isFinite(minimum))
        ) {
          issues.push({
            path: `${fieldPath}.validation.minimum`,
            message:
              "Field validation minimum must be a finite number when provided.",
          })
        }

        if (
          "maximum" in field.validation &&
          maximum !== undefined &&
          (typeof maximum !== "number" || !Number.isFinite(maximum))
        ) {
          issues.push({
            path: `${fieldPath}.validation.maximum`,
            message:
              "Field validation maximum must be a finite number when provided.",
          })
        }

        if (
          typeof minLength === "number" &&
          typeof maxLength === "number" &&
          minLength > maxLength
        ) {
          issues.push({
            path: `${fieldPath}.validation`,
            message: "Field validation minLength must not exceed maxLength.",
          })
        }

        if (
          typeof minimum === "number" &&
          typeof maximum === "number" &&
          minimum > maximum
        ) {
          issues.push({
            path: `${fieldPath}.validation`,
            message: "Field validation minimum must not exceed maximum.",
          })
        }
      }
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
  deriveBodySchema,
  type DeriveBodySchemaMode,
  type DeriveBodySchemaOptions,
} from "./elysia-bridge"

export {
  customerModuleSchema,
  type CustomerRecord,
  type CustomerStatus,
} from "./customer"
export { formatValidationIssues } from "./format-validation"
export { fileModuleSchema, type FileRecord } from "./file"
export {
  dictionaryItemModuleSchema,
  dictionaryModuleSchema,
  dictionaryTypeModuleSchema,
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
  postModuleSchema,
  type PostRecord,
  type PostStatus,
} from "./post"
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
  tenantModuleSchema,
  type TenantRecord,
  type TenantStatus,
} from "./tenant"
export {
  parseWorkflowConditionExpression,
  validateWorkflowDefinitionDraft,
  workflowModuleSchema,
  type WorkflowApprovalNode,
  type WorkflowConditionBranch,
  type WorkflowConditionExpressionLiteral,
  type WorkflowConditionExpressionOperator,
  type WorkflowConditionNode,
  type WorkflowDefinitionDraft,
  type WorkflowInstanceDetailRecord,
  type WorkflowDefinitionRecord,
  type WorkflowDefinitionStatus,
  type WorkflowEdge,
  type WorkflowInstanceRecord,
  type WorkflowInstanceStatus,
  type WorkflowNode,
  type WorkflowNodeType,
  type ParsedWorkflowConditionExpression,
  type WorkflowTaskRecord,
  type WorkflowTaskResult,
  type WorkflowTaskStatus,
} from "./workflow"
export {
  expandSimplifiedSchema,
  type SimplifiedField,
  type SimplifiedModuleSchema,
} from "./simplify"
export {
  userModuleSchema,
  type UserRecord,
  type UserStatus,
} from "./user"

export const registeredModuleSchemas = [
  customerModuleSchema,
  departmentModuleSchema,
  dictionaryModuleSchema,
  fileModuleSchema,
  menuModuleSchema,
  notificationModuleSchema,
  operationLogModuleSchema,
  postModuleSchema,
  productModuleSchema,
  roleModuleSchema,
  settingModuleSchema,
  tenantModuleSchema,
  userModuleSchema,
  workflowModuleSchema,
] as const satisfies readonly ModuleSchema[]

export const sampleModuleSchema: ModuleSchema = {
  name: "sample",
  label: "Sample",
  fields: [{ key: "id", label: "ID", kind: "id", required: true }],
}
