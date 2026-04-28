import { requestJson } from "./core"
import type {
  CreateSettingRequest,
  SettingRecord,
  SettingsResponse,
  UpdateSettingRequest,
} from "../platform-api"

export const fetchSettings = async (): Promise<SettingsResponse> =>
  requestJson<SettingsResponse>("/system/settings", {
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
