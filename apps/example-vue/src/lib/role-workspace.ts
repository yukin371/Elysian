import type { RoleRecord } from "./platform-api"

export interface RoleWorkspaceQuery {
  code?: string
  name?: string
  description?: string
  status?: RoleRecord["status"] | ""
}

export interface RoleTableItem
  extends Omit<
    RoleRecord,
    "status" | "isSystem" | "dataScope" | "createdAt" | "updatedAt"
  > {
  status: string
  isSystem: string
  dataScope: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultRoleDraft = () => ({
  code: "",
  name: "",
  description: "",
  status: "active" as RoleRecord["status"],
  isSystem: false,
  dataScope: 1 as RoleRecord["dataScope"],
})

export const normalizeRoleText = (value: unknown) => String(value ?? "").trim()

export const normalizeOptionalRoleText = (value: unknown) => {
  const normalized = normalizeRoleText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeRoleStatus = (value: unknown): RoleRecord["status"] =>
  value === "disabled" ? "disabled" : "active"

export const normalizeRoleBoolean = (value: unknown) => value === true

export const normalizeRoleDataScope = (
  value: unknown,
): RoleRecord["dataScope"] => {
  const normalized = Number(value)

  if (
    normalized === 2 ||
    normalized === 3 ||
    normalized === 4 ||
    normalized === 5
  ) {
    return normalized
  }

  return 1
}

export const filterRoles = (roles: RoleRecord[], query: RoleWorkspaceQuery) => {
  const code = normalizeQueryValue(query.code)
  const name = normalizeQueryValue(query.name)
  const description = normalizeQueryValue(query.description)
  const status = query.status ?? ""

  return roles.filter((role) => {
    if (code.length > 0 && !role.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !role.name.toLowerCase().includes(name)) {
      return false
    }

    if (
      description.length > 0 &&
      !(role.description ?? "").toLowerCase().includes(description)
    ) {
      return false
    }

    if (status && role.status !== status) {
      return false
    }

    return true
  })
}

export const resolveRoleSelection = (
  roles: Array<Pick<RoleRecord, "id">>,
  selectedRoleId: string | null,
) => {
  if (roles.length === 0) {
    return null
  }

  if (selectedRoleId && roles.some((role) => role.id === selectedRoleId)) {
    return selectedRoleId
  }

  return roles[0]?.id ?? null
}

export const createRoleTableItems = (
  roles: RoleRecord[],
  options: {
    localizeStatus: (status: RoleRecord["status"]) => string
    localizeBoolean: (value: boolean) => string
    localizeDataScope: (value: RoleRecord["dataScope"]) => string
    formatDateTime: (value: string) => string
  },
): RoleTableItem[] =>
  roles.map((role) => ({
    ...role,
    status: options.localizeStatus(role.status),
    isSystem: options.localizeBoolean(role.isSystem),
    dataScope: options.localizeDataScope(role.dataScope),
    createdAt: options.formatDateTime(role.createdAt),
    updatedAt: options.formatDateTime(role.updatedAt),
  }))
