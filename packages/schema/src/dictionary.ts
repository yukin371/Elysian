import type { ModuleSchema } from "./index"

export type DictionaryStatus = "active" | "disabled"

export interface DictionaryTypeRecord {
  id: string
  code: string
  name: string
  description?: string
  status: DictionaryStatus
  createdAt: string
  updatedAt: string
}

export interface DictionaryItemRecord {
  id: string
  typeId: string
  value: string
  label: string
  sort: number
  isDefault: boolean
  status: DictionaryStatus
  createdAt: string
  updatedAt: string
}

export interface DictionaryTypeDetailRecord extends DictionaryTypeRecord {
  items: DictionaryItemRecord[]
}

export const dictionaryTypeModuleSchema: ModuleSchema = {
  name: "dictionary",
  label: "Dictionary",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "code",
      label: "Code",
      kind: "string",
      required: true,
      searchable: true,
      validation: { minLength: 1 },
    },
    {
      key: "name",
      label: "Name",
      kind: "string",
      required: true,
      searchable: true,
      validation: { minLength: 1 },
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
  frontend: {
    workspaceDomain: "system",
    routePath: "/system/dictionaries",
    permissionPrefix: "system:dictionary",
    permissionActions: { list: true, create: true, update: true },
  },
}

export const dictionaryItemModuleSchema: ModuleSchema = {
  name: "dictionary-item",
  label: "Dictionary Item",
  fields: [
    { key: "id", label: "ID", kind: "id", required: true },
    {
      key: "typeId",
      label: "Type ID",
      kind: "id",
      required: true,
    },
    {
      key: "value",
      label: "Value",
      kind: "string",
      required: true,
      searchable: true,
      validation: { minLength: 1 },
    },
    {
      key: "label",
      label: "Label",
      kind: "string",
      required: true,
      searchable: true,
      validation: { minLength: 1 },
    },
    { key: "sort", label: "Sort", kind: "number", required: true },
    { key: "isDefault", label: "Is Default", kind: "boolean", required: true },
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

export const dictionaryModuleSchema = dictionaryTypeModuleSchema
