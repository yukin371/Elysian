import type { ModuleSchema } from "./index"

export type NotificationLevel = "info" | "success" | "warning" | "error"
export type NotificationStatus = "unread" | "read"

export interface NotificationRecord {
  id: string
  recipientUserId: string
  title: string
  content: string
  level: NotificationLevel
  status: NotificationStatus
  createdByUserId?: string
  readAt?: string
  createdAt: string
}

export const notificationModuleSchema: ModuleSchema = {
  name: "notification",
  label: "Notification",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "recipientUserId",
      label: "Recipient User ID",
      kind: "id",
      required: true,
    },
    {
      key: "title",
      label: "Title",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "content",
      label: "Content",
      kind: "string",
      required: true,
      searchable: true,
    },
    {
      key: "level",
      label: "Level",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "info", value: "info" },
        { label: "success", value: "success" },
        { label: "warning", value: "warning" },
        { label: "error", value: "error" },
      ],
    },
    {
      key: "status",
      label: "Status",
      kind: "enum",
      required: true,
      searchable: true,
      options: [
        { label: "unread", value: "unread" },
        { label: "read", value: "read" },
      ],
    },
    {
      key: "createdByUserId",
      label: "Created By User ID",
      kind: "id",
    },
    { key: "readAt", label: "Read At", kind: "datetime" },
    { key: "createdAt", label: "Created At", kind: "datetime", required: true },
  ],
}
