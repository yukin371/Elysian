import type { ModuleSchema } from "./index"

export type RoleStatus = "active" | "disabled"

export interface RoleRecord {
  id: string
  code: string
  name: string
  description?: string
  status: RoleStatus
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface RoleDetailRecord extends RoleRecord {
  permissionCodes: string[]
  userIds: string[]
}

export const roleModuleSchema: ModuleSchema = {
  name: "role",
  label: "Role",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "code",
      label: "Code",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "name",
      label: "Name",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "description",
      label: "Description",
      kind: "string",
      searchable: true,
    },
    {
      key: "status",
      label: "Status",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "active", value: "active" },
        { label: "disabled", value: "disabled" },
      ],
    },
    {
      key: "isSystem",
      label: "System Role",
      kind: "boolean",
      required: true,
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
