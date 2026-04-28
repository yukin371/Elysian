import type { ModuleSchema } from "./index"

export type PostStatus = "active" | "disabled"

export interface PostRecord {
  id: string
  code: string
  name: string
  sort: number
  status: PostStatus
  remark?: string
  createdAt: string
  updatedAt: string
}

export const postModuleSchema: ModuleSchema = {
  name: "post",
  label: "Post",
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
    { key: "remark", label: "Remark", kind: "string" },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
    { key: "updatedAt", label: "Updated At", kind: "datetime", required: true },
  ],
}
