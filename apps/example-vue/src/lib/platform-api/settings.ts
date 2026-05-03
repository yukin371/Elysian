import { requestBlob, requestJson } from "./core"
import type {
  OpenApiCreateSettingInput,
  OpenApiSettingRecord,
  OpenApiSettingsResponse,
  OpenApiUpdateSettingInput,
} from "./generated-types"

export type SettingRecord = OpenApiSettingRecord
export type SettingsResponse = OpenApiSettingsResponse

export interface SettingListQuery {
  page?: number
  pageSize?: number
}

export type CreateSettingRequest = OpenApiCreateSettingInput
export type UpdateSettingRequest = OpenApiUpdateSettingInput

export const fetchSettings = async (
  query: SettingListQuery = {},
): Promise<SettingsResponse> => {
  const search = new URLSearchParams()

  if (typeof query.page === "number" && Number.isFinite(query.page)) {
    search.set("page", String(Math.trunc(query.page)))
  }

  if (typeof query.pageSize === "number" && Number.isFinite(query.pageSize)) {
    search.set("pageSize", String(Math.trunc(query.pageSize)))
  }

  return requestJson<SettingsResponse>(
    `/system/settings${search.size > 0 ? `?${search.toString()}` : ""}`,
    {
      auth: true,
    },
  )
}

export const exportSettingsCsv = async (): Promise<Blob> =>
  requestBlob("/system/settings/export", {
    auth: true,
  })

export const fetchSettingById = async (id: string): Promise<SettingRecord> =>
  requestJson<SettingRecord>(`/system/settings/${encodeURIComponent(id)}`, {
    auth: true,
  })

export const createSetting = async (
  input: CreateSettingRequest,
): Promise<SettingRecord> =>
  requestJson<SettingRecord>("/system/settings", {
    method: "POST",
    body: input,
    auth: true,
  })

export const updateSetting = async (
  id: string,
  input: UpdateSettingRequest,
): Promise<SettingRecord> =>
  requestJson<SettingRecord>(`/system/settings/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  })
