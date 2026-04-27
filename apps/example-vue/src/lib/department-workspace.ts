import type { DepartmentRecord } from "./platform-api"

export interface DepartmentWorkspaceQuery {
  code?: string
  name?: string
  status?: DepartmentRecord["status"] | ""
}

export interface DepartmentParentOption {
  label: string
  value: string
}

export interface DepartmentTableItem
  extends Omit<
    DepartmentRecord,
    "parentId" | "status" | "createdAt" | "updatedAt"
  > {
  parentId: string
  status: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultDepartmentDraft = () => ({
  parentId: "",
  code: "",
  name: "",
  sort: 10,
  status: "active" as DepartmentRecord["status"],
})

export const normalizeDepartmentText = (value: unknown) =>
  String(value ?? "").trim()

export const normalizeOptionalDepartmentId = (value: unknown) => {
  const normalized = normalizeDepartmentText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeDepartmentSort = (value: unknown) => {
  const normalized =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)

  return Number.isFinite(normalized) ? normalized : 10
}

export const normalizeDepartmentStatus = (
  value: unknown,
): DepartmentRecord["status"] => (value === "disabled" ? "disabled" : "active")

export const filterDepartments = (
  departments: DepartmentRecord[],
  query: DepartmentWorkspaceQuery,
) => {
  const code = normalizeQueryValue(query.code)
  const name = normalizeQueryValue(query.name)
  const status = query.status ?? ""

  return departments.filter((department) => {
    if (code.length > 0 && !department.code.toLowerCase().includes(code)) {
      return false
    }

    if (name.length > 0 && !department.name.toLowerCase().includes(name)) {
      return false
    }

    if (status && department.status !== status) {
      return false
    }

    return true
  })
}

export const resolveDepartmentSelection = (
  departments: Array<Pick<DepartmentRecord, "id">>,
  selectedDepartmentId: string | null,
) => {
  if (departments.length === 0) {
    return null
  }

  if (
    selectedDepartmentId &&
    departments.some((department) => department.id === selectedDepartmentId)
  ) {
    return selectedDepartmentId
  }

  return departments[0]?.id ?? null
}

export const createDepartmentParentLookup = (departments: DepartmentRecord[]) =>
  new Map(departments.map((department) => [department.id, department]))

export const createDepartmentBlockedParentIds = (
  departments: DepartmentRecord[],
  selectedDepartmentId: string | null,
) => {
  if (!selectedDepartmentId) {
    return new Set<string>()
  }

  const blocked = new Set<string>([selectedDepartmentId])
  const queue = [selectedDepartmentId]

  while (queue.length > 0) {
    const currentId = queue.shift()

    if (!currentId) {
      continue
    }

    for (const department of departments) {
      if (department.parentId === currentId && !blocked.has(department.id)) {
        blocked.add(department.id)
        queue.push(department.id)
      }
    }
  }

  return blocked
}

export const createDepartmentParentOptions = (
  departments: DepartmentRecord[],
  selectedDepartmentId: string | null,
  rootLabel: string,
): DepartmentParentOption[] => {
  const blockedParentIds = createDepartmentBlockedParentIds(
    departments,
    selectedDepartmentId,
  )

  return [
    {
      label: rootLabel,
      value: "",
    },
    ...departments
      .filter((department) => !blockedParentIds.has(department.id))
      .map((department) => ({
        label: department.name,
        value: department.id,
      })),
  ]
}

export const createDepartmentTableItems = (
  departments: DepartmentRecord[],
  options: {
    parentLookup: Map<string, DepartmentRecord>
    rootLabel: string
    localizeStatus: (status: DepartmentRecord["status"]) => string
    formatDateTime: (value: string) => string
  },
): DepartmentTableItem[] =>
  departments.map((department) => ({
    ...department,
    parentId: department.parentId
      ? (options.parentLookup.get(department.parentId)?.name ??
        department.parentId)
      : options.rootLabel,
    status: options.localizeStatus(department.status),
    createdAt: options.formatDateTime(department.createdAt),
    updatedAt: options.formatDateTime(department.updatedAt),
  }))
