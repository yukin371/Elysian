import { requestJson } from "./core"
import type {
  CreateDictionaryTypeRequest,
  DictionaryItemsResponse,
  DictionaryTypeDetailRecord,
  DictionaryTypesResponse,
  UpdateDictionaryTypeRequest,
} from "../platform-api"

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
