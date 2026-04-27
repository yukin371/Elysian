import type { DictionaryTypeRecord } from "./platform-api"

export interface DictionaryWorkspaceQuery {
  code?: string
  name?: string
  description?: string
  status?: DictionaryTypeRecord["status"] | ""
}

export interface DictionaryTypeTableItem
  extends Omit<DictionaryTypeRecord, "status" | "createdAt" | "updatedAt"> {
  status: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultDictionaryTypeDraft = () => ({
  code: "",
  name: "",
  description: "",
  status: "active" as DictionaryTypeRecord["status"],
})

export const normalizeDictionaryText = (value: unknown) =>
  String(value ?? "").trim()

export const normalizeOptionalDictionaryText = (value: unknown) => {
  const normalized = normalizeDictionaryText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeDictionaryStatus = (
  value: unknown,
): DictionaryTypeRecord["status"] =>
  value === "disabled" ? "disabled" : "active"

export const filterDictionaryTypes = (
  dictionaryTypes: DictionaryTypeRecord[],
  query: DictionaryWorkspaceQuery,
) => {
  const code = normalizeQueryValue(query.code)
  const name = normalizeQueryValue(query.name)
  const description = normalizeQueryValue(query.description)
  const status = query.status ?? ""

  return dictionaryTypes.filter((type) => {
    if (code.length > 0 && !type.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !type.name.toLowerCase().includes(name)) {
      return false
    }

    if (
      description.length > 0 &&
      !(type.description ?? "").toLowerCase().includes(description)
    ) {
      return false
    }

    if (status && type.status !== status) {
      return false
    }

    return true
  })
}

export const resolveDictionaryTypeSelection = (
  dictionaryTypes: Array<Pick<DictionaryTypeRecord, "id">>,
  selectedDictionaryTypeId: string | null,
) => {
  if (dictionaryTypes.length === 0) {
    return null
  }

  if (
    selectedDictionaryTypeId &&
    dictionaryTypes.some((type) => type.id === selectedDictionaryTypeId)
  ) {
    return selectedDictionaryTypeId
  }

  return dictionaryTypes[0]?.id ?? null
}

export const createDictionaryTypeTableItems = (
  dictionaryTypes: DictionaryTypeRecord[],
  options: {
    localizeStatus: (status: DictionaryTypeRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): DictionaryTypeTableItem[] =>
  dictionaryTypes.map((type) => ({
    ...type,
    status: options.localizeStatus(type.status),
    createdAt: options.formatDateTime(type.createdAt),
    updatedAt: options.formatDateTime(type.updatedAt),
  }))
