import type { ModuleSchema } from "./index"

export type UserStatus = "active" | "disabled"

export interface UserRecord {
  id: string
  username: string
  displayName: string
  email?: string
  phone?: string
  status: UserStatus
  isSuperAdmin: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export const userModuleSchema: ModuleSchema = {
  name: "user",
  label: "User",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "username",
      label: "Username",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "displayName",
      label: "Display Name",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "email",
      label: "Email",
      kind: "string",
      searchable: true,
    },
    {
      key: "phone",
      label: "Phone",
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
      key: "isSuperAdmin",
      label: "Super Admin",
      kind: "boolean",
      required: true,
    },
    {
      key: "lastLoginAt",
      label: "Last Login At",
      kind: "datetime",
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
