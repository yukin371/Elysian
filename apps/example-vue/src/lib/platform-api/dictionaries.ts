import { requestJson } from "./core"

export interface DictionaryTypeRecord {
  id: string
  code: string
  name: string
  description?: string
  status: "active" | "disabled"
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
  status: "active" | "disabled"
  createdAt: string
  updatedAt: string
}

export interface DictionaryTypeDetailRecord extends DictionaryTypeRecord {
  items: DictionaryItemRecord[]
}

export interface DictionaryTypesResponse {
  items: DictionaryTypeRecord[]
}

export interface DictionaryItemsResponse {
  items: DictionaryItemRecord[]
}

export interface CreateDictionaryTypeRequest {
  code: string
  name: string
  description?: string
  status?: DictionaryTypeRecord["status"]
}

export interface UpdateDictionaryTypeRequest {
  code?: string
  name?: string
  description?: string
  status?: DictionaryTypeRecord["status"]
}

export const fetchDictionaryTypes =
  async (): Promise<DictionaryTypesResponse> =>
    requestJson<DictionaryTypesResponse>("/system/dictionaries/types", {
      auth: true,
    })

export const fetchDictionaryTypeById = async (
  id: string,
): Promise<DictionaryTypeDetailRecord> =>
  requestJson<DictionaryTypeDetailRecord>(
    `/system/dictionaries/types/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  )

export const createDictionaryType = async (
  input: CreateDictionaryTypeRequest,
): Promise<DictionaryTypeDetailRecord> =>
  requestJson<DictionaryTypeDetailRecord>("/system/dictionaries/types", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateDictionaryType = async (
  id: string,
  input: UpdateDictionaryTypeRequest,
): Promise<DictionaryTypeDetailRecord> =>
  requestJson<DictionaryTypeDetailRecord>(
    `/system/dictionaries/types/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: input,
      auth: true,
    },
  )

export const fetchDictionaryItems = async (
  typeId?: string,
): Promise<DictionaryItemsResponse> =>
  requestJson<DictionaryItemsResponse>(
    typeId
      ? `/system/dictionaries/items?typeId=${encodeURIComponent(typeId)}`
      : "/system/dictionaries/items",
    {
      auth: true,
    },
  )
