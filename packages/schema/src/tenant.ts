import type { ModuleSchema } from "./index"

export type TenantStatus = "active" | "suspended"

export interface TenantRecord {
  id: string
  code: string
  name: string
  status: TenantStatus
  createdAt: string
  updatedAt: string
}

export const tenantModuleSchema: ModuleSchema = {
  name: "tenant",
  label: "Tenant",
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
      key: "status",
      label: "Status",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "active", value: "active" },
        { label: "suspended", value: "suspended" },
      ],
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
