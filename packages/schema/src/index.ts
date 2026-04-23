export const moduleSchemaVersion = 1

export type ModuleFieldKind =
  | "id"
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "datetime"

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
