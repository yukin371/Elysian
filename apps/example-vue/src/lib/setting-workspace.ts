import type { SettingRecord } from "./platform-api"

export interface SettingWorkspaceQuery {
  key?: string
  value?: string
  description?: string
  status?: SettingRecord["status"] | ""
}

export interface SettingTableItem
  extends Omit<SettingRecord, "status" | "createdAt" | "updatedAt"> {
  status: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultSettingDraft = () => ({
  key: "",
  value: "",
  description: "",
  status: "active" as SettingRecord["status"],
})

export const normalizeSettingText = (value: unknown) =>
  String(value ?? "").trim()

export const normalizeOptionalSettingText = (value: unknown) => {
  const normalized = normalizeSettingText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeSettingStatus = (
  value: unknown,
): SettingRecord["status"] => (value === "disabled" ? "disabled" : "active")

export const filterSettings = (
  settings: SettingRecord[],
  query: SettingWorkspaceQuery,
) => {
  const key = normalizeQueryValue(query.key)
  const value = normalizeQueryValue(query.value)
  const description = normalizeQueryValue(query.description)
  const status = query.status ?? ""

  return settings.filter((setting) => {
    if (key.length > 0 && !setting.key.toLowerCase().includes(key)) {
      return false
    }

    if (value.length > 0 && !setting.value.toLowerCase().includes(value)) {
      return false
    }

    if (
      description.length > 0 &&
      !(setting.description ?? "").toLowerCase().includes(description)
    ) {
      return false
    }

    if (status && setting.status !== status) {
      return false
    }

    return true
  })
}

export const resolveSettingSelection = (
  settings: Array<Pick<SettingRecord, "id">>,
  selectedSettingId: string | null,
) => {
  if (settings.length === 0) {
    return null
  }

  if (
    selectedSettingId &&
    settings.some((setting) => setting.id === selectedSettingId)
  ) {
    return selectedSettingId
  }

  return settings[0]?.id ?? null
}

export const createSettingTableItems = (
  settings: SettingRecord[],
  options: {
    localizeStatus: (status: SettingRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): SettingTableItem[] =>
  settings.map((setting) => ({
    ...setting,
    status: options.localizeStatus(setting.status),
    createdAt: options.formatDateTime(setting.createdAt),
    updatedAt: options.formatDateTime(setting.updatedAt),
  }))
