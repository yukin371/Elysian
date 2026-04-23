import type { ModuleSchema } from "./index"

export type OperationLogResult = "success" | "failure"

export interface OperationLogRecord {
  id: string
  category: string
  action: string
  actorUserId: string | null
  targetType: string | null
  targetId: string | null
  result: OperationLogResult
  requestId: string | null
  ip: string | null
  userAgent: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

export const operationLogModuleSchema: ModuleSchema = {
  name: "operation-log",
  label: "Operation Log",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "category",
      label: "Category",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "action",
      label: "Action",
      kind: "string",
      required: true,
      searchable: true,
    },
    { key: "actorUserId", label: "Actor User ID", kind: "id" },
    {
      key: "targetType",
      label: "Target Type",
      kind: "string",
      searchable: true,
    },
    {
      key: "targetId",
      label: "Target ID",
      kind: "string",
      searchable: true,
    },
    {
      key: "result",
      label: "Result",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "success", value: "success" },
        { label: "failure", value: "failure" },
      ],
    },
    { key: "requestId", label: "Request ID", kind: "string", searchable: true },
    { key: "ip", label: "IP", kind: "string", searchable: true },
    { key: "userAgent", label: "User Agent", kind: "string", searchable: true },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
  ],
}
