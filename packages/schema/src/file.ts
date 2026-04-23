import type { ModuleSchema } from "./index"

export interface FileRecord {
  id: string
  originalName: string
  mimeType?: string
  size: number
  uploaderUserId?: string
  createdAt: string
}

export const fileModuleSchema: ModuleSchema = {
  name: "file",
  label: "File",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "originalName",
      label: "Original Name",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "mimeType",
      label: "MIME Type",
      kind: "string",
      searchable: true,
    },
    {
      key: "size",
      label: "Size",
      kind: "number",
      required: true,
    },
    {
      key: "uploaderUserId",
      label: "Uploader User ID",
      kind: "id",
    },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
  ],
}
