import type { ModuleSchema } from "./index"

export type MenuStatus = "active" | "disabled"
export type MenuType = "directory" | "menu" | "button"

export interface MenuRecord {
  id: string
  parentId: string | null
  type: MenuType
  code: string
  name: string
  path: string | null
  component: string | null
  icon: string | null
  sort: number
  isVisible: boolean
  status: MenuStatus
  permissionCode: string | null
  createdAt: string
  updatedAt: string
}

export interface MenuDetailRecord extends MenuRecord {
  roleIds: string[]
}

export const menuModuleSchema: ModuleSchema = {
  name: "menu",
  label: "Menu",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    { key: "parentId", label: "Parent ID", kind: "id" },
    {
      key: "type",
      label: "Type",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "directory", value: "directory" },
        { label: "menu", value: "menu" },
        { label: "button", value: "button" },
      ],
    },
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
    { key: "path", label: "Path", kind: "string", searchable: true },
    { key: "component", label: "Component", kind: "string", searchable: true },
    { key: "icon", label: "Icon", kind: "string", searchable: true },
    { key: "sort", label: "Sort", kind: "number", required: true },
    { key: "isVisible", label: "Visible", kind: "boolean", required: true },
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
      key: "permissionCode",
      label: "Permission Code",
      kind: "string",
      searchable: true,
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
