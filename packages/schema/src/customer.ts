import type { ModuleSchema } from "./index"

export type CustomerStatus = "active" | "inactive"

export interface CustomerRecord {
  id: string
  name: string
  status: CustomerStatus
  createdAt: string
  updatedAt: string
}

export const customerModuleSchema: ModuleSchema = {
  name: "customer",
  label: "Customer",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
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
      dictionaryTypeCode: "customer_status",
      options: [
        { label: "active", value: "active" },
        { label: "inactive", value: "inactive" },
      ],
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
