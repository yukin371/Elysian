import type { UserRecord } from "./platform-api"

export interface UserWorkspaceQuery {
  username?: string
  displayName?: string
  email?: string
  phone?: string
  status?: UserRecord["status"] | ""
}

export interface UserTableItem
  extends Omit<
    UserRecord,
    "status" | "isSuperAdmin" | "lastLoginAt" | "createdAt" | "updatedAt"
  > {
  status: string
  isSuperAdmin: string
  lastLoginAt: string
  createdAt: string
  updatedAt: string
}

const normalizeQueryValue = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ""

export const createDefaultUserDraft = () => ({
  username: "",
  displayName: "",
  email: "",
  phone: "",
  status: "active" as UserRecord["status"],
  isSuperAdmin: false,
})

export const normalizeUserText = (value: unknown) => String(value ?? "").trim()

export const normalizeOptionalUserText = (value: unknown) => {
  const normalized = normalizeUserText(value)
  return normalized.length > 0 ? normalized : undefined
}

export const normalizeUserStatus = (value: unknown): UserRecord["status"] =>
  value === "disabled" ? "disabled" : "active"

export const normalizeUserBoolean = (value: unknown) => value === true

export const filterUsers = (users: UserRecord[], query: UserWorkspaceQuery) => {
  const username = normalizeQueryValue(query.username)
  const displayName = normalizeQueryValue(query.displayName)
  const email = normalizeQueryValue(query.email)
  const phone = normalizeQueryValue(query.phone)
  const status = query.status ?? ""

  return users.filter((user) => {
    if (
      username.length > 0 &&
      !user.username.toLowerCase().includes(username)
    ) {
      return false
    }

    if (
      displayName.length > 0 &&
      !user.displayName.toLowerCase().includes(displayName)
    ) {
      return false
    }

    if (email.length > 0 && !(user.email ?? "").toLowerCase().includes(email)) {
      return false
    }

    if (phone.length > 0 && !(user.phone ?? "").toLowerCase().includes(phone)) {
      return false
    }

    if (status && user.status !== status) {
      return false
    }

    return true
  })
}

export const resolveUserSelection = (
  users: Array<Pick<UserRecord, "id">>,
  selectedUserId: string | null,
) => {
  if (users.length === 0) {
    return null
  }

  if (selectedUserId && users.some((user) => user.id === selectedUserId)) {
    return selectedUserId
  }

  return users[0]?.id ?? null
}

export const createUserTableItems = (
  users: UserRecord[],
  options: {
    localizeStatus: (status: UserRecord["status"]) => string
    localizeBoolean: (value: boolean) => string
    lastLoginEmptyLabel: string
    formatDateTime: (value: string) => string
  },
): UserTableItem[] =>
  users.map((user) => ({
    ...user,
    status: options.localizeStatus(user.status),
    isSuperAdmin: options.localizeBoolean(user.isSuperAdmin),
    lastLoginAt: user.lastLoginAt
      ? options.formatDateTime(user.lastLoginAt)
      : options.lastLoginEmptyLabel,
    createdAt: options.formatDateTime(user.createdAt),
    updatedAt: options.formatDateTime(user.updatedAt),
  }))
