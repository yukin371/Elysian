import type { ModuleSchema } from "./index"

export type SettingStatus = "active" | "disabled"

export interface SettingRecord {
  id: string
  key: string
  value: string
  description?: string
  status: SettingStatus
  createdAt: string
  updatedAt: string
}

export const settingModuleSchema: ModuleSchema = {
  name: "setting",
  label: "Setting",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "key",
      label: "Key",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "value",
      label: "Value",
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
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
