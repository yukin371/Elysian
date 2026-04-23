import type { ModuleSchema } from "./index"

export type DepartmentStatus = "active" | "disabled"

export interface DepartmentRecord {
  id: string
  parentId: string | null
  code: string
  name: string
  sort: number
  status: DepartmentStatus
  createdAt: string
  updatedAt: string
}

export interface DepartmentDetailRecord extends DepartmentRecord {
  userIds: string[]
}

export const departmentModuleSchema: ModuleSchema = {
  name: "department",
  label: "Department",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    { key: "parentId", label: "Parent ID", kind: "id" },
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
    { key: "sort", label: "Sort", kind: "number", required: true },
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
