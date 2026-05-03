import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateDictionaryTypeInput,
  OpenApiDictionaryItemRecord,
  OpenApiDictionaryItemsResponse,
  OpenApiDictionaryTypeDetailRecord,
  OpenApiDictionaryTypeRecord,
  OpenApiDictionaryTypesResponse,
  OpenApiUpdateDictionaryTypeInput,
} from "./generated-types"

export type DictionaryItemRecord = OpenApiDictionaryItemRecord
export type DictionaryTypeDetailRecord = OpenApiDictionaryTypeDetailRecord
export type DictionaryTypeRecord = OpenApiDictionaryTypeRecord
export type DictionaryTypesResponse = OpenApiDictionaryTypesResponse
export type DictionaryItemsResponse = OpenApiDictionaryItemsResponse
export type CreateDictionaryTypeRequest = OpenApiCreateDictionaryTypeInput
export type UpdateDictionaryTypeRequest = OpenApiUpdateDictionaryTypeInput

export const fetchDictionaryTypes =
  async (): Promise<DictionaryTypesResponse> =>
    requestJson<DictionaryTypesResponse>("/system/dictionaries/types", {
      auth: true,
    })

export const exportDictionaryTypesCsv = async (): Promise<Blob> =>
  requestBlob("/system/dictionaries/types/export", {
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

export const exportDictionaryItemsCsv = async (
  typeId?: string,
): Promise<Blob> =>
  requestBlob(
    typeId
      ? `/system/dictionaries/items/export?typeId=${encodeURIComponent(typeId)}`
      : "/system/dictionaries/items/export",
    {
      auth: true,
    },
  )
